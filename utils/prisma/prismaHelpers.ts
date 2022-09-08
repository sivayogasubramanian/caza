import { Prisma } from '@prisma/client';
import { NextApiResponse } from 'next';
import { StatusMessageType } from '../../types/apiResponse';
import { createJsonResponse, HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_INTERNAL_SERVER_ERROR } from '../http/httpHelpers';

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
      res.status(HTTP_STATUS_BAD_REQUEST).json(
        createJsonResponse({}, [
          {
            type: StatusMessageType.Error,
            message: 'A database error has occured due to the request. Please try again.',
          },
        ]),
      );
      return;
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      res
        .status(HTTP_STATUS_BAD_REQUEST)
        .json(
          createJsonResponse({}, [
            { type: StatusMessageType.Error, message: 'Missing fields in request. Please try again.' },
          ]),
        );
      return;
    }

    res
      .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
      .json(
        createJsonResponse({}, [
          { type: StatusMessageType.Error, message: 'Something is wrong with the server. Please try again.' },
        ]),
      );
  });
}
