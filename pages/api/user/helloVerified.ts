import { NextApiRequest, NextApiResponse } from 'next';
import { withVerifiedUser } from '../../../utils/auth/jwtHelpers';

function handler(uid: string, req: NextApiRequest, res: NextApiResponse) {
  res.status(200).end(`You have been verified and your uid is ${uid}.\n`);
}

export default withVerifiedUser(handler);
