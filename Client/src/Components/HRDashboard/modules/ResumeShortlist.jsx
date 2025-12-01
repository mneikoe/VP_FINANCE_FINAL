// components/HRDashboard/modules/ResumeShortlist.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaSync,
  FaExclamationTriangle,
  FaUserCheck,
  FaTimes,
  FaList,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaEye,
  FaCar,
  FaLanguage,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaMoneyBillWave,
  FaBriefcase,
  FaDesktop,
  FaChartLine,
  FaCalculator,
  FaCalendarAlt,
  FaUser,
  FaIdCard,
  FaHome,
  FaFileAlt,
  FaCheck,
  FaTimes as FaTimesIcon,
  FaCalendar,
  FaClipboardCheck,
} from "react-icons/fa";

const ResumeShortlist = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewDetails, setInterviewDetails] = useState({
    date: "",
    time: "",
    round: "1",
    interviewer: "",
    location: "",
  });

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try different endpoints
      const endpoints = [
        "/api/addcandidate/stage/Resume%20Shortlisted",
        "/api/addcandidate/status/Resume%20Shortlisted",
      ];

      let response = null;
      let apiError = false;

      for (const endpoint of endpoints) {
        try {
          response = await axios.get(endpoint);
          console.log(`API Response from ${endpoint}:`, response.data);

          // Check if response is valid (not HTML)
          if (
            response.data &&
            typeof response.data === "object" &&
            !response.data.includes &&
            (response.data.candidates || Array.isArray(response.data))
          ) {
            break;
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err.message);
          apiError = true;
          continue;
        }
      }

      // If endpoints failed or returned HTML, use fallback
      if (
        apiError ||
        !response ||
        (response.data &&
          typeof response.data === "string" &&
          response.data.includes("<!doctype html>"))
      ) {
        console.log("Using fallback method to fetch all candidates...");

        try {
          const allResponse = await axios.get("/api/addcandidate");
          console.log("All candidates response:", allResponse.data);

          let allCandidates = [];

          if (allResponse.data && allResponse.data.candidates) {
            allCandidates = allResponse.data.candidates;
          } else if (Array.isArray(allResponse.data)) {
            allCandidates = allResponse.data;
          } else {
            throw new Error("Invalid response format from /api/addcandidate");
          }

          console.log("Total candidates fetched:", allCandidates.length);

          // Filter for Resume Shortlisted status
          const shortlistedCandidates = allCandidates.filter((candidate) => {
            const currentStage = (candidate.currentStage || "")
              .toString()
              .toLowerCase()
              .trim();
            const currentStatus = (candidate.currentStatus || "")
              .toString()
              .toLowerCase()
              .trim();

            console.log(
              `Checking candidate ${candidate.candidateName}: stage=${currentStage}, status=${currentStatus}`
            );

            return (
              currentStage === "resume shortlisted" ||
              currentStatus === "resume shortlisted"
            );
          });

          console.log(
            "Shortlisted candidates found:",
            shortlistedCandidates.length
          );
          setCandidates(shortlistedCandidates || []);
        } catch (fallbackError) {
          console.error("Fallback fetch error:", fallbackError);
          setError("Failed to load candidates. Please check API connection.");
          setCandidates([]);
        }
      } else {
        // Handle successful API response
        let candidatesData = [];
        if (response.data && response.data.candidates) {
          candidatesData = response.data.candidates;
        } else if (Array.isArray(response.data)) {
          candidatesData = response.data;
        } else {
          // If response is object with success property
          candidatesData = response.data?.data || [];
        }

        console.log("Candidates from API:", candidatesData.length);
        setCandidates(candidatesData || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to load shortlisted candidates");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  // Update candidate status - using the stage endpoint
  const updateStatus = async (candidateId, newStatus, interviewDate = null) => {
    try {
      console.log(`Updating candidate ${candidateId} to status: ${newStatus}`);

      const response = await axios.put(
        `/api/addcandidate/${candidateId}/stage`,
        {
          currentStage: newStatus,
          interviewDate: interviewDate || null,
        }
      );

      if (response.data && response.data.success) {
        alert(`Candidate moved to ${newStatus}`);
        fetchCandidates();
        if (selectedCandidate && selectedCandidate._id === candidateId) {
          setSelectedCandidate(null);
        }
        setShowInterviewModal(false);
      } else {
        alert(
          "Error updating candidate: " +
            (response.data?.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Status update error:", error);
      alert(
        `Failed to update status: ${
          error.response?.data?.message || error.message
        }`
      );
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

  const viewCandidateDetails = (candidate) => {
    const totalMarks = calculateTotalMarks(candidate);
    setSelectedCandidate({
      ...candidate,
      totalMarks,
    });
  };

  const openInterviewModal = (candidate) => {
    setSelectedCandidate(candidate);
    setInterviewDetails({
      date: "",
      time: "",
      round: "1",
      interviewer: "",
      location: "Office",
    });
    setShowInterviewModal(true);
  };

  const closeInterviewModal = () => {
    setShowInterviewModal(false);
    setInterviewDetails({
      date: "",
      time: "",
      round: "1",
      interviewer: "",
      location: "Office",
    });
  };

  const handleInterviewSubmit = () => {
    if (!interviewDetails.date || !interviewDetails.time) {
      alert("Please select interview date and time");
      return;
    }

    const interviewDateTime = `${interviewDetails.date}T${interviewDetails.time}`;
    updateStatus(selectedCandidate._id, "Interview Process", interviewDateTime);
  };

  const closeDetails = () => {
    setSelectedCandidate(null);
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
            Loading shortlisted candidates...
          </p>
        </div>
      );
    }

    if (error && candidates.length === 0) {
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

    if (candidates.length === 0) {
      return (
        <div className="text-center py-5">
          <div className="mb-3">
            <FaUserCheck style={{ fontSize: "3rem", color: "black" }} />
          </div>
          <h6 className="mb-2" style={{ color: "black" }}>
            No Shortlisted Candidates
          </h6>
          <p className="mb-4" style={{ color: "black" }}>
            Shortlist candidates from "Career Enquiry" page first
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
                Applied For
              </th>
              <th
                style={{ color: "black", fontWeight: "600", padding: "12px" }}
              >
                Marks
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
                          {candidate.designation || "No designation"}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ color: "black" }}>{candidate.mobileNo}</div>
                    <small className="text-muted">{candidate.email}</small>
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
                      {totalMarks} pts
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div
                      className="d-flex flex-wrap gap-1"
                      style={{ minWidth: "200px" }}
                    >
                      <button
                        className="btn btn-sm d-flex align-items-center"
                        onClick={() => viewCandidateDetails(candidate)}
                        style={{
                          backgroundColor: "white",
                          color: "black",
                          border: "1px solid #ced4da",
                          fontSize: "11px",
                          padding: "4px 8px",
                          height: "28px",
                        }}
                      >
                        <FaEye className="me-1" style={{ fontSize: "10px" }} />
                        <span>View</span>
                      </button>
                      <button
                        className="btn btn-sm d-flex align-items-center"
                        onClick={() => openInterviewModal(candidate)}
                        style={{
                          backgroundColor: "white",
                          color: "black",
                          border: "1px solid #007bff",
                          fontSize: "11px",
                          padding: "4px 8px",
                          height: "28px",
                        }}
                      >
                        <FaCalendar
                          className="me-1"
                          style={{ fontSize: "10px" }}
                        />
                        <span>Interview</span>
                      </button>
                      <button
                        className="btn btn-sm d-flex align-items-center"
                        onClick={() => updateStatus(candidate._id, "Rejected")}
                        style={{
                          backgroundColor: "white",
                          color: "black",
                          border: "1px solid #dc3545",
                          fontSize: "11px",
                          padding: "4px 8px",
                          height: "28px",
                        }}
                      >
                        <FaTimes
                          className="me-1"
                          style={{ fontSize: "10px" }}
                        />
                        <span>Reject</span>
                      </button>
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

  const BooleanIcon = ({ value }) =>
    value ? (
      <FaCheck style={{ color: "black" }} />
    ) : (
      <FaTimesIcon style={{ color: "black" }} />
    );

  return (
    <div className="p-4" style={{ backgroundColor: "white" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1" style={{ color: "black" }}>
            Resume Shortlisted
          </h2>
          <p className="mb-0" style={{ color: "black" }}>
            {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}{" "}
            shortlisted
          </p>
        </div>
        <button
          className="btn btn-sm"
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
      {selectedCandidate && !showInterviewModal && (
        <CandidateDetailsModal
          candidate={selectedCandidate}
          closeDetails={closeDetails}
          calculateTotalMarks={calculateTotalMarks}
        />
      )}

      {/* Interview Schedule Modal */}
      {showInterviewModal && selectedCandidate && (
        <InterviewModal
          candidate={selectedCandidate}
          interviewDetails={interviewDetails}
          setInterviewDetails={setInterviewDetails}
          handleInterviewSubmit={handleInterviewSubmit}
          closeInterviewModal={closeInterviewModal}
        />
      )}
    </div>
  );
};

// Candidate Details Modal Component
const CandidateDetailsModal = ({
  candidate,
  closeDetails,
  calculateTotalMarks,
}) => {
  const totalMarks = calculateTotalMarks(candidate);

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

  const BooleanIcon = ({ value }) =>
    value ? (
      <FaCheck style={{ color: "black" }} />
    ) : (
      <FaTimesIcon style={{ color: "black" }} />
    );

  return (
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
          overflow: "auto",
        }}
      >
        <div className="p-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h5 style={{ color: "black" }}>
                <FaUser className="me-2" />
                {candidate.candidateName || "Candidate Details"}
              </h5>
              <p className="mb-0" style={{ color: "black" }}>
                Shortlisted Candidate
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

          {/* Marks Summary */}
          <div
            className="mb-4 p-3"
            style={{
              backgroundColor: "#f8f9fa",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
            }}
          >
            <div className="row align-items-center">
              <div className="col-md-6">
                <div className="d-flex align-items-center">
                  <FaCalculator
                    className="me-2"
                    style={{ color: "black", fontSize: "1.5rem" }}
                  />
                  <div>
                    <h4 className="mb-0" style={{ color: "black" }}>
                      {totalMarks} Points
                    </h4>
                    <p className="mb-0" style={{ color: "black" }}>
                      Total calculated marks
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 text-end">
                <small style={{ color: "black" }}>Status: Shortlisted</small>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Personal Details Column */}
            <div className="col-md-6 mb-4">
              <h6
                className="mb-3"
                style={{
                  color: "black",
                  borderBottom: "1px solid #e0e0e0",
                  paddingBottom: "8px",
                }}
              >
                <FaUser className="me-2" />
                Personal Details
              </h6>

              <DetailRow
                icon={FaIdCard}
                label="Name"
                value={candidate.candidateName}
              />
              <DetailRow
                icon={FaPhone}
                label="Mobile"
                value={candidate.mobileNo}
              />
              <DetailRow
                icon={FaEnvelope}
                label="Email"
                value={candidate.email}
              />
              <DetailRow
                icon={FaBriefcase}
                label="Designation"
                value={candidate.designation}
              />
              <DetailRow
                icon={FaGraduationCap}
                label="Education"
                value={candidate.education}
              />
              <DetailRow
                icon={FaBirthdayCake}
                label="Age Group"
                value={candidate.ageGroup}
              />

              <div className="d-flex">
                <DetailRow icon={FaCar} label="Has Vehicle">
                  <BooleanIcon value={candidate.vehicle} />
                </DetailRow>
                <div className="ms-4">
                  <DetailRow icon={FaLanguage} label="Spoken English">
                    <BooleanIcon value={candidate.spokenEnglish} />
                  </DetailRow>
                </div>
              </div>
            </div>

            {/* Location & Job Details Column */}
            <div className="col-md-6 mb-4">
              <h6
                className="mb-3"
                style={{
                  color: "black",
                  borderBottom: "1px solid #e0e0e0",
                  paddingBottom: "8px",
                }}
              >
                <FaMapMarkerAlt className="me-2" />
                Location & Job Details
              </h6>

              <DetailRow
                icon={FaMapMarkerAlt}
                label="Location"
                value={candidate.location}
              />
              <DetailRow
                icon={FaHome}
                label="Native Place"
                value={candidate.nativePlace}
              />
              <DetailRow
                icon={FaMoneyBillWave}
                label="Salary Expectation"
                value={candidate.salaryExpectation}
              />
              <DetailRow
                icon={FaFileAlt}
                label="Applied For"
                value={
                  candidate.appliedFor?.designation || candidate.appliedFor
                }
              />
              <DetailRow icon={FaCalendarAlt} label="Interview Date">
                {candidate.interviewDate
                  ? new Date(candidate.interviewDate).toLocaleDateString()
                  : "Not scheduled"}
              </DetailRow>
              <DetailRow
                icon={FaBriefcase}
                label="Current Status"
                value={candidate.currentStage || candidate.status}
              />
            </div>

            {/* Experience Scores */}
            <div className="col-12 mb-4">
              <h6
                className="mb-3"
                style={{
                  color: "black",
                  borderBottom: "1px solid #e0e0e0",
                  paddingBottom: "8px",
                }}
              >
                <FaChartLine className="me-2" />
                Experience Scores (0-5)
              </h6>

              <div className="row">
                <div className="col-md-3">
                  <DetailRow
                    label="Administrative"
                    value={
                      candidate.administrative ||
                      candidate.experienceFields?.administrative ||
                      0
                    }
                  />
                </div>
                <div className="col-md-3">
                  <DetailRow
                    label="Insurance Sales"
                    value={
                      candidate.insuranceSales ||
                      candidate.experienceFields?.insuranceSales ||
                      0
                    }
                  />
                </div>
                <div className="col-md-3">
                  <DetailRow
                    label="Any Sales"
                    value={
                      candidate.anySales ||
                      candidate.experienceFields?.anySales ||
                      0
                    }
                  />
                </div>
                <div className="col-md-3">
                  <DetailRow
                    label="Field Work"
                    value={
                      candidate.fieldWork ||
                      candidate.experienceFields?.fieldWork ||
                      0
                    }
                  />
                </div>
              </div>
            </div>

            {/* Operational Activities */}
            <div className="col-12 mb-4">
              <h6
                className="mb-3"
                style={{
                  color: "black",
                  borderBottom: "1px solid #e0e0e0",
                  paddingBottom: "8px",
                }}
              >
                <FaDesktop className="me-2" />
                Operational Activities (0-5)
              </h6>

              <div className="row">
                <div className="col-md-4">
                  <DetailRow
                    label="Data Management"
                    value={
                      candidate.dataManagement ||
                      candidate.operationalActivities?.dataManagement ||
                      0
                    }
                  />
                </div>
                <div className="col-md-4">
                  <DetailRow
                    label="Back Office"
                    value={
                      candidate.backOffice ||
                      candidate.operationalActivities?.backOffice ||
                      0
                    }
                  />
                </div>
                <div className="col-md-4">
                  <DetailRow
                    label="MIS"
                    value={
                      candidate.mis || candidate.operationalActivities?.mis || 0
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 pt-3 border-top">
            <div className="d-flex justify-content-end">
              <button
                className="btn"
                onClick={closeDetails}
                style={{
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid #ced4da",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Interview Schedule Modal Component
const InterviewModal = ({
  candidate,
  interviewDetails,
  setInterviewDetails,
  handleInterviewSubmit,
  closeInterviewModal,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInterviewDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
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
          maxWidth: "500px",
        }}
      >
        <div className="p-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h5 style={{ color: "black" }}>
                <FaCalendar className="me-2" />
                Schedule Interview
              </h5>
              <p className="mb-0" style={{ color: "black" }}>
                {candidate.candidateName}
              </p>
            </div>
            <button
              onClick={closeInterviewModal}
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

          {/* Interview Form */}
          <div className="mb-4">
            <div className="mb-3">
              <label
                className="form-label"
                style={{ color: "black", fontSize: "14px" }}
              >
                Interview Date *
              </label>
              <input
                type="date"
                className="form-control"
                name="date"
                value={interviewDetails.date}
                onChange={handleChange}
                required
                style={{
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid #ced4da",
                }}
              />
            </div>

            <div className="mb-3">
              <label
                className="form-label"
                style={{ color: "black", fontSize: "14px" }}
              >
                Interview Time *
              </label>
              <input
                type="time"
                className="form-control"
                name="time"
                value={interviewDetails.time}
                onChange={handleChange}
                required
                style={{
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid #ced4da",
                }}
              />
            </div>

            <div className="mb-3">
              <label
                className="form-label"
                style={{ color: "black", fontSize: "14px" }}
              >
                Interview Round
              </label>
              <select
                className="form-control"
                name="round"
                value={interviewDetails.round}
                onChange={handleChange}
                style={{
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid #ced4da",
                }}
              >
                <option value="1">Round 1</option>
                <option value="2">Round 2</option>
                <option value="3">Round 3</option>
              </select>
            </div>

            <div className="mb-3">
              <label
                className="form-label"
                style={{ color: "black", fontSize: "14px" }}
              >
                Interviewer Name
              </label>
              <input
                type="text"
                className="form-control"
                name="interviewer"
                value={interviewDetails.interviewer}
                onChange={handleChange}
                style={{
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid #ced4da",
                }}
                placeholder="Enter interviewer name"
              />
            </div>

            <div className="mb-4">
              <label
                className="form-label"
                style={{ color: "black", fontSize: "14px" }}
              >
                Interview Location
              </label>
              <select
                className="form-control"
                name="location"
                value={interviewDetails.location}
                onChange={handleChange}
                style={{
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid #ced4da",
                }}
              >
                <option value="Office">Office</option>
                <option value="Online">Online</option>
                <option value="Client Site">Client Site</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn d-flex align-items-center"
              onClick={closeInterviewModal}
              style={{
                backgroundColor: "white",
                color: "black",
                border: "1px solid #ced4da",
                padding: "6px 12px",
                height: "36px",
                whiteSpace: "nowrap",
              }}
            >
              Cancel
            </button>
            <button
              className="btn d-flex align-items-center"
              onClick={handleInterviewSubmit}
              style={{
                backgroundColor: "white",
                color: "black",
                border: "1px solid #007bff",
                padding: "6px 12px",
                height: "36px",
                whiteSpace: "nowrap",
              }}
            >
              <FaClipboardCheck
                className="me-2"
                style={{ fontSize: "14px", flexShrink: 0 }}
              />
              <span>Schedule Interview</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeShortlist;
