import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Tag,
  Card,
  Alert,
  Space,
  Dropdown,
  Input,
  Row,
  Col,
  List,
  Spin,
  Badge,
  Typography,
  Divider,
  Empty,
  Select,
  DatePicker,
  Radio,
  Pagination,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  SendOutlined,
  FilterOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  FlagOutlined,
  StarOutlined,
  CalendarOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  UserAddOutlined,
  CloseOutlined,
  HistoryOutlined,
  BuildOutlined,
  SyncOutlined,
  ClearOutlined,
  DownOutlined,
  ToolOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ServiceAssignments = () => {
  const [serviceTasks, setServiceTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [employeesByRole, setEmployeesByRole] = useState({});
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Assign Form State - SINGLE EMPLOYEE ONLY
  const [assignForm, setAssignForm] = useState({
    priority: "medium",
    remarks: "",
    dueDate: "",
    selectedEmployee: null,
    selectedRole: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [taskTypeTab, setTaskTypeTab] = useState("assigned");
  const isDefaultSelectedTask = selectedTask?.taskMode === "default";

  // Fetch service tasks
  const fetchServiceTasks = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const response = await axios.get(
        "/api/Task?type=service&status=template"
      );
      const tasks = response.data?.tasks || response.data || [];
      setServiceTasks(tasks);
    } catch (error) {
      console.error("Error fetching service tasks:", error);
      message.error("Failed to load service tasks. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch employees for selected role
  const fetchEmployeesForRole = async (role) => {
    setLoadingEmployees(true);
    try {
      const allEmployeesResponse = await axios.get(
        "/api/employee/getAllEmployees"
      );

      let allEmployees = [];

      if (allEmployeesResponse.data) {
        if (
          allEmployeesResponse.data.success &&
          Array.isArray(allEmployeesResponse.data.data)
        ) {
          allEmployees = allEmployeesResponse.data.data;
        } else if (Array.isArray(allEmployeesResponse.data)) {
          allEmployees = allEmployeesResponse.data;
        } else if (
          allEmployeesResponse.data.employees &&
          Array.isArray(allEmployeesResponse.data.employees)
        ) {
          allEmployees = allEmployeesResponse.data.employees;
        }
      }

      const normalizedRole = role.toLowerCase();
      const roleEmployees = allEmployees.filter((emp) => {
        const empRole = (
          emp.role ||
          emp.designation ||
          emp.position ||
          ""
        ).toLowerCase();
        const isRoleMatch =
          empRole.includes(normalizedRole) || normalizedRole.includes(empRole);

        const isActive =
          !emp.dateOfTermination &&
          !emp.terminationDate &&
          !emp.endDate &&
          (emp.status === undefined ||
            emp.status === null ||
            emp.status === "active" ||
            emp.status === "Active");

        return isRoleMatch && isActive;
      });

      setEmployeesByRole({
        [role]: roleEmployees,
      });

      console.log(
        `Role "${role}" has ${roleEmployees.length} active employees`
      );
    } catch (error) {
      console.error("Error fetching employees:", error);
      message.error("Failed to load employees. Please try again.");
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchServiceTasks();
  }, []);

  // Handle assign button click
  const handleAssignClick = (task) => {
    setSelectedTask(task);

    const role = task.depart?.[0] || "";
    if (role) {
      fetchEmployeesForRole(role);
    }

    const dueDate =
      task.taskMode === "default"
        ? null
        : dayjs().add(task.estimatedDays || 1, "day");

    let selectedEmployee = null;
    if (task.assignments && task.assignments.length > 0) {
      selectedEmployee =
        task.assignments[0].employeeId?._id || task.assignments[0].employeeId;
    }

    setAssignForm({
      priority: task.templatePriority || "medium",
      remarks: "",
      dueDate: dueDate,
      selectedEmployee: selectedEmployee,
      selectedRole: role,
    });

    setShowAssignModal(true);
  };

  // Handle employee selection - SINGLE EMPLOYEE ONLY
  const handleEmployeeSelect = (employeeId) => {
    setAssignForm((prev) => ({
      ...prev,
      selectedEmployee: prev.selectedEmployee === employeeId ? null : employeeId,
    }));
  };

  // Submit assignment
  const handleAssignSubmit = async () => {
    if (!selectedTask || !assignForm.selectedEmployee) {
      message.warning("Please select an employee to assign");
      return;
    }

    try {
      const response = await axios.post("/api/Task/assign-service", {
        taskId: selectedTask._id,
        employeeId: assignForm.selectedEmployee,
        employeeRole: assignForm.selectedRole,
        priority: assignForm.priority,
        remarks: assignForm.remarks,
        dueDate:
          selectedTask.taskMode === "default"
            ? null
            : assignForm.dueDate?.format("YYYY-MM-DD"),
        assignedBy: JSON.parse(localStorage.getItem("user")).id,
      });

      if (response.data.success) {
        message.success("Service task assigned successfully!");
        setShowAssignModal(false);
        fetchServiceTasks();
      } else {
        message.error("Failed to assign: " + response.data.message);
      }
    } catch (error) {
      console.error("Error assigning service task:", error);
      message.error(
        "Failed to assign task: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // Get priority config
  const getPriorityConfig = (priority) => {
    const configs = {
      urgent: {
        color: "error",
        icon: <ExclamationCircleOutlined />,
        label: "URGENT",
      },
      high: { color: "warning", icon: <FlagOutlined />, label: "HIGH" },
      medium: { color: "processing", icon: null, label: "MEDIUM" },
      low: { color: "default", icon: null, label: "LOW" },
    };
    return configs[priority] || configs.medium;
  };

  // Get selected employee details
  const getSelectedEmployeeDetails = () => {
    if (!assignForm.selectedEmployee || !assignForm.selectedRole) return null;

    const roleEmployees = employeesByRole[assignForm.selectedRole] || [];
    return roleEmployees.find((emp) => emp._id === assignForm.selectedEmployee);
  };

  // Get assigned employee name
  const getAssignedEmployeeName = (task) => {
    if (task.assignments && task.assignments.length > 0) {
      const assignment = task.assignments[0];
      return assignment.employeeId?.name || "Employee";
    }
    return null;
  };

  const tabbedTasks = serviceTasks.filter((task) =>
    taskTypeTab === "default"
      ? task.taskMode === "default"
      : (task.taskMode || "assigned") !== "default"
  );

  // Filter and sort tasks
  const filteredTasks = tabbedTasks
    .filter((task) => {
      const matchesSearch =
        searchTerm === "" ||
        task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.sub?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "urgent" && task.templatePriority === "urgent") ||
        (filterStatus === "high" && task.templatePriority === "high") ||
        (filterStatus === "medium" && task.templatePriority === "medium") ||
        (filterStatus === "low" && task.templatePriority === "low") ||
        (filterStatus === "assigned" && task.assignments?.length > 0);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;

      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "name" || sortConfig.key === "sub") {
        aValue = aValue?.toLowerCase() || "";
        bValue = bValue?.toLowerCase() || "";
      }

      if (sortConfig.key === "estimatedDays") {
        aValue = a.estimatedDays || 0;
        bValue = b.estimatedDays || 0;
      }

      if (sortConfig.key === "templatePriority") {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        aValue = priorityOrder[a.templatePriority] || 2;
        bValue = priorityOrder[b.templatePriority] || 2;
      }

      if (sortConfig.key === "assignments") {
        aValue = a.assignments?.length || 0;
        bValue = b.assignments?.length || 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

  // Pagination
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle sort
  const handleTableChange = (pagination, filters, sorter) => {
    if (sorter.field) {
      setSortConfig({
        key: sorter.field,
        direction: sorter.order === "ascend" ? "asc" : "desc",
      });
    } else {
      setSortConfig({ key: null, direction: "asc" });
    }
  };

  // Table columns
  const columns = [
    {
      title: "#",
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <Text type="secondary">
          {(currentPage - 1) * pageSize + index + 1}
        </Text>
      ),
    },
    {
      title: "Task Details",
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (text, record) => {
        const priorityConfig = getPriorityConfig(record.templatePriority || "medium");
        const assignmentCount = record.assignments?.length || 0;
        const assignedEmployee = getAssignedEmployeeName(record);

        return (
          <Space direction="vertical" size={2}>
            <Space>
              <Text strong>{text}</Text>
              <Tag color="orange" icon={<ToolOutlined />}>
                Service
              </Tag>
              {record.templatePriority === "urgent" && (
                <Tag color="error" icon={<ExclamationCircleOutlined />}>
                  URGENT
                </Tag>
              )}
            </Space>
            <Space size={8} wrap>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <BuildOutlined /> {record.sub}
              </Text>
              {assignmentCount > 0 && (
                <Tag color="blue" icon={<TeamOutlined />}>
                  {assignmentCount} assigned
                </Tag>
              )}
            </Space>
            {assignedEmployee && (
              <Text type="success" style={{ fontSize: 12 }}>
                <CheckCircleOutlined /> Assigned to: {assignedEmployee}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: "Required Role",
      dataIndex: "depart",
      key: "depart",
      width: 150,
      render: (roles) => (
        <Space wrap>
          {roles?.map((role, idx) => (
            <Tag key={idx} color="default">
              {role}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Timeline",
      dataIndex: "estimatedDays",
      key: "estimatedDays",
      width: 120,
      align: "center",
      sorter: true,
      render: (days, record) =>
        record.taskMode === "default" ? (
          <Text type="secondary">N/A</Text>
        ) : (
        <Space>
          <ClockCircleOutlined style={{ color: "#8c8c8c" }} />
          <Text>{days || 1} day{(days || 1) !== 1 ? "s" : ""}</Text>
        </Space>
        ),
    },
    {
      title: "Priority",
      dataIndex: "templatePriority",
      key: "templatePriority",
      width: 120,
      align: "center",
      sorter: true,
      render: (priority) => {
        const config = getPriorityConfig(priority || "medium");
        return (
          <Tag color={config.color} icon={config.icon} style={{ minWidth: 90, textAlign: "center" }}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: "Checklists",
      dataIndex: "checklists",
      key: "checklists",
      width: 100,
      align: "center",
      render: (checklists) => (
        <Tag color="default">{checklists?.length || 0}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      align: "center",
      render: (_, record) => {
        const assignmentCount = record.assignments?.length || 0;
        return (
          <Space direction="vertical" size={4}>
            <Button
              type={assignmentCount > 0 ? "primary" : "default"}
              icon={<UserAddOutlined />}
              onClick={() => handleAssignClick(record)}
              block
            >
              {assignmentCount > 0 ? "Re-assign" : "Assign"}
            </Button>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Single employee task
            </Text>
          </Space>
        );
      },
    },
  ];

  // Filter menu items
  const filterMenuItems = [
    { key: "all", label: "All Templates" },
    { key: "divider1", type: "divider" },
    { key: "header1", label: "Priority", type: "group" },
    { key: "urgent", label: "Urgent Priority" },
    { key: "high", label: "High Priority" },
    { key: "medium", label: "Medium Priority" },
    { key: "low", label: "Low Priority" },
    { key: "divider2", type: "divider" },
    { key: "assigned", label: "Already Assigned" },
  ];

  // Sort menu items
  const sortMenuItems = [
    { key: "name", label: "Task Name" },
    { key: "templatePriority", label: "Priority" },
    { key: "estimatedDays", label: "Timeline" },
    { key: "assignments", label: "Assignment Count" },
  ];

  if (loading && serviceTasks.length === 0) {
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
        <Text type="secondary">Loading Service Tasks...</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Space direction="vertical" size={4}>
          <Title level={3} style={{ margin: 0 }}>
            <ToolOutlined style={{ marginRight: 12, color: "#fa8c16" }} />
            Service Task Assignments
          </Title>
          <Text type="secondary">
            Assign service task templates to employees (Single employee per task)
          </Text>
        </Space>
        <Space>
          <Tag color="orange" style={{ padding: "4px 12px", fontSize: 14 }}>
            {serviceTasks.length} Templates
          </Tag>
          <Button
            icon={<SyncOutlined spin={refreshing} />}
            onClick={fetchServiceTasks}
            loading={refreshing}
          >
            Refresh
          </Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }} bodyStyle={{ padding: "12px 20px" }}>
        <Space>
          <Button
            type={taskTypeTab === "assigned" ? "primary" : "default"}
            onClick={() => setTaskTypeTab("assigned")}
          >
            Assigned Tasks (
            {serviceTasks.filter((t) => (t.taskMode || "assigned") !== "default").length}
            )
          </Button>
          <Button
            type={taskTypeTab === "default" ? "primary" : "default"}
            onClick={() => setTaskTypeTab("default")}
          >
            Default Tasks ({serviceTasks.filter((t) => t.taskMode === "default").length})
          </Button>
        </Space>
      </Card>

      {/* Search & Filter Bar */}
      <Card style={{ marginBottom: 24 }} bodyStyle={{ padding: "16px 20px" }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input
              placeholder="Search by task name or company..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              size="large"
            />
          </Col>
          <Col>
            <Space>
              <Dropdown
                menu={{
                  items: filterMenuItems,
                  onClick: ({ key }) => {
                    if (!["divider1", "divider2", "header1"].includes(key)) {
                      setFilterStatus(key);
                    }
                  },
                }}
              >
                <Button size="large" icon={<FilterOutlined />}>
                  {filterStatus === "all"
                    ? "All Templates"
                    : filterStatus === "urgent"
                    ? "Urgent"
                    : filterStatus === "high"
                    ? "High Priority"
                    : filterStatus === "medium"
                    ? "Medium Priority"
                    : filterStatus === "low"
                    ? "Low Priority"
                    : filterStatus === "assigned"
                    ? "Assigned"
                    : filterStatus}{" "}
                  <DownOutlined />
                </Button>
              </Dropdown>

              <Dropdown
                menu={{
                  items: sortMenuItems,
                  onClick: ({ key }) => {
                    setSortConfig({
                      key,
                      direction:
                        sortConfig.key === key && sortConfig.direction === "asc"
                          ? "desc"
                          : "asc",
                    });
                  },
                }}
              >
                <Button size="large" icon={<SortAscendingOutlined />}>
                  Sort <DownOutlined />
                </Button>
              </Dropdown>

              {(searchTerm || filterStatus !== "all") && (
                <Button
                  size="large"
                  icon={<ClearOutlined />}
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                    setSortConfig({ key: null, direction: "asc" });
                    setCurrentPage(1);
                  }}
                  danger
                >
                  Clear
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Card bodyStyle={{ padding: 0 }} style={{ overflow: "hidden" }}>
        {filteredTasks.length === 0 ? (
          <Empty
            description="No Service Tasks Found"
            style={{ padding: "60px 0" }}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {(searchTerm || filterStatus !== "all") ? (
              <Text type="secondary">
                No tasks match your search criteria.
              </Text>
            ) : (
              <Text type="secondary">
                Create service task templates first to assign them to employees.
              </Text>
            )}
          </Empty>
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={paginatedTasks}
              rowKey="_id"
              pagination={false}
              onChange={handleTableChange}
              loading={loading}
              size="middle"
              scroll={{ x: 950 }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 24px",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <Text type="secondary">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, filteredTasks.length)} of{" "}
                {filteredTasks.length} entries
              </Text>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredTasks.length}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
                showSizeChanger
                pageSizeOptions={["10", "20", "50", "100"]}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`
                }
              />
            </div>
          </>
        )}
      </Card>

      {/* Assign Modal - SINGLE EMPLOYEE */}
      <Modal
        title={
          <Space>
            <ToolOutlined style={{ color: "#fa8c16" }} />
            <span>Assign Service Task</span>
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
              Select one employee to assign this service task
            </Text>
          </Space>
        }
        open={showAssignModal}
        onCancel={() => setShowAssignModal(false)}
        width={700}
        footer={
          <Space>
            <Button onClick={() => setShowAssignModal(false)}>Cancel</Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleAssignSubmit}
              disabled={!assignForm.selectedEmployee}
            >
              {assignForm.selectedEmployee
                ? "Assign to Selected Employee"
                : "Select Employee First"}
            </Button>
          </Space>
        }
        destroyOnClose
      >
        {selectedTask && (
          <>
            {/* Task Info Card */}
            <Card
              size="small"
              style={{ marginBottom: 24, backgroundColor: "#fafafa" }}
            >
              <Row align="middle">
                <Col span={16}>
                  <Space direction="vertical" size={4}>
                    <Text strong style={{ fontSize: 16 }}>
                      {selectedTask.name}
                    </Text>
                    <Space size={16} wrap>
                      <Space>
                        <BuildOutlined />
                        <Text type="secondary">{selectedTask.sub}</Text>
                      </Space>
                      <Space>
                        <Tag color="default">{assignForm.selectedRole}</Tag>
                      </Space>
                      {!isDefaultSelectedTask && (
                        <Space>
                          <ClockCircleOutlined />
                          <Text type="secondary">
                            {selectedTask.estimatedDays || 1} day(s)
                          </Text>
                        </Space>
                      )}
                      <Tag
                        color={
                          getPriorityConfig(selectedTask.templatePriority || "medium")
                            .color
                        }
                      >
                        {selectedTask.templatePriority || "medium"}
                      </Tag>
                      {selectedTask.assignments?.length > 0 && (
                        <Tag color="blue" icon={<TeamOutlined />}>
                          {selectedTask.assignments.length} assigned
                        </Tag>
                      )}
                    </Space>
                  </Space>
                </Col>
                {!isDefaultSelectedTask && (
                  <Col span={8} style={{ textAlign: "right" }}>
                    <Space direction="vertical" size={2}>
                      <Text type="secondary">Due Date</Text>
                      <Text strong>
                        <CalendarOutlined />{" "}
                        {assignForm.dueDate?.format("DD/MM/YYYY")}
                      </Text>
                    </Space>
                  </Col>
                )}
              </Row>
            </Card>

            {/* Assignment Settings */}
            <div style={{ marginBottom: 24 }}>
              <Title level={5} style={{ marginBottom: 16 }}>
                <StarOutlined style={{ marginRight: 8 }} />
                Assignment Settings
              </Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Priority" style={{ marginBottom: 0 }}>
                    <Select
                      value={assignForm.priority}
                      onChange={(value) =>
                        setAssignForm({ ...assignForm, priority: value })
                      }
                      style={{ width: "100%" }}
                    >
                      <Option value="low">Low Priority</Option>
                      <Option value="medium">Medium Priority</Option>
                      <Option value="high">High Priority</Option>
                      <Option value="urgent">Urgent Priority</Option>
                    </Select>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Template priority:{" "}
                      {selectedTask.templatePriority || "medium"}
                    </Text>
                  </Form.Item>
                </Col>
                {!isDefaultSelectedTask && (
                  <Col span={12}>
                    <Form.Item label="Due Date" style={{ marginBottom: 0 }}>
                      <DatePicker
                        value={assignForm.dueDate}
                        onChange={(date) =>
                          setAssignForm({ ...assignForm, dueDate: date })
                        }
                        disabledDate={(current) =>
                          current && current < dayjs().startOf("day")
                        }
                        style={{ width: "100%" }}
                      />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Based on {selectedTask.estimatedDays || 1} day(s)
                      </Text>
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </div>

            <Divider />

            {/* Employee Selection - SINGLE EMPLOYEE */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Title level={5} style={{ margin: 0 }}>
                  <TeamOutlined style={{ marginRight: 8 }} />
                  Select Employee
                </Title>
                <Tag color="orange">{assignForm.selectedRole} role only</Tag>
              </div>

              {loadingEmployees ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Spin />
                  <p style={{ marginTop: 16 }}>Loading employees...</p>
                </div>
              ) : (
                <Card
                  size="small"
                  bodyStyle={{ padding: 0, maxHeight: 300, overflowY: "auto" }}
                >
                  <List
                    dataSource={employeesByRole[assignForm.selectedRole] || []}
                    renderItem={(employee) => {
                      const isSelected =
                        assignForm.selectedEmployee === employee._id;
                      return (
                        <List.Item
                          style={{
                            padding: "12px 16px",
                            cursor: "pointer",
                            backgroundColor: isSelected ? "#fff7e6" : "white",
                            borderBottom: "1px solid #f0f0f0",
                            transition: "background-color 0.2s",
                          }}
                          onClick={() => handleEmployeeSelect(employee._id)}
                        >
                          <Radio
                            checked={isSelected}
                            style={{ marginRight: 12 }}
                          />
                          <div style={{ flex: 1 }}>
                            <Text strong>{employee.name}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {employee.employeeCode} •{" "}
                              {employee.designation || employee.role}
                            </Text>
                          </div>
                        </List.Item>
                      );
                    }}
                    locale={{ emptyText: "No active employees available for this role" }}
                  />
                </Card>
              )}
            </div>

            <Divider />

            {/* Remarks */}
            <div style={{ marginBottom: 24 }}>
              <Form.Item label="Additional Instructions">
                <TextArea
                  rows={3}
                  placeholder="Add notes for the assigned employee..."
                  value={assignForm.remarks}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, remarks: e.target.value })
                  }
                />
              </Form.Item>
              <Text type="secondary">
                Optional - These notes will be visible to the assigned employee
              </Text>
            </div>

            {/* Previous Assignments */}
            {selectedTask.assignments && selectedTask.assignments.length > 0 && (
              <Alert
                message={
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Space>
                      <HistoryOutlined style={{ color: "#fa8c16" }} />
                      <Text strong>Previous Assignments</Text>
                      <Badge count={selectedTask.assignments.length} />
                    </Space>
                    <div style={{ backgroundColor: "white", padding: 12, borderRadius: 6 }}>
                      {selectedTask.assignments.map((assignment, idx) => (
                        <div key={idx} style={{ marginBottom: idx < selectedTask.assignments.length - 1 ? 8 : 0 }}>
                          <Text type="secondary">
                            {dayjs(assignment.assignedAt).format("DD/MM/YYYY")} -{" "}
                            {assignment.employeeId?.name || "Employee"}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </Space>
                }
                type="info"
                style={{ marginBottom: 24 }}
              />
            )}

            {/* Selected Employee Summary */}
            {assignForm.selectedEmployee && (
              <Alert
                message={
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Space>
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                      <Text strong>Selected Employee</Text>
                    </Space>
                    <div
                      style={{
                        backgroundColor: "white",
                        padding: 12,
                        borderRadius: 6,
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
                          <Text strong>
                            {getSelectedEmployeeDetails()?.name || "Employee"}
                          </Text>
                          <br />
                          <Text type="secondary">Role: {assignForm.selectedRole}</Text>
                        </div>
                        <Tag color="orange">Selected</Tag>
                      </div>
                    </div>
                  </Space>
                }
                type="success"
              />
            )}
          </>
        )}
      </Modal>
      <style>{`
        .compact-assignment-page .table-responsive {
          margin-top: 0;
        }
        .compact-assignment-page th,
        .compact-assignment-page td {
          padding-top: 0.5rem !important;
          padding-bottom: 0.5rem !important;
        }
      `}</style>
    </div>
  );
};

export default ServiceAssignments;