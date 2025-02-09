import React, { useState, useEffect } from "react";
import axios from 'axios';

function SPLoader() {
  const [text, setText] = useState("Loading");
  const [showImg, setShowImg] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setText("Loading.");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {showImg ? (
        <img src="./spin.gif" alt="Loading..." />
      ) : (
        <h3>{text}</h3>
      )}
    </div>
  );
}

export default function FileUploader() {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState("idle");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [prediction, setPrediction] = useState(null);

    function handleFileChange(e) {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    }

    async function handleFileUpload() {
        if (!file) return;
        setStatus("uploading");
        setUploadProgress(0);
        setPrediction(null); // Reset previous predictions

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("http://localhost:5000/predict", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const progress = progressEvent.total ? 
                        Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
                    setUploadProgress(progress);
                }
            });

            if (response.data.error) {
                console.error("Flask error:", response.data.error);
                setStatus("error");
                return;
            }

            setStatus("success");
            setUploadProgress(100);
            setPrediction(response.data);

        } catch (error) {
            console.error("Upload failed:", error);
            if (error.response) {
                console.error("Flask response:", error.response.data);
            }
            setStatus("error");
            setUploadProgress(0);
        }
    }

    return (
        <div className="space-y-4">
            {/* ✅ File Upload Input (Accepts Images & Videos) */}
            <input type="file" id="plus" style ={{display:'none'}} accept="image/jpeg,image/png,video/mp4,video/avi,video/mov" onChange={handleFileChange} />
            <label htmlFor="plus" className="sqaure-label">
                <div className="square">
                    <div className="plus horizontal"></div>
                    <div className="plus vertical"></div>

                </div>

            </label>

            {file && (
                <div className="mb-4 text-sm">
                    <p><strong>File name:</strong> {file.name}</p>
                    <p><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p><strong>Type:</strong> {file.type}</p>
                </div>
            )}

            {status === "uploading" && (
                <div className="space-y-2">
                    <SPLoader/> {/*Show the spinner while uploading*/}
                    <div className="h-2.5 w-full rounded-full bg-gray-200">
                        <div 
                            className="h-2.5 rounded-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-600">{uploadProgress}%</p>
                </div>
            )}

            {file && status !== "uploading" && (
                <button 
                    onClick={handleFileUpload}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                    Upload
                </button>
            )}

            {status === "success" && <p className="text-green-500">File uploaded successfully!</p>}
            {status === "error" && <p className="text-red-500">Error uploading file</p>}

            {prediction && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <p><strong>Prediction:</strong> {prediction.predicted_class}</p>
                    <p><strong>Confidence:</strong> {prediction.confidence}</p>
                    <p><strong>Frames Analyzed:</strong> {prediction.frames_analyzed}</p>
                </div>
            )}
        </div>
    );
}

