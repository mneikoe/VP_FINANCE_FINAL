import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Empty,
  Input,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  CalendarOutlined,
  PhoneOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;

const AssignedTasks = ({ user }) => {
  const navigate = useNavigate();
  const [assignedSuspects, setAssignedSuspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchAssignedSuspects = async () => {
    try {
      setLoading(true);
      const rmId = user?.id;
      if (!rmId) {
        setAssignedSuspects([]);
        return;
      }
      const response = await axios.get("/api/rm/assigned-suspects", {
        params: { rmId },
      });
      if (response.data.success) {
        setAssignedSuspects(response.data.data || []);
      } else {
        setAssignedSuspects([]);
      }
    } catch {
      setAssignedSuspects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAssignedSuspects();
    } else {
      setLoading(false);
    }
  }, [user]);

  const filteredSuspects = useMemo(() => {
    if (!search.trim()) return assignedSuspects;
    const searchTerm = search.toLowerCase();
    return assignedSuspects.filter(
      (suspect) =>
        (suspect.suspectName || "").toLowerCase().includes(searchTerm) ||
        (suspect.groupCode || "").toLowerCase().includes(searchTerm) ||
        (suspect.mobileNo || "").toLowerCase().includes(searchTerm) ||
        (suspect.city || "").toLowerCase().includes(searchTerm) ||
        (suspect.organisation || "").toLowerCase().includes(searchTerm)
    );
  }, [assignedSuspects, search]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const formatTimeAMPM = (timeString) => {
    if (!timeString || timeString === "-" || timeString === "N/A") return "-";
    try {
      const [h, m = "00"] = timeString.split(":");
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${m} ${ampm}`;
    } catch {
      return "-";
    }
  };

  const statusColor = (status) => {
    if (status === "client") return "success";
    if (status === "prospect") return "processing";
    if (status === "suspect") return "warning";
    return "default";
  };

  const columns = [
    {
      title: "Group Code",
      dataIndex: "groupCode",
      width: 150,
      render: (_, record) => {
        const suspectId = record.suspectId || record.id || record._id;
        return (
          <Button
            type="link"
            onClick={() => suspectId && navigate(`/rm/suspect/details/${suspectId}`)}
            style={{ padding: 0, fontFamily: "monospace" }}
          >
            {record.groupCode || "N/A"}
          </Button>
        );
      },
    },
    {
      title: "Name",
      dataIndex: "groupName",
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.groupName || "N/A"}</Text>
          <Text type="secondary">{record.organisation || "N/A"}</Text>
        </Space>
      ),
    },
    {
      title: "Contacts",
      width: 170,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.mobileNo || "N/A"}</Text>
          <Text type="secondary">{record.contactNo || "-"}</Text>
        </Space>
      ),
    },
    {
      title: "City / Area",
      width: 150,
      render: (_, record) => `${record.city || "-"} / ${record.area || "-"}`,
    },
    {
      title: "Appointment",
      width: 160,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{formatDate(record.appointmentDate)}</Text>
          <Text type="secondary">{formatTimeAMPM(record.appointmentTime)}</Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 120,
      render: (status) => <Tag color={statusColor(status)}>{(status || "N/A").toUpperCase()}</Tag>,
    },
    {
      title: "Remarks",
      dataIndex: "remark",
      ellipsis: true,
      render: (_, record) => record.remark || record.appointmentRemarks || "-",
    },
    {
      title: "Action",
      width: 120,
      render: (_, record) => (
        <Button
          size="small"
          icon={<PhoneOutlined />}
          disabled={!record.mobileNo || record.mobileNo === "N/A"}
          onClick={() => (window.location.href = `tel:${record.mobileNo}`)}
        >
          Call
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20, background: "#f5f7fb", minHeight: "100vh" }}>


      <Space style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }} wrap>
        <Input
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefix={<SearchOutlined />}
          placeholder="Search by code, name, phone, city, organisation"
          style={{ width: 420, maxWidth: "100%" }}
        />
        <Button icon={<ReloadOutlined />} onClick={fetchAssignedSuspects} loading={loading}>
          Refresh
        </Button>
      </Space>

      <Space size={16} style={{ marginBottom: 16 }} wrap>
        <Card><Statistic title="Total Assigned" value={assignedSuspects.length} /></Card>
        <Card><Statistic title="Showing" value={filteredSuspects.length} /></Card>
        <Card>
          <Statistic
            title="Appointments"
            value={assignedSuspects.filter((s) => s.appointmentDate).length}
            prefix={<CalendarOutlined />}
          />
        </Card>
      </Space>

      <Card title={`Assigned Suspects (${filteredSuspects.length})`}>
        <Table
          columns={columns}
          dataSource={filteredSuspects}
          rowKey={(record) => record.suspectId || record.id || record._id}
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          locale={{
            emptyText: (
              <Empty
                description={
                  assignedSuspects.length === 0
                    ? "No suspects assigned yet."
                    : "No suspects match your search."
                }
              />
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default AssignedTasks;
