import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Button, Space, Card, Input, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, FilePdfOutlined, SearchOutlined } from "@ant-design/icons";
import { toast, ToastContainer } from "react-toastify";
import {
  deleteOfficePurchase,
  fetchOfficePurchases,
} from "../../../redux/feature/OfficePurchase/PurchaseThunx";

const OfficePurchaseDetail = ({ setActiveTab, setEditId }) => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.officePurchase);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    dispatch(fetchOfficePurchases());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this Office Purchase?")) {
      dispatch(deleteOfficePurchase(id))
        .unwrap()
        .then(() => toast.success("Deleted successfully"))
        .catch(() => toast.error("Failed to delete"));
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
      title: "Purchase Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      render: (date) => date?.substring(0, 10),
    },
    {
      title: "Voucher Number",
      dataIndex: "vrNo",
      key: "vrNo",
    },
    {
      title: "Invoice Number",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
    },
    {
      title: "Head of Account",
      dataIndex: "headOfACs",
      key: "headOfACs",
    },
    {
      title: "Particular",
      dataIndex: "itemParticulars",
      key: "itemParticulars",
    },
    {
      title: "Name of Firm/Company",
      dataIndex: "firmName",
      key: "firmName",
      sorter: (a, b) => a.firmName?.localeCompare(b.firmName),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (val) => val || "-",
    },
    {
      title: "Contact Number",
      dataIndex: "contactNumber",
      key: "contactNumber",
      render: (val) => val || "-",
    },
    {
      title: "Rate",
      dataIndex: "ratePerUnit",
      key: "ratePerUnit",
      render: (val) => `₹${val}`,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val) => <strong className="text-primary">₹{val}</strong>,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Remark",
      dataIndex: "remark",
      key: "remark",
      render: (val) => val || "-",
    },
    {
      title: "Invoice PDF",
      dataIndex: "pdfPath",
      key: "pdfPath",
      render: (path) => (
        path ? (
          <Tooltip title="View Invoice PDF">
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
        item.firmName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.itemParticulars?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.vrNo?.toLowerCase().includes(searchText.toLowerCase())
      )
    : [];

  return (
    <Card className="mt-3 shadow-sm border-0">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Office Purchase List</h5>
        <Input
          placeholder="Search by firm, particular or voucher"
          prefix={<SearchOutlined />}
          style={{ width: 350 }}
          onChange={e => setSearchText(e.target.value)}
        />
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="_id"
        loading={loading}
        size="small"
        scroll={{ x: 'max-content' }}
        pagination={{ pageSize: 10 }}
      />
      <ToastContainer />
    </Card>
  );
};

export default OfficePurchaseDetail;
