import admin from 'firebase-admin';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, StatusMessageType } from '../../types/apiResponse';
import { createJsonResponse, HttpStatus } from '../http/httpHelpers';

export interface UserDetailsFromRequest {
  uid: string;
  isAnonymous: boolean;
}

// Note: do not modify the 'firebase-admin' default import style, it triggers a known bug
// See: https://github.com/firebase/firebase-admin-node/issues/593
try {
  admin.initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
} catch (error) {
  // Ignore the "already exists" message in dev environments (cause by hot reloads).
  if (!(process.env.NODE_ENV == 'development' && /already exists/u.test('' + error))) {
    console.error(error);
  }
}

const UNABLE_TO_AUTHENTICATE = 'User could not be authenticated.';
const USER_NOT_AUTHORIZED = 'User has not verified their identity.';

/**
 * Utility function that takes care of authenticating any user (anonymous / verified) and providing the UID.
 *
 * Only calls the provided handler if the user has been successfully authenticated. Returns a 401 Unauthorized response
 * if requirements are not met.
 *
 * @param handler Takes in an API handler function that needs an authenticated user.
 * @returns NextApiHandler function.
 */
export function withAuthUser<D>(
  handler: (uid: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<D>>) => void,
): NextApiHandler<ApiResponse<D>> {
  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<D>>) => {
    let userDetails: UserDetailsFromRequest;
    try {
      userDetails = await getUserFromJwt(getBearerToken(req));
    } catch (e) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(createJsonResponse({}, { type: StatusMessageType.ERROR, message: UNABLE_TO_AUTHENTICATE }));
    }

    return await Promise.resolve(handler(userDetails.uid, req, res));
  };
}

/**
 * Utility function that takes care of authenticating a verified user and providing the UID.
 *
 * Only calls the provided handler if the user has been successfully authenticated and is verified. Returns a 401
 * Unauthorized response if requirements are not met.
 *
 * @param handler Takes in an API handler function that needs a verified user.
 * @returns NextApiHandler function.
 */
export function withVerifiedUser<D>(
  handler: (uid: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<D>>) => void,
): NextApiHandler<ApiResponse<D>> {
  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<D>>) => {
    let userDetails: UserDetailsFromRequest;
    try {
      userDetails = await getUserFromJwt(getBearerToken(req));
    } catch (e) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(createJsonResponse({}, { type: StatusMessageType.ERROR, message: UNABLE_TO_AUTHENTICATE }));
    }

    const { uid, isAnonymous } = userDetails;
    if (isAnonymous) {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json(createJsonResponse({}, { type: StatusMessageType.ERROR, message: USER_NOT_AUTHORIZED }));
    }

    return await Promise.resolve(handler(uid, req, res));
  };
}

/**
 * Utility function that takes care of authenticating any user (anonymous / verified).
 * The user's UID is not returned to the handler.
 * Use withAuthUser instead if you need the UID.
 *
 * Only calls the provided handler if the user has been successfully authenticated. Returns a 401 Unauthorized response
 * if requirements are not met.
 *
 * @param handler Takes in an API handler function that needs an authenticated user.
 * @returns NextApiHandler function.
 */
export function withAuth<D>(
  handler: (req: NextApiRequest, res: NextApiResponse<ApiResponse<D>>) => void,
): NextApiHandler<ApiResponse<D>> {
  return withAuthUser((_, req, res) => handler(req, res));
}

export async function getUserFromJwt(token: string): Promise<UserDetailsFromRequest> {
  // If you are running this in development mode, JWT token verification and decoding can be skipped.
  // Use bearer token 'devUserFoo' to get { uid: 'devUserFoo', isAnonymous: true }
  // Use bearer token 'devUserVerifiedFoo' to get { uid: 'devUserVerifiedFoo', isAnonymous: false }
  if (['development', 'test'].includes(process.env.NODE_ENV) && /devUser/u.test(token)) {
    return { uid: token, isAnonymous: !/Verified/u.test(token) };
  }

  const { uid, firebase } = await admin.auth().verifyIdToken(token);
  const { sign_in_provider } = firebase;
  return { uid, isAnonymous: sign_in_provider == 'anonymous' };
}

export function getBearerToken(req: NextApiRequest) {
  const bearerPrefix = 'Bearer ';
  const authHeader = req.headers?.authorization;

  if (!authHeader) {
    throw new Error('Auth header is not present');
  }

  if (!authHeader.startsWith(bearerPrefix)) {
    throw new Error('Auth header is not a bearer token.');
  }

  return authHeader.replace(bearerPrefix, '');
}
