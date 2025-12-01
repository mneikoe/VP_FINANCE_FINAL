import React, { useState, useEffect } from "react";
import { logoutUser } from "../../../redux/feature/auth/authThunx";
import { useDispatch } from "react-redux";
import { useNavigate, Outlet } from "react-router-dom";
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
  FaChevronUp,
  FaBars,
  FaTimes as FaTimesIcon,
  FaHome,
  FaUser,
  FaBell,
  FaCog,
  FaFileAlt,
  FaHistory,
  FaUserTimes,
  FaBan,
  FaThumbsDown,
} from "react-icons/fa";

const TelecallerPanel = () => {
  const [active, setActive] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenu, setUserMenu] = useState(false);
  const [activeLeadsOpen, setActiveLeadsOpen] = useState(false);
  const [rejectedLeadsOpen, setRejectedLeadsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard", path: "/telecaller/dashboard", icon: <FaChartBar /> },
    {
      name: "Add New Suspect",
      path: "/telecaller/suspect/add",
      icon: <FaUserPlus />,
    },
    {
      name: "Monthly Appointments",
      path: "/telecaller/appointments",
      icon: <FaCalendarAlt />,
    },
    {
      name: "Active Leads",
      icon: <FaUserCheck />,
      hasDropdown: true,
      path: "/telecaller",
      subItems: [
        {
          name: "Busy On Another Call",
          icon: <FaPhone />,
          path: "/telecaller/busy-on-another-call",
        },
        {
          name: "Call After Some Time",
          icon: <FaClock />,
          path: "/telecaller/call-after-some-time",
        },
        {
          name: "Call Not Picked",
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

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth/login");
  };

  const handleUserMenuClick = () => {
    setUserMenu(!userMenu);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenu && !event.target.closest(".user-menu-wrapper")) {
        setUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenu]);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="layout">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && window.innerWidth < 768 && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <div className="logo-gradient">VP</div>
            </div>
            {sidebarOpen && (
              <div className="logo-content">
                <span className="logo-text">Financial Nest</span>
                <span className="logo-subtitle">Telecaller Portal</span>
              </div>
            )}
          </div>
          <button
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <span className="toggle-icon">‹</span>
            ) : (
              <span className="toggle-icon">›</span>
            )}
          </button>
        </div>

        {/* Mobile Close Button */}
        {sidebarOpen && window.innerWidth < 768 && (
          <div className="mobile-close-btn">
            <button onClick={() => setSidebarOpen(false)}>
              <FaTimesIcon />
            </button>
          </div>
        )}

        <nav className="sidebar-nav">
          <ul className="menu">
            {menu.map((item) => (
              <li key={item.name} className="menu-li">
                <div
                  className={`menu-item ${
                    active === item.name ? "active" : ""
                  } ${item.hasDropdown ? "has-dropdown" : ""}`}
                  onClick={() => {
                    if (item.hasDropdown) {
                      if (item.name === "Active Leads") {
                        setActiveLeadsOpen(!activeLeadsOpen);
                        navigate(item.path);
                      } else if (item.name === "Rejected Leads") {
                        setRejectedLeadsOpen(!rejectedLeadsOpen);
                      }
                      setActive(item.name);
                    } else {
                      setActive(item.name);
                      if (item.path) navigate(item.path);
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }
                  }}
                >
                  <div className="menu-item-content">
                    <span className="menu-icon">{item.icon}</span>
                    {sidebarOpen && (
                      <span className="menu-text">{item.name}</span>
                    )}
                    {sidebarOpen && item.hasDropdown && (
                      <span
                        className={`dropdown-arrow ${
                          (item.name === "Active Leads" && activeLeadsOpen) ||
                          (item.name === "Rejected Leads" && rejectedLeadsOpen)
                            ? "open"
                            : ""
                        }`}
                      >
                        <FaChevronDown />
                      </span>
                    )}
                  </div>
                  {!sidebarOpen && <div className="tooltip">{item.name}</div>}
                </div>

                {item.hasDropdown && sidebarOpen && (
                  <ul
                    className={`submenu ${
                      (item.name === "Active Leads" && activeLeadsOpen) ||
                      (item.name === "Rejected Leads" && rejectedLeadsOpen)
                        ? "open"
                        : ""
                    }`}
                  >
                    {item.subItems.map((subItem) => (
                      <li
                        key={subItem.name}
                        className={`submenu-item ${
                          active === subItem.name ? "active" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActive(subItem.name);
                          if (subItem.path) navigate(subItem.path);
                          if (window.innerWidth < 768) setSidebarOpen(false);
                        }}
                      >
                        <div className="submenu-content">
                          <span className="submenu-icon">{subItem.icon}</span>
                          <span className="submenu-text">{subItem.name}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {sidebarOpen && (
          <div className="sidebar-footer">
            {/* Logout Button */}
            <button onClick={handleLogout} className="logout-btn">
              <span className="logout-icon">
                <FaSignOutAlt />
              </span>
              {sidebarOpen && <span className="logout-text">Sign Out</span>}
            </button>

            <div className="user-card">
              <div className="user-avatar">
                <div className="avatar-gradient">TA</div>
              </div>
              <div className="user-details">
                <div className="user-name">Telecaller Agent</div>
                <div className="user-role">Premium Member</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Enhanced Main Content */}
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <FaBars />
            </button>
            <div>
              <h1 className="page-title">{active}</h1>
              <div className="breadcrumb">Telecaller Panel / {active}</div>
            </div>
          </div>
          <div className="topbar-right">
            <div className="user-menu-wrapper">
              <div
                className={`user-profile ${userMenu ? "active" : ""}`}
                onClick={handleUserMenuClick}
              >
                <div className="profile-avatar">TA</div>
                <div className="profile-info">
                  <span className="profile-name">Telecaller</span>
                  <span className="profile-role">Agent</span>
                </div>
                <span className={`profile-arrow ${userMenu ? "open" : ""}`}>
                  <FaChevronDown />
                </span>
              </div>

              {/* User Dropdown Menu */}
              {userMenu && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">TA</div>
                    <div className="dropdown-user-info">
                      <div className="dropdown-name">Telecaller Agent</div>
                      <div className="dropdown-email">
                        agent@financialnest.com
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item" onClick={handleLogout}>
                    <span className="dropdown-item-icon">
                      <FaSignOutAlt />
                    </span>
                    <span className="dropdown-item-text">Sign Out</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="content-area">
          <Outlet />
        </div>
      </main>

      <style jsx>{`
        .layout {
          display: flex;
          height: 100vh;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          background: #f8fafc;
          overflow: hidden;
        }

        /* Sidebar Backdrop for Mobile */
        .sidebar-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          display: block;
        }

        /* Enhanced Sidebar - Business Style */
        .sidebar {
          width: 280px;
          background: white;
          color: #1e293b;
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
          border-right: 1px solid #e5e7eb;
          z-index: 1000;
        }

        .sidebar.collapsed {
          width: 70px;
        }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            z-index: 1000;
            height: 100vh;
            left: 0;
            top: 0;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .sidebar:not(.collapsed) {
            transform: translateX(0);
          }

          .sidebar.collapsed {
            width: 280px;
            transform: translateX(-100%);
          }
        }

        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
          flex-shrink: 0;
        }

        .logo-gradient {
          font-weight: 700;
          font-size: 16px;
          color: white;
        }

        .logo-content {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .logo-text {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.2;
        }

        .logo-subtitle {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
          margin-top: 2px;
        }

        .toggle-btn {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #64748b;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          font-size: 12px;
          flex-shrink: 0;
        }

        .toggle-btn:hover {
          background: #e2e8f0;
          border-color: #cbd5e1;
        }

        .mobile-close-btn {
          display: none;
          padding: 10px 20px;
          text-align: right;
          border-bottom: 1px solid #e5e7eb;
        }

        .mobile-close-btn button {
          background: none;
          border: none;
          color: #64748b;
          font-size: 20px;
          cursor: pointer;
          padding: 5px;
          border-radius: 5px;
        }

        .mobile-close-btn button:hover {
          background: #f1f5f9;
        }

        @media (max-width: 768px) {
          .mobile-close-btn {
            display: block;
          }
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px 0;
          overflow-y: auto;
        }

        .menu {
          list-style: none;
          padding: 0 16px;
          margin: 0;
        }

        .menu-li {
          margin-bottom: 4px;
        }

        .menu-item {
          position: relative;
          padding: 12px 16px;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          color: #475569;
          font-weight: 500;
          margin: 2px 0;
        }

        .menu-item-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .dropdown-arrow {
          margin-left: auto;
          font-size: 12px;
          transition: transform 0.3s ease;
          color: #94a3b8;
          display: flex;
          align-items: center;
        }

        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        .submenu {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin: 0;
          padding: 0;
          list-style: none;
          background: #f8fafc;
          border-radius: 6px;
          margin-top: 2px;
          border-left: 2px solid #e2e8f0;
        }

        .submenu.open {
          max-height: 400px;
        }

        .submenu-item {
          padding: 10px 16px 10px 52px;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          color: #64748b;
          font-size: 13px;
          font-weight: 400;
          margin: 1px 0;
        }

        .submenu-content {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .submenu-item:hover {
          background: #f1f5f9;
          color: #334155;
        }

        .submenu-item.active {
          background: #3b82f6;
          color: white;
          font-weight: 500;
        }

        .submenu-icon {
          font-size: 12px;
          min-width: 16px;
          opacity: 0.8;
          display: flex;
          align-items: center;
        }

        .submenu-item.active .submenu-icon {
          opacity: 1;
        }

        .submenu-text {
          flex: 1;
          font-size: 13px;
        }

        .menu-icon {
          font-size: 16px;
          min-width: 20px;
          text-align: center;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .menu-text {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
        }

        .menu-item:hover {
          background: #f1f5f9;
          color: #334155;
        }

        .menu-item.active {
          background: #3b82f6;
          color: white;
        }

        .menu-item.active .menu-icon {
          color: white;
        }

        .menu-item.active::before {
          content: "";
          position: absolute;
          left: -16px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 24px;
          background: #3b82f6;
          border-radius: 0 2px 2px 0;
        }

        .tooltip {
          position: absolute;
          left: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%);
          background: #1e293b;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 1px solid #334155;
        }

        .menu-item:hover .tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(-50%) translateX(5px);
        }

        .tooltip::before {
          content: "";
          position: absolute;
          left: -4px;
          top: 50%;
          transform: translateY(-50%);
          border: 4px solid transparent;
          border-right-color: #1e293b;
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Logout Button */
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s ease;
          width: 100%;
        }

        .logout-btn:hover {
          background: #fecaca;
          transform: translateY(-1px);
        }

        .logout-icon {
          font-size: 16px;
          display: flex;
          align-items: center;
        }

        .logout-text {
          flex: 1;
          text-align: left;
        }

        .user-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .avatar-gradient {
          background: linear-gradient(135deg, #10b981, #059669);
          width: 100%;
          height: 100%;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: white;
        }

        .user-details {
          flex: 1;
          overflow: hidden;
        }

        .user-name {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 11px;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Enhanced Main Content */
        .main {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
          overflow: hidden;
          width: 100%;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 16px 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: #64748b;
          font-size: 20px;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .mobile-menu-btn:hover {
          background: #f1f5f9;
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }

        .page-title {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          line-height: 1.2;
        }

        .breadcrumb {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          margin-top: 2px;
        }

        .topbar-right {
          display: flex;
          align-items: center;
        }

        .user-menu-wrapper {
          position: relative;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
          border: 1px solid #e2e8f0;
          user-select: none;
        }

        .user-profile:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .user-profile.active {
          background: #e2e8f0;
          border-color: #94a3b8;
        }

        .profile-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 12px;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .profile-name {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
        }

        .profile-role {
          font-size: 11px;
          color: #64748b;
        }

        .profile-arrow {
          font-size: 12px;
          color: #64748b;
          transition: transform 0.3s ease;
          display: flex;
          align-items: center;
        }

        .profile-arrow.open {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          padding: 8px;
          z-index: 1000;
          min-width: 200px;
          animation: dropdownFadeIn 0.2s ease-out;
        }

        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 6px;
          background: #f8fafc;
          margin-bottom: 4px;
        }

        .dropdown-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 13px;
        }

        .dropdown-user-info {
          flex: 1;
        }

        .dropdown-name {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 2px;
        }

        .dropdown-email {
          font-size: 11px;
          color: #64748b;
        }

        .dropdown-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 8px 0;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
          color: #64748b;
        }

        .dropdown-item:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .dropdown-item-icon {
          font-size: 14px;
          width: 16px;
          text-align: center;
          display: flex;
          align-items: center;
        }

        .dropdown-item-text {
          font-size: 13px;
          font-weight: 500;
        }

        .content-area {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          background: #f8fafc;
        }

        @media (max-width: 1024px) {
          .content-area {
            padding: 20px;
          }

          .topbar {
            padding: 16px 20px;
          }
        }

        @media (max-width: 768px) {
          .content-area {
            padding: 16px;
          }

          .topbar {
            padding: 12px 16px;
          }

          .page-title {
            font-size: 20px;
          }
        }

        @media (max-width: 480px) {
          .user-profile .profile-info {
            display: none;
          }

          .topbar-left {
            flex: 1;
          }

          .content-area {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default TelecallerPanel;
