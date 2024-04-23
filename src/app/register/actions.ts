"use server";

import { db } from "@/server/db";
import { users } from "@/server/schema";
import { Register, registerSchema as registerSchema } from "@/zod";
import bcrypt from "bcrypt";

export async function register(formData: Register) {
  const parsed = registerSchema.safeParse(formData);
  if (parsed.error) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "validation error",
    };
  }

  const {
    data: { password, username },
  } = parsed;

  try {
    const salt = 10;
    const hashed = await bcrypt.hash(password, salt);

    await db.insert(users).values({ password: hashed, username: username });
    return { password, username };
  } catch (e) {
    return { message: "something wrong" };
  }
}
