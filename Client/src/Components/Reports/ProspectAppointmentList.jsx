import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Card,
  DatePicker,
  Input,
  message,
  Modal,
  Avatar,
  Row,
  Col,
  Statistic,
  Alert,
  Tooltip,
  Select,
  Divider,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CalendarOutlined,
  PhoneOutlined,
  UserOutlined,
  FilterOutlined,
  ClearOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../config/axios";
import dayjs from "dayjs";
import "./ProspectAppointmentList.css";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

const ProspectAppointmentList = ({
  showAppointmentInfo = true,
  showActions = true,
  debugMode = false,
  onStatsUpdate,
}) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: null,
    search: "",
    status: "all",
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [localStats, setLocalStats] = useState({
    total: 0,
    today: 0,
    upcoming: 0,
    suspects: 0,
    prospects: 0,
  });

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      console.log("📡 Fetching Appointment Scheduled prospects...");

      const response = await axiosInstance.get(
        "/api/suspect/appointments/scheduled"
      );

      console.log("📦 API Response:", response.data);

      if (response.data && response.data.success) {
        const appointmentsData = response.data.data.appointments || [];

        const processedAppointments = appointmentsData.map(
          (appointment, index) => {
            const personalDetails = appointment.personalDetails || {};
            const telecallerInfo = appointment.assignedTo || {};

            return {
              key: appointment._id || index,
              id: appointment._id,
              sn: index + 1,

              prospectName:
                appointment.groupName ||
                personalDetails.groupName ||
                personalDetails.name ||
                "Unknown",
              groupCode: appointment.groupCode || "-",
              organisation: appointment.organisation || "-",
              city: appointment.city || "-",
              mobile: appointment.mobileNo || "-",
              contact: appointment.contactNo || "-",
              email: appointment.emailId || "-",
              status: appointment.status || "suspect",
              leadSource: appointment.leadSource || "-",

              telecallerId: telecallerInfo._id,
              telecallerName: telecallerInfo.username || "Unassigned",
              telecallerEmail: telecallerInfo.email || "-",
              telecallerMobile: telecallerInfo.mobileno || "-",

              scheduledOn: appointment.scheduledOn
                ? new Date(appointment.scheduledOn)
                : null,
              appointmentDate: appointment.appointmentDate
                ? new Date(appointment.appointmentDate)
                : null,
              appointmentTime: appointment.appointmentTime || "-",

              remarks: appointment.appointmentRemarks || "-",
              assignedAt: appointment.assignedAt
                ? new Date(appointment.assignedAt)
                : null,

              rawData: appointment,
            };
          }
        );

        console.log(
          `✅ Processed ${processedAppointments.length} appointments`
        );
        setAppointments(processedAppointments);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayCount = processedAppointments.filter((apt) => {
          if (!apt.appointmentDate) return false;
          const aptDate = new Date(apt.appointmentDate);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate.getTime() === today.getTime();
        }).length;

        const upcomingCount = processedAppointments.filter((apt) => {
          if (!apt.appointmentDate) return false;
          const today = new Date();
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          return (
            apt.appointmentDate >= today && apt.appointmentDate <= nextWeek
          );
        }).length;

        const newStats = {
          total: processedAppointments.length,
          today: todayCount,
          upcoming: upcomingCount,
          suspects: processedAppointments.filter(
            (apt) => apt.status === "suspect"
          ).length,
          prospects: processedAppointments.filter(
            (apt) => apt.status === "prospect"
          ).length,
        };

        setLocalStats(newStats);

        if (onStatsUpdate) {
          onStatsUpdate({
            totalProspects: processedAppointments.length,
            todayAppointments: todayCount,
            upcomingAppointments: upcomingCount,
          });
        }
      } else {
        message.error(response.data?.message || "Failed to fetch appointments");
        setAppointments([]);
      }
    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Error loading appointments."
      );
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [onStatsUpdate]);

  const applyFilters = useCallback(() => {
    let filtered = [...appointments];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.prospectName.toLowerCase().includes(searchTerm) ||
          apt.groupCode.toLowerCase().includes(searchTerm) ||
          apt.organisation.toLowerCase().includes(searchTerm) ||
          apt.city.toLowerCase().includes(searchTerm) ||
          apt.telecallerName.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      filtered = filtered.filter((apt) => {
        if (!apt.appointmentDate) return false;

        const aptDate = new Date(apt.appointmentDate);
        aptDate.setHours(0, 0, 0, 0);

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return aptDate >= start && aptDate <= end;
      });
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((apt) => apt.status === filters.status);
    }

    return filtered;
  }, [appointments, filters]);

  const filteredAppointments = useMemo(() => applyFilters(), [applyFilters]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleDateRangeChange = (dates) => {
    setFilters((prev) => ({ ...prev, dateRange: dates }));
  };

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      dateRange: null,
      search: "",
      status: "all",
    });
  };

  const viewAppointmentDetails = (record) => {
    setSelectedAppointment(record);
    setModalVisible(true);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return dayjs(date).format("DD/MM/YYYY");
  };

  const formatTime = (time) => {
    if (!time || time === "-") return "-";
    return time;
  };

  const columns = [
    {
      title: "S.N",
      dataIndex: "sn",
      key: "sn",
      width: 60,
      align: "center",
    },
    {
      title: "Prospect Name",
      dataIndex: "prospectName",
      key: "prospectName",
      width: 180,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500, color: "#1890ff" }}>{text}</div>
          <div style={{ fontSize: "11px", color: "#666" }}>
            Code: {record.groupCode}
          </div>
        </div>
      ),
    },
    {
      title: "Organisation",
      dataIndex: "organisation",
      key: "organisation",
      width: 150,
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      width: 100,
      render: (text) => (
        <Tag color="blue" style={{ fontSize: "11px" }}>
          {text}
        </Tag>
      ),
    },
    {
      title: "Contact",
      dataIndex: "mobile",
      key: "mobile",
      width: 120,
      render: (text, record) => (
        <div>
          <div style={{ fontFamily: "monospace" }}>{text}</div>
          {record.contact !== "-" && record.contact !== text && (
            <div style={{ fontSize: "10px", color: "#666" }}>
              Alt: {record.contact}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Scheduled On",
      dataIndex: "scheduledOn",
      key: "scheduledOn",
      width: 110,
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.scheduledOn) - new Date(b.scheduledOn),
    },
    {
      title: "Appointment Date",
      dataIndex: "appointmentDate",
      key: "appointmentDate",
      width: 120,
      render: (date, record) => (
        <div>
          <div style={{ fontWeight: 500, color: "#52c41a" }}>
            {formatDate(date)}
          </div>
          <div style={{ fontSize: "11px", color: "#666" }}>
            {formatTime(record.appointmentTime)}
          </div>
        </div>
      ),
      sorter: (a, b) =>
        new Date(a.appointmentDate) - new Date(b.appointmentDate),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (status) => (
        <Tag color={status === "prospect" ? "green" : "blue"}>
          {status?.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: "Suspect", value: "suspect" },
        { text: "Prospect", value: "prospect" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Telecaller",
      dataIndex: "telecallerName",
      key: "telecallerName",
      width: 130,
      render: (name, record) => (
        <div>
          <Avatar
            size="small"
            style={{
              backgroundColor: "#1890ff",
              marginRight: "6px",
              fontSize: "10px",
            }}
            icon={<UserOutlined />}
          />
          <span style={{ fontSize: "12px" }}>{name}</span>
          {record.telecallerEmail !== "-" && (
            <div style={{ fontSize: "10px", color: "#666" }}>
              {record.telecallerEmail}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => viewAppointmentDetails(record)}
              style={{ color: "#1890ff" }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="prospect-appointment-list">
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CalendarOutlined style={{ color: "#1890ff" }} />
            <span>Appointment Scheduled Prospects</span>
            <Tag color="blue" style={{ marginLeft: "10px" }}>
              {localStats.total} Appointments
            </Tag>
          </div>
        }
        extra={
          <Button
            type="primary"
            onClick={fetchAppointments}
            loading={loading}
            icon={<CalendarOutlined />}
          >
            Refresh
          </Button>
        }
        style={{ marginBottom: "20px", borderRadius: "8px" }}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Total Appointments"
                value={localStats.total}
                prefix={<TeamOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Today"
                value={localStats.today}
                prefix={<CalendarOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Upcoming (7 days)"
                value={localStats.upcoming}
                prefix={<ClockCircleOutlined style={{ color: "#fa8c16" }} />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "4px",
                  }}
                >
                  Prospects/Suspects
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  <Tag
                    color="blue"
                    style={{ fontSize: "12px", padding: "2px 8px" }}
                  >
                    S: {localStats.suspects}
                  </Tag>
                  <Tag
                    color="green"
                    style={{ fontSize: "12px", padding: "2px 8px" }}
                  >
                    P: {localStats.prospects}
                  </Tag>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FilterOutlined />
              <span>Filters</span>
            </div>
          }
          size="small"
          style={{ marginBottom: "20px" }}
          extra={
            <Button
              size="small"
              onClick={handleClearFilters}
              icon={<ClearOutlined />}
            >
              Clear
            </Button>
          }
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "4px",
                  }}
                >
                  Search Prospect/Telecaller
                </div>
                <Input
                  placeholder="Search by name, organisation, city..."
                  prefix={<SearchOutlined />}
                  value={filters.search}
                  onChange={handleSearchChange}
                  allowClear
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "4px",
                  }}
                >
                  Filter by Appointment Date
                </div>
                <RangePicker
                  value={filters.dateRange}
                  onChange={handleDateRangeChange}
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  placeholder={["Start Date", "End Date"]}
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "4px",
                  }}
                >
                  Status Filter
                </div>
                <Select
                  value={filters.status}
                  onChange={handleStatusChange}
                  style={{ width: "100%" }}
                >
                  <Option value="all">All Status</Option>
                  <Option value="suspect">Suspect Only</Option>
                  <Option value="prospect">Prospect Only</Option>
                </Select>
              </div>
            </Col>
          </Row>
        </Card>
      </Card>

      <Card style={{ borderRadius: "8px" }}>
        <Table
          columns={columns}
          dataSource={filteredAppointments}
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} appointments`,
            showQuickJumper: true,
          }}
          rowKey="id"
          summary={() => (
            <Table.Summary>
              <Table.Summary.Row style={{ background: "#fafafa" }}>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <strong>Total Appointments:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={7}>
                  <div style={{ display: "flex", gap: "20px" }}>
                    <span>
                      <Tag color="blue">
                        Total: {filteredAppointments.length}
                      </Tag>
                    </span>
                    <span>
                      <Tag color="green">Today: {localStats.today}</Tag>
                    </span>
                    <span>
                      <Tag color="orange">Upcoming: {localStats.upcoming}</Tag>
                    </span>
                  </div>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CalendarOutlined style={{ color: "#1890ff" }} />
            <span>Appointment Details</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedAppointment && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Prospect Name
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 500 }}>
                    {selectedAppointment.prospectName}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Code: {selectedAppointment.groupCode}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Organisation
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 500 }}>
                    {selectedAppointment.organisation}
                  </div>
                </div>
              </Col>
            </Row>

            <Divider orientation="left" style={{ fontSize: "14px" }}>
              Appointment Information
            </Divider>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" title="Scheduled On">
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 500,
                        color: "#1890ff",
                      }}
                    >
                      {formatDate(selectedAppointment.scheduledOn)}
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Appointment Date">
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 500,
                        color: "#52c41a",
                      }}
                    >
                      {formatDate(selectedAppointment.appointmentDate)}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#666",
                        marginTop: "4px",
                      }}
                    >
                      {formatTime(selectedAppointment.appointmentTime)}
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            <Divider orientation="left" style={{ fontSize: "14px" }}>
              Telecaller Information
            </Divider>

            <Card size="small">
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Avatar
                  size={40}
                  style={{ backgroundColor: "#1890ff" }}
                  icon={<UserOutlined />}
                />
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 500 }}>
                    {selectedAppointment.telecallerName}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Email: {selectedAppointment.telecallerEmail}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#999",
                      fontFamily: "monospace",
                    }}
                  >
                    ID: {selectedAppointment.telecallerId?.substring(0, 16)}...
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProspectAppointmentList;
