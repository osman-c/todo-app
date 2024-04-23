import TodosPage from "@/components/pages/todos-page";
import { getSession } from "@/lib/auth";
import { db } from "@/server/db";
import { todos } from "@/server/schema";
import { eq } from "drizzle-orm";

async function getData() {
  const id = await getSession();
  if (!id) {
    return {
      error: "User must be logged in to see this page",
    };
  }
  try {
    const todosList = await db
      .select({
        id: todos.id,
        content: todos.content,
        attachmentEnum: todos.attachmentEnum,
        attachment: todos.attachment,
        attachmentName: todos.attachmentName,
        tags: todos.tags,
      })
      .from(todos)
      .where(eq(todos.user, id))
      .orderBy(todos.createdAt);
    return { todos: todosList };
  } catch (e) {
    return {
      error: (e as { message: string }).message,
    };
  }
}

export default async function Page() {
  const res = await getData();
  if (!res.todos) return <p>{res.error}</p>;
  return <TodosPage initialTodos={res.todos} />;
}
