import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Spinner,
  Alert,
  Tabs,
  Tab,
  Table,
} from "react-bootstrap";
import {
  FiArrowLeft,
  FiPhone,
  FiCalendar,
  FiClock,
  FiMessageSquare,
  FiCheck,
  FiUser,
  FiEdit,
  FiSave,
} from "react-icons/fi";
import { toast } from "react-toastify";

// Import Redux actions
import { fetchDetails } from "../../../redux/feature/LeadSource/LeadThunx";
import { getAllOccupations } from "../../../redux/feature/LeadOccupation/OccupationThunx";
import { getAllOccupationTypes } from "../../../redux/feature/OccupationType/OccupationThunx";
import { fetchLeadType } from "../../../redux/feature/LeadType/LeadTypeThunx";

const SuspectDetailTelecaller = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux selectors
  const { leadsourceDetail } = useSelector((state) => state.leadsource);
  const { alldetails: occupations } = useSelector(
    (state) => state.leadOccupation
  );
  const { alldetailsForTypes: occupationTypes } = useSelector(
    (state) => state.OccupationType
  );
  const { LeadType: leadTypes, loading: leadTypesLoading } = useSelector(
    (state) => state.LeadType
  );

  const [suspect, setSuspect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("editDetails");

  // Personal Details form state
  const [formData, setFormData] = useState({
    salutation: "",
    groupName: "",
    gender: "",
    organisation: "",
    designation: "",
    mobileNo: "",
    contactNo: "",
    whatsappNo: "",
    emailId: "",
    paName: "",
    paMobileNo: "",
    annualIncome: "",
    grade: "",
    preferredAddressType: "resi",
    resiAddr: "",
    resiLandmark: "",
    resiPincode: "",
    officeAddr: "",
    officeLandmark: "",
    officePincode: "",
    preferredMeetingAddr: "",
    preferredMeetingArea: "",
    city: "",
    bestTime: "",
    adharNumber: "",
    panCardNumber: "",
    hobbies: "",
    nativePlace: "",
    socialLink: "",
    habits: "",
    leadSource: "",
    leadName: "",
    leadOccupation: "",
    leadOccupationType: "",
    callingPurpose: "",
    name: "",
    allocatedCRE: "",
    remark: "",
    dob: "",
    dom: "",
  });

  // Call task form state
  const [callTask, setCallTask] = useState({
    taskDate: "",
    taskTime: "",
    taskRemarks: "",
    taskStatus: "",
    nextFollowUpDate: "",
    nextFollowUpTime: "",
    nextAppointmentDate: "",
    nextAppointmentTime: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [callHistory, setCallHistory] = useState([]);
  const [whatsappEdited, setWhatsappEdited] = useState(false);

  // Grade mapping for annual income
  const gradeMap = {
    "25 lakh to 1 Cr.": 1,
    "5 to 25 lakh": 2,
    "2.5 to 5 lakh": 3,
  };

  // Income options
  const incomeOptions = [
    { value: "25 lakh to 1 Cr.", label: "25 lakh to 1 Cr." },
    { value: "5 to 25 lakh", label: "5 to 25 lakh" },
    { value: "2.5 to 5 lakh", label: "2.5 to 5 lakh" },
  ];

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchLeadType());
    dispatch(fetchDetails());
    dispatch(getAllOccupationTypes());
    dispatch(getAllOccupations());
  }, [dispatch]);

  // Fetch suspect details
  useEffect(() => {
    const fetchSuspectDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/suspect/${id}`);

        if (response.data?.success) {
          const suspectData = response.data.suspect;
          setSuspect(suspectData);

          // Set personal details in form
          if (suspectData.personalDetails) {
            setFormData((prev) => ({
              ...prev,
              ...suspectData.personalDetails,
              dob: formatDateToYMD(suspectData.personalDetails.dob),
              dom: formatDateToYMD(suspectData.personalDetails.dom),
            }));
          }

          // Fetch call history
          if (suspectData.callTasks) {
            setCallHistory(suspectData.callTasks);
          }
        } else {
          setError("Failed to fetch suspect details");
        }
      } catch (error) {
        setError(error.response?.data?.message || "Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchSuspectDetails();
  }, [id]);

  // Function to get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Function to get current time in HH:MM format
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Function to set current date and time when switching to call task tab
  const setCurrentDateTime = () => {
    setCallTask((prev) => ({
      ...prev,
      taskDate: getCurrentDate(),
      taskTime: getCurrentTime(),
    }));
  };

  // Handle tab change
  const handleTabChange = (tabKey) => {
    if (tabKey === "callTask") {
      // Set current date and time when switching to call task tab
      setCurrentDateTime();
    }
    setActiveTab(tabKey);
  };

  // Update grade when annual income changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      grade: gradeMap[prev.annualIncome] || "",
    }));
  }, [formData.annualIncome]);

  // Format date for input field
  const formatDateToYMD = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get current date in YYYY-MM-DD format for min attribute
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Handle personal details form changes
  const handlePersonalDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle mobile and whatsapp change (sync functionality)
  const handleMobileWhatsappChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let updated = { ...prev, [name]: value };
      if (name === "mobileNo" && value.length === 10 && !whatsappEdited) {
        updated.whatsappNo = value;
      }
      return updated;
    });
    if (name === "whatsappNo") {
      setWhatsappEdited(true);
    }
  };

  // Handle call task form changes
  const handleCallTaskChange = (e) => {
    const { name, value } = e.target;
    setCallTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update personal details
  const handleUpdatePersonalDetails = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);

      const response = await axios.put(
        `/api/suspect/update/personaldetails/${id}`,
        {
          personalDetails: formData,
        }
      );

      if (response.data?.success) {
        toast.success("Personal details updated successfully!");

        // Update local state
        setSuspect((prev) => ({
          ...prev,
          personalDetails: formData,
        }));
      } else {
        toast.error("Failed to update details");
      }
    } catch (error) {
      console.error("Error updating details:", error);
      toast.error(error.response?.data?.message || "Network error");
    } finally {
      setUpdating(false);
    }
  };

  // Handle call task submission
  const handleSubmitCallTask = async (e) => {
    e.preventDefault();

    if (!callTask.taskStatus) {
      toast.error("Please select call status");
      return;
    }

    if (!callTask.taskDate) {
      toast.error("Please select call date");
      return;
    }

    // Validation for forwarded calls
    const forwardedStatuses = [
      "Call Not Picked",
      "Busy on Another Call",
      "Call After Sometimes",
      "Others",
    ];

    if (forwardedStatuses.includes(callTask.taskStatus)) {
      if (!callTask.nextFollowUpDate || !callTask.nextFollowUpTime) {
        toast.error("Next call date and time are required for forwarded calls");
        return;
      }
    }

    // Validation for Appointment Scheduled
    if (callTask.taskStatus === "Appointment Scheduled") {
      if (!callTask.nextAppointmentDate || !callTask.nextAppointmentTime) {
        toast.error("Appointment date and time are required");
        return;
      }
    }

    try {
      setSubmitting(true);

      const response = await axios.post(
        `/api/suspect/${id}/call-task`,
        callTask
      );

      if (response.data.success) {
        toast.success("Call task added successfully!");

        // Reset form (but keep date/time for next entry)
        setCallTask((prev) => ({
          ...prev,
          taskRemarks: "",
          taskStatus: "",
          nextFollowUpDate: "",
          nextFollowUpTime: "",
          nextAppointmentDate: "",
          nextAppointmentTime: "",
        }));

        // Navigate to suspects list after 1 second
        setTimeout(() => {
          navigate("/telecaller/dashboard");
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to add call task");
      }
    } catch (error) {
      console.error("Error adding call task:", error);
      toast.error(error.response?.data?.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading suspect details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Error</h4>
          <p>{error}</p>
          <Button
            variant="outline-danger"
            onClick={() => navigate("/telecaller/dashboard")}
          >
            <FiArrowLeft /> Back to List
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!suspect) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <h4>No Data Found</h4>
          <p>Suspect not found</p>
          <Button
            variant="outline-warning"
            onClick={() => navigate("/telecaller/dashboard")}
          >
            <FiArrowLeft /> Back to List
          </Button>
        </Alert>
      </Container>
    );
  }

  const personal = suspect.personalDetails || {};

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="mb-4">
        <Button
          variant="outline-primary"
          onClick={() => navigate("/telecaller/dashboard")}
          className="mb-3"
        >
          Back to List
        </Button>

        <h4 className="mb-1">
          <FiUser className="me-2" />
          {personal.groupName || "Unknown"}
        </h4>
        <p className="text-muted mb-0">
          Mobile: {personal.mobileNo || "N/A"} | Group Code:{" "}
          {personal.groupCode || "N/A"}
        </p>
      </div>

      {/* Tabs for Edit Details and Call Task */}
      <Tabs activeKey={activeTab} onSelect={handleTabChange} className="mb-4">
        <Tab eventKey="editDetails" title="📝 Edit Personal Details">
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <FiEdit className="me-2" />
                Edit Personal Details
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleUpdatePersonalDetails}>
                {/* Salutation, Group Name, Gender */}
                <Row className="mb-3">
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Salutation</Form.Label>
                      <Form.Select
                        name="salutation"
                        value={formData.salutation}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      >
                        <option value="">Select</option>
                        <option>Mr.</option>
                        <option>Mrs.</option>
                        <option>Ms.</option>
                        <option>Mast.</option>
                        <option>Shri.</option>
                        <option>Smt.</option>
                        <option>Kum.</option>
                        <option>Kr.</option>
                        <option>Dr.</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Label>Group Head</Form.Label>
                      <Form.Control
                        name="groupName"
                        type="text"
                        value={formData.groupName}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Gender</Form.Label>
                      <Form.Select
                        name="gender"
                        value={formData.gender}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      >
                        <option value="">Select</option>
                        <option>Male</option>
                        <option>Female</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Organisation, Designation, Annual Income */}
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Organisation</Form.Label>
                      <Form.Control
                        name="organisation"
                        type="text"
                        value={formData.organisation}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Designation</Form.Label>
                      <Form.Control
                        name="designation"
                        type="text"
                        value={formData.designation}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Annual Income</Form.Label>
                      <Form.Select
                        name="annualIncome"
                        value={formData.annualIncome}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      >
                        <option value="">-- Select --</option>
                        {incomeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={1}>
                    <Form.Group>
                      <Form.Label>Grade</Form.Label>
                      <Form.Control
                        type="text"
                        name="grade"
                        value={formData.grade}
                        size="sm"
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Mobile, WhatsApp, Phone, Email */}
                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Mobile No</Form.Label>
                      <Form.Control
                        name="mobileNo"
                        type="text"
                        value={formData.mobileNo}
                        onChange={handleMobileWhatsappChange}
                        maxLength={10}
                        size="sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>WhatsApp No</Form.Label>
                      <Form.Control
                        name="whatsappNo"
                        type="text"
                        value={formData.whatsappNo}
                        maxLength={10}
                        onChange={handleMobileWhatsappChange}
                        size="sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Phone No</Form.Label>
                      <Form.Control
                        name="contactNo"
                        type="text"
                        maxLength={14}
                        value={`0755${formData.contactNo ?? ""}`}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactNo: e.target.value.replace(/^0755/, ""),
                          })
                        }
                        size="sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        name="emailId"
                        type="email"
                        value={formData.emailId}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* DOB and DOM */}
                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>DOB</Form.Label>
                      <Form.Control
                        name="dob"
                        type="date"
                        value={formData.dob}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>DOM</Form.Label>
                      <Form.Control
                        name="dom"
                        type="date"
                        value={formData.dom}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Residential Address */}
                <Row className="mb-3">
                  <Col md={1} className="mt-2">
                    <Form.Check
                      type="radio"
                      label="Resi."
                      name="preferredAddressType"
                      checked={formData.preferredAddressType === "resi"}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          preferredAddressType: "resi",
                        })
                      }
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        name="resiAddr"
                        type="text"
                        value={formData.resiAddr}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Landmark</Form.Label>
                      <Form.Control
                        name="resiLandmark"
                        type="text"
                        value={formData.resiLandmark}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Pincode</Form.Label>
                      <Form.Control
                        name="resiPincode"
                        type="text"
                        value={formData.resiPincode}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Office Address */}
                <Row className="mb-3">
                  <Col md={1} className="mt-2">
                    <Form.Check
                      type="radio"
                      label="Office"
                      name="preferredAddressType"
                      checked={formData.preferredAddressType === "office"}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          preferredAddressType: "office",
                        })
                      }
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        name="officeAddr"
                        type="text"
                        value={formData.officeAddr}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Landmark</Form.Label>
                      <Form.Control
                        name="officeLandmark"
                        type="text"
                        value={formData.officeLandmark}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Pincode</Form.Label>
                      <Form.Control
                        name="officePincode"
                        type="text"
                        value={formData.officePincode}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Preferred Meeting Address */}
                <Row className="mb-3">
                  <Col md={5}>
                    <Form.Group>
                      <Form.Label>Preferred Meeting Address</Form.Label>
                      <Form.Control
                        name="preferredMeetingAddr"
                        type="text"
                        value={formData.preferredMeetingAddr}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Preferred Meeting Area</Form.Label>
                      <Form.Control
                        name="preferredMeetingArea"
                        type="text"
                        value={formData.preferredMeetingArea}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Best Time</Form.Label>
                      <Form.Select
                        name="bestTime"
                        value={formData.bestTime}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      >
                        <option value="">-- Select Time --</option>
                        <option value="10 AM to 2 PM">10 AM to 2 PM</option>
                        <option value="2 PM to 7 PM">2 PM to 7 PM</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* LEAD SOURCE SECTION */}
                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Lead Source</Form.Label>
                      <Form.Select
                        name="leadSource"
                        value={formData.leadSource}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      >
                        <option value="">Select Lead Source</option>
                        {leadTypesLoading ? (
                          <option disabled>Loading...</option>
                        ) : (
                          leadTypes?.map((type) => (
                            <option
                              key={type._id}
                              value={type.leadType?.trim()}
                            >
                              {type.leadType?.trim()}
                            </option>
                          ))
                        )}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Lead Name</Form.Label>
                      <Form.Select
                        name="leadName"
                        value={formData.leadName}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      >
                        <option value="">Select Lead Name</option>
                        {leadsourceDetail?.map((src) => (
                          <option key={src._id} value={src.sourceName}>
                            {src.sourceName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* LEAD OCCUPATION */}
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Lead Occupation</Form.Label>
                      <Form.Select
                        name="leadOccupation"
                        value={formData.leadOccupation}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      >
                        <option value="">Select Lead Occupation</option>
                        {occupations?.map((occupation) => (
                          <option
                            key={occupation._id}
                            value={occupation.occupationName}
                          >
                            {occupation.occupationName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* LEAD OCCUPATION TYPE */}
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Lead Occupation Type</Form.Label>
                      <Form.Select
                        name="leadOccupationType"
                        value={formData.leadOccupationType}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      >
                        <option value="">Select Lead Occupation Type</option>
                        {occupationTypes?.map((type) => (
                          <option key={type._id} value={type.occupationType}>
                            {type.occupationType}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Calling Purpose */}
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Calling Purpose</Form.Label>
                      <Form.Select
                        name="callingPurpose"
                        value={formData.callingPurpose}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      >
                        <option value="">-- Select Purpose --</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Meeting Schedule">
                          Meeting Schedule
                        </option>
                        <option value="Query Resolution">
                          Query Resolution
                        </option>
                        <option value="Proposal Discussion">
                          Proposal Discussion
                        </option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Remarks */}
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Remarks</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="remark"
                        value={formData.remark}
                        onChange={handlePersonalDetailsChange}
                        size="sm"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Update Button */}
                <div className="text-center">
                  <Button variant="primary" type="submit" disabled={updating}>
                    {updating ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FiSave className="me-2" />
                        Update Personal Details
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline-secondary"
                    className="ms-2"
                    onClick={() => {
                      // Set current date and time before switching tab
                      setCurrentDateTime();
                      setActiveTab("callTask");
                    }}
                  >
                    Next: Add Call Task →
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="callTask" title="📞 Add Call Task">
          <Card>
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FiPhone className="me-2" />
                  Add Call Task
                </h5>
                <small className="text-light">
                  Auto-filled: {callTask.taskDate} {callTask.taskTime}
                </small>
              </div>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmitCallTask}>
                {/* Call Date, Time, Status */}
                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>
                        <FiCalendar className="me-1" />
                        Call Date <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="taskDate"
                        value={callTask.taskDate}
                        onChange={handleCallTaskChange}
                        min={getTodayDate()}
                        required
                      />
                      <small className="text-muted">
                        Automatically set to today
                      </small>
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>
                        <FiClock className="me-1" />
                        Call Time <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="time"
                        name="taskTime"
                        value={callTask.taskTime}
                        onChange={handleCallTaskChange}
                        required
                      />
                      <small className="text-muted">
                        Automatically set to current time
                      </small>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        Call Status <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        name="taskStatus"
                        value={callTask.taskStatus}
                        onChange={handleCallTaskChange}
                        required
                      >
                        <option value="">-- Select Status --</option>

                        {/* FORWARDED STATUSES */}
                        <optgroup label="Forwarded">
                          <option value="Call Not Picked">
                            Call Not Picked
                          </option>
                          <option value="Busy on Another Call">
                            Busy on Another Call
                          </option>
                          <option value="Call After Sometimes">
                            Call After Sometimes
                          </option>
                          <option value="Others">Others</option>
                        </optgroup>

                        {/* CLOSED STATUSES */}
                        <optgroup label="Closed">
                          <option value="Not Reachable">Not Reachable</option>
                          <option value="Wrong Number">Wrong Number</option>
                          <option value="Not Interested">Not Interested</option>
                          <option value="Appointment Scheduled">
                            Appointment Scheduled
                          </option>
                        </optgroup>

                        {/* ACTIVE STATUSES */}
                        <optgroup label="Active">
                          <option value="Callback">Callback</option>
                          <option value="Not Contacted">Not Contacted</option>
                        </optgroup>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Conditionally show Next Call Date/Time for forwarded calls */}
                {[
                  "Call Not Picked",
                  "Busy on Another Call",
                  "Call After Sometimes",
                  "Others",
                ].includes(callTask.taskStatus) && (
                  <Row className="mb-3">
                    <Col md={6}>
                      <Card className="border-info">
                        <Card.Header className="bg-info text-white py-2">
                          <small>
                            Next Follow-up Details (Required for forwarded
                            calls)
                          </small>
                        </Card.Header>
                        <Card.Body className="py-3">
                          <Row>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label>Next Call Date</Form.Label>
                                <Form.Control
                                  type="date"
                                  name="nextFollowUpDate"
                                  value={callTask.nextFollowUpDate}
                                  onChange={handleCallTaskChange}
                                  min={getTodayDate()}
                                  required
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label>Next Call Time</Form.Label>
                                <Form.Control
                                  type="time"
                                  name="nextFollowUpTime"
                                  value={callTask.nextFollowUpTime}
                                  onChange={handleCallTaskChange}
                                  required
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                )}

                {/* Conditionally show Appointment Date/Time for Appointment Scheduled */}
                {callTask.taskStatus === "Appointment Scheduled" && (
                  <Row className="mb-3">
                    <Col md={6}>
                      <Card className="border-success">
                        <Card.Header className="bg-success text-white py-2">
                          <small>
                            Appointment Details (Required for appointment)
                          </small>
                        </Card.Header>
                        <Card.Body className="py-3">
                          <Row>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label>Appointment Date</Form.Label>
                                <Form.Control
                                  type="date"
                                  name="nextAppointmentDate"
                                  value={callTask.nextAppointmentDate}
                                  onChange={handleCallTaskChange}
                                  min={getTodayDate()}
                                  required
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label>Appointment Time</Form.Label>
                                <Form.Control
                                  type="time"
                                  name="nextAppointmentTime"
                                  value={callTask.nextAppointmentTime}
                                  onChange={handleCallTaskChange}
                                  required
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                )}

                {/* Remarks */}
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>
                        <FiMessageSquare className="me-1" />
                        Remarks
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="taskRemarks"
                        placeholder="Enter call remarks..."
                        value={callTask.taskRemarks}
                        onChange={handleCallTaskChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Buttons */}
                <div className="text-center">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={submitting}
                    className="px-5"
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Adding...
                      </>
                    ) : (
                      <>
                        <FiCheck className="me-2" />
                        Add Call Task
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline-secondary"
                    className="ms-2"
                    onClick={() => setActiveTab("editDetails")}
                  >
                    ← Back to Edit Details
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {callHistory.length > 0 && (
            <div className="mt-4">
              <h6>Call History ({callHistory.length})</h6>
              <div className="table-responsive border rounded">
                <table className="table table-sm table-striped mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {callHistory.map((call, index) => (
                      <tr key={index}>
                        <td>
                          {new Date(call.taskDate).toLocaleDateString("en-GB")}
                        </td>
                        <td>{call.taskTime}</td>
                        <td>
                          <strong
                            className={`${
                              call.taskStatus === "Call Not Picked"
                                ? "text-info"
                                : call.taskStatus === "Appointment Scheduled"
                                ? "text-success"
                                : "text-primary"
                            }`}
                          >
                            {call.taskStatus}
                          </strong>
                        </td>
                        <td>{call.taskRemarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default SuspectDetailTelecaller;
