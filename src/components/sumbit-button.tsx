"use client";

import { ReactNode } from "react";
import { useFormStatus } from "react-dom";

export type SubmitButtonProps = {
  children: ReactNode;
  className?: string;
};

export default function SubmitButton({
  children,
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {children}
    </button>
  );
}
