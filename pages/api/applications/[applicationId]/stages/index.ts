import type { NextApiRequest, NextApiResponse } from 'next';
import { withAnyUser } from '../../../../../utils/auth/jwtHelpers';

function handler(uid: string, req: NextApiRequest, res: NextApiResponse) {
  res.status(200).end(`Request sent to ${req.url}\n`);
}

export default withAnyUser(handler);
