import { Paperclip } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import { Todo } from "@/server/schema";

type AttachmentProps = {
  attachment: string;
  attachmentEnum: Todo["attachmentEnum"];
  attachmentName: string;
  onDelete: () => void;
};

export default function Attachment({
  attachment,
  attachmentEnum,
  attachmentName,
  onDelete,
}: AttachmentProps) {
  return (
    <div>
      <div className="h-36 relative flex">
        {attachmentEnum === "other" ? (
          <Paperclip size={72} className="m-auto" />
        ) : (
          <Image
            src={attachment}
            alt={attachmentName}
            fill
            objectFit="contain"
            className="rounded"
          />
        )}
      </div>
      <div className="left-0 right-0 bottom-0 flex px-2 ">
        <Button size="sm" variant="ghost" asChild className="flex-1">
          <a href={attachment} download={attachmentName}>
            Download
          </a>
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete} className="flex-1">
          Delete
        </Button>
      </div>
    </div>
  );
}
