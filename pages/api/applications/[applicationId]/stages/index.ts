import type { NextApiRequest, NextApiResponse } from 'next';
import { ApplicationStageType, PrismaClient } from '@prisma/client';
import { ApiResponse, StatusMessageType } from '../../../../../types/apiResponse';
import { createJsonResponse, HttpMethod, HttpStatus, rejectHttpMethod } from '../../../../../utils/http/httpHelpers';
import { withPrismaErrorHandling } from '../../../../../utils/prisma/prismaHelpers';
import {
  ApplicationStageChronologicalData,
  ApplicationStageData,
  ApplicationStagePostData,
} from '../../../../../types/applicationStage';
import { isValidDate } from '../../../../../utils/date/validations';
import { withAuthUser } from '../../../../../utils/auth/jwtHelpers';
import { Nullable } from '../../../../../types/utils';
import { isValidHex } from '../../../../../utils/strings/validations';
import { canBecomeInteger } from '../../../../../utils/numbers/validations';
import { convertApplicationStageToPayload } from '../../../../../utils/applicationStage/converter';
import { chronologicalErrorMessages, validateStageChronology } from '../../../../../utils/applicationStage/validations';

const prisma = new PrismaClient();

enum MessageType {
  INVALID_TYPE,
  INVALID_DATE,
  INVALID_APPLICATION_ID,
  APPLICATION_NOT_FOUND,
  CREATED,
  INVALID_EMOJI_UNICODE_HEX,
  INVALID_REMARK,
}

const messages = Object.freeze({
  [MessageType.INVALID_TYPE]: {
    type: StatusMessageType.ERROR,
    message: 'Application stage type is invalid.',
  },
  [MessageType.INVALID_DATE]: {
    type: StatusMessageType.ERROR,
    message: 'Application stage date is invalid.',
  },
  [MessageType.INVALID_APPLICATION_ID]: {
    type: StatusMessageType.ERROR,
    message: 'ApplicationId is invalid.',
  },
  [MessageType.APPLICATION_NOT_FOUND]: {
    type: StatusMessageType.ERROR,
    message: 'Application cannot be found.',
  },
  [MessageType.CREATED]: { type: StatusMessageType.SUCCESS, message: 'Application stage has been created.' },
  [MessageType.INVALID_REMARK]: {
    type: StatusMessageType.ERROR,
    message: 'Application stage remark is invalid.',
  },
  [MessageType.INVALID_EMOJI_UNICODE_HEX]: {
    type: StatusMessageType.ERROR,
    message: 'Application stage emoji unicode hex is invalid.',
  },
});

async function handler(uid: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<ApplicationStageData>>) {
  switch (req.method) {
    case HttpMethod.POST:
      return handlePost(uid, req, res);
    default:
      return rejectHttpMethod(res, req.method);
  }
}

async function handlePost(uid: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<ApplicationStageData>>) {
  const paramValidationError = validatePostRequest(req);
  if (paramValidationError !== null) {
    return res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[paramValidationError]));
  }

  const applicationId = Number(req.query.applicationId);
  const application = await prisma.application.findFirst({ where: { id: applicationId, userId: uid } });
  if (application === null) {
    return res.status(HttpStatus.NOT_FOUND).json(createJsonResponse({}, messages[MessageType.APPLICATION_NOT_FOUND]));
  }

  const applicationStagePostData = req.body as ApplicationStagePostData;
  const { type, date, emojiUnicodeHex, remark } = applicationStagePostData;

  const applicationStagesOfApplication = await findApplicationStagesOfApplication(applicationId, uid);

  const chronologicalErrorMessageType = validatePostStageChronology(
    applicationStagesOfApplication,
    applicationStagePostData,
  );
  if (chronologicalErrorMessageType !== null) {
    res
      .status(HttpStatus.BAD_REQUEST)
      .json(createJsonResponse({}, chronologicalErrorMessages[chronologicalErrorMessageType]));
    return;
  }

  const parameters = { type, date: new Date(date), emojiUnicodeHex, remark };
  const newStage = await prisma.applicationStage.create({
    data: { ...parameters, applicationId: application.id },
  });

  return res
    .status(HttpStatus.CREATED)
    .json(createJsonResponse(convertApplicationStageToPayload(newStage), messages[MessageType.CREATED]));
}

function validatePathParameters(req: NextApiRequest): Nullable<MessageType> {
  return !canBecomeInteger(req.query.applicationId) ? MessageType.INVALID_APPLICATION_ID : null;
}

function validatePostRequest(req: NextApiRequest): Nullable<MessageType> {
  const pathParameterError = validatePathParameters(req);
  if (pathParameterError !== null) {
    return pathParameterError;
  }

  const { type, date, emojiUnicodeHex, remark } = req.body;

  if (typeof type !== 'string' || !(type in ApplicationStageType)) {
    return MessageType.INVALID_TYPE;
  }

  if (date === null || date === undefined || !isValidDate(date + '')) {
    return MessageType.INVALID_DATE;
  }

  const isValidRemark = remark === null || remark === undefined || typeof remark === 'string';
  if (!isValidRemark) {
    return MessageType.INVALID_REMARK;
  }

  const isValidEmojiUnicodeHex =
    emojiUnicodeHex === null ||
    emojiUnicodeHex === undefined ||
    (typeof emojiUnicodeHex === 'string' && isValidHex(emojiUnicodeHex));
  if (!isValidEmojiUnicodeHex) {
    return MessageType.INVALID_EMOJI_UNICODE_HEX;
  }

  return null;
}

function validatePostStageChronology(
  otherApplicationStagesOfApplication: ApplicationStageChronologicalData[],
  applicationStagePostData: ApplicationStagePostData,
) {
  const applicationStagesToValidate = [
    ...otherApplicationStagesOfApplication,
    {
      type: applicationStagePostData.type,
      date: new Date(applicationStagePostData.date),
    },
  ];

  return validateStageChronology(...applicationStagesToValidate);
}

async function findApplicationStagesOfApplication(applicationId: number, userId: string) {
  return await prisma.applicationStage.findMany({
    where: {
      application: {
        id: applicationId,
        userId: userId,
      },
    },
    select: { type: true, date: true },
  });
}

export default withPrismaErrorHandling(withAuthUser(handler));
