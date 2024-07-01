"use client";
import Image from "next/image";
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

const Admin: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      const res = await fetch("http://localhost:8080/api/reports", {
        credentials: "include",
      }); //, {mode: 'no-cors'});
      const data = await res.json();
      console.log(data[0].image_filename);
      setReports(data);
    };
    fetchReports();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[800px] shadow-lg border-2 rounded-lg">
      <div className="text-center px-2 py-1">
        <p className="text-xl font-semibold">Admin</p>
        <table className="w-full">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Location</th>
              <th>Name</th>
              <th>Tags</th>
              <th>Urgency</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Timestamp</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.title}</td>
                <td>{report.description}</td>
                <td>{report.location}</td>
                <td>{report.name}</td>
                <td>{report.tags}</td>
                <td>{report.urgency}</td>
                <td>{report.severity}</td>
                <td>{report.status}</td>
                <td>{new Date(report.timestamp).toLocaleString()}</td>
                <td>
                  {report.image_filename && (
                    <Image
                      src={`http://localhost:8080/static/uploads/${report.image_filename}`}
                      alt={report.title}
                      width="50"
                      height={"100"}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
