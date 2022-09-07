import type { NextApiRequest, NextApiResponse } from 'next';
import { withVerifiedUser, getUserFromJwt, UserDetailsFromRequest } from '../../../utils/auth/jwtHelpers';

async function handler(newVerifiedUid: string, req: NextApiRequest, res: NextApiResponse) {
  if (req.method != 'POST') {
    return res.status(400).send('Expected POST call');
  }

  const body = validateRequestBodyType(req.body);
  if (!body) {
    return res.status(400).send('Expected old_token as parameter');
  }

  let oldUserDetails: UserDetailsFromRequest;
  try {
    oldUserDetails = await getUserFromJwt(body.old_token);
  } catch (error) {
    return res.status(400).json({});
  }

  const oldUid = oldUserDetails.uid;
  if (!oldUserDetails.isAnonymous) {
    return res.status(400).send(`UID ${oldUid} is already linked`);
  }

  const newUser = getUserIfExists(newVerifiedUid);
  const oldUser = getUserIfExists(oldUid);

  // If old user has already been removed from the database.
  if (!oldUser && newUser) {
    return res.status(205).send(`Old UID does not exist. New user exists.`);
  } else if (!oldUser && !newUser) {
    // TODO: Create the new user.
    return res.status(201).send(`Old UID does not exist. New user created.`);
  }

  // If both old and new user exists.
  if (newUser && hasUserData(newUser)) {
    return res.status(205).send(`New UID exists with user data and cannot be linked.`);
  } else if (newUser) {
    // new user exists but has no data.
    // TODO: Delete new user.
  }

  // Just update UID to new (foreign key references to UID will cascade on update)
  res.status(200).send(`Request sent to ${req.url}\n`);
}

type UserOrm = string; // TODO: Remove this placeholder type

interface LinkAccountRequestJsonBody {
  old_token: string;
}

function validateRequestBodyType(body: any) {
  if (!body) return;
  if (!('old_token' in body)) return;
  if (typeof body.old_token != 'string') return;

  return body as LinkAccountRequestJsonBody;
}

// Returns user if present in the database.
function getUserIfExists(uid: string): UserOrm | undefined {
  // TODO: implement this part.
  return;
}

// Returns true iff there is at least one application for this User.
function hasUserData(user: UserOrm) {
  // TODO: implement this part.
  return true;
}

export default withVerifiedUser(handler);
