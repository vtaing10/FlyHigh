import React, { useState } from "react";
import axios from "axios";

export default function FileUploader() {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState("idle");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [prediction, setPrediction] = useState(null); // Store AI response

    function handleFileChange(e) {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    }

    async function handleFileUpload() {
        if (!file) return;
        setStatus("uploading");
        setUploadProgress(0);
        setPrediction(null); 
    
        const formData = new FormData();
        formData.append("file", file);
    
        try {
            // ✅ Send file to Flask AI backend
            const response = await axios.post("http://localhost:5000/predict", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const progress = progressEvent.total ? 
                        Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
                    setUploadProgress(progress);
                }
            });
    
            // ✅ Check if Flask returned an error
            if (response.data.error) {
                console.error("Flask error:", response.data.error);
                setStatus("error");
                return;
            }
    
            // ✅ Display AI Prediction Result
            setStatus("success");
            setUploadProgress(100);
            setPrediction(response.data); // Store AI response
    
        } catch (error) {
            console.error("Upload failed:", error);
            
            // ✅ Check if Flask sent an error response
            if (error.response) {
                console.error("Flask response:", error.response.data);
            }
    
            setStatus("error");
            setUploadProgress(0);
        }
    }
    

    return (
        <div className="space-y-4">
            {/* ✅ File Upload Input */}
            <input type="file" onChange={handleFileChange} />

            {/* ✅ Show File Details */}
            {file && ( 
                <div className="mb-4 text-sm">
                    <p><strong>File name:</strong> {file.name}</p>
                    <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
                    <p><strong>Type:</strong> {file.type}</p>
                </div>
            )}

            {/* ✅ Upload Progress Bar */}
            {status === "uploading" && (
                <div className="space-y-2">
                    <div className="h-2.5 w-full rounded-full bg-gray-200">
                        <div 
                            className="h-2.5 rounded-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-600">{uploadProgress}%</p>
                </div>
            )}

            {/* ✅ Upload Button */}
            {file && status !== "uploading" && (
                <button 
                    onClick={handleFileUpload}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                    Upload
                </button>
            )}

            {/* ✅ Success & Error Messages */}
            {status === "success" && <p className="text-green-500">File uploaded successfully!</p>}
            {status === "error" && <p className="text-red-500">Error uploading file</p>}

            {/* ✅ Display AI Prediction */}
            {prediction && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <p><strong>Prediction:</strong> {prediction.predicted_class}</p>
                    <p><strong>Confidence:</strong> {prediction.confidence}</p>
                </div>
            )}
        </div>
    );
}


//OLD NABIL CODE

// import React, { useState } from 'react';
// import axios from 'axios';


// export default function FileUploader() {
//     const [file, setFile] = useState(null);
//     const [status, setStatus] = useState("idle");
//     const [uploadProgress, setUploadProgress] = useState(0);

//     function handleFileChange(e) {
//         if (e.target.files) {
//             setFile(e.target.files[0]);
//         }
//     }
    
//     async function handleFileUpload() {
//         if (!file) return;
//         setStatus("uploading");
//         setUploadProgress(0);
//         const formData = new FormData();
//         formData.append("file", file);

//         try{
//             await axios.post("https://httpbin.org/post", formData, {
//                 headers: {"Content-Type": "multipart/form-data"},
//                 onUploadProgress: (progressEvent) => {
//                     const progress = progressEvent.total ? 
//                     Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
//                     setUploadProgress(progress);
//                 }
//             });
//             setStatus("success");
//             setUploadProgress(100);
//         } catch {
//             setStatus("error");
//             setUploadProgress(0);
//         }
//     }

//     return (
//         <div className="space-y-2">
//             <input type="file" onChange={handleFileChange} />
//             {file && ( 
//                 <div className="mb-4 text-sm">
//                     <p>File name: {file.name}</p>
//                     <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
//                     <p>Type: {file.type}</p>
//                 </div>
//             )}
//             (status === "uploading" && (
//                 <div className="space-y-2">
//                     <div className="h-2.5 w-full rounded-full bg-gray-200">
//                         <div
//                         className="h-2.5 rounded-full bg-blue-600 transition-all duration-300"
//                         style={{ width: '${uploadProgress}%'}}
//                         ></div>
//                         </div>
//                         <p className="text-sm text-gray-600">{uploadProgress}%</p>
//                 </div>
//             )

//             {file && status !== "uploading" && <button onClick={handleFileUpload}>Upload</button>}

//             {status === "success" && <p className="text-green-500">File uploaded successfully</p>}
//             {status === "error" && <p className="text-red-500">Error uploading file</p>}
//         </div>
//     );
// }

