import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Table,
  Button,
  Card,
  Space,
  Typography,
  Tag,
  Tooltip,
  Spin,
  Empty,
  Popconfirm,
  message,
  Input,
  Row,
  Col,
  Badge,
  Avatar,
  Statistic,
  Tabs,
  Select,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  PlusOutlined,
  TeamOutlined,
  IdcardOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserAddOutlined,
  UserSwitchOutlined,
  CrownOutlined,
  CustomerServiceOutlined,
  SolutionOutlined,
  ToolOutlined,
  SafetyOutlined,
  HomeOutlined,
  PhoneFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axiosInstance from "../../../config/axios";

const { Title, Text } = Typography;

const getRoleTabFromInitialRole = (initialRole) => {
  const normalized = String(initialRole || "").toLowerCase().trim();
  const roleMap = {
    oa: "oa",
    "office admin": "oa",
    telecaller: "telecaller",
    hr: "hr",
    rm: "rm",
    cre: "rm",
    "relationship manager": "rm",
    telemarketer: "telemarketer",
    oe: "oe",
    "office executive": "oe",
    accountant: "accountant",
  };

  return roleMap[normalized] || "telecaller";
};

const EmployeeList = ({ initialRole = "telecaller", lockRole = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = getRoleTabFromInitialRole(initialRole);
  const jobProfileRouteByRole = {
    oa: "/job-profile-target-admin",
    telecaller: "/job-profile-target-telecaller",
    rm: "/job-profile-target-cre",
    telemarketer: "/job-profile-target-telemarketer",
    oe: "/job-profile-target-office-executive",
    hr: "/all-employee",
    accountant: "/all-employee",
  };

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState(initialTab);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Role configuration with Ant Design icons
  const roleConfig = {
    telecaller: {
      name: "Telecaller",
      icon: <CustomerServiceOutlined />,
      color: "#00a8ff",
      bgColor: "#e6f7ff",
      borderColor: "#00a8ff",
      description: "Customer calling and support team",
      avatarBg: "#e6f7ff",
      avatarColor: "#00a8ff",
    },
    hr: {
      name: "HR",
      icon: <SolutionOutlined />,
      color: "#faad14",
      bgColor: "#fffbe6",
      borderColor: "#faad14",
      description: "Human Resource management",
      avatarBg: "#fffbe6",
      avatarColor: "#faad14",
    },
    rm: {
      name: "Relationship Manager",
      icon: <CrownOutlined />,
      color: "#1677ff",
      bgColor: "#e6f4ff",
      borderColor: "#1677ff",
      description: "Client relationship and business development",
      avatarBg: "#e6f4ff",
      avatarColor: "#1677ff",
    },
    telemarketer: {
      name: "Telemarketer",
      icon: <UserSwitchOutlined />,
      color: "#52c41a",
      bgColor: "#f6ffed",
      borderColor: "#52c41a",
      description: "Marketing and sales professionals",
      avatarBg: "#f6ffed",
      avatarColor: "#52c41a",
    },
    oe: {
      name: "Operations Executive",
      icon: <ToolOutlined />,
      color: "#8c8c8c",
      bgColor: "#f5f5f5",
      borderColor: "#8c8c8c",
      description: "Operations and process management",
      avatarBg: "#f5f5f5",
      avatarColor: "#8c8c8c",
    },
    oa: {
      name: "Office Admin",
      icon: <SafetyOutlined />,
      color: "#595959",
      bgColor: "#fafafa",
      borderColor: "#595959",
      description: "Administrative and office management",
      avatarBg: "#fafafa",
      avatarColor: "#595959",
    },
    accountant: {
      name: "Accountant",
      icon: <DollarOutlined />,
      color: "#eb2f96",
      bgColor: "#fff0f6",
      borderColor: "#eb2f96",
      description: "Accounts and finance management",
      avatarBg: "#fff0f6",
      avatarColor: "#eb2f96",
    },
  };

  const fetchEmployeesByRole = async (role) => {
    setLoading(true);
    try {
      let responseData = [];

      switch (role) {
        case "telecaller":
          try {
            const telecallerResponse = await axiosInstance.get("/api/telecaller");
            if (telecallerResponse.data?.telecallers) {
              responseData = telecallerResponse.data.telecallers
                .filter(tc => tc && typeof tc === 'object')
                .map((tc) => ({
                  _id: tc._id,
                  name: tc.username || "Unnamed",
                  employeeCode: tc.employeeCode || `TC-${tc._id?.slice(-4) || "0000"}`,
                  emailId: tc.email || "-",
                  mobileNo: tc.mobileno || "-",
                  role: "Telecaller",
                  designation: tc.designation || "Telecaller",
                  dateOfJoining: tc.dateOfJoining || tc.createdAt,
                  source: "telecaller",
                  status: tc.dateOfTermination ? "inactive" : "active",
                  department: "Customer Support",
                }));
            }
          } catch (err) {
            console.error("Telecaller fetch error:", err);
          }
          break;

        case "hr":
          try {
            const hrResponse = await axiosInstance.get("/api/hr");
            if (hrResponse.data?.HRs) {
              responseData = hrResponse.data.HRs
                .filter(hr => hr && typeof hr === 'object')
                .map((hr) => ({
                  _id: hr._id,
                  name: hr.username || "Unnamed",
                  employeeCode: hr.employeeCode || `HR-${hr._id?.slice(-4) || "0000"}`,
                  emailId: hr.email || "-",
                  mobileNo: hr.mobileno || "-",
                  role: "HR",
                  designation: hr.designation || "HR Manager",
                  dateOfJoining: hr.dateOfJoining || hr.createdAt,
                  source: "hr",
                  status: hr.dateOfTermination ? "inactive" : "active",
                  department: "Human Resources",
                }));
            }
          } catch (err) {
            console.error("HR fetch error:", err);
          }
          break;

        case "oa":
          try {
            const oaResponse = await axiosInstance.get("/api/OA");
            if (oaResponse.data?.OAs) {
              responseData = oaResponse.data.OAs
                .filter(oa => oa && typeof oa === 'object')
                .map((oa) => ({
                  _id: oa._id,
                  name: oa.username || "Unnamed",
                  employeeCode: oa.employeeCode || `OA-${oa._id?.slice(-4) || "0000"}`,
                  emailId: oa.email || "-",
                  mobileNo: oa.mobileno || "-",
                  role: "OA",
                  designation: oa.designation || "Office Admin",
                  dateOfJoining: oa.dateOfJoining || oa.createdAt,
                  source: "oa",
                  status: oa.dateOfTermination ? "inactive" : "active",
                  department: "Office Admin",
                }));
            }
          } catch (err) {
            console.error("OA fetch error:", err);
          }
          break;

        default:
          try {
            const employeeResponse = await axiosInstance.get(
              "/api/employee/getAllEmployees"
            );
            if (employeeResponse.data?.success && Array.isArray(employeeResponse.data.data)) {
              const filteredEmployees = employeeResponse.data.data.filter((emp) => {
                if (!emp || !emp.role) return false;
                const empRole = String(emp.role).toLowerCase();
                const targetRole = String(role).toLowerCase();
                return empRole === targetRole;
              });

              responseData = filteredEmployees.map((emp) => ({
                _id: emp._id,
                name: emp.name || "Unnamed",
                employeeCode: emp.employeeCode || `${role.toUpperCase()}-${emp._id?.slice(-4) || "0000"}`,
                emailId: emp.emailId || "-",
                mobileNo: emp.mobileNo || "-",
                role: emp.role || roleConfig[role]?.name || role,
                designation: emp.designation || roleConfig[role]?.name || role,
                dateOfJoining: emp.dateOfJoining || emp.createdAt,
                source: "employee",
                status: emp.dateOfTermination ? "inactive" : "active",
                department: roleConfig[role]?.name || "General",
                presentAddress: emp.presentAddress || "-",
                emergencyContact: emp.emergencyContactMobile || "-",
                salary: emp.salaryOnJoining || "-",
              }));
            }

          } catch (err) {
            console.error("Employee fetch error:", err);
          }
      }

      setEmployees(responseData);
      setCurrentPage(1);
      setExpandedRowKeys([]);
    } catch (err) {
      console.error(`Error fetching ${role} employees:`, err);
      message.error(err.response?.data?.message || `Error fetching ${role} employees`);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesByRole(activeTab);
  }, [activeTab]);

  useEffect(() => {
    setActiveTab(getRoleTabFromInitialRole(initialRole));
  }, [initialRole]);

  const filteredEmployees = useMemo(() => {
    if (!searchText) return employees;
    
    const lowerSearch = searchText.toLowerCase();
    return employees.filter(
      (employee) =>
        (employee.name && String(employee.name).toLowerCase().includes(lowerSearch)) ||
        (employee.employeeCode && String(employee.employeeCode).toLowerCase().includes(lowerSearch)) ||
        (employee.emailId && String(employee.emailId).toLowerCase().includes(lowerSearch)) ||
        (employee.designation && String(employee.designation).toLowerCase().includes(lowerSearch)) ||
        (employee.mobileNo && String(employee.mobileNo).toLowerCase().includes(lowerSearch))
    );
  }, [employees, searchText]);

  const handleViewDetails = (employee) => {
    const isDashboard = location.pathname.startsWith("/dashboard");
    const targetPath = isDashboard 
      ? `/dashboard/employee/${employee._id}` 
      : `/employee/${employee._id}`;
      
    navigate(targetPath, {
      state: {
        employeeData: employee,
        source: employee.source,
      },
    });
  };

  const handleEdit = (employee) => {
    navigate(`/edit-employee/${employee._id}`, {
      state: { employeeData: employee },
    });
  };

  const handleDelete = async (employeeId, employeeName) => {
    setDeleteLoading(employeeId);
    try {
      const employee = employees.find((emp) => emp._id === employeeId);
      if (!employee) {
        message.error("Employee not found");
        return;
      }
      
      if (employee.source === "hr") {
        await axiosInstance.delete(`/api/hr/${employeeId}`);
      } else if (employee.source === "telecaller") {
        await axiosInstance.delete(`/api/telecaller/${employeeId}`);
      } else {
        await axiosInstance.delete(`/api/employee/deleteEmployee?employeeId=${employeeId}`);
      }
      message.success(`${employeeName} deleted successfully!`);
      fetchEmployeesByRole(activeTab);
    } catch (err) {
      message.error(`Error deleting employee: ${err.response?.data?.message || err.message}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return dayjs(dateString).format("DD/MM/YYYY");
    } catch {
      return "-";
    }
  };

  const getExperience = (dateOfJoining) => {
    if (!dateOfJoining) return "-";
    try {
      const joinDate = dayjs(dateOfJoining);
      const today = dayjs();
      const diffDays = today.diff(joinDate, "day");

      if (diffDays < 30) return "< 1 month";
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
      return `${Math.floor(diffDays / 365)} years`;
    } catch {
      return "-";
    }
  };

  const getStatusConfig = (employee) => {
    if (employee.status === "inactive") {
      return {
        text: "Inactive",
        color: "error",
        icon: <ClockCircleOutlined />,
      };
    }

    if (!employee.dateOfJoining) {
      return {
        text: "Not Joined",
        color: "default",
        icon: <UserOutlined />,
      };
    }

    try {
      const joinDate = dayjs(employee.dateOfJoining);
      const today = dayjs();
      const diffDays = today.diff(joinDate, "day");

      if (diffDays < 30) {
        return {
          text: "New",
          color: "success",
          icon: <CheckCircleOutlined />,
        };
      }
      if (diffDays < 180) {
        return {
          text: "Active",
          color: "processing",
          icon: <CheckCircleOutlined />,
        };
      }
      return {
        text: "Experienced",
        color: "cyan",
        icon: <CrownOutlined />,
      };
    } catch {
      return {
        text: "Active",
        color: "processing",
        icon: <CheckCircleOutlined />,
      };
    }
  };

  // Tab items configuration
  const allowedRoleKeys = lockRole ? Object.keys(roleConfig) : Object.keys(roleConfig);
  const tabItems = allowedRoleKeys.map((key) => ({
    key,
    ...{ role: roleConfig[key] },
  })).map(({ key, role }) => ({
    key,
    label: (
      <Space size={6}>
        {role.icon}
        <span>{role.name}</span>
        {key === activeTab && (
          <Badge 
            count={filteredEmployees.length} 
            style={{ backgroundColor: role.color, marginLeft: 4 }}
            size="small"
          />
        )}
      </Space>
    ),
  }));

  const roleSelectOptions = allowedRoleKeys.map((key) => ({
    value: key,
    label: roleConfig[key]?.name || key,
  }));

  const columns = [
    {
      title: "Employee",
      key: "details",
      width: 280,
      render: (_, record) => {
        const role = roleConfig[record.source] || roleConfig.telecaller;
        const status = getStatusConfig(record);
        
        return (
          <Space align="start" size={12}>
            <Avatar
              size={48}
              style={{
                backgroundColor: role.avatarBg,
                color: role.avatarColor,
                border: `2px solid ${role.borderColor}40`,
                fontWeight: 600,
              }}
            >
              {record.name?.charAt(0).toUpperCase() || "E"}
            </Avatar>
            <Space direction="vertical" size={2}>
              <Text strong style={{ fontSize: 15 }}>
                {record.name || "Unnamed Employee"}
              </Text>
              <Space size={4} wrap>
                <Tag color="default" style={{ fontSize: 11 }}>
                  <IdcardOutlined /> {record.employeeCode || "No Code"}
                </Tag>
                <Tag color={status.color} style={{ fontSize: 11 }}>
                  {status.icon} {status.text}
                </Tag>
              </Space>
            </Space>
          </Space>
        );
      },
    },
    {
      title: "Contact",
      key: "contact",
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Space size={8}>
            <PhoneOutlined style={{ color: "#1677ff" }} />
            <Text>{record.mobileNo || "-"}</Text>
          </Space>
          <Space size={8}>
            <MailOutlined style={{ color: "#52c41a" }} />
            <Text ellipsis style={{ maxWidth: 160 }}>
              {record.emailId || "-"}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Role",
      key: "role",
      width: 160,
      render: (_, record) => {
        const roleKey = record.role?.toLowerCase();
        const config = roleConfig[roleKey] || roleConfig.telecaller;
        return (
          <Space direction="vertical" size={4}>
            <Tag
              color={config.color}
              icon={config.icon}
              style={{ fontSize: 12, padding: "4px 8px" }}
            >
              {record.role || "Employee"}
            </Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.designation || "-"}
            </Text>
          </Space>
        );
      },
    },
    {
      title: "Joining",
      key: "joining",
      width: 130,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Space size={4}>
            <CalendarOutlined style={{ fontSize: 12 }} />
            <Text>{formatDate(record.dateOfJoining)}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {getExperience(record.dateOfJoining)}
          </Text>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 130,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              style={{ color: "#1677ff" }}
            />
          </Tooltip>
        
          
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record) => (
    <Row gutter={[16, 16]} style={{ padding: "16px 24px", background: "#fafafa" }}>
      <Col xs={24} sm={12} lg={6}>
        <Space direction="vertical" size={4}>
          <Space size={6}>
            <EnvironmentOutlined style={{ color: "#ff4d4f" }} />
            <Text strong>Address</Text>
          </Space>
          <Text type="secondary" style={{ marginLeft: 22, fontSize: 13 }}>
            {record.presentAddress || "Not specified"}
          </Text>
        </Space>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Space direction="vertical" size={4}>
          <Space size={6}>
            <PhoneFilled style={{ color: "#1677ff" }} />
            <Text strong>Emergency Contact</Text>
          </Space>
          <Text type="secondary" style={{ marginLeft: 22, fontSize: 13 }}>
            {record.emergencyContact || "Not specified"}
          </Text>
        </Space>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Space direction="vertical" size={4}>
          <Space size={6}>
            <DollarOutlined style={{ color: "#52c41a" }} />
            <Text strong>Salary</Text>
          </Space>
          <Text type="secondary" style={{ marginLeft: 22, fontSize: 13 }}>
            {record.salary || "Not specified"}
          </Text>
        </Space>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Space direction="vertical" size={4}>
          <Space size={6}>
            <HomeOutlined style={{ color: "#722ed1" }} />
            <Text strong>Department</Text>
          </Space>
          <Text type="secondary" style={{ marginLeft: 22, fontSize: 13 }}>
            {record.department || "Not specified"}
          </Text>
        </Space>
      </Col>
    </Row>
  );

  const currentRole = roleConfig[activeTab] || roleConfig.telecaller;

  const activeCount = filteredEmployees.filter(e => e.status === "active").length;
  const newCount = filteredEmployees.filter(e => {
    if (!e.dateOfJoining || e.status === "inactive") return false;
    try {
      return dayjs().diff(dayjs(e.dateOfJoining), "day") < 30;
    } catch {
      return false;
    }
  }).length;

  return (
    <div style={{ padding: "20px 24px", background: "#f5f7fa", minHeight: "100vh" }}>
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <Space align="center" size={14}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${currentRole.color}15, ${currentRole.color}30)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1.5px solid ${currentRole.borderColor}40`,
              }}
            >
              <span style={{ fontSize: 24, color: currentRole.color }}>
                {currentRole.icon}
              </span>
            </div>
            <div>
              <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
                {currentRole.name} Directory
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {currentRole.description}
              </Text>
            </div>
          </Space>

          <Space size={12} wrap>
            <Select
              value={activeTab}
              onChange={(value) => {
                if (lockRole) {
                  const targetRoute = jobProfileRouteByRole[value];
                  if (targetRoute) {
                    navigate(targetRoute);
                    return;
                  }
                }
                setActiveTab(value);
              }}
              options={roleSelectOptions}
              style={{ width: 220 }}
              size="large"
              placeholder="Select role"
            />
            <Input
              placeholder={`Search ${currentRole.name.toLowerCase()}s...`}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 260 }}
              allowClear
              size="large"
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchEmployeesByRole(activeTab)}
              loading={loading}
              size="large"
            >
              Refresh
            </Button>
            
          </Space>
        </div>

        {!lockRole && (
          <div style={{ padding: "16px 24px 0 24px", borderBottom: "1px solid #f0f0f0" }}>
            <Tabs
              activeKey={activeTab}
              onChange={(key) => {
                console.log("Tab changed to:", key);
                setActiveTab(key);
              }}
              items={tabItems}
              size="large"
              type="card"
              style={{ marginBottom: 0 }}
            />
          </div>
        )}

        {/* Stats Summary */}
        {!loading && filteredEmployees.length > 0 && (
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f0f0" }}>
            <Row gutter={[24, 16]}>
              <Col>
                <Statistic
                  title="Total Employees"
                  value={filteredEmployees.length}
                  prefix={<TeamOutlined />}
                  valueStyle={{ fontSize: 22, fontWeight: 600 }}
                />
              </Col>
              <Col>
                <Statistic
                  title="Active"
                  value={activeCount}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ fontSize: 22, fontWeight: 600, color: "#52c41a" }}
                />
              </Col>
              <Col>
                <Statistic
                  title="New (30 days)"
                  value={newCount}
                  prefix={<UserAddOutlined />}
                  valueStyle={{ fontSize: 22, fontWeight: 600, color: "#1677ff" }}
                />
              </Col>
            </Row>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <Spin size="large" />
            <p style={{ marginTop: 20, color: "#8c8c8c" }}>
              Loading {currentRole.name} employees...
            </p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div style={{ padding: "80px 24px" }}>
            <Empty
              description={
                <span>
                  {searchText
                    ? "No employees match your search criteria"
                    : `No ${currentRole.name.toLowerCase()} employees found`}
                </span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Space>
                {searchText && (
                  <Button onClick={() => setSearchText("")}>
                    Clear Search
                  </Button>
                )}
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => navigate("/add-employee")}
                >
                  Add Employee
                </Button>
              </Space>
            </Empty>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredEmployees}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredEmployees.length,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} employees`,
              position: ["bottomRight"],
            }}
            expandable={{
              expandedRowRender,
              expandedRowKeys,
              onExpandedRowsChange: (keys) => setExpandedRowKeys(keys),
            }}
            scroll={{ x: 900 }}
            size="middle"
            style={{ padding: "0 24px 24px" }}
          />
        )}
      </Card>
    </div>
  );
};

export default EmployeeList;