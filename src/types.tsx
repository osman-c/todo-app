import React from "react";
import { Todo } from "./server/schema";

export type Form<T> = React.FormEvent<HTMLFormElement>["target"] & {
  [K in keyof T]: { value: string };
};

export type SessionPayload = {
  id: number;
};

export type TodoPage = Pick<
  Todo,
  "id" | "content" | "attachment" | "attachmentEnum" | "attachmentName" | "tags"
>;

export type Optimistic<T> = T & { pending: boolean };

export type ServerError = { message: string };

export type Result<T> =
  | { data: T; error: undefined }
  | { data: undefined; error: ServerError };

export type SResult<T> = Promise<Result<T>>;
