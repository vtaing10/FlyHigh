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
    <div className="loader">
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
      <div className ="load-state">
        <div className="space-y-4">
            {/* ✅ File Upload Input (Accepts Images & Videos) */}
            <input type="file" id="plus" style ={{display:'none'}} accept="image/jpeg,image/png,video/mp4,video/avi,video/mov" onChange={handleFileChange} />
            <label htmlFor="plus" className="sqaure-label">
                <div className="square">
                    <div className="plus horizontal"></div>
                    <div className="plus vertical"></div>
                </div>
            </label>
              {/* ✅ Text Box Underneath */}
        <div id="add-image-text">Import The Best Cloud Image You Have</div>

            

            {/* {file && (
                <div className="mb-4 text-sm">
                    <p><strong>File name:</strong> {file.name}</p>
                    <p><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p><strong>Type:</strong> {file.type}</p>
                </div>
            )} */}

            {status === "uploading" && (
                <div className="loading-container">
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
                    className="Upload_Button"
                >
                    Upload
                </button>
            )}

            

            {prediction && (
                <div className="stat">
                  {status === "success" && <p >File uploaded successfully!</p>}
                  {status === "error" && <p >Error uploading file</p>}
                    <p><strong>Prediction:</strong> {prediction.predicted_class}</p>
                    <p><strong>Confidence:</strong> {prediction.confidence}</p>
                    <p className="mt-2"><strong>Description:</strong>
                    {file && <p className="file-name">Selected file: {file.name}</p>}
 {
      (() => {
        if (prediction.predicted_class === "St") {
          return "Stratus - Low, gray, and featureless clouds that often bring drizzle.";
        } else if (prediction.predicted_class === "Sc") {
          return "Stratocumulus - Low, lumpy clouds that may bring light rain.";
        } else if (prediction.predicted_class === "Ns") {
          return "Nimbostratus - Thick, dark clouds that bring continuous rain or snow.";
        } else if (prediction.predicted_class === "Cu") {
          return "Cumulus - Puffy, white clouds that indicate fair weather.";
        } else if (prediction.predicted_class === "Ct") {
          return "Contrails - Thin, streak-like clouds formed by aircraft.";
        } else if (prediction.predicted_class === "Cs") {
          return "Cirrostratus - Thin, ice-crystal clouds covering the sky, often causing a halo effect.";
        } else if (prediction.predicted_class === "Ci") {
          return "Cirrus - Wispy, high-altitude clouds indicating fair weather but possibly a change coming.";
        } else if (prediction.predicted_class === "Cc") {
          return "Cirrocumulus - Small, white patches of clouds at high altitudes, often seen before storms.";
        } else if (prediction.predicted_class === "Cb") {
          return "Cumulonimbus - Towering clouds associated with thunderstorms and severe weather.";
        } else if (prediction.predicted_class === "As") {
          return "Altostratus - Gray or blue clouds covering the sky, often preceding precipitation.";
        } else if (prediction.predicted_class === "Ac") {
          return "Altocumulus - White or gray clouds in patches or layers, sometimes indicating a storm.";
        } else {
          return "Unknown cloud type.";
        }
      })()
    }</p>
                </div>
            )}
        </div>
        </div>
    );
}



