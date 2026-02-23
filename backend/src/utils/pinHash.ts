import bcrypt from "bcryptjs";

export const hashPin = async (pin: string) => {
  return bcrypt.hash(pin, 10);
};

export const comparePin = async (
  pin: string,
  hash: string
) => {
  return bcrypt.compare(pin, hash);
};