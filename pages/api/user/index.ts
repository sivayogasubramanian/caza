import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, EmptyPayload, StatusMessageType } from '../../../types/apiResponse';
import { Nullable } from '../../../types/utils';
import { withVerifiedUser, getUserFromJwt, UserDetailsFromRequest } from '../../../utils/auth/jwtHelpers';
import { createJsonResponse, HttpMethod, HttpStatus, rejectHttpMethod } from '../../../utils/http/httpHelpers';
import { withPrismaErrorHandling } from '../../../utils/prisma/prismaHelpers';

/** Limited set of data representing user and the list of user application IDs. Only for use in this endpoint. */
interface UserData {
  uid: string;
  applications: { id: number }[];
}

enum LinkAccountResult {
  OLD_USER_DELETED,
  NEW_USER_HAS_DATA,
  NEW_USER_LINKED,
}

const { ERROR, INFORMATION, SUCCESS } = StatusMessageType;
const prisma = new PrismaClient();

async function handler(currentUid: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<EmptyPayload>>) {
  switch (req.method) {
    case HttpMethod.POST:
      return handlePost(currentUid, req, res);
    case HttpMethod.DELETE:
      return handleDelete(currentUid, req, res);
    default:
      return rejectHttpMethod(res, req.method);
  }
}

async function handlePost(currentUid: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<EmptyPayload>>) {
  const oldUserToken = req.body?.old_token;

  // If old_token is not supplied.
  if (!oldUserToken) {
    const isExisting = (await getUserIfExists(currentUid)) !== null;
    if (isExisting) {
      return res
        .status(HttpStatus.CONFLICT)
        .json(createJsonResponse({}, { type: ERROR, message: `UID ${currentUid} already exists` }));
    }

    await prisma.user.create({ data: { uid: currentUid } });
    return res
      .status(HttpStatus.OK)
      .json(createJsonResponse({}, { type: SUCCESS, message: 'New user with UID ${currentUid} added.' }));
  }

  let oldUserDetails: UserDetailsFromRequest;
  try {
    oldUserDetails = await getUserFromJwt(oldUserToken);
  } catch (error) {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json(createJsonResponse({}, { type: ERROR, message: `Could not validate and decode 'old_token'.` }));
  }

  const oldUid = oldUserDetails.uid;
  if (!oldUserDetails.isAnonymous) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json(createJsonResponse({}, { type: ERROR, message: `UID ${oldUid} is already linked` }));
  }

  const result = await linkAccount(oldUid, currentUid);

  switch (result) {
    case LinkAccountResult.OLD_USER_DELETED:
      return res.status(HttpStatus.OK).json(
        createJsonResponse(
          {},
          {
            type: INFORMATION,
            message: `Old UID ${oldUid} is no longer in database. New user ${currentUid} has been linked.`,
          },
        ),
      );

    case LinkAccountResult.NEW_USER_HAS_DATA:
      return res
        .status(HttpStatus.CONFLICT)
        .json(createJsonResponse({}, { type: ERROR, message: 'New UID already has user data and cannot be linked.' }));

    case LinkAccountResult.NEW_USER_LINKED:
      return res
        .status(HttpStatus.OK)
        .json(
          createJsonResponse(
            {},
            { type: SUCCESS, message: `Old UID ${oldUid} has been replaced with new UID ${currentUid}.` },
          ),
        );
  }
}

async function linkAccount(oldUid: string, newUid: string): Promise<LinkAccountResult> {
  const newUser = await getUserIfExists(newUid);
  const oldUser = await getUserIfExists(oldUid);

  // If old user has already been removed from the database. This can happen if the API was called twice or if the new user
  // creation process failed and the API was retried.
  if (!oldUser) {
    if (!newUser) {
      await prisma.user.create({ data: { uid: newUid } });
    }

    return LinkAccountResult.OLD_USER_DELETED;
  }

  // Handle situation where new user exists already with data.
  if (newUser && hasUserData(newUser)) {
    return LinkAccountResult.NEW_USER_HAS_DATA;
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

  return LinkAccountResult.NEW_USER_LINKED;
}

async function handleDelete(uid: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<EmptyPayload>>) {
  // UID is a primary key, so the count will either be 0 (UID does not exist in database) or 1 (successful delete).
  const { count } = await prisma.user.deleteMany({ where: { uid } });

  if (count === 0) {
    return res
      .status(HttpStatus.NOT_FOUND)
      .json(createJsonResponse({}, { type: SUCCESS, message: `Could not find UID ${uid}.` }));
  }

  return res.status(HttpStatus.OK).json(createJsonResponse({}, { type: SUCCESS, message: `Deleted UID ${uid}.` }));
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

export default withPrismaErrorHandling(withVerifiedUser(handler));
