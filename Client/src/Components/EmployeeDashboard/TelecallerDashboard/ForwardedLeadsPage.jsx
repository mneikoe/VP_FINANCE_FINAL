import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Tag,
  Alert,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Spin,
  Select,
  DatePicker,
  Modal,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import LeadsTableLayout from "./LeadsTableLayout";
import { setforwardedleadCount } from "../../../redux/feature/showdashboarddata/dashboarddataSlice";

const { Option } = Select;
const { RangePicker } = DatePicker;

const ForwardedLeadsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get data from Redux (OLD LOGIC)
  const { suspects = [] } = useSelector((state) => state.suspect);
  const user = JSON.parse(localStorage.getItem("user"));
  const telecallerId = user?.id || null;

  // State for filters (NEW - UI only)
  const [dateFilter, setDateFilter] = useState("all");
  const [dateRange, setDateRange] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredLeads, setFilteredLeads] = useState([]);

  // Status config for UI
  const statusConfig = {
    title: "Forwarded Leads",
    color: "#1890ff",
    icon: "↪️",
    description:
      "Leads with forwarded call status (Call Not Picked, Busy, etc.)",
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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

  useEffect(() => {
    // 🛑 Guard: wait until suspects are actually loaded
    if (!Array.isArray(suspects) || suspects.length === 0 || !telecallerId) {
      setFilteredLeads([]);
      dispatch(setforwardedleadCount(0));
      return;
    }

    setIsLoading(true); // 🔄 start loading

    let rlcnt = 0;

    const filteredData = suspects.filter((suspect) => {
      if (suspect.assignedTo?.toString() !== telecallerId) {
        return false;
      }

      if (!suspect.callTasks || suspect.callTasks.length === 0) {
        return false;
      }

      const latestTask = suspect.callTasks.reduce((latest, task) => {
        if (!task.taskDate) return latest;

        const taskDateTime = new Date(
          task.taskDate + " " + (task.taskTime || "00:00")
        );
        if (!latest) return task;

        const latestDateTime = new Date(
          latest.taskDate + " " + (latest.taskTime || "00:00")
        );
        return taskDateTime > latestDateTime ? task : latest;
      }, null);

      if (!latestTask || !latestTask.taskDate) {
        return false;
      }

      // Forwarded statuses
      const forwardedStatuses = [
        "Call Not Picked",
        "Busy on Another Call",
        "Call After Sometimes",
        "Others",
      ];

      const isForwarded = forwardedStatuses.includes(latestTask.taskStatus);

      // Apply date filter
      if (dateFilter !== "all" && latestTask.taskDate) {
        const taskDate = new Date(latestTask.taskDate);
        const today = new Date();

        if (dateFilter === "today") {
          return (
            taskDate.toDateString() === today.toDateString() && isForwarded
          );
        }

        if (dateFilter === "this_week") {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          return taskDate >= weekStart && taskDate <= today && isForwarded;
        }

        if (dateFilter === "this_month") {
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          return taskDate >= monthStart && taskDate <= today && isForwarded;
        }

        if (dateFilter === "custom" && dateRange.length === 2) {
          const startDate = new Date(dateRange[0]);
          const endDate = new Date(dateRange[1]);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          return taskDate >= startDate && taskDate <= endDate && isForwarded;
        }
      }

      return isForwarded;
    });

    rlcnt = filteredData.length;
    setFilteredLeads(filteredData);
    dispatch(setforwardedleadCount(rlcnt));

    setIsLoading(false); // ✅ end loading
  }, [suspects, telecallerId, dateFilter, dateRange, dispatch]);


  // Calculate stats (NEW - for UI)
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    return {
      total: filteredLeads.length,
      today: filteredLeads.filter((lead) => {
        if (!lead.callTasks || lead.callTasks.length === 0) return false;
        const callInfo = getLatestCallInfo(lead);
        if (!callInfo.callTime || callInfo.callTime === "-") return false;
        const taskDate = new Date(callInfo.callTime);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      }).length,
      thisWeek: filteredLeads.filter((lead) => {
        if (!lead.callTasks || lead.callTasks.length === 0) return false;
        const callInfo = getLatestCallInfo(lead);
        if (!callInfo.callTime || callInfo.callTime === "-") return false;
        const taskDate = new Date(callInfo.callTime);
        return taskDate >= weekStart && taskDate <= today;
      }).length,
      thisMonth: filteredLeads.filter((lead) => {
        if (!lead.callTasks || lead.callTasks.length === 0) return false;
        const callInfo = getLatestCallInfo(lead);
        if (!callInfo.callTime || callInfo.callTime === "-") return false;
        const taskDate = new Date(callInfo.callTime);
        return taskDate >= monthStart && taskDate <= today;
      }).length,
    };
  }, [filteredLeads]);

  // Handlers for filters (NEW - UI only)
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

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh - just refilter existing data
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  // Handle group code click - navigate to suspect details page
  const handleGroupCodeClick = (leadId) => {
    if (leadId) {
      navigate(`/telecaller/suspect/details/${leadId}`);
    }
  };

  // Handle phone call click
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

  // Prepare table data - NEW UI but same data structure
  const tableData = useMemo(() => {
    return filteredLeads.map((lead) => {
      const personal = lead.personalDetails || {};
      const callInfo = getLatestCallInfo(lead);
      const latestTask = callInfo.latestTask;


      // Status Updated At - Task Date + Time
      const statusUpdatedAt = latestTask
        ? `${formatDate(
          latestTask.taskDate || latestTask.createdAt
        )} ${formatTimeAMPM(latestTask.createdAt || latestTask.taskDate)}`
        : "-";

      let nextActionText = "-";
      if (latestTask?.nextFollowUpDate) {
        nextActionText = formatDate(latestTask.nextFollowUpDate);
      } else if (latestTask?.nextAppointmentDate) {
        nextActionText = formatDate(latestTask.nextAppointmentDate);
      }

      return {
        // key: lead._id,
        taskDate: formatDate(lead.assignedAt), // ✅ Assigned date
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
        callingPurpose: personal.callingPurpose || '-',
        area: personal.area || '-',
        // currentStatus: callInfo.currentStatus,
        nextAction: nextActionText, // SIRF DATE
        statusUpdatedAt: statusUpdatedAt, // ✅ Task Date + Time (both)
        lastStatus: callInfo.lastStatus, // ✅ Previous status
      };
    });
  }, [filteredLeads]);

  // Columns - Updated with new requirements
  const columns = [
    { header: "Previous Call Date", key: "taskDate", width: "100px" }, // Assigned date
    { header: "Group Code", key: "groupCode", width: "120px" },
    { header: "Group Name", key: "groupName", width: "140px" },
    { header: "Mobile Number", key: "mobileNo", width: "130px" },
    { header: "Phone Number", key: "contactNo", width: "130px" },
    { header: "Lead Source", key: "leadSource", width: "110px" },
    { header: "Lead Occupation", key: "leadOccupation", width: "130px" },
    { header: "Calling Purpose", key: "callingPurpose", width: "130px" },
    { header: "Area", key: "area", width: "100px" },
    // { header: "Status", key: "currentStatus", width: "120px" },
    { header: "Next Call Date", key: "nextAction", width: "100px" },
    { header: "Call Time", key: "statusUpdatedAt", width: "150px" }, // Task Date + Time
    { header: "Last Status", key: "lastStatus", width: "120px" },
  ];

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
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
            marginBottom: "16px",
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
              onClick={handleRefresh}
              loading={isLoading}
              icon={<ReloadOutlined />}
            >
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" hoverable>
            <Statistic
              title="Total Forwarded"
              value={stats.total}
              valueStyle={{ color: statusConfig.color }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" hoverable>
            <Statistic
              title="Today"
              value={stats.today}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" hoverable>
            <Statistic
              title="This Week"
              value={stats.thisWeek}
              valueStyle={{ color: "#1890ff" }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" hoverable>
            <Statistic
              title="This Month"
              value={stats.thisMonth}
              valueStyle={{ color: "#722ed1" }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FilterOutlined />
            <span>Filters</span>
          </div>
        }
        size="small"
        style={{ marginBottom: "20px" }}
        extra={
          <Button
            onClick={handleClearFilters}
            size="small"
            disabled={isLoading}
          >
            Clear Filters
          </Button>
        }
      >
        <Space wrap>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontWeight: 500 }}>Date Filter:</span>
            <Select
              value={dateFilter}
              onChange={handleDateFilterChange}
              style={{ width: 180 }}
              loading={isLoading}
            >
              <Option value="all">All Time</Option>
              <Option value="today">Today</Option>
              <Option value="this_week">This Week</Option>
              <Option value="this_month">This Month</Option>
              <Option value="custom">Custom Range</Option>
            </Select>
          </div>

          {dateFilter === "custom" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontWeight: 500 }}>Date Range:</span>
              <RangePicker
                value={dateRange[0] ? dayjs(dateRange[0]) : null}
                onChange={handleRangeChange}
                format="DD/MM/YYYY"
                style={{ width: 250 }}
              />
            </div>
          )}
        </Space>
      </Card>

      {/* Table */}
      <Card
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span>Forwarded Leads List</span>
              <Tag color={statusConfig.color} style={{ marginLeft: "8px" }}>
                {filteredLeads.length} Leads
              </Tag>
            </div>
            {isLoading && <Spin size="small" />}
          </div>
        }
        style={{ borderRadius: "8px" }}
        bodyStyle={{ padding: "0" }}
      >
        {isLoading && filteredLeads.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
            <p style={{ marginTop: "16px", color: "#666" }}>
              Loading forwarded leads...
            </p>
          </div>
        ) : filteredLeads.length > 0 ? (
          <LeadsTableLayout
            data={tableData}
            columns={columns}
            showSearch={true}
            showPagination={true}
            pageSize={10}
            searchPlaceholder="Search by name, group code, mobile, or organisation..."
            tableStyle={{ margin: 0 }}
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
            <h3 style={{ marginBottom: "8px" }}>No Forwarded Leads Found</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              No leads found with forwarded call status.
            </p>
            <Button type="primary" onClick={handleRefresh}>
              <ReloadOutlined /> Refresh
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ForwardedLeadsPage;
