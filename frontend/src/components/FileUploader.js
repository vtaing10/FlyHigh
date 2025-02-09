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
  const [status, setStatus] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  function handleFileChange(e) {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  }

  async function handleFileUpload() {
    if (!file) return;

    setStatus('uploading');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('https://httpbin.org/post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      setStatus('success');
      setUploadProgress(100);
    } catch {
      setStatus('error');
      setUploadProgress(0);
    }
  }

  return (
    <div className="space-y-2">
      <input type="file" onChange={handleFileChange} id="plus"style={{ display: 'none' }}/>
      <label htmlFor="plus" className="square-label">
        <div className="square">
          <div className="plus horizontal"></div>
          <div className="plus vertical"></div>
        </div>
      </label>

      {file && (
        <div className="mb-4 text-sm">
          <p>File name: {file.name}</p>
          <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
          <p>Type: {file.type}</p>
        </div>
      )}

      {status === 'uploading' && (
        <div className="flex items-center space-y-2">
          <SPLoader />  {/* Show the spinner while uploading */}
          <p className="text-sm text-gray-600 ml-2">{uploadProgress}% uploaded</p>
        </div>
      )}

      {file && status !== 'uploading' && (
        <button onClick={handleFileUpload}>Upload</button>
      )}

      {status === 'success' && (
        <p className="text-sm text-green-600">File uploaded successfully!</p>
      )}

      {status === 'error' && (
        <p className="text-sm text-red-600">Upload failed. Please try again.</p>
      )}
    </div>
  );
}
