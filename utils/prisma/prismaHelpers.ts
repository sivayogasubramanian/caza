import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime';
import { NextApiHandler } from 'next';
import { ApiResponse, Payload, StatusMessageType } from '../../types/apiResponse';
import { createJsonResponse, HttpStatus } from '../http/httpHelpers';

// Unsolvable from user perspective.
const UNSOLVABLE_ERROR_MESSAGE = {
  type: StatusMessageType.ERROR,
  message: 'Something is wrong with the server. Please wait while we resolve the situation.',
};
const BAD_DATA_PRISMA_ERROR_MESSAGE = {
  type: StatusMessageType.ERROR,
  message: 'The data provided to the server does not match the requirements. Please check your parameters',
};
const BAD_INPUT_PRISMA_ERROR_CODES = [
  'P2000',
  'P2005',
  'P2006',
  'P2008',
  'P2009',
  'P2010',
  'P2012',
  'P2011',
  'P2013',
  'P2016',
  'P2019',
  'P2020',
  'P2033',
];
const BAD_INPUT_PRISMA_ERROR_MESSAGE = {
  type: StatusMessageType.ERROR,
  message: 'The data used is not in the form expected by the server.',
};
const RETRYABLE_PRISMA_ERROR_CODES = ['P1002', 'P1008', 'P1011', 'P1017'];
const RETRYABLE_PRISMA_ERROR_MESSAGE = {
  type: StatusMessageType.ERROR,
  message: 'The server was unable to complete the request. Please try again later.',
};

type PrismaErrors =
  | PrismaClientInitializationError
  | PrismaClientUnknownRequestError
  | PrismaClientRustPanicError
  | PrismaClientInitializationError
  | PrismaClientValidationError;

export function withPrismaErrorHandling<D extends Payload>(
  handler: NextApiHandler<ApiResponse<D>>,
): NextApiHandler<ApiResponse<D>> {
  return async (req, res) => {
    try {
      await Promise.resolve(handler(req, res));
    } catch (err) {
      // Could be a PrismaError, Error or something that does not conform to the interface.
      // eslint-disable-next-line
      const error: PrismaErrors | Error = err as any;
      if (error instanceof PrismaClientKnownRequestError) {
        console.error(`${error.name}: ${error.code}, ${error.message}, ${error.meta}`);

        if (RETRYABLE_PRISMA_ERROR_CODES.includes(error.code)) {
          return res
            .status(HttpStatus.SERVICE_UNAVAILABLE)
            .json(createJsonResponse({}, RETRYABLE_PRISMA_ERROR_MESSAGE));
        }

        if (BAD_INPUT_PRISMA_ERROR_CODES.includes(error.code)) {
          return res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, BAD_INPUT_PRISMA_ERROR_MESSAGE));
        }

        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(createJsonResponse({}, UNSOLVABLE_ERROR_MESSAGE));
      } else if (error instanceof PrismaClientUnknownRequestError) {
        console.error(`${error.name}: ${error.message}`);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(createJsonResponse({}, UNSOLVABLE_ERROR_MESSAGE));
      } else if (error instanceof PrismaClientRustPanicError) {
        console.error(`${error.name}: ${error.message}`);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(createJsonResponse({}, UNSOLVABLE_ERROR_MESSAGE));
      } else if (error instanceof PrismaClientInitializationError) {
        console.error(`${error.name}: ${error.errorCode}, ${error.message}`);
        if (error.errorCode && RETRYABLE_PRISMA_ERROR_CODES.includes(error.errorCode)) {
          return res
            .status(HttpStatus.SERVICE_UNAVAILABLE)
            .json(createJsonResponse({}, RETRYABLE_PRISMA_ERROR_MESSAGE));
        }
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(createJsonResponse({}, UNSOLVABLE_ERROR_MESSAGE));
      } else if (error instanceof PrismaClientValidationError) {
        return res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, BAD_DATA_PRISMA_ERROR_MESSAGE));
      }
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(createJsonResponse({}, UNSOLVABLE_ERROR_MESSAGE));
    }
  };
}
