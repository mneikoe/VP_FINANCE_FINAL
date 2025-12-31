import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Alert,
  Spinner,
  Form,
  Button,
  InputGroup,
  Table,
  Pagination,
} from "react-bootstrap";
import {
  FaUsers,
  FaSearch,
  FaEye,
  FaPhone,
  FaUser,
  FaBuilding,
  FaMapMarkerAlt,
  FaUserTie,
  FaSync,
  FaUserCheck,
  FaUserPlus,
  FaHashtag,
  FaCity,
  FaEnvelope,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CustomerMaster = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [areas, setAreas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    clients: 0,
    prospects: 0,
  });

  // Get current logged-in user
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (err) {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser && currentUser.role === "RM") {
      fetchMyCustomers();
    }
  }, [currentUser]);

  // Fetch customers for current RM
  const fetchMyCustomers = async () => {
    setLoading(true);
    try {
      const currentRMId = currentUser?._id || currentUser?.id;

      if (!currentRMId) {
        console.error("❌ Current RM ID not found!");
        return;
      }

      console.log("🔍 Fetching customers for RM ID:", currentRMId);

      const response = await axios.get(
        "/api/employee/getClientsByAllocatedRM",
        {
          params: {
            allocatedRM: currentRMId,
          },
        }
      );

      if (response.data.success) {
        const apiData = response.data.data;
        const allClients = apiData?.clients || [];

        console.log(`✅ Found ${allClients.length} customers`);

        // Add sequential numbers
        const numberedClients = allClients.map((client, index) => ({
          ...client,
          serialNo: index + 1,
        }));

        setClients(numberedClients);
        setFilteredClients(numberedClients);
        calculateStats(numberedClients);

        // Extract unique areas
        const uniqueAreas = [
          ...new Set(
            allClients
              .map((c) => c.area)
              .filter((area) => area && area !== "N/A")
          ),
        ];
        setAreas(uniqueAreas);
      } else {
        console.error("❌ API Error:", response.data.message);
      }
    } catch (error) {
      console.error("❌ Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (clientsData) => {
    const total = clientsData.length;
    const clientsCount = clientsData.filter(
      (c) => c.status === "client"
    ).length;
    const prospectsCount = clientsData.filter(
      (c) => c.status === "prospect"
    ).length;

    setStats({
      total,
      clients: clientsCount,
      prospects: prospectsCount,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "client":
        return (
          <Badge bg="success" className="px-3 py-2 rounded-pill">
            <FaUserCheck className="me-1" /> Client
          </Badge>
        );
      case "prospect":
        return (
          <Badge bg="warning" className="px-3 py-2 rounded-pill text-dark">
            <FaUserPlus className="me-1" /> Prospect
          </Badge>
        );
      default:
        return (
          <Badge bg="secondary" className="px-3 py-2 rounded-pill">
            {status}
          </Badge>
        );
    }
  };

  // Sort function
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...clients];

    // Filter by area
    if (selectedArea !== "all") {
      filtered = filtered.filter((client) => client.area === selectedArea);
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((client) => client.status === selectedStatus);
    }

    // Filter by search
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.name?.toLowerCase().includes(searchLower) ||
          false ||
          client.mobileNo?.toLowerCase().includes(searchLower) ||
          false ||
          client.emailId?.toLowerCase().includes(searchLower) ||
          false ||
          client.groupCode?.toLowerCase().includes(searchLower) ||
          false
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredClients(filtered);
    calculateStats(filtered);
    setCurrentPage(1); // Reset to first page on filter
  }, [search, selectedArea, selectedStatus, sortField, sortDirection, clients]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClients = filteredClients.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  const viewCustomerDetails = (customerId) => {
    navigate(`/rm/suspect/details/${customerId}`);
  };

  // Render sort icon
  const renderSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="ms-1 text-muted" />;
    if (sortDirection === "asc")
      return <FaSortUp className="ms-1 text-primary" />;
    return <FaSortDown className="ms-1 text-primary" />;
  };

  if (currentUser && currentUser.role !== "RM") {
    return (
      <Container fluid className="p-5 text-center">
        <Alert variant="warning" className="mt-5">
          <h4>
            <FaUserTie className="me-2" />
            Access Restricted
          </h4>
          <p>This page is only accessible to Relationship Managers (RMs).</p>
          <p>
            Your role: <strong>{currentUser.role}</strong>
          </p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FaUserTie className="text-primary me-2" />
            Customer Master
          </h2>
          <p className="text-muted mb-0">
            RM: <strong>{currentUser?.name}</strong> (
            {currentUser?.employeeCode})
          </p>
        </div>

        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={fetchMyCustomers}>
            <FaSync className="me-2" /> Refresh
          </Button>
          <Badge bg="dark" className="px-3 py-2 fs-6">
            <FaUsers className="me-2" />
            {stats.total} Customers
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0 bg-gradient-light">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Allocated</h6>
                  <h3 className="fw-bold mb-0">{stats.total}</h3>
                </div>
                <div className="bg-primary rounded-circle p-3">
                  <FaUsers className="text-white fs-4" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 bg-gradient-light">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Active Clients</h6>
                  <h3 className="fw-bold mb-0 text-success">{stats.clients}</h3>
                </div>
                <div className="bg-success rounded-circle p-3">
                  <FaUserCheck className="text-white fs-4" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 bg-gradient-light">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Prospects</h6>
                  <h3 className="fw-bold mb-0 text-warning">
                    {stats.prospects}
                  </h3>
                </div>
                <div className="bg-warning rounded-circle p-3">
                  <FaUserPlus className="text-white fs-4" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 bg-gradient-light">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Showing</h6>
                  <h3 className="fw-bold mb-0 text-info">
                    {filteredClients.length}
                  </h3>
                </div>
                <div className="bg-info rounded-circle p-3">
                  <FaFilter className="text-white fs-4" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">
            <FaFilter className="me-2" />
            Filters & Search
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  <FaSearch className="me-1" /> Quick Search
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search by name, mobile, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>
                  <FaMapMarkerAlt className="me-1" /> Area
                </Form.Label>
                <Form.Select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                >
                  <option value="all">All Areas</option>
                  {areas.map((area, index) => (
                    <option key={index} value={area}>
                      {area}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>
                  <FaUser className="me-1" /> Status
                </Form.Label>
                <Form.Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="client">Clients</option>
                  <option value="prospect">Prospects</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={2} className="d-flex align-items-end">
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setSearch("");
                  setSelectedArea("all");
                  setSelectedStatus("all");
                }}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Main Table */}
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">
              <FaUsers className="me-2" />
              My Customers ({filteredClients.length} records)
            </h5>
            <div className="text-muted small">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading customer data...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-5">
              <FaUsers className="text-muted fs-1 mb-3" />
              <h5>No customers found</h5>
              <p className="text-muted">
                {clients.length === 0
                  ? "You don't have any customers allocated yet."
                  : "Try changing your filters."}
              </p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th
                        className="text-center cursor-pointer"
                        onClick={() => handleSort("serialNo")}
                        style={{ width: "60px" }}
                      >
                        # {renderSortIcon("serialNo")}
                      </th>
                      <th
                        className="cursor-pointer"
                        onClick={() => handleSort("name")}
                      >
                        <FaUser className="me-2 text-primary" />
                        Customer Details {renderSortIcon("name")}
                      </th>
                      <th
                        className="cursor-pointer"
                        onClick={() => handleSort("status")}
                      >
                        Status {renderSortIcon("status")}
                      </th>
                      <th
                        className="cursor-pointer"
                        onClick={() => handleSort("mobileNo")}
                      >
                        <FaPhone className="me-2 text-success" />
                        Contact {renderSortIcon("mobileNo")}
                      </th>
                      <th
                        className="cursor-pointer"
                        onClick={() => handleSort("area")}
                      >
                        <FaMapMarkerAlt className="me-2 text-danger" />
                        Location {renderSortIcon("area")}
                      </th>
                      <th
                        className="cursor-pointer"
                        onClick={() => handleSort("groupCode")}
                      >
                        <FaHashtag className="me-2 text-info" />
                        Group Code {renderSortIcon("groupCode")}
                      </th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentClients.map((client) => (
                      <tr key={client._id} className="align-middle">
                        <td className="text-center fw-bold text-muted">
                          {client.serialNo}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                              <FaUser className="text-primary" />
                            </div>
                            <div>
                              <h6 className="mb-0 fw-bold">
                                {client.name || "Unnamed Customer"}
                              </h6>
                              {client.emailId && client.emailId !== "N/A" && (
                                <small className="text-muted d-block">
                                  <FaEnvelope className="me-1" />
                                  {client.emailId}
                                </small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{getStatusBadge(client.status)}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaPhone className="me-2 text-success" />
                            <div>
                              <div className="fw-medium">
                                {client.mobileNo || "N/A"}
                              </div>
                              {client.mobileNo && client.mobileNo !== "N/A" && (
                                <a
                                  href={`tel:${client.mobileNo}`}
                                  className="btn btn-sm btn-outline-success mt-1"
                                >
                                  Call
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="d-flex align-items-center mb-1">
                              <FaMapMarkerAlt className="me-2 text-danger" />
                              <span className="fw-medium">{client.area}</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <FaCity className="me-2 text-info" />
                              <small className="text-muted">
                                {client.city}
                              </small>
                            </div>
                            {client.subArea && client.subArea !== "N/A" && (
                              <small className="text-muted d-block ms-4">
                                {client.subArea}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <Badge bg="light" text="dark" className="fs-6">
                            <FaHashtag className="me-1" />
                            {client.groupCode}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => viewCustomerDetails(client._id)}
                            className="me-2"
                          >
                            <FaEye className="me-1" />
                            View
                          </Button>
                          <Button variant="outline-success" size="sm">
                            <FaPhone className="me-1" />
                            Call
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-3 border-top">
                  <div className="text-muted">
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, filteredClients.length)} of{" "}
                    {filteredClients.length} entries
                  </div>
                  <Pagination className="mb-0">
                    <Pagination.First
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    />

                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Pagination.Item
                          key={pageNum}
                          active={pageNum === currentPage}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Pagination.Item>
                      );
                    })}

                    <Pagination.Next
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Summary Footer */}
      <div className="mt-3 p-3 bg-light rounded d-flex justify-content-between align-items-center">
        <div>
          <small className="text-muted">
            Data last refreshed: {new Date().toLocaleTimeString()}
          </small>
        </div>
        <div>
          <small className="text-muted">
            Allocated RM: <strong>{currentUser?.name}</strong> | Customer Type:{" "}
            <strong>{selectedStatus === "all" ? "All" : selectedStatus}</strong>{" "}
            | Area:{" "}
            <strong>
              {selectedArea === "all" ? "All Areas" : selectedArea}
            </strong>
          </small>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
        .bg-gradient-light {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        .table > :not(caption) > * > * {
          padding: 1rem 0.75rem;
        }
        .table th {
          font-weight: 600;
          border-bottom: 2px solid #dee2e6;
        }
        .table td {
          vertical-align: middle;
        }
        .pagination .page-item.active .page-link {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
        .pagination .page-link {
          color: #0d6efd;
        }
        .pagination .page-link:hover {
          color: #0a58ca;
        }
      `}</style>
    </Container>
  );
};

export default CustomerMaster;
