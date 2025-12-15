import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DatePicker,
  Button,
  Select,
  Tag,
  Alert,
  Card,
  Row,
  Col,
  Statistic,
  Space,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  BankOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import LeadsTableLayout from "./LeadsTableLayout";

const { RangePicker } = DatePicker;
const { Option } = Select;

// StatusBasedLeadsPage.jsx - Update STATUS_CONFIG
const STATUS_CONFIG = {
  "busy-on-another-call": {
    title: "Busy on Another Call Leads",
    status: "Busy on Another Call", // ✅ Backend expects this exact string
    color: "#fa8c16",
    icon: "📞",
    description: "Leads who were busy on another call",
  },
  "call-after-some-time": {
    title: "Call After Some Time Leads",
    status: "Call After Sometimes", // ✅ Note: "Sometimes" not "Some time"
    color: "#1890ff",
    icon: "⏰",
    description: "Leads who asked to call after some time",
  },
  "call-not-picked": {
    title: "Call Not Picked Leads",
    status: "Call Not Picked", // ✅
    color: "#722ed1",
    icon: "❌",
    description: "Leads who didn't pick up the call",
  },
  others: {
    title: "Other Status Leads",
    status: "Others", // ✅
    color: "#13c2c2",
    icon: "📋",
    description: "Leads with other forwarded statuses",
  },
  "not-interested": {
    title: "Not Interested Leads",
    status: "Not Interested", // ✅
    color: "#f5222d",
    icon: "👎",
    description: "Leads who are not interested",
  },
  "not-reachable": {
    title: "Not Reachable Leads",
    status: "Not Reachable", // ✅
    color: "#fa541c",
    icon: "📵",
    description: "Leads who are not reachable",
  },
  "wrong-number": {
    title: "Wrong Number Leads",
    status: "Wrong Number", // ✅
    color: "#a0d911",
    icon: "❌",
    description: "Leads with wrong contact numbers",
  },
  callback: {
    title: "Callback Leads",
    status: "Callback", // ✅
    color: "#52c41a",
    icon: "↪️",
    description: "Leads scheduled for callback",
  },
};

const StatusBasedLeadsPage = () => {
  const location = useLocation(); // Get status type from URL
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  console.log("User from localStorage:", user);
  // Try multiple possible ID fields
  let telecallerId = null;
  if (user) {
    telecallerId =
      user._id ||
      user.id ||
      user.userId ||
      user.telecallerId ||
      user.telecaller_id;
  }

  const path = location.pathname;
  const statusType = path.substring(path.lastIndexOf("/") + 1);

  console.log("📌 URL Status Type:", statusType);
  console.log("📌 Available STATUS_CONFIG keys:", Object.keys(STATUS_CONFIG));

  // Also check if user is stored in a different key
  if (!telecallerId) {
    const authData = JSON.parse(
      localStorage.getItem("authData") || localStorage.getItem("auth")
    );
    if (authData?.user) {
      telecallerId = authData.user._id || authData.user.id;
    }
  }

  // If still not found, check the token
  if (!telecallerId && localStorage.getItem("token")) {
    // Try to extract from token or use a fallback
    const token = localStorage.getItem("token");
    // You might need to decode JWT token if user ID is stored there
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      telecallerId = payload._id || payload.id || payload.userId;
    } catch (e) {
      console.log("Could not decode token:", e);
    }
  }

  console.log("Final telecallerId:", telecallerId);

  // State
  const [dateFilter, setDateFilter] = useState("all");
  const [dateRange, setDateRange] = useState([]);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
  });
  const [error, setError] = useState("");

  // Get status configuration
  const statusConfig = STATUS_CONFIG[statusType] || {
    title: "Leads",
    status: "",
    color: "#1890ff",
    icon: "📞",
    description: "Leads list",
  };

  console.log("📌 Status Config found:", statusConfig);

  if (!statusConfig) {
    console.error("❌ No status config found for:", statusType);
    return <div>Invalid status type: {statusType}</div>;
  }

  // Fetch leads by status
  const fetchLeads = useCallback(async () => {
    if (!telecallerId || !statusConfig.status) {
      setError("Telecaller ID or status not found.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let params = {
        status: statusConfig.status,
        telecallerId,
        dateFilter,
      };

      // Add date range for custom filter
      if (dateFilter === "custom" && dateRange.length === 2) {
        params.startDate = dateRange[0].toISOString().split("T")[0];
        params.endDate = dateRange[1].toISOString().split("T")[0];
      }

      const response = await axios.get(`/api/suspect/filter/by-call-status`, {
        params,
      });

      if (response.data && response.data.success) {
        const leadsData = response.data.suspects || [];
        setLeads(leadsData);

        // Calculate stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        const statsData = {
          total: leadsData.length,
          today: leadsData.filter((lead) => {
            if (!lead.callTasks || lead.callTasks.length === 0) return false;
            const latestTask = lead.callTasks.sort(
              (a, b) => new Date(b.taskDate) - new Date(a.taskDate)
            )[0];
            const taskDate = new Date(latestTask.taskDate);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === today.getTime();
          }).length,
          thisWeek: leadsData.filter((lead) => {
            if (!lead.callTasks || lead.callTasks.length === 0) return false;
            const latestTask = lead.callTasks.sort(
              (a, b) => new Date(b.taskDate) - new Date(a.taskDate)
            )[0];
            const taskDate = new Date(latestTask.taskDate);
            return taskDate >= weekStart && taskDate <= today;
          }).length,
          thisMonth: leadsData.filter((lead) => {
            if (!lead.callTasks || lead.callTasks.length === 0) return false;
            const latestTask = lead.callTasks.sort(
              (a, b) => new Date(b.taskDate) - new Date(a.taskDate)
            )[0];
            const taskDate = new Date(latestTask.taskDate);
            return taskDate >= monthStart && taskDate <= today;
          }).length,
        };

        setStats(statsData);
      } else {
        setError(response.data?.message || "Failed to fetch leads");
        setLeads([]);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Network error. Please try again."
      );
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, [telecallerId, statusConfig.status, dateFilter, dateRange]);

  // Initial load
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Handlers
  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    if (value !== "custom") {
      setDateRange([]);
    }
  };

  const handleRangeChange = (dates) => {
    if (dates) {
      setDateRange(dates.map((date) => (date ? date.toDate() : null)));
      setDateFilter("custom");
    } else {
      setDateRange([]);
    }
  };

  const handleClearFilters = () => {
    setDateFilter("all");
    setDateRange([]);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };
  console.log("📌 Status from config:", statusConfig.status);
  // Get latest call status
  const getLatestCallStatus = (lead) => {
    if (!lead.callTasks || lead.callTasks.length === 0) {
      return "Not Contacted";
    }
    const sortedTasks = lead.callTasks.sort(
      (a, b) => new Date(b.taskDate) - new Date(a.taskDate)
    );
    return sortedTasks[0].taskStatus;
  };

  // Prepare table data with separate contact columns
  const tableData = useMemo(() => {
    return leads.map((lead, index) => {
      const personal = lead.personalDetails || {};

      return {
        key: lead._id,
        sn: index + 1,
        assignedDate: formatDate(lead.assignedAt),
        // Group Code - NOW CLICKABLE
        groupCode: (
          <span
            style={{
              color: "#1890ff",
              cursor: "pointer",
              fontWeight: 600,
              background: "#eff6ff",
              padding: "4px 10px",
              borderRadius: "4px",
              fontSize: "13px",
              display: "inline-block",
              border: "1px solid #d1e9ff",
              transition: "all 0.2s ease",
            }}
            onClick={() => navigate(`/telecaller/suspect/details/${lead._id}`)}
            onMouseEnter={(e) => {
              e.target.style.background = "#dbeafe";
              e.target.style.color = "#0056b3";
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 2px 4px rgba(59, 130, 246, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#eff6ff";
              e.target.style.color = "#1890ff";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
            title="Click to view full details"
          >
            {personal.groupCode || "-"}
          </span>
        ),
        grade: personal.grade || "-",
        groupName: personal.groupName || "-",
        // REMOVED: Name column data
        // Mobile Number Column
        mobileNo: (
          <div>
            {personal.mobileNo && personal.mobileNo.trim() !== "" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 8px",
                  background: "#f8f9fa",
                  borderRadius: "4px",
                  border: "1px solid #e9ecef",
                }}
              >
                <PhoneOutlined style={{ fontSize: "12px", color: "#52c41a" }} />
                <span style={{ fontWeight: 500, color: "#333" }}>
                  {personal.mobileNo}
                </span>
                <a
                  href={`tel:${personal.mobileNo}`}
                  style={{
                    fontSize: "11px",
                    color: "#007bff",
                    textDecoration: "none",
                    padding: "2px 6px",
                    border: "1px solid #007bff",
                    borderRadius: "3px",
                    background: "white",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#007bff";
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "white";
                    e.target.style.color = "#007bff";
                  }}
                >
                  Call
                </a>
              </div>
            ) : (
              <span style={{ color: "#999" }}>-</span>
            )}
          </div>
        ),
        // Contact Number Column
        contactNo: (
          <div>
            {personal.contactNo && personal.contactNo.trim() !== "" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 8px",
                  background: "#f8f9fa",
                  borderRadius: "4px",
                  border: "1px solid #e9ecef",
                }}
              >
                <PhoneOutlined style={{ fontSize: "12px", color: "#1890ff" }} />
                <span style={{ fontWeight: 500, color: "#333" }}>
                  {personal.contactNo}
                </span>
                <a
                  href={`tel:${personal.contactNo}`}
                  style={{
                    fontSize: "11px",
                    color: "#007bff",
                    textDecoration: "none",
                    padding: "2px 6px",
                    border: "1px solid #007bff",
                    borderRadius: "3px",
                    background: "white",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#007bff";
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "white";
                    e.target.style.color = "#007bff";
                  }}
                >
                  Call
                </a>
              </div>
            ) : (
              <span style={{ color: "#999" }}>-</span>
            )}
          </div>
        ),
        leadSource: personal.leadSource || "-",
        leadOccupation: personal.leadOccupation || "-",
        area: personal.city || "-",
        currentStatus: (
          <Tag
            color={statusConfig.color}
            style={{ fontWeight: 500, fontSize: "11px" }}
          >
            {getLatestCallStatus(lead)}
          </Tag>
        ),
        nextAction: (
          <div style={{ fontSize: "11px" }}>
            {lead.callTasks && lead.callTasks.length > 0 && (
              <>
                {lead.callTasks[0].nextFollowUpDate && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      marginBottom: "2px",
                    }}
                  >
                    <PhoneOutlined style={{ fontSize: "10px" }} />
                    {formatDate(lead.callTasks[0].nextFollowUpDate)}{" "}
                    {lead.callTasks[0].nextFollowUpTime &&
                      `at ${lead.callTasks[0].nextFollowUpTime}`}
                  </div>
                )}
                {lead.callTasks[0].nextAppointmentDate && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <CalendarOutlined style={{ fontSize: "10px" }} />
                    {formatDate(lead.callTasks[0].nextAppointmentDate)}{" "}
                    {lead.callTasks[0].nextAppointmentTime &&
                      `at ${lead.callTasks[0].nextAppointmentTime}`}
                  </div>
                )}
              </>
            )}
          </div>
        ),
        actions: (
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/telecaller/dashboard`)}
            style={{ padding: 0, fontSize: "12px", fontWeight: 500 }}
          >
            Update Status
          </Button>
        ),
      };
    });
  }, [leads, navigate, statusConfig.color]);

  // Updated columns definition with separate contact columns and NO NAME COLUMN
  const columns = [
    { header: "S.N", key: "sn", width: "60px", align: "center" },
    { header: "Task Date", key: "assignedDate", width: "100px" },
    { header: "Group Code", key: "groupCode", width: "120px" }, // Group Code is now clickable
    { header: "Grade", key: "grade", width: "80px" },
    { header: "Group Name", key: "groupName", width: "120px" },
    // REMOVED: Name column
    { header: "Mobile No", key: "mobileNo", width: "150px" },
    { header: "Contact No", key: "contactNo", width: "150px" },
    { header: "Lead Source", key: "leadSource", width: "100px" },
    { header: "Lead Occupation", key: "leadOccupation", width: "120px" },
    { header: "Area", key: "area", width: "100px" },
    { header: "Current Status", key: "currentStatus", width: "120px" },
    { header: "Next Action", key: "nextAction", width: "130px" },
  ];

  return (
    <div style={{ padding: "20px", backgroundColor: "#f0f2f5" }}>
      {/* Header */}
      <Card
        style={{ marginBottom: "20px", borderRadius: "8px" }}
        bodyStyle={{ padding: "20px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", color: "#1f1f1f" }}>
              <span style={{ marginRight: "10px" }}>{statusConfig.icon}</span>
              {statusConfig.title}
            </h1>
            <p style={{ margin: "8px 0 0 0", color: "#666" }}>
              {statusConfig.description}
            </p>
          </div>
          <div>
            <Button
              type="primary"
              onClick={fetchLeads}
              loading={isLoading}
              icon={<ReloadOutlined />}
            >
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: "20px" }}
          closable
          onClose={() => setError("")}
        />
      )}

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Total Leads"
              value={stats.total}
              valueStyle={{ color: statusConfig.color }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Today"
              value={stats.today}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="This Week"
              value={stats.thisWeek}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="This Month"
              value={stats.thisMonth}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card
        title="Filters"
        size="small"
        style={{ marginBottom: "20px" }}
        extra={
          <Button
            onClick={handleClearFilters}
            size="small"
            disabled={isLoading}
          >
            Clear
          </Button>
        }
      >
        <Space wrap>
          <Select
            value={dateFilter}
            onChange={handleDateFilterChange}
            style={{ width: 180 }}
            loading={isLoading}
          >
            <Option value="today">Today</Option>
            <Option value="this_week">This Week</Option>
            <Option value="this_month">This Month</Option>
            <Option value="custom">Custom Range</Option>
            <Option value="all">All Time</Option>
          </Select>

          {dateFilter === "custom" && (
            <RangePicker
              value={dateRange[0] ? dayjs(dateRange[0]) : null}
              onChange={handleRangeChange}
              format="DD/MM/YYYY"
              style={{ width: 250 }}
            />
          )}
        </Space>
      </Card>

      {/* Table */}
      <Card
        title={`Leads List (${leads.length})`}
        style={{ borderRadius: "8px" }}
      >
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                color: "#1890ff",
              }}
            >
              <ReloadOutlined spin />
            </div>
            <p>Loading leads...</p>
          </div>
        ) : leads.length > 0 ? (
          <LeadsTableLayout
            data={tableData}
            columns={columns}
            showSearch={true}
            showPagination={true}
            pageSize={10}
            searchPlaceholder="Search by name, group code, or contact..."
          />
        ) : (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div
              style={{
                fontSize: "64px",
                marginBottom: "20px",
                color: "#d9d9d9",
              }}
            >
              📞
            </div>
            <h3>No Leads Found</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              No leads found with status "{statusConfig.status}".
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StatusBasedLeadsPage;
