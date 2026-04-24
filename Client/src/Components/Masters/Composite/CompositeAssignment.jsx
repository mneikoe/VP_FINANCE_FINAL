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
  Tooltip,
  Empty,
  Select,
  DatePicker,
  message,
  Checkbox,
  Pagination,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  SendOutlined,
  FilterOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  FlagOutlined,
  StarOutlined,
  CalendarFilled,
  CheckOutlined,
  UsergroupAddOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
  UserAddOutlined,
  CloseOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
  BuildOutlined,
  AppstoreOutlined,
  UserSwitchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  SyncOutlined,
  ReloadOutlined,
  ClearOutlined,
  DownOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";

// Import ClientProspectSelectionModal
import ClientProspectSelectionModal from "../ClientProspectSelectionModal";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CompositeAssignments = () => {
  const [compositeTasks, setCompositeTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [employeesByRole, setEmployeesByRole] = useState({});
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Client/Prospect Modal State
  const [showClientProspectModal, setShowClientProspectModal] = useState(false);

  // Assign Form State
  const [assignForm, setAssignForm] = useState({
    priority: "medium",
    remarks: "",
    dueDate: "",
    selectedEmployees: {},
    selectedClients: [],
    selectedProspects: [],
    clientRemarks: "",
    prospectRemarks: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [taskTypeTab, setTaskTypeTab] = useState("assigned");
  const isDefaultSelectedTask = selectedTask?.taskMode === "default";
  const [form] = Form.useForm();

  // Fetch composite tasks
  const fetchCompositeTasks = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const response = await axios.get(
        "/api/Task?type=composite&status=template"
      );
      const tasks = response.data?.tasks || response.data || [];
      setCompositeTasks(tasks);
    } catch (error) {
      console.error("Error fetching composite tasks:", error);
      message.error("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch employees by role
  const fetchEmployeesByRole = async (roles) => {
    setLoadingEmployees(true);
    try {
      const employeesMap = {};

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

      roles.forEach((role) => {
        const normalizedRole = role.toLowerCase();

        const roleEmployees = allEmployees.filter((emp) => {
          const empRole = (
            emp.role ||
            emp.designation ||
            emp.position ||
            ""
          ).toLowerCase();
          const isRoleMatch =
            empRole.includes(normalizedRole) ||
            normalizedRole.includes(empRole);

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

        employeesMap[role] = roleEmployees;
      });

      setEmployeesByRole(employeesMap);
    } catch (error) {
      console.error("Error in fetchEmployeesByRole:", error);
      message.error("Failed to load employees. Please try again.");
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchCompositeTasks();
  }, []);

  // Handle assign button click
  const handleAssignClick = (task) => {
    setSelectedTask(task);

    if (task.depart && task.depart.length > 0) {
      fetchEmployeesByRole(task.depart);
    }

    const dueDate =
      task.taskMode === "default"
        ? null
        : dayjs().add(task.estimatedDays || 1, "day");

    const existingSelections = {};
    if (task.assignments && task.assignments.length > 0) {
      task.assignments.forEach((assignment) => {
        if (assignment.employeeId && assignment.employeeRole) {
          const role = assignment.employeeRole;
          if (!existingSelections[role]) {
            existingSelections[role] = [assignment.employeeId];
          } else {
            existingSelections[role].push(assignment.employeeId);
          }
        }
      });
    }

    setAssignForm({
      priority: task.templatePriority || "medium",
      remarks: "",
      dueDate: dueDate,
      selectedEmployees: existingSelections,
      selectedClients: task.assignedClients || [],
      selectedProspects: task.assignedProspects || [],
      clientRemarks: "",
      prospectRemarks: "",
    });

    setShowAssignModal(true);
  };

  // Handle Client/Prospect Selection
  const handleClientProspectSelect = () => {
    setShowClientProspectModal(true);
  };

  // Handle Client/Prospect Selection Confirm
  const handleClientProspectConfirm = (selectionData) => {
    setAssignForm((prev) => ({
      ...prev,
      selectedClients: selectionData.clients,
      selectedProspects: selectionData.prospects,
      clientRemarks: selectionData.clientRemarks,
      prospectRemarks: selectionData.prospectRemarks,
    }));

    const totalSelected =
      selectionData.clients.length + selectionData.prospects.length;
    if (totalSelected > 0) {
      message.success(
        `Selected ${selectionData.clients.length} client(s) and ${selectionData.prospects.length} prospect(s)`
      );
    }

    setShowClientProspectModal(false);
  };

  // Handle employee selection
  const handleEmployeeSelect = (role, employeeId, checked) => {
    setAssignForm((prev) => {
      const current = prev.selectedEmployees[role] || [];

      if (checked) {
        return {
          ...prev,
          selectedEmployees: {
            ...prev.selectedEmployees,
            [role]: [...current, employeeId],
          },
        };
      } else {
        const updated = current.filter((id) => id !== employeeId);
        const newSelected = { ...prev.selectedEmployees };

        if (updated.length === 0) {
          delete newSelected[role];
        } else {
          newSelected[role] = updated;
        }

        return {
          ...prev,
          selectedEmployees: newSelected,
        };
      }
    });
  };

  // Select ALL employees for a role
  const handleSelectAllForRole = (role, checked) => {
    const allEmployees = employeesByRole[role] || [];
    if (allEmployees.length === 0) return;

    setAssignForm((prev) => {
      if (checked) {
        const allEmployeeIds = allEmployees.map((emp) => emp._id);
        return {
          ...prev,
          selectedEmployees: {
            ...prev.selectedEmployees,
            [role]: allEmployeeIds,
          },
        };
      } else {
        const newSelected = { ...prev.selectedEmployees };
        delete newSelected[role];
        return {
          ...prev,
          selectedEmployees: newSelected,
        };
      }
    });
  };

  // Submit assignment
  const handleAssignSubmit = async () => {
    if (!selectedTask) return;

    try {
      const assignments = [];

      Object.entries(assignForm.selectedEmployees).forEach(
        ([role, employeeIds]) => {
          employeeIds.forEach((employeeId) => {
            if (employeeId) {
              assignments.push({
                employeeId: employeeId,
                employeeRole: role,
                priority: assignForm.priority,
                remarks: assignForm.remarks,
                dueDate:
                  selectedTask.taskMode === "default"
                    ? null
                    : assignForm.dueDate?.format("YYYY-MM-DD"),
              });
            }
          });
        }
      );

      if (assignments.length === 0) {
        message.warning("Please select at least one employee to assign");
        return;
      }

      const clientProspectData = {
        clients: assignForm.selectedClients || [],
        prospects: assignForm.selectedProspects || [],
        clientAssignmentRemarks: assignForm.clientRemarks || "",
        prospectAssignmentRemarks: assignForm.prospectRemarks || "",
      };

      const payload = {
        taskId: selectedTask._id,
        assignments,
        assignedBy: JSON.parse(localStorage.getItem("user")).id,
        ...clientProspectData,
      };

      const response = await axios.post("/api/Task/assign-composite", payload);

      if (response.data.success) {
        const totalAssigned = assignments.length;
        const clientCount = assignForm.selectedClients?.length || 0;
        const prospectCount = assignForm.selectedProspects?.length || 0;

        let successMsg = `Task assigned to ${totalAssigned} employee(s)`;
        if (clientCount > 0) {
          successMsg += ` for ${clientCount} client(s)`;
        }
        if (prospectCount > 0) {
          successMsg += ` and ${prospectCount} prospect(s)`;
        }
        successMsg += "!";

        message.success(successMsg);
        setShowAssignModal(false);
        fetchCompositeTasks();
      } else {
        throw new Error(response.data.message || "Assignment failed");
      }
    } catch (error) {
      console.error("Error assigning task:", error);
      message.error(
        error.response?.data?.message || error.message || "Failed to assign task"
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

  // Check if all employees are selected for a role
  const isAllSelectedForRole = (role) => {
    const selected = assignForm.selectedEmployees[role] || [];
    const allEmployees = employeesByRole[role] || [];
    return (
      allEmployees.length > 0 && selected.length === allEmployees.length
    );
  };

  // Check if some employees are selected for a role
  const isIndeterminateForRole = (role) => {
    const selected = assignForm.selectedEmployees[role] || [];
    const allEmployees = employeesByRole[role] || [];
    return selected.length > 0 && selected.length < allEmployees.length;
  };

  // Check if employee is selected
  const isEmployeeSelected = (role, employeeId) => {
    const selected = assignForm.selectedEmployees[role] || [];
    return selected.includes(employeeId);
  };

  // Get total selected employees
  const getTotalSelectedEmployees = () => {
    return Object.values(assignForm.selectedEmployees).reduce(
      (total, ids) => total + ids.length,
      0
    );
  };

  // Get total selected clients and prospects
  const getTotalSelectedClientProspects = () => {
    return (
      (assignForm.selectedClients?.length || 0) +
      (assignForm.selectedProspects?.length || 0)
    );
  };

  const tabbedTasks = compositeTasks.filter((task) =>
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
        (filterStatus === "multi-role" && task.depart?.length > 1);

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

      if (sortConfig.key === "depart") {
        aValue = a.depart?.length || 0;
        bValue = b.depart?.length || 0;
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
      title: "Task Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (text, record) => {
        const priorityConfig = getPriorityConfig(record.templatePriority || "medium");
        const assignmentCount = record.assignments?.length || 0;
        
        return (
          <Space direction="vertical" size={2}>
            <Space>
              <Text strong>{text}</Text>
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
              {record.assignedClients?.length > 0 && (
                <Tag color="green" icon={<UserOutlined />}>
                  {record.assignedClients.length} client(s)
                </Tag>
              )}
              {record.assignedProspects?.length > 0 && (
                <Tag color="cyan" icon={<UsergroupAddOutlined />}>
                  {record.assignedProspects.length} prospect(s)
                </Tag>
              )}
            </Space>
          </Space>
        );
      },
    },
    {
      title: "Required Roles",
      dataIndex: "depart",
      key: "depart",
      width: 200,
      sorter: true,
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
              {assignmentCount > 0 ? "Assign More" : "Assign"}
            </Button>
            {assignmentCount > 0 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {assignmentCount} assigned
              </Text>
            )}
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
    { key: "multi-role", label: "Multi-Role Templates" },
  ];

  // Sort menu items
  const sortMenuItems = [
    { key: "name", label: "Task Name" },
    { key: "templatePriority", label: "Priority" },
    { key: "estimatedDays", label: "Timeline" },
    { key: "depart", label: "Roles" },
  ];

  if (loading && compositeTasks.length === 0) {
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
        <Text type="secondary">Loading Tasks...</Text>
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
            <UserSwitchOutlined style={{ marginRight: 12, color: "#1890ff" }} />
            Composite Task Assignments
          </Title>
          <Text type="secondary">
            Assign composite task templates to employees
          </Text>
        </Space>
        <Space>
          <Tag color="blue" style={{ padding: "4px 12px", fontSize: 14 }}>
            {compositeTasks.length} Templates
          </Tag>
          <Button
            icon={<SyncOutlined spin={refreshing} />}
            onClick={fetchCompositeTasks}
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
            {compositeTasks.filter((t) => (t.taskMode || "assigned") !== "default").length}
            )
          </Button>
          <Button
            type={taskTypeTab === "default" ? "primary" : "default"}
            onClick={() => setTaskTypeTab("default")}
          >
            Default Tasks ({compositeTasks.filter((t) => t.taskMode === "default").length})
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
                    : filterStatus === "multi-role"
                    ? "Multi-Role"
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
            description="No Tasks Found"
            style={{ padding: "60px 0" }}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {(searchTerm || filterStatus !== "all") && (
              <Text type="secondary">
                No tasks match your search criteria.
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
              scroll={{ x: 1100 }}
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

      {/* Client/Prospect Selection Modal */}
      <ClientProspectSelectionModal
        show={showClientProspectModal}
        onHide={() => setShowClientProspectModal(false)}
        onConfirm={handleClientProspectConfirm}
        selectedTask={selectedTask}
        initialSelections={{
          clients: assignForm.selectedClients || [],
          prospects: assignForm.selectedProspects || [],
          clientRemarks: assignForm.clientRemarks || "",
          prospectRemarks: assignForm.prospectRemarks || "",
        }}
        title={`Select Clients & Prospects for "${selectedTask?.name}"`}
      />

      {/* Assign Modal */}
      <Modal
        title={
          <Space>
            <UserAddOutlined style={{ color: "#1890ff" }} />
            <span>Assign Task to Employees</span>
          </Space>
        }
        open={showAssignModal}
        onCancel={() => setShowAssignModal(false)}
        width={900}
        footer={
          <Space>
            <Button onClick={() => setShowAssignModal(false)}>Cancel</Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleAssignSubmit}
              disabled={getTotalSelectedEmployees() === 0}
            >
              {getTotalSelectedEmployees() === 0
                ? "Select Employees First"
                : `Assign to ${getTotalSelectedEmployees()} Employee(s)`}
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

            {/* Client & Prospect Selection */}
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
                  Client & Prospect Selection
                </Title>
                <Badge count={getTotalSelectedClientProspects()} showZero />
              </div>

              <Button
                block
                size="large"
                icon={<UsergroupAddOutlined />}
                onClick={handleClientProspectSelect}
                style={{ height: 56 }}
              >
                {getTotalSelectedClientProspects() > 0
                  ? `Edit Selection (${getTotalSelectedClientProspects()} selected)`
                  : "Select Clients & Prospects (Optional)"}
              </Button>

              {getTotalSelectedClientProspects() > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Row gutter={16}>
                    {assignForm.selectedClients?.length > 0 && (
                      <Col span={12}>
                        <Alert
                          message={
                            <>
                              <TeamOutlined />{" "}
                              <strong>{assignForm.selectedClients.length}</strong>{" "}
                              client(s) selected
                            </>
                          }
                          type="success"
                          showIcon={false}
                        />
                      </Col>
                    )}
                    {assignForm.selectedProspects?.length > 0 && (
                      <Col span={12}>
                        <Alert
                          message={
                            <>
                              <UsergroupAddOutlined />{" "}
                              <strong>{assignForm.selectedProspects.length}</strong>{" "}
                              prospect(s) selected
                            </>
                          }
                          type="info"
                          showIcon={false}
                        />
                      </Col>
                    )}
                  </Row>

                  {assignForm.clientRemarks && (
                    <Alert
                      message={
                        <>
                          <Text strong style={{ color: "#52c41a" }}>
                            Client Remarks:
                          </Text>
                          <br />
                          {assignForm.clientRemarks}
                        </>
                      }
                      type="success"
                      style={{ marginTop: 12 }}
                    />
                  )}

                  {assignForm.prospectRemarks && (
                    <Alert
                      message={
                        <>
                          <Text strong style={{ color: "#1890ff" }}>
                            Prospect Remarks:
                          </Text>
                          <br />
                          {assignForm.prospectRemarks}
                        </>
                      }
                      type="info"
                      style={{ marginTop: 12 }}
                    />
                  )}
                </div>
              )}
              <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                Optional - You can select clients and/or prospects for whom this
                task is being assigned
              </Text>
            </div>

            <Divider />

            {/* Employee Selection */}
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
                  Select Employees by Role
                </Title>
                <Badge count={Object.keys(assignForm.selectedEmployees).length}>
                  role(s) selected
                </Badge>
              </div>

              {loadingEmployees ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Spin />
                  <p style={{ marginTop: 16 }}>Loading employees...</p>
                </div>
              ) : (
                <Row gutter={[16, 16]}>
                  {selectedTask.depart?.map((role) => {
                    const roleEmployees = employeesByRole[role] || [];
                    const isAllSelected = isAllSelectedForRole(role);
                    const isIndeterminate = isIndeterminateForRole(role);

                    return (
                      <Col span={12} key={role}>
                        <Card
                          size="small"
                          title={
                            <Space>
                              <Tag color="blue">{role}</Tag>
                              <Text type="secondary">
                                ({roleEmployees.length} employees)
                              </Text>
                            </Space>
                          }
                          extra={
                            <Space>
                              <Checkbox
                                checked={isAllSelected}
                                indeterminate={isIndeterminate}
                                onChange={(e) =>
                                  handleSelectAllForRole(role, e.target.checked)
                                }
                              >
                                Select All
                              </Checkbox>
                            </Space>
                          }
                          bodyStyle={{
                            padding: 0,
                            maxHeight: 250,
                            overflowY: "auto",
                          }}
                        >
                          <List
                            dataSource={roleEmployees}
                            renderItem={(employee) => {
                              const isSelected = isEmployeeSelected(
                                role,
                                employee._id
                              );
                              return (
                                <List.Item
                                  style={{
                                    padding: "12px 16px",
                                    cursor: "pointer",
                                    backgroundColor: isSelected
                                      ? "#f5f5f5"
                                      : "white",
                                    borderBottom: "1px solid #f0f0f0",
                                  }}
                                  onClick={() =>
                                    handleEmployeeSelect(
                                      role,
                                      employee._id,
                                      !isSelected
                                    )
                                  }
                                >
                                  <Checkbox checked={isSelected} />
                                  <div style={{ marginLeft: 12, flex: 1 }}>
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
                            locale={{ emptyText: "No active employees available" }}
                          />
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </div>

            <Divider />

            {/* Remarks */}
            <div style={{ marginBottom: 24 }}>
              <Form.Item label="Additional Instructions">
                <TextArea
                  rows={3}
                  placeholder="Add any notes or instructions for employees..."
                  value={assignForm.remarks}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, remarks: e.target.value })
                  }
                />
              </Form.Item>
              <Text type="secondary">
                Optional - These notes will be visible to assigned employees
              </Text>
            </div>

            {/* Selected Employees Summary */}
            {getTotalSelectedEmployees() > 0 && (
              <Alert
                message={
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Space>
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                      <Text strong>Selected Employees</Text>
                    </Space>
                    <Row gutter={[8, 8]}>
                      {Object.entries(assignForm.selectedEmployees).map(
                        ([role, employeeIds]) => (
                          <Col span={12} key={role}>
                            <Tag color="processing">
                              {role}: {employeeIds.length} selected
                            </Tag>
                          </Col>
                        )
                      )}
                    </Row>
                    <Divider style={{ margin: "12px 0" }} />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text strong>
                        Total New Assignments: {getTotalSelectedEmployees()}{" "}
                        employee(s)
                      </Text>
                      <Text type="secondary">
                        Priority: {assignForm.priority} • Due:{" "}
                        {assignForm.dueDate?.format("DD/MM/YYYY")}
                      </Text>
                    </div>
                  </Space>
                }
                type="info"
              />
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default CompositeAssignments;