import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Row, Col, Button } from "react-bootstrap";
import {
  createClient,
  updateClientPersonalDetails,
} from "../../../redux/feature/ClientRedux/ClientThunx";
import { fetchDetails } from "../../../redux/feature/LeadSource/LeadThunx";
import { getAllOccupations } from "../../../redux/feature/LeadOccupation/OccupationThunx";
import { getAllOccupationTypes } from "../../../redux/feature/OccupationType/OccupationThunx";
import { toast } from "react-toastify";
import axiosInstance from "../../../config/axios";
import { fetchLeadType } from "../../../redux/feature/LeadType/LeadTypeThunx";

const incomeOptions = [
  { value: "25 lakh to 1 Cr.", label: "25 lakh to 1 Cr." },
  { value: "5 to 25 lakh", label: "5 to 25 lakh" },
  { value: "2.5 to 5 lakh", label: "2.5 to 5 lakh" },
];

const gradeMap = {
  "25 lakh to 1 Cr.": 1,
  "5 to 25 lakh": 2,
  "2.5 to 5 lakh": 3,
};

const PersonalDetailsForm = ({
  isEdit,
  clientData,
  onClientCreated,
  setFamilyDetail,
  changeTab,
}) => {
  const dispatch = useDispatch();

  const normalizeContactNo = (value = "") => String(value).replace(/^0755/, "");

  // ✅ UPDATED INITIAL STATE WITH NEW FIELDS (SAME AS PROSPECT)
  const initialFormState = {
    salutation: "",
    groupName: "",
    groupHeadName: "",
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
    subArea: "", // ✅ NEW FIELD
    city: "",
    bestTime: "",
    time: "10:00 AM", // ✅ NEW TIME FIELD
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
    allocatedRM: "", // ✅ NEW FIELD FOR RM
    remark: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [occupations, setOccupations] = useState([]);
  const [occupationTypes, setOccupationTypes] = useState([]);
  const [whatsappEdited, setWhatsappEdited] = useState(false);
  const [resiPincodeError, setResiPincodeError] = useState("");
  const [officePincodeError, setOfficePincodeError] = useState("");
  const groupNameRef = useRef(null);

  // ✅ NEW STATES FOR AREAS, SUBAREAS, RMS
  const [areas, setAreas] = useState([]);
  const [subAreas, setSubAreas] = useState([]);
  const [filteredSubAreas, setFilteredSubAreas] = useState([]);
  const [rms, setRms] = useState([]);
  const [cres, setCres] = useState([]);

  const { alldetails } = useSelector((state) => state.leadOccupation);
  const { alldetailsForTypes } = useSelector((state) => state.OccupationType);
  const { LeadType: leadTypes, loading } = useSelector(
    (state) => state.LeadType
  );
  const { leadsourceDetail } = useSelector((state) => state.leadsource);

  // ✅ COMPONENT MOUNT - ALL DATA FETCH
  useEffect(() => {
    dispatch(fetchLeadType());
    dispatch(fetchDetails());
    dispatch(getAllOccupationTypes());
    dispatch(getAllOccupations());

    // ✅ FETCH AREAS, SUBAREAS AND RMS
    fetchAreas();
    fetchSubAreas();
    fetchRMs();

    fetchOccupations();
    fetchOccupationTypes();
  }, [dispatch]);

  // ✅ FETCH AREAS FUNCTION
  const fetchAreas = async () => {
    try {
      const response = await axiosInstance.get("/api/leadarea");
      if (response.data && Array.isArray(response.data)) {
        setAreas(response.data);
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  // ✅ FETCH SUBAREAS FUNCTION
  const fetchSubAreas = async () => {
    try {
      const response = await axiosInstance.get("/api/leadsubarea");
      if (response.data && Array.isArray(response.data)) {
        setSubAreas(response.data);
      }
    } catch (error) {
      console.error("Error fetching subareas:", error);
    }
  };

  // ✅ FETCH RMs (RELATIONSHIP MANAGERS) - SAME AS PROSPECT
  const fetchRMs = async () => {
    try {
      const response = await axiosInstance.get("/api/employee/getAllEmployees");
      let allEmployees = [];

      if (response.data) {
        if (response.data.success && Array.isArray(response.data.data)) {
          allEmployees = response.data.data;
        } else if (Array.isArray(response.data)) {
          allEmployees = response.data;
        } else if (
          response.data.employees &&
          Array.isArray(response.data.employees)
        ) {
          allEmployees = response.data.employees;
        }
      }

      // ✅ Filter only active RMs (Relationship Managers)
      const rmEmployees = allEmployees.filter((emp) => {
        const isActive =
          !emp.dateOfTermination &&
          !emp.terminationDate &&
          !emp.endDate &&
          (emp.status === undefined ||
            emp.status === null ||
            emp.status === "active" ||
            emp.status === "Active");

        const empRole = (
          emp.role ||
          emp.designation ||
          emp.position ||
          ""
        ).toLowerCase();
        const isRM =
          empRole.includes("rm") ||
          empRole.includes("relationship") ||
          empRole.includes("manager");

        return isActive && isRM;
      });

      const creEmployees = allEmployees.filter((emp) => {
        const isActive =
          !emp.dateOfTermination &&
          !emp.terminationDate &&
          !emp.endDate &&
          (emp.status === undefined ||
            emp.status === null ||
            emp.status === "active" ||
            emp.status === "Active");

        const empRole = (
          emp.role ||
          emp.designation ||
          emp.position ||
          ""
        ).toLowerCase();
        const isCRE = empRole.includes("cre") || empRole.includes("customer");

        return isActive && isCRE;
      });

      setRms(rmEmployees);
      setCres(creEmployees);
    } catch (error) {
      console.error("Error fetching RMs:", error);
    }
  };

  // ✅ FETCH OCCUPATIONS
  const fetchOccupations = async () => {
    try {
      const response = await axiosInstance.get("/api/occupation");
      if (response.data.success) {
        setOccupations(response.data.data);
      } else {
        console.error("Failed to fetch occupations:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching occupations:", error);
    }
  };

  // ✅ FETCH OCCUPATION TYPES
  const fetchOccupationTypes = async () => {
    try {
      const response = await axiosInstance.get("/api/occupation/types");
      if (response.data.success) {
        setOccupationTypes(response.data.data);
      } else {
        console.error(
          "Failed to fetch occupation types:",
          response.data.message
        );
      }
    } catch (error) {
      console.error("Error fetching occupation types:", error);
    }
  };

  useEffect(() => {
    if (isEdit && clientData) {
      setFormData({
        ...clientData.personalDetails,
        contactNo: normalizeContactNo(clientData.personalDetails?.contactNo),
      });
    } else {
      setFormData(initialFormState);
    }
  }, [isEdit, clientData]);

  useEffect(() => {
    if (groupNameRef.current) {
      groupNameRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      grade: gradeMap[prev.annualIncome] || "",
    }));
  }, [formData.annualIncome]);

  // ✅ FILTER SUBAREAS BASED ON SELECTED AREA (SAME AS PROSPECT)
  useEffect(() => {
    if (formData.preferredMeetingArea) {
      const selectedArea = areas.find(
        (area) => area.name === formData.preferredMeetingArea
      );
      if (selectedArea) {
        const filtered = subAreas.filter(
          (sub) =>
            sub.areaId &&
            (sub.areaId._id === selectedArea._id ||
              sub.areaId === selectedArea._id)
        );
        setFilteredSubAreas(filtered);
      } else {
        setFilteredSubAreas([]);
      }
    }
  }, [formData.preferredMeetingArea, areas, subAreas]);

  // ✅ FETCH AREA DATA WHEN PINCODE CHANGES
  const fetchAreaData = async (pincode) => {
    try {
      const response = await axiosInstance.get(
        `/api/leadarea?pincode=${pincode}`
      );
      const data = response.data;
      console.log("API Response:", data);

      if (data && Array.isArray(data)) {
        const area = data.find(
          (item) => String(item.pincode) === String(pincode)
        );
        return area || { name: "Area not found", city: "", _id: "" };
      } else {
        return { name: "No data received", city: "", _id: "" };
      }
    } catch (error) {
      console.error("Error fetching area data:", error);
      return { name: "Error fetching area", city: "", _id: "" };
    }
  };

  useEffect(() => {
    const updatePreferredData = async () => {
      if (
        formData.preferredAddressType === "resi" &&
        formData.resiPincode.length === 6
      ) {
        const areaData = await fetchAreaData(formData.resiPincode);
        setFormData((prev) => ({
          ...prev,
          preferredMeetingAddr: prev.resiAddr,
          preferredMeetingArea: areaData.name,
          city: areaData.city,
        }));
      } else if (
        formData.preferredAddressType === "office" &&
        formData.officePincode.length === 6
      ) {
        const areaData = await fetchAreaData(formData.officePincode);
        setFormData((prev) => ({
          ...prev,
          preferredMeetingAddr: prev.officeAddr,
          preferredMeetingArea: areaData.name,
          city: areaData.city,
        }));
      }
    };
    updatePreferredData();
  }, [
    formData.preferredAddressType,
    formData.resiPincode,
    formData.officePincode,
    formData.resiAddr,
    formData.officeAddr,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const digitOnlyFields = [
      "mobileNo",
      "whatsappNo",
      "paMobileNo",
      "resiPincode",
      "officePincode",
    ];
    const cleanedValue = digitOnlyFields.includes(name)
      ? String(value).replace(/\D/g, "")
      : value;
    const normalizedValue =
      name === "contactNo" ? normalizeContactNo(cleanedValue) : cleanedValue;

    if (name === "resiPincode") {
      if (!normalizedValue) {
        setResiPincodeError("");
      } else if (!/^\d{6}$/.test(normalizedValue)) {
        setResiPincodeError("Residential pincode must be exactly 6 digits.");
      } else {
        setResiPincodeError("");
      }
    }

    if (name === "officePincode") {
      if (!normalizedValue) {
        setOfficePincodeError("");
      } else if (!/^\d{6}$/.test(normalizedValue)) {
        setOfficePincodeError("Office pincode must be exactly 6 digits.");
      } else {
        setOfficePincodeError("");
      }
    }

    setFormData((prev) => ({ ...prev, [name]: normalizedValue }));

    // ✅ When pincode changes, fetch area and update preferred meeting area
    if (
      (name === "resiPincode" || name === "officePincode") &&
      value.length === 6
    ) {
      fetchAreaData(normalizedValue).then((areaData) => {
        if (
          name === "resiPincode" &&
          formData.preferredAddressType === "resi"
        ) {
          setFormData((prev) => ({
            ...prev,
            preferredMeetingArea: areaData.name,
            city: areaData.city,
          }));
        } else if (
          name === "officePincode" &&
          formData.preferredAddressType === "office"
        ) {
          setFormData((prev) => ({
            ...prev,
            preferredMeetingArea: areaData.name,
            city: areaData.city,
          }));
        }
      });
    }
  };

  const handleMobileWhatsappChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let updated = { ...prev, [name]: value };

      // ✅ agar mobileNo complete ho (10 digit) aur whatsapp edit nahi hua ho
      if (name === "mobileNo" && value.length === 10 && !whatsappEdited) {
        updated.whatsappNo = value;
      }

      return updated;
    });

    if (name === "whatsappNo") {
      setWhatsappEdited(true);
    }
  };

  const handleAddressTypeChange = (type) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        preferredAddressType: type,
        preferredMeetingAddr: type === "resi" ? prev.resiAddr : prev.officeAddr,
      };
      if (type === "resi" && prev.resiPincode.length === 6) {
        fetchAreaData(prev.resiPincode).then((areaData) => {
          setFormData((prev) => ({
            ...prev,
            preferredMeetingArea: areaData.name,
            city: areaData.city,
          }));
        });
      } else if (type === "office" && prev.officePincode.length === 6) {
        fetchAreaData(prev.officePincode).then((areaData) => {
          setFormData((prev) => ({
            ...prev,
            preferredMeetingArea: areaData.name,
            city: areaData.city,
          }));
        });
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.resiPincode && !/^\d{6}$/.test(formData.resiPincode)) {
      setResiPincodeError("Residential pincode must be exactly 6 digits.");
      toast.error("Please enter a valid 6-digit residential pincode.");
      return;
    }

    if (formData.officePincode && !/^\d{6}$/.test(formData.officePincode)) {
      setOfficePincodeError("Office pincode must be exactly 6 digits.");
      toast.error("Please enter a valid 6-digit office pincode.");
      return;
    }

    if (isEdit && clientData?._id) {
      console.log(formData);
      const result = await dispatch(
        updateClientPersonalDetails({
          id: clientData._id,
          personalDetails: formData,
        })
      );
      if (result) {
        setFormData(initialFormState);
        toast.info("Client details updated successfully");
        if (onClientCreated) onClientCreated(clientData._id);
      }
    } else {
      const resultAction = await dispatch(
        createClient({ personalDetails: formData })
      );
      if (resultAction) {
        toast.success("Client Created Successfully");
        setFamilyDetail(formData);
        changeTab("family");
        const clientId = resultAction?.payload;
        if (onClientCreated && clientId) onClientCreated(clientId);
      }
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="small compact-client-form">
      <style>
        {`
          .compact-client-form .row {
            --bs-gutter-x: 0.5rem;
            --bs-gutter-y: 0.25rem;
            margin-bottom: 0.35rem !important;
          }
          .compact-client-form .form-group {
            margin-bottom: 0.2rem;
          }
          .compact-client-form .form-label {
            margin-bottom: 0.2rem;
            font-size: 0.74rem;
            font-weight: 500;
            line-height: 1.1;
          }
          .compact-client-form .form-control,
          .compact-client-form .form-select {
            min-height: 30px;
            padding: 0.18rem 0.45rem;
            font-size: 0.78rem;
          }
          .compact-client-form textarea.form-control {
            min-height: 56px;
          }
          .compact-client-form .btn {
            margin-top: 0.25rem;
          }
        `}
      </style>
      <Row className="mb-2 align-items-end">
        <Col md={2}>
          <Form.Group controlId="salutation">
            <Form.Label>Salutation</Form.Label>
            <Form.Select
              name="salutation"
              value={formData.salutation ?? ""}
              onChange={handleChange}
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
        <Col md={2}>
          <Form.Group controlId="groupName">
            <Form.Label>Group Name</Form.Label>
            <Form.Control
              ref={groupNameRef}
              name="groupName"
              type="text"
              value={formData.groupName ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="groupHeadName">
            <Form.Label>Group Head Name</Form.Label>
            <Form.Control
              name="groupHeadName"
              type="text"
              value={formData.groupHeadName ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="emailId">
            <Form.Label>Email Id</Form.Label>
            <Form.Control
              name="emailId"
              type="email"
              value={formData.emailId ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="gender">
            <Form.Label>Gender</Form.Label>
            <Form.Select
              name="gender"
              value={formData.gender ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={1}>
          <Form.Group controlId="annualIncome">
            <Form.Label style={{ color: "#00008B" }} className="fw-medium">
              Annual Income
            </Form.Label>
            <Form.Select
              name="annualIncome"
              value={formData.annualIncome ?? ""}
              onChange={handleChange}
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
          <Form.Group controlId="grade">
            <Form.Label style={{ color: "#00008B" }} className="fw-medium">
              Grade
            </Form.Label>
            <Form.Control
              type="text"
              name="grade"
              value={formData.grade ?? ""}
              size="sm"
              readOnly
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col md={2}>
          <Form.Group controlId="organisation">
            <Form.Label>Organisation</Form.Label>
            <Form.Control
              name="organisation"
              type="text"
              value={formData.organisation ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="designation">
            <Form.Label>Designation</Form.Label>
            <Form.Control
              name="designation"
              type="text"
              value={formData.designation ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="mobileNo">
            <Form.Label>Mobile No*</Form.Label>
            <Form.Control
              name="mobileNo"
              type="text"
              value={formData.mobileNo ?? ""}
              onChange={handleMobileWhatsappChange}
              maxLength={10}
              size="sm"
              required
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="whatsappNo">
            <Form.Label>WhatsApp No</Form.Label>
            <Form.Control
              name="whatsappNo"
              type="text"
              value={formData.whatsappNo ?? ""}
              maxLength={10}
              onChange={handleMobileWhatsappChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="paName">
            <Form.Label>PA Name</Form.Label>
            <Form.Control
              name="paName"
              type="text"
              value={formData.paName ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="paMobileNo">
            <Form.Label>PA Mobile No</Form.Label>
            <Form.Control
              name="paMobileNo"
              type="tel"
              maxLength={10}
              value={formData.paMobileNo ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col md={1} className="mt-2">
          <Form.Check
            type="radio"
            label="Resi."
            name="preferredAddressType"
            checked={formData.preferredAddressType === "resi"}
            onChange={() => handleAddressTypeChange("resi")}
          />
        </Col>
        <Col md={6}>
          <Form.Group controlId="resiAddr">
            <Form.Label>Address</Form.Label>
            <Form.Control
              name="resiAddr"
              type="text"
              value={formData.resiAddr ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="resiLandmark">
            <Form.Label>Landmark</Form.Label>
            <Form.Control
              name="resiLandmark"
              type="text"
              value={formData.resiLandmark ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="resiPincode">
            <Form.Label>Pincode</Form.Label>
            <Form.Control
              name="resiPincode"
              type="text"
              maxLength={6}
              value={formData.resiPincode ?? ""}
              onChange={handleChange}
              size="sm"
              isInvalid={Boolean(resiPincodeError)}
            />
            <Form.Control.Feedback type="invalid">
              {resiPincodeError}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col md={1} className="mt-2">
          <Form.Check
            type="radio"
            label="Office"
            name="preferredAddressType"
            checked={formData.preferredAddressType === "office"}
            onChange={() => handleAddressTypeChange("office")}
          />
        </Col>
        <Col md={6}>
          <Form.Group controlId="officeAddr">
            <Form.Label>Address</Form.Label>
            <Form.Control
              name="officeAddr"
              type="text"
              value={formData.officeAddr ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="officeLandmark">
            <Form.Label>Landmark</Form.Label>
            <Form.Control
              name="officeLandmark"
              type="text"
              value={formData.officeLandmark ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="officePincode">
            <Form.Label>Pincode</Form.Label>
            <Form.Control
              name="officePincode"
              type="text"
              maxLength={6}
              value={formData.officePincode ?? ""}
              onChange={handleChange}
              size="sm"
              isInvalid={Boolean(officePincodeError)}
            />
            <Form.Control.Feedback type="invalid">
              {officePincodeError}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* ✅ UPDATED SECTION WITH SUBAREA AND TIME (SAME LINE FOR BETTER UX) */}
      <Row className="mb-2">
        <Col md={4}>
          <Form.Group controlId="preferredMeetingAddr">
            <Form.Label>Preferred Meeting Address</Form.Label>
            <Form.Control
              name="preferredMeetingAddr"
              type="text"
              value={formData.preferredMeetingAddr ?? ""}
              onChange={handleChange}
              size="sm"
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="preferredMeetingArea">
            <Form.Label>Area</Form.Label>
            <Form.Control
              name="preferredMeetingArea"
              type="text"
              value={formData.preferredMeetingArea ?? ""}
              onChange={handleChange}
              size="sm"
              readOnly
            />
          </Form.Group>
        </Col>

        {/* ✅ NEW SUBAREA FIELD */}
        <Col md={2}>
          <Form.Group controlId="subArea">
            <Form.Label>Sub Area</Form.Label>
            <Form.Select
              name="subArea"
              value={formData.subArea ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">-Select Sub Area-</option>
              {filteredSubAreas.map((subArea) => (
                <option key={subArea._id} value={subArea.subAreaName}>
                  {subArea.subAreaName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={1}>
          <Form.Group controlId="city">
            <Form.Label>City</Form.Label>
            <Form.Control
              name="city"
              type="text"
              value={formData.city ?? ""}
              onChange={handleChange}
              size="sm"
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={1}>
          <Form.Group controlId="bestTime">
            <Form.Label>Best Time</Form.Label>
            <Form.Select
              name="bestTime"
              value={formData.bestTime ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">-- Select Time Slot --</option>
              <option value="10 AM to 2 PM">10 AM to 2 PM</option>
              <option value="2 PM to 7 PM">2 PM to 7 PM</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={2}>
          <Form.Group controlId="time">
            <Form.Label>Specific Time</Form.Label>
            <Form.Control
              name="time"
              type="text"
              value={formData.time ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-2">
        <Col md={3}>
          <Form.Group controlId="hobbies">
            <Form.Label>Hobbies</Form.Label>
            <Form.Control
              name="hobbies"
              type="text"
              value={formData.hobbies ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="nativePlace">
            <Form.Label>Native Place</Form.Label>
            <Form.Control
              name="nativePlace"
              type="text"
              value={formData.nativePlace ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="socialLink">
            <Form.Label>Social Link</Form.Label>
            <Form.Control
              name="socialLink"
              type="text"
              value={formData.socialLink ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="habits">
            <Form.Label>Habits</Form.Label>
            <Form.Control
              name="habits"
              type="text"
              value={formData.habits ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col md={3}>
          <Form.Group controlId="leadSource">
            <Form.Label>Lead Source</Form.Label>
            <Form.Select
              name="leadSource"
              value={formData.leadSource ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">Select Lead Source</option>
              {loading ? (
                <option disabled>Loading...</option>
              ) : (
                leadTypes?.map((type) => (
                  <option key={type._id} value={type.leadType.trim()}>
                    {type.leadType.trim()}
                  </option>
                ))
              )}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="leadName">
            <Form.Label>Lead Name</Form.Label>
            <Form.Select
              name="leadName"
              value={formData.leadName ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">Select Lead Name</option>
              {loading ? (
                <option disabled>Loading...</option>
              ) : (
                leadsourceDetail?.map((src) => (
                  <option key={src._id} value={src.sourceName}>
                    {src.sourceName}
                  </option>
                ))
              )}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="leadOccupation">
            <Form.Label>Lead Occupation</Form.Label>
            <Form.Select
              name="leadOccupation"
              value={formData.leadOccupation ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">Select Lead Occupation</option>
              {occupations.map((occupation) => (
                <option key={occupation._id} value={occupation.occupationName}>
                  {occupation.occupationName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="leadOccupationType">
            <Form.Label>Lead Occupation Type</Form.Label>
            <Form.Select
              name="leadOccupationType"
              value={formData.leadOccupationType ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">Select Lead Occupation Type</option>
              {occupationTypes.map((type) => (
                <option key={type._id} value={type.occupationType}>
                  {type.occupationType}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col md={4}>
          <Form.Group controlId="callingPurpose">
            <Form.Label>Calling or Meeting Purpose</Form.Label>
            <Form.Select
              name="callingPurpose"
              value={formData.callingPurpose ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">-- Select Purpose --</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Meeting Schedule">Meeting Schedule</option>
              <option value="Query Resolution">Query Resolution</option>
              <option value="Proposal Discussion">Proposal Discussion</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="name">
            <Form.Label>Purpose name / Task name</Form.Label>
            <Form.Control
              name="name"
              type="text"
              value={formData.name ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>

        <Col md={2}>
          <Form.Group controlId="allocatedCRE">
            <Form.Label>Allocated CRE</Form.Label>
            <Form.Select
              name="allocatedCRE"
              value={formData.allocatedCRE ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">-- Select CRE --</option>
              {cres.map((cre) => (
                <option key={cre._id} value={cre._id}>
                  {cre.name} - {cre.employeeCode || cre.designation}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* ✅ NEW ALLOCATED RM FIELD */}
        <Col md={2}>
          <Form.Group controlId="allocatedRM">
            <Form.Label>Allocated R. Manager</Form.Label>
            <Form.Select
              name="allocatedRM"
              value={formData.allocatedRM ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">-- Select RM --</option>
              {rms.map((rm) => (
                <option key={rm._id} value={rm._id}>
                  {rm.name} - {rm.employeeCode || rm.designation}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col md={9}>
          <Form.Group controlId="remark">
            <Form.Label>Remark</Form.Label>
            <Form.Control
              name="remark"
              as="textarea"
              rows={2}
              value={formData.remark ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
      </Row>
      <Button type="submit" className="btn btn-primary btn-sm">
        {isEdit && clientData?._id ? "Update" : "Create"}
      </Button>
    </Form>
  );
};

export default PersonalDetailsForm;
