"use client";
import { useUserStore } from "@/context/AuthContext";
import { Report } from "@/lib/types";
import { baseApiUrl } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";

export default function Home() {
  const [Mobile, setIsMobile] = useState(false);
  const user = useUserStore((state: any) => state.user);
  const [reports, setReports] = useState<Report[]>([]);
  const router = useRouter();
  useEffect(() => {
    setIsMobile(isMobile);

    const fetchReports = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_FLASK_ENDPOINT}user/reports`,
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
      {isMobile ? (
        <>
          <h1 className="text-2xl font-semibold">Welcome {user?.username}</h1>
          <p className="mt-2 font-semibold">Your reports</p>
          {reports.length === 0 && <p>No reports. Please login</p>}
          {reports.length > 0 &&
            reports.map((report, index) => (
              <div key={index} className="relative">
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
                      src={`${process.env.NEXT_PUBLIC_FLASK_ENDPOINT}static/uploads/${report.image_filename}`}
                      alt={report.title}
                      width="300"
                      height={"100"}
                    />
                  )}
                </div>
              </div>
            ))}
        </>
      ) : (
        <div className="mt-10 w-[40rem] m-10">
          <h1 className="font-bold text-4xl text-green-400">
            Welcome To Folksity
          </h1>
          <p className="text-gray-500">Engage, Snap Build</p>
          <Image
            className=" border-1 shadow-xl rounded-xl w-full mt-5 "
            src={
              "https://cdn.pixabay.com/photo/2016/05/24/16/48/mountains-1412683_1280.png"
            }
            alt="Main picture"
            width={500}
            height={200}
          ></Image>
          <div className="flex flex-col items-start gap-10">
            <p className="mt-10">Folksity is a user driven reporting service</p>
            <p>
              Users can report incidents that they see in their community. These
              incidents can be anything from potholes to broken street lights.
            </p>
            <p>
              Users are awarded with web3 tokens which be be used to purchased
              NFTs to be played in our game
            </p>
            <p className="text-gray-500">
              This website is a PWA. Please view on mobile to use reporting
              service
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
