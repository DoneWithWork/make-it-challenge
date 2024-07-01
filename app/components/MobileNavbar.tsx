"use client";
import React, { useEffect, useState } from "react";
import {
  House,
  CircleUser,
  CirclePlus,
  LogOut,
  LogIn,
  UserPlus,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { isMobile } from "react-device-detect";
import { useUserStore } from "@/context/AuthContext";

const nav = [
  {
    title: "Home",
    icon: House,
    path: "/",
  },
  {
    title: "Profile",
    icon: CircleUser,
    path: "/profile",
  },
  {
    title: "Admin",
    icon: Users,
    path: "/reports",
  },
];

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [Mobile, setIsMobile] = useState(false);
  const loggedIn = useUserStore((state: any) => state.loggedIn);
  const isAdmin = useUserStore((state: any) => state.user.admin);
  const updateLogin = useUserStore((state: any) => state.updateLogin);
  const updateUser = useUserStore((state: any) => state.updateUser);
  const user = useUserStore((state: any) => state.user);
  const sub = useUserStore.subscribe(console.log);
  useEffect(() => {
    // const fetchLoginStatus = async () => {
    //   try {
    //     const res = await fetch("http://localhost:8080/api/getIsLoggedIn", {
    //       credentials: "include",
    //     });
    //     const data = await res.json();

    //     updateLogin({
    //       loggedIn: data.isLoggedIn,
    //     });
    //     updateUser({
    //       admin: data.isAdmin,
    //       username: data.user,
    //     });
    //   } catch (error) {
    //     console.error("Failed to fetch login status:", error);
    //   }
    // };
    // fetchLoginStatus();
    setIsMobile(isMobile);
  });

  const logout = async () => {
    try {
      await fetch("http://localhost:8080/api/logout", {
        credentials: "include",
        method: "POST",
      });
      updateLogin({ loggedIn: false });
      updateUser({ admin: false, username: "" });
      router.push("/");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };
  console.log(loggedIn);
  return Mobile ? (
    <nav className="border-t-2 border-black flex flex-row items-center justify-between">
      {nav.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;
        if (item.title === "Admin" && !isAdmin) return null;
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
      {loggedIn == true ? (
        <div>
          <button
            onClick={logout}
            className="p-4 flex flex-col items-center text-gray-500"
          >
            <LogOut size={24} />
            <p>Logout</p>
          </button>
          <Link
            href="/report"
            className="p-4 flex flex-col items-center text-gray-500"
          >
            <CirclePlus size={24} />
            <p>Upload</p>
          </Link>
        </div>
      ) : (
        <div>
          <Link
            href="/login"
            className="p-4 flex flex-col items-center text-gray-500"
          >
            <LogIn size={24} />
            <p>Login</p>
          </Link>

          <Link
            href="/register"
            className="p-4 flex flex-col items-center text-gray-500"
          >
            <UserPlus size={24} />
            <p>Register</p>
          </Link>
        </div>
      )}
    </nav>
  ) : (
    <div>
      <h1>On desktop</h1>
    </div>
  );
};

export default Navbar;
