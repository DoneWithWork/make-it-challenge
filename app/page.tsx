"use client";
import { useUserStore } from "@/context/AuthContext";
import { Report } from "@/lib/types";
import { baseApiUrl } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Home() {
  const user = useUserStore((state: any) => state.user);
  const [reports, setReports] = useState<Report[]>([]);
  const router = useRouter();
  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_FLASK_ENDPOINT}/user/reports`,
          {
            credentials: "include",
            method: "GET",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        ); //, {mode: 'no-cors'});\

        const data = await res.json();
        console.log(data);

        setReports(data);
      } catch (error) {
        console.log(error);
        setReports([]);
      }
    };

    fetchReports();
  }, []);
  return (
    <div className="px-2 py-2">
      <h1 className="text-2xl font-semibold">Welcome {user?.username}</h1>
      <p className="mt-2 font-semibold">Your reports</p>
      {reports.length === 0 && <p>No reports. Please login</p>}
      {reports.length > 0 &&
        reports.map((report, index) => (
          <div key={index}>
            <p className="font-bold text-xl">{report.title}</p>
            <p className="text-foreground">{report.description}</p>
            <p
              className={`bg-yellow-300 absolute right-5 top-2 rounded-lg px-2 py-1`}
            >
              {report.urgency}
            </p>

            <p>{new Date(report.timestamp).toLocaleString()}</p>
            <div>
              <p className="bg-blue-300 inline-block px-2 py-1 rounded-xl shadow-xl m-2">
                {report.status}
              </p>
            </div>
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
          </div>
        ))}
    </div>
  );
}
