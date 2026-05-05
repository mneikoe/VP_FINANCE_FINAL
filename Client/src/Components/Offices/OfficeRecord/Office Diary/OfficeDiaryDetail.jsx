import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Button, Space, Card, Input, Tooltip, Tag } from "antd";
import { EditOutlined, DeleteOutlined, FilePdfOutlined, SearchOutlined } from "@ant-design/icons";
import {
  deleteOfficeDiary,
  fetchOfficeDiaries,
} from "../../../../redux/feature/OfficeDiary/OfficeDiaryThunx";
import { toast, ToastContainer } from "react-toastify";

const OfficeDiaryDetail = ({ setActiveTab, setEditId }) => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.officeDiary);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    dispatch(fetchOfficeDiaries());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this Office Diary?")) {
      dispatch(deleteOfficeDiary(id))
        .unwrap()
        .then(() => {
          toast.success("Office Diary deleted successfully!");
        })
        .catch((err) => {
          toast.error("Failed to delete Office Diary.");
          console.log(err, "error in deleting");
        });
    }
  };

  const handleUpdate = (id) => {
    setEditId(id);
    setActiveTab("add");
  };

  const columns = [
    {
      title: "#",
      key: "index",
      width: 50,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Particulars",
      dataIndex: "particulars",
      key: "particulars",
    },
    {
      title: "Company Name",
      dataIndex: "orgName",
      key: "orgName",
      sorter: (a, b) => a.orgName?.localeCompare(b.orgName),
    },
    {
      title: "Service Person",
      dataIndex: "servicePerson",
      key: "servicePerson",
    },
    {
      title: "Mobile Number",
      dataIndex: "contactNo",
      key: "contactNo",
    },
    {
      title: "Contact Number",
      dataIndex: "officeContactNo",
      key: "officeContactNo",
      render: (val) => val || "-",
    },
    {
      title: "License No.",
      dataIndex: "licanceNo",
      key: "licanceNo",
    },
    {
      title: "Purchase Date",
      dataIndex: "purchageDate",
      key: "purchageDate",
      render: (date) => date?.substring(0, 10),
      sorter: (a, b) => new Date(a.purchageDate) - new Date(b.purchageDate),
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => date?.substring(0, 10),
    },
    {
      title: "Renewal Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => date?.substring(0, 10),
    },
    {
      title: "Purchase Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val) => val ? `₹${val}` : "-",
    },
    {
      title: "User Id",
      dataIndex: "userId",
      key: "userId",
    },
    {
      title: "Password",
      dataIndex: "password",
      key: "password",
    },
    {
      title: "Document",
      dataIndex: "pdfPath",
      key: "pdfPath",
      render: (path) => (
        path ? (
          <Tooltip title="View PDF">
            <Button 
              type="link" 
              icon={<FilePdfOutlined />} 
              href={path} 
              target="_blank"
              className="p-0"
            />
          </Tooltip>
        ) : "-"
      ),
    },
    {
      title: "Uploaded At",
      dataIndex: "uploadedAt",
      key: "uploadedAt",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Action",
      key: "action",
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined className="text-primary" />}
              onClick={() => handleUpdate(record._id)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              icon={<DeleteOutlined className="text-danger" />}
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredData = Array.isArray(list) 
    ? list.filter(item => 
        item.orgName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.particulars?.toLowerCase().includes(searchText.toLowerCase())
      )
    : [];

  return (
    <Card className="mt-3 shadow-sm border-0">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Office Diary Entries</h5>
        <Input
          placeholder="Search by company or particulars"
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          onChange={e => setSearchText(e.target.value)}
        />
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        size="small"
        scroll={{ x: 'max-content' }}
      />
      <ToastContainer />
    </Card>
  );
};

export default OfficeDiaryDetail;
