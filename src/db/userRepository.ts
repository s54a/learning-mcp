import { User, IUser } from "../models/user.js";

export interface CreateUserInput {
  name: string;
  email: string;
  address: string;
  phone: string;
}

export async function getAllUsers(): Promise<IUser[]> {
  const users = await User.find({});
  return users;
}

export async function getUserById(userId: string): Promise<IUser | null> {
  return User.findOne({ id: Number(userId) });
}

export async function createUser(userData: CreateUserInput): Promise<number> {
  const lastUser = await User.findOne().sort({ id: -1 }).select({ id: 1 });

  const nextId = lastUser ? lastUser.id + 1 : 1;

  const user = new User({
    id: nextId,
    ...userData,
  });

  await user.save();
  return nextId;
}
