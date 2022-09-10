// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, StatusMessageType } from '../../types/apiResponse';
import { createJsonResponse } from '../../utils/http/httpHelpers';

type Data = {
  name: string;
};

export default function handler(_req: NextApiRequest, res: NextApiResponse<ApiResponse<Data>>) {
  res
    .status(200)
    .json(createJsonResponse({ name: 'John Doe' }, { type: StatusMessageType.SUCCESS, message: 'Hello!' }));
}
