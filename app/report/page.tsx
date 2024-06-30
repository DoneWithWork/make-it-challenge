"use client";
import React, { useEffect, useState } from "react";

interface Location {
  latitude: number;
  longitude: number;
}

const Report: React.FC = () => {
  const [location, setLocation] = useState<Location | undefined>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    formData.append("photo", selectedFile);
    const data = Object.fromEntries(formData.entries());
    console.log("Report data:", data);

    // Here you can send `formData` to your backend API for processing
    // Example using fetch:
    // fetch("/api/submit-report", {
    //   method: "POST",
    //   body: formData,
    // }).then(response => {
    //   // Handle response
    // }).catch(error => {
    //   // Handle error
    // });
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
