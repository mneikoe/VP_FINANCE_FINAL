// import React, { useState } from "react";
// import axios from "axios";

// const FileUpload = ({ onUpload }) => {
//   const [selectedFiles, setSelectedFiles] = useState([]);

//   const handleFileChange = (e) => {
//     setSelectedFiles(e.target.files);
//   };

//   const handleUpload = async (e) => {
//     e.preventDefault();
//     if (selectedFiles.length === 0) {
//       alert("Please select at least one file.");
//       return;
//     }

//     const formData = new FormData();
//     for (let i = 0; i < selectedFiles.length; i++) {
//       formData.append("files", selectedFiles[i]);
//     }

//     try {
//       const res = await axios.post(
//         "http://localhost:8080/api/uploads",
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         }
//       );

//       const uploadedUrls = res.data.urls;
//       console.log("Uploaded URLs:", uploadedUrls);

//       // Send URLs to parent
//       if (onUpload) {
//         onUpload(uploadedUrls);
//       }
//     } catch (err) {
//       console.error("Upload failed:", err);
//       alert("Upload failed.");
//     }
//   };

//   return (
//     <div>
//       <input type="file" name="files" multiple onChange={handleFileChange} />
//       <button className="btn btn-primary mt-2" onClick={handleUpload}>
//         Upload
//       </button>
//     </div>
//   );
// };

// export default FileUpload;

// FileUpload.js
import React, { useState } from "react";
import axiosInstance from "../../config/axios";

const FileUpload = ({ onUpload }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      alert("Please select at least one file.");
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("files", selectedFiles[i]);
    }

    try {
      const res = await axiosInstance.post(
        "/api/uploads",
        // "https://dela.systemmanager.in",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const uploadedUrls = res.data.urls;
      console.log("Uploaded URLs:", uploadedUrls);

      if (onUpload) {
        onUpload(uploadedUrls);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed.");
    }
  };

  return (
    <div>
      <input type="file" name="files" multiple onChange={handleFileChange} />
      <button className="btn btn-primary mt-2" onClick={handleUpload}>
        Upload
      </button>
    </div>
  );
};

export default FileUpload;
