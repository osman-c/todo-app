import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3).max(24),
  password: z.string().min(8).max(24),
});

export type Register = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  username: z.string().min(3).max(24),
  password: z.string().min(8).max(24),
});

export type Login = z.infer<typeof loginSchema>;

export const todoUpdate = z.object({
  content: z.string(),
});

export type TodoUpdate = z.infer<typeof todoUpdate>;
