"use client";
import { useUserStore } from "@/context/AuthContext";
import React from "react";
import {
  BrowserView,
  MobileView,
  isBrowser,
  isMobile,
} from "react-device-detect";

export default function Home() {
  const user = useUserStore((state: any) => state.user);
  return (
    <div className="px-2 py-2">
      <h1>WElcome</h1>
      <p>Added mobile</p>
      <p>{user.username}</p>
    </div>
  );
}
