"use server";

import { db } from "@/server/db";
import { todos } from "@/server/schema";
import { getSession } from "./auth";
import { TodoPage } from "@/types";
import { and, eq } from "drizzle-orm";
import path from "path";
import fs from "fs";
import { glob } from "glob";

async function checkUser() {
  const userId = await getSession();
  if (!userId) throw { message: "You must be logged in" };
  return userId;
}

export async function createTodo({ content }: { content: string }) {
  const userId = await checkUser();

  const todoList = (await db
    .insert(todos)
    .values({ user: userId, content })
    .returning({
      id: todos.id,
      content: todos.content,
      attachment: todos.attachment,
      attachmentEnum: todos.attachmentEnum,
      attachmentName: todos.attachmentName,
      tags: todos.tags,
    })) satisfies TodoPage[];
  return todoList;
}

export async function deleteTodo({ id }: { id: number }) {
  const userId = await checkUser();

  await deleteItems(userId, id);
  await db.delete(todos).where(and(eq(todos.user, userId), eq(todos.id, id)));
}

export async function editTodo({
  id,
  content,
}: Pick<TodoPage, "id" | "content">) {
  const userId = await checkUser();

  await db
    .update(todos)
    .set({ content })
    .where(and(eq(todos.user, userId), eq(todos.id, id)));
}

function getFileName(userId: number, todoId: number, extension?: string) {
  if (!extension) return `${userId}-${todoId}`;
  return `${userId}-${todoId}.${extension}`;
}

function joinCwd(str: string) {
  return path.join(process.cwd(), str);
}

async function deleteItems(userId: number, todoId: number) {
  const existingFiles = await glob(`public/user/${userId}-${todoId}*`);

  const promises = existingFiles.map(async (fp) => fs.promises.rm(fp));
  await Promise.all(promises);
}

const imageExtensions = ["jpg", "jpeg", "png", "gif"];

export async function upsertFile({
  id,
  formData,
}: {
  id: number;
  formData: FormData;
}) {
  const userId = await checkUser();

  const file = formData.get("file") as File;
  const attachmentName = file.name;
  const extension = file.name.split(".").pop();

  await deleteItems(userId, id);

  const filename = getFileName(userId, id, extension);
  const filepath = "public/user/" + filename;

  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.promises.writeFile(joinCwd(filepath), buffer);

  const isImage = imageExtensions.includes(extension || "");
  const todoList = await db
    .update(todos)
    .set({
      attachment: `/user/${userId}-${id}.${extension}`,
      attachmentEnum: isImage ? "image" : "other",
      attachmentName,
    })
    .where(and(eq(todos.id, id), eq(todos.user, userId)))
    .returning({
      attachment: todos.attachment,
      attachmentEnum: todos.attachmentEnum,
      attachmentName: todos.attachmentName,
    });

  return {
    ...todoList[0],
  };
}

export async function deleteFile({ id }: { id: number }) {
  const userId = await checkUser();
  await deleteItems(userId, id);

  await db
    .update(todos)
    .set({ attachment: null, attachmentEnum: null, attachmentName: null })
    .where(and(eq(todos.id, id), eq(todos.user, userId)));
}

export async function setTag({ id, tags }: { id: number; tags: string[] }) {
  const userId = await checkUser();

  await db
    .update(todos)
    .set({ tags })
    .where(and(eq(todos.id, id), eq(todos.user, userId)));
}
