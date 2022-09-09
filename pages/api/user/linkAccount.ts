import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, EmptyPayload, StatusMessageType } from '../../../types/apiResponse';
import { LinkAccountPostData } from '../../../types/user';
import { Nullable } from '../../../types/utils';
import { withVerifiedUser, getUserFromJwt, UserDetailsFromRequest } from '../../../utils/auth/jwtHelpers';
import { createJsonResponse, HttpStatus, rejectHttpMethod } from '../../../utils/http/httpHelpers';
import { withPrismaErrorHandling } from '../../../utils/prisma/prismaHelpers';

/** Limited set of data representing user and the list of user application IDs. Only for use in this endpoint. */
interface UserData {
  uid: string;
  applications: { id: number }[];
}

enum Result {
  OLD_USER_DELETED,
  NEW_USER_HAS_DATA,
  NEW_USER_LINKED,
}

const { ERROR, INFORMATION, SUCCESS } = StatusMessageType;
const prisma = new PrismaClient();

async function handler(newVerifiedUid: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<EmptyPayload>>) {
  if (req.method != 'POST') {
    return rejectHttpMethod(res, req.method);
  }

  const { body } = req;
  if (!isValidLinkAccountPostData(body)) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json(createJsonResponse({}, { type: ERROR, message: 'Expected old_token as parameter' }));
  }

  let oldUserDetails: UserDetailsFromRequest;
  try {
    oldUserDetails = await getUserFromJwt(body.old_token);
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

  const result = await linkAccount(oldUid, newVerifiedUid);

  switch (result) {
    case Result.OLD_USER_DELETED:
      return res.status(HttpStatus.OK).json(
        createJsonResponse(
          {},
          {
            type: INFORMATION,
            message: `Old UID ${oldUid} is no longer in database. New user ${newVerifiedUid} has been linked.`,
          },
        ),
      );

    case Result.NEW_USER_HAS_DATA:
      return res
        .status(HttpStatus.CONFLICT)
        .json(createJsonResponse({}, { type: ERROR, message: 'New UID already has user data and cannot be linked.' }));

    case Result.NEW_USER_LINKED:
      return res
        .status(HttpStatus.OK)
        .json(
          createJsonResponse(
            {},
            { type: SUCCESS, message: `Old UID ${oldUid} has been replaced with new UID ${newVerifiedUid}.` },
          ),
        );
  }
}

async function linkAccount(oldUid: string, newVerifiedUid: string): Promise<Result> {
  const newUser = await getUserIfExists(newVerifiedUid);
  const oldUser = await getUserIfExists(oldUid);

  // If old user has already been removed from the database. This can happen if the API was called twice or if the new user
  // creation process failed and the API was retried.
  if (!oldUser) {
    if (!newUser) {
      await prisma.user.create({ data: { uid: newVerifiedUid } });
    }

    return Result.OLD_USER_DELETED;
  }

  // Handle situation where new user exists already with data.
  if (newUser && hasUserData(newUser)) {
    return Result.NEW_USER_HAS_DATA;
  }

  // New user exists but has no data (linking should continue as if new user does not exist).
  if (newUser) {
    await prisma.user.delete({ where: { uid: newVerifiedUid } });
  }

  // Update UID to new (foreign key references to UID will cascade on update)
  await prisma.user.update({
    where: { uid: oldUid },
    data: { uid: newVerifiedUid },
  });

  return Result.NEW_USER_LINKED;
}

function isValidLinkAccountPostData(obj: object): obj is LinkAccountPostData {
  return obj && 'old_token' in obj && typeof (obj as { old_token: object }).old_token == 'string';
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
