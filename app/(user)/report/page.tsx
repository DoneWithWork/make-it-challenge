"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface Location {
  latitude: number;
  longitude: number;
}

const Report: React.FC = () => {
  const [location, setLocation] = useState<Location | undefined>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        setLocation({ latitude, longitude });
        console.log("Latitude:", latitude, "Longitude:", longitude);
      });
    }
  }, []);

  const submitReport = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      console.error("No file selected!");
      return;
    }
    const formData = new FormData(event.currentTarget);
    formData.append("image", selectedFile);
    formData.append("latitude", location?.latitude.toString() || "");
    formData.append("longitude", location?.longitude.toString() || "");
    const token = localStorage.getItem("accessToken");
    fetch("http://localhost:8080/submit", {
      method: "POST",
      // mode: 'no-cors',
      credentials: "include",
      body: formData,
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((response) => response.json())
      .then(async (data) => {
        const { success } = await data.json();
        console.log("Report submitted successfully:", data);
        router.push("/");
        // Handle success response
      })
      .catch((error) => {
        console.error("Error submitting report:", error);
        // Handle error response
      });
  };

  return (
    <div className="mx-auto w-full max-w-[400px] shadow-lg border-2 rounded-lg">
      <div className="text-center px-2 py-1">
        <p className="text-xl font-semibold">Report</p>
        <form onSubmit={submitReport}>
          <div>
            <label htmlFor="title">Title</label>
            <input type="text" id="title" name="title" required />
          </div>
          <div>
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" required />
          </div>
          <div>
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" required />
          </div>
          <div>
            <label htmlFor="tags">Tags</label>
            <input type="text" id="tags" name="tags" />
          </div>
          <div>
            <label htmlFor="urgency">Urgency</label>
            <select name="urgency">
              <option value="low">Low</option>
              <option value="low">Medium</option>
              <option value="low">High</option>
            </select>
          </div>
          <div>
            <label htmlFor="severity">Severity</label>
            <input type="text" id="severity" name="severity" />
          </div>
          <input
            type="hidden"
            name="latitude"
            value={location?.latitude || ""}
          />
          <input
            type="hidden"
            name="longitude"
            value={location?.longitude || ""}
          />
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>
          <div>
            <input type="submit" value="Submit" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Report;
