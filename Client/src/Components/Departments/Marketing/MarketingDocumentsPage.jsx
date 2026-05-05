import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AutoComplete,
  Button,
  Card,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileAddOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { fetchFinancialProduct } from "../../../redux/feature/FinancialProduct/FinancialThunx";
import { fetchCompanyName } from "../../../redux/feature/ComapnyName/CompanyThunx";
import { fetchKycDocuments } from "../../../redux/feature/kycdocument/documentthunx";
import axios from "../../../config/axios";

const { Title, Text } = Typography;

const MarketingDocumentsPage = ({
  department = "marketing",
  title = "Marketing Documents",
}) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const selectedFinancialProduct = Form.useWatch("financialProduct", form);
  const selectedDocumentType = Form.useWatch("documentType", form);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingId, setUploadingId] = useState("");

  const financialProducts = useSelector(
    (state) => state.financialProduct?.FinancialProducts || []
  );
  const companies = useSelector((state) => state.CompanyName?.CompanyNames || []);
  const documentTypes = useSelector((state) => state.kycdoc?.documents || []);

  const refreshTable = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/marketing-documents", {
        params: { department },
      });
      const payload = response?.data;
      if (Array.isArray(payload)) {
        setRows(payload);
      } else if (Array.isArray(payload?.data)) {
        setRows(payload.data);
      } else if (Array.isArray(payload?.documents)) {
        setRows(payload.documents);
      } else {
        setRows([]);
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to load marketing documents");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchFinancialProduct());
    dispatch(fetchCompanyName());
    dispatch(fetchKycDocuments());
    refreshTable();
  }, [dispatch, department]);

  const companyOptions = useMemo(
    () =>
      companies.map((item) => ({
        label: item.companyName || "Unnamed Company",
        value: item._id,
        productId:
          typeof item.financialProduct === "object"
            ? item.financialProduct?._id
            : item.financialProduct,
      })),
    [companies]
  );

  const selectedTypeMeta = useMemo(
    () => documentTypes.find((doc) => doc?._id === selectedDocumentType),
    [documentTypes, selectedDocumentType]
  );

  const documentNameOptions = useMemo(
    () =>
      (selectedTypeMeta?.documentNames || []).map((name) => ({
        value: name,
        label: name,
      })),
    [selectedTypeMeta]
  );

  const formatDateTime = (value) => {
    if (!value) return "-";

    const dateObj = new Date(value);
    if (Number.isNaN(dateObj.getTime())) return "-";

    return dateObj.toLocaleDateString("en-IN");
  };

  const onCreate = async (values) => {
    if (!selectedFile) {
      message.warning("Please upload a file first.");
      return;
    }

    const payload = new FormData();
    payload.append("financialProduct", values.financialProduct);
    payload.append("company", values.company);
    payload.append("documentType", values.documentType);
    payload.append("documentName", values.documentName);
    payload.append("department", department);
    payload.append("file", selectedFile);

    setSaving(true);
    try {
      await axios.post("/api/marketing-documents", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Document saved successfully");
      form.resetFields();
      setSelectedFile(null);
      await refreshTable();
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to save document");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/marketing-documents/${id}`);
      message.success("Document deleted");
      await refreshTable();
    } catch (error) {
      message.error(error?.response?.data?.message || "Delete failed");
    }
  };

  const handleReplaceFile = async (record, file) => {
    const formData = new FormData();
    formData.append("file", file);
    setUploadingId(record._id);
    try {
      await axios.put(`/api/marketing-documents/${record._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("File updated");
      await refreshTable();
    } catch (error) {
      message.error(error?.response?.data?.message || "Upload failed");
    } finally {
      setUploadingId("");
    }
    return false;
  };

  const columns = [
    {
      title: "Submit Date",
      dataIndex: "lastUploadedAt",
      key: "lastUploadedAt",
      render: (value, record) => formatDateTime(value || record?.createdAt),
    },
    {
      title: "Financial Product",
      dataIndex: ["financialProduct", "name"],
      key: "financialProduct",
      render: (value) => value || "-",
    },
    {
      title: "Company Name",
      dataIndex: ["company", "companyName"],
      key: "company",
      render: (value) => value || "-",
    },
    {
      title: "Document Type",
      dataIndex: ["documentType", "name"],
      key: "documentType",
      render: (value) => <Tag color="blue">{value || "-"}</Tag>,
    },
    {
      title: "Document Name",
      dataIndex: "documentName",
      key: "documentName",
    },

    {
      title: "Total Uploads",
      key: "uploadCount",
      render: (_, record) => record?.uploadHistory?.length || 1,
    },
    {
      title: "Upload",
      key: "upload",
      render: (_, record) => (
        <Upload
          showUploadList={false}
          beforeUpload={(file) => handleReplaceFile(record, file)}
          accept="*"
        >
          <Button
            icon={<UploadOutlined />}
            loading={uploadingId === record._id}
            size="small"
          >
            Replace
          </Button>
        </Upload>
      ),
    },
    {
      title: "Download",
      key: "download",
      render: (_, record) => (
        <Button
          icon={<DownloadOutlined />}
          size="small"
          onClick={() => window.open(`${import.meta.env.VITE_API_URL}${record.fileUrl}`, "_blank")}
        >
          Download
        </Button>
      ),
    },
    {
      title: "Print",
      key: "print",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => {
            const win = window.open(
              `${import.meta.env.VITE_API_URL}${record.fileUrl}`,
              "_blank"
            );
            if (win) {
              win.onload = () => win.print();
            }
          }}
        >
          Print
        </Button>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Delete this row?"
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={() => handleDelete(record._id)}
        >
          <Button danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <style>{`
        .custom-marketing-card {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 10px !important;
        }
        .custom-marketing-title {
          color: #0d6efd !important;
          font-weight: 700 !important;
          margin-bottom: 4px !important;
        }
        .custom-marketing-table .ant-table-thead > tr > th {
          background: #facc15 !important;
          color: #111827 !important;
          font-size: 0.74rem !important;
          border-radius: 0 !important;
        }
        .custom-marketing-table .ant-table-cell {
          font-size: 0.76rem !important;
        }
      `}</style>
      <Card className="custom-marketing-card">
        <Space direction="vertical" size={14} style={{ width: "100%" }}>
          <div>
            <Title level={4} className="custom-marketing-title">
              {title}
            </Title>
            <Text type="secondary">
              Select financial product, company, document type and upload any document format.
            </Text>
          </div>

          <Form layout="vertical" form={form} onFinish={onCreate}>
            <Space wrap style={{ width: "100%" }} align="start">
              <Form.Item
                label="Financial Product"
                name="financialProduct"
                rules={[{ required: true, message: "Select financial product" }]}
                style={{ minWidth: 220 }}
              >
                <Select
                  showSearch
                  placeholder="Select financial product"
                  options={financialProducts.map((item) => ({
                    label: item.name,
                    value: item._id,
                  }))}
                  onChange={() => form.setFieldValue("company", undefined)}
                />
              </Form.Item>

              <Form.Item
                label="Company Name"
                name="company"
                rules={[{ required: true, message: "Select company" }]}
                style={{ minWidth: 240 }}
              >
                <Select
                  showSearch
                  placeholder="Select company"
                  options={companyOptions.filter(
                    (item) => item.productId === selectedFinancialProduct
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Document Type"
                name="documentType"
                rules={[{ required: true, message: "Select document type" }]}
                style={{ minWidth: 220 }}
              >
                <Select
                  showSearch
                  placeholder="Select document type"
                  options={documentTypes.map((doc) => ({ label: doc.name, value: doc._id }))}
                  onChange={() => form.setFieldValue("documentName", undefined)}
                />
              </Form.Item>

              <Form.Item
                label="Document Name"
                name="documentName"
                rules={[{ required: true, message: "Enter document name" }]}
                style={{ minWidth: 260 }}
              >
                <AutoComplete
                  options={documentNameOptions}
                  placeholder={
                    selectedDocumentType
                      ? "Select or type document name"
                      : "First select document type"
                  }
                  filterOption={(inputValue, option) =>
                    String(option?.value || "")
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  }
                >
                  <Input />
                </AutoComplete>
              </Form.Item>

              <Form.Item label="Upload File" required style={{ minWidth: 240 }}>
                <Upload
                  beforeUpload={(file) => {
                    setSelectedFile(file);
                    return false;
                  }}
                  maxCount={1}
                  accept="*"
                  onRemove={() => setSelectedFile(null)}
                >
                  <Button icon={<UploadOutlined />}>
                    {selectedFile ? "Change File" : "Select File"}
                  </Button>
                </Upload>
                {selectedFile ? (
                  <Text type="secondary" style={{ display: "block", marginTop: 6 }}>
                    {selectedFile.name}
                  </Text>
                ) : null}
              </Form.Item>

              <Form.Item label=" " style={{ marginTop: 8 }}>
                <Button
                  htmlType="submit"
                  type="primary"
                  icon={<FileAddOutlined />}
                  loading={saving}
                >
                  Save Document
                </Button>
              </Form.Item>
            </Space>
          </Form>

          <Table
            className="custom-marketing-table"
            rowKey="_id"
            columns={columns}
            dataSource={Array.isArray(rows) ? rows : []}
            loading={loading}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            scroll={{ x: 1200 }}
          />
        </Space>
      </Card>
    </div>
  );
};

export default MarketingDocumentsPage;
