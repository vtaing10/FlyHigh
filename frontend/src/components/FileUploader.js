import React, { useState } from 'react';
import axios from 'axios';


export default function FileUploader() {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState("idle");
    const [uploadProgress, setUploadProgress] = useState(0);

    function handleFileChange(e) {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    }
    
    async function handleFileUpload() {
        if (!file) return;
        setStatus("uploading");
        setUploadProgress(0);
        const formData = new FormData();
        formData.append("file", file);

        try{
            await axios.post("https://httpbin.org/post", formData, {
                headers: {"Content-Type": "multipart/form-data"},
                onUploadProgress: (progressEvent) => {
                    const progress = progressEvent.total ? 
                    Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
                    setUploadProgress(progress);
                }
            });
            setStatus("success");
            setUploadProgress(100);
        } catch {
            setStatus("error");
            setUploadProgress(0);
        }
    }

    return (
        <div className="space-y-2">
            <input type="file" onChange={handleFileChange} />
            {file && ( 
                <div className="mb-4 text-sm">
                    <p>File name: {file.name}</p>
                    <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
                    <p>Type: {file.type}</p>
                </div>
            )}
            (status === "uploading" && (
                <div className="space-y-2">
                    <div className="h-2.5 w-full rounded-full bg-gray-600">
                        <div
                        className="h-2.5 rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: '${uploadProgress}%'}}
                        ></div>
                        </div>
                        <p className="text-sm text-gray-600">{uploadProgress}%</p>
                </div>
            )

            {file && status !== "uploading" && <button onClick={handleFileUpload}>Upload</button>}

            {status === "success" && <p className="text-green-500">File uploaded successfully</p>}
            {status === "error" && <p className="text-red-500">Error uploading file</p>}
        </div>
    );
}