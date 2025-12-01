// components/HRDashboard/modules/AddCandidate.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUserPlus,
  FaList,
  FaStar,
  FaFilePdf,
  FaUpload,
  FaCalculator,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaBriefcase,
  FaGraduationCap,
  FaBirthdayCake,
  FaCar,
  FaLanguage,
  FaMapMarkerAlt,
  FaHome,
  FaMoneyBillWave,
  FaDesktop,
  FaChartLine,
  FaCalendarAlt,
  FaIdCard,
  FaTimes,
  FaCheck,
  FaTimes as FaTimesIcon,
} from "react-icons/fa";

const AddCandidate = () => {
  const [activeTab, setActiveTab] = useState("add");
  const [vacancies, setVacancies] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [formData, setFormData] = useState({
    candidateName: "",
    mobileNo: "",
    email: "",
    designation: "",
    education: "",
    ageGroup: "",
    vehicle: false,
    location: "",
    nativePlace: "",
    spokenEnglish: false,
    salaryExpectation: "",
    administrative: 0,
    insuranceSales: 0,
    anySales: 0,
    fieldWork: 0,
    dataManagement: 0,
    backOffice: 0,
    mis: 0,
    appliedFor: "",
    interviewDate: "",
  });

  const [resume, setResume] = useState(null);

  useEffect(() => {
    fetchVacancies();
    fetchCandidates();
  }, []);

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/vacancynotice");
      setVacancies(response.data.vacancies || []);
    } catch (error) {
      console.error("Error fetching vacancies:", error);
      setVacancies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await axios.get("/api/addcandidate");
      setCandidates(response.data.candidates || []);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setCandidates([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.appliedFor) {
      alert("Please select a vacancy to apply for");
      return;
    }

    setSubmitLoading(true);

    const submitData = new FormData();

    // Append all form fields
    Object.keys(formData).forEach((key) => {
      if (typeof formData[key] === "boolean") {
        submitData.append(key, formData[key].toString());
      } else {
        submitData.append(key, formData[key]);
      }
    });

    if (resume) {
      submitData.append("resume", resume);
    }

    try {
      const response = await axios.post("/api/addcandidate/add", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        alert("Candidate added successfully!");
        resetForm();
        fetchCandidates();
        setActiveTab("view");
      } else {
        alert("Error adding candidate: " + response.data.message);
      }
    } catch (error) {
      console.error("Error adding candidate:", error);
      alert("Error adding candidate. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      candidateName: "",
      mobileNo: "",
      email: "",
      designation: "",
      education: "",
      ageGroup: "",
      vehicle: false,
      location: "",
      nativePlace: "",
      spokenEnglish: false,
      salaryExpectation: "",
      administrative: 0,
      insuranceSales: 0,
      anySales: 0,
      fieldWork: 0,
      dataManagement: 0,
      backOffice: 0,
      mis: 0,
      appliedFor: "",
      interviewDate: "",
    });
    setResume(null);
  };

  const calculateTotalMarks = (candidate = null) => {
    const data = candidate || formData;
    let marks = 0;

    // Education marks
    switch (data.education) {
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
    switch (data.ageGroup) {
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
    if (data.vehicle) marks += 4;

    // Experience fields marks
    marks +=
      parseInt(data.experienceFields?.administrative || data.administrative) ||
      0;
    marks +=
      parseInt(data.experienceFields?.insuranceSales || data.insuranceSales) ||
      0;
    marks += parseInt(data.experienceFields?.anySales || data.anySales) || 0;
    marks += parseInt(data.experienceFields?.fieldWork || data.fieldWork) || 0;

    // Operational activities marks
    marks +=
      parseInt(
        data.operationalActivities?.dataManagement || data.dataManagement
      ) || 0;
    marks +=
      parseInt(data.operationalActivities?.backOffice || data.backOffice) || 0;
    marks += parseInt(data.operationalActivities?.mis || data.mis) || 0;

    // Location marks
    const locationMarks = {
      "H.B Road": 4,
      "Arera Colony": 3,
      BHEL: 2,
      Mandideep: 2,
      Others: 1,
    };
    marks += locationMarks[data.location] || 0;

    // Native place marks
    if (data.nativePlace === "Bhopal") marks += 3;
    else marks += 1;

    // Spoken English marks
    if (data.spokenEnglish) marks += 4;

    // Salary expectation marks
    const salaryMarks = {
      "10K-12K": 4,
      "12-15K": 3,
      "15-18K": 3,
      "18-20K": 2,
      "20-25K": 2,
      "25K & Above": 1,
    };
    marks += salaryMarks[data.salaryExpectation] || 0;

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

  const totalMarks = calculateTotalMarks();

  return (
    <div className="p-4" style={{ backgroundColor: "white" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1" style={{ color: "black" }}>
            Candidate Management
          </h2>
          <p className="text-muted mb-0">Add and manage job candidates</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-4" style={{ borderBottom: "1px solid #e0e0e0" }}>
        <div className="d-flex">
          <button
            className={`px-4 py-2 me-2 ${
              activeTab === "add" ? "border-bottom border-2 border-dark" : ""
            }`}
            onClick={() => setActiveTab("add")}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: activeTab === "add" ? "black" : "#6c757d",
              fontWeight: activeTab === "add" ? "600" : "400",
            }}
          >
            <FaUserPlus className="me-2" />
            Add Candidate
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "view" ? "border-bottom border-2 border-dark" : ""
            }`}
            onClick={() => setActiveTab("view")}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: activeTab === "view" ? "black" : "#6c757d",
              fontWeight: activeTab === "view" ? "600" : "400",
            }}
          >
            <FaList className="me-2" />
            View Candidates ({candidates.length})
          </button>
        </div>
      </div>

      {/* Add Candidate Tab */}
      {activeTab === "add" && (
        <AddCandidateForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          resume={resume}
          setResume={setResume}
          vacancies={vacancies}
          loading={loading}
          submitLoading={submitLoading}
          totalMarks={totalMarks}
        />
      )}

      {/* View Candidates Tab */}
      {activeTab === "view" && (
        <ViewCandidates
          candidates={candidates}
          calculateTotalMarks={calculateTotalMarks}
          viewCandidateDetails={viewCandidateDetails}
        />
      )}

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <CandidateDetailsModal
          candidate={selectedCandidate}
          closeDetails={closeDetails}
          calculateTotalMarks={calculateTotalMarks}
        />
      )}
    </div>
  );
};

// Add Candidate Form Component - Simple Layout
const AddCandidateForm = ({
  formData,
  handleChange,
  handleSubmit,
  resume,
  setResume,
  vacancies,
  loading,
  submitLoading,
  totalMarks,
}) => (
  <form onSubmit={handleSubmit}>
    <div className="row">
      {/* Personal Details */}
      <div className="col-md-6 mb-4">
        <div className="mb-4">
          <h6 className="mb-3" style={{ color: "black", fontWeight: "600" }}>
            Personal Details
          </h6>
          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "black", fontSize: "14px" }}
            >
              Candidate Name *
            </label>
            <input
              type="text"
              className="form-control"
              name="candidateName"
              value={formData.candidateName}
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
              Mobile No *
            </label>
            <input
              type="text"
              className="form-control"
              name="mobileNo"
              value={formData.mobileNo}
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
              Email
            </label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              Designation
            </label>
            <input
              type="text"
              className="form-control"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              style={{
                backgroundColor: "white",
                color: "black",
                border: "1px solid #ced4da",
              }}
            />
          </div>
        </div>
      </div>

      {/* Education & Location */}
      <div className="col-md-6 mb-4">
        <div className="mb-4">
          <h6 className="mb-3" style={{ color: "black", fontWeight: "600" }}>
            Education & Location
          </h6>
          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "black", fontSize: "14px" }}
            >
              Education
            </label>
            <select
              className="form-control"
              name="education"
              value={formData.education}
              onChange={handleChange}
              style={{
                backgroundColor: "white",
                color: "black",
                border: "1px solid #ced4da",
              }}
            >
              <option value="">--Choose Education--</option>
              <option value="Graduate in any">Graduate in any</option>
              <option value="Graduate in Maths/Economics">
                Graduate in Maths/Economics
              </option>
              <option value="MBA/PG with financial subject">
                MBA/PG with financial subject
              </option>
            </select>
          </div>

          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "black", fontSize: "14px" }}
            >
              Age Group
            </label>
            <select
              className="form-control"
              name="ageGroup"
              value={formData.ageGroup}
              onChange={handleChange}
              style={{
                backgroundColor: "white",
                color: "black",
                border: "1px solid #ced4da",
              }}
            >
              <option value="">--Choose Age Group--</option>
              <option value="20-25yr">20-25yr</option>
              <option value="26-30yr">26-30yr</option>
              <option value="31-45yr">31-45yr</option>
              <option value="45 & above">45 & above</option>
            </select>
          </div>

          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "black", fontSize: "14px" }}
            >
              Location
            </label>
            <select
              className="form-control"
              name="location"
              value={formData.location}
              onChange={handleChange}
              style={{
                backgroundColor: "white",
                color: "black",
                border: "1px solid #ced4da",
              }}
            >
              <option value="">--Choose Location--</option>
              <option value="H.B Road">H.B Road</option>
              <option value="Arera Colony">Arera Colony</option>
              <option value="BHEL">BHEL</option>
              <option value="Mandideep">Mandideep</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "black", fontSize: "14px" }}
            >
              Native Place
            </label>
            <input
              type="text"
              className="form-control"
              name="nativePlace"
              value={formData.nativePlace}
              onChange={handleChange}
              style={{
                backgroundColor: "white",
                color: "black",
                border: "1px solid #ced4da",
              }}
            />
          </div>
        </div>
      </div>
    </div>

    {/* Skills & Preferences */}
    <div className="row">
      <div className="col-md-6 mb-4">
        <div className="mb-4">
          <h6 className="mb-3" style={{ color: "black", fontWeight: "600" }}>
            Skills & Preferences
          </h6>

          <div className="mb-3">
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                name="vehicle"
                checked={formData.vehicle}
                onChange={handleChange}
                id="vehicleCheck"
                style={{ border: "1px solid #6c757d" }}
              />
              <label
                className="form-check-label"
                style={{ color: "black", fontSize: "14px" }}
                htmlFor="vehicleCheck"
              >
                Has Vehicle
              </label>
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                name="spokenEnglish"
                checked={formData.spokenEnglish}
                onChange={handleChange}
                id="englishCheck"
                style={{ border: "1px solid #6c757d" }}
              />
              <label
                className="form-check-label"
                style={{ color: "black", fontSize: "14px" }}
                htmlFor="englishCheck"
              >
                Spoken English
              </label>
            </div>
          </div>

          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "black", fontSize: "14px" }}
            >
              Salary Expectation
            </label>
            <select
              className="form-control"
              name="salaryExpectation"
              value={formData.salaryExpectation}
              onChange={handleChange}
              style={{
                backgroundColor: "white",
                color: "black",
                border: "1px solid #ced4da",
              }}
            >
              <option value="">--Choose Salary--</option>
              <option value="10K-12K">10K-12K</option>
              <option value="12-15K">12-15K</option>
              <option value="15-18K">15-18K</option>
              <option value="18-20K">18-20K</option>
              <option value="20-25K">20-25K</option>
              <option value="25K & Above">25K & Above</option>
            </select>
          </div>

          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "black", fontSize: "14px" }}
            >
              Applied For *
            </label>
            {loading ? (
              <div
                className="form-control"
                style={{
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid #ced4da",
                }}
              >
                <small>Loading vacancies...</small>
              </div>
            ) : (
              <select
                className="form-control"
                name="appliedFor"
                value={formData.appliedFor}
                onChange={handleChange}
                required
                style={{
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid #ced4da",
                }}
              >
                <option value="">Select Vacancy</option>
                {vacancies.map((vacancy) => (
                  <option key={vacancy._id} value={vacancy._id}>
                    {vacancy.designation}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "black", fontSize: "14px" }}
            >
              Interview Date
            </label>
            <input
              type="date"
              className="form-control"
              name="interviewDate"
              value={formData.interviewDate}
              onChange={handleChange}
              style={{
                backgroundColor: "white",
                color: "black",
                border: "1px solid #ced4da",
              }}
            />
          </div>
        </div>
      </div>

      {/* Experience & Activities */}
      <div className="col-md-6 mb-4">
        <div className="mb-4">
          <h6 className="mb-3" style={{ color: "black", fontWeight: "600" }}>
            Experience & Activities (0-5)
          </h6>
          <div className="row">
            <div className="col-6 mb-3">
              <label
                className="form-label"
                style={{ color: "black", fontSize: "12px" }}
              >
                Administrative
              </label>
              <input
                type="number"
                className="form-control"
                name="administrative"
                value={formData.administrative}
                onChange={handleChange}
                min="0"
                max="5"
                style={{
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid #ced4da",
                }}
              />
            </div>
            <div className="col-6 mb-3">
              <label
                className="form-label"
                style={{ color: "black", fontSize: "12px" }}
              >
                Insurance Sales
              </label>
              <input
                type="number"
                className="form-control"
                name="insuranceSales"
                value={formData.insuranceSales}
                onChange={handleChange}
                min="0"
                max="5"
                style={{
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid #ced4da",
                }}
              />
            </div>
            <div className="col-6 mb-3">
              <label
                className="form-label"
                style={{ color: "black", fontSize: "12px" }}
              >
                Any Sales
              </label>
              <input
                type="number"
                className="form-control"
                name="anySales"
                value={formData.anySales}
                onChange={handleChange}
                min="0"
                max="5"
                style={{
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid #ced4da",
                }}
              />
            </div>
            <div className="col-6 mb-3">
              <label
                className="form-label"
                style={{ color: "black", fontSize: "12px" }}
              >
                Field Work
              </label>
              <input
                type="number"
                className="form-control"
                name="fieldWork"
                value={formData.fieldWork}
                onChange={handleChange}
                min="0"
                max="5"
                style={{
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid #ced4da",
                }}
              />
            </div>
            <div className="col-6 mb-3">
              <label
                className="form-label"
                style={{ color: "black", fontSize: "12px" }}
              >
                Data Management
              </label>
              <input
                type="number"
                className="form-control"
                name="dataManagement"
                value={formData.dataManagement}
                onChange={handleChange}
                min="0"
                max="5"
                style={{
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid #ced4da",
                }}
              />
            </div>
            <div className="col-6 mb-3">
              <label
                className="form-label"
                style={{ color: "black", fontSize: "12px" }}
              >
                Back Office
              </label>
              <input
                type="number"
                className="form-control"
                name="backOffice"
                value={formData.backOffice}
                onChange={handleChange}
                min="0"
                max="5"
                style={{
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid #ced4da",
                }}
              />
            </div>
            <div className="col-6 mb-3">
              <label
                className="form-label"
                style={{ color: "black", fontSize: "12px" }}
              >
                MIS
              </label>
              <input
                type="number"
                className="form-control"
                name="mis"
                value={formData.mis}
                onChange={handleChange}
                min="0"
                max="5"
                style={{
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid #ced4da",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Resume Upload & Grading */}
    <div className="row">
      <div className="col-md-6 mb-4">
        <div className="mb-4">
          <h6 className="mb-3" style={{ color: "black", fontWeight: "600" }}>
            Resume Upload
          </h6>
          <div className="mb-3">
            <div className="input-group">
              <input
                type="file"
                className="form-control"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setResume(e.target.files[0])}
                style={{
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid #ced4da",
                }}
              />
            </div>
            <small className="text-muted">
              PDF, DOC, DOCX, JPG, PNG (Max 5MB)
            </small>
          </div>
        </div>
      </div>

      <div className="col-md-6 mb-4">
        <div className="mb-4">
          <h6 className="mb-3" style={{ color: "black", fontWeight: "600" }}>
            Marks Calculation
          </h6>
          <div
            className="border p-4"
            style={{
              backgroundColor: "white",
              borderColor: "#e0e0e0",
            }}
          >
            <div className="text-center">
              <div className="mb-3">
                <FaCalculator style={{ fontSize: "2rem", color: "black" }} />
              </div>
              <div className="mb-2">
                <span
                  style={{
                    fontSize: "2rem",
                    fontWeight: "600",
                    color: "black",
                  }}
                >
                  {totalMarks} Points
                </span>
              </div>
              <div className="mb-1">
                <small style={{ color: "black" }}>
                  Total calculated marks based on form inputs
                </small>
              </div>
              <small className="text-muted">
                Minimum 20 points required for shortlisting
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Submit Button */}
    <div className="text-center mt-4">
      <button
        type="submit"
        className="btn px-5"
        disabled={submitLoading || loading}
        style={{
          backgroundColor: "black",
          color: "white",
          border: "1px solid black",
          padding: "10px 30px",
        }}
      >
        {submitLoading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" />
            Adding Candidate...
          </>
        ) : (
          <>
            <FaUserPlus className="me-2" />
            Add Candidate
          </>
        )}
      </button>
    </div>
  </form>
);

// View Candidates Component - Simple Layout
const ViewCandidates = ({
  candidates,
  calculateTotalMarks,
  viewCandidateDetails,
}) => (
  <div>
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h5 className="mb-0" style={{ color: "black" }}>
        All Candidates ({candidates.length})
      </h5>
      <div className="btn-group">
        <button
          className="btn btn-sm"
          style={{
            backgroundColor: "white",
            color: "black",
            border: "1px solid #ced4da",
          }}
        >
          All
        </button>
        <button
          className="btn btn-sm"
          style={{
            backgroundColor: "white",
            color: "black",
            border: "1px solid #ced4da",
          }}
        >
          Career Enquiry
        </button>
        <button
          className="btn btn-sm"
          style={{
            backgroundColor: "white",
            color: "black",
            border: "1px solid #ced4da",
          }}
        >
          Shortlisted
        </button>
      </div>
    </div>

    {candidates.length === 0 ? (
      <div className="text-center py-5" style={{ backgroundColor: "white" }}>
        <FaList className="display-1 text-muted mb-3" />
        <h5 style={{ color: "black" }}>No Candidates Found</h5>
        <p className="text-muted">Add your first candidate to get started</p>
      </div>
    ) : (
      <div className="table-responsive">
        <table className="table" style={{ backgroundColor: "white" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
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
                Education
              </th>
              <th
                style={{ color: "black", fontWeight: "600", padding: "12px" }}
              >
                Marks
              </th>
              <th
                style={{ color: "black", fontWeight: "600", padding: "12px" }}
              >
                Stage
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
                          {candidate.candidateName}
                        </strong>
                        <br />
                        <small className="text-muted">
                          {candidate.designation}
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
                    <small style={{ color: "black" }}>
                      {candidate.education}
                    </small>
                    <br />
                    <small className="text-muted">{candidate.ageGroup}</small>
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
                      {candidate.currentStage || "Not Set"}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn"
                        onClick={() => viewCandidateDetails(candidate)}
                        style={{
                          backgroundColor: "white",
                          color: "black",
                          border: "1px solid #ced4da",
                        }}
                        title="View Details"
                      >
                        <FaStar />
                      </button>
                      <button
                        className="btn"
                        style={{
                          backgroundColor: "white",
                          color: "black",
                          border: "1px solid #ced4da",
                        }}
                        title="Download Resume"
                      >
                        <FaFilePdf />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

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
                      Marks calculated based on candidate data
                    </p>
                  </div>
                </div>
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
                icon={FaBriefcase}
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

export default AddCandidate;
