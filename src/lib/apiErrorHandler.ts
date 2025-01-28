// utils/errorHandler.ts

import { NextApiResponse } from 'next';

export const handleApiError = (
  res: NextApiResponse,
  error: any,
  statusCode: number = 500
) => {
  console.error('API Error:', error.message || error);
  res.status(statusCode).json({ error: error.message || 'Internal Server Error' });
};


/*Usage:
export default async function handler(req: any, res: any) {
  try {
    // Your logic here
    throw new Error('Sample error');
  } catch (error) {
    handleApiError(res, error, 400);
  }
}
*/
