import type { NextApiRequest, NextApiResponse } from 'next';
import { ApplicationStage, ApplicationStageType, PrismaClient } from '@prisma/client';
import { ApiResponse, StatusMessageType } from '../../../../../types/apiResponse';
import { createJsonResponse, HttpMethod, HttpStatus, rejectHttpMethod } from '../../../../../utils/http/httpHelpers';
import { withPrismaErrorHandling } from '../../../../../utils/prisma/prismaHelpers';
import { ApplicationStageData, ApplicationStagePostData } from '../../../../../types/applicationStage';
import { isValidDate } from '../../../../../utils/date/validations';
import { withAuthUser } from '../../../../../utils/auth/jwtHelpers';
import { Nullable } from '../../../../../types/utils';
import { isValidHex } from '../../../../../utils/strings/validations';
import { canBecomeInteger } from '../../../../../utils/numbers/validations';

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

  const { type, date, emojiUnicodeHex, remark } = req.body;
  const parameters: ApplicationStagePostData = { type, date: new Date(date), emojiUnicodeHex, remark };

  const newStage = await prisma.applicationStage.create({
    data: { ...parameters, applicationId: application.id },
  });

  return res
    .status(HttpStatus.CREATED)
    .json(createJsonResponse(createPayload(newStage), messages[MessageType.CREATED]));
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

function createPayload(stage: ApplicationStage): ApplicationStageData {
  const { applicationId, id, type, date, emojiUnicodeHex, remark } = stage;
  return { applicationId, id, type, date: date.toJSON(), emojiUnicodeHex, remark };
}

export default withPrismaErrorHandling(withAuthUser(handler));
