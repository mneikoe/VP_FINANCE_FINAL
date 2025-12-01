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
} from "react-icons/fa";

const JoiningData = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [actionType, setActionType] = useState(null); // 'offer' or 'joining'

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
  };

  const closeDetails = () => {
    setSelectedCandidate(null);
    setActionType(null);
  };

  const handleOfferLetterAction = () => {
    setActionType("offer");
  };

  const handleJoiningLetterAction = () => {
    setActionType("joining");
  };

  const sendOfferLetter = async () => {
    try {
      const response = await axios.put(
        `/api/addcandidate/${selectedCandidate._id}/offer-letter`,
        {
          sentDate: new Date().toISOString(),
          accepted: false,
        }
      );

      if (response.data.success) {
        alert("✅ Offer Letter Sent status updated successfully!");
        fetchCandidates();
        closeDetails();
      }
    } catch (error) {
      console.error("Error sending offer letter:", error);
      alert("❌ Failed to update offer letter status");
    }
  };

  const sendJoiningLetter = async () => {
    try {
      const response = await axios.put(
        `/api/addcandidate/${selectedCandidate._id}/joining-letter`,
        {
          sentDate: new Date().toISOString(),
          received: false,
          joiningDate: null,
        }
      );

      if (response.data.success) {
        alert("✅ Joining Letter Sent status updated successfully!");
        fetchCandidates();
        closeDetails();
      }
    } catch (error) {
      console.error("Error sending joining letter:", error);
      alert("❌ Failed to update joining letter status");
    }
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => {
              const totalMarks = calculateTotalMarks(candidate);
              const currentStage = getCurrentStage(candidate);

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
                        <span>View</span>
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
              maxWidth: "700px",
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
                  <p style={{ color: "black" }}>
                    Are you sure you want to mark Offer Letter as sent for{" "}
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
                    >
                      <FaPaperPlane className="me-2" />
                      Yes, Send Offer Letter
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
                  <p style={{ color: "black" }}>
                    Are you sure you want to mark Joining Letter as sent for{" "}
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
                    >
                      <FaPaperPlane className="me-2" />
                      Yes, Send Joining Letter
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
                {selectedCandidate.offerLetterDetails?.sentDate && (
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
                        <strong>Sent Date:</strong>{" "}
                        {new Date(
                          selectedCandidate.offerLetterDetails.sentDate
                        ).toLocaleDateString()}
                        <br />
                        <strong>Status:</strong>{" "}
                        {selectedCandidate.offerLetterDetails.accepted
                          ? "Accepted"
                          : "Pending"}
                        {selectedCandidate.offerLetterDetails.acceptedDate && (
                          <>
                            <br />
                            <strong>Accepted Date:</strong>{" "}
                            {new Date(
                              selectedCandidate.offerLetterDetails.acceptedDate
                            ).toLocaleDateString()}
                          </>
                        )}
                      </small>
                    </div>
                  </div>
                )}

                {/* Show Joining Letter Details if sent */}
                {selectedCandidate.joiningLetterDetails?.sentDate && (
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
                        <strong>Sent Date:</strong>{" "}
                        {new Date(
                          selectedCandidate.joiningLetterDetails.sentDate
                        ).toLocaleDateString()}
                        <br />
                        <strong>Status:</strong>{" "}
                        {selectedCandidate.joiningLetterDetails.received
                          ? "Received"
                          : "Pending"}
                        {selectedCandidate.joiningLetterDetails.joiningDate && (
                          <>
                            <br />
                            <strong>Joining Date:</strong>{" "}
                            {new Date(
                              selectedCandidate.joiningLetterDetails.joiningDate
                            ).toLocaleDateString()}
                          </>
                        )}
                        {selectedCandidate.joiningLetterDetails
                          .receivedDate && (
                          <>
                            <br />
                            <strong>Received Date:</strong>{" "}
                            {new Date(
                              selectedCandidate.joiningLetterDetails.receivedDate
                            ).toLocaleDateString()}
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
