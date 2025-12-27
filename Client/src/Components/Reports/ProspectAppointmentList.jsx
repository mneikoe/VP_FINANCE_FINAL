import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Card,
  Input,
  message,
  Modal,
  Row,
  Col,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../config/axios";
import dayjs from "dayjs";

const ProspectAppointmentList = () => {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchProspects = useCallback(async () => {
    setLoading(true);
    try {
      console.log("📡 Fetching Prospects...");

      const response = await axiosInstance.get("/api/prospect/all");

      console.log("📦 API Response:", response.data);

      if (response.data && response.data.success) {
        const prospectsData = response.data.prospects || [];

        const processedProspects = prospectsData.map((prospect, index) => {
          const personalDetails = prospect.personalDetails || {};

          return {
            key: prospect._id || index,
            id: prospect._id,
            sn: index + 1,

            // Basic Details
            groupCode: personalDetails.groupCode || "-",
            groupName: personalDetails.groupName || "-",
            name: personalDetails.name || "-",
            gender: personalDetails.gender || "-",

            // Contact Details
            mobile: personalDetails.mobileNo || "-",
            whatsapp: personalDetails.whatsappNo || "-",
            contact: personalDetails.contactNo || "-",
            email: personalDetails.emailId || "-",

            // Professional Details
            organisation: personalDetails.organisation || "-",
            designation: personalDetails.designation || "-",
            annualIncome: personalDetails.annualIncome || "-",
            grade: personalDetails.grade || "-",

            // Location Details
            city: personalDetails.city || "-",
            preferredMeetingArea: personalDetails.preferredMeetingArea || "-",
            resiAddr: personalDetails.resiAddr || "-",
            officeAddr: personalDetails.officeAddr || "-",

            // Lead Details
            leadSource: personalDetails.leadSource || "-",
            leadName: personalDetails.leadName || "-",
            leadOccupation: personalDetails.leadOccupation || "-",
            leadOccupationType: personalDetails.leadOccupationType || "-",
            callingPurpose: personalDetails.callingPurpose || "-",

            // Other Details
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

            // Timestamps
            createdAt: prospect.createdAt
              ? dayjs(prospect.createdAt).format("DD/MM/YYYY")
              : "-",

            rawData: prospect,
          };
        });

        console.log(`✅ Processed ${processedProspects.length} prospects`);
        setProspects(processedProspects);
      } else {
        message.error(response.data?.message || "Failed to fetch prospects");
        setProspects([]);
      }
    } catch (error) {
      console.error("❌ Error fetching prospects:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Error loading prospects."
      );
      setProspects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredProspects = useMemo(() => {
    if (!searchText) return prospects;

    const searchTerm = searchText.toLowerCase();
    return prospects.filter((prospect) => {
      const searchableFields = [
        prospect.groupCode,
        prospect.groupName,
        prospect.name,
        prospect.mobile,
        prospect.whatsapp,
        prospect.contact,
        prospect.email,
        prospect.organisation,
        prospect.designation,
        prospect.city,
        prospect.leadSource,
        prospect.leadName,
        prospect.callingPurpose,
        prospect.allocatedCRE,
      ]
        .filter(Boolean)
        .map((field) => field.toString().toLowerCase());

      return searchableFields.some((field) => field.includes(searchTerm));
    });
  }, [prospects, searchText]);

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchText("");
  };

  const viewProspectDetails = (record) => {
    setSelectedProspect(record);
    setModalVisible(true);
  };

  const handleEdit = (prospect) => {
    // Implement edit functionality
    message.info(`Edit prospect: ${prospect.name}`);
    // navigate(`/prospect/edit/${prospect.id}`);
  };

  const handleDelete = (prospect) => {
    Modal.confirm({
      title: "Delete Prospect",
      content: `Are you sure you want to delete ${prospect.name}?`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await axiosInstance.delete(`/api/prospect/delete/${prospect.id}`);
          message.success("Prospect deleted successfully");
          fetchProspects();
        } catch (error) {
          message.error("Failed to delete prospect");
        }
      },
    });
  };

  const handleConvertToClient = (prospect) => {
    Modal.confirm({
      title: "Convert to Client",
      content: `Convert ${prospect.name} to Client?`,
      okText: "Convert",
      onOk: async () => {
        try {
          await axiosInstance.put(`/api/prospect/convert/${prospect.id}`, {
            status: "client",
          });
          message.success("Converted to Client successfully");
          fetchProspects();
        } catch (error) {
          message.error("Failed to convert");
        }
      },
    });
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
      title: "Group Code",
      dataIndex: "groupCode",
      key: "groupCode",
      width: 100,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Group Head",
      dataIndex: "groupName",
      key: "groupName",
      width: 150,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 150,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: "11px", color: "#666" }}>{record.gender}</div>
        </div>
      ),
    },
    {
      title: "Contact",
      dataIndex: "mobile",
      key: "mobile",
      width: 120,
      render: (text, record) => (
        <div>
          <div>
            <PhoneOutlined style={{ marginRight: 5 }} />
            {text}
          </div>
          {record.whatsapp !== "-" && (
            <div style={{ fontSize: "11px", color: "#666" }}>
              WA: {record.whatsapp}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 180,
      render: (text) => (
        <div>
          <MailOutlined style={{ marginRight: 5 }} />
          {text}
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
      title: "Designation",
      dataIndex: "designation",
      key: "designation",
      width: 120,
    },
    {
      title: "Annual Income",
      dataIndex: "annualIncome",
      key: "annualIncome",
      width: 120,
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <Tag color="green" style={{ fontSize: "10px" }}>
            Grade: {record.grade}
          </Tag>
        </div>
      ),
    },
    {
      title: "Location",
      dataIndex: "city",
      key: "city",
      width: 120,
      render: (text, record) => (
        <div>
          <EnvironmentOutlined style={{ marginRight: 5 }} />
          {text}
          {record.preferredMeetingArea !== "-" && (
            <div style={{ fontSize: "11px", color: "#666" }}>
              Area: {record.preferredMeetingArea}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Lead Source",
      dataIndex: "leadSource",
      key: "leadSource",
      width: 120,
      render: (text, record) => (
        <div>
          <div>{text}</div>
          {record.leadName !== "-" && (
            <div style={{ fontSize: "11px", color: "#666" }}>
              {record.leadName}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Allocated CRE",
      dataIndex: "allocatedCRE",
      key: "allocatedCRE",
      width: 120,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 100,
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => viewProspectDetails(record)}
              style={{ color: "#1890ff" }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ color: "#52c41a" }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="link"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              style={{ color: "#ff4d4f" }}
            />
          </Tooltip>
          <Button
            type="primary"
            size="small"
            onClick={() => handleConvertToClient(record)}
            style={{ fontSize: "11px" }}
          >
            To Client
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="prospect-list">
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <UserOutlined style={{ color: "#1890ff" }} />
            <span>Prospects List</span>
            <Tag color="green" style={{ marginLeft: "10px" }}>
              {filteredProspects.length} Prospects
            </Tag>
          </div>
        }
        extra={
          <Button
            type="primary"
            onClick={fetchProspects}
            loading={loading}
            icon={<CalendarOutlined />}
          >
            Refresh
          </Button>
        }
        style={{ marginBottom: "20px", borderRadius: "8px" }}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
          <Col span={24}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Input
                placeholder="Search prospects by name, mobile, email, organisation, etc..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={handleSearchChange}
                allowClear
                style={{ flex: 1 }}
              />
              {searchText && <Button onClick={handleClearSearch}>Clear</Button>}
            </div>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: "8px" }}>
        <Table
          columns={columns}
          dataSource={filteredProspects}
          loading={loading}
          scroll={{ x: 1800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} prospects`,
            showQuickJumper: true,
          }}
          rowKey="id"
        />
      </Card>

      {/* Details Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <UserOutlined style={{ color: "#1890ff" }} />
            <span>Prospect Details - {selectedProspect?.name}</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedProspect && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" title="Basic Information">
                  <p>
                    <strong>Group Code:</strong> {selectedProspect.groupCode}
                  </p>
                  <p>
                    <strong>Group Head:</strong> {selectedProspect.groupName}
                  </p>
                  <p>
                    <strong>Name:</strong> {selectedProspect.name}
                  </p>
                  <p>
                    <strong>Gender:</strong> {selectedProspect.gender}
                  </p>
                  <p>
                    <strong>Annual Income:</strong>{" "}
                    {selectedProspect.annualIncome}
                  </p>
                  <p>
                    <strong>Grade:</strong> {selectedProspect.grade}
                  </p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Contact Information">
                  <p>
                    <strong>Mobile:</strong> {selectedProspect.mobile}
                  </p>
                  <p>
                    <strong>WhatsApp:</strong> {selectedProspect.whatsapp}
                  </p>
                  <p>
                    <strong>Contact:</strong> {selectedProspect.contact}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedProspect.email}
                  </p>
                  <p>
                    <strong>Aadhar:</strong> {selectedProspect.adharNumber}
                  </p>
                  <p>
                    <strong>PAN:</strong> {selectedProspect.panCardNumber}
                  </p>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
              <Col span={12}>
                <Card size="small" title="Professional Details">
                  <p>
                    <strong>Organisation:</strong>{" "}
                    {selectedProspect.organisation}
                  </p>
                  <p>
                    <strong>Designation:</strong> {selectedProspect.designation}
                  </p>
                  <p>
                    <strong>Lead Source:</strong> {selectedProspect.leadSource}
                  </p>
                  <p>
                    <strong>Lead Name:</strong> {selectedProspect.leadName}
                  </p>
                  <p>
                    <strong>Lead Occupation:</strong>{" "}
                    {selectedProspect.leadOccupation}
                  </p>
                  <p>
                    <strong>Occupation Type:</strong>{" "}
                    {selectedProspect.leadOccupationType}
                  </p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Location Details">
                  <p>
                    <strong>City:</strong> {selectedProspect.city}
                  </p>
                  <p>
                    <strong>Meeting Area:</strong>{" "}
                    {selectedProspect.preferredMeetingArea}
                  </p>
                  <p>
                    <strong>Residential Address:</strong>{" "}
                    {selectedProspect.resiAddr}
                  </p>
                  <p>
                    <strong>Office Address:</strong>{" "}
                    {selectedProspect.officeAddr}
                  </p>
                  <p>
                    <strong>Best Time:</strong> {selectedProspect.bestTime}
                  </p>
                  <p>
                    <strong>Time:</strong> {selectedProspect.time}
                  </p>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
              <Col span={24}>
                <Card size="small" title="Additional Information">
                  <p>
                    <strong>Allocated CRE:</strong>{" "}
                    {selectedProspect.allocatedCRE}
                  </p>
                  <p>
                    <strong>Allocated RM:</strong>{" "}
                    {selectedProspect.allocatedRM}
                  </p>
                  <p>
                    <strong>Calling Purpose:</strong>{" "}
                    {selectedProspect.callingPurpose}
                  </p>
                  <p>
                    <strong>Hobbies:</strong> {selectedProspect.hobbies}
                  </p>
                  <p>
                    <strong>Native Place:</strong>{" "}
                    {selectedProspect.nativePlace}
                  </p>
                  <p>
                    <strong>Habits:</strong> {selectedProspect.habits}
                  </p>
                  <p>
                    <strong>Social Link:</strong> {selectedProspect.socialLink}
                  </p>
                  <p>
                    <strong>Remark:</strong> {selectedProspect.remark}
                  </p>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProspectAppointmentList;
