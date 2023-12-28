import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const secret = process.env.JWT_KEY || "";

export const signToken = (payload) => {
  const iat = Math.floor(Date.now() / 1000) - 60;
  const exp = Math.floor(Date.now() / 1000) + 180;
  const jti = uuidv4();

  const token = jwt.sign(
    {
      ...payload,
      iat,
      exp,
      scope: payload.method === "GET" ? "read:service" : "write:service",
      jti,
    },
    secret
  );

  return token;
};

export const verifyToken = (token) => {
  token = token.replace("Bearer", "").trim();
  return jwt.verify(token, secret);
};
