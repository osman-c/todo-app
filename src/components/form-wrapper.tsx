import { ReactNode } from "react";

export type FormWrapperProps = {
  children: ReactNode;
};

export default function FormWrapper({ children }: FormWrapperProps) {
  return <div className="max-w-2xl px-4 py-4 md:py-10 mx-auto">{children}</div>;
}
