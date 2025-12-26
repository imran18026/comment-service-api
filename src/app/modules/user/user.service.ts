// eslint-disable-next-line @typescript-eslint/no-explicit-any
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { DeleteAccountPayload, TUser, TUserCreate } from './user.interface';
import { User } from './user.models';
import { USER_ROLE } from './user.constants';
import QueryBuilder from '../../builder/QueryBuilder';

export type IFilter = {
  searchTerm?: string;
  [key: string]: any;
};

const createUser = async (payload: TUserCreate) => {
  const { email, fullName, password } = payload;
  const role = USER_ROLE.USER;

  // user exist check
  const userExist = await User.isUserExist(email);

  if (userExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'User already exists with this email',
    );
  }

  const userData = {
    password,
    email,
    fullName,
    role,
  };

  const user = await User.create(userData);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User creation failed');
  }

  return user;
};

const updateUser = async (id: string, payload: Partial<TUser>) => {
  const { role, email, ...rest } = payload;

  const user = await User.findByIdAndUpdate(id, rest, { new: true });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User updating failed');
  }

  return user;
};

// ............................rest

const getAllUserQuery = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(User.find({}), query)
    .search([''])
    .filter([''])
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();
  return { meta, result };
};

const getAllUserCount = async () => {
  const allUserCount = await User.countDocuments();
  return allUserCount;
};

const getAllUserRatio = async (year: number) => {
  const startOfYear = new Date(year, 0, 1); // January 1st of the given year
  const endOfYear = new Date(year + 1, 0, 1); // January 1st of the next year

  // Create an array with all 12 months to ensure each month appears in the result
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    userCount: 0, // Default count of 0
  }));

  const userRatios = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfYear,
          $lt: endOfYear,
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' }, // Group by month (1 = January, 12 = December)
        userCount: { $sum: 1 }, // Count users for each month
      },
    },
    {
      $project: {
        month: '$_id', // Rename the _id field to month
        userCount: 1,
        _id: 0,
      },
    },
    {
      $sort: { month: 1 }, // Sort by month in ascending order (1 = January, 12 = December)
    },
  ]);

  // Merge the months array with the actual data to ensure all months are included
  const fullUserRatios = months.map((monthData) => {
    const found = userRatios.find((data) => data.month === monthData.month);
    return found ? found : monthData; // Use found data or default to 0
  });
  return fullUserRatios;
};

const getUserById = async (id: string) => {
  const result = await User.findById(id);
  console.log(result);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  return result;
};

const getUserByEmail = async (email: string) => {
  const result = await User.findOne({ email });

  return result;
};

const deleteMyAccount = async (id: string, payload: DeleteAccountPayload) => {
  const user: TUser | null = await User.IsUserExistById(id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user?.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted');
  }

  if (!(await User.isPasswordMatched(payload.password, user.password))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password does not match');
  }

  const userDeleted = await User.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!userDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'user deleting failed');
  }

  return userDeleted;
};

const blockedUser = async (id: string) => {
  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  );

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'user deleting failed');
  }

  return user;
};

export const userService = {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteMyAccount,
  blockedUser,
  getAllUserQuery,
  getAllUserCount,
  getAllUserRatio,
};
