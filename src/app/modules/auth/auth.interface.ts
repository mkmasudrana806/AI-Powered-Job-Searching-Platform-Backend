// user login type
export type TLoginUser = {
  email: string;
  password: string;
};

export type TJwtPayload = {
  userId: string;
  role: string;
};
