import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaSync,
  FaExclamationTriangle,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaBriefcase,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCheckCircle,
  FaEye,
  FaUserCheck,
  FaFileSignature,
  FaFileContract,
  FaFileAlt,
  FaPaperPlane,
  FaCheck,
  FaUpload,
  FaDownload,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaExternalLinkAlt,
  FaTimes,
} from "react-icons/fa";

const JoiningData = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [actionType, setActionType] = useState(null); // 'offer' or 'joining'
  const [offerLetterFile, setOfferLetterFile] = useState(null);
  const [joiningLetterFile, setJoiningLetterFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [viewingFile, setViewingFile] = useState(null); // For PDF viewer
  const [viewingFileName, setViewingFileName] = useState("");
  const [viewingFileType, setViewingFileType] = useState("");

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from all relevant endpoints
      const endpoints = [
        "/api/addcandidate/stage/Joining%20Data",
        "/api/addcandidate/stage/Selected",
        "/api/addcandidate/stage/Offer%20Letter%20Sent",
        "/api/addcandidate/stage/Joining%20Letter%20Sent",
        "/api/addcandidate/status/Joining%20Data",
        "/api/addcandidate/status/Offer%20Letter%20Sent",
        "/api/addcandidate/status/Joining%20Letter%20Sent",
        "/api/addcandidate/status/Selected",
      ];

      let allCandidates = [];

      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(endpoint);
          console.log(`API Response from ${endpoint}:`, response.data);

          if (response.data && response.data.candidates) {
            allCandidates = [...allCandidates, ...response.data.candidates];
          } else if (Array.isArray(response.data)) {
            allCandidates = [...allCandidates, ...response.data];
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err.message);
          continue;
        }
      }

      // If no candidates found, try to get all and filter
      if (allCandidates.length === 0) {
        console.log("Trying to fetch all candidates and filter...");
        const allResponse = await axios.get("/api/addcandidate");
        console.log("All candidates response:", allResponse.data);

        let allCandidatesData = [];
        if (allResponse.data && allResponse.data.candidates) {
          allCandidatesData = allResponse.data.candidates;
        } else if (Array.isArray(allResponse.data)) {
          allCandidatesData = allResponse.data;
        }

        // Filter for relevant statuses
        const relevantCandidates = allCandidatesData.filter((candidate) => {
          const currentStage = (candidate.currentStage || "")
            .toString()
            .toLowerCase()
            .trim();
          const currentStatus = (candidate.currentStatus || "")
            .toString()
            .toLowerCase()
            .trim();

          return (
            currentStage === "joining data" ||
            currentStage === "offer letter sent" ||
            currentStage === "joining letter sent" ||
            currentStatus === "joining data" ||
            currentStatus === "offer letter sent" ||
            currentStatus === "joining letter sent"
          );
        });

        setCandidates(relevantCandidates || []);
      } else {
        // Remove duplicates
        const uniqueCandidates = Array.from(
          new Map(
            allCandidates.map((candidate) => [candidate._id, candidate])
          ).values()
        );
        setCandidates(uniqueCandidates);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to load candidates");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const viewCandidateDetails = (candidate) => {
    console.log("📋 Selected Candidate:", candidate);
    console.log("📋 currentStage:", candidate.currentStage);
    console.log("📋 currentStatus:", candidate.currentStatus);
    setSelectedCandidate(candidate);
    setActionType(null);
    setOfferLetterFile(null);
    setJoiningLetterFile(null);
  };

  const closeDetails = () => {
    setSelectedCandidate(null);
    setActionType(null);
    setOfferLetterFile(null);
    setJoiningLetterFile(null);
  };

  const handleOfferLetterAction = () => {
    setActionType("offer");
  };

  // handleJoiningLetterAction function update करें:
  const handleJoiningLetterAction = () => {
    setActionType("joining");
  };

  const handleOfferLetterFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(
          "Please upload only PDF, Word, or Image files (.pdf, .doc, .docx, .jpg, .png)"
        );
        e.target.value = "";
        return;
      }

      // Check file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size should be less than 10MB");
        e.target.value = "";
        return;
      }

      setOfferLetterFile(file);
    }
  };

  const handleJoiningLetterFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(
          "Please upload only PDF, Word, or Image files (.pdf, .doc, .docx, .jpg, .png)"
        );
        e.target.value = "";
        return;
      }

      // Check file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size should be less than 10MB");
        e.target.value = "";
        return;
      }

      setJoiningLetterFile(file);
    }
  };

  const sendOfferLetter = async () => {
    if (!offerLetterFile) {
      alert("Please select a file to upload");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("sentDate", new Date().toISOString());
      formData.append("accepted", "false");
      formData.append("notes", "");
      formData.append("offerLetterFile", offerLetterFile);

      const response = await axios.put(
        `/api/addcandidate/${selectedCandidate._id}/offer-letter`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        alert("✅ Offer Letter Sent successfully!");
        fetchCandidates();
        closeDetails();
      }
    } catch (error) {
      console.error("Error sending offer letter:", error);
      alert("❌ Failed to send offer letter. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const sendJoiningLetter = async () => {
    if (!joiningLetterFile) {
      alert("Please select a file to upload");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("sentDate", new Date().toISOString());
      formData.append("received", "false");
      formData.append("notes", "");

      formData.append("joiningDate", "");

      formData.append("joiningLetterFile", joiningLetterFile);

      const response = await axios.put(
        `/api/addcandidate/${selectedCandidate._id}/joining-letter`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        alert("✅ Joining Letter Sent successfully!");
        fetchCandidates();
        closeDetails();
      }
    } catch (error) {
      console.error("Error sending joining letter:", error);
      alert("❌ Failed to send joining letter. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const viewFile = async (fileType, filename, originalName) => {
    try {
      const endpoint =
        fileType === "offer"
          ? `/api/addcandidate/view/offer-letter/${filename}`
          : `/api/addcandidate/view/joining-letter/${filename}`;

      // Check if it's a PDF
      if (filename.toLowerCase().endsWith(".pdf")) {
        // Open in new tab for PDF
        window.open(endpoint, "_blank");
      } else {
        // For other files, download directly
        downloadFile(fileType, filename, originalName);
      }
    } catch (error) {
      console.error("Error viewing file:", error);
      alert("Failed to view file");
    }
  };

  const downloadFile = async (fileType, filename, originalName) => {
    try {
      const endpoint =
        fileType === "offer"
          ? `/api/addcandidate/download/offer-letter/${filename}`
          : `/api/addcandidate/download/joining-letter/${filename}`;

      const response = await axios.get(endpoint, {
        responseType: "blob",
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", originalName || filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file");
    }
  };

  const viewPdfInModal = (fileType, filename, originalName) => {
    const endpoint =
      fileType === "offer"
        ? `/api/addcandidate/view/offer-letter/${filename}`
        : `/api/addcandidate/view/joining-letter/${filename}`;

    setViewingFile(endpoint);
    setViewingFileName(originalName || filename);
    setViewingFileType(
      filename.toLowerCase().endsWith(".pdf") ? "pdf" : "other"
    );
  };

  const closePdfViewer = () => {
    setViewingFile(null);
    setViewingFileName("");
    setViewingFileType("");
  };

  const calculateTotalMarks = (candidate) => {
    if (!candidate) return 0;
    let marks = 0;

    // Education marks
    switch (candidate.education) {
      case "Graduate in any":
        marks += 2;
        break;
      case "Graduate in Maths/Economics":
        marks += 3;
        break;
      case "MBA/PG with financial subject":
        marks += 4;
        break;
    }

    // Age group marks
    switch (candidate.ageGroup) {
      case "20-25yr":
        marks += 1;
        break;
      case "26-30yr":
        marks += 2;
        break;
      case "31-45yr":
        marks += 3;
        break;
      case "45 & above":
        marks += 2;
        break;
    }

    // Vehicle marks
    if (candidate.vehicle) marks += 4;

    // Experience fields marks
    marks +=
      parseInt(
        candidate.experienceFields?.administrative || candidate.administrative
      ) || 0;
    marks +=
      parseInt(
        candidate.experienceFields?.insuranceSales || candidate.insuranceSales
      ) || 0;
    marks +=
      parseInt(candidate.experienceFields?.anySales || candidate.anySales) || 0;
    marks +=
      parseInt(candidate.experienceFields?.fieldWork || candidate.fieldWork) ||
      0;

    // Operational activities marks
    marks +=
      parseInt(
        candidate.operationalActivities?.dataManagement ||
          candidate.dataManagement
      ) || 0;
    marks +=
      parseInt(
        candidate.operationalActivities?.backOffice || candidate.backOffice
      ) || 0;
    marks +=
      parseInt(candidate.operationalActivities?.mis || candidate.mis) || 0;

    // Location marks
    const locationMarks = {
      "H.B Road": 4,
      "Arera Colony": 3,
      BHEL: 2,
      Mandideep: 2,
      Others: 1,
    };
    marks += locationMarks[candidate.location] || 0;

    // Native place marks
    if (candidate.nativePlace === "Bhopal") marks += 3;
    else marks += 1;

    // Spoken English marks
    if (candidate.spokenEnglish) marks += 4;

    // Salary expectation marks
    const salaryMarks = {
      "10K-12K": 4,
      "12-15K": 3,
      "15-18K": 3,
      "18-20K": 2,
      "20-25K": 2,
      "25K & Above": 1,
    };
    marks += salaryMarks[candidate.salaryExpectation] || 0;

    return marks;
  };

  const getStatusBadge = (candidate) => {
    const stage =
      candidate.currentStage || candidate.currentStatus || "Joining Data";

    const badges = {
      "Joining Data": {
        color: "#17a2b8",
        text: "Joining Data",
        icon: FaFileSignature,
      },
      "Offer Letter Sent": {
        color: "#ffc107",
        text: "Offer Sent",
        icon: FaFileContract,
      },
      "Joining Letter Sent": {
        color: "#28a745",
        text: "Joining Sent",
        icon: FaFileAlt,
      },
    };

    const badge = badges[stage] || {
      color: "#6c757d",
      text: stage,
      icon: FaUserCheck,
    };
    const Icon = badge.icon;

    return (
      <span
        style={{
          backgroundColor: badge.color,
          color: "white",
          padding: "4px 10px",
          borderRadius: "12px",
          fontSize: "12px",
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          fontWeight: "500",
        }}
      >
        <Icon style={{ fontSize: "11px" }} />
        {badge.text}
      </span>
    );
  };

  const getCurrentStage = (candidate) => {
    return candidate.currentStage || candidate.currentStatus || "Joining Data";
  };

  const getFileIcon = (filename) => {
    if (!filename) return <FaFileAlt />;
    const lowerName = filename.toLowerCase();
    if (lowerName.endsWith(".pdf")) {
      return <FaFilePdf style={{ color: "#dc3545", fontSize: "12px" }} />;
    } else if (lowerName.endsWith(".doc") || lowerName.endsWith(".docx")) {
      return <FaFileWord style={{ color: "#0d6efd", fontSize: "12px" }} />;
    } else if (
      lowerName.endsWith(".jpg") ||
      lowerName.endsWith(".jpeg") ||
      lowerName.endsWith(".png")
    ) {
      return <FaFileImage style={{ color: "#198754", fontSize: "12px" }} />;
    }
    return <FaFileAlt style={{ fontSize: "12px" }} />;
  };
  const hasOfferLetter = (candidate) => {
    return candidate.offerLetterDetails?.file?.filename;
  };

  const hasJoiningLetter = (candidate) => {
    return candidate.joiningLetterDetails?.file?.filename;
  };
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <div
            className="spinner-border mb-3"
            role="status"
            style={{ color: "black" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mb-0" style={{ color: "black" }}>
            Loading candidates...
          </p>
        </div>
      );
    }

    if (error && (!candidates || candidates.length === 0)) {
      return (
        <div className="text-center py-5">
          <div className="mb-3">
            <FaExclamationTriangle
              style={{ fontSize: "3rem", color: "black" }}
            />
          </div>
          <h6 className="mb-2" style={{ color: "black" }}>
            No Candidates Found
          </h6>
          <p className="mb-4" style={{ color: "black" }}>
            {error}
          </p>
          <button
            className="btn"
            onClick={fetchCandidates}
            style={{
              backgroundColor: "white",
              color: "black",
              border: "1px solid #ced4da",
            }}
          >
            <FaSync className="me-1" />
            Refresh
          </button>
        </div>
      );
    }

    if (!candidates || candidates.length === 0) {
      return (
        <div className="text-center py-5">
          <div className="mb-3">
            <FaUserCheck style={{ fontSize: "3rem", color: "black" }} />
          </div>
          <h6 className="mb-2" style={{ color: "black" }}>
            No Candidates in Joining Process
          </h6>
          <p className="mb-4" style={{ color: "black" }}>
            Select candidates from "Interview Process" page first
          </p>
          <button
            className="btn"
            onClick={fetchCandidates}
            style={{
              backgroundColor: "white",
              color: "black",
              border: "1px solid #ced4da",
            }}
          >
            <FaSync className="me-1" />
            Refresh
          </button>
        </div>
      );
    }

    return (
      <div className="table-responsive">
        <table className="table" style={{ backgroundColor: "white" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e0e0e0" }}>
              <th
                style={{ color: "black", fontWeight: "600", padding: "12px" }}
              >
                Candidate
              </th>
              <th
                style={{ color: "black", fontWeight: "600", padding: "12px" }}
              >
                Contact
              </th>
              <th
                style={{ color: "black", fontWeight: "600", padding: "12px" }}
              >
                Designation
              </th>
              <th
                style={{ color: "black", fontWeight: "600", padding: "12px" }}
              >
                Status
              </th>
              <th
                style={{ color: "black", fontWeight: "600", padding: "12px" }}
              >
                Documents
              </th>
              <th
                style={{ color: "black", fontWeight: "600", padding: "12px" }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => {
              const totalMarks = calculateTotalMarks(candidate);
              const currentStage = getCurrentStage(candidate);
              const hasOfferLetter = candidate.offerLetterDetails?.file;
              const hasJoiningLetter = candidate.joiningLetterDetails?.file;

              return (
                <tr
                  key={candidate._id}
                  style={{ borderBottom: "1px solid #e0e0e0" }}
                >
                  <td style={{ padding: "12px" }}>
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: "36px",
                          height: "36px",
                          fontSize: "14px",
                          backgroundColor: "#f8f9fa",
                          color: "black",
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        {candidate.candidateName?.charAt(0) || "C"}
                      </div>
                      <div>
                        <strong style={{ color: "black" }}>
                          {candidate.candidateName || "Unnamed"}
                        </strong>
                        <br />
                        <small className="text-muted">
                          Marks: {totalMarks}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ color: "black" }}>
                      {candidate.mobileNo || "N/A"}
                    </div>
                    <small className="text-muted">
                      {candidate.email || "No email"}
                    </small>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        backgroundColor: "#f8f9fa",
                        color: "black",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      {candidate.appliedFor?.designation || "N/A"}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    {getStatusBadge(candidate)}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div className="d-flex flex-column gap-2">
                      {candidate.offerLetterDetails?.file?.filename && (
                        <div className="d-flex align-items-center gap-1">
                          {getFileIcon(
                            candidate.offerLetterDetails.file.originalName
                          )}
                          <small
                            className="text-muted"
                            style={{ fontSize: "11px" }}
                          >
                            Offer:
                          </small>
                          <span
                            className="ms-1"
                            style={{ fontSize: "11px", color: "#28a745" }}
                          >
                            ✓
                          </span>
                          <div className="d-flex gap-1 ms-1">
                            <button
                              className="btn btn-sm p-0"
                              onClick={() =>
                                viewPdfInModal(
                                  "offer",
                                  candidate.offerLetterDetails.file.filename,
                                  candidate.offerLetterDetails.file.originalName
                                )
                              }
                              style={{
                                color: "#0d6efd",
                                background: "none",
                                border: "none",
                                fontSize: "11px",
                              }}
                              title="View Offer Letter"
                            >
                              <FaEye size={10} />
                            </button>
                            <button
                              className="btn btn-sm p-0"
                              onClick={() =>
                                downloadFile(
                                  "offer",
                                  candidate.offerLetterDetails.file.filename,
                                  candidate.offerLetterDetails.file.originalName
                                )
                              }
                              style={{
                                color: "#28a745",
                                background: "none",
                                border: "none",
                                fontSize: "11px",
                              }}
                              title="Download Offer Letter"
                            >
                              <FaDownload size={10} />
                            </button>
                          </div>
                        </div>
                      )}

                      {candidate.joiningLetterDetails?.file?.filename && (
                        <div className="d-flex align-items-center gap-1">
                          {getFileIcon(
                            candidate.joiningLetterDetails.file.originalName
                          )}
                          <small
                            className="text-muted"
                            style={{ fontSize: "11px" }}
                          >
                            Joining:
                          </small>
                          <span
                            className="ms-1"
                            style={{ fontSize: "11px", color: "#28a745" }}
                          >
                            ✓
                          </span>
                          <div className="d-flex gap-1 ms-1">
                            <button
                              className="btn btn-sm p-0"
                              onClick={() =>
                                viewPdfInModal(
                                  "joining",
                                  candidate.joiningLetterDetails.file.filename,
                                  candidate.joiningLetterDetails.file
                                    .originalName
                                )
                              }
                              style={{
                                color: "#0d6efd",
                                background: "none",
                                border: "none",
                                fontSize: "11px",
                              }}
                              title="View Joining Letter"
                            >
                              <FaEye size={10} />
                            </button>
                            <button
                              className="btn btn-sm p-0"
                              onClick={() =>
                                downloadFile(
                                  "joining",
                                  candidate.joiningLetterDetails.file.filename,
                                  candidate.joiningLetterDetails.file
                                    .originalName
                                )
                              }
                              style={{
                                color: "#28a745",
                                background: "none",
                                border: "none",
                                fontSize: "11px",
                              }}
                              title="Download Joining Letter"
                            >
                              <FaDownload size={10} />
                            </button>
                          </div>
                        </div>
                      )}

                      {!candidate.offerLetterDetails?.file?.filename &&
                        !candidate.joiningLetterDetails?.file?.filename && (
                          <div className="d-flex align-items-center gap-1">
                            <small
                              className="text-muted"
                              style={{ fontSize: "11px" }}
                            >
                              No documents
                            </small>
                            <button
                              className="btn btn-sm p-0 ms-1"
                              onClick={() => {
                                const candidateId = candidate._id;
                                // Create hidden file input for quick upload
                                const input = document.createElement("input");
                                input.type = "file";
                                input.accept =
                                  ".pdf,.doc,.docx,.jpg,.jpeg,.png";
                                input.onchange = async (e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    try {
                                      const formData = new FormData();
                                      formData.append("offerLetterFile", file);

                                      const response = await axios.post(
                                        `/api/addcandidate/${candidateId}/upload-offer-letter`,
                                        formData,
                                        {
                                          headers: {
                                            "Content-Type":
                                              "multipart/form-data",
                                          },
                                        }
                                      );

                                      if (response.data.success) {
                                        alert(
                                          "Document uploaded successfully!"
                                        );
                                        fetchCandidates();
                                      }
                                    } catch (error) {
                                      console.error(
                                        "Error uploading document:",
                                        error
                                      );
                                      alert("Failed to upload document");
                                    }
                                  }
                                };
                                input.click();
                              }}
                              style={{
                                color: "#6c757d",
                                background: "none",
                                border: "none",
                                fontSize: "11px",
                              }}
                              title="Upload Document"
                            >
                              <FaUpload size={10} />
                            </button>
                          </div>
                        )}
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div
                      className="d-flex flex-column gap-1"
                      style={{ minWidth: "120px" }}
                    >
                      <button
                        className="btn btn-sm d-flex align-items-center justify-content-center"
                        onClick={() => viewCandidateDetails(candidate)}
                        style={{
                          backgroundColor: "white",
                          color: "black",
                          border: "1px solid #ced4da",
                          fontSize: "12px",
                          padding: "4px 8px",
                          height: "32px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <FaEye className="me-1" style={{ fontSize: "12px" }} />
                        <span>View Details</span>
                      </button>
                      <div className="d-flex gap-1">
                        <span
                          className="btn btn-sm d-flex align-items-center justify-content-center flex-grow-1"
                          style={{
                            backgroundColor:
                              currentStage === "Joining Data"
                                ? "#f8f9fa"
                                : currentStage === "Offer Letter Sent"
                                ? "#fff3cd"
                                : "#d4edda",
                            color:
                              currentStage === "Joining Data"
                                ? "black"
                                : currentStage === "Offer Letter Sent"
                                ? "#856404"
                                : "#155724",
                            border:
                              currentStage === "Joining Data"
                                ? "1px solid #28a745"
                                : currentStage === "Offer Letter Sent"
                                ? "1px solid #ffc107"
                                : "1px solid #28a745",
                            fontSize: "11px",
                            padding: "4px 8px",
                            height: "28px",
                            whiteSpace: "nowrap",
                            cursor: "default",
                          }}
                        >
                          <FaCheckCircle
                            className="me-1"
                            style={{
                              fontSize: "10px",
                              color:
                                currentStage === "Joining Data"
                                  ? "#28a745"
                                  : currentStage === "Offer Letter Sent"
                                  ? "#ffc107"
                                  : "#28a745",
                            }}
                          />
                          <span>
                            {currentStage === "Joining Data"
                              ? "Selected"
                              : currentStage === "Offer Letter Sent"
                              ? "Offer Sent"
                              : "Joining Sent"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const DetailRow = ({ icon: Icon, label, value, children }) => (
    <div className="mb-2">
      <div className="d-flex align-items-center mb-1">
        {Icon && (
          <Icon className="me-2" style={{ color: "black", fontSize: "14px" }} />
        )}
        <small style={{ color: "black", fontWeight: "500" }}>{label}:</small>
      </div>
      <div style={{ color: "black", marginLeft: Icon ? "26px" : "0" }}>
        {children || value || "Not specified"}
      </div>
    </div>
  );

  const getCurrentStageForModal = (candidate) => {
    return candidate.currentStage || candidate.currentStatus || "Joining Data";
  };

  // Check which buttons to show
  const shouldShowOfferLetterButton = (candidate) => {
    const stage = getCurrentStageForModal(candidate);
    return stage === "Joining Data";
  };

  const shouldShowJoiningLetterButton = (candidate) => {
    const stage = getCurrentStageForModal(candidate);
    return stage === "Joining Data" || stage === "Offer Letter Sent";
  };

  return (
    <div className="p-4" style={{ backgroundColor: "white" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1" style={{ color: "black" }}>
            Joining Process
          </h2>
          <p className="mb-0" style={{ color: "black" }}>
            {candidates ? candidates.length : 0} candidate
            {candidates && candidates.length !== 1 ? "s" : ""} in joining
            process
          </p>
        </div>
        <button
          className="btn btn-sm d-flex align-items-center"
          onClick={fetchCandidates}
          style={{
            backgroundColor: "white",
            color: "black",
            border: "1px solid #ced4da",
            padding: "6px 12px",
            height: "32px",
          }}
        >
          <FaSync className="me-2" style={{ fontSize: "14px" }} />
          <span>Refresh</span>
        </button>
      </div>

      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #e0e0e0",
          borderRadius: "4px",
        }}
      >
        <div className="p-3">{renderContent()}</div>
      </div>

      {/* PDF Viewer Modal */}
      {viewingFile && viewingFileType === "pdf" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.9)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "90vw",
              height: "90vh",
              backgroundColor: "white",
              borderRadius: "4px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "15px",
                backgroundColor: "#343a40",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div className="d-flex align-items-center">
                <FaFilePdf className="me-2" style={{ color: "#dc3545" }} />
                <strong>{viewingFileName}</strong>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm d-flex align-items-center"
                  onClick={() => window.open(viewingFile, "_blank")}
                  style={{
                    backgroundColor: "#0d6efd",
                    color: "white",
                    border: "none",
                  }}
                >
                  <FaExternalLinkAlt className="me-1" />
                  Open in New Tab
                </button>
                <button
                  onClick={closePdfViewer}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "white",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    padding: "0",
                  }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              <iframe
                src={viewingFile}
                title={viewingFileName}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              width: "100%",
              maxWidth: "800px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h5 style={{ color: "black" }}>
                    <FaUser className="me-2" />
                    {selectedCandidate.candidateName || "Candidate Details"}
                  </h5>
                  <p className="mb-0 mt-2">
                    {getStatusBadge(selectedCandidate)}
                  </p>
                </div>
                <button
                  onClick={closeDetails}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "black",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    padding: "0",
                  }}
                >
                  ×
                </button>
              </div>

              {/* Action Buttons - ALWAYS SHOW BOTH BUTTONS WITH PROPER CONDITIONS */}
              {!actionType && (
                <div
                  className="mb-4 p-3"
                  style={{ backgroundColor: "#f8f9fa", borderRadius: "4px" }}
                >
                  <h6 className="mb-3" style={{ color: "black" }}>
                    <FaPaperPlane className="me-2" />
                    Send Letters
                  </h6>
                  <div className="d-flex gap-3 flex-wrap">
                    {/* Offer Letter Button - Show for Joining Data only */}
                    {shouldShowOfferLetterButton(selectedCandidate) ? (
                      <button
                        className="btn d-flex align-items-center"
                        onClick={handleOfferLetterAction}
                        style={{
                          backgroundColor: "#ffc107",
                          color: "black",
                          border: "none",
                          padding: "10px 20px",
                          fontWeight: "500",
                        }}
                      >
                        <FaFileContract className="me-2" />
                        Send Offer Letter
                      </button>
                    ) : (
                      <button
                        className="btn d-flex align-items-center"
                        disabled
                        style={{
                          backgroundColor: "#e9ecef",
                          color: "#6c757d",
                          border: "none",
                          padding: "10px 20px",
                          fontWeight: "500",
                          cursor: "not-allowed",
                        }}
                      >
                        <FaFileContract className="me-2" />
                        Offer Letter Sent
                      </button>
                    )}

                    {/* Joining Letter Button - Show for Joining Data AND Offer Letter Sent */}
                    {shouldShowJoiningLetterButton(selectedCandidate) ? (
                      <button
                        className="btn d-flex align-items-center"
                        onClick={handleJoiningLetterAction}
                        style={{
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          padding: "10px 20px",
                          fontWeight: "500",
                        }}
                      >
                        <FaFileAlt className="me-2" />
                        Send Joining Letter
                      </button>
                    ) : (
                      <button
                        className="btn d-flex align-items-center"
                        disabled
                        style={{
                          backgroundColor: "#e9ecef",
                          color: "#6c757d",
                          border: "none",
                          padding: "10px 20px",
                          fontWeight: "500",
                          cursor: "not-allowed",
                        }}
                      >
                        <FaFileAlt className="me-2" />
                        Joining Letter Sent
                      </button>
                    )}
                  </div>

                  {/* Show uploaded files if available */}
                  {selectedCandidate.offerLetterDetails?.file && (
                    <div className="mt-3">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <small className="text-muted">
                          ✅ Offer letter uploaded:
                        </small>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {getFileIcon(
                          selectedCandidate.offerLetterDetails.file.originalName
                        )}
                        <small
                          className="text-truncate"
                          style={{ maxWidth: "200px" }}
                        >
                          {
                            selectedCandidate.offerLetterDetails.file
                              .originalName
                          }
                        </small>
                        <span
                          className="text-muted"
                          style={{ fontSize: "11px" }}
                        >
                          (
                          {formatFileSize(
                            selectedCandidate.offerLetterDetails.file
                              .fileSize || 0
                          )}
                          )
                        </span>
                        <button
                          className="btn btn-sm d-flex align-items-center ms-2"
                          onClick={() =>
                            viewFile(
                              "offer",
                              selectedCandidate.offerLetterDetails.file
                                .filename,
                              selectedCandidate.offerLetterDetails.file
                                .originalName
                            )
                          }
                          style={{
                            backgroundColor: "#f8f9fa",
                            color: "#0d6efd",
                            border: "1px solid #ced4da",
                            padding: "2px 8px",
                            fontSize: "12px",
                          }}
                        >
                          <FaExternalLinkAlt
                            className="me-1"
                            style={{ fontSize: "10px" }}
                          />
                          View
                        </button>
                        <button
                          className="btn btn-sm d-flex align-items-center"
                          onClick={() =>
                            downloadFile(
                              "offer",
                              selectedCandidate.offerLetterDetails.file
                                .filename,
                              selectedCandidate.offerLetterDetails.file
                                .originalName
                            )
                          }
                          style={{
                            backgroundColor: "#f8f9fa",
                            color: "#28a745",
                            border: "1px solid #ced4da",
                            padding: "2px 8px",
                            fontSize: "12px",
                          }}
                        >
                          <FaDownload
                            className="me-1"
                            style={{ fontSize: "10px" }}
                          />
                          Download
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedCandidate.joiningLetterDetails?.file && (
                    <div className="mt-3">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <small className="text-muted">
                          ✅ Joining letter uploaded:
                        </small>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {getFileIcon(
                          selectedCandidate.joiningLetterDetails.file
                            .originalName
                        )}
                        <small
                          className="text-truncate"
                          style={{ maxWidth: "200px" }}
                        >
                          {
                            selectedCandidate.joiningLetterDetails.file
                              .originalName
                          }
                        </small>
                        <span
                          className="text-muted"
                          style={{ fontSize: "11px" }}
                        >
                          (
                          {formatFileSize(
                            selectedCandidate.joiningLetterDetails.file
                              .fileSize || 0
                          )}
                          )
                        </span>
                        <button
                          className="btn btn-sm d-flex align-items-center ms-2"
                          onClick={() =>
                            viewFile(
                              "joining",
                              selectedCandidate.joiningLetterDetails.file
                                .filename,
                              selectedCandidate.joiningLetterDetails.file
                                .originalName
                            )
                          }
                          style={{
                            backgroundColor: "#f8f9fa",
                            color: "#0d6efd",
                            border: "1px solid #ced4da",
                            padding: "2px 8px",
                            fontSize: "12px",
                          }}
                        >
                          <FaExternalLinkAlt
                            className="me-1"
                            style={{ fontSize: "10px" }}
                          />
                          View
                        </button>
                        <button
                          className="btn btn-sm d-flex align-items-center"
                          onClick={() =>
                            downloadFile(
                              "joining",
                              selectedCandidate.joiningLetterDetails.file
                                .filename,
                              selectedCandidate.joiningLetterDetails.file
                                .originalName
                            )
                          }
                          style={{
                            backgroundColor: "#f8f9fa",
                            color: "#28a745",
                            border: "1px solid #ced4da",
                            padding: "2px 8px",
                            fontSize: "12px",
                          }}
                        >
                          <FaDownload
                            className="me-1"
                            style={{ fontSize: "10px" }}
                          />
                          Download
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Show status messages if letters already sent */}
                  {selectedCandidate.currentStage === "Offer Letter Sent" && (
                    <div className="mt-3">
                      <small className="text-muted">
                        ✅ Offer letter sent on:{" "}
                        {selectedCandidate.offerLetterDetails?.sentDate
                          ? new Date(
                              selectedCandidate.offerLetterDetails.sentDate
                            ).toLocaleDateString()
                          : "Unknown date"}
                      </small>
                    </div>
                  )}

                  {selectedCandidate.currentStage === "Joining Letter Sent" && (
                    <div className="mt-3">
                      <small className="text-muted">
                        ✅ Joining letter sent on:{" "}
                        {selectedCandidate.joiningLetterDetails?.sentDate
                          ? new Date(
                              selectedCandidate.joiningLetterDetails.sentDate
                            ).toLocaleDateString()
                          : "Unknown date"}
                      </small>
                    </div>
                  )}
                </div>
              )}

              {/* Offer Letter Action Confirmation */}
              {actionType === "offer" && (
                <div
                  className="mb-4 p-3"
                  style={{
                    backgroundColor: "#fff3cd",
                    borderRadius: "4px",
                    border: "1px solid #ffc107",
                  }}
                >
                  <h6
                    className="mb-3 d-flex align-items-center"
                    style={{ color: "black" }}
                  >
                    <FaFileContract className="me-2" />
                    Send Offer Letter
                  </h6>

                  <div className="mb-3">
                    <label
                      className="form-label"
                      style={{ color: "black", fontWeight: "500" }}
                    >
                      <FaUpload className="me-2" />
                      Upload Offer Letter (PDF/DOC/DOCX/JPG/PNG)
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={handleOfferLetterFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
                      disabled={uploading}
                    />
                    <small className="text-muted">
                      Maximum file size: 10MB | Supported formats: PDF, DOC,
                      DOCX, JPG, PNG
                    </small>
                    {offerLetterFile && (
                      <div className="mt-2">
                        <small className="text-success d-flex align-items-center">
                          ✅ Selected file: {offerLetterFile.name}
                          {getFileIcon(offerLetterFile.name)}
                          <span className="ms-2">
                            ({formatFileSize(offerLetterFile.size)})
                          </span>
                        </small>
                      </div>
                    )}
                  </div>

                  <p style={{ color: "black" }}>
                    Are you sure you want to send Offer Letter to{" "}
                    <strong>{selectedCandidate.candidateName}</strong>?
                  </p>
                  <div className="d-flex gap-2 mt-3">
                    <button
                      className="btn d-flex align-items-center"
                      onClick={sendOfferLetter}
                      style={{
                        backgroundColor: "#ffc107",
                        color: "black",
                        border: "none",
                        padding: "8px 16px",
                        fontWeight: "500",
                      }}
                      disabled={!offerLetterFile || uploading}
                    >
                      {uploading ? (
                        <>
                          <div
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="me-2" />
                          {offerLetterFile
                            ? "Upload & Send Offer Letter"
                            : "Please select a file"}
                        </>
                      )}
                    </button>
                    <button
                      className="btn"
                      onClick={() => setActionType(null)}
                      style={{
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                      }}
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Joining Letter Action Confirmation */}
              {actionType === "joining" && (
                <div
                  className="mb-4 p-3"
                  style={{
                    backgroundColor: "#d4edda",
                    borderRadius: "4px",
                    border: "1px solid #28a745",
                  }}
                >
                  <h6
                    className="mb-3 d-flex align-items-center"
                    style={{ color: "black" }}
                  >
                    <FaFileAlt className="me-2" />
                    Send Joining Letter
                  </h6>

                  <div className="mb-3">
                    <label
                      className="form-label"
                      style={{ color: "black", fontWeight: "500" }}
                    >
                      <FaUpload className="me-2" />
                      Upload Joining Letter (PDF/DOC/DOCX/JPG/PNG)
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={handleJoiningLetterFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
                      disabled={uploading}
                    />
                    <small className="text-muted">
                      Maximum file size: 10MB | Supported formats: PDF, DOC,
                      DOCX, JPG, PNG
                    </small>
                    {joiningLetterFile && (
                      <div className="mt-2">
                        <small className="text-success d-flex align-items-center">
                          ✅ Selected file: {joiningLetterFile.name}
                          {getFileIcon(joiningLetterFile.name)}
                          <span className="ms-2">
                            ({formatFileSize(joiningLetterFile.size)})
                          </span>
                        </small>
                      </div>
                    )}
                  </div>

                  <p style={{ color: "black" }}>
                    Are you sure you want to send Joining Letter to{" "}
                    <strong>{selectedCandidate.candidateName}</strong>?
                  </p>
                  <div className="d-flex gap-2 mt-3">
                    <button
                      className="btn d-flex align-items-center"
                      onClick={sendJoiningLetter}
                      style={{
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        fontWeight: "500",
                      }}
                      disabled={!joiningLetterFile || uploading}
                    >
                      {uploading ? (
                        <>
                          <div
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="me-2" />
                          {joiningLetterFile
                            ? "Upload & Send Joining Letter"
                            : "Please select a file"}
                        </>
                      )}
                    </button>
                    <button
                      className="btn"
                      onClick={() => setActionType(null)}
                      style={{
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                      }}
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Candidate Details */}
              <div className="mb-4">
                <h6
                  className="mb-3"
                  style={{
                    color: "black",
                    borderBottom: "1px solid #e0e0e0",
                    paddingBottom: "8px",
                  }}
                >
                  <FaFileSignature className="me-2" />
                  Candidate Information
                </h6>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <DetailRow
                      icon={FaUser}
                      label="Name"
                      value={selectedCandidate.candidateName}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <DetailRow
                      icon={FaBriefcase}
                      label="Designation"
                      value={selectedCandidate.appliedFor?.designation}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <DetailRow
                      icon={FaPhone}
                      label="Mobile"
                      value={selectedCandidate.mobileNo}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <DetailRow
                      icon={FaEnvelope}
                      label="Email"
                      value={selectedCandidate.email}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <DetailRow
                      icon={FaCalendarAlt}
                      label="Interview Date"
                      value={
                        selectedCandidate.interviewDate
                          ? new Date(
                              selectedCandidate.interviewDate
                            ).toLocaleDateString()
                          : "Not scheduled"
                      }
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <DetailRow
                      icon={FaMoneyBillWave}
                      label="Expected Salary"
                      value={selectedCandidate.salaryExpectation}
                    />
                  </div>
                </div>

                {/* Show Offer Letter Details if sent */}
                {(selectedCandidate.offerLetterDetails?.file ||
                  selectedCandidate.offerLetterDetails?.sentDate) && (
                  <div
                    className="mt-3 p-3"
                    style={{ backgroundColor: "#fff3cd", borderRadius: "4px" }}
                  >
                    <h6
                      className="d-flex align-items-center mb-2"
                      style={{ color: "black" }}
                    >
                      <FaFileContract className="me-2" />
                      Offer Letter Details
                    </h6>
                    <div style={{ color: "black" }}>
                      <small>
                        {selectedCandidate.offerLetterDetails?.sentDate && (
                          <>
                            <strong>Sent Date:</strong>{" "}
                            {new Date(
                              selectedCandidate.offerLetterDetails.sentDate
                            ).toLocaleDateString()}
                            <br />
                          </>
                        )}
                        <strong>Status:</strong>{" "}
                        {selectedCandidate.offerLetterDetails?.accepted
                          ? "Accepted"
                          : selectedCandidate.offerLetterDetails?.file
                          ? "Sent"
                          : "Not Sent"}
                        {selectedCandidate.offerLetterDetails?.acceptedDate && (
                          <>
                            <br />
                            <strong>Accepted Date:</strong>{" "}
                            {new Date(
                              selectedCandidate.offerLetterDetails.acceptedDate
                            ).toLocaleDateString()}
                          </>
                        )}
                        {selectedCandidate.offerLetterDetails?.file && (
                          <>
                            <br />
                            <div className="d-flex align-items-center mt-1">
                              <strong>File:</strong>{" "}
                              {getFileIcon(
                                selectedCandidate.offerLetterDetails.file
                                  .originalName
                              )}
                              <span className="ms-2">
                                {
                                  selectedCandidate.offerLetterDetails.file
                                    .originalName
                                }
                              </span>
                              <span
                                className="text-muted ms-2"
                                style={{ fontSize: "11px" }}
                              >
                                (
                                {formatFileSize(
                                  selectedCandidate.offerLetterDetails.file
                                    .fileSize || 0
                                )}
                                )
                              </span>
                              <button
                                className="btn btn-sm d-flex align-items-center ms-2"
                                onClick={() =>
                                  viewFile(
                                    "offer",
                                    selectedCandidate.offerLetterDetails.file
                                      .filename,
                                    selectedCandidate.offerLetterDetails.file
                                      .originalName
                                  )
                                }
                                style={{
                                  backgroundColor: "#f8f9fa",
                                  color: "#0d6efd",
                                  border: "1px solid #ced4da",
                                  padding: "2px 8px",
                                  fontSize: "12px",
                                }}
                              >
                                <FaExternalLinkAlt
                                  className="me-1"
                                  style={{ fontSize: "10px" }}
                                />
                                View
                              </button>
                              <button
                                className="btn btn-sm d-flex align-items-center ms-1"
                                onClick={() =>
                                  downloadFile(
                                    "offer",
                                    selectedCandidate.offerLetterDetails.file
                                      .filename,
                                    selectedCandidate.offerLetterDetails.file
                                      .originalName
                                  )
                                }
                                style={{
                                  backgroundColor: "#f8f9fa",
                                  color: "#28a745",
                                  border: "1px solid #ced4da",
                                  padding: "2px 8px",
                                  fontSize: "12px",
                                }}
                              >
                                <FaDownload
                                  className="me-1"
                                  style={{ fontSize: "10px" }}
                                />
                                Download
                              </button>
                            </div>
                          </>
                        )}
                      </small>
                    </div>
                  </div>
                )}
                {/* Show Joining Letter Details if sent */}
                {(selectedCandidate.joiningLetterDetails?.file ||
                  selectedCandidate.joiningLetterDetails?.sentDate) && (
                  <div
                    className="mt-3 p-3"
                    style={{ backgroundColor: "#d4edda", borderRadius: "4px" }}
                  >
                    <h6
                      className="d-flex align-items-center mb-2"
                      style={{ color: "black" }}
                    >
                      <FaFileAlt className="me-2" />
                      Joining Letter Details
                    </h6>
                    <div style={{ color: "black" }}>
                      <small>
                        {selectedCandidate.joiningLetterDetails?.sentDate && (
                          <>
                            <strong>Sent Date:</strong>{" "}
                            {new Date(
                              selectedCandidate.joiningLetterDetails.sentDate
                            ).toLocaleDateString()}
                            <br />
                          </>
                        )}
                        <strong>Status:</strong>{" "}
                        {selectedCandidate.joiningLetterDetails?.received
                          ? "Received"
                          : selectedCandidate.joiningLetterDetails?.file
                          ? "Sent"
                          : "Not Sent"}
                        {selectedCandidate.joiningLetterDetails
                          ?.joiningDate && (
                          <>
                            <br />
                            <strong>Joining Date:</strong>{" "}
                            {new Date(
                              selectedCandidate.joiningLetterDetails.joiningDate
                            ).toLocaleDateString()}
                          </>
                        )}
                        {selectedCandidate.joiningLetterDetails
                          ?.receivedDate && (
                          <>
                            <br />
                            <strong>Received Date:</strong>{" "}
                            {new Date(
                              selectedCandidate.joiningLetterDetails.receivedDate
                            ).toLocaleDateString()}
                          </>
                        )}
                        {selectedCandidate.joiningLetterDetails?.file && (
                          <>
                            <br />
                            <div className="d-flex align-items-center mt-1">
                              <strong>File:</strong>{" "}
                              {getFileIcon(
                                selectedCandidate.joiningLetterDetails.file
                                  .originalName
                              )}
                              <span className="ms-2">
                                {
                                  selectedCandidate.joiningLetterDetails.file
                                    .originalName
                                }
                              </span>
                              <span
                                className="text-muted ms-2"
                                style={{ fontSize: "11px" }}
                              >
                                (
                                {formatFileSize(
                                  selectedCandidate.joiningLetterDetails.file
                                    .fileSize || 0
                                )}
                                )
                              </span>
                              <button
                                className="btn btn-sm d-flex align-items-center ms-2"
                                onClick={() =>
                                  viewFile(
                                    "joining",
                                    selectedCandidate.joiningLetterDetails.file
                                      .filename,
                                    selectedCandidate.joiningLetterDetails.file
                                      .originalName
                                  )
                                }
                                style={{
                                  backgroundColor: "#f8f9fa",
                                  color: "#0d6efd",
                                  border: "1px solid #ced4da",
                                  padding: "2px 8px",
                                  fontSize: "12px",
                                }}
                              >
                                <FaExternalLinkAlt
                                  className="me-1"
                                  style={{ fontSize: "10px" }}
                                />
                                View
                              </button>
                              <button
                                className="btn btn-sm d-flex align-items-center ms-1"
                                onClick={() =>
                                  downloadFile(
                                    "joining",
                                    selectedCandidate.joiningLetterDetails.file
                                      .filename,
                                    selectedCandidate.joiningLetterDetails.file
                                      .originalName
                                  )
                                }
                                style={{
                                  backgroundColor: "#f8f9fa",
                                  color: "#28a745",
                                  border: "1px solid #ced4da",
                                  padding: "2px 8px",
                                  fontSize: "12px",
                                }}
                              >
                                <FaDownload
                                  className="me-1"
                                  style={{ fontSize: "10px" }}
                                />
                                Download
                              </button>
                            </div>
                          </>
                        )}
                      </small>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-top">
                <div className="d-flex justify-content-end">
                  <button
                    className="btn"
                    onClick={closeDetails}
                    style={{
                      backgroundColor: "white",
                      color: "black",
                      border: "1px solid #ced4da",
                      padding: "8px 16px",
                      height: "40px",
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoiningData;
