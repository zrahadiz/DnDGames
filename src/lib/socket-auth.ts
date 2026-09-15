import { SignJWT, jwtVerify } from "jose";

const getSecret = () => {
  const secret = process.env.SOCKET_AUTH_SECRET;

  if (!secret) {
    throw new Error("SOCKET_AUTH_SECRET is missing");
  }

  return new TextEncoder().encode(secret);
};

export async function createSocketToken(
  userId: string,
  type: "guest" | "registered",
) {
  return new SignJWT({ type })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getSecret());
}

export async function verifySocketToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());

  if (!payload.sub) {
    throw new Error("Invalid socket token");
  }

  if (payload.type !== "guest" && payload.type !== "registered") {
    throw new Error("Invalid user type");
  }

  return {
    type: payload.type,
    userId: payload.sub,
  };
}
