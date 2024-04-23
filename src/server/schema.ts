import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  pgEnum,
  json,
} from "drizzle-orm/pg-core";

export const attachmentEnum = pgEnum("attachment_enum", ["image", "other"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  user: integer("user")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull().default(""),
  attachment: text("attachment"),
  attachmentName: text("attachment_name"),
  attachmentEnum: attachmentEnum("attachment_enum"),
  tags: json("tags").default([]).notNull().$type<string[]>(),
});

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
