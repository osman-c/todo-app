import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { TodoAction, TodosReducerState } from "./pages/todos-page";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  deleteFile,
  deleteTodo,
  editTodo,
  setTag,
  upsertFile,
} from "@/lib/todo-actions";
import Attachment from "./attachment";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { DropdownMenuItem } from "./ui/dropdown-menu";

export type TodoDisplayProps = TodosReducerState & {
  dispatch: React.Dispatch<TodoAction>;
};

export default function TodoDisplay({
  id,
  content,
  attachmentEnum,
  attachment,
  attachmentName,
  tags,
  pending,
  dispatch,
}: TodoDisplayProps) {
  const [editing, setEditing] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  const [value, setValue] = useState(content);
  const [tagValue, setTagValue] = useState("");

  const uploader = useRef<null | HTMLInputElement>(null);

  async function handleDelete() {
    dispatch({ type: "OPTIMISTIC_DELETE", payload: { id } });

    try {
      await deleteTodo({ id });
      dispatch({ type: "FINISH_DELETE", payload: { id } });
    } catch (e) {
      dispatch({ type: "CANCEL_DELETE", payload: { id } });
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const file = e.target.files[0];
      dispatch({ type: "OPTIMISTIC_UPLOAD", payload: { id } });

      const formData = new FormData();
      formData.append("file", file);

      try {
        const { attachmentEnum, attachment, attachmentName } = await upsertFile(
          {
            id,
            formData,
          },
        );
        dispatch({
          type: "FINISH_UPLOAD",
          payload: { id, attachment, attachmentEnum, attachmentName },
        });
      } catch (e) {
        dispatch({
          type: "CANCEL_UPLOAD",
          payload: { id },
        });
      }

      return;
    }

    console.error("No files were uploaded");
  }

  async function handleAttachmentDelete() {
    const clone = {
      attachment,
      attachmentEnum,
      attachmentName,
    };
    dispatch({ type: "OPTIMISTIC_ASSET_DELETE", payload: { id } });

    try {
      await deleteFile({ id });
      dispatch({ type: "FINISH_ASSET_DELETE", payload: { id } });
    } catch (e) {
      dispatch({ type: "CANCEL_ASSET_DELETE", payload: { id, ...clone } });
    }
  }

  async function handleEdit() {
    const oldContent = content;
    const newContent = value;

    dispatch({ type: "OPTIMISTIC_EDIT", payload: { content: newContent, id } });
    setEditing(false);

    try {
      await editTodo({ id, content: newContent });
      dispatch({ type: "FINISH_EDIT", payload: { id } });
    } catch (e) {
      dispatch({ type: "CANCEL_EDIT", payload: { id, content: oldContent } });
    }
  }

  async function handleAddTag() {
    const alreadyHas = tags.includes(tagValue);
    if (alreadyHas) {
      setTagValue("");
      setAddingTag(false);
      return;
    }

    const oldTags = [...tags];
    const newTags = [...tags, tagValue];
    setAddingTag(false);
    setTagValue("");
    dispatch({ type: "OPTIMISTIC_TAG_EDIT", payload: { id, tags: newTags } });

    try {
      await setTag({ id, tags: newTags });
      dispatch({ type: "FINISH_TAG_EDIT", payload: { id } });
    } catch (e) {
      dispatch({ type: "CANCEL_TAG_EDIT", payload: { id, tags: oldTags } });
    }
  }

  async function handleDeleteTag(index: number) {
    const oldTags = [...tags];
    const newTags = tags.filter((_tag, i) => i !== index);

    dispatch({ type: "OPTIMISTIC_TAG_EDIT", payload: { id, tags: newTags } });

    try {
      await setTag({ id, tags: newTags });
      dispatch({ type: "FINISH_TAG_EDIT", payload: { id } });
    } catch (e) {
      dispatch({ type: "CANCEL_TAG_EDIT", payload: { id, tags: oldTags } });
    }
  }

  return (
    <div className={cn(pending && "opacity-50 bg-muted", "rounded")}>
      {editing || addingTag ? (
        <div className="flex gap-2">
          {editing ? (
            <Input
              autoFocus
              placeholder="Content..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEdit()}
              className="flex-1"
            />
          ) : (
            <Input
              autoFocus
              placeholder="New tag..."
              value={tagValue}
              onChange={(e) => setTagValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              className="flex-1"
            />
          )}
          <div className="flex gap-2">
            <Button
              onClick={() => (editing ? handleEdit() : handleAddTag())}
              variant="outline"
              className="min-w-20"
              disabled={pending}
            >
              Submit
            </Button>
            <Button
              onClick={() =>
                editing ? setEditing(false) : setAddingTag(false)
              }
              variant="outline"
              className="min-w-20"
              disabled={pending}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid items-center todo-grid gap-x-2">
          <div>
            {attachment ? (
              <Attachment
                attachment={attachment}
                attachmentEnum={attachmentEnum}
                attachmentName={attachmentName || "Attachment"}
                onDelete={handleAttachmentDelete}
              />
            ) : (
              <span className="text-xl text-muted-foreground">
                NO ATTACHMENT
              </span>
            )}
          </div>
          <span className={cn(!content && "text-xl text-muted-foreground")}>
            {content ? content : "EMPTY"}
          </span>
          <div>
            {tags.length === 0 ? (
              <span className="text-xl text-muted-foreground">NO TAGS</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((t, i) => (
                  <DropdownMenu key={i}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="text-sm rounded flex px-2 h-6"
                        size="sm"
                        variant="outline"
                      >
                        {t}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mt-2 bg-background rounded">
                      <DropdownMenuItem onClick={() => handleDeleteTag(i)}>
                        Delete tag
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditing(true)}>
                        Add to filter
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                    <input
                      hidden
                      type="file"
                      ref={uploader}
                      onChange={handleUpload}
                    />
                  </DropdownMenu>
                ))}
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background rounded mt-2">
              <DropdownMenuItem onClick={() => uploader.current?.click()}>
                Upload attachment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditing(true)}>
                Edit content
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAddingTag(true)}>
                Add tag
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete()}>
                Delete TODO
              </DropdownMenuItem>
            </DropdownMenuContent>
            <input hidden type="file" ref={uploader} onChange={handleUpload} />
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
