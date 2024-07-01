"use client";
import React, { useEffect, useState } from "react";
import { House, CircleUser, CirclePlus, LogOut, LogIn, UserPlus, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { isMobile } from "react-device-detect";

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
    path: "/admin",
  },
];

const Navbar = () => {
  const [mobile, setMobile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fetchLoginStatus = async () => {
      const res = await fetch('http://localhost:8080/api/getIsLoggedIn', {credentials: 'include'});//, {mode: 'no-cors'});
      const data = await res.json();
      setIsLoggedIn(data.isLoggedIn);
      setIsAdmin(data.isAdmin);
    };
    fetchLoginStatus();
    setMobile(isMobile);
  }, []);

  const logout = async () => {
    await fetch('/api/logout', {
      // mode: 'no-cors',
      credentials: 'include',
      method: 'POST',
    });
    window.location.href = '/';
  };

  return mobile ? (
    <nav className="border-t-2 border-black flex flex-row items-center justify-between">
      {nav.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;
        // Only show admin link if user is admin
        if (item.title === 'Admin' && !isAdmin) return null;
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
      {isLoggedIn ? (
        <div>
          <button onClick={logout} className="p-4 flex flex-col items-center text-gray-500">
            <LogOut size={24} />
            <p>Logout</p>
          </button>
          <Link href="/report" className="p-4 flex flex-col items-center text-gray-500">
            <UserPlus size={24} />
            <p>Upload</p>
          </Link>
        </div>
      ) : (
        <div>
          <Link href="/login" className="p-4 flex flex-col items-center text-gray-500">
            <LogIn size={24} />
            <p>Login</p>
          </Link>

          <Link href="/register" className="p-4 flex flex-col items-center text-gray-500">
            <UserPlus size={24} />
            <p>Register</p>
          </Link>
          
        </div>
      )}
    </nav>
  ) : (
    <></>
  );
};

export default Navbar;
