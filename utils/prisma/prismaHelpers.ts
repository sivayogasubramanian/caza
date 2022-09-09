import { Prisma } from '@prisma/client';
import { NextApiResponse } from 'next';
import { StatusMessageType } from '../../types/apiResponse';
import { createJsonResponse, HttpStatus } from '../http/httpHelpers';

/**
 * Utility function that takes care of Prisma runtime errors during CREATE.
 *
 * @param res The NextApiResponse object.
 * @param creator The Prisma Creator function.
 */
export function createIfPossible(res: NextApiResponse, creator: () => Promise<void>) {
  creator().catch((error) => {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(HttpStatus.BAD_REQUEST).json(
        createJsonResponse(
          {},
          {
            type: StatusMessageType.ERROR,
            message: 'A database error has occurred due to the request. Please try again.',
          },
        ),
      );
      return;
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json(
          createJsonResponse(
            {},
            { type: StatusMessageType.ERROR, message: 'Missing fields in request. Please try again.' },
          ),
        );
      return;
    }

    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(
        createJsonResponse(
          {},
          { type: StatusMessageType.ERROR, message: 'Something is wrong with the server. Please try again.' },
        ),
      );
  });
}
