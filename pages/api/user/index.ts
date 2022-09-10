import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, EmptyPayload, StatusMessageType } from '../../../types/apiResponse';
import { Nullable } from '../../../types/utils';
import { getUserFromJwt, UserDetailsFromRequest, withAuthUser } from '../../../utils/auth/jwtHelpers';
import { createJsonResponse, HttpMethod, HttpStatus, rejectHttpMethod } from '../../../utils/http/httpHelpers';
import { withPrismaErrorHandling } from '../../../utils/prisma/prismaHelpers';

const { ERROR, INFORMATION, SUCCESS } = StatusMessageType;
const prisma = new PrismaClient();

/** Limited set of data representing user and the list of user application IDs. Only for use in this endpoint. */
interface UserData {
  uid: string;
  applications: { id: number }[];
}

enum MessageType {
  // POST link accounts.
  NEW_USER_UNVERIFIED,
  OLD_USER_DELETED,
  NEW_USER_HAS_DATA,
  NEW_USER_LINKED,
  INVALID_OLD_TOKEN,
  OLD_USER_VERIFIED,
  // POST account creation only.
  USER_ALREADY_EXISTS,
  USER_CREATED,
  // DELETE accounts
  USER_NOT_FOUND,
  USER_DELETED,
}

const messages = Object.freeze({
  // POST messages (without oldToken)
  [MessageType.USER_ALREADY_EXISTS]: { type: ERROR, message: 'User with UID already exists.' },
  [MessageType.USER_CREATED]: { type: SUCCESS, message: 'New user with UID added.' },
  // POST messages (with oldToken)
  [MessageType.NEW_USER_UNVERIFIED]: { type: ERROR, message: 'An unverified account cannot be the target of link.' },
  [MessageType.INVALID_OLD_TOKEN]: { type: ERROR, message: 'Could not validate and decode "oldToken".' },
  [MessageType.OLD_USER_VERIFIED]: { type: ERROR, message: 'Old UID is already linked.' },
  [MessageType.NEW_USER_HAS_DATA]: { type: ERROR, message: 'New UID already has user data and cannot be linked.' },
  [MessageType.OLD_USER_DELETED]: { type: SUCCESS, message: 'Old UID not found. New UID has been linked.' },
  [MessageType.NEW_USER_LINKED]: { type: SUCCESS, message: 'Old UID has been replaced with new UID.' },
  // DELETE messages.
  [MessageType.USER_NOT_FOUND]: { type: ERROR, message: 'Could not find UID to delete.' },
  [MessageType.USER_DELETED]: { type: SUCCESS, message: 'Deleted UID and their data.' },
});

async function handler(currentUid: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<EmptyPayload>>) {
  switch (req.method) {
    case HttpMethod.POST:
      const { oldToken } = req.body;
      const oldUserToken = oldToken && typeof oldToken == 'string' ? oldToken.trim() : oldToken;
      return oldUserToken /* if null, undefined, empty or contains only whitespace */
        ? handlePostWithOldToken(currentUid, oldUserToken, req, res)
        : handlePostWithoutOldToken(currentUid, req, res);
    case HttpMethod.DELETE:
      return handleDelete(currentUid, req, res);
    default:
      return rejectHttpMethod(res, req.method);
  }
}

async function handlePostWithoutOldToken(
  currentUid: string,
  _req: NextApiRequest,
  res: NextApiResponse<ApiResponse<EmptyPayload>>,
) {
  const isExisting = (await getUserIfExists(currentUid)) !== null;
  if (isExisting) {
    return res.status(HttpStatus.CONFLICT).json(createJsonResponse({}, messages[MessageType.USER_ALREADY_EXISTS]));
  }

  await prisma.user.create({ data: { uid: currentUid } });
  return res.status(HttpStatus.OK).json(createJsonResponse({}, messages[MessageType.USER_CREATED]));
}

async function handlePostWithOldToken(
  currentUid: string,
  oldUserToken: string,
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<EmptyPayload>>,
) {
  const currentIsAnonymous = (await getUserFromJwt(req.headers.authorization as string)).isAnonymous;
  if (currentIsAnonymous) {
    return res.status(HttpStatus.UNAUTHORIZED).json(createJsonResponse({}, messages[MessageType.NEW_USER_UNVERIFIED]));
  }

  let oldUserDetails: UserDetailsFromRequest;
  try {
    oldUserDetails = await getUserFromJwt(oldUserToken);
  } catch (error) {
    return res.status(HttpStatus.UNAUTHORIZED).json(createJsonResponse({}, messages[MessageType.INVALID_OLD_TOKEN]));
  }

  const oldUid = oldUserDetails.uid;
  if (!oldUserDetails.isAnonymous) {
    return res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[MessageType.OLD_USER_VERIFIED]));
  }

  const result = await linkAccount(oldUid, currentUid);

  switch (result) {
    case MessageType.NEW_USER_HAS_DATA:
      return res.status(HttpStatus.CONFLICT).json(createJsonResponse({}, messages[MessageType.NEW_USER_HAS_DATA]));

    case MessageType.OLD_USER_DELETED:
    // fallthrough
    case MessageType.NEW_USER_LINKED:
      return res.status(HttpStatus.OK).json(createJsonResponse({}, messages[result]));

    default:
      // This is unreachable.
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
  }
}

async function handleDelete(uid: string, _req: NextApiRequest, res: NextApiResponse<ApiResponse<EmptyPayload>>) {
  // UID is a primary key, so the count will either be 0 (UID does not exist in database) or 1 (successful delete).
  const user = await getUserIfExists(uid);
  if (!user) {
    return res.status(HttpStatus.NOT_FOUND).json(createJsonResponse({}, messages[MessageType.USER_NOT_FOUND]));
  }

  await prisma.application.deleteMany({ where: { userId: uid } });
  await prisma.user.delete({ where: { uid } });

  return res.status(HttpStatus.OK).json(createJsonResponse({}, messages[MessageType.USER_DELETED]));
}

async function linkAccount(oldUid: string, newUid: string): Promise<MessageType> {
  const newUser = await getUserIfExists(newUid);
  const oldUser = await getUserIfExists(oldUid);

  // If old user has already been removed from the database. This can happen if the API was called twice or if the new user
  // creation process failed and the API was retried.
  if (!oldUser) {
    if (!newUser) {
      await prisma.user.create({ data: { uid: newUid } });
    }

    return MessageType.OLD_USER_DELETED;
  }

  // Handle situation where new user exists already with data.
  if (newUser && hasUserData(newUser)) {
    return MessageType.NEW_USER_HAS_DATA;
  }

  // New user exists but has no data (linking should continue as if new user does not exist).
  if (newUser) {
    await prisma.user.delete({ where: { uid: newUid } });
  }

  // Update UID to new (foreign key references to UID will cascade on update)
  await prisma.user.update({
    where: { uid: oldUid },
    data: { uid: newUid },
  });

  return MessageType.NEW_USER_LINKED;
}

// Returns user if present in the database with applications if exists.
async function getUserIfExists(uid: string): Promise<Nullable<UserData>> {
  const user = await prisma.user.findUnique({
    where: { uid: uid },
    select: { uid: true, applications: { select: { id: true } } },
  });
  return user;
}

// Returns true iff there is at least one application for this User.
function hasUserData(user: UserData): boolean {
  return user.applications.length > 0;
}

export default withPrismaErrorHandling(withAuthUser(handler));
