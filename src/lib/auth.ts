import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { type SessionPayload } from "@/types";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET!;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch (error) {
    console.error("Failed to verify session");
  }
}

export async function getSession() {
  const cookie = cookies().get("session")?.value;
  const payload = await decrypt(cookie);
  if (payload?.id) {
    return payload.id;
  }
}
