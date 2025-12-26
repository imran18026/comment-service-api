import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import { authServices } from './auth.service';
import sendResponse from '../../utils/sendResponse';
import config from '../../config';
import httpStatus from 'http-status';
import AppError from '../../error/AppError';

// login
const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.login(req.body);
  const { refreshToken } = result;
  // set refresh token into cookie
  const cookieOptions: {} = {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 31536000000,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logged in successfully',
    data: result,
  });
});

// change password
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req?.user;
  const { newPassword, oldPassword } = req.body;

  const result = await authServices.changePassword({
    userId,
    newPassword,
    oldPassword,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully',
    data: result,
  });
});

// refresh token
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.headers?.refreshtoken as string;

  // const { refreshToken } = req.cookies;
  if (!refreshToken)
    throw new AppError(httpStatus.BAD_REQUEST, 'Refresh token missing');
  const result = await authServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token retrieved successfully',
    data: result,
  });
});

export const authControllers = {
  login,
  changePassword,
  refreshToken,
};
