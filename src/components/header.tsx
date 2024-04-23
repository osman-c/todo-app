"use client";

import { logOff } from "@/app/actions";
import Link from "next/link";

export type HeaderType = {
  isLoggedIn: boolean;
};

export default function Header({ isLoggedIn }: HeaderType) {
  return (
    <div className="py-4 border-b">
      <div className="max-w-4xl flex justify-between items-center px-4 mx-auto text-lg">
        {isLoggedIn ? (
          <>
            <Link href="/">TODOs</Link>
            <button onClick={() => logOff()}>Log off</button>
          </>
        ) : (
          <>
            <div></div>
            <div className="flex gap-4">
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
