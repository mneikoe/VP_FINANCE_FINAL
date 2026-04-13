import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Spin,
  Typography,
  Space,
  DatePicker,
  Empty,
  Statistic,
  Tooltip,
  Divider,
} from "antd";
import {
  PhoneOutlined,
  FilterOutlined,
  SyncOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ForwardOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
  PhoneFilled,
  BarChartOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "../../config/axios";

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const TelecallerReport = () => {
  const navigate = useNavigate();
  const defaultEnd = dayjs();
  const defaultStart = defaultEnd.subtract(30, "day");
  
  const [dateRange, setDateRange] = useState([defaultStart, defaultEnd]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchReport = async () => {
    if (!dateRange[0] || !dateRange[1]) return;
    
    setLoading(true);
    setFetched(false);
    try {
      const startDate = dateRange[0].format("YYYY-MM-DD");
      const endDate = dateRange[1].format("YYYY-MM-DD");
      
      const res = await axios.get("/api/telecaller/report/list", {
        params: { startDate, endDate },
      });
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setList(res.data.data);
      } else {
        setList([]);
      }
    } catch (e) {
      console.error("Error fetching telecaller report:", e);
      setList([]);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  const handleViewDetail = (telecallerId) => {
    navigate(`/reports/telecaller-report/${telecallerId}`, {
      state: { 
        startDate: dateRange[0].format("YYYY-MM-DD"), 
        endDate: dateRange[1].format("YYYY-MM-DD") 
      },
    });
  };

  // Calculate totals for summary
  const totals = list.reduce(
    (acc, tc) => ({
      totalAssigned: acc.totalAssigned + (tc.totalAssignedInRange || 0),
      contacted: acc.contacted + (tc.contacted || 0),
      forwarded: acc.forwarded + (tc.forwarded || 0),
      appointmentScheduled: acc.appointmentScheduled + (tc.appointmentScheduled || 0),
      callback: acc.callback + (tc.callback || 0),
      notInterested: acc.notInterested + (tc.notInterested || 0),
      wrongNumber: acc.wrongNumber + (tc.wrongNumber || 0),
      notReachable: acc.notReachable + (tc.notReachable || 0),
    }),
    {
      totalAssigned: 0,
      contacted: 0,
      forwarded: 0,
      appointmentScheduled: 0,
      callback: 0,
      notInterested: 0,
      wrongNumber: 0,
      notReachable: 0,
    }
  );

  // Table columns
  const columns = [
    {
      title: "#",
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <Text type="secondary">{index + 1}</Text>
      ),
    },
    {
      title: (
        <Space>
          <UserOutlined />
          Telecaller
        </Space>
      ),
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text || "—"}</Text>
          <Tag color="default" style={{ fontSize: 11 }}>
            {record.employeeCode || "—"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Assigned",
      dataIndex: "totalAssignedInRange",
      key: "totalAssignedInRange",
      align: "center",
      width: 100,
      sorter: (a, b) => (a.totalAssignedInRange || 0) - (b.totalAssignedInRange || 0),
      render: (value) => (
        <Tag color="blue" style={{ minWidth: 50, textAlign: "center" }}>
          {value || 0}
        </Tag>
      ),
    },
    {
      title: "Contacted",
      dataIndex: "contacted",
      key: "contacted",
      align: "center",
      width: 110,
      sorter: (a, b) => (a.contacted || 0) - (b.contacted || 0),
      render: (value) => (
        <Tag color="cyan" style={{ minWidth: 50, textAlign: "center" }}>
          {value || 0}
        </Tag>
      ),
    },
    {
      title: "Forwarded",
      dataIndex: "forwarded",
      key: "forwarded",
      align: "center",
      width: 110,
      sorter: (a, b) => (a.forwarded || 0) - (b.forwarded || 0),
      render: (value) => (
        <Tag color="gold" style={{ minWidth: 50, textAlign: "center" }}>
          {value || 0}
        </Tag>
      ),
    },
    {
      title: (
        <Tooltip title="Appointment Scheduled">
          <Space>
            <CheckCircleOutlined />
            Appt.
          </Space>
        </Tooltip>
      ),
      dataIndex: "appointmentScheduled",
      key: "appointmentScheduled",
      align: "center",
      width: 100,
      sorter: (a, b) => (a.appointmentScheduled || 0) - (b.appointmentScheduled || 0),
      render: (value) => (
        <Tag color="green" style={{ minWidth: 50, textAlign: "center" }}>
          {value || 0}
        </Tag>
      ),
    },
    {
      title: "Callback",
      dataIndex: "callback",
      key: "callback",
      align: "center",
      width: 100,
      sorter: (a, b) => (a.callback || 0) - (b.callback || 0),
      render: (value) => (
        <Tag color="purple" style={{ minWidth: 50, textAlign: "center" }}>
          {value || 0}
        </Tag>
      ),
    },
    {
      title: (
        <Tooltip title="Not Interested">
          <CloseCircleOutlined />
        </Tooltip>
      ),
      dataIndex: "notInterested",
      key: "notInterested",
      align: "center",
      width: 90,
      sorter: (a, b) => (a.notInterested || 0) - (b.notInterested || 0),
      render: (value) => <Text>{value || 0}</Text>,
    },
    {
      title: (
        <Tooltip title="Wrong Number">
          <StopOutlined />
        </Tooltip>
      ),
      dataIndex: "wrongNumber",
      key: "wrongNumber",
      align: "center",
      width: 90,
      sorter: (a, b) => (a.wrongNumber || 0) - (b.wrongNumber || 0),
      render: (value) => <Text>{value || 0}</Text>,
    },
    {
      title: (
        <Tooltip title="Not Reachable">
          <PhoneFilled />
        </Tooltip>
      ),
      dataIndex: "notReachable",
      key: "notReachable",
      align: "center",
      width: 90,
      sorter: (a, b) => (a.notReachable || 0) - (b.notReachable || 0),
      render: (value) => <Text>{value || 0}</Text>,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Tooltip title="View Detailed Report">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record._id)}
          >
            Detail
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card
        bordered={false}
        style={{
          boxShadow: "0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Space align="center" size={12}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: "#e6f7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PhoneOutlined style={{ fontSize: 24, color: "#1890ff" }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                Telecaller Calling Report
              </Title>
              <Text type="secondary">
                Date range pe kitne assign hue, kitne contact, forward, appointment schedule — calling ka poora summary
              </Text>
            </div>
          </Space>
        </div>

        {/* Date Range Filter Card */}
        <Card
          size="small"
          style={{
            marginBottom: 24,
            backgroundColor: "#fafafa",
            border: "1px solid #f0f0f0",
          }}
        >
          <Row gutter={[24, 16]} align="bottom">
            <Col xs={24} md={16} lg={8}>
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  Select Date Range
                </Text>
                <RangePicker
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates)}
                  format="YYYY-MM-DD"
                  style={{ width: "100%" }}
                  size="large"
                  allowClear={false}
                />
              </Space>
            </Col>
            <Col xs={24} md={8} lg={4}>
              <Button
                type="primary"
                size="large"
                icon={loading ? <SyncOutlined spin /> : <BarChartOutlined />}
                onClick={fetchReport}
                loading={loading}
                block
              >
                {loading ? "Loading..." : "Generate Report"}
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Summary Statistics */}
        {fetched && list.length > 0 && (
          <Card
            size="small"
            style={{
              marginBottom: 24,
              backgroundColor: "#fafafa",
              border: "1px solid #f0f0f0",
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6} md={3}>
                <Statistic
                  title="Total Assigned"
                  value={totals.totalAssigned}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col xs={12} sm={6} md={3}>
                <Statistic
                  title="Contacted"
                  value={totals.contacted}
                  prefix={<PhoneOutlined />}
                  valueStyle={{ color: "#00a8ff" }}
                />
              </Col>
              <Col xs={12} sm={6} md={3}>
                <Statistic
                  title="Forwarded"
                  value={totals.forwarded}
                  prefix={<ForwardOutlined />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Col>
              <Col xs={12} sm={6} md={3}>
                <Statistic
                  title="Appointments"
                  value={totals.appointmentScheduled}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col xs={12} sm={6} md={3}>
                <Statistic
                  title="Callback"
                  value={totals.callback}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Col>
              <Col xs={12} sm={6} md={3}>
                <Statistic
                  title="Not Interested"
                  value={totals.notInterested}
                  prefix={<CloseCircleOutlined />}
                />
              </Col>
              <Col xs={12} sm={6} md={3}>
                <Statistic
                  title="Wrong Number"
                  value={totals.wrongNumber}
                  prefix={<StopOutlined />}
                />
              </Col>
              <Col xs={12} sm={6} md={3}>
                <Statistic
                  title="Not Reachable"
                  value={totals.notReachable}
                  prefix={<PhoneFilled />}
                />
              </Col>
            </Row>
          </Card>
        )}

        {/* Contact Rate Summary */}
        {fetched && list.length > 0 && totals.totalAssigned > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Space size={16} wrap>
              <Tag color="blue" style={{ padding: "4px 12px" }}>
                Contact Rate:{" "}
                {((totals.contacted / totals.totalAssigned) * 100).toFixed(1)}%
              </Tag>
              <Tag color="green" style={{ padding: "4px 12px" }}>
                Appointment Rate:{" "}
                {((totals.appointmentScheduled / totals.totalAssigned) * 100).toFixed(1)}%
              </Tag>
              <Tag color="gold" style={{ padding: "4px 12px" }}>
                Forward Rate:{" "}
                {((totals.forwarded / totals.totalAssigned) * 100).toFixed(1)}%
              </Tag>
            </Space>
          </div>
        )}

        {/* Table */}
        {fetched && (
          <Table
            columns={columns}
            dataSource={list}
            rowKey="_id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} telecallers`,
            }}
            scroll={{ x: 1200 }}
            size="middle"
            locale={{
              emptyText: (
                <Empty
                  description="No telecallers found for the selected date range"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
          />
        )}

        {/* Initial State */}
        {!fetched && !loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "#e6f7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <PhoneOutlined style={{ fontSize: 36, color: "#1890ff" }} />
            </div>
            <Title level={5} type="secondary">
              Ready to Generate Report
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 24 }}>
              Select date range and click "Generate Report" to view calling summary.
            </Paragraph>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchReport}
              loading={loading}
            >
              Generate Report
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && !fetched && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spin size="large" />
            <Paragraph type="secondary" style={{ marginTop: 16 }}>
              Loading telecaller report...
            </Paragraph>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TelecallerReport;