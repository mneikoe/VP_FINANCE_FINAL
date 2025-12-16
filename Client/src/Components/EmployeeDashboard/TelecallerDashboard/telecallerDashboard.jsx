import React, { useState, useEffect } from "react";
import { logoutUser } from "../../../redux/feature/auth/authThunx";
import { useDispatch } from "react-redux";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  FaChartBar,
  FaUserPlus,
  FaCalendarAlt,
  FaPhone,
  FaClock,
  FaPhoneSlash,
  FaEllipsisH,
  FaTimes,
  FaUserCheck,
  FaSignOutAlt,
  FaChevronDown,
  FaUserTimes,
  FaBan,
  FaThumbsDown,
} from "react-icons/fa";

const TelecallerPanel = () => {
  const [active, setActive] = useState("Dashboard");
  const [activeLeadsOpen, setActiveLeadsOpen] = useState(false);
  const [rejectedLeadsOpen, setRejectedLeadsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/telecaller/dashboard", icon: <FaChartBar /> },
    {
      name: "Add Suspect",
      path: "/telecaller/suspect/add",
      icon: <FaUserPlus />,
    },
    {
      name: "Appointments",
      path: "/telecaller/appointments-scheduled",
      icon: <FaCalendarAlt />,
    },
    {
      name: "Active Leads",
      icon: <FaUserCheck />,
      hasDropdown: true,
      subItems: [
        {
          name: "Busy On Call",
          icon: <FaPhone />,
          path: "/telecaller/busy-on-another-call",
        },
        {
          name: "Call Later",
          icon: <FaClock />,
          path: "/telecaller/call-after-some-time",
        },
        {
          name: "Not Picked",
          icon: <FaPhoneSlash />,
          path: "/telecaller/call-not-picked",
        },
        { name: "Others", icon: <FaEllipsisH />, path: "/telecaller/others" },
      ],
    },
    {
      name: "Rejected Leads",
      icon: <FaUserTimes />,
      hasDropdown: true,
      subItems: [
        {
          name: "Wrong Number",
          icon: <FaBan />,
          path: "/telecaller/wrong-number",
        },
        {
          name: "Not Reachable",
          icon: <FaTimes />,
          path: "/telecaller/not-reachable",
        },
        {
          name: "Not Interested",
          icon: <FaThumbsDown />,
          path: "/telecaller/not-interested",
        },
      ],
    },
  ];

  // Update active state based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    let foundActive = menu.find((item) => item.path === currentPath);

    if (!foundActive) {
      // Check subItems
      for (const item of menu) {
        if (item.subItems) {
          const subItem = item.subItems.find((sub) => sub.path === currentPath);
          if (subItem) {
            setActive(subItem.name);
            return;
          }
        }
      }
    } else {
      setActive(foundActive.name);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth/login");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (activeLeadsOpen || rejectedLeadsOpen) &&
        !event.target.closest(".nav-dropdown-wrapper")
      ) {
        setActiveLeadsOpen(false);
        setRejectedLeadsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeLeadsOpen, rejectedLeadsOpen]);

  return (
    <div className="layout">
      {/* Top Navigation Bar */}
      <nav className="top-nav">
        <div className="nav-left">
          <div className="logo">
            <div className="logo-icon">
              <div className="logo-gradient">FN</div>
            </div>
            <div className="logo-content">
              <span className="logo-text">Financial Nest</span>
              <span className="logo-subtitle">Telecaller</span>
            </div>
          </div>
        </div>

        <div className="nav-center">
          <ul className="nav-menu">
            {menu.map((item) => (
              <li key={item.name} className="nav-menu-item">
                {item.hasDropdown ? (
                  <div className="nav-dropdown-wrapper">
                    <button
                      className={`nav-link ${
                        active === item.name ? "active" : ""
                      } ${
                        (item.name === "Active Leads" && activeLeadsOpen) ||
                        (item.name === "Rejected Leads" && rejectedLeadsOpen)
                          ? "dropdown-open"
                          : ""
                      }`}
                      onClick={() => {
                        if (item.name === "Active Leads") {
                          setActiveLeadsOpen(!activeLeadsOpen);
                          setRejectedLeadsOpen(false);
                        } else if (item.name === "Rejected Leads") {
                          setRejectedLeadsOpen(!rejectedLeadsOpen);
                          setActiveLeadsOpen(false);
                        }
                        setActive(item.name);
                      }}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-text">{item.name}</span>
                      <span className="dropdown-arrow">
                        <FaChevronDown />
                      </span>
                    </button>

                    <div
                      className={`nav-dropdown ${
                        (item.name === "Active Leads" && activeLeadsOpen) ||
                        (item.name === "Rejected Leads" && rejectedLeadsOpen)
                          ? "open"
                          : ""
                      }`}
                    >
                      {item.subItems.map((subItem) => (
                        <button
                          key={subItem.name}
                          className={`dropdown-item ${
                            active === subItem.name ? "active" : ""
                          }`}
                          onClick={() => {
                            setActive(subItem.name);
                            navigate(subItem.path);
                            if (item.name === "Active Leads")
                              setActiveLeadsOpen(false);
                            if (item.name === "Rejected Leads")
                              setRejectedLeadsOpen(false);
                          }}
                        >
                          <span className="dropdown-icon">{subItem.icon}</span>
                          <span className="dropdown-text">{subItem.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    className={`nav-link ${
                      active === item.name ? "active" : ""
                    }`}
                    onClick={() => {
                      setActive(item.name);
                      navigate(item.path);
                      setActiveLeadsOpen(false);
                      setRejectedLeadsOpen(false);
                    }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.name}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="nav-right">
          {/* Direct Logout Button */}
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">
              <FaSignOutAlt />
            </span>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">{active}</h1>
          <div className="breadcrumb">Telecaller Panel / {active}</div>
        </div>

        <div className="content-area">
          <Outlet />
        </div>
      </main>

      <style jsx>{`
        .layout {
          display: flex;
          flex-direction: column;
          height: 100vh;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          background: #f8fafc;
          overflow: hidden;
        }

        /* Top Navigation Bar */
        .top-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          padding: 8px 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 100;
          min-height: 56px;
        }

        .nav-left {
          flex: 0 0 auto;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
        }

        .logo-gradient {
          font-weight: 700;
          font-size: 12px;
          color: white;
        }

        .logo-content {
          display: flex;
          flex-direction: column;
        }

        .logo-text {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1;
        }

        .logo-subtitle {
          font-size: 10px;
          color: #64748b;
          font-weight: 500;
          margin-top: 1px;
        }

        .nav-center {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .nav-menu {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 2px;
        }

        .nav-menu-item {
          position: relative;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: none;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
          color: #475569;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .nav-link:hover {
          background: #f1f5f9;
          color: #334155;
        }

        .nav-link.active {
          background: #3b82f6;
          color: white;
        }

        .nav-link.dropdown-open {
          background: #f1f5f9;
        }

        .nav-icon {
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-text {
          font-size: 11px;
        }

        .dropdown-arrow {
          font-size: 9px;
          margin-left: 2px;
          transition: transform 0.2s ease;
          display: flex;
          align-items: center;
        }

        .nav-link.active .dropdown-arrow {
          color: white;
        }

        .nav-link.dropdown-open .dropdown-arrow {
          transform: rotate(180deg);
        }

        .nav-dropdown-wrapper {
          position: relative;
        }

        .nav-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          min-width: 160px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-5px);
          transition: all 0.2s ease;
          z-index: 1000;
          margin-top: 4px;
        }

        .nav-dropdown.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 11px;
          color: #64748b;
          transition: all 0.2s ease;
          border-radius: 4px;
          margin: 2px;
        }

        .dropdown-item:hover {
          background: #f1f5f9;
          color: #334155;
        }

        .dropdown-item.active {
          background: #3b82f6;
          color: white;
        }

        .dropdown-icon {
          font-size: 10px;
          width: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dropdown-text {
          font-size: 11px;
          text-align: left;
          flex: 1;
        }

        .nav-right {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
        }

        /* Direct Logout Button */
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          font-size: 11px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .logout-btn:hover {
          background: #fecaca;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
        }

        .logout-icon {
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logout-text {
          font-size: 11px;
          font-weight: 600;
        }

        /* Main Content */
        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .page-header {
          padding: 12px 16px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
        }

        .page-title {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
          line-height: 1.2;
        }

        .breadcrumb {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
          margin-top: 2px;
        }

        .content-area {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background: #f8fafc;
        }

        @media (max-width: 1024px) {
          .content-area {
            padding: 12px;
          }

          .nav-menu {
            gap: 1px;
          }

          .nav-link {
            padding: 6px 8px;
            font-size: 10px;
          }

          .nav-text {
            font-size: 10px;
          }

          .logout-btn {
            padding: 6px 10px;
            font-size: 10px;
          }
        }

        @media (max-width: 768px) {
          .top-nav {
            flex-wrap: wrap;
            min-height: auto;
            padding: 6px 12px;
          }

          .nav-center {
            order: 3;
            flex: 1 0 100%;
            margin-top: 6px;
          }

          .nav-menu {
            overflow-x: auto;
            justify-content: flex-start;
            padding-bottom: 4px;
          }

          .nav-link {
            padding: 4px 8px;
          }

          .logo-text {
            font-size: 12px;
          }

          .logout-text {
            display: none;
          }

          .logout-btn {
            padding: 6px;
          }
        }

        @media (max-width: 480px) {
          .nav-link .nav-text {
            display: none;
          }

          .nav-link {
            padding: 6px;
          }

          .logo-content {
            display: none;
          }

          .content-area {
            padding: 8px;
          }

          .page-title {
            font-size: 16px;
          }

          .logout-btn {
            padding: 5px;
          }
        }

        /* Custom scrollbar */
        .content-area::-webkit-scrollbar {
          width: 6px;
        }

        .content-area::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .content-area::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .content-area::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </div>
  );
};

export default TelecallerPanel;
