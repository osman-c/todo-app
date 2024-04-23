"use server";

import { db } from "@/server/db";
import { users } from "@/server/schema";
import { Login, Register, loginSchema, registerSchema } from "@/zod";
import { encrypt } from "./auth";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { ServerError } from "@/types";

async function createSession(userId: number) {
  const session = await encrypt({ id: userId });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  cookies().set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    path: "/",
    sameSite: "lax",
  });
}

export async function login(data: Login) {
  const parsed = loginSchema.safeParse(data);
  if (parsed.error) {
    return { message: "Bad request" };
  }

  const { username, password } = parsed.data;

  const userList = await db
    .select()
    .from(users)
    .where(eq(users.username, username));

  if (!userList.length) {
    return { error: { message: "User not found" } };
  }

  const user = userList[0];

  const matches = await bcrypt.compare(password, user.password);

  if (!matches) {
    return { error: { message: "Wrong password" } };
  }

  await createSession(user.id);
  return { data: "Success" };
}

export async function register(data: Register) {
  const parsed = registerSchema.safeParse(data);
  if (parsed.error) {
    return { message: "Bad request" };
  }

  const {
    data: { password, username },
  } = parsed;

  const salt = 10;
  const hashed = await bcrypt.hash(password, salt);

  try {
    const usersList = await db
      .insert(users)
      .values({ password: hashed, username: username })
      .returning({ id: users.id });

    await createSession(usersList[0].id);
    return {
      data: "Success",
    };
  } catch (e) {
    return { error: { message: (e as ServerError).message } };
  }
}
