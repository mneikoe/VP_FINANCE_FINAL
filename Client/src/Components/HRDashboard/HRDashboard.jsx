// components/HRDashboard/HRDashboard.jsx
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HRDashboard.css";
import Sidebar from "./Sidebar.jsx";
import TopNavigation from "./TopNavigation.jsx";

// Import HR Dashboard Components
import HRDashboardHome from "./HRDashboardHome.jsx";
import Analytics from "./modules/Analytics.jsx";
import BusinessAssociates from "./modules/BusinessAssociates.jsx";
import VacancyManagement from "./modules/VacancyManagement.jsx";
import AddCandidate from "./modules/AddCandidate.jsx";
import CareerEnquiry from "./modules/CareerEnquiry.jsx";
import ResumeShortlist from "./modules/ResumeShortlist.jsx";
import InterviewProcess from "./modules/InterviewProcess.jsx";
import JoiningData from "./modules/JoiningData.jsx";
import AddEmployeeFromCandidates from "./modules/AddEmployeeFromCandidates.jsx";

// Import New Components
import InternshipStudents from "./modules/InternshipStudents.jsx";
import RulesRegulations from "./modules/RulesRegulations.jsx";
import FuturePlans from "./modules/FuturePlans.jsx";

const HRDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="hr-dashboard d-flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="hr-main-content d-flex flex-column flex-grow-1">
        {/* Top Navigation Bar */}
        <TopNavigation setSidebarOpen={setSidebarOpen} />

        {/* Main content area */}
        <main className="flex-grow-1 overflow-auto p-4">
          <Routes>
            {/* Default Dashboard Route */}
            <Route path="/" element={<HRDashboardHome />} />
            <Route path="/home" element={<HRDashboardHome />} />

            {/* HR Module Routes */}
            <Route path="/vacancies" element={<VacancyManagement />} />
            <Route path="/add-candidate" element={<AddCandidate />} />
            <Route path="/career-enquiry" element={<CareerEnquiry />} />
            <Route path="/resume-shortlist" element={<ResumeShortlist />} />
            <Route path="/interview-process" element={<InterviewProcess />} />
            <Route path="/joining-data" element={<JoiningData />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route
              path="/business-associates"
              element={<BusinessAssociates />}
            />
            <Route
              path="/add-employee-from-candidates"
              element={<AddEmployeeFromCandidates />}
            />

            {/* New Routes for Business Associates */}
            <Route
              path="/internship-students"
              element={<InternshipStudents />}
            />
            <Route path="/rules-regulations" element={<RulesRegulations />} />
            <Route path="/future-plans" element={<FuturePlans />} />

            {/* Catch all route - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default HRDashboard;
