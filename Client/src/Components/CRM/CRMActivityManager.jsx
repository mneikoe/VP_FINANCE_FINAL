import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import {
  FaEdit,
  FaEye,
  FaPlus,
  FaSave,
  FaTimes,
  FaTrash,
  FaUpload,
} from "react-icons/fa";
import axiosInstance from "../../config/axios";

const emptyForm = {
  srNo: "",
  employeeType: "",
  financialProductId: "",
  companyId: "",
  financialProduct: "",
  companyName: "",
  activityName: "",
  modeOfActivities: "",
  modeOfWish: "",
  contentName: "",
  preparedBy: "",
  publishPlatform: "",
  totalExpenses: "",
  dateOfPublicity: "",
  placeWhereActivityDone: "",
  dateOfActivity: "",
  requiredMaterial: "",
  remark: "",
  activityDetails: "",
  upwardDownwardCopy: "",
};

const todayInputValue = () => new Date().toISOString().split("T")[0];

const dateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const CRMActivityManager = ({ activityType, title, subtitle, columns }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [editingRow, setEditingRow] = useState(null);
  const [deletingRow, setDeletingRow] = useState(null);
  const [uploadingRow, setUploadingRow] = useState(null);
  const [viewingRow, setViewingRow] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [financialProducts, setFinancialProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [masterDataMessage, setMasterDataMessage] = useState("");

  const formFields = useMemo(
    () => columns.filter((col) => col.key !== "actions"),
    [columns]
  );
  const filteredCompanies = useMemo(() => {
    if (!formData.financialProductId) return companies;
    return companies.filter((company) => {
      const fpId =
        typeof company.financialProduct === "object"
          ? company.financialProduct?._id
          : company.financialProduct;
      return String(fpId || "") === String(formData.financialProductId);
    });
  }, [companies, formData.financialProductId]);

  const nextSerialNo = useMemo(() => {
    if (!rows.length) return 1;
    return (
      rows.reduce((max, row) => Math.max(max, Number(row.srNo) || 0), 0) + 1
    );
  }, [rows]);

  const fetchMasterData = async () => {
    try {
      const [productsRes, companiesRes] = await Promise.all([
        axiosInstance.get("/api/FinancialProduct"),
        axiosInstance.get("/api/CompanyName"),
      ]);

      const normalizeList = (payload) => {
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.data)) return payload.data;
        if (Array.isArray(payload?.items)) return payload.items;
        if (Array.isArray(payload?.results)) return payload.results;
        return [];
      };

      const productsRaw = normalizeList(productsRes?.data);
      const companiesRaw = normalizeList(companiesRes?.data);

      const cleanedProducts = productsRaw.filter(
        (item) => item?._id && typeof item?.name === "string" && item.name.trim()
      );
      const cleanedCompanies = companiesRaw.filter(
        (item) =>
          item?._id &&
          typeof item?.companyName === "string" &&
          item.companyName.trim()
      );

      setFinancialProducts(cleanedProducts);
      setCompanies(cleanedCompanies);

      if (!cleanedProducts.length || !cleanedCompanies.length) {
        setMasterDataMessage(
          "Master data missing: Please add Financial Product and Company Name from Office masters first."
        );
      } else {
        setMasterDataMessage("");
      }
    } catch (err) {
      setMasterDataMessage(
        "Unable to load master data. Please refresh or check Financial Product/Company Name API."
      );
    }
  };

  const fetchRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/api/crm-activities", {
        params: { type: activityType },
      });
      setRows(res?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load CRM activity data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    fetchMasterData();
  }, [activityType]);

  const openCreateModal = () => {
    setEditingRow(null);
    setFormData({
      ...emptyForm,
      srNo: String(nextSerialNo),
      dateOfActivity: todayInputValue(),
      dateOfPublicity:
        activityType === "advertisement" ? todayInputValue() : "",
    });
    setShowEditModal(true);
  };

  const openEditModal = (row) => {
    setEditingRow(row);
    setFormData({
      ...emptyForm,
      ...row,
      financialProductId:
        typeof row.financialProductId === "object"
          ? row.financialProductId?._id || ""
          : row.financialProductId || "",
      companyId:
        typeof row.companyId === "object"
          ? row.companyId?._id || ""
          : row.companyId || "",
      dateOfPublicity: dateInputValue(row.dateOfPublicity),
      dateOfActivity: dateInputValue(row.dateOfActivity),
    });
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "financialProductId") {
        return {
          ...prev,
          financialProductId: value,
          companyId: "",
          companyName: "",
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const selectedProduct = financialProducts.find(
        (item) => String(item._id) === String(formData.financialProductId)
      );
      const selectedCompany = companies.find(
        (item) => String(item._id) === String(formData.companyId)
      );
      const payload = {
        ...formData,
        activityType,
        financialProduct: selectedProduct?.name || formData.financialProduct || "",
        companyName: selectedCompany?.companyName || formData.companyName || "",
      };
      if (editingRow?._id) {
        await axiosInstance.put(`/api/crm-activities/${editingRow._id}`, payload);
        setSuccess("Activity updated successfully.");
      } else {
        await axiosInstance.post("/api/crm-activities", payload);
        setSuccess("Activity created successfully.");
      }
      setShowEditModal(false);
      fetchRows();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save activity.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRow?._id) return;
    setSaving(true);
    try {
      await axiosInstance.delete(`/api/crm-activities/${deletingRow._id}`);
      setSuccess("Activity deleted successfully.");
      setShowDeleteModal(false);
      setDeletingRow(null);
      fetchRows();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete activity.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadingRow?._id || !uploadFile) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("attachment", uploadFile);
      await axiosInstance.patch(`/api/crm-activities/${uploadingRow._id}/upload`, fd);
      setSuccess("Attachment uploaded successfully.");
      setShowUploadModal(false);
      setUploadingRow(null);
      setUploadFile(null);
      fetchRows();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to upload attachment.");
    } finally {
      setSaving(false);
    }
  };

  const resolveAttachmentUrl = (path = "") => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${import.meta.env.VITE_API_URL || ""}${path}`;
  };

  const renderCell = (row, col) => {
    if (col.key === "actions") return null;
    const raw = row[col.key];
    if (!raw && raw !== 0) return "-";
    if (col.key === "financialProduct" && row.financialProductId?.name) {
      return row.financialProductId.name;
    }
    if (col.key === "companyName" && row.companyId?.companyName) {
      return row.companyId.companyName;
    }
    if (col.type === "date") return new Date(raw).toLocaleDateString("en-IN");
    return raw;
  };

  return (
    <div className="crm-activity-shell">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
        <div>
          <h5 className="crm-title mb-0">{title}</h5>
          <small className="text-muted">{subtitle}</small>
        </div>
        <Button
          size="sm"
          className="d-flex align-items-center gap-1"
          onClick={openCreateModal}
          title="Add New Activity"
        >
          <FaPlus />
          Add
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="py-1 px-2 mb-2">
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          variant="success"
          className="py-1 px-2 mb-2"
          onClose={() => setSuccess("")}
          dismissible
        >
          {success}
        </Alert>
      )}
      {masterDataMessage && (
        <Alert variant="warning" className="py-1 px-2 mb-2">
          {masterDataMessage}
        </Alert>
      )}

      <div className="table-responsive crm-table-wrap">
        <Table bordered hover size="sm" className="mb-0 crm-activity-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  <Spinner animation="border" size="sm" className="me-2" />
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4 text-muted">
                  No records found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row._id}>
                  {columns.map((col) =>
                    col.key !== "actions" ? (
                      <td key={col.key}>{renderCell(row, col)}</td>
                    ) : (
                      <td key="actions">
                        <div className="d-flex align-items-center gap-1 flex-wrap">
                          <Button
                            size="sm"
                            variant="light"
                            className="icon-btn text-primary"
                            title="Upload Attachment"
                            onClick={() => {
                              setUploadingRow(row);
                              setShowUploadModal(true);
                            }}
                          >
                            <FaUpload />
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            className="icon-btn text-success"
                            title="View Attachment"
                            onClick={() => {
                              setViewingRow(row);
                              setShowViewModal(true);
                            }}
                          >
                            <FaEye />
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            className="icon-btn text-warning"
                            title="Edit Row"
                            onClick={() => openEditModal(row)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            className="icon-btn text-danger"
                            title="Delete Row"
                            onClick={() => {
                              setDeletingRow(row);
                              setShowDeleteModal(true);
                            }}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    )
                  )}
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingRow ? "Edit Activity" : "Add Activity"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-2">
            {formFields.map((field) => (
              <Col key={field.key} md={6}>
                <Form.Group>
                  <Form.Label className="small mb-1">{field.label}</Form.Label>
                  {field.key === "financialProduct" ? (
                    <Form.Select
                      name="financialProductId"
                      value={formData.financialProductId || ""}
                      onChange={handleInputChange}
                      size="sm"
                      disabled={!financialProducts.length}
                    >
                      <option value="">Select Financial Product</option>
                      {financialProducts.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))}
                    </Form.Select>
                  ) : field.key === "companyName" ? (
                    <Form.Select
                      name="companyId"
                      value={formData.companyId || ""}
                      onChange={handleInputChange}
                      size="sm"
                      disabled={!filteredCompanies.length}
                    >
                      <option value="">Select Company Name</option>
                      {filteredCompanies.map((company) => (
                        <option key={company._id} value={company._id}>
                          {company.companyName}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <Form.Control
                      name={field.key}
                      type={
                        field.type === "number"
                          ? "number"
                          : field.type === "date"
                            ? "date"
                            : "text"
                      }
                      value={formData[field.key] ?? ""}
                      onChange={handleInputChange}
                      size="sm"
                      readOnly={field.key === "srNo"}
                    />
                  )}
                </Form.Group>
              </Col>
            ))}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowEditModal(false)}>
            <FaTimes className="me-1" />
            Close
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            <FaSave className="me-1" />
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload Attachment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="small">Select file</Form.Label>
            <Form.Control
              type="file"
              size="sm"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowUploadModal(false)}>
            Close
          </Button>
          <Button variant="primary" size="sm" onClick={handleUpload} disabled={!uploadFile || saving}>
            Upload
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>View Attachment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewingRow?.attachmentPath ? (
            <div className="text-center">
              <a
                href={resolveAttachmentUrl(viewingRow.attachmentPath)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline-primary"
              >
                Open Attachment
              </a>
            </div>
          ) : (
            <p className="text-muted mb-0">No attachment uploaded.</p>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Activity</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this activity?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={saving}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .crm-activity-shell {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px;
        }
        .crm-title {
          color: #0d6efd;
          font-weight: 700;
        }
        .crm-table-wrap {
          max-width: 100%;
        }
        .crm-activity-table {
          font-size: 0.76rem;
          background: #fff;
          table-layout: fixed;
        }
        .crm-activity-table th {
          background: #facc15;
          color: #111827;
          font-size: 0.74rem;
          white-space: normal;
        }
        .crm-activity-table td {
          vertical-align: middle;
          word-break: break-word;
          white-space: normal;
        }
        .crm-activity-table th:last-child,
        .crm-activity-table td:last-child {
          width: 132px;
        }
        .icon-btn {
          border: 1px solid #e5e7eb;
          padding: 0.18rem 0.32rem;
        }
      `}</style>
    </div>
  );
};

export default CRMActivityManager;
