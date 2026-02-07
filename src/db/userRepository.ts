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
  const user = await User.findById(userId);
  return user;
}

export async function createUser(userData: CreateUserInput): Promise<string> {
  const user = new User(userData);
  const savedUser = await user.save();
  return savedUser._id.toString();
}
