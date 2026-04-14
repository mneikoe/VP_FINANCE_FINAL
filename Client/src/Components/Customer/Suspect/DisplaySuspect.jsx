import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Spin, Dropdown, Space, Card, Typography, Input, Tag } from "antd";
import { 
  SearchOutlined, 
  ReloadOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  DownOutlined,
  UserOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import Table from "antd/es/table";
import { toast } from "react-toastify";
import {
  deleteSuspectById,
  updateSuspectStatus,
} from "../../../redux/feature/SuspectRedux/SuspectThunx";
import { useNavigate } from "react-router-dom";
import axios from "../../../config/axios";

const { Title, Text } = Typography;

function DisplaySuspect() {
  const dispatch = useDispatch();
  const [suspects, setSuspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      showTotal: (total) => `Total ${total} items`,
    },
  });

  const fetchAppointmentSuspects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/suspect/allappointmentscheduled`);
      console.log("API Response:", response.data);

      let suspectsData;
      if (response.data.data?.appointments) {
        suspectsData = response.data.data.appointments;
      } else if (response.data.suspects) {
        suspectsData = response.data.suspects;
      } else if (response.data.success) {
        suspectsData = response.data.data || [];
      } else {
        suspectsData = [];
      }

      setSuspects(suspectsData);
    } catch (err) {
      console.error("Error fetching appointment suspects:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch suspects"
      );
      toast.error("Failed to fetch appointment scheduled suspects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentSuspects();
  }, []);

  useEffect(() => {
    const mappedData = suspects.map((suspect) => {
      const personal = suspect.personalDetails || {};

      const appointmentTasks =
        suspect.callTasks?.filter(
          (task) => task.taskStatus === "Appointment Scheduled"
        ) || [];

      const latestAppointment = appointmentTasks.reduce((latest, task) => {
        if (!latest) return task;
        const taskDate = new Date(task.taskDate || 0);
        const latestDate = new Date(latest.taskDate || 0);
        return taskDate > latestDate ? task : latest;
      }, null);

      const telecallerName =
        suspect.assignedTo?.username ||
        (suspect.assignedTo && typeof suspect.assignedTo === "object"
          ? suspect.assignedTo.username
          : "Unassigned");
      const telecallerMobile = suspect.assignedTo?.mobileno || "-";

      return {
        key: suspect._id,
        id: suspect._id,
        groupCode: personal.groupCode || "-",
        grade: personal.grade || "-",
        groupName: personal.groupName || "-",
        name: personal.name || "-",
        gender: personal.gender || "-",
        mobile: personal.mobileNo || "",
        contactNo: personal.contactNo || "",
        leadSource: personal.leadSource || "-",
        leadName: personal.leadName || "-",
        area: personal.preferredMeetingArea || "-",
        callingPurpose: personal.callingPurpose || "-",
        createdAt: suspect.createdAt || new Date().toISOString(),
        appointmentDate: latestAppointment?.nextAppointmentDate
          ? new Date(latestAppointment.nextAppointmentDate).toLocaleDateString()
          : "Not set",
        appointmentTime: latestAppointment?.nextAppointmentTime || "Not set",
        scheduledDate: latestAppointment?.taskDate
          ? new Date(latestAppointment.taskDate).toLocaleDateString()
          : "Not set",
        appointmentRemarks: latestAppointment?.taskRemarks || "-",
        rawAppointmentDate: latestAppointment?.nextAppointmentDate,
        rawSuspectData: suspect,
        telecallerName,
        telecallerMobile,
      };
    });

    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      const filtered = mappedData.filter((item) => {
        const mobileString = item.mobile ? item.mobile.toString() : "";
        const contactString = item.contactNo ? item.contactNo.toString() : "";
        const telecallerString = item.telecallerName
          ? item.telecallerName.toLowerCase()
          : "";

        return (
          (item.groupCode &&
            item.groupCode.toLowerCase().includes(lowerCaseSearch)) ||
          (item.grade &&
            item.grade.toString().toLowerCase().includes(lowerCaseSearch)) ||
          (item.groupName &&
            item.groupName.toLowerCase().includes(lowerCaseSearch)) ||
          (item.name && item.name.toLowerCase().includes(lowerCaseSearch)) ||
          mobileString.toLowerCase().includes(lowerCaseSearch) ||
          contactString.toLowerCase().includes(lowerCaseSearch) ||
          (item.leadSource &&
            item.leadSource.toLowerCase().includes(lowerCaseSearch)) ||
          (item.leadName &&
            item.leadName.toLowerCase().includes(lowerCaseSearch)) ||
          (item.appointmentDate &&
            item.appointmentDate.toLowerCase().includes(lowerCaseSearch)) ||
          telecallerString.includes(lowerCaseSearch)
        );
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(mappedData);
    }
  }, [suspects, searchText]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this suspect?")) {
      try {
        await dispatch(deleteSuspectById(id)).unwrap();
        toast.success("Suspect deleted successfully");
        fetchAppointmentSuspects();
      } catch (err) {
        toast.error(err || "Failed to delete suspect");
      }
    }
  };

  const handleEdit = (suspect) => {
    navigate(`/suspect/edit/${suspect.id}`);
  };

  const handleView = (id) => {
    navigate(`/suspect/detail/${id}`);
  };

  const handleConvertStatus = (id, status) => {
    dispatch(updateSuspectStatus({ id, status }))
      .unwrap()
      .then(() => {
        toast.success("Suspect status updated successfully");
        fetchAppointmentSuspects();
      })
      .catch((err) => {
        toast.error(err || "Failed to update suspect status");
      });
  };

  const handleRefresh = () => {
    fetchAppointmentSuspects();
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });
  };

  const getGenderColor = (gender) => {
    switch(gender?.toLowerCase()) {
      case 'male': return 'blue';
      case 'female': return 'pink';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: '#',
      width: 60,
      align: 'center',
      render: (_, __, index) => (
        <Text type="secondary">
          {(tableParams.pagination.current - 1) * tableParams.pagination.pageSize + index + 1}
        </Text>
      ),
    },
    {
      title: 'Group Code',
      dataIndex: 'groupCode',
      key: 'groupCode',
      width: 120,
      
      render: (text) => <Tag color="orange">{text}</Tag>,
    },
    // {
    //   title: 'Grade',
    //   dataIndex: 'grade',
    //   key: 'grade',
    //   width: 80,
    //   align: 'center',
    //   sorter: (a, b) => a.grade - b.grade,
    //   render: (text) => (
    //     <Tag color={text === 'A' ? 'green' : text === 'B' ? 'orange' : 'default'}>
    //       {text}
    //     </Tag>
    //   ),
    // },
    {
      title: 'Group Head',
      dataIndex: 'groupName',
      key: 'groupName',
      width: 150,
      
      render: (text) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Tag color={getGenderColor(record.gender)}>{record.gender}</Tag>
        </Space>
      ),
    },
    {
      title: 'Contact Info',
      key: 'contact',
      width: 110,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          {record.mobile && (
            <Space size={4}>
              <PhoneOutlined />
              <Text>{record.mobile}</Text>
            </Space>
          )}
          {record.contactNo && (
            <Space size={4}>
              <PhoneOutlined />
              <Text type="secondary">{record.contactNo}</Text>
            </Space>
          )}
          {!record.mobile && !record.contactNo && <Text type="secondary">-</Text>}
        </Space>
      ),
    },
    {
      title: 'Lead Source',
      dataIndex: 'leadSource',
      key: 'leadSource',
      width: 130,
      
      render: (text) => (
        <Tag color="purple">{text}</Tag>
      ),
    },
    {
      title: 'Lead Name',
      dataIndex: 'leadName',
      key: 'leadName',
      width: 130,
      sorter: (a, b) => a.leadName.localeCompare(b.leadName),
    },
    {
      title: 'Area',
      dataIndex: 'area',
      key: 'area',
      width: 130,
     
      render: (text) => (
        <Space>
          <EnvironmentOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Calling Purpose',
      dataIndex: 'callingPurpose',
      key: 'callingPurpose',
      width: 130,
      
    },
    {
      title: 'Appointment Date',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      width: 120,
     
      defaultSortOrder: 'ascend',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <CalendarOutlined />
            <Text>{text}</Text>
          </Space>
          <Space>
            <ClockCircleOutlined />
            <Text type="secondary">{record.appointmentTime}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Scheduled Date',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      width: 130,
      sorter: (a, b) => a.scheduledDate.localeCompare(b.scheduledDate),
      render: (text) => (
        <Space>
          <ClockCircleOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Remarks',
      dataIndex: 'appointmentRemarks',
      key: 'appointmentRemarks',
      width: 180,
      ellipsis: true,
      render: (text) => (
        <Text 
          ellipsis={{ tooltip: text }}
          style={{ maxWidth: 160 }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space wrap>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Del
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
          >
            
          </Button>
        </Space>
      ),
    },
    {
      title: 'Convert',
      key: 'convert',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'client',
                label: 'Convert to Client',
                onClick: () => handleConvertStatus(record.id, 'client'),
              },
              {
                key: 'prospect',
                label: 'Convert to Prospect',
                onClick: () => handleConvertStatus(record.id, 'prospect'),
              },
            ],
          }}
        >
          <Button type="primary" size="small">
            Convert <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  if (loading && suspects.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size="large" />
        <Text type="secondary">Loading appointment scheduled suspects...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <Text type="danger">Error: {error}</Text>
      </Card>
    );
  }

  return (
    <div style={{ padding: '10px' }}>
      <Card 
        bordered={false}
        style={{ 
          boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <Space direction="vertical" size={4}>
              <Title level={4} style={{ margin: 0 }}>
                Appointment Scheduled Suspects
              </Title>
              <Text type="secondary">
                Showing {filteredData.length} suspects with "Appointment Scheduled" status
              </Text>
            </Space>
            
            <Space>
              <Input
                placeholder="Search by any field..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 280 }}
                allowClear
              />
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
              >
                Refresh
              </Button>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={tableParams.pagination}
            onChange={handleTableChange}
            loading={loading}
            scroll={{ 
              x: 2200,
              y: 'calc(100vh - 300px)'
            }}
            size="middle"
            bordered
            sticky
            rowKey="id"
            showSorterTooltip
            tableLayout="auto"
          />
        </Space>
      </Card>
    </div>
  );
}

export default DisplaySuspect;