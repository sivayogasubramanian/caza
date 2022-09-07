import { Prisma } from '@prisma/client';
import { NextApiResponse } from 'next';
import { HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_INTERNAL_SERVER_ERROR } from '../http/httpHelper';

// TODO: Find if there is a better way to do this.

/**
 * Utility function that takes care of missing fields in JSON POST Requests.
 *
 * @param res The NextApiResponse object.
 * @param creator The Prisma Creator function.
 */
export function createIfPossible(res: NextApiResponse, creator: () => Promise<void>) {
  creator().catch((error) => {
    console.log(error);

    if (error instanceof Prisma.PrismaClientValidationError) {
      res.status(HTTP_STATUS_BAD_REQUEST).end();
      return;
    }

    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).end();
  });
}
