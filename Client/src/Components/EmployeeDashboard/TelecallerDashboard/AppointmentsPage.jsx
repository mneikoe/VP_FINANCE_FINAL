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
  Modal,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axiosInstance from "../../../config/axios";
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
  const [callModal, setCallModal] = useState({
    visible: false,
    phoneNumber: "",
    type: "",
  });

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

  // Format time for display in AM/PM
  const formatTimeAMPM = (timeString) => {
    if (!timeString) return "-";

    // Split time string
    const timeParts = timeString.split(":");
    const hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];

    // Convert to 12-hour format
    const ampm = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;

    return `${hours12}:${minutes} ${ampm}`;
  };

  // Handle phone number click
  const handlePhoneClick = (phoneNumber, type = "mobile") => {
    if (!phoneNumber || phoneNumber === "-") return;

    setCallModal({
      visible: true,
      phoneNumber,
      type: type === "mobile" ? "Mobile" : "Contact",
    });
  };

  // Handle call confirmation
  const handleCallConfirm = () => {
    if (callModal.phoneNumber) {
      window.location.href = `tel:${callModal.phoneNumber}`;
    }
    setCallModal({ visible: false, phoneNumber: "", type: "" });
  };

  // Prepare table data
  const tableData = useMemo(() => {
    return appointments.map((appointment, index) => {
      const personalDetails = appointment.personalDetails || {};
      

      return {
        key: appointment._id,
        sn: index + 1,
        taskDate: formatDate(appointment.createdAt || appointment.scheduledOn),
        groupCode: personalDetails.groupCode || "-",
        groupName: personalDetails.groupName || personalDetails.name || "-",
        mobileNo: personalDetails.mobileNo || "-",
        contactNo: personalDetails.contactNo || "-",
        leadSource: personalDetails.leadSource || "-",
        leadOccupation: personalDetails.leadOccupation || "-",
        callingPurpose: personalDetails.callingPurpose || '-',
        area: personalDetails.city || "-",
        appointmentDate: formatDate(appointment.appointmentDate),
        appointmentTime: formatTimeAMPM(appointment.appointmentTime),
        status: personalDetails.status || "SUSPECT",
        remark: appointment.appointmentRemarks || "-",
      };
    });
  }, [appointments]);

  const columns = [
    {
      header: "Last Call Date",
      key: "taskDate",
      width: "110px",
    },
    {
      header: "Group Code",
      key: "groupCode",
      width: "100px",
    },
    {
      header: "Group Name",
      key: "groupName",
      width: "150px",
    },
    {
      header: "Mobile Number",
      key: "mobileNo",
      width: "110px",
    },
    {
      header: "Phone Number",
      key: "contactNo",
      width: "120px",
    },
    {
      header: "Lead Source",
      key: "leadSource",
      width: "120px",
    },
    {
      header: "Lead Occupation",
      key: "leadOccupation",
      width: "130px",
    },
    {
      header: "Calling Purpose", //i have added this
      key: "callingPurpose",
      width: "130px",
    },
    {
      header: "Area",
      key: "area",
      width: "100px",
    },
    {
      header: "Appointment Date",
      key: "appointmentDate",
      width: "120px",
    },
    {
      header: " Appointment Time",
      key: "appointmentTime",
      width: "130px",
      align: "center",
    },
    {
      header: "Status",
      key: "status",
      width: "90px",
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
      {/* Call Confirmation Modal */}
      <Modal
        title="Confirm Call"
        open={callModal.visible}
        onOk={handleCallConfirm}
        onCancel={() =>
          setCallModal({ visible: false, phoneNumber: "", type: "" })
        }
        okText="Call"
        cancelText="Cancel"
        okButtonProps={{
          style: {
            backgroundColor: "#52c41a",
            borderColor: "#52c41a",
          },
        }}
      >
        <div style={{ padding: "20px 0", textAlign: "center" }}>
          <div
            style={{ fontSize: "48px", color: "#1890ff", marginBottom: "16px" }}
          >
            📞
          </div>
          <h3 style={{ color: "#1f1f1f", marginBottom: "8px" }}>
            Call on this number?
          </h3>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#1890ff",
              marginBottom: "8px",
            }}
          >
            {callModal.phoneNumber}
          </div>
          <div style={{ color: "#666", fontSize: "14px" }}>
            {callModal.type} Number
          </div>
        </div>
      </Modal>

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
          overflow: "hidden",
        }}
        bodyStyle={{ padding: "0" }}
      >
        <div
          style={{
            padding: "20px 24px",
            backgroundColor: "#fff",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
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
                Showing <strong>{appointments.length}</strong> appointment(s)
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Button
                onClick={() => navigate("/telecaller/dashboard")}
                style={{ borderRadius: "6px" }}
              >
                Back to Dashboard
              </Button>
            </div>
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
              backgroundColor: "#fff",
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
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily:
                  "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#fafafa" }}>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      style={{
                        padding: "12px 16px",
                        textAlign: col.align || "center",
                        fontWeight: 600,
                        fontSize: "13px",
                        color: "#666",
                        borderBottom: "1px solid #f0f0f0",
                        whiteSpace: "nowrap",
                        minWidth: col.width,
                      }}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => (
                
                  <tr
                  key={row.key}
                  style={{
                    borderBottom: "1px solid #f0f0f0",
                    backgroundColor: "#fff",
                    transition: "background-color 0.2s",
                  }}
                  >
                
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: "13px",
                        color: "#1f1f1f",
                        fontWeight: 500,
                      }}
                    >
                      {row.taskDate}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: "13px",
                        color: "#1f1f1f",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Courier New', monospace",
                          fontWeight: 600,
                          color: "#1890ff",
                          backgroundColor: "#e6f7ff",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          display: "inline-block",
                        }}
                      >
                        {row.groupCode}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: "13px",
                        color: "#1f1f1f",
                        fontWeight: 500,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <UserOutlined
                          style={{ color: "#52c41a", fontSize: "12px" }}
                        />
                        <span>{row.groupName}</span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: "13px",
                        color: row.mobileNo !== "-" ? "#1890ff" : "#bfbfbf",
                        fontWeight: 500,
                        cursor: row.mobileNo !== "-" ? "pointer" : "default",
                        fontFamily: "monospace",
                      }}
                      onClick={() =>
                        row.mobileNo !== "-" &&
                        handlePhoneClick(row.mobileNo, "mobile")
                      }
                    >
                      {row.mobileNo}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: "13px",
                        color: row.contactNo !== "-" ? "#1890ff" : "#bfbfbf",
                        fontWeight: 500,
                        cursor: row.contactNo !== "-" ? "pointer" : "default",
                        fontFamily: "monospace",
                      }}
                      onClick={() =>
                        row.contactNo !== "-" &&
                        handlePhoneClick(row.contactNo, "contact")
                      }
                    >
                      {row.contactNo}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: "13px",
                        color: "#666",
                      }}
                    >
                      {row.leadSource}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: "13px",
                        color: "#666",
                      }}
                    >
                      {row.leadOccupation}
                    </td>
                    <td
  style={{
    padding: "12px 16px",
    fontSize: "13px",
    color: "#bfbfbf",
    fontStyle: "italic",
    textAlign: "center",
  }}
>
 
  {row.callingPurpose}
</td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: "13px",
                        color: "#666",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <EnvironmentOutlined
                          style={{ color: "#fa8c16", fontSize: "12px" }}
                        />
                        <span>{row.area}</span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: "13px",
                        color: "#1f1f1f",
                        fontWeight: 500,
                      }}
                    >
                      {row.appointmentDate}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "center",
                        fontSize: "13px",
                        color: "#1f1f1f",
                        fontWeight: 500,
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "#f6ffed",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: "1px solid #b7eb8f",
                        }}
                      >
                        {row.appointmentTime}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          fontSize: "11px",
                          fontWeight: 600,
                          borderRadius: "12px",
                          backgroundColor: "#e6f7ff",
                          color: "#1890ff",
                          border: "1px solid #91d5ff",
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: "13px",
                        color: "#666",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "150px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.remark}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              backgroundColor: "#fff",
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

        {/* Pagination for large data */}
        {appointments.length > 0 && (
          <div
            style={{
              padding: "16px 24px",
              backgroundColor: "#fafafa",
              borderTop: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "13px", color: "#666" }}>
              Showing {appointments.length} of {stats.total} appointments
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Button size="small" disabled>
                Previous
              </Button>
              <Button type="primary" size="small">
                1
              </Button>
              <Button size="small">Next</Button>
            </div>
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

        table tr:hover {
          background-color: #fafafa !important;
        }

        @media (max-width: 768px) {
          .appointments-page {
            padding: 16px !important;
          }

          table {
            display: block;
            overflow-x: auto;
            white-space: nowrap;
          }

          th,
          td {
            min-width: 100px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AppointmentsScheduledPage;
