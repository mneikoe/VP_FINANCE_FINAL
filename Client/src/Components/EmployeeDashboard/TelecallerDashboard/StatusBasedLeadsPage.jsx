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
  Modal,
} from "antd";
import {
  CalendarOutlined,
  PhoneOutlined,
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
    status: "Busy on Another Call",
    color: "#fa8c16",
    icon: "📞",
    description: "Leads who were busy on another call",
  },
  "call-after-some-time": {
    title: "Call After Some Time Leads",
    status: "Call After Sometimes", // backend string
    color: "#1890ff",
    icon: "⏰",
    description: "Leads who asked to call after some time",
  },
  "call-not-picked": {
    title: "Call Not Picked Leads",
    status: "Call Not Picked",
    color: "#722ed1",
    icon: "❌",
    description: "Leads who didn't pick up the call",
  },
  others: {
    title: "Other Status Leads",
    status: "Others",
    color: "#13c2c2",
    icon: "📋",
    description: "Leads with other forwarded statuses",
  },
  "not-interested": {
    title: "Not Interested Leads",
    status: "Not Interested",
    color: "#f5222d",
    icon: "👎",
    description: "Leads who are not interested",
  },
  "not-reachable": {
    title: "Not Reachable Leads",
    status: "Not Reachable",
    color: "#fa541c",
    icon: "📵",
    description: "Leads who are not reachable",
  },
  "wrong-number": {
    title: "Wrong Number Leads",
    status: "Wrong Number",
    color: "#a0d911",
    icon: "❌",
    description: "Leads with wrong contact numbers",
  },
  callback: {
    title: "Callback Leads",
    status: "Callback",
    color: "#52c41a",
    icon: "↪️",
    description: "Leads scheduled for callback",
  },
};

const StatusBasedLeadsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
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

  if (!telecallerId) {
    const authData = JSON.parse(
      localStorage.getItem("authData") || localStorage.getItem("auth")
    );
    if (authData?.user) {
      telecallerId = authData.user._id || authData.user.id;
    }
  }

  if (!telecallerId && localStorage.getItem("token")) {
    const token = localStorage.getItem("token");
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      telecallerId = payload._id || payload.id || payload.userId;
    } catch (e) {
      console.log("Could not decode token:", e);
    }
  }

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

  if (!statusConfig) {
    return <div>Invalid status type: {statusType}</div>;
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  // Format time in AM/PM format
  const formatTimeAMPM = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "-";
    }
  };

  // Get latest call status and time
  const getLatestCallInfo = (lead) => {
    if (!lead.callTasks || lead.callTasks.length === 0) {
      return {
        currentStatus: "Not Contacted",
        callTime: "-",
        lastStatus: "-",
        updatedAt: "-",
      };
    }

    // Sort tasks by date (newest first)
    const sortedTasks = [...lead.callTasks].sort(
      (a, b) =>
        new Date(b.createdAt || b.taskDate || 0) -
        new Date(a.createdAt || a.taskDate || 0)
    );

    // Current status (latest task status)
    const currentStatus = sortedTasks[0].taskStatus || "Not Contacted";

    // Call time - status update ka time (createdAt)
    const callTime = sortedTasks[0].createdAt || sortedTasks[0].taskDate;

    // Last status (previous task status if exists)
    let lastStatus = "-";
    if (sortedTasks.length > 1) {
      lastStatus = sortedTasks[1].taskStatus || "-";
    }

    return {
      currentStatus,
      callTime,
      lastStatus,
      latestTask: sortedTasks[0],
      previousTask: sortedTasks[1] || null,
    };
  };

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

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        const statsData = {
          total: leadsData.length,
          today: leadsData.filter((lead) => {
            if (!lead.callTasks || lead.callTasks.length === 0) return false;
            const latestTask = [...lead.callTasks].sort(
              (a, b) =>
                new Date(b.createdAt || b.taskDate || 0) -
                new Date(a.createdAt || a.taskDate || 0)
            )[0];
            const taskDate = new Date(
              latestTask.createdAt || latestTask.taskDate
            );
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === today.getTime();
          }).length,
          thisWeek: leadsData.filter((lead) => {
            if (!lead.callTasks || lead.callTasks.length === 0) return false;
            const latestTask = [...lead.callTasks].sort(
              (a, b) =>
                new Date(b.createdAt || b.taskDate || 0) -
                new Date(a.createdAt || a.taskDate || 0)
            )[0];
            const taskDate = new Date(
              latestTask.createdAt || latestTask.taskDate
            );
            return taskDate >= weekStart && taskDate <= today;
          }).length,
          thisMonth: leadsData.filter((lead) => {
            if (!lead.callTasks || lead.callTasks.length === 0) return false;
            const latestTask = [...lead.callTasks].sort(
              (a, b) =>
                new Date(b.createdAt || b.taskDate || 0) -
                new Date(a.createdAt || a.taskDate || 0)
            )[0];
            const taskDate = new Date(
              latestTask.createdAt || latestTask.taskDate
            );
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

  // Handle group code click - navigate to suspect details page
  const handleGroupCodeClick = (leadId) => {
    if (leadId) {
      navigate(`/telecaller/suspect/details/${leadId}`);
    }
  };

  // Clean table data + confirmation popup on numbers
  const tableData = useMemo(() => {
    const handleCallClick = (phone) => {
      if (!phone) return;
      Modal.confirm({
        title: "Call Confirmation",
        icon: <PhoneOutlined />,
        content: `Kya aap ${phone} par call lagana chahte hain?`,
        okText: "OK",
        cancelText: "Cancel",
        onOk: () => {
          window.location.href = `tel:${phone}`;
        },
      });
    };

    return leads.map((lead) => {
      const personal = lead.personalDetails || {};

      // Get latest call info
      const callInfo = getLatestCallInfo(lead);
      const latestTask = callInfo.latestTask;

      const statusUpdatedAt = latestTask
        ? `${formatDate(
            latestTask.taskDate || latestTask.createdAt
          )} ${formatTimeAMPM(latestTask.createdAt || latestTask.taskDate)}`
        : "-";

      // Next action text - SIRF DATE dikhana hai
      let nextActionText = "-";
      if (lead.callTasks && lead.callTasks.length > 0) {
        const latestTask = [...lead.callTasks].sort(
          (a, b) =>
            new Date(b.createdAt || b.taskDate || 0) -
            new Date(a.createdAt || a.taskDate || 0)
        )[0];

        // Sirf date check karo, time nahi
        if (latestTask.nextFollowUpDate) {
          nextActionText = formatDate(latestTask.nextFollowUpDate);
        } else if (latestTask.nextAppointmentDate) {
          nextActionText = formatDate(latestTask.nextAppointmentDate);
        }
      }

      return {
        key: lead._id,
        assignedDate: formatDate(lead.assignedAt),
        groupCode: (
          <span
            style={{
              color: "#1890ff",
              cursor: "pointer",
              fontWeight: 500,
              textDecoration: "underline",
            }}
            onClick={() => handleGroupCodeClick(lead._id)}
          >
            {personal.groupCode || "-"}
          </span>
        ),
        groupName: personal.groupName || "-",

        mobileNo:
          personal.mobileNo && personal.mobileNo.trim() !== "" ? (
            <span
              style={{
                color: "#1677ff",
                cursor: "pointer",
                fontWeight: 500,
              }}
              onClick={() => handleCallClick(personal.mobileNo)}
            >
              {personal.mobileNo}
            </span>
          ) : (
            <span style={{ color: "#999" }}>-</span>
          ),

        contactNo:
          personal.contactNo && personal.contactNo.trim() !== "" ? (
            <span
              style={{
                color: "#1677ff",
                cursor: "pointer",
                fontWeight: 500,
              }}
              onClick={() => handleCallClick(personal.contactNo)}
            >
              {personal.contactNo}
            </span>
          ) : (
            <span style={{ color: "#999" }}>-</span>
          ),

        leadSource: personal.leadSource || "-",
        leadOccupation: personal.leadOccupation || "-",
        area: personal.city || "-",
        currentStatus: callInfo.currentStatus,
        nextAction: nextActionText, // SIRF DATE
        callTime: statusUpdatedAt, // ✅ AM/PM format
        lastStatus: callInfo.lastStatus, // ✅ Update se pehle wala status
      };
    });
  }, [leads, navigate]);

  // Clean columns - SN number remove kiya
  const columns = [
    { header: "Task Date", key: "assignedDate", width: "100px" },
    { header: "Group Code", key: "groupCode", width: "120px" },
    { header: "Group Name", key: "groupName", width: "140px" },
    { header: "Mobile No", key: "mobileNo", width: "130px" },
    { header: "Contact No", key: "contactNo", width: "130px" },
    { header: "Lead Source", key: "leadSource", width: "110px" },
    { header: "Lead Occupation", key: "leadOccupation", width: "130px" },
    { header: "Area", key: "area", width: "100px" },
    { header: "Status", key: "currentStatus", width: "120px" },
    { header: "Next Action", key: "nextAction", width: "100px" }, // Sirf date - width adjust
    { header: "Call Time", key: "callTime", width: "120px" },
    { header: "Last Status", key: "lastStatus", width: "120px" },
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
