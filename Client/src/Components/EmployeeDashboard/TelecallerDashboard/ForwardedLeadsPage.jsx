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

  // OLD FILTERING LOGIC (Same as before)
  useEffect(() => {
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

      // Apply date filter if selected (NEW - but optional)
      if (dateFilter !== "all" && latestTask.taskDate) {
        const taskDate = new Date(latestTask.taskDate);
        const today = new Date();

        if (dateFilter === "today") {
          return (
            taskDate.toDateString() === today.toDateString() && isForwarded
          );
        } else if (dateFilter === "this_week") {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          return taskDate >= weekStart && taskDate <= today && isForwarded;
        } else if (dateFilter === "this_month") {
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          return taskDate >= monthStart && taskDate <= today && isForwarded;
        } else if (dateFilter === "custom" && dateRange.length === 2) {
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
        const latestTask = lead.callTasks.reduce((latest, task) => {
          if (!task.taskDate) return latest;
          const taskDate = new Date(task.taskDate);
          if (!latest) return task;
          const latestDate = new Date(latest.taskDate);
          return taskDate > latestDate ? task : latest;
        }, null);
        if (!latestTask || !latestTask.taskDate) return false;
        const taskDate = new Date(latestTask.taskDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      }).length,
      thisWeek: filteredLeads.filter((lead) => {
        if (!lead.callTasks || lead.callTasks.length === 0) return false;
        const latestTask = lead.callTasks.reduce((latest, task) => {
          if (!task.taskDate) return latest;
          const taskDate = new Date(task.taskDate);
          if (!latest) return task;
          const latestDate = new Date(latest.taskDate);
          return taskDate > latestDate ? task : latest;
        }, null);
        if (!latestTask || !latestTask.taskDate) return false;
        const taskDate = new Date(latestTask.taskDate);
        return taskDate >= weekStart && taskDate <= today;
      }).length,
      thisMonth: filteredLeads.filter((lead) => {
        if (!lead.callTasks || lead.callTasks.length === 0) return false;
        const latestTask = lead.callTasks.reduce((latest, task) => {
          if (!task.taskDate) return latest;
          const taskDate = new Date(task.taskDate);
          if (!latest) return task;
          const latestDate = new Date(latest.taskDate);
          return taskDate > latestDate ? task : latest;
        }, null);
        if (!latestTask || !latestTask.taskDate) return false;
        const taskDate = new Date(latestTask.taskDate);
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

  // Get latest call task
  const getLatestCallTask = (lead) => {
    if (!lead.callTasks || lead.callTasks.length === 0) {
      return null;
    }
    return lead.callTasks.reduce((latest, task) => {
      if (!task.taskDate) return latest;
      const taskDate = new Date(task.taskDate);
      if (!latest) return task;
      const latestDate = new Date(latest.taskDate);
      return taskDate > latestDate ? task : latest;
    }, null);
  };

  // Prepare table data - NEW UI but same data structure
  const tableData = useMemo(() => {
    return filteredLeads.map((lead, index) => {
      const personal = lead.personalDetails || {};
      const latestTask = getLatestCallTask(lead);

      return {
        key: lead._id,
        sn: index + 1,
        assignedDate: formatDate(lead.assignedAt),
        groupCode: personal.groupCode || "-",
        grade: personal.grade || "-",
        groupName: personal.groupName || "-",
        name: (
          <span
            style={{ color: "#1890ff", cursor: "pointer", fontWeight: 500 }}
            onClick={() => navigate(`/telecaller/suspect/edit/${lead._id}`)}
          >
            {personal.name || personal.groupName || "-"}
          </span>
        ),
        contact: (
          <div>
            {personal.mobileNo && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  marginBottom: "2px",
                }}
              >
                <PhoneOutlined style={{ fontSize: "12px", color: "#52c41a" }} />
                <span>{personal.mobileNo}</span>
                <a
                  href={`tel:${personal.mobileNo}`}
                  style={{
                    fontSize: "11px",
                    marginLeft: "4px",
                    color: "#1890ff",
                  }}
                >
                  Call
                </a>
              </div>
            )}
            {(!personal.mobileNo || personal.mobileNo === "-") && "-"}
          </div>
        ),
        leadSource: personal.leadSource || "-",
        leadOccupation: personal.leadOccupation || "-",
        area: personal.city || personal.preferredMeetingArea || "-",
        currentStatus: (
          <Tag
            color={statusConfig.color}
            style={{ fontWeight: 500, fontSize: "11px" }}
          >
            {latestTask?.taskStatus || "Not Contacted"}
          </Tag>
        ),
        nextAction: latestTask?.nextFollowUpDate ? (
          <div
            style={{
              fontSize: "11px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <CalendarOutlined style={{ fontSize: "10px" }} />
            <span>{formatDate(latestTask.nextFollowUpDate)}</span>
          </div>
        ) : (
          "-"
        ),
        taskDate: latestTask?.taskDate ? formatDate(latestTask.taskDate) : "-",
        taskTime: latestTask?.taskTime || "-",
        remarks: latestTask?.taskRemarks ? (
          <div style={{ maxWidth: "150px" }}>
            {latestTask.taskRemarks.length > 30
              ? `${latestTask.taskRemarks.substring(0, 30)}...`
              : latestTask.taskRemarks}
          </div>
        ) : (
          "-"
        ),
        organisation: personal.organisation || "-",
      };
    });
  }, [filteredLeads, navigate, statusConfig.color]);

  // Columns - Same as before but with new UI
  const columns = [
    { header: "S.N", key: "sn", width: "60px", align: "center" },
    { header: "Assigned Date", key: "assignedDate", width: "100px" },
    { header: "Group Code", key: "groupCode", width: "100px" },
    { header: "Grade", key: "grade", width: "80px" },
    { header: "Group Name", key: "groupName", width: "120px" },
    { header: "Name", key: "name", width: "120px" },
    { header: "Contact", key: "contact", width: "130px" },
    { header: "Lead Source", key: "leadSource", width: "100px" },
    { header: "Lead Occupation", key: "leadOccupation", width: "120px" },
    { header: "Area", key: "area", width: "100px" },
    { header: "Current Status", key: "currentStatus", width: "120px" },
    { header: "Next Action", key: "nextAction", width: "100px" },
    { header: "Task Date", key: "taskDate", width: "100px" },
    { header: "Task Time", key: "taskTime", width: "80px" },
    { header: "Remarks", key: "remarks", width: "150px" },
    { header: "Organisation", key: "organisation", width: "120px" },
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
