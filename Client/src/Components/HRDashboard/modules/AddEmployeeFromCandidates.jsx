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
  FaCheckCircle,
  FaEye,
  FaFileAlt,
  FaUserPlus,
  FaSpinner,
  FaTimes,
  FaUserCheck,
  FaList,
} from "react-icons/fa";
import EmployeeAddFormModal from "./EmployeeAddFormModal";

const AddEmployeeFromCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [addedEmployees, setAddedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [activeTab, setActiveTab] = useState("ready"); // 'ready' or 'added'

  useEffect(() => {
    fetchAllCandidates();
  }, []);

  const fetchAllCandidates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all candidates
      const response = await axios.get("/api/addcandidate");
      console.log("All candidates response:", response.data);

      let allCandidates = [];

      if (response.data && response.data.candidates) {
        allCandidates = response.data.candidates;
      } else if (Array.isArray(response.data)) {
        allCandidates = response.data;
      } else {
        throw new Error("Invalid response format");
      }

      // Filter candidates based on status
      const readyCandidates = allCandidates.filter((candidate) => {
        const currentStage = (candidate.currentStage || "")
          .toString()
          .toLowerCase()
          .trim();
        const currentStatus = (candidate.currentStatus || "")
          .toString()
          .toLowerCase()
          .trim();

        return (
          currentStage === "joining letter sent" ||
          currentStatus === "joining letter sent"
        );
      });

      const addedEmployeesList = allCandidates.filter((candidate) => {
        const currentStage = (candidate.currentStage || "")
          .toString()
          .toLowerCase()
          .trim();
        const currentStatus = (candidate.currentStatus || "")
          .toString()
          .toLowerCase()
          .trim();

        return (
          currentStage === "added as employee" ||
          currentStatus === "added as employee"
        );
      });

      console.log("Ready candidates:", readyCandidates);
      console.log("Added employees:", addedEmployeesList);

      setCandidates(readyCandidates);
      setAddedEmployees(addedEmployeesList);
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to load candidates");
      setCandidates([]);
      setAddedEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsEmployee = (candidate) => {
    console.log("Adding as employee:", candidate);
    setSelectedCandidate(candidate);
    setShowEmployeeForm(true);
  };

  const closeEmployeeForm = () => {
    setShowEmployeeForm(false);
    setSelectedCandidate(null);
  };

  const handleEmployeeAdded = () => {
    // Employee add होने के बाद refresh करो
    fetchAllCandidates();
    closeEmployeeForm();
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

  const renderReadyCandidates = () => {
    if (candidates.length === 0) {
      return (
        <div className="text-center py-5">
          <div className="mb-3">
            <FaFileAlt style={{ fontSize: "3rem", color: "black" }} />
          </div>
          <h6 className="mb-2" style={{ color: "black" }}>
            No Candidates Ready for Employment
          </h6>
          <p className="mb-4" style={{ color: "black" }}>
            Candidates with "Joining Letter Sent" status will appear here
          </p>
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
                    <span
                      style={{
                        backgroundColor: "#28a745",
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
                      <FaFileAlt style={{ fontSize: "11px" }} />
                      Joining Letter Sent
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm d-flex align-items-center"
                        onClick={() => handleAddAsEmployee(candidate)}
                        style={{
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          fontSize: "12px",
                          padding: "6px 12px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <FaUserPlus
                          className="me-1"
                          style={{ fontSize: "12px" }}
                        />
                        Add as Employee
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

  const renderAddedEmployees = () => {
    if (addedEmployees.length === 0) {
      return (
        <div className="text-center py-5">
          <div className="mb-3">
            <FaUserCheck style={{ fontSize: "3rem", color: "black" }} />
          </div>
          <h6 className="mb-2" style={{ color: "black" }}>
            No Employees Added Yet
          </h6>
          <p className="mb-4" style={{ color: "black" }}>
            Employees added from candidates will appear here
          </p>
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
                Employee
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
                Added Date
              </th>
            </tr>
          </thead>
          <tbody>
            {addedEmployees.map((employee) => {
              const totalMarks = calculateTotalMarks(employee);

              return (
                <tr
                  key={employee._id}
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
                        {employee.candidateName?.charAt(0) || "E"}
                      </div>
                      <div>
                        <strong style={{ color: "black" }}>
                          {employee.candidateName || "Unnamed"}
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
                      {employee.mobileNo || "N/A"}
                    </div>
                    <small className="text-muted">
                      {employee.email || "No email"}
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
                      {employee.appliedFor?.designation || "N/A"}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        backgroundColor: "#6c757d",
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
                      <FaUserCheck style={{ fontSize: "11px" }} />
                      Added as Employee
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div className="d-flex align-items-center">
                      <FaCalendarAlt
                        className="me-2"
                        style={{ color: "black", fontSize: "12px" }}
                      />
                      <small style={{ color: "black" }}>
                        {employee.updatedAt
                          ? new Date(employee.updatedAt).toLocaleDateString()
                          : "Not available"}
                      </small>
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
            Loading candidates data...
          </p>
        </div>
      );
    }

    if (error && candidates.length === 0 && addedEmployees.length === 0) {
      return (
        <div className="text-center py-5">
          <div className="mb-3">
            <FaExclamationTriangle
              style={{ fontSize: "3rem", color: "black" }}
            />
          </div>
          <h6 className="mb-2" style={{ color: "black" }}>
            No Data Found
          </h6>
          <p className="mb-4" style={{ color: "black" }}>
            {error}
          </p>
          <button
            className="btn"
            onClick={fetchAllCandidates}
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
      <div>
        {/* Tabs Navigation */}
        <div className="mb-4">
          <div className="d-flex border-bottom">
            <button
              className={`btn btn-tab ${activeTab === "ready" ? "active" : ""}`}
              onClick={() => setActiveTab("ready")}
              style={{
                backgroundColor: activeTab === "ready" ? "#28a745" : "white",
                color: activeTab === "ready" ? "white" : "black",
                border: "none",
                padding: "10px 20px",
                borderTopLeftRadius: "4px",
                borderTopRightRadius: "4px",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaFileAlt />
              Ready for Employment
              <span className="badge bg-light text-dark ms-2">
                {candidates.length}
              </span>
            </button>
            <button
              className={`btn btn-tab ${activeTab === "added" ? "active" : ""}`}
              onClick={() => setActiveTab("added")}
              style={{
                backgroundColor: activeTab === "added" ? "#6c757d" : "white",
                color: activeTab === "added" ? "white" : "black",
                border: "none",
                padding: "10px 20px",
                borderTopLeftRadius: "4px",
                borderTopRightRadius: "4px",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaUserCheck />
              Already Added as Employee
              <span className="badge bg-light text-dark ms-2">
                {addedEmployees.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "ready"
            ? renderReadyCandidates()
            : renderAddedEmployees()}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4" style={{ backgroundColor: "white" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1" style={{ color: "black" }}>
            Add Employee from Candidates
          </h2>
          <p className="mb-0" style={{ color: "black" }}>
            {activeTab === "ready"
              ? `${candidates.length} candidate${
                  candidates.length !== 1 ? "s" : ""
                } ready for employment`
              : `${addedEmployees.length} employee${
                  addedEmployees.length !== 1 ? "s" : ""
                } already added`}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm d-flex align-items-center"
            onClick={fetchAllCandidates}
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

      {/* Employee Add Form Modal */}
      {showEmployeeForm && selectedCandidate && (
        <EmployeeAddFormModal
          candidate={selectedCandidate}
          onClose={closeEmployeeForm}
          onEmployeeAdded={handleEmployeeAdded}
        />
      )}
    </div>
  );
};

export default AddEmployeeFromCandidates;
