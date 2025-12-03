import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Badge,
  Button,
  Form,
  Modal,
  Row,
  Col,
  Alert,
  Spinner,
  Pagination,
  Tabs,
  Tab,
  ListGroup,
} from "react-bootstrap";
import {
  FaUserGraduate,
  FaUniversity,
  FaCalendarAlt,
  FaUserTie,
  FaEye,
  FaEdit,
  FaTrash,
  FaUpload,
  FaDownload,
  FaFilter,
  FaSearch,
  FaPlus,
  FaFilePdf,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaGraduationCap,
  FaBriefcase,
  FaClock,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaUserCircle,
} from "react-icons/fa";
import axios from "axios";
import InternshipForm from "./InternshipForm";
import { toast } from "react-toastify";

const InternshipStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  // Fetch internship applications
  const fetchInternships = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await axios.get(`/api/internships?${params}`);

      if (response.data.success) {
        setStudents(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching internships:", error);
      toast.error("Failed to load internship applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, [searchTerm, statusFilter]);

  // Handle view student details
  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  // Handle certificate upload
  const handleCertificateUpload = async () => {
    if (!certificateFile || !selectedStudent) return;

    const formData = new FormData();
    formData.append("certificateFile", certificateFile);

    try {
      setUploading(true);
      const response = await axios.post(
        `/api/internships/${selectedStudent._id}/upload-certificate`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Certificate uploaded successfully");
        setShowUploadModal(false);
        setCertificateFile(null);
        setSelectedStudent(null);
        fetchInternships(pagination.page);
      }
    } catch (error) {
      console.error("Error uploading certificate:", error);
      toast.error(
        error.response?.data?.message || "Failed to upload certificate"
      );
    } finally {
      setUploading(false);
    }
  };

  // Download certificate
  const handleDownloadCertificate = async (studentId) => {
    try {
      const response = await axios.get(
        `/api/internships/${studentId}/download-certificate`,
        {
          responseType: "blob",
        }
      );

      // Create blob URL for download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Certificate-${studentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast.error("Certificate not available for download");
    }
  };

  // Update status
  const handleStatusUpdate = async (studentId, newStatus) => {
    try {
      const response = await axios.put(`/api/internships/${studentId}`, {
        status: newStatus,
      });

      if (response.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchInternships(pagination.page);

        // Update selected student if modal is open
        if (selectedStudent && selectedStudent._id === studentId) {
          setSelectedStudent((prev) => ({
            ...prev,
            status: newStatus,
          }));
        }

        setShowStatusModal(false);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  // Open status modal
  const handleOpenStatusModal = (student) => {
    setSelectedStudent(student);
    setShowStatusModal(true);
  };

  // Delete application
  const handleDelete = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this application?"))
      return;

    try {
      const response = await axios.delete(`/api/internships/${studentId}`);

      if (response.data.success) {
        toast.success("Application deleted successfully");
        fetchInternships(pagination.page);
        setShowViewModal(false);
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Failed to delete application");
    }
  };

  // Status badges with colors
  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: { bg: "warning", text: "Pending" },
      "Under Review": { bg: "info", text: "Under Review" },
      Shortlisted: { bg: "primary", text: "Shortlisted" },
      "Interview Scheduled": { bg: "secondary", text: "Interview" },
      Selected: { bg: "success", text: "Selected" },
      Rejected: { bg: "danger", text: "Rejected" },
      "Offer Accepted": { bg: "success", text: "Offer Accepted" },
      "Offer Declined": { bg: "dark", text: "Offer Declined" },
      Completed: { bg: "success", text: "Completed" },
    };

    const config = statusConfig[status] || { bg: "secondary", text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
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

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Status options for modal
  const statusOptions = [
    { value: "Pending", label: "Pending", color: "warning", icon: "⏳" },
    { value: "Under Review", label: "Under Review", color: "info", icon: "👁️" },
    {
      value: "Shortlisted",
      label: "Shortlisted",
      color: "primary",
      icon: "📋",
    },
    {
      value: "Interview Scheduled",
      label: "Interview Scheduled",
      color: "secondary",
      icon: "🎯",
    },
    { value: "Selected", label: "Selected", color: "success", icon: "✅" },
    { value: "Rejected", label: "Rejected", color: "danger", icon: "❌" },
    { value: "Completed", label: "Completed", color: "success", icon: "🏆" },
    {
      value: "Offer Accepted",
      label: "Offer Accepted",
      color: "success",
      icon: "🤝",
    },
    {
      value: "Offer Declined",
      label: "Offer Declined",
      color: "dark",
      icon: "🚫",
    },
  ];

  return (
    <Container fluid className="p-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-2">
            <FaUserGraduate className="me-2" />
            Internship Students
          </h3>
          <p className="text-muted mb-0">
            Manage internship applications and track progress
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowForm(true)}
          className="d-flex align-items-center"
        >
          <FaPlus className="me-2" />
          New Application
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-muted">Total Applications</h5>
              <h2 className="mb-0">{pagination.total}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="text-center bg-warning bg-opacity-10">
            <Card.Body>
              <h5 className="text-warning">Pending</h5>
              <h2 className="mb-0">
                {students.filter((s) => s.status === "Pending").length}
              </h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="text-center bg-success bg-opacity-10">
            <Card.Body>
              <h5 className="text-success">Selected</h5>
              <h2 className="mb-0">
                {students.filter((s) => s.status === "Selected").length}
              </h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="text-center bg-info bg-opacity-10">
            <Card.Body>
              <h5 className="text-info">Completed</h5>
              <h2 className="mb-0">
                {students.filter((s) => s.status === "Completed").length}
              </h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <Form.Control
                  type="text"
                  placeholder="Search by name, email, university..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Col>
            <Col md={4}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Selected">Selected</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                <FaFilter className="me-2" />
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Internships Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading internship applications...</p>
            </div>
          ) : students.length === 0 ? (
            <Alert variant="info" className="text-center">
              <FaUserGraduate size={48} className="mb-3" />
              <h5>No internship applications found</h5>
              <p>Click "New Application" to add a new internship application</p>
            </Alert>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Student Details</th>
                      <th>University</th>
                      <th>Position</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Certificate</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-sm me-3">
                              <div
                                className="avatar-title bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "40px", height: "40px" }}
                              >
                                {student.fullName?.charAt(0) || "S"}
                              </div>
                            </div>
                            <div>
                              <h6 className="mb-1">{student.fullName}</h6>
                              <small className="text-muted">
                                {student.email}
                              </small>
                              <br />
                              <small className="text-muted">
                                Applied: {formatDate(student.applicationDate)}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <FaUniversity className="me-2 text-muted" />
                            {student.universityName}
                          </div>
                          <small className="text-muted">
                            {student.degreeProgram}
                          </small>
                        </td>
                        <td>{student.positionApplied}</td>
                        <td>
                          <div>
                            <FaCalendarAlt className="me-2 text-muted" />
                            {formatDate(student.preferredStartDate)} -{" "}
                            {formatDate(student.preferredEndDate)}
                          </div>
                          <small className="text-muted">
                            {student.hoursPerWeek} hrs/week
                          </small>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {getStatusBadge(student.status)}
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0"
                              onClick={() => handleOpenStatusModal(student)}
                              title="Change Status"
                            >
                              <FaEdit />
                            </Button>
                          </div>
                        </td>
                        <td>
                          {student.certificateFile ? (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() =>
                                handleDownloadCertificate(student._id)
                              }
                              className="d-flex align-items-center"
                            >
                              <FaDownload className="me-1" />
                              Download
                            </Button>
                          ) : (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowUploadModal(true);
                              }}
                              className="d-flex align-items-center"
                            >
                              <FaUpload className="me-1" />
                              Upload
                            </Button>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleViewStudent(student)}
                              title="View Details"
                              className="d-flex align-items-center"
                            >
                              <FaEye className="me-1" />
                              View
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(student._id)}
                              title="Delete"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First
                      onClick={() => fetchInternships(1)}
                      disabled={pagination.page === 1}
                    />
                    <Pagination.Prev
                      onClick={() => fetchInternships(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    />

                    {[...Array(pagination.pages)].map((_, i) => {
                      const pageNum = i + 1;
                      // Show only limited pages around current page
                      if (
                        pageNum === 1 ||
                        pageNum === pagination.pages ||
                        (pageNum >= pagination.page - 2 &&
                          pageNum <= pagination.page + 2)
                      ) {
                        return (
                          <Pagination.Item
                            key={pageNum}
                            active={pageNum === pagination.page}
                            onClick={() => fetchInternships(pageNum)}
                          >
                            {pageNum}
                          </Pagination.Item>
                        );
                      } else if (
                        pageNum === pagination.page - 3 ||
                        pageNum === pagination.page + 3
                      ) {
                        return <Pagination.Ellipsis key={pageNum} />;
                      }
                      return null;
                    })}

                    <Pagination.Next
                      onClick={() => fetchInternships(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    />
                    <Pagination.Last
                      onClick={() => fetchInternships(pagination.pages)}
                      disabled={pagination.page === pagination.pages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Internship Form Modal */}
      <InternshipForm
        show={showForm}
        onHide={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false);
          fetchInternships();
          toast.success("Application submitted successfully!");
        }}
      />

      {/* View Student Details Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="xl"
        centered
        scrollable
      >
        {selectedStudent && (
          <>
            <Modal.Header closeButton className="bg-primary text-white">
              <Modal.Title>
                <FaUserCircle className="me-2" />
                Student Details - {selectedStudent.fullName}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Tabs defaultActiveKey="personal" className="mb-3">
                <Tab eventKey="personal" title="Personal Info">
                  <Row className="mt-3">
                    <Col md={6}>
                      <Card className="mb-3">
                        <Card.Header className="bg-light">
                          <h6 className="mb-0">
                            <FaUserCircle className="me-2" />
                            Basic Information
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex justify-content-between">
                              <span className="fw-bold">Full Name:</span>
                              <span>{selectedStudent.fullName}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between">
                              <span className="fw-bold">Gender:</span>
                              <span>{selectedStudent.gender}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between">
                              <span className="fw-bold">
                                <FaBirthdayCake className="me-1" />
                                Date of Birth:
                              </span>
                              <span>
                                {formatDate(selectedStudent.dateOfBirth)}
                                <span className="text-muted ms-2">
                                  ({calculateAge(selectedStudent.dateOfBirth)}{" "}
                                  years)
                                </span>
                              </span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between">
                              <span className="fw-bold">Nationality:</span>
                              <span>{selectedStudent.nationality}</span>
                            </ListGroup.Item>
                          </ListGroup>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="mb-3">
                        <Card.Header className="bg-light">
                          <h6 className="mb-0">
                            <FaEnvelope className="me-2" />
                            Contact Information
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex align-items-center">
                              <FaEnvelope className="me-2 text-primary" />
                              <div>
                                <div className="fw-bold">Email</div>
                                <div>{selectedStudent.email}</div>
                              </div>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex align-items-center">
                              <FaPhone className="me-2 text-success" />
                              <div>
                                <div className="fw-bold">Contact Number</div>
                                <div>{selectedStudent.contactNo}</div>
                              </div>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex align-items-start">
                              <FaMapMarkerAlt className="me-2 text-danger mt-1" />
                              <div>
                                <div className="fw-bold">Permanent Address</div>
                                <div>{selectedStudent.permanentAddress}</div>
                              </div>
                            </ListGroup.Item>
                          </ListGroup>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab>

                <Tab eventKey="education" title="Education">
                  <Card className="mt-3">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">
                        <FaGraduationCap className="me-2" />
                        Educational Background
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex justify-content-between">
                              <span className="fw-bold">
                                University/College:
                              </span>
                              <span>{selectedStudent.universityName}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between">
                              <span className="fw-bold">Degree/Program:</span>
                              <span>{selectedStudent.degreeProgram}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between">
                              <span className="fw-bold">Year of Study:</span>
                              <Badge bg="info">
                                {selectedStudent.yearOfStudy}
                              </Badge>
                            </ListGroup.Item>
                          </ListGroup>
                        </Col>
                        <Col md={6}>
                          <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex justify-content-between">
                              <span className="fw-bold">
                                Expected Graduation:
                              </span>
                              <span>
                                {formatDate(
                                  selectedStudent.expectedGraduationDate
                                )}
                              </span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between">
                              <span className="fw-bold">Cumulative GPA:</span>
                              <span>
                                {selectedStudent.cumulativeGPA
                                  ? `${selectedStudent.cumulativeGPA}/10`
                                  : "Not Provided"}
                              </span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between">
                              <span className="fw-bold">Skills:</span>
                              <div>
                                {selectedStudent.relevantSkills?.length > 0 ? (
                                  selectedStudent.relevantSkills.map(
                                    (skill, index) => (
                                      <Badge
                                        key={index}
                                        bg="secondary"
                                        className="me-1 mb-1"
                                      >
                                        {skill}
                                      </Badge>
                                    )
                                  )
                                ) : (
                                  <span className="text-muted">
                                    No skills listed
                                  </span>
                                )}
                              </div>
                            </ListGroup.Item>
                          </ListGroup>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Tab>

                <Tab eventKey="internship" title="Internship">
                  <Card className="mt-3">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">
                        <FaBriefcase className="me-2" />
                        Internship Details
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <Card className="h-100">
                            <Card.Body>
                              <h6 className="text-primary mb-3">
                                <FaBriefcase className="me-2" />
                                Position Details
                              </h6>
                              <ListGroup variant="flush">
                                <ListGroup.Item>
                                  <div className="fw-bold">
                                    Position Applied:
                                  </div>
                                  <div className="fs-5">
                                    {selectedStudent.positionApplied}
                                  </div>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                  <div className="fw-bold">
                                    Preferred Duration:
                                  </div>
                                  <div>
                                    <FaCalendarAlt className="me-2" />
                                    {formatDate(
                                      selectedStudent.preferredStartDate
                                    )}{" "}
                                    to{" "}
                                    {formatDate(
                                      selectedStudent.preferredEndDate
                                    )}
                                  </div>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                  <div className="fw-bold">Hours per Week:</div>
                                  <div>
                                    <FaClock className="me-2" />
                                    {selectedStudent.hoursPerWeek} hours
                                  </div>
                                </ListGroup.Item>
                              </ListGroup>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={6}>
                          <Card className="h-100">
                            <Card.Body>
                              <h6 className="text-success mb-3">
                                <FaFileAlt className="me-2" />
                                Documents & Status
                              </h6>
                              <ListGroup variant="flush">
                                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                  <span className="fw-bold">Resume:</span>
                                  {selectedStudent.resume ? (
                                    <Button size="sm" variant="outline-primary">
                                      <FaDownload className="me-1" />
                                      Download
                                    </Button>
                                  ) : (
                                    <Badge bg="secondary">Not Uploaded</Badge>
                                  )}
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                  <span className="fw-bold">Transcript:</span>
                                  {selectedStudent.transcript ? (
                                    <Button size="sm" variant="outline-primary">
                                      <FaDownload className="me-1" />
                                      Download
                                    </Button>
                                  ) : (
                                    <Badge bg="secondary">Not Uploaded</Badge>
                                  )}
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                  <span className="fw-bold">Certificate:</span>
                                  {selectedStudent.certificateFile ? (
                                    <Button
                                      size="sm"
                                      variant="success"
                                      onClick={() =>
                                        handleDownloadCertificate(
                                          selectedStudent._id
                                        )
                                      }
                                    >
                                      <FaDownload className="me-1" />
                                      Download
                                    </Button>
                                  ) : (
                                    <Badge bg="warning">Pending</Badge>
                                  )}
                                </ListGroup.Item>
                              </ListGroup>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Tab>

                <Tab eventKey="status" title="Status & Actions">
                  <Card className="mt-3">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">
                        <FaCheckCircle className="me-2" />
                        Application Status & Management
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <Card className="h-100">
                            <Card.Body>
                              <h6 className="mb-3">Current Status</h6>
                              <div className="text-center mb-4">
                                <div className="display-6 mb-2">
                                  {getStatusBadge(selectedStudent.status)}
                                </div>
                                <div className="text-muted">
                                  Last updated:{" "}
                                  {formatDate(selectedStudent.updatedAt)}
                                </div>
                              </div>

                              <div className="mb-4">
                                <h6 className="mb-3">Application Timeline</h6>
                                <div className="timeline">
                                  <div className="timeline-item">
                                    <div className="timeline-marker bg-primary"></div>
                                    <div className="timeline-content">
                                      <div className="fw-bold">
                                        Application Submitted
                                      </div>
                                      <div className="text-muted small">
                                        {formatDate(
                                          selectedStudent.applicationDate
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {selectedStudent.interviewDate && (
                                    <div className="timeline-item">
                                      <div className="timeline-marker bg-info"></div>
                                      <div className="timeline-content">
                                        <div className="fw-bold">
                                          Interview Scheduled
                                        </div>
                                        <div className="text-muted small">
                                          {formatDate(
                                            selectedStudent.interviewDate
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={6}>
                          <Card className="h-100">
                            <Card.Body>
                              <h6 className="mb-3">Quick Actions</h6>
                              <div className="d-grid gap-2">
                                <Button
                                  variant="primary"
                                  onClick={() =>
                                    handleOpenStatusModal(selectedStudent)
                                  }
                                  className="d-flex align-items-center justify-content-center"
                                >
                                  <FaEdit className="me-2" />
                                  Change Status
                                </Button>

                                <Button
                                  variant="success"
                                  onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedStudent(selectedStudent);
                                    setShowUploadModal(true);
                                  }}
                                  className="d-flex align-items-center justify-content-center"
                                >
                                  <FaUpload className="me-2" />
                                  Upload Certificate
                                </Button>

                                <Button
                                  variant="outline-warning"
                                  className="d-flex align-items-center justify-content-center"
                                >
                                  <FaEnvelope className="me-2" />
                                  Send Email
                                </Button>

                                <Button
                                  variant="outline-danger"
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        "Are you sure you want to delete this application?"
                                      )
                                    ) {
                                      handleDelete(selectedStudent._id);
                                    }
                                  }}
                                  className="d-flex align-items-center justify-content-center"
                                >
                                  <FaTimesCircle className="me-2" />
                                  Delete Application
                                </Button>
                              </div>

                              <div className="mt-4">
                                <h6 className="mb-3">Add Notes</h6>
                                <Form.Group>
                                  <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Add notes about this application..."
                                  />
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    className="mt-2"
                                  >
                                    Save Notes
                                  </Button>
                                </Form.Group>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Tab>
              </Tabs>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => handleOpenStatusModal(selectedStudent)}
              >
                Change Status
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        centered
      >
        {selectedStudent && (
          <>
            <Modal.Header closeButton className="bg-primary text-white">
              <Modal.Title>
                <FaEdit className="me-2" />
                Update Application Status
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="text-center mb-4">
                <div className="avatar-lg mx-auto mb-3">
                  <div
                    className="avatar-title bg-light rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "80px", height: "80px", fontSize: "2rem" }}
                  >
                    {selectedStudent.fullName?.charAt(0) || "S"}
                  </div>
                </div>
                <h5>{selectedStudent.fullName}</h5>
                <p className="text-muted">{selectedStudent.positionApplied}</p>
                <div className="mb-3">
                  Current Status: {getStatusBadge(selectedStudent.status)}
                </div>
              </div>

              <h6 className="mb-3">Select New Status:</h6>
              <div className="row g-2">
                {statusOptions.map((option) => (
                  <div className="col-6" key={option.value}>
                    <Button
                      variant={
                        selectedStudent.status === option.value
                          ? option.color
                          : "outline-" + option.color
                      }
                      className="w-100 text-start mb-2 py-3"
                      onClick={() =>
                        handleStatusUpdate(selectedStudent._id, option.value)
                      }
                    >
                      <div className="d-flex align-items-center">
                        <span className="fs-4 me-2">{option.icon}</span>
                        <div>
                          <div className="fw-bold">{option.label}</div>
                          <small className="opacity-75">
                            {option.value === "Pending" &&
                              "Application received"}
                            {option.value === "Under Review" &&
                              "Under consideration"}
                            {option.value === "Shortlisted" &&
                              "Selected for next round"}
                            {option.value === "Interview Scheduled" &&
                              "Interview scheduled"}
                            {option.value === "Selected" &&
                              "Selected for internship"}
                            {option.value === "Rejected" &&
                              "Application rejected"}
                            {option.value === "Completed" &&
                              "Internship completed"}
                            {option.value === "Offer Accepted" &&
                              "Offer accepted by candidate"}
                            {option.value === "Offer Declined" &&
                              "Offer declined by candidate"}
                          </small>
                        </div>
                      </div>
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Form.Group>
                  <Form.Label>Add Note (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Add a note about this status change..."
                  />
                </Form.Group>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowStatusModal(false)}
              >
                Done
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* Upload Certificate Modal */}
      <Modal
        show={showUploadModal}
        onHide={() => {
          setShowUploadModal(false);
          setSelectedStudent(null);
          setCertificateFile(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaFilePdf className="me-2 text-danger" />
            Upload Certificate
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudent && (
            <>
              <div className="text-center mb-4">
                <div className="avatar-lg mx-auto mb-3">
                  <div
                    className="avatar-title bg-light rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "60px", height: "60px" }}
                  >
                    <FaUserGraduate className="text-primary" />
                  </div>
                </div>
                <h5>{selectedStudent.fullName}</h5>
                <p className="text-muted">{selectedStudent.positionApplied}</p>
              </div>

              <p>
                Upload internship certificate for{" "}
                <strong>{selectedStudent.fullName}</strong>
              </p>
              <Form.Group className="mb-3">
                <Form.Label>Select Certificate PDF *</Form.Label>
                <Form.Control
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setCertificateFile(e.target.files[0])}
                />
                <Form.Text className="text-muted">
                  Only PDF files are allowed. Maximum file size: 10MB
                </Form.Text>
              </Form.Group>

              {certificateFile && (
                <Alert variant="success" className="d-flex align-items-center">
                  <FaFilePdf className="me-2" />
                  <div>
                    <strong>Selected file:</strong> {certificateFile.name}
                    <br />
                    <small>
                      Size: {(certificateFile.size / 1024 / 1024).toFixed(2)} MB
                    </small>
                  </div>
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowUploadModal(false);
              setSelectedStudent(null);
              setCertificateFile(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCertificateUpload}
            disabled={!certificateFile || uploading}
          >
            {uploading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Uploading...
              </>
            ) : (
              <>
                <FaUpload className="me-2" />
                Upload Certificate
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Custom CSS */}
      <style jsx>{`
        .avatar-lg {
          width: 80px;
          height: 80px;
        }

        .avatar-sm {
          width: 40px;
          height: 40px;
        }

        .timeline {
          position: relative;
          padding-left: 20px;
        }

        .timeline::before {
          content: "";
          position: absolute;
          left: 7px;
          top: 0;
          bottom: 0;
          width: 2px;
          background-color: #e9ecef;
        }

        .timeline-item {
          position: relative;
          margin-bottom: 20px;
        }

        .timeline-marker {
          position: absolute;
          left: -20px;
          top: 0;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
        }

        .timeline-content {
          padding-left: 10px;
        }

        .action-btn {
          min-width: 80px;
        }

        @media (max-width: 768px) {
          .table-responsive {
            font-size: 0.9rem;
          }

          .action-btn {
            min-width: 60px;
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </Container>
  );
};

export default InternshipStudents;
