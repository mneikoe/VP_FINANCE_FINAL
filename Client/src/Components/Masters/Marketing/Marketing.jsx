import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Space,
  Typography,
  Tag,
  Tooltip,
  Modal,
  Spin,
  Empty,
  Tabs,
  Popconfirm,
  message,
  Badge,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  MessageOutlined,
  MailOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined,
  NotificationOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import DOMPurify from "dompurify";
import AddTaskMarketing from "./AddTask";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const Marketing = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("view");
  const [taskModeTab, setTaskModeTab] = useState("assigned");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [update, setUpdate] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch all marketing tasks
  const fetchAllMarketingTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/Task?type=marketing");
      if (response.data.success) {
        setTasks(response.data.tasks || []);
      } else {
        message.error(response.data.message || "Failed to fetch tasks");
      }
    } catch (error) {
      message.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single marketing task by ID
  const fetchMarketingTaskById = async (id) => {
    try {
      const response = await axios.get(`/api/Task/marketing/${id}`);
      if (response.data.success) {
        return response.data.task;
      }
      return null;
    } catch (error) {
      console.error("Error fetching task:", error);
      return null;
    }
  };

  // Delete marketing task
  const deleteMarketingTask = async (id) => {
    try {
      const response = await axios.delete(`/api/Task/marketing/${id}`);
      if (response.data.success) {
        message.success("Marketing task deleted successfully");
        fetchAllMarketingTasks();
      } else {
        message.error("Failed to delete: " + response.data.message);
      }
    } catch (error) {
      message.error("Error deleting task: " + error.message);
    }
  };

  useEffect(() => {
    if (activeTab === "view") {
      fetchAllMarketingTasks();
    }
  }, [activeTab]);

  const openModal = async (type, task) => {
    setModalLoading(true);
    setCurrentTask(task);
    switch (type) {
      case "detail":
        setShowDetailModal(true);
        break;
      case "checklist":
        setShowChecklistModal(true);
        break;
      case "sms":
        setShowSmsModal(true);
        break;
      case "email":
        setShowEmailModal(true);
        break;
      default:
        break;
    }
    setModalLoading(false);
  };

  const handleEdit = async (id) => {
    setActiveTab("add");
    const task = await fetchMarketingTaskById(id);
    setUpdate(task);
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      urgent: { color: "error", label: "URGENT" },
      high: { color: "warning", label: "HIGH" },
      medium: { color: "processing", label: "MEDIUM" },
      low: { color: "default", label: "LOW" },
    };
    return configs[priority] || configs.medium;
  };

  const filteredTasks = tasks.filter((task) =>
    taskModeTab === "default"
      ? task.taskMode === "default"
      : (task.taskMode || "assigned") !== "default"
  );

  const columns = [
    {
      title: "#",
      width: 40,
      align: "center",
      render: (_, __, index) => (
        <Text type="secondary">
          {(currentPage - 1) * pageSize + index + 1}
        </Text>
      ),
    },
    {
      title: "Financial Product",
      dataIndex: ["cat", "name"],
      key: "product",
      width: 130,
      render: (text) => text || "N/A",
    },
    {
      title: "Company",
      dataIndex: "sub",
      key: "company",
      width: 100,
      ellipsis: true,
    },
    {
      title: "Role",
      dataIndex: "depart",
      key: "role",
      width: 90,
      render: (roles) => (
        <Space wrap>
          {roles?.map((role, i) => (
            <Tag key={i} color="blue">
              {role}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Task Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <span style={{ whiteSpace: "normal", wordBreak: "break-word", fontWeight: "normal", textTransform: "capitalize" }}>
          {text ? text.toLowerCase() : ""}
        </span>
      ),
    },
    {
      title: "Checklist",
      key: "checklist",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Tooltip title="View Checklist">
          <Button
            type="link"
            size="small"
            icon={<UnorderedListOutlined style={{ fontSize: '14px' }} />}
            onClick={() => openModal("checklist", record)}
            style={{ color: "#ff4d4f" }}
          />
        </Tooltip>
      ),
    },
    {
      title: "View",
      key: "description",
      width: 60,
      align: "center",
      render: (_, record) => (
        <Tooltip title="View Description">
          <Button
            type="link"
            size="small"
            icon={<FileTextOutlined style={{ fontSize: '14px' }} />}
            onClick={() => openModal("detail", record)}
            style={{ color: "#1890ff" }}
          />
        </Tooltip>
      ),
    },
    {
      title: "Priority",
      dataIndex: "templatePriority",
      key: "priority",
      width: 90,
      align: "center",
      render: (priority) => {
        const p = priority || "medium";
        const colors = { urgent: "error", high: "warning", medium: "processing", low: "default" };
        return <Tag color={colors[p]} style={{ textTransform: "capitalize", minWidth: 70, textAlign: "center", margin: 0 }}>{p}</Tag>;
      },
    },
    {
      title: "Days",
      dataIndex: "estimatedDays",
      key: "days",
      width: 70,
      align: "center",
      render: (days, record) => (
        <span style={{ whiteSpace: "nowrap" }}>
          {record.taskMode === "default" ? "N/A" : `${days || 1} day${(days || 1) !== 1 ? "s" : ""}`}
        </span>
      ),
    },
    {
      title: "Assigned",
      dataIndex: "assignments",
      key: "assignments",
      width: 90,
      align: "center",
      render: (assignments) => (
        <Badge count={assignments?.length || 0} showZero />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined style={{ fontSize: '14px' }} />}
              onClick={() => handleEdit(record._id)}
              style={{ color: "#1890ff" }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Marketing Task"
            description="Are you sure you want to delete this marketing task?"
            onConfirm={() => deleteMarketingTask(record._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button
                type="link"
                size="small"
                icon={<DeleteOutlined style={{ fontSize: '14px' }} />}
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: "view",
      label: (
        <span>
          <EyeOutlined /> View Tasks
        </span>
      ),
    },
    {
      key: "add",
      label: (
        <span>
          <PlusOutlined /> Add Marketing Task
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f5f7fa", minHeight: "100vh" }}>
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
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
          }}
        >
          <Space align="center" size={12}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "linear-gradient(135deg, #ff7eb3 0%, #ff758c 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NotificationOutlined style={{ fontSize: 24, color: "#fff" }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
                Marketing Tasks
              </Title>
              <Text type="secondary">Manage marketing task templates</Text>
            </div>
          </Space>

          {activeTab === "view" && (
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchAllMarketingTasks}
              loading={loading}
            >
              Refresh
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ padding: "0 24px" }}
          tabBarStyle={{ marginBottom: 0 }}
        />

        {/* Content */}
        <div style={{ padding: "24px" }}>
          {activeTab === "view" && (
            <>
              {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <Spin size="large" />
                  <p style={{ marginTop: 16 }}>Loading marketing tasks...</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <Empty
                  description={
                    taskModeTab === "default"
                      ? "No default marketing tasks found"
                      : "No assigned marketing tasks found"
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setActiveTab("add")}
                  >
                    Create Marketing Task
                  </Button>
                </Empty>
              ) : (
                <>
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <Space>
                      <Button
                        type={taskModeTab === "default" ? "primary" : "default"}
                        onClick={() => {
                          setTaskModeTab("default");
                          setCurrentPage(1);
                        }}
                      >
                        Default Tasks ({tasks.filter((t) => t.taskMode === "default").length})
                      </Button>
                      <Button
                        type={taskModeTab === "assigned" ? "primary" : "default"}
                        onClick={() => {
                          setTaskModeTab("assigned");
                          setCurrentPage(1);
                        }}
                      >
                        Assigned Tasks (
                        {tasks.filter((t) => (t.taskMode || "assigned") !== "default").length}
                        )
                      </Button>
                    </Space>
                  </Card>

                  {/* Stats Summary */}
                  <div style={{ marginBottom: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <Tag color="blue" style={{ padding: "4px 12px", fontSize: 14 }}>
                      Total Tasks: {filteredTasks.length}
                    </Tag>
                    <Tag color="pink" style={{ padding: "4px 12px", fontSize: 14 }}>
                      {taskModeTab === "default" ? "Default Tasks" : "Assigned Tasks"}
                    </Tag>
                  </div>

                  <Table
                    columns={columns}
                    dataSource={filteredTasks}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                      current: currentPage,
                      pageSize: pageSize,
                      total: filteredTasks.length,
                      onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                      },
                      showSizeChanger: true,
                      pageSizeOptions: ["10", "20", "50", "100"],
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} items`,
                    }}
                    size="small"
                  />
                </>
              )}
            </>
          )}

          {activeTab === "add" && (
            <AddTaskMarketing
              on={setActiveTab}
              data={update}
              onSuccess={() => {
                setUpdate(null);
                fetchAllMarketingTasks();
              }}
            />
          )}
        </div>
      </Card>

      {/* Description Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: "#ff7eb3" }} />
            <span>{currentTask?.name || "Task"} - Description</span>
          </Space>
        }
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {modalLoading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin />
          </div>
        ) : (
          <div
            style={{
              maxHeight: 500,
              overflow: "auto",
              padding: "16px 0",
            }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                currentTask?.descp?.text || "No description available"
              ),
            }}
          />
        )}
      </Modal>

      {/* Checklist Modal */}
      <Modal
        title={
          <Space>
            <UnorderedListOutlined style={{ color: "#ff7eb3" }} />
            <span>{currentTask?.name || "Task"} - Checklist</span>
          </Space>
        }
        open={showChecklistModal}
        onCancel={() => setShowChecklistModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowChecklistModal(false)}>
            Close
          </Button>,
        ]}
        width={500}
      >
        {currentTask?.checklists && currentTask.checklists.length > 0 ? (
          <div style={{ padding: "8px 0" }}>
            {currentTask.checklists.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: "12px 16px",
                  background: "#fafafa",
                  borderRadius: 8,
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#ff7eb3",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {index + 1}
                </div>
                <Text>{item}</Text>
              </div>
            ))}
          </div>
        ) : (
          <Empty description="No checklist available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Modal>

      {/* SMS Modal */}
      <Modal
        title={
          <Space>
            <MessageOutlined style={{ color: "#ff7eb3" }} />
            <span>{currentTask?.name || "Task"} - SMS Template</span>
          </Space>
        }
        open={showSmsModal}
        onCancel={() => setShowSmsModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowSmsModal(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {modalLoading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin />
          </div>
        ) : (
          <div
            style={{
              maxHeight: 400,
              overflow: "auto",
              padding: "16px",
              background: "#fafafa",
              borderRadius: 8,
            }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                currentTask?.sms_descp || "No SMS template available"
              ),
            }}
          />
        )}
      </Modal>

      {/* Email Modal */}
      <Modal
        title={
          <Space>
            <MailOutlined style={{ color: "#ff7eb3" }} />
            <span>{currentTask?.name || "Task"} - Email Template</span>
          </Space>
        }
        open={showEmailModal}
        onCancel={() => setShowEmailModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowEmailModal(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {modalLoading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin />
          </div>
        ) : (
          <div
            style={{
              maxHeight: 500,
              overflow: "auto",
              padding: "16px",
              background: "#fafafa",
              borderRadius: 8,
            }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                currentTask?.email_descp || "No email template available"
              ),
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default Marketing;