// components/HRDashboard/modules/CareerEnquiry.jsx
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
} from "react-icons/fa";

const CareerEnquiry = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/addcandidate");

      let allCandidates = [];
      if (response.data && response.data.candidates) {
        allCandidates = response.data.candidates;
      } else if (Array.isArray(response.data)) {
        allCandidates = response.data;
      }

      const careerEnquiryCandidates = allCandidates.filter((candidate) => {
        const currentStage = (candidate.currentStage || "")
          .toString()
          .toLowerCase()
          .trim();
        const status = (candidate.status || "").toString().toLowerCase().trim();
        return (
          currentStage === "career enquiry" ||
          status === "career enquiry" ||
          !currentStage
        );
      });

      setCandidates(careerEnquiryCandidates || []);
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to load candidates");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  // Update candidate status - using the correct endpoint
  const updateStatus = async (candidateId, newStatus) => {
    try {
      console.log(`Updating candidate ${candidateId} to status: ${newStatus}`);

      // Use the stage update endpoint
      const response = await axios.put(
        `/api/addcandidate/${candidateId}/stage`,
        {
          currentStage: newStatus,
          interviewDate: null, // Add this if needed
        }
      );

      if (response.data && response.data.success) {
        alert(`Candidate moved to ${newStatus}`);
        fetchCandidates(); // Refresh the list
        if (selectedCandidate && selectedCandidate._id === candidateId) {
          setSelectedCandidate(null); // Close modal
        }
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
            Loading candidates...
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
            <FaList style={{ fontSize: "3rem", color: "black" }} />
          </div>
          <h6 className="mb-2" style={{ color: "black" }}>
            No Career Enquiry Candidates
          </h6>
          <p className="mb-4" style={{ color: "black" }}>
            Add candidates from "Add Candidate" page
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
                Email
              </th>
              <th
                style={{ color: "black", fontWeight: "600", padding: "12px" }}
              >
                Applied For
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

              return (
                <tr
                  key={candidate._id}
                  style={{ borderBottom: "1px solid #e0e0e0" }}
                >
                  <td style={{ padding: "12px" }}>
                    <div>
                      <strong style={{ color: "black" }}>
                        {candidate.candidateName || "Unnamed"}
                      </strong>
                      <br />
                      <small style={{ color: "black" }}>
                        {candidate.mobileNo || "No phone"}
                      </small>
                      <br />
                      <small style={{ color: "black" }}>
                        Marks: {totalMarks}
                      </small>
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div className="d-flex align-items-center">
                      <FaEnvelope className="me-2" style={{ color: "black" }} />
                      <span style={{ color: "black" }}>
                        {candidate.email || "No email"}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ color: "black" }}>
                      {candidate.appliedFor?.designation ||
                        candidate.appliedFor ||
                        "N/A"}
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        backgroundColor: "#f5f5f5",
                        color: "black",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      {candidate.currentStage ||
                        candidate.status ||
                        "No Status"}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm"
                        onClick={() => viewCandidateDetails(candidate)}
                        style={{
                          backgroundColor: "white",
                          color: "black",
                          border: "1px solid #ced4da",
                        }}
                      >
                        <FaEye className="me-1" />
                        View
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() =>
                          updateStatus(candidate._id, "Resume Shortlisted")
                        }
                        style={{
                          backgroundColor: "white",
                          color: "black",
                          border: "1px solid #28a745",
                        }}
                      >
                        <FaUserCheck className="me-1" />
                        Shortlist
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => updateStatus(candidate._id, "Rejected")}
                        style={{
                          backgroundColor: "white",
                          color: "black",
                          border: "1px solid #dc3545",
                        }}
                      >
                        <FaTimes className="me-1" />
                        Reject
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
            Career Enquiry
          </h2>
          <p className="mb-0" style={{ color: "black" }}>
            {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} in
            enquiry stage
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
      {selectedCandidate && (
        <CandidateDetailsModal
          candidate={selectedCandidate}
          closeDetails={closeDetails}
          updateStatus={updateStatus}
          calculateTotalMarks={calculateTotalMarks}
        />
      )}
    </div>
  );
};

// Candidate Details Modal Component
const CandidateDetailsModal = ({
  candidate,
  closeDetails,
  updateStatus,
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
                ID: {candidate._id?.substring(0, 8)}...
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

          {/* Marks Summary - SHOWS ONLY MARKS, NO SHORTLIST STATUS */}
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
                <small style={{ color: "black" }}>
                  Marks based on candidate profile
                </small>
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
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small style={{ color: "black" }}>
                  Last updated:{" "}
                  {new Date(
                    candidate.updatedAt || candidate.createdAt
                  ).toLocaleString()}
                </small>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn"
                  onClick={() =>
                    updateStatus(candidate._id, "Resume Shortlisted")
                  }
                  style={{
                    backgroundColor: "white",
                    color: "black",
                    border: "1px solid #28a745",
                  }}
                >
                  <FaUserCheck className="me-2" />
                  Shortlist Candidate
                </button>
                <button
                  className="btn"
                  onClick={() => updateStatus(candidate._id, "Rejected")}
                  style={{
                    backgroundColor: "white",
                    color: "black",
                    border: "1px solid #dc3545",
                  }}
                >
                  <FaTimes className="me-2" />
                  Reject Candidate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerEnquiry;
