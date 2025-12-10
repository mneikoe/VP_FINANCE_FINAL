import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../redux/feature/auth/authThunx";
import axiosInstance from "../../config/axios";
import {
  FaTasks,
  FaCalendarAlt,
  FaUserTie,
  FaChartLine,
  FaFileAlt,
  FaBell,
  FaSearch,
  FaFilter,
  FaDownload,
  FaSync,
  FaSignOutAlt,
  FaHome,
  FaUser,
  FaChartBar,
  FaFileContract,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaPhoneAlt,
  FaBuilding,
  FaMapMarkerAlt,
  FaIdCard,
  FaUsers,
  FaCalendarDay,
  FaEllipsisH,
  FaEdit,
  FaCog,
  FaChevronRight,
  FaRegCalendarCheck,
  FaStar,
} from "react-icons/fa";
import "./RMDashboard.css";
import { useDispatch } from "react-redux";
const RMDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [assignedProspects, setAssignedProspects] = useState([]);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    completed: 0,
    pending: 0,
    upcomingAppointments: 0,
    todayAppointments: 0,
  });
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    sortBy: "appointmentDate",
    sortOrder: "asc",
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");

    if (!userData || userData.role !== "RM") {
      navigate("/auth/login");
      return;
    }

    setUser(userData);
    fetchAssignedProspects();
  }, [navigate]);

  const fetchAssignedProspects = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/rm/assignments", {
        params: { rmId: user?._id },
      });

      if (response.data.success) {
        const prospects = response.data.data.map((assignment, index) => ({
          key: assignment.prospectId || assignment.assignmentId,
          id: assignment.prospectId,
          assignmentId: assignment.assignmentId,
          sn: index + 1,
          prospectName: assignment.prospectName || "Unknown",
          groupCode: assignment.groupCode || "N/A",
          groupName: assignment.groupName || "N/A",
          grade: assignment.grade || "N/A",
          organisation: assignment.organisation || "N/A",
          city: assignment.city || "N/A",
          mobile: assignment.mobileNo || "N/A",
          contactNo: assignment.contactNo || "N/A",
          leadSource: assignment.leadSource || "N/A",
          leadName: assignment.leadName || "N/A",
          callingPurpose: assignment.callingPurpose || "N/A",
          status: assignment.status || "prospect",
          appointmentDate: assignment.appointmentDate || null,
          appointmentTime: assignment.appointmentTime || null,
          assignedAt: assignment.assignedAt || new Date(),
          rmName: assignment.rmName,
          rmCode: assignment.rmCode,
          assignmentNotes: assignment.assignmentNotes || "",
          assignmentStatus: assignment.assignmentStatus || "assigned",
        }));

        setAssignedProspects(prospects);
        calculateStatistics(prospects);
      }
    } catch (error) {
      console.error("Error fetching assigned prospects:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (prospects) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = prospects.filter((prospect) => {
      if (!prospect.appointmentDate) return false;
      const aptDate = new Date(prospect.appointmentDate);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate.getTime() === today.getTime();
    }).length;

    const upcomingCount = prospects.filter((prospect) => {
      if (!prospect.appointmentDate) return false;
      const aptDate = new Date(prospect.appointmentDate);
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return aptDate >= today && aptDate <= nextWeek;
    }).length;

    const completedCount = prospects.filter(
      (p) => p.assignmentStatus === "completed"
    ).length;

    setStats({
      totalAssigned: prospects.length,
      completed: completedCount,
      pending: prospects.length - completedCount,
      upcomingAppointments: upcomingCount,
      todayAppointments: todayCount,
    });
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth/login");
  };

  const applyFilters = () => {
    let filtered = [...assignedProspects];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (prospect) =>
          prospect.prospectName.toLowerCase().includes(searchTerm) ||
          prospect.groupCode.toLowerCase().includes(searchTerm) ||
          prospect.groupName.toLowerCase().includes(searchTerm) ||
          prospect.organisation.toLowerCase().includes(searchTerm) ||
          prospect.city.toLowerCase().includes(searchTerm) ||
          prospect.mobile.toLowerCase().includes(searchTerm) ||
          prospect.leadName.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(
        (prospect) => prospect.status === filters.status
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case "appointmentDate":
          aValue = a.appointmentDate
            ? new Date(a.appointmentDate).getTime()
            : 0;
          bValue = b.appointmentDate
            ? new Date(b.appointmentDate).getTime()
            : 0;
          break;
        case "assignedAt":
          aValue = new Date(a.assignedAt).getTime();
          bValue = new Date(b.assignedAt).getTime();
          break;
        case "groupCode":
          aValue = a.groupCode?.toLowerCase() || "";
          bValue = b.groupCode?.toLowerCase() || "";
          break;
        default:
          aValue = a.prospectName?.toLowerCase() || "";
          bValue = b.prospectName?.toLowerCase() || "";
      }

      if (filters.sortOrder === "desc") {
        return bValue - aValue;
      }
      return aValue - bValue;
    });

    return filtered;
  };

  const filteredProspects = useMemo(
    () => applyFilters(),
    [assignedProspects, filters]
  );

  const formatDate = (date) => {
    if (!date) return "-";
    const dateObj = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(dateObj);
    targetDate.setHours(0, 0, 0, 0);

    if (targetDate.getTime() === today.getTime()) {
      return "Today";
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (targetDate.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    }

    return dateObj.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time || time === "-") return "-";
    return time;
  };

  const getStatusBadge = (status) => {
    const config = {
      prospect: { color: "#28a745", label: "Prospect", icon: "✅" },
      suspect: { color: "#17a2b8", label: "Suspect", icon: "👁️" },
      client: { color: "#6f42c1", label: "Client", icon: "⭐" },
    };

    const { color, label, icon } = config[status] || config.prospect;

    return (
      <span
        className="status-badge"
        style={{
          color: color,
          border: `1px solid ${color}`,
          backgroundColor: `${color}10`,
        }}
      >
        {icon} {label}
      </span>
    );
  };

  const handleRefresh = async () => {
    await fetchAssignedProspects();
  };

  const renderDashboardContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            {/* Stats Overview */}
            <div className="stats-overview">
              <div className="stat-card">
                <div className="stat-header">
                  <FaTasks className="stat-icon" />
                  <span className="stat-title">Total Assigned</span>
                </div>
                <div className="stat-number">{stats.totalAssigned}</div>
                <div className="stat-desc">Active Prospects</div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <FaCheckCircle className="stat-icon completed" />
                  <span className="stat-title">Completed</span>
                </div>
                <div className="stat-number completed">{stats.completed}</div>
                <div className="stat-desc">Successful Conversions</div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <FaCalendarDay className="stat-icon" />
                  <span className="stat-title">Today's Schedule</span>
                </div>
                <div className="stat-number">{stats.todayAppointments}</div>
                <div className="stat-desc">Meetings & Calls</div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <FaRegCalendarCheck className="stat-icon" />
                  <span className="stat-title">Upcoming</span>
                </div>
                <div className="stat-number upcoming">
                  {stats.upcomingAppointments}
                </div>
                <div className="stat-desc">Next 7 Days</div>
              </div>
            </div>

            {/* Recent Prospects */}
            <div className="recent-prospects">
              <div className="section-header">
                <h3>
                  <FaUsers /> Recent Prospects
                </h3>
                <button
                  className="view-all-btn"
                  onClick={() => setActiveTab("assigned-tasks")}
                >
                  View All <FaChevronRight />
                </button>
              </div>

              <div className="table-container">
                <table className="prospects-table">
                  <thead>
                    <tr>
                      <th>Group Code</th>
                      <th>Group Name</th>
                      <th>Name</th>
                      <th>Contact</th>
                      <th>Lead Source</th>
                      <th>Appointment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProspects.slice(0, 5).map((prospect) => (
                      <tr key={prospect.id}>
                        <td>
                          <div className="group-code">
                            <FaIdCard /> {prospect.groupCode}
                          </div>
                        </td>
                        <td>
                          <div className="group-name">{prospect.groupName}</div>
                        </td>
                        <td>
                          <div className="name">
                            <FaUser /> {prospect.prospectName}
                          </div>
                          <div className="org">
                            <FaBuilding /> {prospect.organisation}
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            <div className="phone">
                              <FaPhoneAlt /> {prospect.mobile}
                            </div>
                            {prospect.contactNo &&
                              prospect.contactNo !== "N/A" && (
                                <div className="alt-phone">
                                  📞 {prospect.contactNo}
                                </div>
                              )}
                          </div>
                        </td>
                        <td>
                          <div className="lead-info">
                            <div className="source">{prospect.leadSource}</div>
                            <div className="name">{prospect.leadName}</div>
                          </div>
                        </td>
                        <td>
                          {prospect.appointmentDate ? (
                            <div className="appointment-info">
                              <div className="date">
                                {formatDate(prospect.appointmentDate)}
                              </div>
                              <div className="time">
                                {formatTime(prospect.appointmentTime)}
                              </div>
                            </div>
                          ) : (
                            <span className="no-appointment">
                              Not scheduled
                            </span>
                          )}
                        </td>
                        <td>{getStatusBadge(prospect.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );

      case "assigned-tasks":
        return (
          <>
            {/* Filters */}
            <div className="filters-section">
              <div className="filters-header">
                <h3>Assigned Prospects ({filteredProspects.length})</h3>
                <div className="filter-actions">
                  <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search by name, group code, phone..."
                      value={filters.search}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          search: e.target.value,
                        }))
                      }
                      className="search-input"
                    />
                  </div>
                  <button className="btn-refresh" onClick={handleRefresh}>
                    <FaSync /> Refresh
                  </button>
                </div>
              </div>

              <div className="filter-controls">
                <div className="filter-group">
                  <label>Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="prospect">Prospect</option>
                    <option value="suspect">Suspect</option>
                    <option value="client">Client</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Sort By</label>
                  <div className="sort-buttons">
                    <button
                      className={`sort-btn ${
                        filters.sortBy === "appointmentDate" ? "active" : ""
                      }`}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          sortBy: "appointmentDate",
                          sortOrder:
                            prev.sortBy === "appointmentDate" &&
                            prev.sortOrder === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      Appointment{" "}
                      {filters.sortBy === "appointmentDate" &&
                        (filters.sortOrder === "asc" ? "↑" : "↓")}
                    </button>
                    <button
                      className={`sort-btn ${
                        filters.sortBy === "assignedAt" ? "active" : ""
                      }`}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          sortBy: "assignedAt",
                          sortOrder:
                            prev.sortBy === "assignedAt" &&
                            prev.sortOrder === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      Assigned{" "}
                      {filters.sortBy === "assignedAt" &&
                        (filters.sortOrder === "asc" ? "↑" : "↓")}
                    </button>
                    <button
                      className={`sort-btn ${
                        filters.sortBy === "groupCode" ? "active" : ""
                      }`}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          sortBy: "groupCode",
                          sortOrder:
                            prev.sortBy === "groupCode" &&
                            prev.sortOrder === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      Group Code{" "}
                      {filters.sortBy === "groupCode" &&
                        (filters.sortOrder === "asc" ? "↑" : "↓")}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Table */}
            <div className="main-table-container">
              <table className="main-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Group Code</th>
                    <th>Grade</th>
                    <th>Group Name</th>
                    <th>Name</th>
                    <th>Contact Numbers</th>
                    <th>Lead Source</th>
                    <th>Lead Name</th>
                    <th>Calling Purpose</th>
                    <th>Status</th>
                    <th>Appointment Date</th>
                    <th>Assigned On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="13" className="loading-cell">
                        <div className="loading-indicator">
                          <div className="spinner"></div>
                          Loading prospects...
                        </div>
                      </td>
                    </tr>
                  ) : filteredProspects.length === 0 ? (
                    <tr>
                      <td colSpan="13" className="empty-cell">
                        <div className="empty-state">
                          <FaUsers />
                          <div>
                            <h4>No prospects found</h4>
                            <p>
                              Try adjusting your filters or check back later.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProspects.map((prospect, index) => (
                      <tr key={prospect.id}>
                        <td className="serial">{index + 1}</td>

                        <td>
                          <div className="group-code-cell">
                            <FaIdCard /> {prospect.groupCode}
                          </div>
                        </td>

                        <td>
                          <div className="grade-cell">{prospect.grade}</div>
                        </td>

                        <td>
                          <div className="group-name-cell">
                            {prospect.groupName}
                          </div>
                        </td>

                        <td>
                          <div className="name-cell">
                            <FaUser /> {prospect.prospectName}
                          </div>
                        </td>

                        <td>
                          <div className="contact-cell">
                            <div className="primary-phone">
                              <FaPhoneAlt /> {prospect.mobile}
                            </div>
                            {prospect.contactNo &&
                              prospect.contactNo !== "N/A" && (
                                <div className="secondary-phone">
                                  📞 {prospect.contactNo}
                                </div>
                              )}
                          </div>
                        </td>

                        <td>
                          <div className="lead-source-cell">
                            {prospect.leadSource}
                          </div>
                        </td>

                        <td>
                          <div className="lead-name-cell">
                            {prospect.leadName}
                          </div>
                        </td>

                        <td>
                          <div className="calling-purpose-cell">
                            {prospect.callingPurpose}
                          </div>
                        </td>

                        <td>
                          <div className="status-cell">
                            {getStatusBadge(prospect.status)}
                          </div>
                        </td>

                        <td>
                          {prospect.appointmentDate ? (
                            <div className="appointment-cell">
                              <div className="date">
                                {formatDate(prospect.appointmentDate)}
                              </div>
                              <div className="time">
                                {formatTime(prospect.appointmentTime)}
                              </div>
                            </div>
                          ) : (
                            <span className="no-appointment">
                              Not scheduled
                            </span>
                          )}
                        </td>

                        <td>
                          <div className="assigned-date-cell">
                            {formatDate(prospect.assignedAt)}
                          </div>
                        </td>

                        <td>
                          <div className="action-cells">
                            <button className="action-btn" title="View Details">
                              <FaEye />
                            </button>
                            <button className="action-btn" title="Update">
                              <FaEdit />
                            </button>
                            <button className="action-btn" title="Call">
                              <FaPhoneAlt />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="table-footer">
                <div className="pagination-info">
                  Showing {filteredProspects.length} of{" "}
                  {assignedProspects.length} prospects
                </div>
                <div className="table-stats">
                  <span className="stat-item">
                    <FaCalendarAlt /> Today: {stats.todayAppointments}
                  </span>
                  <span className="stat-item">
                    <FaCheckCircle /> Completed: {stats.completed}
                  </span>
                  <span className="stat-item">
                    <FaTasks /> Pending: {stats.pending}
                  </span>
                </div>
              </div>
            </div>
          </>
        );

      default:
        return (
          <div className="empty-section">
            <FaStar className="empty-icon" />
            <h3>Select a section to view content</h3>
          </div>
        );
    }
  };

  return (
    <div className="rm-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <FaUserTie />
            <span>RM Dashboard</span>
          </div>
        </div>

        <div className="header-center">
          <div className="search-container">
            <FaSearch />
            <input type="text" placeholder="Search prospects..." />
          </div>
        </div>

        <div className="header-right">
          <button className="notifications">
            <FaBell />
            {stats.todayAppointments > 0 && (
              <span className="badge">{stats.todayAppointments}</span>
            )}
          </button>

          <div className="user-profile">
            <div className="avatar">{user?.name?.charAt(0) || "R"}</div>
            <div className="user-info">
              <div className="name">{user?.name || "RM User"}</div>
              <div className="role">Relationship Manager</div>
            </div>
          </div>

          <button className="settings">
            <FaCog />
          </button>

          <button className="logout" onClick={handleLogout}>
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="user-summary">
            <div className="user-details">
              <p>Relationship Manager</p>
              <p className="code">ID: {user?.employeeCode || "RM001"}</p>
            </div>
            <div className="quick-stats">
              <div className="stat">
                <div className="number">{stats.totalAssigned}</div>
                <div className="label">Assigned</div>
              </div>
              <div className="stat">
                <div className="number">{stats.completed}</div>
                <div className="label">Completed</div>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${
                activeTab === "dashboard" ? "active" : ""
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              <FaHome />
              <span>Dashboard</span>
              {stats.totalAssigned > 0 && (
                <span className="count">{stats.totalAssigned}</span>
              )}
            </button>

            <button
              className={`nav-item ${
                activeTab === "assigned-tasks" ? "active" : ""
              }`}
              onClick={() => setActiveTab("assigned-tasks")}
            >
              <FaTasks />
              <span>Assigned Tasks</span>
              <span className="count">{assignedProspects.length}</span>
            </button>

            <button
              className={`nav-item ${
                activeTab === "appointments" ? "active" : ""
              }`}
              onClick={() => setActiveTab("appointments")}
            >
              <FaCalendarAlt />
              <span>Appointments</span>
              <span className="count">{stats.todayAppointments}</span>
            </button>

            <button
              className={`nav-item ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => setActiveTab("reports")}
            >
              <FaChartBar />
              <span>Reports</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <div className="performance">
              <h4>Summary</h4>
              <div className="summary-item">
                <span>Today's Appointments</span>
                <span className="value">{stats.todayAppointments}</span>
              </div>
              <div className="summary-item">
                <span>Upcoming</span>
                <span className="value">{stats.upcomingAppointments}</span>
              </div>
              <div className="summary-item">
                <span>Pending Tasks</span>
                <span className="value">{stats.pending}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-header">
            <h1>
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "assigned-tasks" && "Assigned Prospects"}
              {activeTab === "appointments" && "Appointments"}
              {activeTab === "reports" && "Reports"}
            </h1>
            <div className="header-actions">
              <button className="btn-download">
                <FaDownload /> Export
              </button>
            </div>
          </div>

          <div className="content-body">{renderDashboardContent()}</div>

          <footer className="footer">
            <span>© 2024 RM Dashboard</span>
            <span>Total Prospects: {assignedProspects.length}</span>
            <span>Today: {stats.todayAppointments}</span>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default RMDashboard;
