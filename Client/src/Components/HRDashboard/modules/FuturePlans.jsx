// components/HRDashboard/modules/FuturePlans.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Modal,
  Form,
  Alert,
  Badge,
  Spinner,
  InputGroup,
  FormControl,
  Dropdown,
} from "react-bootstrap";
import {
  FaFilePdf,
  FaDownload,
  FaTrash,
  FaPlus,
  FaEye,
  FaUpload,
  FaRegFilePdf,
  FaCalendarAlt,
  FaTag,
  FaEdit,
  FaSearch,
  FaFilter,
  FaSync,
  FaInfoCircle,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChartLine,
  FaLock,
  FaLockOpen,
} from "react-icons/fa";
import axios from "axios";

const FuturePlans = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approving, setApproving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Vision & Mission",
    strategicArea: "Medium Term (3-5 years)",
    priority: "Medium",
    confidentialLevel: "Internal",
    targetYear: new Date().getFullYear() + 1,
    tags: "",
    approvalStatus: "Pending",
    uploadedBy: localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")).name
      : "Admin User",
  });

  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    category: "Vision & Mission",
    strategicArea: "Medium Term (3-5 years)",
    priority: "Medium",
    confidentialLevel: "Internal",
    targetYear: new Date().getFullYear() + 1,
    tags: "",
    approvalStatus: "Pending",
    isActive: true,
  });

  const [approveFormData, setApproveFormData] = useState({
    status: "Approved",
    approvedBy: localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")).name
      : "Director",
    comments: "",
  });

  // Categories
  const categories = [
    "Vision & Mission",
    "Business Expansion",
    "Technology Roadmap",
    "Marketing Strategy",
    "Financial Planning",
    "HR Development",
    "Operations",
    "Research & Development",
    "Sustainability",
    "Other",
  ];

  const strategicAreas = [
    "Short Term (1-2 years)",
    "Medium Term (3-5 years)",
    "Long Term (5+ years)",
    "Immediate (0-1 year)",
  ];

  const priorities = ["High", "Medium", "Low"];
  const confidentialLevels = [
    "Public",
    "Internal",
    "Confidential",
    "Restricted",
  ];
  const approvalStatuses = ["Pending", "Approved", "Rejected", "Under Review"];

  // Fetch all future plans
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/api/future-plans");
      console.log("✅ Future Plans API Response:", response.data);

      if (response.data.success) {
        setDocuments(response.data.data || []);
      } else {
        setError(response.data.message || "Failed to load documents");
        setDocuments([]);
      }
    } catch (error) {
      console.error("❌ Error fetching future plans:", error);
      setError(
        error.response?.data?.message ||
          "Failed to load documents. Please try again."
      );
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("❌ Only PDF files are allowed");
      e.target.value = "";
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("❌ File size should be less than 10MB");
      e.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle approve form input changes
  const handleApproveInputChange = (e) => {
    const { name, value } = e.target;
    setApproveFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Upload new document
  const handleUploadDocument = async () => {
    if (!selectedFile) {
      alert("Please select a PDF file to upload");
      return;
    }

    if (!formData.title.trim()) {
      alert("Please enter document title");
      return;
    }

    setUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append("document", selectedFile);
      uploadData.append("title", formData.title);
      uploadData.append("description", formData.description || "");
      uploadData.append("category", formData.category);
      uploadData.append("strategicArea", formData.strategicArea);
      uploadData.append("priority", formData.priority);
      uploadData.append("confidentialLevel", formData.confidentialLevel);
      uploadData.append("targetYear", formData.targetYear);
      uploadData.append("tags", formData.tags);
      uploadData.append("approvalStatus", formData.approvalStatus);
      uploadData.append("uploadedBy", formData.uploadedBy);

      const response = await axios.post(
        "/api/future-plans/upload",
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        alert("✅ Future Plan uploaded successfully!");
        setShowUploadModal(false);
        resetForm();
        fetchDocuments();
      } else {
        alert("❌ Error: " + (response.data.message || "Upload failed"));
      }
    } catch (error) {
      console.error("❌ Error uploading future plan:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to upload document";
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setUploading(false);
    }
  };

  // Download document
  const handleDownloadDocument = async (documentId, documentName) => {
    try {
      const baseURL = window.location.origin;
      const downloadUrl = `${baseURL}/api/future-plans/download/${documentId}`;

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = documentName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        fetchDocuments();
      }, 1000);
    } catch (error) {
      console.error("❌ Error downloading document:", error);
      alert("Failed to download document");
    }
  };

  // View document in browser
  const handleViewDocument = async (documentId) => {
    try {
      const baseURL = window.location.origin;
      const viewUrl = `${baseURL}/api/future-plans/view/${documentId}`;
      window.open(viewUrl, "_blank");

      setTimeout(() => {
        fetchDocuments();
      }, 1000);
    } catch (error) {
      console.error("❌ Error viewing document:", error);
      alert("Failed to view document");
    }
  };

  // Delete document
  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    setDeleting(true);

    try {
      const response = await axios.delete(
        `/api/future-plans/${documentToDelete._id}`
      );

      if (response.data.success) {
        alert("✅ Future Plan deleted successfully!");
        setShowDeleteModal(false);
        setDocumentToDelete(null);
        fetchDocuments();
      } else {
        alert("❌ Error: " + (response.data.message || "Delete failed"));
      }
    } catch (error) {
      console.error("❌ Error deleting document:", error);
      alert("Failed to delete document");
    } finally {
      setDeleting(false);
    }
  };

  // Open edit modal
  const handleEditDocument = (document) => {
    setEditingDocument(document);
    setEditFormData({
      title: document.title,
      description: document.description || "",
      category: document.category,
      strategicArea: document.strategicArea || "Medium Term (3-5 years)",
      priority: document.priority || "Medium",
      confidentialLevel: document.confidentialLevel || "Internal",
      targetYear: document.targetYear || new Date().getFullYear() + 1,
      tags: document.tags ? document.tags.join(", ") : "",
      approvalStatus: document.approvalStatus || "Pending",
      isActive: document.isActive,
    });
    setShowEditModal(true);
  };

  // Update document
  const handleUpdateDocument = async () => {
    if (!editingDocument) return;

    setUpdating(true);

    try {
      const updateData = {
        title: editFormData.title,
        description: editFormData.description,
        category: editFormData.category,
        strategicArea: editFormData.strategicArea,
        priority: editFormData.priority,
        confidentialLevel: editFormData.confidentialLevel,
        targetYear: editFormData.targetYear,
        tags: editFormData.tags,
        approvalStatus: editFormData.approvalStatus,
        isActive: editFormData.isActive,
      };

      const response = await axios.put(
        `/api/future-plans/${editingDocument._id}`,
        updateData
      );

      if (response.data.success) {
        alert("✅ Future Plan updated successfully!");
        setShowEditModal(false);
        setEditingDocument(null);
        fetchDocuments();
      } else {
        alert("❌ Error: " + (response.data.message || "Update failed"));
      }
    } catch (error) {
      console.error("❌ Error updating document:", error);
      alert("Failed to update document");
    } finally {
      setUpdating(false);
    }
  };

  // Update document with new file
  const handleUpdateDocumentFile = async (documentId) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf";
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        alert("❌ Only PDF files are allowed");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("❌ File size should be less than 10MB");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("document", file);

        const response = await axios.put(
          `/api/future-plans/${documentId}/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.success) {
          alert("✅ Document file updated successfully!");
          fetchDocuments();
        }
      } catch (error) {
        console.error("❌ Error updating document file:", error);
        alert("Failed to update document file");
      }
    };
    fileInput.click();
  };

  // Open approve modal
  const handleApproveDocument = (document) => {
    setEditingDocument(document);
    setApproveFormData({
      status: "Approved",
      approvedBy: localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")).name
        : "Director",
      comments: "",
    });
    setShowApproveModal(true);
  };

  // Update approval status
  const handleUpdateApproval = async () => {
    if (!editingDocument) return;

    setApproving(true);

    try {
      const response = await axios.patch(
        `/api/future-plans/${editingDocument._id}/approve`,
        approveFormData
      );

      if (response.data.success) {
        alert(
          `✅ Future Plan ${approveFormData.status.toLowerCase()} successfully!`
        );
        setShowApproveModal(false);
        setEditingDocument(null);
        fetchDocuments();
      } else {
        alert("❌ Error: " + (response.data.message || "Approval failed"));
      }
    } catch (error) {
      console.error("❌ Error updating approval:", error);
      alert("Failed to update approval status");
    } finally {
      setApproving(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "Vision & Mission",
      strategicArea: "Medium Term (3-5 years)",
      priority: "Medium",
      confidentialLevel: "Internal",
      targetYear: new Date().getFullYear() + 1,
      tags: "",
      approvalStatus: "Pending",
      uploadedBy: localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")).name
        : "Admin User",
    });
    setSelectedFile(null);
    const fileInput = document.getElementById("futurePlanFile");
    if (fileInput) fileInput.value = "";
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    if (bytes < 1024) return bytes + " Bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / 1048576).toFixed(2) + " MB";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description &&
        doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.tags &&
        doc.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ));

    const matchesCategory =
      categoryFilter === "All" || doc.category === categoryFilter;
    const matchesStatus =
      statusFilter === "All" || doc.approvalStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get category badge color
  const getCategoryBadge = (category) => {
    const colors = {
      "Vision & Mission": "primary",
      "Business Expansion": "success",
      "Technology Roadmap": "info",
      "Marketing Strategy": "warning",
      "Financial Planning": "danger",
      "HR Development": "secondary",
      Operations: "dark",
      "Research & Development": "light text-dark",
      Sustainability: "success",
      Other: "secondary",
    };
    return colors[category] || "secondary";
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const colors = {
      Pending: "warning",
      Approved: "success",
      Rejected: "danger",
      "Under Review": "info",
    };
    return colors[status] || "secondary";
  };

  // Get priority badge color
  const getPriorityBadge = (priority) => {
    const colors = {
      High: "danger",
      Medium: "warning",
      Low: "success",
    };
    return colors[priority] || "secondary";
  };

  // Get confidentiality icon
  const getConfidentialityIcon = (level) => {
    switch (level) {
      case "Public":
        return <FaLockOpen className="text-success" />;
      case "Internal":
        return <FaLock className="text-info" />;
      case "Confidential":
        return <FaLock className="text-warning" />;
      case "Restricted":
        return <FaLock className="text-danger" />;
      default:
        return <FaLock className="text-secondary" />;
    }
  };

  if (loading) {
    return (
      <Container fluid className="p-0">
        <div className="mb-4">
          <h3 className="mb-2">Future Plans of Director</h3>
          <p className="text-muted">
            Manage director's future plans and strategic documents
          </p>
        </div>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading future plans...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-0">
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h3 className="mb-2">Future Plans of Director</h3>
            <p className="text-muted">
              Upload and manage strategic PDF documents containing director's
              future plans
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowUploadModal(true)}>
            <FaUpload className="me-2" />
            Upload Plan
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="warning" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <span>
              <FaInfoCircle className="me-2" />
              {error}
            </span>
            <Button
              variant="outline-warning"
              size="sm"
              onClick={fetchDocuments}
            >
              <FaSync />
            </Button>
          </div>
        </Alert>
      )}

      {/* Search and Filter Bar */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text>
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text>
                  <FaChartLine />
                </InputGroup.Text>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  {approvalStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={1}>
              <Button
                variant="outline-primary"
                className="w-100"
                onClick={fetchDocuments}
                title="Refresh"
              >
                <FaSync />
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Documents Grid */}
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="mb-1">Director's Future Plans</h5>
              <p className="text-muted mb-0">
                {filteredDocuments.length} document(s) found
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={fetchDocuments}
                title="Refresh"
              >
                <FaSync />
              </Button>
            </div>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="text-center py-5">
              <div className="h1 mb-3">🎯</div>
              <h5 className="fw-medium text-dark mb-2">
                No future plans found
              </h5>
              <p className="text-muted mb-0">
                {searchTerm ||
                categoryFilter !== "All" ||
                statusFilter !== "All"
                  ? "Try changing your search or filter"
                  : "Upload your first future plan document"}
              </p>
            </div>
          ) : (
            <Row>
              {filteredDocuments.map((doc) => (
                <Col md={6} lg={4} key={doc._id} className="mb-4">
                  <Card className="h-100 border">
                    <Card.Body className="d-flex flex-column">
                      {/* Document Header */}
                      <div className="d-flex align-items-start mb-3">
                        <div className="bg-light p-3 rounded me-3">
                          <FaRegFilePdf size={24} className="text-primary" />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 text-truncate" title={doc.title}>
                            {doc.title}
                          </h6>
                          <div className="d-flex flex-wrap gap-1 mb-2">
                            <Badge bg={getCategoryBadge(doc.category)}>
                              {doc.category}
                            </Badge>
                            <Badge bg={getStatusBadge(doc.approvalStatus)}>
                              {doc.approvalStatus}
                            </Badge>
                            <Badge bg={getPriorityBadge(doc.priority)}>
                              {doc.priority}
                            </Badge>
                          </div>
                          <small className="text-muted d-block">
                            <FaCalendarAlt className="me-1" />
                            {formatDate(doc.createdAt)}
                            {doc.targetYear && ` • Target: ${doc.targetYear}`}
                          </small>
                        </div>
                      </div>

                      {/* Document Info */}
                      <div className="mb-3">
                        {doc.description && (
                          <p
                            className="text-muted small mb-2"
                            style={{ fontSize: "0.85rem" }}
                          >
                            {doc.description.length > 80
                              ? doc.description.substring(0, 80) + "..."
                              : doc.description}
                          </p>
                        )}
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          <small className="text-muted">
                            <FaChartLine className="me-1" />
                            {doc.strategicArea}
                          </small>
                          <small className="text-muted">
                            {getConfidentialityIcon(doc.confidentialLevel)}
                            <span className="ms-1">
                              {doc.confidentialLevel}
                            </span>
                          </small>
                        </div>
                        <div className="d-flex justify-content-between small text-muted">
                          <span>
                            <FaFilePdf className="me-1" />
                            {formatFileSize(doc.fileSize)}
                          </span>
                          <span>
                            <FaDownload className="me-1" />
                            {doc.downloadCount || 0} downloads
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-flex justify-content-between mt-auto">
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewDocument(doc._id)}
                            title="View in Browser"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() =>
                              handleDownloadDocument(doc._id, doc.originalName)
                            }
                            title="Download"
                          >
                            <FaDownload />
                          </Button>
                        </div>
                        <div className="d-flex gap-2">
                          <Dropdown>
                            <Dropdown.Toggle
                              variant="outline-secondary"
                              size="sm"
                            >
                              <FaEdit />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item
                                onClick={() => handleEditDocument(doc)}
                              >
                                Edit Details
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() =>
                                  handleUpdateDocumentFile(doc._id)
                                }
                              >
                                Update PDF File
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => handleApproveDocument(doc)}
                              >
                                Update Approval Status
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item
                                className="text-danger"
                                onClick={() => {
                                  setDocumentToDelete(doc);
                                  setShowDeleteModal(true);
                                }}
                              >
                                Delete Document
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Upload Modal */}
      <Modal
        show={showUploadModal}
        onHide={() => !uploading && setShowUploadModal(false)}
        size="lg"
      >
        <Modal.Header closeButton={!uploading}>
          <Modal.Title>
            <FaUpload className="me-2" />
            Upload Future Plan
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Plan Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter future plan title"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter detailed description of the future plan"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Strategic Area *</Form.Label>
                  <Form.Select
                    name="strategicArea"
                    value={formData.strategicArea}
                    onChange={handleInputChange}
                    required
                  >
                    {strategicAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Confidentiality</Form.Label>
                  <Form.Select
                    name="confidentialLevel"
                    value={formData.confidentialLevel}
                    onChange={handleInputChange}
                  >
                    {confidentialLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Target Year</Form.Label>
                  <Form.Control
                    type="number"
                    name="targetYear"
                    value={formData.targetYear}
                    onChange={handleInputChange}
                    min="2024"
                    max="2050"
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Tags (comma separated)</Form.Label>
                  <Form.Control
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g., strategy, expansion, technology"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Approval Status</Form.Label>
                  <Form.Select
                    name="approvalStatus"
                    value={formData.approvalStatus}
                    onChange={handleInputChange}
                  >
                    {approvalStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Uploaded By</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaUser />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="uploadedBy"
                      value={formData.uploadedBy}
                      onChange={handleInputChange}
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>PDF Document *</Form.Label>
                  <Form.Control
                    id="futurePlanFile"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    required
                  />
                  <Form.Text className="text-muted">
                    Only PDF files allowed. Maximum file size: 10MB
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {selectedFile && (
              <Alert variant="info" className="mt-3">
                <div className="d-flex align-items-center">
                  <FaRegFilePdf className="me-2 text-primary" />
                  <div>
                    <strong>Selected File:</strong> {selectedFile.name}
                    <br />
                    <small>Size: {formatFileSize(selectedFile.size)}</small>
                  </div>
                </div>
              </Alert>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowUploadModal(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUploadDocument}
            disabled={uploading || !selectedFile}
          >
            {uploading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Uploading...
              </>
            ) : (
              "Upload Plan"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => !deleting && setShowDeleteModal(false)}
      >
        <Modal.Header closeButton={!deleting}>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{documentToDelete?.title}"?
          <br />
          <small className="text-danger">
            This action cannot be undone. The PDF file will also be deleted from
            the server.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteDocument}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Document Modal */}
      <Modal
        show={showEditModal}
        onHide={() => !updating && setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton={!updating}>
          <Modal.Title>Edit Future Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditInputChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditInputChange}
                    required
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Strategic Area</Form.Label>
                  <Form.Select
                    name="strategicArea"
                    value={editFormData.strategicArea}
                    onChange={handleEditInputChange}
                  >
                    {strategicAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    name="priority"
                    value={editFormData.priority}
                    onChange={handleEditInputChange}
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Confidentiality</Form.Label>
                  <Form.Select
                    name="confidentialLevel"
                    value={editFormData.confidentialLevel}
                    onChange={handleEditInputChange}
                  >
                    {confidentialLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Target Year</Form.Label>
                  <Form.Control
                    type="number"
                    name="targetYear"
                    value={editFormData.targetYear}
                    onChange={handleEditInputChange}
                    min="2024"
                    max="2050"
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Tags (comma separated)</Form.Label>
                  <Form.Control
                    type="text"
                    name="tags"
                    value={editFormData.tags}
                    onChange={handleEditInputChange}
                    placeholder="e.g., strategy, expansion, technology"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Approval Status</Form.Label>
                  <Form.Select
                    name="approvalStatus"
                    value={editFormData.approvalStatus}
                    onChange={handleEditInputChange}
                  >
                    {approvalStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mt-4">
                  <Form.Check
                    type="checkbox"
                    id="isActive"
                    label="Active Document"
                    name="isActive"
                    checked={editFormData.isActive}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEditModal(false)}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateDocument}
            disabled={updating}
          >
            {updating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              "Update Plan"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Approve Document Modal */}
      <Modal
        show={showApproveModal}
        onHide={() => !approving && setShowApproveModal(false)}
      >
        <Modal.Header closeButton={!approving}>
          <Modal.Title>Update Approval Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Approval Status *</Form.Label>
              <Form.Select
                name="status"
                value={approveFormData.status}
                onChange={handleApproveInputChange}
                required
              >
                {approvalStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Approved By *</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FaUser />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  name="approvedBy"
                  value={approveFormData.approvedBy}
                  onChange={handleApproveInputChange}
                  required
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Comments (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="comments"
                value={approveFormData.comments}
                onChange={handleApproveInputChange}
                placeholder="Enter approval comments..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowApproveModal(false)}
            disabled={approving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateApproval}
            disabled={approving}
          >
            {approving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FuturePlans;
