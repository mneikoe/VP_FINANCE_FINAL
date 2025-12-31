import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Alert,
  Spinner,
  Tabs,
  Tab,
  Table,
  Button,
  Form,
  InputGroup,
} from "react-bootstrap";
import {
  FaMapMarkerAlt,
  FaSync,
  FaUsers,
  FaFilter,
  FaSearch,
  FaEye,
  FaPhone,
  FaUser,
  FaBuilding,
  FaCity,
  FaHashtag,
  FaList,
  FaLocationArrow,
  FaChartBar,
  FaUserCheck,
  FaUserPlus,
} from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AreaOfWork = () => {
  const navigate = useNavigate();
  const [rmData, setRmData] = useState(null);
  const [areas, setAreas] = useState([]);
  const [subAreas, setSubAreas] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingClients, setLoadingClients] = useState(false);
  const [activeTab, setActiveTab] = useState("area");
  const [error, setError] = useState(null);

  // Filters for clients
  const [filters, setFilters] = useState({
    clientType: "all", // "all", "client", "prospect"
    search: "",
    subArea: "all",
  });

  // Get current user
  const [currentUser] = useState(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (err) {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      fetchRmData();
    } else {
      setError("User not found");
      setLoading(false);
    }
  }, [currentUser]);

  const fetchRmData = async () => {
    setLoading(true);
    setError(null);

    try {
      const rmId = currentUser?.id || currentUser?._id;

      if (!rmId) {
        setError("RM ID not found");
        setLoading(false);
        return;
      }

      // Fetch RM details
      const rmResponse = await axios.get(
        `/api/employee/getEmployeeById?employeeId=${rmId}`
      );

      if (rmResponse.data.success) {
        const rmData = rmResponse.data.data;
        setRmData(rmData);

        if (rmData.workArea) {
          await fetchAreasAndSubAreas(rmData.workArea);
          // Fetch only clients and prospects (no suspects)
          fetchClientsAndProspectsByArea(rmData.workArea);
        } else {
          setError("No work area assigned");
        }
      }
    } catch (error) {
      setError("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAreasAndSubAreas = async (workArea) => {
    try {
      // Fetch all areas
      const areaResponse = await axios.get("/api/leadarea");
      setAreas(areaResponse.data || []);

      // Fetch all subareas
      const subAreaResponse = await axios.get("/api/leadsubarea");
      setSubAreas(subAreaResponse.data || []);
    } catch (error) {
      console.error("Error fetching areas/subareas:", error);
    }
  };

  // Fetch only clients and prospects (no suspects)
  const fetchClientsAndProspectsByArea = async (area, subArea = null) => {
    setLoadingClients(true);
    try {
      // Build URL - specifically exclude suspects
      let url = `/api/employee/getClientsByArea?area=${encodeURIComponent(
        area
      )}`;

      // Add subArea filter if selected
      if (subArea && subArea !== "all") {
        url += `&subArea=${encodeURIComponent(subArea)}`;
      }

      console.log("📡 Fetching clients/prospects from:", url);

      const response = await axios.get(url);

      if (response.data.success) {
        // Filter out suspects, keep only clients and prospects
        const filteredData = (response.data.data || []).filter(
          (item) => item.status === "client" || item.status === "prospect"
        );

        console.log("✅ Clients & Prospects found:", filteredData.length);
        setClients(filteredData);
      } else {
        console.error("❌ API Error:", response.data.message);
        setClients([]);
      }
    } catch (error) {
      console.error("❌ Error fetching clients/prospects:", error);
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  // Get RM's assigned area object
  const getRmAreaDetails = () => {
    if (!rmData || !rmData.workArea) return null;
    return areas.find((area) => area.name === rmData.workArea);
  };

  // Get subareas for RM's area
  const getSubAreasForRm = () => {
    const rmArea = getRmAreaDetails();
    if (!rmArea) return [];

    return subAreas.filter(
      (sub) =>
        sub.areaId &&
        (sub.areaId._id === rmArea._id || sub.areaId === rmArea._id)
    );
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    // If subArea filter changes, fetch new clients
    if (name === "subArea" && rmData?.workArea) {
      fetchClientsAndProspectsByArea(
        rmData.workArea,
        value === "all" ? null : value
      );
    }
  };

  // Filter clients based on filters
  const filteredClients = clients.filter((client) => {
    // Filter by client type (client/prospect)
    if (filters.clientType !== "all" && client.status !== filters.clientType) {
      return false;
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        client.name?.toLowerCase().includes(searchLower) ||
        client.mobileNo?.toLowerCase().includes(searchLower) ||
        client.emailId?.toLowerCase().includes(searchLower) ||
        client.groupCode?.toLowerCase().includes(searchLower) ||
        client.organisation?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Get stats (only clients and prospects)
  const getStats = () => {
    const prospects = clients.filter((c) => c.status === "prospect").length;
    const activeClients = clients.filter((c) => c.status === "client").length;

    return {
      total: clients.length,
      prospects,
      activeClients,
    };
  };

  // Get status badge (only for client and prospect)
  const getStatusBadge = (status) => {
    if (status === "client") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaUserCheck className="mr-1" /> Client
        </span>
      );
    } else if (status === "prospect") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <FaUserPlus className="mr-1" /> Prospect
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {status}
      </span>
    );
  };

  // Navigate to client details
  const viewClientDetails = (clientId) => {
    navigate(`/rm/suspect/details/${clientId}`);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading work area...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="p-4">
        <div className="border rounded bg-light p-4">
          <Alert variant="danger">
            <strong>Error:</strong> {error}
          </Alert>
          <button className="btn btn-primary mt-3" onClick={fetchRmData}>
            <FaSync /> Retry
          </button>
        </div>
      </Container>
    );
  }

  const rmAreaDetails = getRmAreaDetails();
  const rmSubAreas = getSubAreasForRm();
  const stats = getStats();

  return (
    <Container fluid className="p-4">
      <div className="border rounded shadow-sm bg-light p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button variant="outline-dark" onClick={fetchRmData}>
            Refresh
          </Button>
        </div>

        {/* Area Stats */}
        {rmAreaDetails && (
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center border-b-[1px] shadow-lg">
                <Card.Body>
                  <h6 className="text-black mb-2">Area</h6>
                  <div className="fw-small">{rmAreaDetails.name}</div>
                  <small className="text-muted">
                    {rmAreaDetails.city} ({rmAreaDetails.pincode})
                  </small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-b-[1px] shadow-lg">
                <Card.Body>
                  <h6 className="text-black mb-2">Sub Areas</h6>
                  <div className="fw-small">{rmSubAreas.length}</div>
                  <small className="text-muted">Total sub-areas</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-b-[1px] shadow-lg">
                <Card.Body>
                  <h6 className="text-black mb-2">Clients</h6>
                  <div className="fw-small">{stats.activeClients}</div>
                  <small className="text-muted">Active clients</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-b-[1px] shadow-lg">
                <Card.Body>
                  <h6 className="text-black mb-2">Prospects</h6>
                  <div className="fw-small">{stats.prospects}</div>
                  <small className="text-muted">Potential clients</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Main Tabs */}
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4 border-b-2 shadow-sm"
          fill
        >
          {/* AREA DETAILS TAB */}
          <Tab
            eventKey="area"
            title={
              <span>
                <FaLocationArrow className="me-2" />
                Area Details
              </span>
            }
          >
            {rmAreaDetails ? (
              <Card>
                <Card.Header className="bg-black text-white">
                  <h5 className="mb-0">{rmAreaDetails.name}</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-4">
                        <h5 className="mb-3">
                          <FaBuilding className="text-gray me-2" />
                          Area Information
                        </h5>
                        <Table borderless>
                          <tbody>
                            <tr>
                              <td>
                                <strong>Pincode:</strong>
                              </td>
                              <td>{rmAreaDetails.pincode}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-4">
                        <h5 className="mb-3">
                          <FaList className="text-success me-2" />
                          Sub-Areas ({rmSubAreas.length})
                        </h5>
                        {rmSubAreas.length > 0 ? (
                          <div className="border rounded p-3 bg-white">
                            <Row>
                              {rmSubAreas.map((subArea, index) => (
                                <Col md={6} key={subArea._id} className="mb-2">
                                  <div className="d-flex align-items-center p-2 border rounded">
                                    <Badge bg="primary" className="me-2">
                                      {index + 1}
                                    </Badge>
                                    <span>{subArea.subAreaName}</span>
                                  </div>
                                </Col>
                              ))}
                            </Row>
                          </div>
                        ) : (
                          <Alert variant="info">
                            No sub-areas defined for this area.
                          </Alert>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ) : (
              <Alert variant="warning">
                <strong>No area assigned!</strong> Please contact administrator.
              </Alert>
            )}
          </Tab>

          {/* CLIENTS & PROSPECTS TAB */}
          <Tab
            eventKey="clients"
            title={
              <span>
                <FaUsers className="me-2" />
                Clients & Prospects
                {clients.length > 0 && (
                  <Badge bg="light" text="dark" className="ms-2">
                    {clients.length}
                  </Badge>
                )}
              </span>
            }
          >
            <Card>
              <Card.Header className="bg-primary text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <FaUsers className="me-2" />
                    Clients & Prospects in {rmAreaDetails?.name || "Your Area"}
                  </h5>
                  <div className="d-flex gap-2">
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() =>
                        fetchClientsAndProspectsByArea(rmData?.workArea)
                      }
                      disabled={loadingClients || !rmData?.workArea}
                    >
                      <FaSync className={loadingClients ? "fa-spin" : ""} />
                    </Button>
                  </div>
                </div>
              </Card.Header>

              {/* Filters */}
              <Card.Body>
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>
                        <FaFilter className="me-1" /> Type
                      </Form.Label>
                      <Form.Select
                        value={filters.clientType}
                        onChange={(e) =>
                          handleFilterChange("clientType", e.target.value)
                        }
                        size="sm"
                      >
                        <option value="all">All (Clients & Prospects)</option>
                        <option value="client">Clients Only</option>
                        <option value="prospect">Prospects Only</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>
                        <FaMapMarkerAlt className="me-1" /> Sub Area
                      </Form.Label>
                      <Form.Select
                        value={filters.subArea}
                        onChange={(e) =>
                          handleFilterChange("subArea", e.target.value)
                        }
                        size="sm"
                        disabled={!rmSubAreas.length}
                      >
                        <option value="all">All Sub-Areas</option>
                        {rmSubAreas.map((sub) => (
                          <option key={sub._id} value={sub.subAreaName}>
                            {sub.subAreaName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>
                        <FaSearch className="me-1" /> Search
                      </Form.Label>
                      <InputGroup size="sm">
                        <Form.Control
                          placeholder="Search by name, mobile, email..."
                          value={filters.search}
                          onChange={(e) =>
                            handleFilterChange("search", e.target.value)
                          }
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Summary Badges */}
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="badge bg-success d-flex align-items-center px-3 py-2">
                    <FaUserCheck className="me-1" /> Clients:{" "}
                    {stats.activeClients}
                  </span>
                  <span className="badge bg-info d-flex align-items-center px-3 py-2">
                    <FaUserPlus className="me-1" /> Prospects: {stats.prospects}
                  </span>
                  <span className="badge bg-secondary d-flex align-items-center px-3 py-2">
                    Total: {stats.total}
                  </span>
                </div>

                {/* TAILWIND HORIZONTAL SCROLLABLE TABLE */}
                {loadingClients ? (
                  <div className="text-center py-8">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-gray-600">
                      Loading clients & prospects...
                    </p>
                  </div>
                ) : filteredClients.length === 0 ? (
                  <Alert variant="info">
                    <FaUsers className="me-2" />
                    {clients.length === 0
                      ? `No clients or prospects found in ${
                          rmAreaDetails?.name || "your area"
                        }.`
                      : "No records match your filters."}
                  </Alert>
                ) : (
                  <div className="mt-4">
                    {/* Horizontal Scroll Indicator */}
                    <div className="flex justify-end items-center mb-2 text-sm text-gray-500">
                      <FaSearch className="mr-1" />
                      <span>Scroll horizontally to view all columns →</span>
                    </div>

                    {/* Scrollable Table Container */}
                    <div className="relative">
                      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white">
                        <table className="min-w-full divide-y divide-gray-200">
                          {/* Fixed Header */}
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"
                              >
                                #
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]"
                              >
                                <div className="flex items-center">
                                  <FaUser className="mr-2 text-blue-500" />
                                  Name
                                </div>
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[130px]"
                              >
                                <div className="flex items-center">
                                  <FaPhone className="mr-2 text-green-500" />
                                  Mobile
                                </div>
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]"
                              >
                                Email
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
                              >
                                Type
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px]"
                              >
                                <div className="flex items-center">
                                  <FaMapMarkerAlt className="mr-2 text-red-500" />
                                  Area
                                </div>
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]"
                              >
                                Sub Area
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]"
                              >
                                <div className="flex items-center">
                                  <FaBuilding className="mr-2 text-yellow-500" />
                                  Organisation
                                </div>
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]"
                              >
                                Actions
                              </th>
                            </tr>
                          </thead>

                          {/* Scrollable Body */}
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredClients.map((client, index) => (
                              <tr
                                key={client._id}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <FaUser className="mr-2 text-blue-500" />
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {client.name}
                                      </div>
                                      {client.groupCode && (
                                        <div className="text-xs text-gray-500">
                                          Code: {client.groupCode}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center text-sm text-gray-900">
                                    <FaPhone className="mr-2 text-green-500" />
                                    {client.mobileNo}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {client.emailId || "-"}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {getStatusBadge(client.status)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {client.area}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {client.subArea || "-"}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center text-sm text-gray-900">
                                    <FaBuilding className="mr-2 text-yellow-500" />
                                    {client.organisation || "-"}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                  <button
                                    onClick={() =>
                                      viewClientDetails(client._id)
                                    }
                                    className="inline-flex items-center px-3 py-1.5 border border-blue-300 rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-colors"
                                    title="View Details"
                                  >
                                    <FaEye className="mr-1" />
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Summary Footer */}
                    <div className="mt-3 d-flex justify-content-between align-items-center">
                      <div className="text-muted">
                        Showing <strong>{filteredClients.length}</strong> of{" "}
                        <strong>{clients.length}</strong> records
                        <span className="ms-3">
                          (<strong>{stats.activeClients}</strong> clients,{" "}
                          <strong>{stats.prospects}</strong> prospects)
                        </span>
                      </div>
                      <div className="text-muted small">
                        <FaMapMarkerAlt className="me-1" />
                        Area: <strong>{rmAreaDetails?.name}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>

        {/* Footer Note */}
        <Alert variant="light" className="mt-3">
          <div className="small text-muted">
            <strong>Note:</strong> This page shows only <strong>Clients</strong>{" "}
            and <strong>Prospects</strong>.
            <span className="ms-2">
              <span className="badge bg-success me-1">Client</span> = Active
              customer
            </span>
            <span className="ms-2">
              <span className="badge bg-info me-1">Prospect</span> = Potential
              customer
            </span>
          </div>
        </Alert>
      </div>

      {/* Custom Scrollbar CSS */}
      <style jsx>{`
        .overflow-x-auto {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #f7fafc;
        }
        .overflow-x-auto::-webkit-scrollbar {
          height: 8px;
        }
        .overflow-x-auto::-webkit-scrollbar-track {
          background: #f7fafc;
          border-radius: 4px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background-color: #cbd5e0;
          border-radius: 4px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background-color: #a0aec0;
        }
      `}</style>
    </Container>
  );
};

export default AreaOfWork;
