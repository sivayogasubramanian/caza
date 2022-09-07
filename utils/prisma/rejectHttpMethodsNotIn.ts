import { NextApiResponse } from 'next';

/**
 * Utility function that rejects all responses not in allowed methods with a 405 HTTP response.
 *
 * @param res The NextApiResponse object.
 * @param allowedMethods The allowed HTTP methods.
 */
export function rejectHttpMethodsNotIn(res: NextApiResponse, ...allowedMethods: string[]) {
  res.setHeader('Allow', allowedMethods);
  res.status(405).end('HTTP method not allowed!');
}
