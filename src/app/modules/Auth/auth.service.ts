import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { TLogin } from './auth.interface';
import config from '../../config';
import bcrypt from 'bcryptjs';
import { User } from '../user/user.models';
import { createToken, verifyToken } from '../../utils/tokenManage';
import { userService } from '../user/user.service';
import { TUser } from '../user/user.interface';

// Login
const login = async (payload: TLogin) => {
  console.log(payload);
  const user = await User.isUserActive(payload?.email);
  // const user = await User.findOne({ email: payload?.email });
  console.log(user);
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  if (!(await User.isPasswordMatched(payload.password, user.password))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password does not match');
  }

  const jwtPayload: {
    userId: string;
    role: string;
    fullName: string;
    email: string;
  } = {
    fullName: user?.fullName,
    email: user.email,
    userId: user?._id?.toString() as string,
    role: user?.role,
  };

  console.log({ jwtPayload });

  const accessToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_access_secret as string,
    expity_time: config.jwt_access_expires_in as string,
  });

  console.log({ accessToken });

  const refreshToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_refresh_secret as string,
    expity_time: config.jwt_refresh_expires_in as string,
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

// Change password
const changePassword = async ({
  userId,
  newPassword,
  oldPassword,
}: {
  userId: string;
  newPassword: string;
  oldPassword: string;
}) => {
  const user = await User.IsUserExistById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!(await User.isPasswordMatched(oldPassword, user.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Old password does not match');
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await userService.updateUser(userId, {
    password: hashedPassword,
  });

  return result;
};

// Refresh token
const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token not found');
  }

  const decoded = verifyToken({
    token,
    access_secret: config.jwt_refresh_secret as string,
  });

  const { email } = decoded;

  const activeUser = await User.isUserActive(email);

  if (!activeUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const jwtPayload: {
    userId: string;
    role: string;
    fullName: string;
    email: string;
  } = {
    fullName: activeUser?.fullName,
    email: activeUser.email,
    userId: activeUser?._id?.toString() as string,
    role: activeUser?.role,
  };

  const accessToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_access_secret as string,
    expity_time: config.jwt_access_expires_in as string,
  });

  return {
    accessToken,
  };
};

export const authServices = {
  login,
  changePassword,
  refreshToken,
};
