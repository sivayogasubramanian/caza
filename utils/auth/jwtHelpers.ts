import admin from 'firebase-admin';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

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
export function withAnyUser<T>(
  handler: (uid: string, req: NextApiRequest, res: NextApiResponse<T>) => void,
): NextApiHandler<T> {
  return async (req: NextApiRequest, res: NextApiResponse<T>) => {
    let userDetails: UserDetailsFromRequest;
    try {
      userDetails = await getUserFromJwt(getBearerToken(req));
    } catch (e) {
      return res.status(401).end(UNABLE_TO_AUTHENTICATE);
    }

    return handler(userDetails.uid, req, res);
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
export function withVerifiedUser<T>(
  handler: (uid: string, req: NextApiRequest, res: NextApiResponse<T>) => void,
): NextApiHandler<T> {
  return async (req: NextApiRequest, res: NextApiResponse<T>) => {
    let userDetails: UserDetailsFromRequest;
    try {
      userDetails = await getUserFromJwt(getBearerToken(req));
    } catch (e) {
      return res.status(401).end(UNABLE_TO_AUTHENTICATE);
    }

    const { uid, isAnonymous } = userDetails;
    if (isAnonymous) {
      return res.status(403).end(USER_NOT_AUTHORIZED);
    }

    return handler(uid, req, res);
  };
}

/**
 * Utility function that takes care of authenticating any user (anonymous / verified).
 *
 * Only calls the provided handler if the user has been successfully authenticated. Returns a 401 Unauthorized response
 * if requirements are not met.
 *
 * @param handler Takes in an API handler function that needs an authenticated user.
 * @returns NextApiHandler function.
 */
export function withAuthUser<T>(handler: (req: NextApiRequest, res: NextApiResponse<T>) => void): NextApiHandler<T> {
  return async (req: NextApiRequest, res: NextApiResponse<T>) => {
    try {
      await getUserFromJwt(getBearerToken(req));
    } catch (e) {
      return res.status(401).end(UNABLE_TO_AUTHENTICATE);
    }

    return handler(req, res);
  };
}

async function getUserFromJwt(token: string): Promise<UserDetailsFromRequest> {
  const { uid, firebase } = await admin.auth().verifyIdToken(token);
  const { sign_in_provider } = firebase;
  return { uid, isAnonymous: sign_in_provider == 'anonymous' };
}

function getBearerToken(req: NextApiRequest) {
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
