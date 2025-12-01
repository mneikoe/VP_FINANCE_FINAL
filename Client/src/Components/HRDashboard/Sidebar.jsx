// components/HRDashboard/Sidebar.jsx
import React from "react";
import {
  FaSignOutAlt,
  FaHome,
  FaFileAlt,
  FaUsers,
  FaChartBar,
  FaUserPlus,
  FaEnvelope,
  FaListAlt,
  FaUserCheck,
  FaBusinessTime,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: <FaHome /> },
    {
      name: "Vacancy Management",
      href: "/dashboard/vacancies",
      icon: <FaFileAlt />,
    },
    {
      name: "Add Candidate",
      href: "/dashboard/add-candidate",
      icon: <FaUserPlus />,
    },
    {
      name: "Career Enquiry",
      href: "/dashboard/career-enquiry",
      icon: <FaListAlt />,
    },
    {
      name: "Resume Shortlisted",
      href: "/dashboard/resume-shortlist",
      icon: <FaUserCheck />,
    },
    {
      name: "Interview Process",
      href: "/dashboard/interview-process",
      icon: <FaFileAlt />,
    },
    {
      name: "Joining Data",
      href: "/dashboard/joining-data",
      icon: <FaBusinessTime />,
    },
    {
      name: "Add Employee",
      href: "/dashboard/add-employee-from-candidates",
      icon: <FaUserPlus />,
    },
    {
      name: "Business Associates",
      href: "/dashboard/business-associates",
      icon: <FaUsers />,
    },
    { name: "Analytics", href: "/dashboard/analytics", icon: <FaChartBar /> },
  ];

  const isActive = (href) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="hr-sidebar-backdrop d-md-none"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`hr-sidebar d-flex flex-column ${
          sidebarOpen ? "" : "mobile-hidden"
        }`}
        style={{
          backgroundColor: "white",
          color: "black",
          borderRight: "1px solid #e0e0e0",
          width: "280px",
        }}
      >
        {/* Close button for mobile */}
        <div className="d-md-none text-end p-2 border-bottom">
          <button
            className="btn btn-sm btn-link text-dark"
            onClick={() => setSidebarOpen(false)}
            style={{ textDecoration: "none" }}
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 overflow-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`d-block text-decoration-none py-2 px-3 mb-1 ${
                isActive(item.href)
                  ? "border-start border-3 border-dark fw-bold"
                  : "text-dark"
              }`}
              onClick={() => setSidebarOpen(false)}
              style={{
                backgroundColor: isActive(item.href)
                  ? "#f8f9fa"
                  : "transparent",
                fontSize: "14px",
                transition: "none",
              }}
            >
              <div className="d-flex align-items-center">
                <span
                  className="me-3"
                  style={{ fontSize: "16px", minWidth: "20px" }}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </div>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-top">
          <button
            onClick={handleLogout}
            className="w-100 d-flex align-items-center justify-content-center py-2"
            style={{
              backgroundColor: "white",
              color: "black",
              border: "1px solid #dc3545",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <span className="me-2">
              <FaSignOutAlt />
            </span>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
