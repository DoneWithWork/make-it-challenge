"use client";
import { useUserStore } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { report } from "process";
import React, { useEffect, useState } from "react";

interface Report {
  id: number;
  title: string;
  description: string;
  location: string;
  name: string;
  tags: string;
  urgency: string;
  severity: string;
  status: string;
  timestamp: string;
  image_filename: File | null;
}

export default function Admin() {
  const [reports, setReports] = useState<Report[]>([]);
  const updateUser = useUserStore((state: any) => state.updateUser);
  const user = useUserStore((state: any) => state.user);
  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:8080/admin", {
        credentials: "include",
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      }); //, {mode: 'no-cors'});
      const data = await res.json();
      console.log(data);

      setReports(data);
    };
    console.log(user.accessToken);
    fetchReports();
  }, []);

  return (
    <div className=" bg-gray-100 max-w-[800px] max-h-[500px] flex flex-col gap-10 ">
      <p className="text-xl font-semibold">Admin</p>

      {reports.map((report, index) => (
        <Link
          className="w-full px-2 relative bg-gray-400 shadow-lg cursor-pointer flex flex-col border-2 rounded-lg"
          key={index}
          href={`/reports/${report.id}`}
        >
          <p className="font-bold text-xl">{report.title}</p>
          <p className="text-foreground">{report.description}</p>
          <p
            className={`bg-yellow-300 absolute right-5 top-2 rounded-lg px-2 py-1`}
          >
            {report.urgency}
          </p>
          <p>{new Date(report.timestamp).toLocaleString()}</p>
          <div className="flex flex-col items-center">
            {report.image_filename && (
              <Image
                src={`http://localhost:8080/static/uploads/${report.image_filename}`}
                alt={report.title}
                width="300"
                height={"100"}
              />
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
