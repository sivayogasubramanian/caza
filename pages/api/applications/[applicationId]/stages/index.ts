import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../../../utils/auth/jwtHelpers';

function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).end(`Request sent to ${req.url}\n`);
}

export default withAuth(handler);
