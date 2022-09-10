import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, EmptyPayload, StatusMessageType } from '../../../types/apiResponse';
import { AccountPostData } from '../../../types/user';
import { Nullable } from '../../../types/utils';
import { getUserFromJwt, UserDetailsFromRequest, withAuthUser } from '../../../utils/auth/jwtHelpers';
import { createJsonResponse, HttpMethod, HttpStatus, rejectHttpMethod } from '../../../utils/http/httpHelpers';
import { withPrismaErrorHandling } from '../../../utils/prisma/prismaHelpers';

const prisma = new PrismaClient();

/** Limited set of data representing user and the list of user application IDs. Only for use in this endpoint. */
interface UserData {
  uid: string;
}

enum MessageType {
  // POST link accounts.
  NEW_USER_LINKED,
  NEW_USER_UNVERIFIED,
  OLD_USER_NOT_FOUND,
  NEW_USER_EXISTS,
  INVALID_OLD_TOKEN,
  OLD_USER_VERIFIED,
  // POST account creation only.
  USER_CREATED,
  USER_ALREADY_EXISTS,
  // DELETE accounts
  USER_DELETED,
  DELETE_TARGET_NOT_FOUND,
}

const messages = Object.freeze({
  // POST messages (without oldToken)
  [MessageType.USER_CREATED]: { type: StatusMessageType.SUCCESS, message: 'New user added.' },
  [MessageType.USER_ALREADY_EXISTS]: { type: StatusMessageType.ERROR, message: 'User already exists.' },
  // POST messages (with oldToken)
  [MessageType.NEW_USER_LINKED]: { type: StatusMessageType.SUCCESS, message: 'Account was linked successfully.' },
  [MessageType.NEW_USER_UNVERIFIED]: { type: StatusMessageType.ERROR, message: 'Account could not be linked.' },
  [MessageType.INVALID_OLD_TOKEN]: {
    type: StatusMessageType.ERROR,
    message: 'There was an error while retrieving user info.',
  },
  [MessageType.OLD_USER_VERIFIED]: { type: StatusMessageType.ERROR, message: 'Account is already linked.' },
  [MessageType.NEW_USER_EXISTS]: {
    type: StatusMessageType.ERROR,
    message: 'There is already an account associated with this Github profile.',
  },
  [MessageType.OLD_USER_NOT_FOUND]: {
    type: StatusMessageType.ERROR,
    message: 'There was an error while retrieving user info.',
  },
  // DELETE messages.
  [MessageType.USER_DELETED]: { type: StatusMessageType.SUCCESS, message: 'Deleted user and their data.' },
  [MessageType.DELETE_TARGET_NOT_FOUND]: { type: StatusMessageType.ERROR, message: 'Could not find user to delete.' },
});

async function handler(currentUid: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<UserData>>) {
  switch (req.method) {
    case HttpMethod.POST:
      return handlePost(currentUid, req, res);
    case HttpMethod.DELETE:
      return handleDelete(currentUid, res);
    default:
      return rejectHttpMethod(res, req.method);
  }
}

function handlePost(currentUid: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<UserData>>) {
  const { oldToken } = req.body as AccountPostData;
  const oldUserToken = oldToken && typeof oldToken == 'string' ? oldToken.trim() : oldToken;
  return oldUserToken /* if null, undefined, empty or contains only whitespace */
    ? handlePostWithOldToken(currentUid, oldUserToken, req, res)
    : handlePostWithoutOldToken(currentUid, res);
}

async function handlePostWithoutOldToken(currentUid: string, res: NextApiResponse<ApiResponse<UserData>>) {
  const isExisting = (await getUserIfExists(currentUid)) !== null;
  if (isExisting) {
    return res.status(HttpStatus.CONFLICT).json(createJsonResponse({}, messages[MessageType.USER_ALREADY_EXISTS]));
  }

  await prisma.user.create({ data: { uid: currentUid } });
  return res
    .status(HttpStatus.CREATED)
    .json(createJsonResponse({ uid: currentUid }, messages[MessageType.USER_CREATED]));
}

async function handlePostWithOldToken(
  currentUid: string,
  oldUserToken: string,
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<UserData>>,
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
    case MessageType.NEW_USER_EXISTS:
      return res.status(HttpStatus.CONFLICT).json(createJsonResponse({}, messages[MessageType.NEW_USER_EXISTS]));

    case MessageType.OLD_USER_NOT_FOUND:
      return res.status(HttpStatus.NOT_FOUND).json(createJsonResponse({}, messages[MessageType.OLD_USER_NOT_FOUND]));

    case MessageType.NEW_USER_LINKED:
      return res.status(HttpStatus.OK).json(createJsonResponse({ uid: currentUid }, messages[result]));
  }
}

async function handleDelete(uid: string, res: NextApiResponse<ApiResponse<EmptyPayload>>) {
  // UID is a primary key, so the count will either be 0 (UID does not exist in database) or 1 (successful delete).
  const user = await getUserIfExists(uid);
  if (!user) {
    return res.status(HttpStatus.NOT_FOUND).json(createJsonResponse({}, messages[MessageType.DELETE_TARGET_NOT_FOUND]));
  }

  await prisma.application.deleteMany({ where: { userId: uid } });
  await prisma.user.delete({ where: { uid } });

  return res.status(HttpStatus.OK).json(createJsonResponse({}, messages[MessageType.USER_DELETED]));
}

async function linkAccount(
  oldUid: string,
  newUid: string,
): Promise<MessageType.NEW_USER_EXISTS | MessageType.OLD_USER_NOT_FOUND | MessageType.NEW_USER_LINKED> {
  const newUser = await getUserIfExists(newUid);
  const oldUser = await getUserIfExists(oldUid);

  if (!oldUser) {
    return MessageType.OLD_USER_NOT_FOUND;
  }

  // Handle situation where new user exists already with data.
  if (newUser) {
    return MessageType.NEW_USER_EXISTS;
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
  });
  return user;
}

export default withPrismaErrorHandling(withAuthUser(handler));
