"use client";
import { useUserStore } from "@/context/AuthContext";
import React from "react";

export default function Profile() {
  const updateUser = useUserStore((state: any) => state.updateUser);
  const user = useUserStore((state: any) => state.user);

  return (
    <div className="w-full ">
      <div className="w-full px-5 py-2">
        <h1 className="font-semibold text-xl">Profile</h1>
        <p>
          Username: <span className="font-semibold">{user.username}</span>
        </p>
      </div>
    </div>
  );
}
