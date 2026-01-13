import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Row, Col } from "react-bootstrap";
import { fetchDetails } from "../../../redux/feature/LeadSource/LeadThunx";
import { getAllOccupations } from "../../../redux/feature/LeadOccupation/OccupationThunx";
import { getAllOccupationTypes } from "../../../redux/feature/OccupationType/OccupationThunx";
import { fetchLeadType } from "../../../redux/feature/LeadType/LeadTypeThunx";
import axiosInstance from "../../../config/axios";

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

const PersonalDetailsFormForSuspect = ({
  isEdit,
  suspectData,
  onFormDataUpdate,
}) => {
  const dispatch = useDispatch();

  const initialFormState = {
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
    subArea: "",
    city: "",
    bestTime: "",
    time: "10:00 AM",
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
    remark: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const { leadsourceDetail } = useSelector((state) => state.leadsource);
  const { alldetails } = useSelector((state) => state.leadOccupation);
  const { alldetailsForTypes } = useSelector((state) => state.OccupationType);
  const { LeadType: leadTypes, loading } = useSelector(
    (state) => state.LeadType
  );
  const [occupationTypes, setOccupationTypes] = useState([]);
  const [occupations, setOccupations] = useState([]);
  const [whatsappEdited, setWhatsappEdited] = useState(false);

  const [areas, setAreas] = useState([]);
  const [subAreas, setSubAreas] = useState([]);
  const [filteredSubAreas, setFilteredSubAreas] = useState([]);

  useEffect(() => {
    dispatch(fetchLeadType());
    dispatch(fetchDetails());
    dispatch(getAllOccupationTypes());
    dispatch(getAllOccupations());

    fetchAreas();
    fetchSubAreas();
    fetchOccupations();
    fetchOccupationTypes();
  }, [dispatch]);

  // Load data when editing
  useEffect(() => {
    if (isEdit && suspectData) {
      const data = suspectData.personalDetails || initialFormState;
      setFormData(data);
      if (onFormDataUpdate) onFormDataUpdate(data);
    }
  }, [isEdit, suspectData]);

  // Notify parent when form data changes
  useEffect(() => {
    if (onFormDataUpdate) {
      onFormDataUpdate(formData);
    }
  }, [formData, onFormDataUpdate]);

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
    setFormData((prev) => ({
      ...prev,
      grade: gradeMap[prev.annualIncome] || "",
    }));
  }, [formData.annualIncome]);

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

  const fetchAreaData = async (pincode) => {
    try {
      const response = await axiosInstance.get(
        `/api/leadarea?pincode=${pincode}`
      );
      const data = response.data;

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
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (
      (name === "resiPincode" || name === "officePincode") &&
      value.length === 6
    ) {
      fetchAreaData(value).then((areaData) => {
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

  return (
    <Form>
      {/* Salutation, Group Head, Gender */}
      <Row className="mb-4">
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
        <Col md={5}>
          <Form.Group controlId="groupName">
            <Form.Label>Group Name*</Form.Label>
            <Form.Control
              name="groupName"
              type="text"
              placeholder="Group Head"
              value={formData.groupName ?? ""}
              onChange={handleChange}
              size="sm"
              required
            />
          </Form.Group>
        </Col>
        <Col md={3}>
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
      </Row>

      {/* Organisation, Designation, Annual Income, Grade */}
      <Row className="mb-4">
        <Col md={4}>
          <Form.Group controlId="organisation">
            <Form.Label>Organisation</Form.Label>
            <Form.Control
              name="organisation"
              type="text"
              placeholder="Organisation"
              value={formData.organisation ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="designation">
            <Form.Label>Designation</Form.Label>
            <Form.Control
              name="designation"
              type="text"
              placeholder="Designation"
              value={formData.designation ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
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

      {/* Contact Information */}
      <Row className="mb-4">
        <Col md={3}>
          <Form.Group controlId="mobileNo">
            <Form.Label>Mobile No*</Form.Label>
            <Form.Control
              name="mobileNo"
              type="text"
              placeholder="Mobile No"
              value={formData.mobileNo ?? ""}
              onChange={handleMobileWhatsappChange}
              maxLength={10}
              size="sm"
              required
            />
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group controlId="whatsappNo">
            <Form.Label>WhatsApp No</Form.Label>
            <Form.Control
              name="whatsappNo"
              type="text"
              placeholder="WhatsApp No"
              value={formData.whatsappNo ?? ""}
              maxLength={10}
              onChange={handleMobileWhatsappChange}
              size="sm"
            />
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group controlId="contactNo">
            <Form.Label>Phone No</Form.Label>
            <Form.Control
              name="contactNo"
              type="text"
              placeholder="Phone No"
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
          <Form.Group controlId="emailId">
            <Form.Label>Email Id</Form.Label>
            <Form.Control
              name="emailId"
              type="email"
              placeholder="Email Id"
              value={formData.emailId ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
      </Row>

      {/* PA Details and Identification */}
      <Row className="mb-4">
        <Col md={3}>
          <Form.Group controlId="paName">
            <Form.Label>PA Name</Form.Label>
            <Form.Control
              name="paName"
              type="text"
              placeholder="PA Name"
              value={formData.paName ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="paMobileNo">
            <Form.Label>PA Mobile No</Form.Label>
            <Form.Control
              name="paMobileNo"
              type="tel"
              maxLength={10}
              placeholder="PA Mobile No"
              value={formData.paMobileNo ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="adharNumber">
            <Form.Label>Aadhar No</Form.Label>
            <Form.Control
              name="adharNumber"
              type="text"
              placeholder="Aadhar Number"
              maxLength={12}
              value={formData.adharNumber ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="panCardNumber">
            <Form.Label>PAN No.</Form.Label>
            <Form.Control
              name="panCardNumber"
              type="text"
              placeholder="PAN Number"
              value={formData.panCardNumber ?? ""}
              onChange={handleChange}
              maxLength={10}
              size="sm"
              style={{ textTransform: "uppercase" }}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Residential Address */}
      <Row className="mb-4">
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
              placeholder="Residential Address"
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
              placeholder="Residential Landmark"
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
              placeholder="Residential Pincode"
              value={formData.resiPincode ?? ""}
              onChange={handleChange}
              size="sm"
              maxLength={6}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Office Address */}
      <Row className="mb-4">
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
              placeholder="Office Address"
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
              placeholder="Office Landmark"
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
              placeholder="Office Pincode"
              value={formData.officePincode ?? ""}
              onChange={handleChange}
              size="sm"
              maxLength={6}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Section with Subarea and Time */}
      <Row className="mb-4">
        <Col md={5}>
          <Form.Group controlId="preferredMeetingAddr">
            <Form.Label>Preferred Meeting Address</Form.Label>
            <Form.Control
              name="preferredMeetingAddr"
              type="text"
              placeholder="Preferred Meeting Address"
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
              placeholder="Area"
              value={formData.preferredMeetingArea ?? ""}
              onChange={handleChange}
              size="sm"
              readOnly
            />
          </Form.Group>
        </Col>

        {/* Subarea Field */}
        <Col md={2}>
          <Form.Group controlId="subArea">
            <Form.Label>Sub Area</Form.Label>
            <Form.Select
              name="subArea"
              value={formData.subArea ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">-- Select Sub Area --</option>
              {filteredSubAreas.map((subArea) => (
                <option key={subArea._id} value={subArea.subAreaName}>
                  {subArea.subAreaName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={2}>
          <Form.Group controlId="city">
            <Form.Label>City</Form.Label>
            <Form.Control
              name="city"
              type="text"
              placeholder="City"
              value={formData.city ?? ""}
              onChange={handleChange}
              size="sm"
              readOnly
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Time Section with Specific Time Field */}
      <Row className="mb-4">
        <Col md={2}>
          <Form.Group controlId="bestTime">
            <Form.Label>Best Time Slot</Form.Label>
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

        {/* Specific Time Field */}
        <Col md={2}>
          <Form.Group controlId="time">
            <Form.Label>Specific Time</Form.Label>
            <Form.Control
              name="time"
              type="text"
              placeholder="e.g., 10:30 AM"
              value={formData.time ?? ""}
              onChange={handleChange}
              size="sm"
            />
            <Form.Text className="text-muted">Demo time field</Form.Text>
          </Form.Group>
        </Col>

        <Col md={8}>{/* Empty for spacing */}</Col>
      </Row>

      {/* Personal Interests */}
      <Row className="mb-4">
        <Col md={3}>
          <Form.Group controlId="hobbies">
            <Form.Label>Hobbies</Form.Label>
            <Form.Control
              name="hobbies"
              type="text"
              placeholder="Hobbies"
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
              placeholder="Native Place"
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
              placeholder="Social Link"
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
              placeholder="Habits"
              value={formData.habits ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Lead Information */}
      <Row className="mb-4">
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

      {/* Calling Purpose */}
      <Row className="mb-4">
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
        <Col md={4}>
          <Form.Group controlId="name">
            <Form.Label>Purpose name / Task name</Form.Label>
            <Form.Control
              name="name"
              type="text"
              placeholder="Name"
              value={formData.name ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Remarks */}
      <Row className="mb-4">
        <Col md={9}>
          <Form.Group controlId="remark">
            <Form.Label>Remark</Form.Label>
            <Form.Control
              name="remark"
              as="textarea"
              rows={2}
              placeholder="Remark"
              value={formData.remark ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default PersonalDetailsFormForSuspect;
