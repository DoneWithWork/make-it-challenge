"use client";
import { Report } from "@/lib/types";
import { baseApiUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React, { cache, useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

const SingleReport = ({
  params,
}: {
  params: {
    id: string;
  };
}) => {
  const [theReport, setReport] = useState<Report>();
  const [status, setStatus] = useState("pending");
  const router = useRouter();

  useEffect(() => {
    async function GetReport() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
      }
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_FLASK_ENDPOINT}/report/${params.id}`,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
            credentials: "include",
            method: "GET",
          }
        );
        const data = await res.json();
        setReport(data);
        setStatus(data.status);
      } catch (error) {
        console.log(error);
        alert("Error fetching report");
      }
    }
    GetReport();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
    }
    try {
      const res = await fetch(`${baseApiUrl}/report/${params.id}`, {
        method: "POST",
        body: JSON.stringify({ status: status }),
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();

      console.log("Status updated:", data);
      alert("Status updated successfully");
      router.push("/reports");
    } catch (error) {
      alert("Error updating status");
    }
  };

  return (
    <div className="max-h-[500px]">
      {theReport && (
        <form onSubmit={handleSubmit}>
          <div>
            <p className="font-bold text-xl">{theReport.title}</p>
            <p className="text-foreground">{theReport.description}</p>
            <p
              className={`bg-yellow-300 absolute right-5 top-2 rounded-lg px-2 py-1`}
            >
              {theReport.urgency}
            </p>
            <p>{new Date(theReport.timestamp).toLocaleString()}</p>
            <div>
              <label htmlFor="status">Status:</label>
              <select
                name="status"
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-blue-200 shadow-xl px-2 py-1 rounded-xl m-3"
              >
                <option value="pending">Pending</option>
                <option value="solving">Solving</option>
                <option value="solved">Solved</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-xl"
            >
              Update Status
            </button>
          </div>
          <div className="flex flex-col items-center">
            {theReport.image_filename && (
              <Image
                src={`${process.env.NEXT_PUBLIC_FLASK_ENDPOINT}static/uploads/${theReport.image_filename}`}
                alt={theReport.title}
                width="300"
                height={"100"}
              />
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default SingleReport;
