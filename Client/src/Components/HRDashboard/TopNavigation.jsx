// components/HRDashboard/TopNavigation.jsx
import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaCalendarAlt,
  FaUser,
  FaEnvelope,
  FaChevronDown,
  FaBell,
  FaCog,
} from "react-icons/fa";
import { Dropdown, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";

const TopNavigation = ({ setSidebarOpen }) => {
  const [currentTime, setCurrentTime] = useState("");
  const [notifications] = useState([
    { id: 1, text: "New candidate applied", time: "10 min ago", unread: true },
    {
      id: 2,
      text: "Interview scheduled for today",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      text: "Document requires approval",
      time: "2 hours ago",
      unread: false,
    },
  ]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user?.username || user?.name || "HR Manager";
  const userEmail = user?.email || "hr@company.com";
  const userRole = user?.role || "Human Resources";

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth/login";
  };

  return (
    <header
      className="hr-top-nav border-bottom shadow-sm"
      style={{
        backgroundColor: "#fff",
        borderColor: "#e0e0e0",
        height: "60px",
        position: "sticky",
        top: 0,
        zIndex: 1030,
      }}
    >
      <div className="container-fluid h-100">
        <div className="row align-items-center h-100 g-0">
          {/* Left Section - Mobile Menu & User Info */}
          <div className="col-md-6 d-flex align-items-center h-100">
            {/* Mobile Menu Button */}
            <button
              className="d-md-none btn btn-link text-dark p-2 me-2"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              style={{ minWidth: "40px" }}
            >
              <FaBars size={20} />
            </button>

            {/* User Info - Hidden on mobile, shown on tablet and up */}
            <div className="d-none d-md-flex align-items-center">
              {/* User Avatar */}
              <div
                className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3"
                style={{
                  width: "36px",
                  height: "36px",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>

              {/* User Details */}
              <div className="d-flex flex-column">
                <span
                  className="fw-semibold text-dark"
                  style={{ fontSize: "15px" }}
                >
                  {userName}
                </span>
                <small className="text-muted d-flex align-items-center">
                  <FaEnvelope size={10} className="me-1" />
                  {userEmail}
                </small>
              </div>
            </div>

            {/* Mobile User Info (only shows user name) */}
            <div className="d-md-none d-flex align-items-center ms-2">
              <div
                className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2"
                style={{
                  width: "32px",
                  height: "32px",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
              <span
                className="fw-semibold text-dark"
                style={{ fontSize: "14px" }}
              >
                {userName.split(" ")[0]}
              </span>
            </div>
          </div>

          {/* Right Section - Date, Time, Notifications, Profile */}
          <div className="col-md-6 h-100">
            <div className="d-flex justify-content-end align-items-center h-100">
              {/* Date & Time */}
              <div className="d-none d-lg-flex align-items-center me-4">
                <div className="d-flex flex-column text-end">
                  <small className="text-muted d-flex align-items-center justify-content-end">
                    <FaCalendarAlt size={12} className="me-1" />
                    {currentDate}
                  </small>
                  <div className="fw-semibold text-dark d-flex align-items-center">
                    <span style={{ fontSize: "14px" }}>{currentTime}</span>
                  </div>
                </div>
              </div>

              {/* Mobile Date (only date, no time) */}
              <div className="d-lg-none d-flex align-items-center me-3">
                <small className="text-muted">
                  {new Date().toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for responsiveness */}
      <style jsx>{`
        @media (max-width: 767.98px) {
          .hr-top-nav {
            height: 56px !important;
          }
          .container-fluid {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
        }

        @media (max-width: 575.98px) {
          .container-fluid {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
        }

        .dropdown-toggle::after {
          display: none !important;
        }

        .dropdown-item:active {
          background-color: #f8f9fa;
          color: #212529;
        }

        .btn-link:hover {
          color: #0d6efd !important;
        }
      `}</style>
    </header>
  );
};

export default TopNavigation;
