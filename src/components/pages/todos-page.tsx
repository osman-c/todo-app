"use client";

import { Button } from "../ui/button";
import React, {
  Reducer,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { Input } from "../ui/input";
import TodoDisplay from "../todo-display";
import { Optimistic, TodoPage } from "@/types";
import { createTodo } from "@/lib/todo-actions";

function arrayIncludes(arr1: string[], arr2: string[]) {
  for (const t of arr1) {
    if (arr2.includes(t)) return true;
  }
  return false;
}

export type TodosPageProps = {
  initialTodos: TodoPage[];
};

export type TodosReducerState = Optimistic<TodoPage>;

export type TodoAction =
  | {
      type: "OPTIMISTIC_ADD";
      payload: {
        content: string;
      };
    }
  | {
      type: "CANCEL_ADD";
      payload: undefined;
    }
  | {
      type: "OPTIMISTIC_EDIT" | "CANCEL_EDIT" | "FINISH_ADD";
      payload: Pick<TodoPage, "id" | "content">;
    }
  | {
      type:
        | "FINISH_EDIT"
        | "OPTIMISTIC_DELETE"
        | "FINISH_DELETE"
        | "CANCEL_DELETE"
        | "OPTIMISTIC_UPLOAD"
        | "CANCEL_UPLOAD"
        | "OPTIMISTIC_ASSET_DELETE"
        | "FINISH_ASSET_DELETE"
        | "FINISH_TAG_EDIT";
      payload: {
        id: number;
      };
    }
  | {
      type: "FINISH_UPLOAD" | "CANCEL_ASSET_DELETE";
      payload: Pick<
        TodoPage,
        "id" | "attachmentEnum" | "attachment" | "attachmentName"
      >;
    }
  | {
      type: "OPTIMISTIC_TAG_EDIT" | "CANCEL_TAG_EDIT";
      payload: {
        id: number;
        tags: string[];
      };
    };

const reducer: Reducer<TodosReducerState[], TodoAction> = (state, action) => {
  switch (action.type) {
    case "OPTIMISTIC_ADD":
      state = [
        ...state,
        {
          content: action.payload.content,
          id: -1,
          pending: true,
          attachmentEnum: null,
          attachment: null,
          attachmentName: null,
          tags: [],
        },
      ];
      return state;

    case "FINISH_ADD":
      state[state.length - 1] = {
        content: action.payload.content,
        id: action.payload.id,
        pending: false,
        attachmentEnum: null,
        attachment: null,
        attachmentName: null,
        tags: [],
      };
      return state;

    case "CANCEL_ADD":
      state.pop();
      return state;

    case "OPTIMISTIC_EDIT":
      return state.map((s) =>
        s.id === action.payload.id
          ? { ...s, content: action.payload.content, pending: true }
          : s,
      );

    case "FINISH_EDIT":
      return state.map((s) =>
        s.id === action.payload.id ? { ...s, pending: false } : s,
      );

    case "CANCEL_EDIT":
      return state.map((s) =>
        s.id === action.payload.id
          ? { ...s, content: action.payload.content, pending: false }
          : s,
      );

    case "OPTIMISTIC_DELETE":
      return state.map((s) =>
        s.id === action.payload.id ? { ...s, pending: true } : s,
      );

    case "FINISH_DELETE":
      return state.filter((s) => s.id !== action.payload.id);

    case "CANCEL_DELETE":
      return state.map((s) =>
        s.id === action.payload.id ? { ...s, pending: false } : s,
      );

    case "OPTIMISTIC_UPLOAD":
      return state.map((s) =>
        s.id === action.payload.id ? { ...s, pending: true } : s,
      );

    case "FINISH_UPLOAD":
      return state.map((s) =>
        s.id === action.payload.id
          ? {
              ...s,
              pending: false,
              attachment: action.payload.attachment,
              attachmentEnum: action.payload.attachmentEnum,
            }
          : s,
      );

    case "CANCEL_UPLOAD":
      return state.map((s) =>
        s.id === action.payload.id ? { ...s, pending: false } : s,
      );

    case "OPTIMISTIC_ASSET_DELETE":
      return state.map((s) =>
        s.id === action.payload.id
          ? {
              ...s,
              pending: true,
              attachmentName: null,
              attachmentEnum: null,
              attachment: null,
            }
          : s,
      );

    case "FINISH_ASSET_DELETE":
      return state.map((s) =>
        s.id === action.payload.id ? { ...s, pending: false } : s,
      );

    case "CANCEL_ASSET_DELETE":
      return state.map((s) =>
        s.id === action.payload.id
          ? {
              ...s,
              pending: true,
              attachmentName: action.payload.attachmentName,
              attachmentEnum: action.payload.attachmentEnum,
              attachment: action.payload.attachment,
            }
          : s,
      );

    case "OPTIMISTIC_TAG_EDIT":
      console.log(action.payload.tags);
      return state.map((s) =>
        s.id === action.payload.id
          ? { ...s, tags: action.payload.tags, pending: true }
          : s,
      );

    case "FINISH_TAG_EDIT":
      return state.map((s) =>
        s.id === action.payload.id ? { ...s, pending: false } : s,
      );

    case "CANCEL_TAG_EDIT":
      return state.map((s) =>
        s.id === action.payload.id
          ? { ...s, tags: action.payload.tags, pending: false }
          : s,
      );

    default:
      console.error("???");
      return state;
  }
};

type SelectedTag = {
  tag: string;
  selected: boolean;
};

export default function TodosPage({ initialTodos }: TodosPageProps) {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const [todos, dispatch] = useReducer(
    reducer,
    initialTodos.map((t) => ({
      ...t,
      pending: false,
    })),
  );

  const [allTags, setAllTags] = useState<SelectedTag[]>(handleTags([]));
  const [filterValue, setFilterValue] = useState("");

  function handleTags(initial: SelectedTag[]) {
    const tags = initial.map((t) => t.tag);

    todos.forEach((todo) =>
      todo.tags?.forEach((tag) => {
        if (tags.includes(tag)) {
          return;
        }

        initial.push({ tag: tag, selected: false });
      }),
    );

    return initial;
  }

  const initialTags: SelectedTag[] = useMemo(() => {
    const arr: SelectedTag[] = [];
    initialTodos.forEach((todo) =>
      todo.tags.forEach((tag) => arr.push({ tag: tag, selected: false })),
    );
    return arr;
  }, [initialTodos]);

  useEffect(() => {
    const arr = initialTags;
    const mapped = initialTags.map((t) => t.tag);

    todos.forEach((todo) =>
      todo.tags.forEach((tag) => {
        if (mapped.includes(tag)) {
          return;
        }

        arr.push({ tag: tag, selected: false });
      }),
    );

    setAllTags(arr);
  }, [todos, initialTags, setAllTags]);

  async function handleCreateTodo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const content = value;
    setValue("");

    dispatch({ type: "OPTIMISTIC_ADD", payload: { content } });

    try {
      const todoList = await createTodo({ content });
      const newTodo = todoList[0];
      if (!newTodo) {
        dispatch({ type: "CANCEL_ADD", payload: undefined });
        return;
      }
      dispatch({ type: "FINISH_ADD", payload: { ...newTodo } });
    } catch (e) {
      dispatch({ type: "CANCEL_ADD", payload: undefined });
    } finally {
      setLoading(false);
    }
  }

  function handleFilterTags(index: number) {
    setAllTags((tags) =>
      tags.map((t, i) =>
        i === index ? { tag: t.tag, selected: !t.selected } : t,
      ),
    );
  }

  const filtered = useMemo(() => {
    const selectedTags = allTags.filter((t) => t.selected).map((t) => t.tag);

    return todos.filter((todo) => {
      if (selectedTags.length && !arrayIncludes(todo.tags, selectedTags)) {
        return false;
      }

      if (!todo.content.toLowerCase().includes(filterValue.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [allTags, todos, filterValue]);

  return (
    <div className="max-w-4xl px-4 py-4 md:py-10 mx-auto">
      <h1 className="text-4xl font-bold mb-8">TODOs</h1>
      {filtered.length === 0 ? (
        <p className="text-muted-foreground italic text-xl">
          {todos.length === 0
            ? "You have no todos yet. Create a todo"
            : "Your search was not found"}
        </p>
      ) : (
        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto p-1">
          {filtered.map((todo) => (
            <TodoDisplay key={todo.id} {...todo} dispatch={dispatch} />
          ))}
        </div>
      )}
      <form onSubmit={handleCreateTodo} className="flex gap-2 mt-4">
        <Input
          className="flex-1"
          placeholder="TODO content..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button type="submit" disabled={loading} variant={"outline"}>
          Create TODO
        </Button>
      </form>
      <div className="flex gap-8 mt-4">
        <div className="flex-1">
          <label
            className="text-lg text-muted-foreground"
            htmlFor="content-filter"
          >
            Filter content:
          </label>
          <Input
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            id="content-filter"
          />
        </div>
        <div className="flex-1">
          <span className="mb-4 text-lg text-muted-foreground">
            Filter tags:
          </span>
          <div className="flex gap-2 flex-wrap">
            {allTags.map((t, i) => (
              <Button
                key={i}
                className="h-6"
                variant={t.selected ? "default" : "outline"}
                onClick={() => handleFilterTags(i)}
              >
                {t.tag}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
