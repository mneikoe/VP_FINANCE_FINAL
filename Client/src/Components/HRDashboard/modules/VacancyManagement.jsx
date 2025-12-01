import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaFileAlt,
  FaDownload,
  FaEye,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaLink,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaCheckCircle,
  FaTimesCircle,
  FaPauseCircle,
  FaEllipsisH,
  FaPlus,
  FaSearch,
  FaFilter,
  FaSort,
} from "react-icons/fa";

const VacancyManagement = () => {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [formData, setFormData] = useState({
    vacancy: "",
    date: new Date().toISOString().split("T")[0],
    platform: [],
    description: "",
    document: null,
  });

  const [editFormData, setEditFormData] = useState({
    vacancy: "",
    date: "",
    platform: [],
    description: "",
    status: "Active",
    document: null,
  });

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/api/vacancynotice");
      console.log("✅ Vacancies API Response:", response.data);
      setVacancies(response.data.vacancies || []);
    } catch (error) {
      console.error("❌ Error fetching vacancies:", error);
      setError("Failed to load vacancies. Please try again.");
      setVacancies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vacancy.trim()) {
      alert("Please enter vacancy designation");
      return;
    }

    if (formData.platform.length === 0) {
      alert("Please select at least one platform");
      return;
    }

    if (!formData.document) {
      alert("Please upload a document");
      return;
    }

    setSubmitLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("vacancy", formData.vacancy);
      submitData.append("designation", formData.vacancy);
      submitData.append("date", formData.date);
      submitData.append("platform", formData.platform.join(", "));
      submitData.append("description", formData.description || "");
      submitData.append("document", formData.document);

      const response = await axios.post("/api/vacancynotice", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        alert("✅ Vacancy created successfully!");
        setShowForm(false);
        fetchVacancies();
        resetForm();
      } else {
        alert("❌ Error: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("❌ Error creating vacancy:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to create vacancy";
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdateStatus = async (vacancyId, newStatus) => {
    if (
      !window.confirm(`Are you sure you want to change status to ${newStatus}?`)
    ) {
      return;
    }

    try {
      const response = await axios.put(
        `/api/vacancynotice/${vacancyId}/status`,
        {
          status: newStatus,
          closingDate:
            newStatus === "Closed"
              ? new Date().toISOString().split("T")[0]
              : null,
        }
      );

      if (response.data.success) {
        alert(`✅ Status updated to ${newStatus}`);
        fetchVacancies();
      }
    } catch (error) {
      console.error("❌ Error updating status:", error);
      alert("❌ Failed to update status");
    }
  };

  const handleViewDocument = async (vacancyId) => {
    try {
      setSelectedVacancy(vacancies.find((v) => v._id === vacancyId));

      const response = await axios.get(
        `/api/vacancynotice/${vacancyId}/document-info`
      );
      if (response.data.success) {
        setDocumentInfo(response.data.documentInfo);
        setShowDocumentModal(true);
      }
    } catch (error) {
      console.error("❌ Error fetching document info:", error);
      alert("❌ Failed to load document information");
    }
  };

  const handleDownloadDocument = (filename) => {
    window.open(`/api/vacancynotice/documents/${filename}`, "_blank");
  };

  const handleViewDocumentInBrowser = (filename) => {
    window.open(`/api/vacancynotice/documents/${filename}?view=true`, "_blank");
  };

  const handleEditVacancy = (vacancy) => {
    setSelectedVacancy(vacancy);
    setEditFormData({
      vacancy: vacancy.designation,
      date: new Date(vacancy.createdDate).toISOString().split("T")[0],
      platform: vacancy.publishPlatform || [],
      description: vacancy.description || "",
      status: vacancy.status,
      document: null,
    });
    setShowEditModal(true);
  };

  const handleUpdateVacancy = async (e) => {
    e.preventDefault();

    if (!editFormData.vacancy.trim()) {
      alert("Please enter vacancy designation");
      return;
    }

    if (editFormData.platform.length === 0) {
      alert("Please select at least one platform");
      return;
    }

    setEditLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("vacancy", editFormData.vacancy);
      submitData.append("designation", editFormData.vacancy);
      submitData.append("date", editFormData.date);
      submitData.append("platform", editFormData.platform.join(", "));
      submitData.append("description", editFormData.description || "");
      submitData.append("status", editFormData.status);

      if (editFormData.document) {
        submitData.append("document", editFormData.document);
      }

      const response = await axios.put(
        `/api/vacancynotice/${selectedVacancy._id}`,
        submitData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        alert("✅ Vacancy updated successfully!");
        setShowEditModal(false);
        fetchVacancies();
        setEditFormData({
          vacancy: "",
          date: "",
          platform: [],
          description: "",
          status: "Active",
          document: null,
        });
      }
    } catch (error) {
      console.error("❌ Error updating vacancy:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to update vacancy";
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteVacancy = async (vacancyId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this vacancy? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await axios.delete(`/api/vacancynotice/${vacancyId}`);

      if (response.data.success) {
        alert("✅ Vacancy deleted successfully!");
        fetchVacancies();
      }
    } catch (error) {
      console.error("❌ Error deleting vacancy:", error);
      alert("❌ Failed to delete vacancy");
    }
  };

  const resetForm = () => {
    setFormData({
      vacancy: "",
      date: new Date().toISOString().split("T")[0],
      platform: [],
      description: "",
      document: null,
    });
    const fileInput = document.getElementById("documentUpload");
    if (fileInput) fileInput.value = "";
  };

  const resetEditForm = () => {
    setEditFormData({
      vacancy: "",
      date: "",
      platform: [],
      description: "",
      status: "Active",
      document: null,
    });
    const fileInput = document.getElementById("editDocumentUpload");
    if (fileInput) fileInput.value = "";
  };

  const handleFileChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      alert("❌ Please upload PDF, DOC, DOCX, JPG, or PNG files only");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("❌ File size should be less than 10MB");
      e.target.value = "";
      return;
    }

    if (isEdit) {
      setEditFormData((prev) => ({ ...prev, document: file }));
    } else {
      setFormData((prev) => ({ ...prev, document: file }));
    }
  };

  const handlePlatformChange = (e, isEdit = false) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    if (isEdit) {
      setEditFormData((prev) => ({ ...prev, platform: selectedOptions }));
    } else {
      setFormData((prev) => ({ ...prev, platform: selectedOptions }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return "badge bg-success";
      case "Closed":
        return "badge bg-danger";
      case "On Hold":
        return "badge bg-warning";
      case "Draft":
        return "badge bg-secondary";
      default:
        return "badge bg-secondary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
        return <FaCheckCircle className="text-success" />;
      case "Closed":
        return <FaTimesCircle className="text-danger" />;
      case "On Hold":
        return <FaPauseCircle className="text-warning" />;
      default:
        return <FaEllipsisH className="text-secondary" />;
    }
  };

  const getFileIcon = (filename) => {
    if (!filename) return <FaFileAlt />;
    const ext = filename.split(".").pop().toLowerCase();
    if (ext === "pdf") return <FaFilePdf className="text-danger" />;
    if (ext === "doc" || ext === "docx")
      return <FaFileWord className="text-primary" />;
    if (ext === "jpg" || ext === "jpeg" || ext === "png")
      return <FaFileImage className="text-success" />;
    return <FaFileAlt />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Filter vacancies based on search and status
  const filteredVacancies = vacancies.filter((vacancy) => {
    const matchesSearch =
      vacancy.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacancy.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || vacancy.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="fade-in">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
          <div>
            <h1 className="h2 fw-bold text-dark mb-1">Vacancy Management</h1>
            <p className="text-muted mb-0">Create and manage job vacancies</p>
          </div>
        </div>
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading vacancies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h1 className="h2 fw-bold text-dark mb-1">Vacancy Management</h1>
          <p className="text-muted mb-0">Create and manage job vacancies</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <FaPlus className="me-2" />
            Create Vacancy
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-warning alert-dismissible fade show mb-4">
          <strong>⚠️ Error:</strong> {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* Create Vacancy Form */}
      {showForm && (
        <div className="hr-form-card fade-in mb-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h5 fw-semibold text-dark mb-0">
              <FaFileAlt className="me-2" />
              Create New Vacancy
            </h2>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              disabled={submitLoading}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-4">
              <div className="col-12">
                <label className="form-label fw-medium">
                  Vacancy Designation *
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.vacancy}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      vacancy: e.target.value,
                    }))
                  }
                  required
                  placeholder="e.g., Software Engineer, Marketing Manager"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-medium">Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-medium">
                  Publish Platform *
                </label>
                <select
                  multiple
                  className="form-control"
                  value={formData.platform}
                  onChange={(e) => handlePlatformChange(e, false)}
                  required
                  style={{ height: "100px" }}
                >
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Naukri">Naukri</option>
                  <option value="Indeed">Indeed</option>
                  <option value="Company Website">Company Website</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Job Portal">Job Portal</option>
                  <option value="Glassdoor">Glassdoor</option>
                  <option value="Monster">Monster</option>
                </select>
                <small className="text-muted">
                  Hold Ctrl to select multiple | Selected:{" "}
                  {formData.platform.length}
                </small>
              </div>

              <div className="col-12">
                <label className="form-label fw-medium">Job Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter detailed job description, requirements, and responsibilities..."
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-medium">
                  Document Upload *
                </label>
                <input
                  id="documentUpload"
                  type="file"
                  className="form-control"
                  onChange={(e) => handleFileChange(e, false)}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  required
                />
                <small className="text-muted">
                  PDF, DOC, DOCX, JPG, PNG (Max 10MB) |
                  {formData.document
                    ? ` Selected: ${formData.document.name}`
                    : " No file selected"}
                </small>
              </div>
            </div>

            <div className="d-flex flex-column flex-sm-row gap-3 pt-3 border-top">
              <button
                type="submit"
                className="btn btn-primary flex-fill"
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Creating...
                  </>
                ) : (
                  "Create Vacancy"
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary flex-fill"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                disabled={submitLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="hr-form-card mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search vacancies by designation or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text">
                <FaFilter />
              </span>
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
                <option value="On Hold">On Hold</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
          <div className="col-md-2">
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={fetchVacancies}
                title="Refresh"
              >
                <FaSort />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vacancies List */}
      <div className="hr-form-card overflow-hidden">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-semibold text-dark mb-0">
            Vacancies ({filteredVacancies.length})
          </h5>
          <small className="text-muted">
            Showing {filteredVacancies.length} of {vacancies.length} vacancies
          </small>
        </div>

        {filteredVacancies.length === 0 ? (
          <div className="text-center py-5">
            <div className="h1 mb-3">📋</div>
            <h5 className="fw-medium text-dark mb-2">No vacancies found</h5>
            <p className="text-muted mb-0">
              {searchTerm || statusFilter !== "All"
                ? "Try changing your search or filter"
                : "Create your first vacancy to get started"}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Designation</th>
                  <th>Platforms</th>
                  <th>Document</th>
                  <th>Created Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVacancies.map((vacancy) => (
                  <tr key={vacancy._id}>
                    <td>
                      <div className="fw-medium">{vacancy.designation}</div>
                      <small className="text-muted">
                        {vacancy.description
                          ? vacancy.description.substring(0, 50) + "..."
                          : "No description"}
                      </small>
                    </td>
                    <td>
                      <div
                        className="d-flex flex-wrap gap-1"
                        style={{ maxWidth: "150px" }}
                      >
                        {vacancy.publishPlatform
                          ?.slice(0, 2)
                          .map((platform, idx) => (
                            <span
                              key={idx}
                              className="badge bg-light text-dark border"
                            >
                              {platform}
                            </span>
                          ))}
                        {vacancy.publishPlatform?.length > 2 && (
                          <span className="badge bg-light text-dark border">
                            +{vacancy.publishPlatform.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {getFileIcon(vacancy.document)}
                        <button
                          onClick={() => handleViewDocument(vacancy._id)}
                          className="btn btn-sm btn-link text-primary p-0"
                          title="View Document"
                        >
                          <small>
                            {vacancy.originalFileName || vacancy.document}
                          </small>
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <FaCalendarAlt className="text-muted" />
                        <small>
                          {new Date(vacancy.createdDate).toLocaleDateString(
                            "en-IN"
                          )}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {getStatusIcon(vacancy.status)}
                        <span className={getStatusBadge(vacancy.status)}>
                          {vacancy.status}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => handleViewDocument(vacancy._id)}
                          className="btn btn-sm btn-outline-info"
                          title="View Document"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() =>
                            handleDownloadDocument(vacancy.document)
                          }
                          className="btn btn-sm btn-outline-success"
                          title="Download"
                        >
                          <FaDownload />
                        </button>
                        <button
                          onClick={() => handleEditVacancy(vacancy)}
                          className="btn btn-sm btn-outline-warning"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <div className="dropdown">
                          <button
                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                            title="More Actions"
                          >
                            <FaEllipsisH />
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() =>
                                  handleUpdateStatus(vacancy._id, "Active")
                                }
                              >
                                <FaCheckCircle className="text-success me-2" />
                                Set Active
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() =>
                                  handleUpdateStatus(vacancy._id, "On Hold")
                                }
                              >
                                <FaPauseCircle className="text-warning me-2" />
                                Set On Hold
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() =>
                                  handleUpdateStatus(vacancy._id, "Closed")
                                }
                              >
                                <FaTimesCircle className="text-danger me-2" />
                                Set Closed
                              </button>
                            </li>
                            <li>
                              <hr className="dropdown-divider" />
                            </li>
                            <li>
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => handleDeleteVacancy(vacancy._id)}
                              >
                                <FaTrash className="me-2" />
                                Delete Vacancy
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Modal */}
      {showDocumentModal && documentInfo && selectedVacancy && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <FaFileAlt className="me-2" />
                  Document Details - {selectedVacancy.designation}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDocumentModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="text-center mb-4">
                      <div className="display-4 mb-3">
                        {getFileIcon(documentInfo.filename)}
                      </div>
                      <h6 className="fw-medium">{documentInfo.originalName}</h6>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="mb-3">
                      <h6 className="fw-medium text-dark mb-2">
                        Document Information
                      </h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td>
                              <strong>File Name:</strong>
                            </td>
                            <td>{documentInfo.originalName}</td>
                          </tr>
                          <tr>
                            <td>
                              <strong>File Type:</strong>
                            </td>
                            <td>{documentInfo.fileType} File</td>
                          </tr>
                          <tr>
                            <td>
                              <strong>File Size:</strong>
                            </td>
                            <td>{formatFileSize(documentInfo.size)}</td>
                          </tr>
                          <tr>
                            <td>
                              <strong>Uploaded:</strong>
                            </td>
                            <td>
                              {new Date(documentInfo.uploadDate).toLocaleString(
                                "en-IN"
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <strong>Vacancy:</strong>
                            </td>
                            <td>{selectedVacancy.designation}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    handleViewDocumentInBrowser(documentInfo.filename)
                  }
                >
                  <FaEye className="me-2" />
                  View in Browser
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => handleDownloadDocument(documentInfo.filename)}
                >
                  <FaDownload className="me-2" />
                  Download
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDocumentModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vacancy Modal */}
      {showEditModal && selectedVacancy && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <FaEdit className="me-2" />
                  Edit Vacancy - {selectedVacancy.designation}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowEditModal(false);
                    resetEditForm();
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdateVacancy}>
                  <div className="row g-3 mb-4">
                    <div className="col-12">
                      <label className="form-label fw-medium">
                        Vacancy Designation *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.vacancy}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            vacancy: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={editFormData.date}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">Status</label>
                      <select
                        className="form-control"
                        value={editFormData.status}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                      >
                        <option value="Active">Active</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Closed">Closed</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-medium">
                        Publish Platform *
                      </label>
                      <select
                        multiple
                        className="form-control"
                        value={editFormData.platform}
                        onChange={(e) => handlePlatformChange(e, true)}
                        required
                        style={{ height: "100px" }}
                      >
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Naukri">Naukri</option>
                        <option value="Indeed">Indeed</option>
                        <option value="Company Website">Company Website</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Job Portal">Job Portal</option>
                      </select>
                      <small className="text-muted">
                        Hold Ctrl to select multiple | Selected:{" "}
                        {editFormData.platform.length}
                      </small>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-medium">
                        Job Description
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={editFormData.description}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-medium">
                        Update Document (Optional)
                        <small className="text-muted ms-2">
                          Leave empty to keep current document
                        </small>
                      </label>
                      <input
                        id="editDocumentUpload"
                        type="file"
                        className="form-control"
                        onChange={(e) => handleFileChange(e, true)}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      <small className="text-muted">
                        Current:{" "}
                        {selectedVacancy.originalFileName ||
                          selectedVacancy.document}
                      </small>
                    </div>
                  </div>

                  <div className="d-flex flex-column flex-sm-row gap-3 pt-3 border-top">
                    <button
                      type="submit"
                      className="btn btn-primary flex-fill"
                      disabled={editLoading}
                    >
                      {editLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Updating...
                        </>
                      ) : (
                        "Update Vacancy"
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary flex-fill"
                      onClick={() => {
                        setShowEditModal(false);
                        resetEditForm();
                      }}
                      disabled={editLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VacancyManagement;
