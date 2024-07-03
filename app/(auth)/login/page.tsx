"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/context/AuthContext";
import { access } from "fs";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const updateLogin = useUserStore((state: any) => state.updateLogin);
  const updateUser = useUserStore((state: any) => state.updateUser);
  const user = useUserStore((state: any) => state.user);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_FLASK_ENDPOINT}/login`, {
      method: "POST",
      // mode: 'no-cors',
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    updateLogin(true);
    updateUser({
      username: data.username,
      id: data.user_id,
      admin: data.isAdmin,
      accessToken: data.token,
    });
    localStorage.setItem("accessToken", data.token);
    router.push("/");
  };

  return (
    <div className="mx-auto w-full max-w-[400px] shadow-lg border-2 rounded-lg">
      <div className="text-center px-2 py-1">
        <p className="text-xl font-semibold">Login</p>
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <div>
            <input type="submit" value="Login" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
