import { User, IUser } from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken, verifyToken, TokenPayload } from '../utils/jwt.js';
import { ROLE_PERMISSIONS } from '../config/constants.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';

export interface AuthResult {
  user: Record<string, unknown>;
  token: string;
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const passwordHash = await hashPassword(input.password);

  const user = await User.create({
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    passwordHash,
    phone: input.phone,
    role: input.role || 'CITIZEN',
  });

  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    user: user.toSafeObject(),
    token,
  };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isValid = await comparePassword(input.password, user.passwordHash);
  if (!isValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    user: user.toSafeObject(),
    token,
  };
}

export async function getUserFromToken(token: string): Promise<Record<string, unknown>> {
  const payload = verifyToken(token);
  const user = await User.findById(payload.userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }
  return user.toSafeObject();
}

export async function updateUserProfile(
  userId: string,
  updates: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const user = await User.findByIdAndUpdate(userId, updates, { new: true });
  if (!user) {
    throw new AppError('User not found.', 404);
  }
  return user.toSafeObject();
}

export function getUserPermissions(role: string): string[] {
  return ROLE_PERMISSIONS[role] || [];
}

class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}
