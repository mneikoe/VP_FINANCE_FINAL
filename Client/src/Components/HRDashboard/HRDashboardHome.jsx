// components/HRDashboard/HRDashboardHome.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaFileAlt,
  FaUserPlus,
  FaCalendarAlt,
  FaChartBar,
  FaUser,
  FaCalendar,
  FaUserCheck,
  FaBriefcase,
  FaUsers,
  FaEnvelope,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSync,
} from "react-icons/fa";

const HRDashboardHome = () => {
  const [stats, setStats] = useState({
    totalVacancies: 0,
    activeCandidates: 0,
    interviewsToday: 0,
    newApplications: 0,
    shortlistedCandidates: 0,
    businessAssociates: 0,
    totalEmployees: 0,
    offerLettersSent: 0,
  });

  const [recentCandidates, setRecentCandidates] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [recentVacancies, setRecentVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    conversionRate: 0,
    avgTimeToHire: 0,
    vacancyFillRate: 0,
    interviewSuccessRate: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data with error handling for each API call
      let vacancies = [];
      let candidates = [];
      let associates = [];
      let newApplications = [];

      try {
        // Fetch vacancies - FIXED: Handle both response structures
        const vacanciesRes = await axios.get("/api/vacancynotice");
        console.log("Vacancies API Response:", vacanciesRes.data);

        // Handle both response structures
        if (vacanciesRes.data.vacancies) {
          vacancies = vacanciesRes.data.vacancies;
        } else if (Array.isArray(vacanciesRes.data)) {
          vacancies = vacanciesRes.data;
        } else if (
          vacanciesRes.data.success &&
          Array.isArray(vacanciesRes.data.data)
        ) {
          vacancies = vacanciesRes.data.data;
        } else if (Array.isArray(vacanciesRes.data.data)) {
          vacancies = vacanciesRes.data.data;
        } else {
          console.warn(
            "Unexpected vacancies response structure:",
            vacanciesRes.data
          );
        }
      } catch (vacancyError) {
        console.error("Error fetching vacancies:", vacancyError);
        vacancies = [];
      }

      try {
        // Fetch candidates - FIXED: Handle both response structures
        const candidatesRes = await axios.get("/api/addcandidate");
        console.log("Candidates API Response:", candidatesRes.data);

        if (candidatesRes.data.candidates) {
          candidates = candidatesRes.data.candidates;
        } else if (Array.isArray(candidatesRes.data)) {
          candidates = candidatesRes.data;
        } else if (
          candidatesRes.data.success &&
          Array.isArray(candidatesRes.data.data)
        ) {
          candidates = candidatesRes.data.data;
        } else if (Array.isArray(candidatesRes.data.data)) {
          candidates = candidatesRes.data.data;
        } else {
          console.warn(
            "Unexpected candidates response structure:",
            candidatesRes.data
          );
        }
      } catch (candidateError) {
        console.error("Error fetching candidates:", candidateError);
        candidates = [];
      }

      try {
        // Fetch business associates - FIXED: Handle both response structures
        const associatesRes = await axios.get("/api/business-associates");
        console.log("Associates API Response:", associatesRes.data);

        if (associatesRes.data.data) {
          associates = associatesRes.data.data;
        } else if (Array.isArray(associatesRes.data)) {
          associates = associatesRes.data;
        } else if (
          associatesRes.data.success &&
          Array.isArray(associatesRes.data.data)
        ) {
          associates = associatesRes.data.data;
        } else {
          console.warn(
            "Unexpected associates response structure:",
            associatesRes.data
          );
        }
      } catch (associateError) {
        console.error("Error fetching business associates:", associateError);
        associates = [];
      }

      try {
        // Fetch new applications - FIXED: Handle both response structures
        const stagesRes = await axios.get(
          "/api/addcandidate/stage/Career%20Enquiry"
        );
        console.log("New Applications API Response:", stagesRes.data);

        if (stagesRes.data.candidates) {
          newApplications = stagesRes.data.candidates;
        } else if (Array.isArray(stagesRes.data)) {
          newApplications = stagesRes.data;
        } else if (
          stagesRes.data.success &&
          Array.isArray(stagesRes.data.data)
        ) {
          newApplications = stagesRes.data.data;
        } else if (Array.isArray(stagesRes.data.data)) {
          newApplications = stagesRes.data.data;
        } else {
          console.warn(
            "Unexpected applications response structure:",
            stagesRes.data
          );
        }
      } catch (stageError) {
        console.error("Error fetching new applications:", stageError);
        newApplications = [];
      }

      console.log("Processed Data:", {
        vacanciesCount: vacancies.length,
        candidatesCount: candidates.length,
        associatesCount: associates.length,
        newApplicationsCount: newApplications.length,
      });

      // Calculate interviews for today
      const today = new Date().toISOString().split("T")[0];
      const interviewsToday = candidates.filter((candidate) => {
        if (!candidate.interviewDate) return false;
        const interviewDate = new Date(candidate.interviewDate)
          .toISOString()
          .split("T")[0];
        return interviewDate === today;
      });

      // Calculate shortlisted candidates
      const shortlistedCandidates = candidates.filter(
        (candidate) =>
          candidate.currentStage === "Resume Shortlisted" ||
          candidate.shortlisted ||
          candidate.currentStatus === "Resume Shortlisted"
      );

      // Calculate recent data
      const recentCands = candidates
        .sort((a, b) => {
          const dateA = new Date(a.appliedDate || a.createdAt || a.updatedAt);
          const dateB = new Date(b.appliedDate || b.createdAt || b.updatedAt);
          return dateB - dateA;
        })
        .slice(0, 5);

      const upcomingInt = candidates
        .filter((candidate) => {
          if (!candidate.interviewDate) return false;
          const interviewDate = new Date(candidate.interviewDate);
          const now = new Date();
          const threeDaysLater = new Date(
            now.getTime() + 3 * 24 * 60 * 60 * 1000
          );
          return interviewDate > now && interviewDate <= threeDaysLater;
        })
        .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate))
        .slice(0, 5);

      const recentVacs = vacancies
        .sort((a, b) => {
          const dateA = new Date(a.createdDate || a.createdAt || a.updatedAt);
          const dateB = new Date(b.createdDate || b.createdAt || b.updatedAt);
          return dateB - dateA;
        })
        .slice(0, 3);

      // Calculate performance metrics
      const conversionRate =
        candidates.length > 0
          ? Math.round((shortlistedCandidates.length / candidates.length) * 100)
          : 0;

      const selectedCandidates = candidates.filter(
        (c) =>
          c.currentStage === "Selected" ||
          c.currentStage === "Joining Data" ||
          c.currentStatus === "Selected" ||
          c.currentStatus === "Joining Data"
      ).length;

      const vacancyFillRate =
        vacancies.length > 0
          ? Math.round((selectedCandidates / vacancies.length) * 100)
          : 0;

      const completedInterviews = candidates.filter(
        (c) =>
          c.currentStage === "Interview Process" ||
          c.currentStage === "Selected" ||
          c.currentStatus === "Interview Process" ||
          c.currentStatus === "Selected"
      ).length;

      const totalInterviews = candidates.filter(
        (c) =>
          c.interviewDate ||
          c.currentStage === "Interview Process" ||
          c.currentStage === "Selected"
      ).length;

      const interviewSuccessRate =
        totalInterviews > 0
          ? Math.round((completedInterviews / totalInterviews) * 100)
          : 0;

      // Update all states
      setStats({
        totalVacancies: vacancies.length,
        activeCandidates: candidates.length,
        interviewsToday: interviewsToday.length,
        newApplications: newApplications.length,
        shortlistedCandidates: shortlistedCandidates.length,
        businessAssociates: associates.length,
        totalEmployees: selectedCandidates,
        offerLettersSent: candidates.filter(
          (c) =>
            c.currentStage === "Offer Letter Sent" ||
            c.currentStatus === "Offer Letter Sent"
        ).length,
      });

      setRecentCandidates(recentCands);
      setUpcomingInterviews(upcomingInt);
      setRecentVacancies(recentVacs);

      setPerformanceMetrics({
        conversionRate,
        avgTimeToHire: 7, // Placeholder
        vacancyFillRate,
        interviewSuccessRate,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage) => {
    if (!stage) return "bg-secondary";

    const colors = {
      "Career Enquiry": "bg-primary",
      "Resume Shortlisted": "bg-info",
      "Interview Process": "bg-warning",
      Selected: "bg-success",
      "Joining Data": "bg-secondary",
      "Offer Letter Sent": "bg-purple",
      "Joining Letter Sent": "bg-indigo",
      "Added as Employee": "bg-teal",
      Rejected: "bg-danger",
    };

    return colors[stage] || "bg-secondary";
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return "badge bg-secondary";

    const statusMap = {
      Active: "success",
      Inactive: "secondary",
      Closed: "danger",
      "On Hold": "warning",
      Published: "info",
      Draft: "secondary",
    };
    return `badge bg-${statusMap[status] || "secondary"}`;
  };

  if (loading) {
    return (
      <div className="fade-in">
        <div className="mb-4">
          <h1 className="h2 fw-bold text-dark mb-1">Dashboard Overview</h1>
          <p className="text-muted mb-0">
            Welcome back! Loading your dashboard...
          </p>
        </div>
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Fetching dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header Section */}
      <div className="mb-4">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3">
          <div>
            <h1 className="h2 fw-bold text-dark mb-1">Dashboard Overview</h1>
            <p className="text-muted mb-0">
              Welcome back! Here's your recruitment summary
            </p>
          </div>
          <div className="mt-2 mt-sm-0">
            <button
              onClick={loadDashboardData}
              className="btn btn-outline-primary btn-sm"
            >
              <FaSync className="me-2" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="alert alert-warning alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* Stats Grid - 8 Cards */}
      <div className="row g-3 mb-4">
        {/* Total Vacancies */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="hr-stat-card h-100">
            <div className="d-flex align-items-center">
              <div className="hr-stat-icon me-3 bg-primary bg-opacity-10">
                <FaFileAlt className="text-primary" />
              </div>
              <div>
                <h6 className="text-muted mb-1">Total Vacancies</h6>
                <h3 className="fw-bold text-dark mb-0">
                  {stats.totalVacancies}
                </h3>
                <small className="text-muted">Active positions</small>
              </div>
            </div>
            <div className="mt-3 pt-2 border-top">
              <small className="text-success">
                <FaArrowUp className="me-1" />
                {recentVacancies.length} recent
              </small>
            </div>
          </div>
        </div>

        {/* Active Candidates */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="hr-stat-card h-100">
            <div className="d-flex align-items-center">
              <div className="hr-stat-icon me-3 bg-success bg-opacity-10">
                <FaUsers className="text-success" />
              </div>
              <div>
                <h6 className="text-muted mb-1">Active Candidates</h6>
                <h3 className="fw-bold text-dark mb-0">
                  {stats.activeCandidates}
                </h3>
                <small className="text-muted">In pipeline</small>
              </div>
            </div>
            <div className="mt-3 pt-2 border-top">
              <small className="text-primary">
                <FaEnvelope className="me-1" />
                {stats.newApplications} new applications
              </small>
            </div>
          </div>
        </div>

        {/* Interviews Today */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="hr-stat-card h-100">
            <div className="d-flex align-items-center">
              <div className="hr-stat-icon me-3 bg-info bg-opacity-10">
                <FaCalendarAlt className="text-info" />
              </div>
              <div>
                <h6 className="text-muted mb-1">Interviews Today</h6>
                <h3 className="fw-bold text-dark mb-0">
                  {stats.interviewsToday}
                </h3>
                <small className="text-muted">Scheduled</small>
              </div>
            </div>
            <div className="mt-3 pt-2 border-top">
              <small
                className={
                  stats.interviewsToday > 0 ? "text-warning" : "text-success"
                }
              >
                <FaClock className="me-1" />
                {stats.interviewsToday > 0 ? "Upcoming" : "No interviews"}
              </small>
            </div>
          </div>
        </div>

        {/* Business Associates */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="hr-stat-card h-100">
            <div className="d-flex align-items-center">
              <div className="hr-stat-icon me-3 bg-warning bg-opacity-10">
                <FaUserCheck className="text-warning" />
              </div>
              <div>
                <h6 className="text-muted mb-1">Business Associates</h6>
                <h3 className="fw-bold text-dark mb-0">
                  {stats.businessAssociates}
                </h3>
                <small className="text-muted">Total Associates</small>
              </div>
            </div>
            <div className="mt-3 pt-2 border-top">
              <small className="text-info">
                <FaUser className="me-1" />
                Managing partners
              </small>
            </div>
          </div>
        </div>

        {/* Shortlisted Candidates */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="hr-stat-card h-100">
            <div className="d-flex align-items-center">
              <div className="hr-stat-icon me-3 bg-purple bg-opacity-10">
                <FaCheckCircle className="text-purple" />
              </div>
              <div>
                <h6 className="text-muted mb-1">Shortlisted</h6>
                <h3 className="fw-bold text-dark mb-0">
                  {stats.shortlistedCandidates}
                </h3>
                <small className="text-muted">Candidates</small>
              </div>
            </div>
            <div className="mt-3 pt-2 border-top">
              <small className="text-success">
                <FaArrowUp className="me-1" />
                {performanceMetrics.conversionRate}% conversion
              </small>
            </div>
          </div>
        </div>

        {/* Total Employees */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="hr-stat-card h-100">
            <div className="d-flex align-items-center">
              <div className="hr-stat-icon me-3 bg-teal bg-opacity-10">
                <FaUser className="text-teal" />
              </div>
              <div>
                <h6 className="text-muted mb-1">Selected Candidates</h6>
                <h3 className="fw-bold text-dark mb-0">
                  {stats.totalEmployees}
                </h3>
                <small className="text-muted">Selected & Joined</small>
              </div>
            </div>
            <div className="mt-3 pt-2 border-top">
              <small className="text-teal">
                <FaBriefcase className="me-1" />
                {performanceMetrics.vacancyFillRate}% fill rate
              </small>
            </div>
          </div>
        </div>

        {/* Offer Letters Sent */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="hr-stat-card h-100">
            <div className="d-flex align-items-center">
              <div className="hr-stat-icon me-3 bg-indigo bg-opacity-10">
                <FaEnvelope className="text-indigo" />
              </div>
              <div>
                <h6 className="text-muted mb-1">Offer Letters</h6>
                <h3 className="fw-bold text-dark mb-0">
                  {stats.offerLettersSent}
                </h3>
                <small className="text-muted">Sent</small>
              </div>
            </div>
            <div className="mt-3 pt-2 border-top">
              <small className="text-indigo">
                <FaCheckCircle className="me-1" />
                Formal offers
              </small>
            </div>
          </div>
        </div>

        {/* New Applications */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="hr-stat-card h-100">
            <div className="d-flex align-items-center">
              <div className="hr-stat-icon me-3 bg-orange bg-opacity-10">
                <FaUserPlus className="text-orange" />
              </div>
              <div>
                <h6 className="text-muted mb-1">New Applications</h6>
                <h3 className="fw-bold text-dark mb-0">
                  {stats.newApplications}
                </h3>
                <small className="text-muted">This week</small>
              </div>
            </div>
            <div className="mt-3 pt-2 border-top">
              <small className="text-orange">
                <FaArrowUp className="me-1" />
                Career enquiries
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row g-4 mb-4">
        {/* Left Column - Quick Actions & Recent Vacancies */}
        <div className="col-12 col-lg-4">
          {/* Quick Actions */}
          <div className="hr-form-card mb-4">
            <h2 className="h6 fw-semibold text-dark mb-3">
              <FaChartBar className="me-2" />
              Quick Actions
            </h2>
            <div className="d-grid gap-2">
              <Link
                to="/dashboard/vacancies"
                className="btn btn-primary d-flex align-items-center"
              >
                <FaFileAlt className="me-2" />
                Create Vacancy
              </Link>
              <Link
                to="/dashboard/recruitment"
                className="btn btn-success d-flex align-items-center"
              >
                <FaUserPlus className="me-2" />
                Add Candidate
              </Link>
              <Link
                to="/dashboard/business-associates"
                className="btn btn-warning d-flex align-items-center"
              >
                <FaUserCheck className="me-2" />
                Add Business Associate
              </Link>
              <Link
                to="/dashboard/analytics"
                className="btn btn-info d-flex align-items-center"
              >
                <FaChartBar className="me-2" />
                View Reports
              </Link>
            </div>
          </div>

          {/* Recent Vacancies */}
          <div className="hr-form-card">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 className="h6 fw-semibold text-dark mb-0">
                <FaBriefcase className="me-2" />
                Recent Vacancies
              </h2>
              <Link
                to="/dashboard/vacancies"
                className="small text-primary text-decoration-none"
              >
                View all
              </Link>
            </div>
            <div>
              {recentVacancies.length > 0 ? (
                recentVacancies.map((vacancy) => (
                  <div
                    key={vacancy._id || vacancy.id}
                    className="border-bottom pb-3 mb-3"
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="fw-medium text-dark mb-1">
                          {vacancy.designation || "No designation"}
                        </h6>
                        <p className="small text-muted mb-2">
                          {vacancy.description || "No description"}
                        </p>
                        <div className="d-flex gap-2">
                          {Array.isArray(vacancy.publishPlatform) &&
                            vacancy.publishPlatform
                              .slice(0, 2)
                              .map((platform, idx) => (
                                <span
                                  key={idx}
                                  className="badge bg-light text-dark border"
                                >
                                  {platform}
                                </span>
                              ))}
                          {Array.isArray(vacancy.publishPlatform) &&
                            vacancy.publishPlatform.length > 2 && (
                              <span className="badge bg-light text-dark border">
                                +{vacancy.publishPlatform.length - 2}
                              </span>
                            )}
                        </div>
                      </div>
                      <span className={getStatusBadge(vacancy.status)}>
                        {vacancy.status || "Active"}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <small className="text-muted">
                        {formatDate(vacancy.createdDate || vacancy.createdAt)}
                      </small>
                      <Link
                        to={`/dashboard/vacancies`}
                        className="small text-primary"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted">
                  <FaBriefcase className="h3 mb-2" />
                  <p className="small mb-0">No vacancies posted yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle Column - Recent Candidates */}
        <div className="col-12 col-lg-4">
          <div className="hr-form-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 className="h6 fw-semibold text-dark mb-0">
                <FaUsers className="me-2" />
                Recent Candidates
              </h2>
              <Link
                to="/dashboard/recruitment"
                className="small text-primary text-decoration-none"
              >
                View all
              </Link>
            </div>
            <div>
              {recentCandidates.length > 0 ? (
                recentCandidates.map((candidate) => (
                  <div
                    key={candidate._id || candidate.id}
                    className="border-bottom pb-3 mb-3"
                  >
                    <div className="d-flex align-items-start">
                      <div className="flex-shrink-0">
                        <div
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                          style={{ width: "40px", height: "40px" }}
                        >
                          {candidate.candidateName?.charAt(0) || "C"}
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="fw-medium text-dark mb-1">
                              {candidate.candidateName || "No Name"}
                            </h6>
                            <p className="small text-muted mb-2">
                              {candidate.designation || "No designation"}
                            </p>
                          </div>
                          <span
                            className={`badge ${getStageColor(
                              candidate.currentStage || candidate.currentStatus
                            )}`}
                          >
                            {
                              (
                                candidate.currentStage ||
                                candidate.currentStatus ||
                                "Unknown"
                              )?.split(" ")[0]
                            }
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <small className="text-muted d-block">
                              {candidate.email || "No email"}
                            </small>
                            <small className="text-muted">
                              {candidate.mobileNo || "No mobile"}
                            </small>
                          </div>
                          <div className="text-end">
                            <small className="text-muted d-block">
                              Applied:{" "}
                              {formatDate(
                                candidate.appliedDate || candidate.createdAt
                              )}
                            </small>
                            {candidate.interviewDate && (
                              <small className="text-info">
                                Interview: {formatDate(candidate.interviewDate)}
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5 text-muted">
                  <FaUsers className="h3 mb-2" />
                  <p className="small mb-0">No candidates added yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Upcoming Interviews & Performance */}
        <div className="col-12 col-lg-4">
          {/* Upcoming Interviews */}
          <div className="hr-form-card mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 className="h6 fw-semibold text-dark mb-0">
                <FaCalendarAlt className="me-2" />
                Upcoming Interviews
              </h2>
              <Link
                to="/dashboard/recruitment"
                className="small text-primary text-decoration-none"
              >
                View all
              </Link>
            </div>
            <div>
              {upcomingInterviews.length > 0 ? (
                upcomingInterviews.map((interview) => (
                  <div
                    key={interview._id || interview.id}
                    className="border-bottom pb-3 mb-3"
                  >
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div
                          className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center"
                          style={{ width: "40px", height: "40px" }}
                        >
                          {interview.candidateName?.charAt(0) || "C"}
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="fw-medium text-dark mb-1">
                              {interview.candidateName || "No Name"}
                            </h6>
                            <p className="small text-muted mb-0">
                              {interview.designation || "No designation"}
                            </p>
                          </div>
                          <span className="badge bg-info">
                            {formatTime(interview.interviewDate)}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <small className="text-dark">
                            {interview.appliedFor?.designation || "N/A"}
                          </small>
                          <small className="text-muted">
                            {formatDate(interview.interviewDate)}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted">
                  <FaCalendarAlt className="h3 mb-2" />
                  <p className="small mb-0">No upcoming interviews</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="hr-form-card">
            <h2 className="h6 fw-semibold text-dark mb-3">
              <FaChartLine className="me-2" />
              Performance Metrics
            </h2>
            <div className="row g-2">
              <div className="col-6">
                <div className="text-center p-3 bg-primary bg-opacity-10 rounded">
                  <div className="h4 fw-bold text-primary mb-1">
                    {performanceMetrics.conversionRate}%
                  </div>
                  <p className="small fw-medium text-dark mb-0">Conversion</p>
                  <p
                    className="small text-muted mb-0"
                    style={{ fontSize: "0.7rem" }}
                  >
                    Rate
                  </p>
                </div>
              </div>

              <div className="col-6">
                <div className="text-center p-3 bg-success bg-opacity-10 rounded">
                  <div className="h4 fw-bold text-success mb-1">
                    {performanceMetrics.vacancyFillRate}%
                  </div>
                  <p className="small fw-medium text-dark mb-0">Fill</p>
                  <p
                    className="small text-muted mb-0"
                    style={{ fontSize: "0.7rem" }}
                  >
                    Rate
                  </p>
                </div>
              </div>

              <div className="col-6">
                <div className="text-center p-3 bg-info bg-opacity-10 rounded">
                  <div className="h4 fw-bold text-info mb-1">
                    {performanceMetrics.interviewSuccessRate}%
                  </div>
                  <p className="small fw-medium text-dark mb-0">Interview</p>
                  <p
                    className="small text-muted mb-0"
                    style={{ fontSize: "0.7rem" }}
                  >
                    Success
                  </p>
                </div>
              </div>

              <div className="col-6">
                <div className="text-center p-3 bg-warning bg-opacity-10 rounded">
                  <div className="h4 fw-bold text-warning mb-1">
                    {performanceMetrics.avgTimeToHire}d
                  </div>
                  <p className="small fw-medium text-dark mb-0">Avg Time</p>
                  <p
                    className="small text-muted mb-0"
                    style={{ fontSize: "0.7rem" }}
                  >
                    to Hire
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-top">
              <div className="d-flex justify-content-between">
                <small className="text-muted">Total Processed:</small>
                <small className="fw-medium text-dark">
                  {stats.activeCandidates}
                </small>
              </div>
              <div className="d-flex justify-content-between">
                <small className="text-muted">Pending Actions:</small>
                <small className="fw-medium text-warning">
                  {stats.newApplications + stats.interviewsToday}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="hr-form-card">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="h6 fw-semibold text-dark mb-0">
            <FaEye className="me-2" />
            Recent Activity Summary
          </h2>
          <span className="badge bg-light text-dark">
            Last Updated:{" "}
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="row">
          <div className="col-md-3">
            <div className="text-center p-3">
              <div className="h2 fw-bold text-primary">
                {stats.newApplications}
              </div>
              <small className="text-muted">New Applications</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center p-3">
              <div className="h2 fw-bold text-success">
                {stats.shortlistedCandidates}
              </div>
              <small className="text-muted">Shortlisted Today</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center p-3">
              <div className="h2 fw-bold text-warning">
                {stats.interviewsToday}
              </div>
              <small className="text-muted">Interviews Today</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center p-3">
              <div className="h2 fw-bold text-info">
                {recentVacancies.length}
              </div>
              <small className="text-muted">New Vacancies</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboardHome;
