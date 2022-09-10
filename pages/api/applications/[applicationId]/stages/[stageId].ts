import type { NextApiRequest, NextApiResponse } from 'next';
import { ApplicationStageType, PrismaClient } from '@prisma/client';
import { ApplicationStagePatchData } from '../../../../../types/applicationStage';
import { ErrorData } from '../../../../../types/error';
import { isValidHex } from '../../../../../utils/strings/validations';
import { withAuthUser } from '../../../../../utils/auth/jwtHelpers';
import { isValidDate } from '../../../../../utils/date/validations';
import { HttpMethod, HttpStatus, rejectHttpMethod } from '../../../../../utils/http/httpHelpers';
import { withPrismaErrorHandling } from '../../../../../utils/prisma/prismaHelpers';

enum ErrorType {
  INVALID_APPLICATION_STAGE_TYPE,
  INVALID_DATE,
  INVALID_EMOJI_UNICODE_HEX,
}

const prisma = new PrismaClient();

const errorMessages = new Map<ErrorType, ErrorData>([
  [ErrorType.INVALID_APPLICATION_STAGE_TYPE, { message: 'Application stage type is invalid.' }],
  [ErrorType.INVALID_DATE, { message: 'Date is invalid.' }],
  [ErrorType.INVALID_EMOJI_UNICODE_HEX, { message: 'Emoji unicode hex is invalid.' }],
]);

function handler(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;
  switch (method) {
    case HttpMethod.PATCH:
      handlePatch(userId, req, res);
      break;
    case HttpMethod.DELETE:
      handleDelete(userId, req, res);
      break;
    default:
      rejectHttpMethod(res, method);
  }
}

async function handlePatch(userId: string, req: NextApiRequest, res: NextApiResponse) {
  validateRequest(req, res);

  const applicationStageId = Number(req.query.stageId);
  const applicationId = Number(req.query.applicationId);

  const applicationStagePatchData: ApplicationStagePatchData = {
    ...req.body,
    date: new Date(req.body.date),
  };

  // Note: updateMany is used to allow filter on non-unique columns.
  // This allows a check to ensure users are only editing their own application stages.
  const { count } = await prisma.applicationStage.updateMany({
    where: {
      id: applicationStageId,
      application: {
        id: applicationId,
        userId: userId,
      },
    },
    data: {
      type: applicationStagePatchData.type,
      date: applicationStagePatchData.date,
      emojiUnicodeHex: applicationStagePatchData.emojiUnicodeHex,
      remark: applicationStagePatchData.remark,
    },
  });

  if (count < 1) {
    res.status(HttpStatus.BAD_REQUEST).end();
    return;
  }

  const updatedApplicationStage = await prisma.applicationStage.findUnique({
    where: {
      id: applicationStageId,
    },
    select: {
      id: true,
      applicationId: true,
      type: true,
      date: true,
      emojiUnicodeHex: true,
      remark: true,
    },
  });

  res.status(HttpStatus.OK).json(updatedApplicationStage);
}

async function handleDelete(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const applicationStageId = Number(req.query.stageId);
  const applicationId = Number(req.query.applicationId);

  const { count } = await prisma.applicationStage.deleteMany({
    where: {
      id: applicationStageId,
      application: {
        id: applicationId,
        userId: userId,
      },
    },
  });

  if (count === 0) {
    res.status(HttpStatus.UNAUTHORIZED).end();
    return;
  }

  res.status(HttpStatus.OK).json({ message: `Application Stage ${applicationStageId} was deleted successfully.` });
}

function validateRequest(req: NextApiRequest, res: NextApiResponse) {
  if (req.body.type !== undefined && !Object.values(ApplicationStageType).includes(req.body.type)) {
    res.status(HttpStatus.BAD_REQUEST).json(errorMessages.get(ErrorType.INVALID_APPLICATION_STAGE_TYPE));
    return;
  }

  if (req.body.date !== undefined && !isValidDate(req.body.date)) {
    res.status(HttpStatus.BAD_REQUEST).json(errorMessages.get(ErrorType.INVALID_DATE));
    return;
  }

  if (
    req.body.emojiUnicodeHex !== undefined &&
    req.body.emojiUnicodeHex !== null &&
    !isValidHex(req.body.emojiUnicodeHex)
  ) {
    res.status(HttpStatus.BAD_REQUEST).json(errorMessages.get(ErrorType.INVALID_EMOJI_UNICODE_HEX));
    return;
  }
}

export default withPrismaErrorHandling(withAuthUser(handler));
