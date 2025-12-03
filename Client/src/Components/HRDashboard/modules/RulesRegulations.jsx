// components/HRDashboard/modules/RulesRegulations.jsx
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
  Table,
  Pagination,
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
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEllipsisV,
  FaFileAlt,
  FaCopy,
  FaShareAlt,
} from "react-icons/fa";
import axios from "axios";

const RulesRegulations = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Table sorting and pagination
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "General Rules",
    version: "1.0",
    tags: "",
    uploadedBy: localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")).name
      : "Admin User",
  });

  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    category: "General Rules",
    version: "1.0",
    tags: "",
    isActive: true,
  });

  // Categories for dropdown
  const categories = [
    "General Rules",
    "HR Policies",
    "Company Policies",
    "Code of Conduct",
    "Compliance",
    "IT Policies",
    "Finance Policies",
    "Administration",
    "Other",
  ];

  // Fetch all rules documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/api/rules");
      console.log("✅ Rules API Response:", response.data);

      if (response.data.success) {
        setDocuments(response.data.data || []);
      } else {
        setError(response.data.message || "Failed to load documents");
        setDocuments([]);
      }
    } catch (error) {
      console.error("❌ Error fetching rules documents:", error);
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

    // Check file type
    if (file.type !== "application/pdf") {
      alert("❌ Only PDF files are allowed");
      e.target.value = "";
      setSelectedFile(null);
      return;
    }

    // Check file size (10MB limit)
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
      uploadData.append("version", formData.version);
      uploadData.append("tags", formData.tags);
      uploadData.append("uploadedBy", formData.uploadedBy);

      const response = await axios.post("/api/rules/upload", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        alert("✅ Document uploaded successfully!");
        setShowUploadModal(false);
        resetForm();
        fetchDocuments();
      } else {
        alert("❌ Error: " + (response.data.message || "Upload failed"));
      }
    } catch (error) {
      console.error("❌ Error uploading document:", error);
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
      // Create download link
      const baseURL = window.location.origin;
      const downloadUrl = `${baseURL}/api/rules/download/${documentId}`;

      // Open in new tab for download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = documentName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Refresh documents to update download count
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
      const viewUrl = `${baseURL}/api/rules/view/${documentId}`;
      window.open(viewUrl, "_blank");

      // Refresh documents to update download count
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
      const response = await axios.delete(`/api/rules/${documentToDelete._id}`);

      if (response.data.success) {
        alert("✅ Document deleted successfully!");
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
      version: document.version || "1.0",
      tags: document.tags ? document.tags.join(", ") : "",
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
        version: editFormData.version,
        tags: editFormData.tags,
        isActive: editFormData.isActive,
      };

      const response = await axios.put(
        `/rules/${editingDocument._id}`,
        updateData
      );

      if (response.data.success) {
        alert("✅ Document updated successfully!");
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
          `/api/rules/${documentId}/upload`,
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

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "General Rules",
      version: "1.0",
      tags: "",
      uploadedBy: localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")).name
        : "Admin User",
    });
    setSelectedFile(null);
    const fileInput = document.getElementById("documentFile");
    if (fileInput) fileInput.value = "";
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    if (bytes < 1024) return bytes + " Bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
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

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Sort documents
  const sortedDocuments = [...documents].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === "createdAt" || sortField === "updatedAt") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Filter documents
  const filteredDocuments = sortedDocuments.filter((doc) => {
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

    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

  // Get category badge color
  const getCategoryBadge = (category) => {
    const colors = {
      "General Rules": "primary",
      "HR Policies": "success",
      "Company Policies": "info",
      "Code of Conduct": "warning",
      Compliance: "danger",
      "IT Policies": "secondary",
      "Finance Policies": "dark",
      Administration: "light text-dark",
      Other: "secondary",
    };
    return colors[category] || "secondary";
  };

  // Sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="ms-1 opacity-50" />;
    return sortOrder === "asc" ? (
      <FaSortUp className="ms-1" />
    ) : (
      <FaSortDown className="ms-1" />
    );
  };

  if (loading) {
    return (
      <Container fluid className="p-0">
        <div className="mb-4">
          <h3 className="mb-2">Rules & Regulations</h3>
          <p className="text-muted">
            Manage company rules and regulations documents
          </p>
        </div>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading documents...</p>
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
            <h3 className="mb-2">Rules & Regulations</h3>
            <p className="text-muted">
              Upload and manage PDF documents for company rules and regulations
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowUploadModal(true)}>
            <FaUpload className="me-2" />
            Upload PDF
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
            <Col md={6}>
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
            <Col md={4}>
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
            <Col md={2}>
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

      {/* Documents Table */}
      <Card>
        <Card.Body className="p-0">
          <div className="p-4 border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">Rules Documents</h5>
                <p className="text-muted mb-0">
                  Showing {paginatedDocuments.length} of{" "}
                  {filteredDocuments.length} document(s)
                </p>
              </div>
              <div className="d-flex align-items-center gap-2">
                <small className="text-muted me-2">Sort by:</small>
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    {sortField === "title"
                      ? "Title"
                      : sortField === "createdAt"
                      ? "Date"
                      : sortField === "category"
                      ? "Category"
                      : "Sort"}
                    {getSortIcon(sortField)}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleSort("title")}>
                      Title{" "}
                      {sortField === "title" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSort("category")}>
                      Category{" "}
                      {sortField === "category" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSort("createdAt")}>
                      Date{" "}
                      {sortField === "createdAt" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="text-center py-5">
              <div className="h1 mb-3">📄</div>
              <h5 className="fw-medium text-dark mb-2">No documents found</h5>
              <p className="text-muted mb-0">
                {searchTerm || categoryFilter !== "All"
                  ? "Try changing your search or filter"
                  : "Upload your first rules document"}
              </p>
              <Button
                variant="primary"
                className="mt-3"
                onClick={() => setShowUploadModal(true)}
              >
                <FaUpload className="me-2" />
                Upload Document
              </Button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4 py-3">
                        <div
                          className="d-flex align-items-center cursor-pointer"
                          onClick={() => handleSort("title")}
                        >
                          Document {getSortIcon("title")}
                        </div>
                      </th>
                      <th className="py-3">
                        <div
                          className="d-flex align-items-center cursor-pointer"
                          onClick={() => handleSort("category")}
                        >
                          Category {getSortIcon("category")}
                        </div>
                      </th>
                      <th className="py-3">Description</th>
                      <th className="py-3">
                        <div
                          className="d-flex align-items-center cursor-pointer"
                          onClick={() => handleSort("createdAt")}
                        >
                          Date {getSortIcon("createdAt")}
                        </div>
                      </th>
                      <th className="py-3">Size</th>
                      <th className="py-3">Downloads</th>
                      <th className="pe-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDocuments.map((doc) => (
                      <tr key={doc._id} className="border-bottom">
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-light rounded-circle p-2 me-3">
                              <FaRegFilePdf size={16} className="text-danger" />
                            </div>
                            <div>
                              <div className="fw-semibold text-dark mb-1">
                                {doc.title}
                                {doc.version && (
                                  <small className="text-muted ms-2">
                                    v{doc.version}
                                  </small>
                                )}
                              </div>
                              {doc.tags && doc.tags.length > 0 && (
                                <div className="d-flex flex-wrap gap-1">
                                  {doc.tags.slice(0, 2).map((tag, idx) => (
                                    <small key={idx} className="text-muted">
                                      #{tag}
                                    </small>
                                  ))}
                                  {doc.tags.length > 2 && (
                                    <small className="text-muted">
                                      +{doc.tags.length - 2} more
                                    </small>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge bg={getCategoryBadge(doc.category)}>
                            {doc.category}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <div
                            className="text-muted small"
                            style={{ maxWidth: "200px" }}
                          >
                            {doc.description
                              ? doc.description.length > 60
                                ? doc.description.substring(0, 60) + "..."
                                : doc.description
                              : "-"}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="d-flex align-items-center gap-2">
                            <FaCalendarAlt size={12} className="text-muted" />
                            <span className="fw-medium">
                              {formatDate(doc.createdAt)}
                            </span>
                          </div>
                          <small className="text-muted">
                            by {doc.uploadedBy || "Admin"}
                          </small>
                        </td>
                        <td className="py-3">
                          <div className="fw-medium">
                            {formatFileSize(doc.fileSize)}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="d-flex align-items-center gap-1">
                            <FaDownload size={12} className="text-muted" />
                            <span>{doc.downloadCount || 0}</span>
                          </div>
                        </td>
                        <td className="pe-4 py-3">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: "32px", height: "32px" }}
                              onClick={() => handleViewDocument(doc._id)}
                              title="View in Browser"
                            >
                              <FaEye size={12} />
                            </Button>
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: "32px", height: "32px" }}
                              onClick={() =>
                                handleDownloadDocument(
                                  doc._id,
                                  doc.originalName
                                )
                              }
                              title="Download"
                            >
                              <FaDownload size={12} />
                            </Button>
                            <Dropdown>
                              <Dropdown.Toggle
                                variant="outline-secondary"
                                size="sm"
                                className="rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "32px", height: "32px" }}
                              >
                                <FaEllipsisV size={12} />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item
                                  onClick={() => handleEditDocument(doc)}
                                >
                                  <FaEdit className="me-2" />
                                  Edit Details
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() =>
                                    handleUpdateDocumentFile(doc._id)
                                  }
                                >
                                  <FaUpload className="me-2" />
                                  Update PDF File
                                </Dropdown.Item>
                                <Dropdown.Item>
                                  <FaCopy className="me-2" />
                                  Copy Link
                                </Dropdown.Item>
                                <Dropdown.Item>
                                  <FaShareAlt className="me-2" />
                                  Share
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item
                                  className="text-danger"
                                  onClick={() => {
                                    setDocumentToDelete(doc);
                                    setShowDeleteModal(true);
                                  }}
                                >
                                  <FaTrash className="me-2" />
                                  Delete Document
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-top">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-muted">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Pagination className="mb-0">
                      <Pagination.Prev
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      />
                      {[...Array(totalPages)].map((_, idx) => (
                        <Pagination.Item
                          key={idx + 1}
                          active={currentPage === idx + 1}
                          onClick={() => setCurrentPage(idx + 1)}
                        >
                          {idx + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                </div>
              )}
            </>
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
            Upload Rules Document
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Document Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter document title"
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
                    placeholder="Enter document description"
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
                  <Form.Label>Version</Form.Label>
                  <Form.Control
                    type="text"
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    placeholder="e.g., 1.0"
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
                    placeholder="e.g., policy, compliance, hr"
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
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
                    id="documentFile"
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
                  <FaRegFilePdf className="me-2 text-danger" />
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
              "Upload Document"
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
      >
        <Modal.Header closeButton={!updating}>
          <Modal.Title>Edit Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={editFormData.title}
                onChange={handleEditInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={editFormData.description}
                onChange={handleEditInputChange}
              />
            </Form.Group>

            <Row className="mb-3">
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
                  <Form.Label>Version</Form.Label>
                  <Form.Control
                    type="text"
                    name="version"
                    value={editFormData.version}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Tags (comma separated)</Form.Label>
              <Form.Control
                type="text"
                name="tags"
                value={editFormData.tags}
                onChange={handleEditInputChange}
                placeholder="e.g., policy, compliance, hr"
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              id="isActive"
              label="Active Document"
              name="isActive"
              checked={editFormData.isActive}
              onChange={handleEditInputChange}
              className="mb-3"
            />
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
              "Update Document"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
        .table th {
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          color: #6c757d;
        }
        .table td {
          vertical-align: middle;
        }
        .pagination {
          margin-bottom: 0;
        }
        .dropdown-menu {
          min-width: 180px;
        }
      `}</style>
    </Container>
  );
};

export default RulesRegulations;
