import React, { useState, useEffect } from "react";
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
import { fetchCallingPurposes } from "../../../redux/feature/CallingPurpose/CallingPurposeThunx";
import {
  splitGroupHeadName,
  joinGroupHeadName,
  sanitizePersonalDetailsGroupHead,
  GROUP_HEAD_NAME_PART_FIELDS,
} from "../../../utils/groupNameParts";

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
  onFormDataUpdate,
  changeTab,
}) => {
  const dispatch = useDispatch();

  const normalizeContactNo = (value = "") => String(value).replace(/^0755/, "");

  // ✅ UPDATED INITIAL STATE WITH NEW FIELDS (SAME AS PROSPECT)
  const initialFormState = {
    salutation: "",
    groupName: "",
    groupHeadName: "",
    groupHeadNameFirst: "",
    groupHeadNameMiddle: "",
    groupHeadNameLast: "",
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
    resiState: "",
    resiCity: "",
    resiArea: "",
    resiSubArea: "",
    resiPincode: "",
    officeAddr: "",
    officeState: "",
    officeCity: "",
    officeArea: "",
    officeSubArea: "",
    officePincode: "",
    preferredMeetingAddr: "",
    preferredMeetingArea: "",
    subArea: "", // ✅ NEW FIELD
    city: "",
    state: "",
    meetingLandmark: "",
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

  // ✅ NEW STATES FOR AREAS, SUBAREAS, RMS
  const [areas, setAreas] = useState([]);
  const [subAreas, setSubAreas] = useState([]);
  const [filteredResiSubAreas, setFilteredResiSubAreas] = useState([]);
  const [filteredOfficeSubAreas, setFilteredOfficeSubAreas] = useState([]);
  const [rms, setRms] = useState([]);
  const [filteredRms, setFilteredRms] = useState(null); // null = no filter
  const [cres, setCres] = useState([]);

  useEffect(() => {
    if (onFormDataUpdate) {
      onFormDataUpdate(sanitizePersonalDetailsGroupHead(formData));
    }
  }, [formData, onFormDataUpdate]);

  const { alldetails } = useSelector((state) => state.leadOccupation);
  const { alldetailsForTypes } = useSelector((state) => state.OccupationType);
  const { LeadType: leadTypes, loading } = useSelector(
    (state) => state.LeadType
  );
  const { callingPurposes, loading: callingPurposeLoading } = useSelector(
    (state) => state.callingPurpose
  );
  const { leadsourceDetail } = useSelector((state) => state.leadsource);

  // ✅ COMPONENT MOUNT - ALL DATA FETCH
  useEffect(() => {
    dispatch(fetchLeadType());
    dispatch(fetchCallingPurposes());
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
      const response = await axiosInstance.get("/api/employee/getAllEmployees?limit=1000");
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
      const pd = clientData.personalDetails || {};
      const combined = (pd.groupHeadName || pd.groupName || "").trim();
      const parts = splitGroupHeadName(combined);
      const joined = joinGroupHeadName(parts) || combined;
      const preferredOffice = pd.preferredAddressType === "office";
      setFormData({
        ...initialFormState,
        ...pd,
        contactNo: normalizeContactNo(pd.contactNo),
        groupHeadNameFirst: parts.first,
        groupHeadNameMiddle: parts.middle,
        groupHeadNameLast: parts.last,
        groupHeadName: joined,
        groupName: joined,
        resiCity:
          pd.resiCity ?? (!preferredOffice ? pd.city : "") ?? "",
        officeCity:
          pd.officeCity ?? (preferredOffice ? pd.city : "") ?? "",
        resiState:
          pd.resiState ?? (!preferredOffice ? pd.state : "") ?? "",
        officeState:
          pd.officeState ?? (preferredOffice ? pd.state : "") ?? "",
        resiArea:
          pd.resiArea ??
          (!preferredOffice ? pd.preferredMeetingArea : "") ??
          "",
        resiSubArea:
          pd.resiSubArea ?? (!preferredOffice ? pd.subArea : "") ?? "",
        officeArea:
          pd.officeArea ??
          (preferredOffice ? pd.preferredMeetingArea : "") ??
          "",
        officeSubArea:
          pd.officeSubArea ?? (preferredOffice ? pd.subArea : "") ?? "",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [isEdit, clientData]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      grade: gradeMap[prev.annualIncome] || "",
    }));
  }, [formData.annualIncome]);

  const filterSubsForAreaName = (areaName, setter) => {
    if (!areaName) {
      setter([]);
      return;
    }
    const selectedArea = areas.find((area) => area.name === areaName);
    if (selectedArea) {
      const filtered = subAreas.filter(
        (sub) =>
          sub.areaId &&
          (sub.areaId._id === selectedArea._id ||
            sub.areaId === selectedArea._id)
      );
      setter(filtered);
    } else {
      setter([]);
    }
  };

  useEffect(() => {
    filterSubsForAreaName(formData.resiArea, setFilteredResiSubAreas);
  }, [formData.resiArea, areas, subAreas]);

  useEffect(() => {
    filterSubsForAreaName(formData.officeArea, setFilteredOfficeSubAreas);
  }, [formData.officeArea, areas, subAreas]);

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
          resiArea: areaData.name,
          resiCity: areaData.city || "",
          city: areaData.city || "",
          resiSubArea: "",
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
          officeArea: areaData.name,
          officeCity: areaData.city || "",
          city: areaData.city || "",
          officeSubArea: "",
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

    setFormData((prev) => {
      const next = { ...prev, [name]: normalizedValue };
      if (GROUP_HEAD_NAME_PART_FIELDS.includes(name)) {
        const joined = joinGroupHeadName({
          first: next.groupHeadNameFirst,
          middle: next.groupHeadNameMiddle,
          last: next.groupHeadNameLast,
        });
        next.groupHeadName = joined;
        next.groupName = joined;
      }
      return next;
    });

    // ✅ When pincode changes, fetch area and update preferred meeting area
    if (
      (name === "resiPincode" || name === "officePincode") &&
      value.length === 6
    ) {
      fetchAreaData(normalizedValue).then((areaData) => {
        if (name === "resiPincode") {
          setFormData((prev) => {
            const next = {
              ...prev,
              resiCity: areaData.city || "",
              resiArea: areaData.name,
              resiSubArea: "",
            };
            if (prev.preferredAddressType === "resi") {
              next.preferredMeetingArea = areaData.name;
              next.city = areaData.city || "";
            }
            return next;
          });
        } else if (name === "officePincode") {
          setFormData((prev) => {
            const next = {
              ...prev,
              officeCity: areaData.city || "",
              officeArea: areaData.name,
              officeSubArea: "",
            };
            if (prev.preferredAddressType === "office") {
              next.preferredMeetingArea = areaData.name;
              next.city = areaData.city || "";
            }
            return next;
          });
        }
      });
    }
  };

  // ✅ Filter RMs by pincode (workPincode OR managedAreas[].pincode)
  const filterRMsByPincode = (pincode) => {
    if (!pincode || String(pincode).length !== 6) {
      setFilteredRms(null);
      return;
    }
    const matched = rms.filter((rm) => {
      const directMatch = String(rm.workPincode || "").trim() === String(pincode).trim();
      const managedMatch =
        Array.isArray(rm.managedAreas) &&
        rm.managedAreas.some(
          (a) => String(a.pincode || "").trim() === String(pincode).trim()
        );
      return directMatch || managedMatch;
    });
    setFilteredRms(matched.length > 0 ? matched : null);
  };

  // ✅ Trigger RM filter when relevant pincode or rms list changes
  useEffect(() => {
    const pin = formData.preferredAddressType === "office" ? formData.officePincode : formData.resiPincode;
    filterRMsByPincode(pin);
  }, [formData.resiPincode, formData.officePincode, formData.preferredAddressType, rms]);

  const handleMobileWhatsappChange = (e) => {
    const { name, value } = e.target;
    const numericValue = String(value).replace(/\D/g, "").slice(0, 10);

    setFormData((prev) => {
      let updated = { ...prev, [name]: numericValue };

      // ✅ agar mobileNo complete ho (10 digit) aur whatsapp edit nahi hua ho
      if (name === "mobileNo" && numericValue.length === 10 && !whatsappEdited) {
        updated.whatsappNo = numericValue;
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
        preferredMeetingArea: type === "resi" ? prev.resiArea : prev.officeArea,
        subArea: type === "resi" ? prev.resiSubArea : prev.officeSubArea,
      };
      if (type === "resi" && prev.resiPincode.length === 6) {
        fetchAreaData(prev.resiPincode).then((areaData) => {
          setFormData((prev) => ({
            ...prev,
            preferredMeetingArea: areaData.name,
            resiArea: areaData.name,
            resiCity: areaData.city || "",
            city: areaData.city || "",
            resiSubArea: "",
          }));
        });
      } else if (type === "office" && prev.officePincode.length === 6) {
        fetchAreaData(prev.officePincode).then((areaData) => {
          setFormData((prev) => ({
            ...prev,
            preferredMeetingArea: areaData.name,
            officeArea: areaData.name,
            officeCity: areaData.city || "",
            city: areaData.city || "",
            officeSubArea: "",
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
          personalDetails: sanitizePersonalDetailsGroupHead(formData),
        })
      );
      if (result) {
        setFormData(initialFormState);
        toast.info("Client details updated successfully");
        if (onClientCreated) onClientCreated(clientData._id);
      }
    } else {
      const resultAction = await dispatch(
        createClient({
          personalDetails: sanitizePersonalDetailsGroupHead(formData),
        })
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
        <Col md={1}>
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
              <option>Kr.</option>
              <option>Kum.</option>
              <option>Shri.</option>
              <option>Smt.</option>
              <option>Dr.</option>
              <option>Adv.</option>
              <option>Brig.</option>
              <option>Capt.</option>
              <option>Col.</option>
             
              <option>Gen.</option>
             
              <option>Lion</option>
              <option>Maj.</option>
              <option>Mast.</option>
              
              <option>Rtn.</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={8}>
          <Form.Group controlId="groupHeadNameParts">
            <Form.Label>Group head name</Form.Label>
            <div className="d-flex gap-1">
              <Form.Control
                name="groupHeadNameFirst"
                type="text"
                placeholder="First"
                value={formData.groupHeadNameFirst ?? ""}
                onChange={handleChange}
                size="sm"
                className="flex-grow-1"
                style={{ minWidth: 0 }}
              />
              <Form.Control
                name="groupHeadNameMiddle"
                type="text"
                placeholder="Middle"
                value={formData.groupHeadNameMiddle ?? ""}
                onChange={handleChange}
                size="sm"
                className="flex-grow-1"
                style={{ minWidth: 0 }}
              />
              <Form.Control
                name="groupHeadNameLast"
                type="text"
                placeholder="Last"
                value={formData.groupHeadNameLast ?? ""}
                onChange={handleChange}
                size="sm"
                className="flex-grow-1"
                style={{ minWidth: 0 }}
              />
            </div>
          </Form.Group>
        </Col>
        
        <Col md={1}>
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
          <Form.Group controlId="contactNo">
            <Form.Label>Phone No.</Form.Label>
            <Form.Control
              name="contactNo"
              type="text"
              value={formData.contactNo ?? ""}
              maxLength={10}
              onChange={handleMobileWhatsappChange}
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
      <Row className="mb-2 align-items-end gx-1">
        <Col xs={12} md={1} className="mt-1 mt-md-2">
          <Form.Check
            type="radio"
            label="Resi."
            name="preferredAddressType"
            checked={formData.preferredAddressType === "resi"}
            onChange={() => handleAddressTypeChange("resi")}
          />
        </Col>
        <Col xs={6} md={6}>
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
      
         <Col xs={6} md={1}>
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
        <Col xs={6} md={1}>
          <Form.Group controlId="resiCity">
            <Form.Label>City</Form.Label>
            <Form.Control
              name="resiCity"
              type="text"
              value={formData.resiCity ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col xs={4} md={2}>
          <Form.Group controlId="resiArea">
            <Form.Label>Area</Form.Label>
            <Form.Control
              name="resiArea"
              type="text"
              value={formData.resiArea ?? ""}
              onChange={handleChange}
              size="sm"
              readOnly
            />
          </Form.Group>
        </Col>
        <Col xs={8} md={1}>
          <Form.Group controlId="resiSubArea">
            <Form.Label>Sub Area</Form.Label>
            <Form.Select
              name="resiSubArea"
              value={formData.resiSubArea ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">Sub Area</option>
              {filteredResiSubAreas.map((sub) => (
                <option key={sub._id} value={sub.subAreaName}>
                  {sub.subAreaName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
       
      </Row>
      <Row className="mb-2 align-items-end gx-1">
        <Col xs={12} md={1} className="mt-1 mt-md-2">
          <Form.Check
            type="radio"
            label="Office"
            name="preferredAddressType"
            checked={formData.preferredAddressType === "office"}
            onChange={() => handleAddressTypeChange("office")}
          />
        </Col>
        <Col xs={6} md={6}>
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
       
        <Col xs={6} md={1}>
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
        <Col xs={6} md={1}>
          <Form.Group controlId="officeCity">
            <Form.Label>City</Form.Label>
            <Form.Control
              name="officeCity"
              type="text"
              value={formData.officeCity ?? ""}
              onChange={handleChange}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col xs={4} md={2}>
          <Form.Group controlId="officeArea">
            <Form.Label>Area</Form.Label>
            <Form.Control
              name="officeArea"
              type="text"
              value={formData.officeArea ?? ""}
              onChange={handleChange}
              size="sm"
              readOnly
            />
          </Form.Group>
        </Col>
        <Col xs={8} md={1}>
          <Form.Group controlId="officeSubArea">
            <Form.Label>Sub Area</Form.Label>
            <Form.Select
              name="officeSubArea"
              value={formData.officeSubArea ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">Sub Area</option>
              {filteredOfficeSubAreas.map((sub) => (
                <option key={sub._id} value={sub.subAreaName}>
                  {sub.subAreaName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        
      </Row>

      <Row className="mb-2 align-items-end gx-1">
        <Col xs={12} md={5}>
          <Form.Group controlId="preferredMeetingAddr">
            <Form.Label className="text-truncate d-block">
              Preferred Meeting Address
            </Form.Label>
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
        <Col xs={12} md={5}>
          <Form.Group controlId="meetingLandmark">
            <Form.Label>Landmark</Form.Label>
            <Form.Control
              name="meetingLandmark"
              type="text"
              value={formData.meetingLandmark ?? ""}
              onChange={handleChange}
              size="sm"
              placeholder="Near meeting point"
            />
          </Form.Group>
        </Col>
        <Col xs={6} md={1}>
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
        <Col xs={6} md={1}>
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
          <Form.Group controlId="leadOccupationType">
            <Form.Label>Occupation Type</Form.Label>
            <Form.Select
              name="leadOccupationType"
              value={formData.leadOccupationType ?? ""}
              onChange={(e) => {
                handleChange(e);
                setFormData((prev) => ({ ...prev, leadOccupationType: e.target.value, leadOccupation: "" }));
              }}
              size="sm"
            >
              <option value="">-- Select Type --</option>
              {Array.isArray(alldetailsForTypes) && alldetailsForTypes.map((type) => (
                <option key={type._id} value={type.occupationType}>
                  {type.occupationType}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="leadOccupation">
            <Form.Label>Occupation Name</Form.Label>
            <Form.Select
              name="leadOccupation"
              value={formData.leadOccupation ?? ""}
              onChange={handleChange}
              size="sm"
              disabled={!formData.leadOccupationType}
            >
              <option value="">{formData.leadOccupationType ? "-- Select Occupation --" : "Select type first"}</option>
              {Array.isArray(alldetails) && alldetails
                .filter((occ) => occ?.occupationType?.occupationType === formData.leadOccupationType)
                .map((occ) => (
                  <option key={occ._id} value={occ.occupationName}>
                    {occ.occupationName}
                  </option>
                ))
              }
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
              {callingPurposeLoading ? (
                <option disabled>Loading...</option>
              ) : (
                callingPurposes?.map((purpose) => (
                  <option key={purpose._id} value={purpose.purposeName}>
                    {purpose.purposeName}
                  </option>
                ))
              )}
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

        {/* <Col md={2}>
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
        </Col> */}

        {/* ✅ NEW ALLOCATED RM FIELD */}
        <Col md={5}>
          <Form.Group controlId="allocatedRM">
            <Form.Label>Allocated Employee Name & Designation</Form.Label>
            <Form.Select
              name="allocatedRM"
              value={formData.allocatedRM ?? ""}
              onChange={handleChange}
              size="sm"
            >
              <option value="">{filteredRms ? `-- ${filteredRms.length} Suggested RMs found --` : "-- Select RM --"}</option>
              {(filteredRms || rms).map((rm) => (
                <option key={rm._id} value={rm._id}>
                   {rm.employeeCode || rm.designation} - {rm.name} {filteredRms ? "(Suggested)" : ""}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col md={12}>
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
