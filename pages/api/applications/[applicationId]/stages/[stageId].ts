import type { NextApiRequest, NextApiResponse } from 'next';
import { ApplicationStageType, PrismaClient } from '@prisma/client';
import { ApplicationStageData, ApplicationStagePatchData } from '../../../../../types/applicationStage';
import { isValidHex } from '../../../../../utils/strings/validations';
import { withAuthUser } from '../../../../../utils/auth/jwtHelpers';
import { isValidDate } from '../../../../../utils/date/validations';
import { createJsonResponse, HttpMethod, HttpStatus, rejectHttpMethod } from '../../../../../utils/http/httpHelpers';
import { withPrismaErrorHandling } from '../../../../../utils/prisma/prismaHelpers';
import { ApiResponse, EmptyPayload, StatusMessageType } from '../../../../../types/apiResponse';
import { Nullable } from '../../../../../types/utils';

enum MessageType {
  APPLICATION_STAGE_DELETE_UNAUTHORIZED,
  APPLICATION_STAGE_DELETED_SUCCESSFULLY,
  APPLICATION_STAGE_NOT_FOUND,
  APPLICATION_STAGE_UPDATE_UNAUTHORIZED,
  APPLICATION_STAGE_UPDATED_SUCCESSFULLY,
  EMPTY_UPDATE,
  INVALID_APPLICATION_ID,
  INVALID_APPLICATION_STAGE_ID,
  INVALID_APPLICATION_STAGE_TYPE,
  INVALID_DATE,
  INVALID_EMOJI_UNICODE_HEX,
}

const prisma = new PrismaClient();

const messages = Object.freeze({
  [MessageType.APPLICATION_STAGE_DELETE_UNAUTHORIZED]: {
    type: StatusMessageType.ERROR,
    message: 'Application stage cannot be deleted by the user.',
  },
  [MessageType.APPLICATION_STAGE_DELETED_SUCCESSFULLY]: {
    type: StatusMessageType.SUCCESS,
    message: 'Application stage deleted successfully.',
  },
  [MessageType.APPLICATION_STAGE_NOT_FOUND]: {
    type: StatusMessageType.ERROR,
    message: 'Application stage cannot be found.',
  },
  [MessageType.APPLICATION_STAGE_UPDATE_UNAUTHORIZED]: {
    type: StatusMessageType.ERROR,
    message: 'Application stage cannot be updated by the user.',
  },
  [MessageType.APPLICATION_STAGE_UPDATED_SUCCESSFULLY]: {
    type: StatusMessageType.SUCCESS,
    message: 'Application stage updated successfully.',
  },
  [MessageType.INVALID_APPLICATION_ID]: {
    type: StatusMessageType.ERROR,
    message: 'Application id is invalid',
  },
  [MessageType.INVALID_APPLICATION_STAGE_ID]: {
    type: StatusMessageType.ERROR,
    message: 'Application stage id is invalid',
  },
  [MessageType.INVALID_APPLICATION_STAGE_TYPE]: {
    type: StatusMessageType.ERROR,
    message: 'Application stage type is invalid.',
  },
  [MessageType.INVALID_DATE]: { type: StatusMessageType.ERROR, message: 'Application stage date is invalid.' },
  [MessageType.INVALID_EMOJI_UNICODE_HEX]: {
    type: StatusMessageType.ERROR,
    message: 'Application stage emoji unicode hex is invalid.',
  },
});

async function handler(userId: string, req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;
  switch (method) {
    case HttpMethod.PATCH:
      return handlePatch(userId, req, res);
    case HttpMethod.DELETE:
      return handleDelete(userId, req, res);
    default:
      return rejectHttpMethod(res, method);
  }
}

async function handlePatch(
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ApplicationStageData>>,
) {
  const errorMessageType = validatePatchRequest(req);
  if (errorMessageType !== null) {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[errorMessageType]));
    return;
  }

  const applicationStageId = Number(req.query.stageId);
  const applicationId = Number(req.query.applicationId);

  const applicationStagePatchData: ApplicationStagePatchData = makePatchData(req);

  // Note: updateMany is used to allow filter on non-unique columns.
  // This allows a check to ensure users are only updating their own application stages.
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

  if (count === 0) {
    res
      .status(HttpStatus.UNAUTHORIZED)
      .json(createJsonResponse({}, messages[MessageType.APPLICATION_STAGE_UPDATE_UNAUTHORIZED]));
    return;
  }

  const updatedApplicationStage: Nullable<ApplicationStageData> = await prisma.applicationStage.findUnique({
    where: {
      id: applicationStageId,
    },
    select: { id: true, applicationId: true, type: true, date: true, emojiUnicodeHex: true, remark: true },
  });

  if (!updatedApplicationStage) {
    res.status(HttpStatus.NOT_FOUND).json(createJsonResponse({}, messages[MessageType.APPLICATION_STAGE_NOT_FOUND]));
    return;
  }

  res
    .status(HttpStatus.OK)
    .json(createJsonResponse(updatedApplicationStage, messages[MessageType.APPLICATION_STAGE_UPDATED_SUCCESSFULLY]));
}

async function handleDelete(userId: string, req: NextApiRequest, res: NextApiResponse<ApiResponse<EmptyPayload>>) {
  const errorMessageType = validateDeleteRequest(req);
  if (errorMessageType != null) {
    res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[errorMessageType]));
    return;
  }

  const applicationStageId = Number(req.query.stageId);
  const applicationId = Number(req.query.applicationId);

  // Note: deleteMany is used to allow filter on non-unique columns.
  // This allows a check to ensure users are only deleting their own application stages.
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
    res
      .status(HttpStatus.UNAUTHORIZED)
      .json(createJsonResponse({}, messages[MessageType.APPLICATION_STAGE_DELETE_UNAUTHORIZED]));
    return;
  }

  res.status(HttpStatus.OK).json(createJsonResponse({}, messages[MessageType.APPLICATION_STAGE_DELETED_SUCCESSFULLY]));
}

function validatePatchRequest(req: NextApiRequest) {
  if (!Number.isInteger(req.query.stageId)) {
    return MessageType.INVALID_APPLICATION_STAGE_ID;
  }

  if (!Number.isInteger(req.query.applicationId)) {
    return MessageType.INVALID_APPLICATION_ID;
  }

  if (req.body.type !== undefined && !(req.body.type in ApplicationStageType)) {
    return MessageType.INVALID_APPLICATION_STAGE_TYPE;
  }

  if (req.body.date !== undefined && (typeof req.body.date !== 'string' || !isValidDate(req.body.date))) {
    return MessageType.INVALID_DATE;
  }

  if (
    req.body.emojiUnicodeHex !== undefined &&
    req.body.emojiUnicodeHex !== null &&
    (typeof req.body.emojiUnicodeHex !== 'string' || !isValidHex(req.body.emojiUnicodeHex))
  ) {
    return MessageType.INVALID_EMOJI_UNICODE_HEX;
  }

  return null;
}

function makePatchData(req: NextApiRequest) {
  const applicationStagePatchData: ApplicationStagePatchData = {};

  if (req.body.type !== undefined) {
    applicationStagePatchData.type = req.body.type;
  }

  if (req.body.date !== undefined) {
    applicationStagePatchData.date = new Date(req.body.date);
  }

  if (req.body.emojiUnicodeHex !== undefined) {
    applicationStagePatchData.emojiUnicodeHex = req.body.emojiUnicodeHex;
  }

  if (req.body.remark !== undefined) {
    applicationStagePatchData.remark = req.body.remark;
  }

  return applicationStagePatchData;
}

function validateDeleteRequest(req: NextApiRequest) {
  if (!Number.isInteger(req.query.stageId)) {
    return MessageType.INVALID_APPLICATION_STAGE_ID;
  }

  if (!Number.isInteger(req.query.applicationId)) {
    return MessageType.INVALID_APPLICATION_ID;
  }

  return null;
}

export default withPrismaErrorHandling(withAuthUser(handler));
