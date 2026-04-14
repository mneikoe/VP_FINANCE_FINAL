import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Card,
  Space,
  Typography,
  Tag,
  Tooltip,
  Input,
  Spin,
  Popconfirm,
  message,
  Badge,
  Dropdown,
  Empty,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  ClearOutlined,
  FilterOutlined,
  DownOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  WhatsAppOutlined,
  BankOutlined,
  DollarOutlined,
  TrophyOutlined,
  CalendarOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axiosInstance from "../../config/axios";

const { Title, Text } = Typography;

function ProspectAppointmentList() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "50", "100"],
      showTotal: (total) => `Total ${total} prospects`,
    },
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/prospect/all");

      if (response.data && response.data.success) {
        const prospectsData = response.data.prospects || [];

        const processedProspects = prospectsData.map((prospect, index) => {
          const personalDetails = prospect.personalDetails || {};

          return {
            key: prospect._id,
            id: prospect._id || index,
            sn: index + 1,
            groupCode: personalDetails.groupCode || "-",
            groupName: personalDetails.groupName || "-",
            name: personalDetails.name || "-",
            gender: personalDetails.gender || "-",
            mobile: personalDetails.mobileNo || "-",
            whatsapp: personalDetails.whatsappNo || "-",
            contact: personalDetails.contactNo || "-",
            email: personalDetails.emailId || "-",
            organisation: personalDetails.organisation || "-",
            designation: personalDetails.designation || "-",
            annualIncome: personalDetails.annualIncome || "-",
            grade: personalDetails.grade || "-",
            city: personalDetails.city || "-",
            preferredMeetingArea: personalDetails.preferredMeetingArea || "-",
            resiAddr: personalDetails.resiAddr || "-",
            officeAddr: personalDetails.officeAddr || "-",
            leadSource: personalDetails.leadSource || "-",
            leadName: personalDetails.leadName || "-",
            leadOccupation: personalDetails.leadOccupation || "-",
            leadOccupationType: personalDetails.leadOccupationType || "-",
            callingPurpose: personalDetails.callingPurpose || "-",
            allocatedCRE: personalDetails.allocatedCRE || "-",
            allocatedRM: personalDetails.allocatedRM || "-",
            adharNumber: personalDetails.adharNumber || "-",
            panCardNumber: personalDetails.panCardNumber || "-",
            hobbies: personalDetails.hobbies || "-",
            nativePlace: personalDetails.nativePlace || "-",
            habits: personalDetails.habits || "-",
            socialLink: personalDetails.socialLink || "-",
            bestTime: personalDetails.bestTime || "-",
            time: personalDetails.time || "-",
            remark: personalDetails.remark || "-",
            createdAt: prospect.createdAt
              ? dayjs(prospect.createdAt).format("DD/MM/YYYY")
              : "-",
            rawCreatedAt: prospect.createdAt,
            rawData: prospect,
          };
        });

        setProspects(processedProspects);
        setFilteredData(processedProspects);
      } else {
        message.error(response.data?.message || "Failed to fetch prospects");
        setProspects([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error("Error fetching prospects:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Error loading prospects."
      );
      setProspects([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchText) {
      setFilteredData(prospects);
      return;
    }

    const lowerCaseSearch = searchText.toLowerCase();
    const filtered = prospects.filter((item) => {
      const searchableFields = [
        item.groupCode,
        item.groupName,
        item.name,
        item.mobile,
        item.whatsapp,
        item.contact,
        item.email,
        item.organisation,
        item.designation,
        item.city,
        item.leadSource,
        item.leadName,
        item.callingPurpose,
        item.allocatedCRE,
      ]
        .filter(Boolean)
        .map((field) => field.toString().toLowerCase());

      return searchableFields.some((field) => field.includes(lowerCaseSearch));
    });
    setFilteredData(filtered);
  }, [searchText, prospects]);

  const handleDelete = async (id, name) => {
    try {
      await axiosInstance.delete(`/api/prospect/delete/${id}`);
      message.success(`${name} deleted successfully`);
      fetchProspects();
    } catch (error) {
      message.error("Failed to delete prospect");
    }
  };

  const handleEdit = (prospect) => {
    navigate(`/prospect/edit/${prospect.id}`);
  };

  const handleView = (id) => {
    navigate(`/prospect/detail/${id}`);
  };

  const handleConvertToClient = async (prospect) => {
    try {
      await axiosInstance.put(`/api/prospect/convert/${prospect.id}`, {
        status: "client",
      });
      message.success(`${prospect.name} converted to Client successfully`);
      fetchProspects();
    } catch (error) {
      message.error("Failed to convert prospect");
    }
  };

  const handleRefresh = () => {
    fetchProspects();
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });
  };

  const getGenderColor = (gender) => {
    switch (gender?.toLowerCase()) {
      case "male":
        return "blue";
      case "female":
        return "pink";
      default:
        return "default";
    }
  };

  const getGradeColor = (grade) => {
    switch (grade?.toUpperCase()) {
      case "A":
        return "green";
      case "B":
        return "orange";
      case "C":
        return "red";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "#",
      width: 60,
      align: "center",
      fixed: "left",
      render: (_, __, index) => (
        <Text type="secondary">
          {(tableParams.pagination.current - 1) * tableParams.pagination.pageSize + index + 1}
        </Text>
      ),
    },
    {
      title: "Group Code",
      dataIndex: "groupCode",
      key: "groupCode",
      width: 50,
      fixed: "left",
      
      render: (text) => (
        <Tag color="cyan" style={{ fontWeight: 500 }}>
          {text}
        </Tag>
      ),
    },
    {
      title: "Group Head",
      dataIndex: "groupName",
      key: "groupName",
      width: 150,
      className:"whitespace-nowrap",
      
      render: (text) => (
        <Space>
          
          {text}
        </Space>
      ),
    },
    {
      title: "Prospect Info",
      key: "prospectInfo",
      width: 180,
    
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text strong>{record.name}</Text>
          
        </Space>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      width: 160,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Space size={4}>
            <PhoneOutlined />
            <Text>{record.mobile}</Text>
          </Space>
        
          {record.contact !== "-" && record.contact !== record.mobile && (
            <Space size={4}>
              <PhoneOutlined />
              <Text type="secondary">{record.contact}</Text>
            </Space>
          )}
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      ellipsis: true,
      
      render: (text) => (
        <Tooltip title={text}>
          <Space>
            
            <Text>{text}</Text>
          </Space>
        </Tooltip>
      ),
    },
   
   
    {
      title: "Location",
      key: "location",
      width: 220,
      
      render: (_, record) => (
        <Space direction="horizontal" size={2}>
          <Space>
            <Text>{record.city}</Text>
          </Space>
          {record.preferredMeetingArea !== "-" && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Area: {record.preferredMeetingArea}
            </Text>
          )}
        </Space>
      ),
    },
   
   
   
    {
      title: "Actions",
      key: "actions",
      width: 140,
      fixed: "right",
      render: (_, record) => (
        <Space wrap>
          <Tooltip title="View Details">
            <Button
              type="primary"
              ghost
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record.id)}
            >
              V
            </Button>
          </Tooltip>
          <Tooltip title="Edit Prospect">
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ borderColor: "#faad14", color: "#faad14" }}
            >
              Edit
            </Button>
          </Tooltip>
          <Popconfirm
            title="Delete Prospect"
            description={`Are you sure you want to delete ${record.name}?`}
            onConfirm={() => handleDelete(record.id, record.name)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Del
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
    {
      title: "Convert",
      key: "convert",
      width: 90,
      fixed: "right",
      render: (_, record) => (
        <Popconfirm
          title="Convert to Client"
          description={`Convert ${record.name} to Client?`}
          onConfirm={() => handleConvertToClient(record)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="primary"
            size="small"
            icon={<SwapOutlined />}
            style={{
              backgroundColor: "#52c41a",
              borderColor: "#52c41a",
            }}
          >
            Client
          </Button>
        </Popconfirm>
      ),
    },
  ];

  if (loading && prospects.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <Spin size="large" />
        <Text type="secondary">Loading prospects...</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Card
        bordered={false}
        style={{
          boxShadow: "0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)",
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <Space direction="vertical" size={4}>
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
                  <UserOutlined style={{ fontSize: 24, color: "#1890ff" }} />
                </div>
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    Prospects List
                  </Title>
                  <Badge
                    
                    style={{ backgroundColor: "#52c41a" }}
                    showZero
                  >
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      Total Prospects
                    </Text>
                  </Badge>
                </div>
              </Space>
            </Space>

            <Space>
              <Input
                placeholder="Search by name, mobile, email, organisation..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 350 }}
                allowClear
                size="large"
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                size="large"
              >
                Refresh
              </Button>
            </Space>
          </div>

          {/* Quick Stats */}
          {filteredData.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                padding: "12px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <Tag color="blue" style={{ padding: "4px 12px", fontSize: 14 }}>
                <UserOutlined /> Total: {filteredData.length}
              </Tag>
             
            </div>
          )}

          {/* Table */}
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={tableParams.pagination}
            onChange={handleTableChange}
            loading={loading}
            scroll={{ x: 2000, y: "calc(100vh - 350px)" }}
            size="middle"
            bordered
            sticky
            rowKey="id"
            showSorterTooltip
            tableLayout="auto"
            locale={{
              emptyText: (
                <Empty
                  description={
                    searchText
                      ? "No prospects match your search criteria"
                      : "No prospects found"
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
          />
        </Space>
      </Card>
    </div>
  );
}

export default ProspectAppointmentList;