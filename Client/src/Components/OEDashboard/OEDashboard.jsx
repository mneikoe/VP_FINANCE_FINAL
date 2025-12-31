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
  FaTimes,
  FaBuilding,
  FaPhoneAlt,
  FaCalendarDay,
  FaCheckCircle,
  FaRegCalendarCheck,
  FaIdCard,
  FaArrowRight,
} from "react-icons/fa";

// OE Dashboard Modules
import OEDashboardHome from "./OEDashboardHome";
// import OEProfile from "./modules/Profile";
// import OECustomerMaster from "./modules/CustomerMaster";
// import OETaskSummary from "./modules/TaskSummary";
// import OEAssignedTasks from "./modules/AssignedTasks";
// import OESuspectDetailsPage from "./modules/SuspectDetailsPage";
// import OETaskDetailsPage from "../Masters/task-details/TaskDetailsPage";

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

const OEDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    completed: 0,
    pending: 0,
    upcomingTasks: 0,
    todayTasks: 0,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (!userData || userData.role !== "OE") {
      navigate("/auth/login");
      return;
    }
    setUser(userData);
    fetchAssignedTasks();
  }, [navigate]);

  const fetchAssignedTasks = async () => {
    try {
      setLoading(true);
      const oeId = user?.id;

      if (!oeId) {
        console.error("❌ No OE ID found!");
        setAssignedTasks([]);
        setLoading(false);
        return;
      }

      const response = await axios.get("/api/oe/assigned-tasks", {
        params: { oeId: oeId },
      });

      if (response.data.success) {
        setAssignedTasks(response.data.data || []);
      } else {
        console.error("❌ API Error:", response.data.message);
        setAssignedTasks([]);
      }
    } catch (error) {
      console.error("❌ Error fetching assigned tasks:", error);
      setAssignedTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (tasks) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = tasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    }).length;

    const upcomingCount = tasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return dueDate >= today && dueDate <= nextWeek;
    }).length;

    const completedCount = tasks.filter(
      (t) => t.status === "completed" || t.assignmentStatus === "completed"
    ).length;

    setStats({
      totalAssigned: tasks.length,
      completed: completedCount,
      pending: tasks.length - completedCount,
      upcomingTasks: upcomingCount,
      todayTasks: todayCount,
    });
  };

  useEffect(() => {
    if (assignedTasks.length > 0) {
      calculateStatistics(assignedTasks);
    }
  }, [assignedTasks]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth/login");
  };

  const navigation = [
    { name: "Dashboard", href: "/oe/dashboard", icon: <FaHome size={14} /> },
    { name: "Profile", href: "/oe/profile", icon: <FaUser size={14} /> },
    {
      name: "Customer Master",
      href: "/oe/customer-master",
      icon: <FaUserTie size={14} />,
    },
    {
      name: "Task Summary",
      href: "/oe/task-summary",
      icon: <FaTasks size={14} />,
    },
    {
      name: "Document Management",
      href: "/oe/documents",
      icon: <FaFileAlt size={14} />,
    },
    {
      name: "Reporting",
      href: "/oe/reports",
      icon: <FaChartLine size={14} />,
    },
    {
      name: "Salary History",
      href: "/oe/salary-history",
      icon: <FaMoneyBillAlt size={14} />,
    },
    {
      name: "Incentive History",
      href: "/oe/incentive-history",
      icon: <FaHistory size={14} />,
    },
    {
      name: "Assigned Tasks",
      href: "/oe/assigned-tasks",
      icon: <FaBriefcase size={14} />,
      count: assignedTasks.length,
    },
  ];

  const isActive = (href) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  const getPageTitle = () => {
    if (location.pathname.includes("/oe/dashboard")) return "Dashboard";
    if (location.pathname.includes("/oe/profile")) return "Profile";
    if (location.pathname.includes("/oe/customer-master"))
      return "Customer Master";
    if (location.pathname.includes("/oe/task-summary")) return "Task Summary";
    if (location.pathname.includes("/oe/documents"))
      return "Document Management";
    if (location.pathname.includes("/oe/reports")) return "Reports";
    if (location.pathname.includes("/oe/salary-history"))
      return "Salary History";
    if (location.pathname.includes("/oe/incentive-history"))
      return "Incentive History";
    if (location.pathname.includes("/oe/assigned-tasks"))
      return "Assigned Tasks";
    return "OE Dashboard";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TOP NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 py-2 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14">
            {/* LEFT: Logo & Mobile Menu Toggle */}
            <div className="flex items-center space-x-3">
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
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <span className="mr-1.5">{item.icon}</span>
                    <div className="text-[10px] leading-tight">{item.name}</div>
                    {item.count !== undefined && (
                      <span className="ml-1.5 h-4 w-4 flex items-center justify-center text-[10px] font-bold bg-gray-700 text-white rounded-full">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: User Info & Logout */}
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

              {/* Mobile: User Avatar */}
              <div className="md:hidden">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {user?.name?.charAt(0) || "O"}
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
                      ? "bg-blue-600 text-white"
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

      {/* PAGE HEADER */}
      <div className="bg-white border-b shadow-sm border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              {getPageTitle()}
            </h3>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
        <Routes>
          <Route path="/" element={<Navigate to="/oe/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <OEDashboardHome stats={stats} assignedTasks={assignedTasks} />
            }
          />
          <Route
            path="/profile"
            element={<PlaceholderComponent title="Profile" />}
          />
          <Route
            path="/customer-master"
            element={<PlaceholderComponent title="Customer Master" />}
          />
          <Route
            path="/task-summary"
            element={<PlaceholderComponent title="TaskSummary" />}
          />
          <Route
            path="/documents"
            element={<PlaceholderComponent title="Document Management" />}
          />
          <Route
            path="/reports"
            element={<PlaceholderComponent title="Reports" />}
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
            path="/assigned-tasks"
            element={<PlaceholderComponent title="Assigned Tasks" />}
          />
          <Route
            path="/task/details/:id"
            element={<PlaceholderComponent title="Task Details" />}
          />
          <Route
            path="/task/:taskId"
            element={<PlaceholderComponent title="Task Id" />}
          />
          <Route path="*" element={<Navigate to="/oe/dashboard" replace />} />
        </Routes>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="text-xs text-gray-500">
              © {new Date().getFullYear()} OE Dashboard
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
                  {stats.todayTasks}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OEDashboard;
