import { NextApiRequest, NextApiResponse } from 'next';
import { withAnyUser } from '../../../utils/auth/jwtHelpers';

function handler(uid: string, req: NextApiRequest, res: NextApiResponse) {
  res.status(200).end(`Your uid is ${uid}.\n`);
}

export default withAnyUser(handler);
