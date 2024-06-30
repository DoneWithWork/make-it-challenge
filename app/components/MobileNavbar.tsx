"use client";
import React from "react";
import { House, CircleUser } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const nav = [
  {
    title: "Home",
    icon: House,
    path: "/", // Add the path for each item
  },
  {
    title: "Profile",
    icon: CircleUser,
    path: "/profile",
  },
];

export default function MobileNavbar() {
  const pathname = usePathname();
  return (
    <nav className="border-t-2 border-black  flex flex-row items-center justify-between">
      {nav.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;
        return (
          <Link
            href={item.path}
            key={item.title}
            className={`p-4 flex flex-col items-center ${
              isActive ? "text-blue-500" : "text-gray-500"
            }`}
          >
            <Icon size={24} />
            <p>{item.title}</p>
          </Link>
        );
      })}
    </nav>
  );
}
