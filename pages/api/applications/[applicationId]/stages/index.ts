import type { NextApiRequest, NextApiResponse } from 'next';
import { Application, ApplicationStage, ApplicationStageType, PrismaClient } from '@prisma/client';
import { ApiResponse, StatusMessageType } from '../../../../../types/apiResponse';
import { createJsonResponse, HttpMethod, HttpStatus, rejectHttpMethod } from '../../../../../utils/http/httpHelpers';
import { withPrismaErrorHandling } from '../../../../../utils/prisma/prismaHelpers';
import { ApplicationStageData, ApplicationStagePostData } from '../../../../../types/applicationStage';
import { isValidDate } from '../../../../../utils/date/validations';
import { withAuthUser } from '../../../../../utils/auth/jwtHelpers';
import { Nullable } from '../../../../../types/utils';

const prisma = new PrismaClient();

type ApplicationDataWithStages = Application & { applicationStages: ApplicationStage[] };

enum MessageType {
  INVALID_TYPE,
  INVALID_DATE,
  INVALID_APPLICATION_ID,
  APPLICATION_NOT_FOUND,
  CREATED,
}

const messages = Object.freeze({
  [MessageType.INVALID_TYPE]: {
    type: StatusMessageType.ERROR,
    message:
      'Application Stage type is invalid. Type must be one of: ' + Object.values(ApplicationStageType).join(', ') + '.',
  },
  [MessageType.INVALID_DATE]: {
    type: StatusMessageType.ERROR,
    message: 'Application Stage date is invalid.',
  },
  [MessageType.INVALID_APPLICATION_ID]: {
    type: StatusMessageType.ERROR,
    message: 'Query parameter applicationId (.../applications/:applicationId/...) is invalid.',
  },
  [MessageType.APPLICATION_NOT_FOUND]: {
    type: StatusMessageType.ERROR,
    message: 'User does not have any application with the given ID.',
  },
  [MessageType.CREATED]: { type: StatusMessageType.SUCCESS, message: `Application stage has been created.` },
});

async function handler(
  uid: string,
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ApplicationStageData | ApplicationDataWithStages>>,
) {
  const errorMessageIfInvalid = validatePathParameters(req);
  if (errorMessageIfInvalid !== null) {
    return res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[errorMessageIfInvalid]));
  }

  const application = await getApplication(uid, Number(req.query.applicationId));
  if (application === null) {
    return res.status(HttpStatus.NOT_FOUND).json(createJsonResponse({}, messages[MessageType.APPLICATION_NOT_FOUND]));
  }

  switch (req.method) {
    case HttpMethod.POST:
      return postHandler(application, req, res);
    case HttpMethod.GET:
      return getHandler(application, res);
    default:
      return rejectHttpMethod(res, req.method);
  }
}

async function postHandler(
  application: ApplicationDataWithStages,
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ApplicationStageData>>,
) {
  const paramValidationError = validatePostRequest(req);
  if (paramValidationError !== null) {
    return res.status(HttpStatus.BAD_REQUEST).json(createJsonResponse({}, messages[paramValidationError]));
  }

  const { type, date } = req.body;
  const parameters: ApplicationStagePostData = { type, date: new Date(date) };

  const newStage: ApplicationStageData = await prisma.applicationStage.create({
    data: { ...parameters, applicationId: application.id },
    select: { applicationId: true, id: true, type: true, date: true, emojiUnicodeHex: true, remark: true },
  });
  return res.status(HttpStatus.CREATED).json(createJsonResponse(newStage, messages[MessageType.CREATED]));
}

async function getHandler(
  application: ApplicationDataWithStages,
  res: NextApiResponse<ApiResponse<ApplicationDataWithStages>>,
) {
  return res.status(HttpStatus.OK).json(createJsonResponse(application, messages[MessageType.CREATED]));
}

/** Validates path parameters and body. */
function validatePathParameters(req: NextApiRequest): Nullable<MessageType> {
  const applicationId = req.query.applicationId as string;
  return Number.isInteger(applicationId) ? MessageType.INVALID_APPLICATION_ID : null;
}

/** Validates path parameters and body. */
function validatePostRequest(req: NextApiRequest): Nullable<MessageType> {
  const { type, date } = req.body;

  if (typeof type != 'string' || !(type in ApplicationStageType)) {
    return MessageType.INVALID_TYPE;
  }

  if (date === null || date === undefined || !isValidDate(date + '')) {
    return MessageType.INVALID_DATE;
  }

  return null;
}

/** Finds application if present for the user, else returns null. */
async function getApplication(uid: string, applicationId: number): Promise<Nullable<ApplicationDataWithStages>> {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId: uid },
    select: {
      id: true,
      userId: true,
      roleId: true,
      updatedAt: true,
      applicationStages: true,
    },
  });
  return application;
}

export default withPrismaErrorHandling(withAuthUser(handler));
