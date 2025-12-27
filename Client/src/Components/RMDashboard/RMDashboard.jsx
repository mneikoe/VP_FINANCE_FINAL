import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { logoutUser } from "../../redux/feature/auth/authThunx";
import { useDispatch } from "react-redux";
import axios from "../../config/axios";
import {
  FaSignOutAlt,
  FaHome,
  FaUser,
  FaUsers,
  FaTasks,
  FaFileAlt,
  FaChartLine,
  FaHistory,
  FaMoneyBillAlt,
  FaImage,
  FaBriefcase,
  FaMapMarkedAlt,
  FaClipboardList,
  FaUserTie,
  FaBars,
  FaChevronDown,
  FaChevronUp,
  FaDownload,
  FaTimes,
} from "react-icons/fa";

import RMDashboardHome from "./RMDashboardHome";
import Profile from "./modules/Profile";
import AreaOfWork from "./modules/AreaOfWork";
import TaskSummary from "./modules/TaskSummary";
import AssignedTasks from "./modules/AssignedSuspects";
import RMSuspectDetailsPage from "./modules/RMSuspectDetailsPage";

const PlaceholderComponent = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
    <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>
    <p className="text-gray-600 mb-6">This page is under construction.</p>
    <button
      className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors"
      onClick={() => window.history.back()}
    >
      Go Back
    </button>
  </div>
);

const RMDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });
  const [assignedSuspects, setAssignedSuspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    completed: 0,
    pending: 0,
    upcomingAppointments: 0,
    todayAppointments: 0,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (!userData || userData.role !== "RM") {
      navigate("/auth/login");
      return;
    }
    setUser(userData);
    fetchAssignedSuspects();
  }, [navigate]);

  const fetchAssignedSuspects = async () => {
    try {
      setLoading(true);

      const rmId = user?.id;

      if (!rmId) {
        console.error("❌ No RM ID found!");
        setAssignedSuspects([]);
        setLoading(false);
        return;
      }

      const response = await axios.get("/api/rm/assigned-suspects", {
        params: { rmId: rmId },
      });

      if (response.data.success) {
        setAssignedSuspects(response.data.data || []);
      } else {
        console.error("❌ API Error:", response.data.message);
        setAssignedSuspects([]);
      }
    } catch (error) {
      console.error("❌ Error fetching assigned suspects:", error);
      console.error("❌ Error response:", error.response?.data);
      setAssignedSuspects([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (suspects) => {
    // ✅ parameter name change
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = suspects.filter((suspect) => {
      // ✅ variable name change
      if (!suspect.appointmentDate) return false;
      const aptDate = new Date(suspect.appointmentDate);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate.getTime() === today.getTime();
    }).length;

    const upcomingCount = suspects.filter((suspect) => {
      if (!suspect.appointmentDate) return false;
      const aptDate = new Date(suspect.appointmentDate);
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return aptDate >= today && aptDate <= nextWeek;
    }).length;

    const completedCount = suspects.filter(
      (s) => s.assignmentStatus === "completed"
    ).length;

    setStats({
      totalAssigned: suspects.length,
      completed: completedCount,
      pending: suspects.length - completedCount,
      upcomingAppointments: upcomingCount,
      todayAppointments: todayCount,
    });
  };

  // और useEffect में call करो:
  useEffect(() => {
    if (assignedSuspects.length > 0) {
      calculateStatistics(assignedSuspects);
    }
  }, [assignedSuspects]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth/login");
  };

  const navigation = [
    { name: "Dashboard", href: "/rm/dashboard", icon: <FaHome size={14} /> },
    { name: "Profile", href: "/rm/profile", icon: <FaUser size={14} /> },
    {
      name: "Customer Master",
      href: "/rm/customer-master",
      icon: <FaUserTie size={14} />,
    },
    {
      name: "Area of Work",
      href: "/rm/area-of-work",
      icon: <FaMapMarkedAlt size={14} />,
    },
    {
      name: "Work Description",
      href: "/rm/work-description",
      icon: <FaClipboardList size={14} />,
    },
    {
      name: "Task Summary",
      href: "/rm/task-summary",
      icon: <FaTasks size={14} />,
    },
    {
      name: "Task Status",
      href: "/rm/task-status",
      icon: <FaChartLine size={14} />,
    },
    {
      name: "Salary History",
      href: "/rm/salary-history",
      icon: <FaMoneyBillAlt size={14} />,
    },
    {
      name: "Incentive History",
      href: "/rm/incentive-history",
      icon: <FaHistory size={14} />,
    },
    {
      name: "Assigned Suspects",
      href: "/rm/assigned-suspects",
      icon: <FaBriefcase size={14} />,
      count: assignedSuspects.length,
    },
  ];

  const isActive = (href) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  const getPageTitle = () => {
    if (location.pathname.includes("/rm/dashboard")) return "Dashboard";
    if (location.pathname.includes("/rm/profile")) return "Profile";
    if (location.pathname.includes("/rm/customer-master"))
      return "Customer Master";
    if (location.pathname.includes("/rm/area-of-work")) return "Area of Work";
    if (location.pathname.includes("/rm/work-description"))
      return "Work Description";
    if (location.pathname.includes("/rm/task-summary")) return "Task Summary";
    if (location.pathname.includes("/rm/task-status")) return "Task Status";
    if (location.pathname.includes("/rm/salary-history"))
      return "Salary History";
    if (location.pathname.includes("/rm/incentive-history"))
      return "Incentive History";
    if (location.pathname.includes("/rm/assigned-suspects"))
      return "Assigned Suspects";
    return "RM Dashboard";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔴 TOP NAVBAR - PURE TAILWIND */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 py-2 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14">
            {/* LEFT: Logo & Mobile Menu Toggle */}
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
              >
                {mobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
              </button>
            </div>

            {/* CENTER: Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-0.5">
              <div className="flex items-center bg-white border border-gray-200 rounded-lg px-1 pt-2 pb-2 shadow-sm">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.href)}
                    className={`flex items-center px-3 py-1.5 mx-0.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-black text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <span className="mr-1.5">{item.icon}</span>
                    <div className="text-[10px]  leading-tight">
                      {item.name}
                    </div>
                    {item.count !== undefined && (
                      <span className="ml-1.5 h-4 w-4 flex items-center justify-center text-[10px] font-bold bg-gray-700 text-white rounded-full">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: User Info & Logout - MODIFIED */}
            <div className="flex items-center ml-2 space-x-4">
              {/* User Email & Code Display */}
              <div className="hidden md:flex flex-col items-end">
                <div className="text-xs font-medium text-gray-900 truncate max-w-[180px]">
                  {user?.emailId || user?.email || "No email"}
                </div>
                <div className="text-[10px] text-gray-500">
                  Code: {user?.employeeCode || "N/A"}
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                title="Logout"
              >
                <FaSignOutAlt size={12} />
                <span className="hidden sm:inline">Logout</span>
              </button>

              {/* Mobile: User Avatar (for consistency) */}
              <div className="md:hidden">
                <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {user?.name?.charAt(0) || "R"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden ${mobileMenuOpen ? "block" : "hidden"}`}>
          <div className="px-3 py-2 border-t border-gray-200 bg-white">
            <div className="space-y-0.5">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-3 py-2.5 rounded-md text-sm font-medium ${
                    isActive(item.href)
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.count !== undefined && (
                    <span className="h-5 w-5 flex items-center justify-center text-xs font-bold bg-gray-700 text-white rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* 🔴 PAGE HEADER */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              {getPageTitle()}
            </h3>
          </div>
        </div>
      </div>

      {/* 🔴 MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
        <Routes>
          <Route path="/" element={<Navigate to="/rm/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <RMDashboardHome
                stats={stats}
                assignedSuspects={assignedSuspects}
              />
            }
          />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/customer-master"
            element={<PlaceholderComponent title="Customer Master" />}
          />
          <Route path="/area-of-work" element={<AreaOfWork />} />
          <Route
            path="/work-description"
            element={<PlaceholderComponent title="Work Description" />}
          />
          <Route path="/task-summary" element={<TaskSummary />} />
          <Route
            path="/task-status"
            element={<PlaceholderComponent title="Task Status" />}
          />
          <Route
            path="/salary-history"
            element={<PlaceholderComponent title="Salary History" />}
          />
          <Route
            path="/incentive-history"
            element={<PlaceholderComponent title="Incentive History" />}
          />
          <Route
            path="/assigned-suspects"
            element={<AssignedTasks user={user} />}
          />
          <Route
            path="/suspect/details/:id"
            element={<RMSuspectDetailsPage />}
          />
          <Route path="*" element={<Navigate to="/rm/dashboard" replace />} />
        </Routes>
      </main>

      {/* 🔴 FOOTER */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="text-xs text-gray-500">
              © {new Date().getFullYear()} RM Dashboard
            </div>
            <div className="mt-2 md:mt-0 flex flex-wrap items-center gap-x-4 gap-y-1">
              <div className="flex items-center space-x-1 text-xs">
                <span className="text-gray-500">Assigned:</span>
                <span className="font-semibold text-gray-900">
                  {stats.totalAssigned}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <span className="text-gray-500">Completed:</span>
                <span className="font-semibold text-gray-900">
                  {stats.completed}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <span className="text-gray-500">Today:</span>
                <span className="font-semibold text-gray-900">
                  {stats.todayAppointments}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RMDashboard;
