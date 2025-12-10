import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  DatePicker,
  Space,
  Button,
  Select,
  Tag,
  Alert,
  Card,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  BankOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axiosInstance from "../../../config/axios";
import LeadsTableLayout from "./LeadsTableLayout";
import { setappointmentdoneCount } from "../../../redux/feature/showdashboarddata/dashboarddataSlice";
import "./AppointmentsPage.css";

const { RangePicker } = DatePicker;
const { Option } = Select;

const AppointmentsScheduledPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const telecallerId = user?.id || null;

  // State
  const [dateFilter, setDateFilter] = useState("all");
  const [dateRange, setDateRange] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    today: 0,
    tomorrow: 0,
    total: 0,
    suspects: 0,
    prospects: 0,
  });
  const [error, setError] = useState("");

  // Fetch appointments from API
  const fetchAppointments = useCallback(async () => {
    if (!telecallerId) {
      setError("Telecaller ID not found. Please login again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let params = {
        dateFilter,
      };

      // Add date range for custom filter
      if (dateFilter === "custom" && dateRange.length === 2) {
        params.startDate = dateRange[0].toISOString().split("T")[0];
        params.endDate = dateRange[1].toISOString().split("T")[0];
      }

      const response = await axiosInstance.get(
        `/api/telecaller/${telecallerId}/appointments`,
        { params }
      );

      if (response.data && response.data.success) {
        const data = response.data.data;
        setAppointments(data.appointments || []);
        setStats(
          data.stats || {
            today: 0,
            tomorrow: 0,
            total: 0,
            suspects: 0,
            prospects: 0,
          }
        );
      } else {
        setError(response.data?.message || "Failed to fetch appointments");
        setAppointments([]);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Network error. Please try again."
      );
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [telecallerId, dateFilter, dateRange]);

  // Initial load
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Dispatch to Redux
  useEffect(() => {
    dispatch(setappointmentdoneCount(stats.total));
  }, [stats.total, dispatch]);

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
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "-";
    // Remove seconds if present
    return timeString.split(":").slice(0, 2).join(":");
  };

  // Prepare table data
  const tableData = useMemo(() => {
    return appointments.map((appointment, index) => {
      const personalDetails = appointment.personalDetails || {};

      return {
        key: appointment._id,
        sn: index + 1,
        scheduledOn: formatDate(appointment.scheduledOn),
        appointmentDate: formatDate(appointment.appointmentDate),
        appointmentTime: formatTime(appointment.appointmentTime),
        suspectName: (
          <div>
            <div
              style={{ fontWeight: 500, color: "#1890ff", cursor: "pointer" }}
              onClick={() => navigate(`/suspect/details/${appointment._id}`)}
            >
              {personalDetails.name || personalDetails.groupName || "Unknown"}
            </div>
            {personalDetails.groupCode && (
              <div
                style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}
              >
                Code: {personalDetails.groupCode}
              </div>
            )}
          </div>
        ),
        organisation: (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <BankOutlined style={{ color: "#8c8c8c", fontSize: "12px" }} />
            <span>{personalDetails.organisation || "-"}</span>
          </div>
        ),
        area: (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <EnvironmentOutlined
              style={{ color: "#8c8c8c", fontSize: "12px" }}
            />
            <span>{personalDetails.city || "-"}</span>
          </div>
        ),
        contact: (
          <div className="contact-info">
            {personalDetails.mobileNo ? (
              <div className="contact-item" style={{ marginBottom: "4px" }}>
                <PhoneOutlined
                  style={{ marginRight: "4px", color: "#52c41a" }}
                />
                <span style={{ fontFamily: "monospace", fontWeight: 500 }}>
                  {personalDetails.mobileNo}
                </span>
                <a
                  href={`tel:${personalDetails.mobileNo}`}
                  className="call-link"
                  title="Call"
                  style={{
                    marginLeft: "8px",
                    fontSize: "11px",
                    color: "#1890ff",
                  }}
                >
                  Call
                </a>
              </div>
            ) : null}

            {personalDetails.contactNo ? (
              <div className="contact-item">
                <PhoneOutlined
                  style={{ marginRight: "4px", color: "#1890ff" }}
                />
                <span style={{ fontFamily: "monospace" }}>
                  {personalDetails.contactNo}
                </span>
                <a
                  href={`tel:${personalDetails.contactNo}`}
                  className="call-link"
                  title="Call"
                  style={{
                    marginLeft: "8px",
                    fontSize: "11px",
                    color: "#1890ff",
                  }}
                >
                  Call
                </a>
              </div>
            ) : null}

            {!personalDetails.mobileNo && !personalDetails.contactNo && (
              <span style={{ color: "#bfbfbf" }}>No contact</span>
            )}
          </div>
        ),
        status: (
          <Tag
            color="processing"
            style={{
              fontWeight: 500,
              fontSize: "11px",
              padding: "2px 8px",
              borderRadius: "12px",
            }}
          >
            SUSPECT
          </Tag>
        ),
        appointmentStatus: (
          <Tag
            color="blue"
            style={{
              fontWeight: 500,
              fontSize: "11px",
              padding: "2px 8px",
              background: "linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)",
              borderColor: "#91d5ff",
              borderRadius: "12px",
            }}
          >
            <ClockCircleOutlined style={{ marginRight: "4px" }} />
            SCHEDULED
          </Tag>
        ),
        remark: (
          <div
            style={{
              maxWidth: "150px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {appointment.appointmentRemarks || "-"}
          </div>
        ),
      };
    });
  }, [appointments, navigate]);

  const columns = [
    {
      header: "S.N",
      key: "sn",
      width: "60px",
      align: "center",
    },
    {
      header: "Scheduled On",
      key: "scheduledOn",
      width: "110px",
    },
    {
      header: "Appointment Date",
      key: "appointmentDate",
      width: "120px",
    },
    {
      header: "Time",
      key: "appointmentTime",
      width: "80px",
      align: "center",
    },
    {
      header: "Name",
      key: "suspectName",
      width: "180px",
    },
    {
      header: "Organisation",
      key: "organisation",
      width: "140px",
    },
    {
      header: "Area",
      key: "area",
      width: "100px",
    },
    {
      header: "Contact",
      key: "contact",
      width: "150px",
    },
    {
      header: "Status",
      key: "status",
      width: "90px",
      align: "center",
    },
    {
      header: "Appointment",
      key: "appointmentStatus",
      width: "110px",
      align: "center",
    },
    {
      header: "Remark",
      key: "remark",
      width: "150px",
    },
  ];

  // Filter title
  const getFilterTitle = () => {
    switch (dateFilter) {
      case "today":
        return "Today's Appointments";
      case "tomorrow":
        return "Tomorrow's Appointments";
      case "this_week":
        return "This Week's Appointments";
      case "this_month":
        return "This Month's Appointments";
      case "custom":
        return "Custom Range Appointments";
      default:
        return "All Appointments";
    }
  };

  return (
    <div
      className="appointments-page"
      style={{ padding: "24px", backgroundColor: "#f0f2f5" }}
    >
      {/* Header */}
      <Card
        style={{
          marginBottom: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#1f1f1f",
                fontSize: "28px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CalendarOutlined
                  style={{ color: "white", fontSize: "24px" }}
                />
              </div>
              <span>Appointments Scheduled</span>
            </h1>
            <p
              style={{
                margin: "12px 0 0 0",
                color: "#666",
                fontSize: "15px",
                maxWidth: "600px",
              }}
            >
              Manage and track all your scheduled appointments with clients
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Tag
              color="blue"
              style={{
                fontSize: "15px",
                padding: "6px 16px",
                borderRadius: "20px",
                fontWeight: 500,
              }}
            >
              Total:{" "}
              <strong style={{ marginLeft: "4px" }}>{stats.total}</strong>
            </Tag>
            <Button
              type="primary"
              onClick={fetchAppointments}
              loading={isLoading}
              icon={!isLoading && <span style={{ fontSize: "16px" }}>↻</span>}
              style={{
                borderRadius: "8px",
                padding: "8px 16px",
                height: "auto",
                fontWeight: 500,
              }}
            >
              {isLoading ? "Loading..." : "Refresh"}
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
          style={{
            marginBottom: "24px",
            borderRadius: "8px",
          }}
          closable
          onClose={() => setError("")}
        />
      )}

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card
            size="small"
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Statistic
              title="Today"
              value={stats.today}
              prefix={<CalendarOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{
                color: "#52c41a",
                fontSize: "28px",
                fontWeight: 600,
              }}
            />
            <div
              style={{
                fontSize: "12px",
                color: "#8c8c8c",
                marginTop: "8px",
              }}
            >
              Appointments today
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card
            size="small"
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Statistic
              title="Tomorrow"
              value={stats.tomorrow}
              prefix={<CalendarOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{
                color: "#1890ff",
                fontSize: "28px",
                fontWeight: 600,
              }}
            />
            <div
              style={{
                fontSize: "12px",
                color: "#8c8c8c",
                marginTop: "8px",
              }}
            >
              Appointments tomorrow
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card
            size="small"
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Statistic
              title="Total"
              value={stats.total}
              prefix={<TeamOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{
                color: "#722ed1",
                fontSize: "28px",
                fontWeight: 600,
              }}
            />
            <div
              style={{
                fontSize: "12px",
                color: "#8c8c8c",
                marginTop: "8px",
              }}
            >
              All appointments
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card
            size="small"
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Statistic
              title="Suspects"
              value={stats.suspects}
              prefix={<UserOutlined style={{ color: "#fa8c16" }} />}
              valueStyle={{
                color: "#fa8c16",
                fontSize: "28px",
                fontWeight: 600,
              }}
            />
            <div
              style={{
                fontSize: "12px",
                color: "#8c8c8c",
                marginTop: "8px",
              }}
            >
              Total suspects
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card
            size="small"
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              borderLeft: "4px solid #f5222d",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "8px",
                  fontWeight: 500,
                }}
              >
                Telecaller
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#1f1f1f",
                  marginBottom: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <UserOutlined style={{ color: "#1890ff" }} />
                {user?.username || "Unknown"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#999",
                  marginTop: "4px",
                  fontFamily: "monospace",
                  backgroundColor: "#f5f5f5",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  display: "inline-block",
                }}
              >
                ID: {telecallerId?.substring(0, 6)}...
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px", fontWeight: 500 }}>Filters</span>
            <Tag color="blue" style={{ fontSize: "12px" }}>
              {dateFilter === "custom" && dateRange.length === 2
                ? `${dateRange[0].toLocaleDateString()} - ${dateRange[1].toLocaleDateString()}`
                : dateFilter.replace("_", " ").toUpperCase()}
            </Tag>
          </div>
        }
        style={{
          marginBottom: "24px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
        extra={
          <Button
            onClick={handleClearFilters}
            size="middle"
            disabled={
              isLoading || (dateFilter === "all" && dateRange.length === 0)
            }
            style={{ borderRadius: "6px" }}
          >
            Clear Filters
          </Button>
        }
      >
        <Space wrap style={{ width: "100%" }}>
          <div>
            <div
              style={{
                fontSize: "13px",
                color: "#666",
                marginBottom: "8px",
                fontWeight: 500,
              }}
            >
              Filter by Date
            </div>
            <Select
              value={dateFilter}
              onChange={handleDateFilterChange}
              style={{ width: 200 }}
              loading={isLoading}
              size="middle"
              dropdownStyle={{ borderRadius: "8px" }}
            >
              <Option value="today">Today</Option>
              <Option value="tomorrow">Tomorrow</Option>
              <Option value="this_week">This Week</Option>
              <Option value="this_month">This Month</Option>
              <Option value="custom">Custom Range</Option>
              <Option value="all">All Appointments</Option>
            </Select>
          </div>

          {dateFilter === "custom" && (
            <div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#666",
                  marginBottom: "8px",
                  fontWeight: 500,
                }}
              >
                Select Date Range
              </div>
              <RangePicker
                value={dateRange[0] ? dayjs(dateRange[0]) : null}
                onChange={handleRangeChange}
                format="DD/MM/YYYY"
                style={{ width: 280 }}
                size="middle"
                disabled={isLoading}
                allowClear={false}
              />
            </div>
          )}
        </Space>
      </Card>

      {/* Data Table */}
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "#1f1f1f",
                fontSize: "20px",
                fontWeight: 600,
              }}
            >
              {getFilterTitle()}
            </h2>
            <p
              style={{
                margin: "4px 0 0 0",
                color: "#666",
                fontSize: "14px",
              }}
            >
              Manage your appointment schedule
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                color: "#666",
                fontSize: "14px",
                backgroundColor: "#f5f5f5",
                padding: "6px 12px",
                borderRadius: "6px",
              }}
            >
              Showing{" "}
              <strong style={{ color: "#1890ff", margin: "0 4px" }}>
                {appointments.length}
              </strong>{" "}
              appointment(s)
            </span>
            <Button
              onClick={() => navigate("/telecaller/dashboard")}
              style={{ borderRadius: "6px" }}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              minHeight: "400px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: "56px",
                marginBottom: "20px",
                color: "#1890ff",
                animation: "spin 1s linear infinite",
              }}
            >
              <CalendarOutlined />
            </div>
            <h3
              style={{
                color: "#595959",
                marginBottom: "12px",
                fontSize: "18px",
                fontWeight: 500,
              }}
            >
              Loading Appointments...
            </h3>
            <p
              style={{
                color: "#8c8c8c",
                fontSize: "14px",
                maxWidth: "400px",
              }}
            >
              Please wait while we fetch your appointment data
            </p>
          </div>
        ) : appointments.length > 0 ? (
          <LeadsTableLayout
            data={tableData}
            columns={columns}
            showSearch={true}
            showPagination={true}
            pageSize={10}
            searchPlaceholder="Search by name, organisation, area, or contact..."
            style={{ borderRadius: "8px" }}
          />
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              minHeight: "400px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: "72px",
                marginBottom: "24px",
                color: "#d9d9d9",
                opacity: 0.5,
              }}
            >
              <CalendarOutlined />
            </div>
            <h3
              style={{
                color: "#595959",
                marginBottom: "12px",
                fontSize: "20px",
                fontWeight: 500,
              }}
            >
              No Appointments Found
            </h3>
            <p
              style={{
                color: "#8c8c8c",
                marginBottom: "24px",
                maxWidth: "500px",
                margin: "0 auto 24px",
                fontSize: "15px",
                lineHeight: "1.6",
              }}
            >
              {dateFilter === "all"
                ? "You don't have any appointments scheduled yet. Appointments will appear here once scheduled."
                : `No appointments found for the selected date filter. Try changing the filter to see more results.`}
            </p>

            <Space>
              <Button
                type="primary"
                onClick={() => setDateFilter("all")}
                style={{ borderRadius: "6px" }}
              >
                Show All Appointments
              </Button>

              <Button
                onClick={() => navigate("/telecaller/dashboard")}
                style={{ borderRadius: "6px" }}
              >
                Go to Dashboard
              </Button>
            </Space>
          </div>
        )}
      </Card>

      {/* Add some CSS for animation */}
      <style jsx="true">{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .appointments-page {
          min-height: 100vh;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .contact-item:hover {
          background-color: #f5f5f5;
          border-radius: 4px;
          padding: 2px 4px;
        }

        .call-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default AppointmentsScheduledPage;
