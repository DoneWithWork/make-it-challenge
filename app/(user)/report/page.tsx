"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Camera from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";

interface Location {
  latitude: number;
  longitude: number;
}

const Report: React.FC = () => {
  const [location, setLocation] = useState<Location | undefined>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        setLocation({ latitude, longitude });
      });
    }
  }, []);

  const handleTakePhoto = (dataUri: string) => {
    setPhotoData(dataUri);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const submitReport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile && !photoData) {
      console.error("No file or photo taken!");
      return;
    }

    const formData = new FormData(event.currentTarget);
    if (selectedFile) {
      formData.append("image", selectedFile);
    } else if (photoData) {
      const blob = await fetch(photoData).then((res) => res.blob());
      formData.append("image", blob, "photo.jpg");
    }
    formData.append("latitude", location?.latitude.toString() || "");
    formData.append("longitude", location?.longitude.toString() || "");

    const token = localStorage.getItem("accessToken");
    fetch("http://localhost:8080/submit", {
      method: "POST",
      credentials: "include",
      body: formData,
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Report submitted successfully:", data);
        router.push("/");
      })
      .catch((error) => {
        console.error("Error submitting report:", error);
      });
  };

  return (
    <div className="mx-auto w-full max-w-[400px] max-h-[500px] shadow-lg border-2 rounded-lg">
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
              <option value="medium">Medium</option>
              <option value="high">High</option>
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
          <div></div>
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
