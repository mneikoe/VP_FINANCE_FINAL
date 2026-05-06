import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {
  PlusOutlined,
  DeleteOutlined,
  PaperClipOutlined,
  CheckOutlined,
  LoadingOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  UploadOutlined,
  FileTextOutlined,
  MailOutlined,
  MessageOutlined,
  WhatsAppOutlined,
  UnorderedListOutlined,
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Divider,
  Tabs,
  Badge,
  Tooltip,
  Spin,
  Alert,
  Upload,
  Image,
  Row,
  Col,
  Tag,
  Progress,
  message,
} from "antd";
import {
  createCompositeTask,
  updateCompositeTask,
} from "../../../redux/feature/CompositeTask/CompositeThunx";
import {
  clearError,
  clearSuccessMessage,
} from "../../../redux/feature/CompositeTask/CompositeSlice";
import { fetchFinancialProduct } from "../../../redux/feature/FinancialProduct/FinancialThunx";
import { fetchCompanyName } from "../../../redux/feature/ComapnyName/CompanyThunx";
import axios from "axios";
import { buildUploadUrl } from "../../../utils/uploadUrl";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const Addtask = ({ on, data, onSuccess }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const selectedTaskMode = Form.useWatch("taskMode", form) || "assigned";
  const selectedProductId = Form.useWatch("cat", form);

  const flat = data?.task
    ? {
        ...data.task,
        category: data.task?.cat?.category,
        productName: data.task?.cat?.name,
        descText: data.task?.descp?.text,
        descImage: data.task?.descp?.image,
      }
    : null;

  const { loading, error, successMessage } = useSelector(
    (state) => state.compositeTask
  );

  const [activeTab, setActiveTab] = useState("work");
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [loadingEmployeeTypes, setLoadingEmployeeTypes] = useState(false);
  const [editorData, setEditorData] = useState({
    descp: "",
    email: "",
    sms: "",
    whatsapp: "",
  });
  const [checklists, setChecklists] = useState([""]);
  const [formChecklists, setFormChecklists] = useState([
    { name: "", downloadFormUrl: null, sampleFormUrl: null },
  ]);
  const [descImage, setDescImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const products = useSelector(
    (state) => state.financialProduct.FinancialProducts || []
  );
  const company = useSelector((state) => state.CompanyName.CompanyNames || []);

  const filteredCompanies = company.filter((item) => {
    const productId =
      item?.financialProduct?._id || item?.financialProduct || "";
    return String(productId) === String(selectedProductId || "");
  });

  // Fetch data
  useEffect(() => {
    dispatch(fetchFinancialProduct());
    dispatch(fetchCompanyName());
  }, [dispatch]);

  useEffect(() => {
    const fetchEmployeeTypes = async () => {
      setLoadingEmployeeTypes(true);
      try {
        const response = await axios.get("/api/employee/getEmployeeRoles");
        if (response.data?.success) {
          setEmployeeTypes(response.data.data.roles || []);
        }
      } catch (error) {
        console.error("Error fetching employee types:", error);
      } finally {
        setLoadingEmployeeTypes(false);
      }
    };
    fetchEmployeeTypes();
  }, []);

  // Set form data when editing
  useEffect(() => {
    if (flat) {
      form.setFieldsValue({
        cat: flat?.cat?._id || "",
        sub: flat?.sub || "",
        depart: flat?.depart?.[0] || "",
        name: flat?.name || "",
        estimatedDays: flat?.estimatedDays || 1,
        reward: flat?.reward || "",
        templatePriority: flat?.templatePriority || "medium",
        taskMode: flat?.taskMode || "assigned",
        monthlyWindowFrom: flat?.monthlyWindowFrom || undefined,
        monthlyWindowTo: flat?.monthlyWindowTo || undefined,
        email_descp: flat?.email_descp || "",
        sms_descp: flat?.sms_descp || "",
        whatsapp_descp: flat?.whatsapp_descp || "",
      });

      setEditorData({
        descp: flat?.descp?.text || "",
        email: flat?.email_descp || "",
        sms: flat?.sms_descp || "",
        whatsapp: flat?.whatsapp_descp || "",
      });

      setChecklists(flat?.checklists?.length ? flat.checklists : [""]);
      setFormChecklists(
        flat?.formChecklists?.length
          ? flat.formChecklists.map((item) => ({
              name: item?.name || "",
              downloadFormUrl: item?.downloadFormUrl || null,
              sampleFormUrl: item?.sampleFormUrl || null,
            }))
          : [{ name: "", downloadFormUrl: null, sampleFormUrl: null }]
      );

      if (flat?.descImage) {
        setPreviewImage(buildUploadUrl(flat.descImage));
      }
    }
  }, [data, form]);

  // Clear messages
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccessMessage());
    };
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      message.success(successMessage);
      dispatch(clearSuccessMessage());
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Handlers
  const handleImageUpload = (file) => {
    setDescImage(file);
    setPreviewImage(URL.createObjectURL(file));
    return false;
  };

  const addChecklist = () => setChecklists([...checklists, ""]);
  const updateChecklist = (index, value) => {
    const newList = [...checklists];
    newList[index] = value;
    setChecklists(newList);
  };
  const removeChecklist = (index) => {
    if (checklists.length > 1) {
      setChecklists(checklists.filter((_, i) => i !== index));
    }
  };

  const addFormChecklist = () =>
    setFormChecklists([
      ...formChecklists,
      { name: "", downloadFormUrl: null, sampleFormUrl: null },
    ]);
  const updateFormChecklist = (index, field, value) => {
    const newList = [...formChecklists];
    newList[index][field] = value;
    setFormChecklists(newList);
  };
  const removeFormChecklist = (index) => {
    if (formChecklists.length > 1) {
      setFormChecklists(formChecklists.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formDataToSend = new FormData();
      const normalizedValues = {
        ...values,
        estimatedDays: values.estimatedDays || 1,
      };
      if ((values.taskMode || "assigned") === "default") {
        delete normalizedValues.estimatedDays;
      }

      Object.keys(normalizedValues).forEach((key) => {
        if (normalizedValues[key] !== undefined && normalizedValues[key] !== null) {
          formDataToSend.append(key, normalizedValues[key]);
        }
      });

      formDataToSend.append("type", "composite");
      formDataToSend.append("descpText", editorData.descp || "");
      formDataToSend.append("email_descp", editorData.email || "");
      formDataToSend.append("sms_descp", editorData.sms || "");
      formDataToSend.append("whatsapp_descp", editorData.whatsapp || "");

      checklists.forEach((item, index) => {
        if (item?.trim()) formDataToSend.append(`checklists[${index}]`, item);
      });

      formDataToSend.append(
        "formChecklists",
        JSON.stringify(
          formChecklists.map((item) => ({
            name: item.name,
            downloadFormUrl:
              item.downloadFormUrl instanceof File
                ? item.downloadFormUrl.name
                : item.downloadFormUrl || "",
            sampleFormUrl:
              item.sampleFormUrl instanceof File
                ? item.sampleFormUrl.name
                : item.sampleFormUrl || "",
          }))
        )
      );

      if (descImage) {
        formDataToSend.append("image", descImage);
      } else if (flat?.descImage) {
        formDataToSend.append("existingImage", flat.descImage);
      }

      const newDownloadIndices = [];
      const newSampleIndices = [];
      formChecklists.forEach((item, index) => {
        if (item.downloadFormUrl instanceof File) {
          newDownloadIndices.push(index);
          formDataToSend.append("downloadFormUrl", item.downloadFormUrl);
        }
        if (item.sampleFormUrl instanceof File) {
          newSampleIndices.push(index);
          formDataToSend.append("sampleFormUrl", item.sampleFormUrl);
        }
      });
      formDataToSend.append("newDownloadIndices", JSON.stringify(newDownloadIndices));
      formDataToSend.append("newSampleIndices", JSON.stringify(newSampleIndices));

      if (data) {
        await dispatch(
          updateCompositeTask({
            id: data?.task?._id,
            formData: formDataToSend,
          })
        ).unwrap();
        message.success("Task updated successfully");
      } else {
        await dispatch(createCompositeTask(formDataToSend)).unwrap();
        message.success("Task created successfully");
        form.resetFields();
        setEditorData({ descp: "", email: "", sms: "", whatsapp: "" });
        setChecklists([""]);
        setFormChecklists([{ name: "", downloadFormUrl: null, sampleFormUrl: null }]);
        setDescImage(null);
        setPreviewImage(null);
      }

      onSuccess?.();
    } catch (error) {
      message.error("Failed to save task: " + error.message);
    }
  };

  const priorityOptions = [
    { value: "low", label: "Low", color: "#52c41a" },
    { value: "medium", label: "Medium", color: "#1890ff" },
    { value: "high", label: "High", color: "#faad14" },
    { value: "urgent", label: "Urgent", color: "#ff4d4f" },
  ];

  const tabItems = [
    {
      key: "work",
      label: (
        <span style={{ fontWeight: 600 }}>
          <FileTextOutlined style={{ color: "#1890ff", fontSize: '16px' }} /> Work Description
        </span>
      ),
    },
    {
      key: "checklist",
      label: (
        <span style={{ fontWeight: 600 }}>
          <UnorderedListOutlined style={{ color: "#ff4d4f", fontSize: '16px' }} /> Checklist
        </span>
      ),
    },
    {
      key: "forms",
      label: (
        <span style={{ fontWeight: 600 }}>
          <DownloadOutlined style={{ color: "#52c41a", fontSize: '16px' }} /> Download Forms
        </span>
      ),
    },
    {
      key: "email",
      label: (
        <span style={{ fontWeight: 600 }}>
          <MailOutlined style={{ color: "#faad14", fontSize: '16px' }} /> Email
        </span>
      ),
    },
    {
      key: "whatsapp",
      label: (
        <span style={{ fontWeight: 600 }}>
          <WhatsAppOutlined style={{ color: "#25D366", fontSize: '16px' }} /> WhatsApp
        </span>
      ),
    },
  ];

  return (
    <div
      className="composite-task-shell custom-bold-form"
      style={{
        padding: "6px 16px 10px",
        background: "#fff",
        minHeight: "100vh",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <style>{`
        .custom-bold-form .ant-input,
        .custom-bold-form .ant-input-number,
        .custom-bold-form .ant-select .ant-select-selector,
        .custom-bold-form .ant-select-selector {
          border: 2px solid #000 !important;
          border-color: #000 !important;
          border-radius: 6px !important;
          font-family: 'Poppins', sans-serif !important;
        }
        .custom-bold-form .ant-input:focus,
        .custom-bold-form .ant-input-number:focus,
        .custom-bold-form .ant-select .ant-select-selector:focus,
        .custom-bold-form .ant-select-selector:focus,
        .custom-bold-form .ant-select-focused .ant-select-selector {
          border-color: #1890ff !important;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
        }
        .custom-bold-form .ant-tabs-nav-list {
          width: 100%;
          justify-content: space-around;
        }
        .custom-dropdown-style .ant-select-item-option-content {
          font-family: 'Poppins', sans-serif !important;
          font-size: 14px;
          text-transform: capitalize;
        }
        .custom-dropdown-style .ant-select-item-option-active .ant-select-item-option-content,
        .custom-dropdown-style .ant-select-item-option-selected .ant-select-item-option-content {
          font-weight: 600 !important;
          color: #1890ff;
        }
      `}</style>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Card
          bordered={false}
          style={{
            borderRadius: 14,
            boxShadow: "0 8px 24px rgba(13, 110, 253, 0.08)",
            border: "1px solid #dbeafe",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 8, textAlign: "center" }}>
            <Title level={3} style={{ margin: 0, fontWeight: 700, color: "#0d6efd" }}>
              {data ? "Edit Composite Task" : "Create Composite Task"}
            </Title>
            <Text type="secondary">
              {data
                ? "Update task details and configurations"
                : "Create new task template with all configurations"}
            </Text>
          </div>

          <Divider style={{ margin: "0 0 8px 0" }} />

          <Form
            form={form}
            className="compact-composite-form"
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              type: "composite",
              estimatedDays: 1,
              reward: "",
              templatePriority: "medium",
              taskMode: "assigned",
            }}
          >
            {/* Basic Information */}
            <Card
              size="small"
              title="Basic Information"
              style={{
                marginBottom: 8,
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                background: "#fff",
              }}
              styles={{ header: { borderBottom: "none", paddingBottom: 0 } }}
            >
              <Row gutter={[10, 0]}>
                <Col xs={24} md={4}>
                  <Form.Item name="cat" label="Financial Product" rules={[{ required: true, message: "Required" }]}>
                    <Select placeholder="Product" size="middle" allowClear popupClassName="custom-dropdown-style" onChange={() => form.setFieldValue("sub", undefined)}>
                      {products.map((product) => (<Option key={product._id} value={product._id}>{product.name}</Option>))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={4}>
                  <Form.Item name="sub" label="Company Name" rules={[{ required: true, message: "Required" }]}>
                    <Select placeholder="Company" size="middle" allowClear popupClassName="custom-dropdown-style">
                      {filteredCompanies.map((comp) => (<Option key={comp._id} value={comp.companyName}>{comp.companyName}</Option>))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={4}>
                  <Form.Item name="depart" label="Employee Role" rules={[{ required: true, message: "Required" }]}>
                    <Select placeholder="Role" size="middle" loading={loadingEmployeeTypes} allowClear popupClassName="custom-dropdown-style">
                      {employeeTypes.map((empType) => (<Option key={empType} value={empType}>{empType}</Option>))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={4}>
                  <Form.Item name="taskMode" label="Task Type">
                    <Select size="middle" popupClassName="custom-dropdown-style">
                      <Option value="assigned">Assigned Task</Option>
                      <Option value="default">Default Task</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={4}>
                  <Form.Item name="templatePriority" label="Priority">
                    <Select size="middle" popupClassName="custom-dropdown-style">
                      {priorityOptions.map((opt) => (
                        <Option key={opt.value} value={opt.value}>
                          <Tag color={opt.color} style={{ margin: 0 }}>{opt.label}</Tag>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={4}>
                  <Form.Item name="estimatedDays" label="Estimated Days">
                    <Input type="number" min={1} max={365} size="middle" prefix={<CalendarOutlined />} disabled={selectedTaskMode === "default"} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[10, 0]}>
                <Col xs={24} md={18}>
                  <Form.Item name="name" label="Task Name" rules={[{ required: true, message: "Required" }]}>
                    <Input placeholder="Enter a descriptive task name" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="reward" label="Reward" tooltip="Reward for completing before estimated days">
                    <Input placeholder="E.g. 500 / Voucher" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              {selectedTaskMode === "default" && (
                <Row gutter={[10, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item name="monthlyWindowFrom" label="Monthly Window From" rules={[{ required: true, message: "Required" }]}>
                      <Input type="number" min={1} max={31} size="middle" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="monthlyWindowTo" label="Monthly Window To" rules={[{ required: true, message: "Required" }]}>
                      <Input type="number" min={1} max={31} size="middle" />
                    </Form.Item>
                  </Col>
                </Row>
              )}
            </Card>

            {/* Tabs Section */}
            <Card
              size="small"
              style={{ borderRadius: 12, border: "1px solid #e5e7eb" }}
              styles={{ body: { padding: 0 } }}
            >
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                style={{ padding: "0 12px" }}
                tabBarStyle={{ marginBottom: 0 }}
              />

              <div style={{ padding: "8px 12px" }}>
                {/* Work Description Tab */}
                {activeTab === "work" && (
                  <Row gutter={[14, 0]} align="top">
                    <Col xs={24} md={16}>
                      <Text strong style={{ display: "block", marginBottom: 8, textAlign: "center" }}>
                        Detailed Description
                      </Text>
                      <div
                        style={{
                          border: "1px solid #d9d9d9",
                          borderRadius: 8,
                          overflow: "hidden",
                          minHeight: 200,
                        }}
                      >
                        <CKEditor
                          editor={ClassicEditor}
                          data={editorData.descp}
                          onChange={(event, editor) =>
                            setEditorData((prev) => ({
                              ...prev,
                              descp: editor.getData(),
                            }))
                          }
                        />
                      </div>
                    </Col>

                    <Col xs={24} md={8}>
                      <div
                        style={{
                          border: "1px solid #f0f0f0",
                          borderRadius: 10,
                          padding: 12,
                          background: "#f8fafc",
                        }}
                      >
                        <Text strong style={{ display: "block", marginBottom: 8 }}>
                          Attach Image
                        </Text>
                        <Upload
                          beforeUpload={handleImageUpload}
                          showUploadList={false}
                          accept="image/*"
                        >
                          <Button icon={<UploadOutlined />} block>
                            Upload Image
                          </Button>
                        </Upload>
                        {previewImage && (
                          <div style={{ marginTop: 10, textAlign: "center" }}>
                            <Image
                              src={previewImage}
                              alt="Preview"
                              width={140}
                              height={140}
                              style={{ objectFit: "cover", borderRadius: 8 }}
                            />
                            <Button
                              type="link"
                              danger
                              onClick={() => {
                                setDescImage(null);
                                setPreviewImage(null);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>
                )}

                {/* Checklist Tab */}
                {activeTab === "checklist" && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 10,
                      }}
                    >
                      <Text strong>Checklist Items</Text>
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={addChecklist}
                      >
                        Add Item
                      </Button>
                    </div>

                    <Space direction="vertical" style={{ width: "100%" }} size={8}>
                      {checklists.map((item, index) => (
                        <div key={index} style={{ display: "flex", gap: 8 }}>
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 8,
                              background: "#e2e8f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 600,
                              fontSize: 14,
                            }}
                          >
                            {index + 1}
                          </div>
                          <Input
                            placeholder={`Checklist item ${index + 1}`}
                            value={item}
                            onChange={(e) => updateChecklist(index, e.target.value)}
                            size="middle"
                            style={{ flex: 1 }}
                          />
                          {checklists.length > 1 && (
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => removeChecklist(index)}
                            />
                          )}
                        </div>
                      ))}
                    </Space>
                  </div>
                )}

                {/* Download Forms Tab */}
                {activeTab === "forms" && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 10,
                      }}
                    >
                      <Text strong>Form Checklists</Text>
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={addFormChecklist}
                      >
                        Add Form
                      </Button>
                    </div>

                    <Space direction="vertical" style={{ width: "100%" }} size={10}>
                      {formChecklists.map((item, index) => (
                        <Card
                          key={index}
                          size="small"
                          title={`Form #${index + 1}`}
                          extra={
                            formChecklists.length > 1 && (
                              <Button
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => removeFormChecklist(index)}
                              />
                            )
                          }
                          style={{ borderRadius: 12 }}
                        >
                          <Row gutter={[12, 10]}>
                            <Col xs={24}>
                              <Input
                                placeholder="Form Name"
                                value={item.name}
                                onChange={(e) =>
                                  updateFormChecklist(index, "name", e.target.value)
                                }
                              />
                            </Col>
                            <Col xs={24} md={12}>
                              <Text type="secondary">Blank Form</Text>
                              <Upload
                                beforeUpload={(file) => {
                                  updateFormChecklist(index, "downloadFormUrl", file);
                                  return false;
                                }}
                                showUploadList={false}
                              >
                                <Button
                                  block
                                  icon={<UploadOutlined />}
                                  style={{ marginTop: 6 }}
                                >
                                  {item.downloadFormUrl
                                    ? item.downloadFormUrl instanceof File
                                      ? item.downloadFormUrl.name
                                      : "Change File"
                                    : "Upload"}
                                </Button>
                              </Upload>
                              {item.downloadFormUrl &&
                                typeof item.downloadFormUrl === "string" && (
                                  <a
                                    href={buildUploadUrl(item.downloadFormUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: "block", marginTop: 6 }}
                                  >
                                    <Button icon={<EyeOutlined />} block>
                                      View
                                    </Button>
                                  </a>
                                )}
                            </Col>
                            <Col xs={24} md={12}>
                              <Text type="secondary">Sample Form</Text>
                              <Upload
                                beforeUpload={(file) => {
                                  updateFormChecklist(index, "sampleFormUrl", file);
                                  return false;
                                }}
                                showUploadList={false}
                              >
                                <Button
                                  block
                                  icon={<UploadOutlined />}
                                  style={{ marginTop: 6 }}
                                >
                                  {item.sampleFormUrl
                                    ? item.sampleFormUrl instanceof File
                                      ? item.sampleFormUrl.name
                                      : "Change File"
                                    : "Upload"}
                                </Button>
                              </Upload>
                              {item.sampleFormUrl &&
                                typeof item.sampleFormUrl === "string" && (
                                  <a
                                    href={buildUploadUrl(item.sampleFormUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: "block", marginTop: 6 }}
                                  >
                                    <Button icon={<EyeOutlined />} block>
                                      View
                                    </Button>
                                  </a>
                                )}
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </Space>
                  </div>
                )}

                {/* Email Tab */}
                {activeTab === "email" && (
                  <div>
                    <Text strong style={{ display: "block", marginBottom: 10 }}>
                      Email Template
                    </Text>
                    <div
                      style={{
                        border: "1px solid #d9d9d9",
                        borderRadius: 8,
                        overflow: "hidden",
                      }}
                    >
                      <CKEditor
                        editor={ClassicEditor}
                        data={editorData.email}
                        onChange={(event, editor) =>
                          setEditorData((prev) => ({
                            ...prev,
                            email: editor.getData(),
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                {/* WhatsApp Tab */}
                {activeTab === "whatsapp" && (
                  <div>
                    <Text strong style={{ display: "block", marginBottom: 10 }}>
                      WhatsApp Template
                    </Text>
                    <div
                      style={{
                        border: "1px solid #d9d9d9",
                        borderRadius: 8,
                        overflow: "hidden",
                      }}
                    >
                      <CKEditor
                        editor={ClassicEditor}
                        data={editorData.whatsapp}
                        onChange={(event, editor) =>
                          setEditorData((prev) => ({
                            ...prev,
                            whatsapp: editor.getData(),
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Submit Section */}
            <div
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTop: "1px solid #f0f0f0",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Space size={16}>
                <Button size="large" onClick={() => window.history.back()}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  {data ? "Update Task" : "Create Task"}
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </div>
      <style>{`
        .compact-composite-form .ant-form-item {
          margin-bottom: 10px;
        }
        .compact-composite-form .ant-form-item-label > label {
          font-weight: 600;
          font-size: 12px;
          color: #334155;
        }
        .compact-composite-form .ant-input,
        .compact-composite-form .ant-select-selector,
        .compact-composite-form .ant-input-number,
        .compact-composite-form .ant-picker {
          min-height: 32px !important;
        }
        .composite-task-shell .ant-tabs-tab {
          padding-top: 8px !important;
          padding-bottom: 8px !important;
        }
      `}</style>
    </div>
  );
};

export default Addtask;