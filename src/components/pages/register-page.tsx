"use client";

import React from "react";
import { Register, registerSchema } from "@/zod";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMainMessage,
  FormMessage,
} from "@/components/ui/form";
import FormWrapper from "@/components/form-wrapper";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth-actions";
import Link from "next/link";

const initialState = {
  username: "",
  password: "",
} satisfies Register;

export default function RegisterPage() {
  const router = useRouter();

  const form = useForm<Register>({
    resolver: zodResolver(registerSchema),
    defaultValues: initialState,
  });

  async function handleSubmit({ username, password }: Register) {
    const { error } = await register({ username, password });

    if (error) {
      form.setError("root", { message: error.message });
      return;
    }

    setTimeout(() => router.push("/"), 200);
  }

  return (
    <FormWrapper>
      <h1 className="text-4xl mb-8">Register</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="Password" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormMainMessage />
          <Button type="submit" className="mt-4" variant="outline">
            Submit
          </Button>
          <Link href="/login" className="text-muted-foreground">
            Have an account? Log in
          </Link>
        </form>
      </Form>
    </FormWrapper>
  );
}
