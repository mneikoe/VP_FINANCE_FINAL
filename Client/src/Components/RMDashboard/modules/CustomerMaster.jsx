import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  EyeOutlined,
  PhoneOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const CustomerMaster = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [areas, setAreas] = useState([]);
  const [lastRefreshedAt, setLastRefreshedAt] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    clients: 0,
    prospects: 0,
  });

  const [currentUser] = useState(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  });

  const calculateStats = (clientsData) => {
    const total = clientsData.length;
    const clientsCount = clientsData.filter((c) => c.status === "client").length;
    const prospectsCount = clientsData.filter((c) => c.status === "prospect").length;
    setStats({ total, clients: clientsCount, prospects: prospectsCount });
  };

  const fetchMyCustomers = async () => {
    setLoading(true);
    try {
      const currentRMId = currentUser?._id || currentUser?.id;
      if (!currentRMId) {
        setClients([]);
        return;
      }

      const response = await axios.get("/api/employee/getClientsByAllocatedRM", {
        params: { allocatedRM: currentRMId },
      });

      if (response.data.success) {
        const allClients = response.data?.data?.clients || [];
        const numberedClients = allClients.map((client, index) => ({
          ...client,
          serialNo: index + 1,
        }));

        setClients(numberedClients);
        calculateStats(numberedClients);
        setLastRefreshedAt(new Date().toLocaleTimeString());

        const uniqueAreas = [
          ...new Set(
            allClients.map((c) => c.area).filter((area) => area && area !== "N/A")
          ),
        ];
        setAreas(uniqueAreas);
      } else {
        setClients([]);
      }
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === "RM") {
      fetchMyCustomers();
    }
  }, []);

  const filteredClients = useMemo(() => {
    let filtered = [...clients];

    if (selectedArea !== "all") {
      filtered = filtered.filter((client) => client.area === selectedArea);
    }
    if (selectedStatus !== "all") {
      filtered = filtered.filter((client) => client.status === selectedStatus);
    }
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          (client.name || "").toLowerCase().includes(searchLower) ||
          (client.mobileNo || "").toLowerCase().includes(searchLower) ||
          (client.emailId || "").toLowerCase().includes(searchLower) ||
          (client.groupCode || "").toLowerCase().includes(searchLower)
      );
    }

    calculateStats(filtered);
    return filtered;
  }, [clients, search, selectedArea, selectedStatus]);

  if (currentUser && currentUser.role !== "RM") {
    return (
      <Alert
        type="warning"
        showIcon
        style={{ margin: 24 }}
        message="Access Restricted"
        description={`This page is only accessible to Relationship Managers (RMs). Your role: ${currentUser.role}`}
      />
    );
  }

  const columns = [
    {
      title: "#",
      dataIndex: "serialNo",
      width: 70,
      sorter: (a, b) => (a.serialNo || 0) - (b.serialNo || 0),
      render: (v) => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Customer",
      dataIndex: "name",
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.name || "Unnamed Customer"}</Text>
          <Text type="secondary">{record.emailId || "N/A"}</Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "client" ? "success" : status === "prospect" ? "gold" : "default"}>
          {(status || "unknown").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Contact",
      dataIndex: "mobileNo",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.mobileNo || "N/A"}</Text>
          <Text type="secondary">{record.contactNo || "-"}</Text>
        </Space>
      ),
    },
    {
      title: "Location",
      dataIndex: "area",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.area || "N/A"}</Text>
          <Text type="secondary">{record.city || "N/A"}</Text>
        </Space>
      ),
    },
    {
      title: "Group Code",
      dataIndex: "groupCode",
      render: (code) => <Tag>{code || "N/A"}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 170,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`/rm/suspect/details/${record._id}`)}
            type="primary"
            size="small"
          >
            View
          </Button>
          {record.mobileNo && record.mobileNo !== "N/A" && (
            <Button
              icon={<PhoneOutlined />}
              onClick={() => (window.location.href = `tel:${record.mobileNo}`)}
              size="small"
            >
              Call
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20, background: "#f5f7fb", minHeight: "100vh" }}>
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col>
            <Space direction="vertical" size={2}>
              <Title level={3} style={{ margin: 0 }}>
                <UserSwitchOutlined /> Customer Master
              </Title>
              <Text type="secondary">
                RM: {currentUser?.name || "N/A"} ({currentUser?.employeeCode || "N/A"})
              </Text>
            </Space>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchMyCustomers} loading={loading}>
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Allocated" value={stats.total} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Clients" value={stats.clients} valueStyle={{ color: "#3f8600" }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Prospects" value={stats.prospects} valueStyle={{ color: "#faad14" }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Showing" value={filteredClients.length} />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={10}>
            <Input
              prefix={<SearchOutlined />}
              value={search}
              placeholder="Search by name, mobile, email, group code"
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              value={selectedArea}
              onChange={setSelectedArea}
              style={{ width: "100%" }}
              options={[
                { label: "All Areas", value: "all" },
                ...areas.map((a) => ({ label: a, value: a })),
              ]}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: "100%" }}
              options={[
                { label: "All Status", value: "all" },
                { label: "Clients", value: "client" },
                { label: "Prospects", value: "prospect" },
              ]}
            />
          </Col>
          <Col xs={24} md={2}>
            <Button
              block
              onClick={() => {
                setSearch("");
                setSelectedArea("all");
                setSelectedStatus("all");
              }}
            >
              Clear
            </Button>
          </Col>
        </Row>
      </Card>

      <Card
        title={`My Customers (${filteredClients.length})`}
        extra={<Text type="secondary">Last refreshed: {lastRefreshedAt || "-"}</Text>}
      >
        <Table
          columns={columns}
          dataSource={filteredClients}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          locale={{
            emptyText: (
              <Empty
                description={
                  clients.length === 0
                    ? "You do not have any customers allocated yet."
                    : "No customers match current filters."
                }
              />
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default CustomerMaster;
