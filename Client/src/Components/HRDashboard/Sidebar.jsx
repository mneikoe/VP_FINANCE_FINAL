// components/HRDashboard/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { logoutUser } from "../../redux/feature/auth/authThunx";
import { useDispatch } from "react-redux";
import {
  FaSignOutAlt,
  FaHome,
  FaFileAlt,
  FaUsers,
  FaUserPlus,
  FaListAlt,
  FaUserCheck,
  FaBusinessTime,
  FaUserGraduate,
  FaRegFileAlt,
  FaCalendarAlt,
  FaBars,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dispatch = useDispatch();
  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setIsCollapsed(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, [setSidebarOpen]);

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
    {
      name: "Internship Students",
      href: "/dashboard/internship-students",
      icon: <FaUserGraduate />,
    },
    {
      name: "Rules & Regulations",
      href: "/dashboard/rules-regulations",
      icon: <FaRegFileAlt />,
    },
    {
      name: "Future Plans of Director",
      href: "/dashboard/future-plans",
      icon: <FaCalendarAlt />,
    },
  ];

  const isActive = (href) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth/login");
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const getSidebarWidth = () => {
    if (isMobile) {
      return sidebarOpen ? "280px" : "0";
    }
    return isCollapsed ? "80px" : "280px";
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      {isMobile && !sidebarOpen && (
        <button
          className="position-fixed top-3 start-3 btn btn-light shadow-sm rounded-circle p-2"
          style={{ zIndex: 1050 }}
          onClick={() => setSidebarOpen(true)}
        >
          <FaBars className="text-dark" />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`d-flex flex-column`}
        style={{
          backgroundColor: "white",
          color: "black",
          borderRight: "1px solid #e0e0e0",
          width: getSidebarWidth(),
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 1050,
          transition: "width 0.3s ease",
          transform:
            isMobile && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
          overflow: "hidden",
        }}
      >
        {/* Header with toggle button */}
        <div
          className="d-flex align-items-center justify-content-between p-3 border-bottom"
          style={{ minHeight: "60px" }}
        >
          {!isCollapsed && !isMobile && (
            <div className="d-flex align-items-center">
              <div
                className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3"
                style={{ width: "36px", height: "36px" }}
              >
                <span className="fw-bold text-dark">HR</span>
              </div>
              <h6 className="fw-bold mb-0 text-dark">HR Dashboard</h6>
            </div>
          )}

          {isCollapsed && !isMobile && (
            <div className="d-flex justify-content-center w-100">
              <div
                className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                style={{ width: "36px", height: "36px" }}
              >
                <span className="fw-bold text-dark">HR</span>
              </div>
            </div>
          )}

          {/* Toggle button - Desktop */}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="btn btn-light btn-sm rounded-circle p-1"
              style={{
                width: "30px",
                height: "30px",
                border: "1px solid #dee2e6",
              }}
            >
              {isCollapsed ? (
                <FaChevronRight className="text-dark" size={12} />
              ) : (
                <FaChevronLeft className="text-dark" size={12} />
              )}
            </button>
          )}

          {/* Close button - Mobile */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="btn btn-light btn-sm rounded-circle p-1"
              style={{
                width: "30px",
                height: "30px",
                border: "1px solid #dee2e6",
              }}
            >
              <FaChevronLeft className="text-dark" size={12} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 px-2 py-3 overflow-auto"
          style={{
            scrollbarWidth: "thin",
            msOverflowStyle: "none",
          }}
        >
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`d-block text-decoration-none py-2 px-3 mb-1 ${
                isActive(item.href)
                  ? "border-start border-3 border-dark fw-bold"
                  : "text-dark"
              }`}
              onClick={() => isMobile && setSidebarOpen(false)}
              style={{
                backgroundColor: isActive(item.href)
                  ? "#f8f9fa"
                  : "transparent",
                fontSize: "14px",
                borderRadius: "0",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={isCollapsed && !isMobile ? item.name : ""}
            >
              <div className="d-flex align-items-center">
                <span
                  className={isCollapsed && !isMobile ? "mx-auto" : "me-3"}
                  style={{
                    fontSize: "16px",
                    minWidth: "20px",
                  }}
                >
                  {item.icon}
                </span>
                {(!isCollapsed || isMobile) && <span>{item.name}</span>}
              </div>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-top">
          <button
            onClick={handleLogout}
            className={`w-100 d-flex align-items-center justify-content-center py-2 ${
              isCollapsed && !isMobile ? "px-2" : "px-3"
            }`}
            style={{
              backgroundColor: "white",
              color: "black",
              border: "1px solid #dc3545",
              fontSize: "14px",
              cursor: "pointer",
              borderRadius: "4px",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
            title={isCollapsed && !isMobile ? "Logout" : ""}
          >
            <span className={isCollapsed && !isMobile ? "mx-auto" : "me-2"}>
              <FaSignOutAlt />
            </span>
            {(!isCollapsed || isMobile) && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main content spacer - यही space create कर रहा था */}
      {!isMobile && (
        <div
          style={{
            width: getSidebarWidth(),
            minWidth: getSidebarWidth(),
            flexShrink: 0,
            transition: "width 0.3s ease",
          }}
        />
      )}

      {/* Add CSS */}
      <style jsx>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .overflow-auto::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .overflow-auto {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }

        /* Mobile responsive */
        @media (max-width: 767.98px) {
          .position-fixed {
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
