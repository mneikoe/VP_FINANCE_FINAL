import React, { useState, useEffect } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  Tabs,
  Tab,
  Container,
  Alert,
  Modal,
} from "react-bootstrap";
import axios from "axios";
import {
  FaTimes,
  FaUser,
  FaBriefcase,
  FaUniversity,
  FaBell,
} from "react-icons/fa";

const EmployeeAddFormModal = ({ candidate, onClose, onEmployeeAdded }) => {
  const [formData, setFormData] = useState({
    // Personal
    name: "",
    gender: "",
    dob: "",
    marriageDate: "",
    mobileNo: "",
    emailId: "",
    panNo: "",
    aadharNo: "",
    presentAddress: "",
    permanentAddress: "",
    homeTown: "",
    familyContactPerson: "",
    familyContactMobile: "",
    emergencyContactPerson: "",
    emergencyContactMobile: "",

    // Official
    designation: "",
    employeeCode: "",
    officeMobile: "",
    officeEmail: "",
    password: "123456",
    confirmPassword: "123456",
    allottedLoginId: "",
    allocatedWorkArea: "",
    dateOfJoining: new Date().toISOString().split("T")[0],
    dateOfTermination: "",
    salaryOnJoining: "",
    expenses: "",
    incentives: "",
    officeKit: "",
    offerLetter: "",
    undertaking: "",
    trackRecord: "",
    drawerKeyName: "",
    drawerKeyNumber: "",
    officeKey: "",
    allotmentDate: "",
    role: "", // Role field

    // Bank
    bankName: "",
    accountNo: "",
    ifscCode: "",
    micr: "",

    // Alerts
    onFirstJoining: "",
    onSixMonthCompletion: "",
    onTwelveMonthCompletion: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");

  // Role options with designations
  const roleOptions = [
    {
      value: "Telecaller",
      label: "📞 Telecaller",
      designation: "Telecaller Executive",
    },
    {
      value: "Telemarketer",
      label: "💼 Telemarketer",
      designation: "Telemarketing Executive",
    },
    { value: "OE", label: "👨‍💼 OE", designation: "Operation Executive" },
    { value: "HR", label: "👥 HR", designation: "HR Executive" },
    { value: "RM", label: "🤵 RM", designation: "Relationship Manager" },
  ];

  // Generate employee code
  const generateEmployeeCode = (role) => {
    const roleCodes = {
      Telecaller: "TC",
      Telemarketer: "TM",
      OE: "OE",
      HR: "HR",
      RM: "RM",
    };

    const roleCode = roleCodes[role] || "EMP";
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `${roleCode}${randomNum}`;
  };

  // Auto-fill form from candidate data
  useEffect(() => {
    if (candidate) {
      const generatedCode = generateEmployeeCode("Employee"); // Default role

      setFormData((prev) => ({
        ...prev,
        // Personal details from candidate
        name: candidate.candidateName || "",
        mobileNo: candidate.mobileNo || "",
        emailId: candidate.email || "",
        designation: candidate.appliedFor?.designation || "",

        // Auto-generated fields
        employeeCode: generatedCode,
        allottedLoginId: generatedCode,
        dateOfJoining: new Date().toISOString().split("T")[0],

        // Additional candidate data if available
        presentAddress: candidate.location || "",
        permanentAddress: candidate.nativePlace || "",
        salaryOnJoining: candidate.salaryExpectation || "",
      }));
    }
  }, [candidate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Auto-generate employee code and designation when role is selected
  useEffect(() => {
    if (formData.role) {
      const generatedCode = generateEmployeeCode(formData.role);
      const selectedRole = roleOptions.find(
        (role) => role.value === formData.role
      );
      const designation = selectedRole
        ? selectedRole.designation
        : formData.role;

      setFormData((prev) => ({
        ...prev,
        employeeCode: generatedCode,
        allottedLoginId: generatedCode,
        designation: designation,
      }));
    }
  }, [formData.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.role) {
      setError("Please select a role");
      setLoading(false);
      return;
    }

    if (!formData.name) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (!formData.emailId) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    if (!formData.mobileNo) {
      setError("Mobile number is required");
      setLoading(false);
      return;
    }

    try {
      console.log("📤 Sending employee data:", formData);

      // Use the same API endpoint as EmployeeAddForm
      const response = await axios.post("/api/employee/addEmployee", formData);

      console.log("✅ API Response:", response.data);

      if (response.data && response.data.success) {
        setSuccess(
          `Employee added successfully! Login: ${formData.employeeCode} / 123456`
        );

        // Also update candidate status to "Added as Employee"
        await axios.put(`/api/addcandidate/${candidate._id}/stage`, {
          currentStage: "Added as Employee",
          currentStatus: "Added as Employee",
        });

        setTimeout(() => {
          onEmployeeAdded();
        }, 2000);
      } else {
        setError(response.data.message || "Failed to add employee");
      }
    } catch (err) {
      console.error("❌ API Error:", err);
      setError(err.response?.data?.message || "Error adding employee");
    } finally {
      setLoading(false);
    }
  };

  const renderFields = (fields) =>
    fields.map((field, i) => (
      <Col md={4} key={i}>
        <Form.Group className="mb-3">
          <Form.Label>
            {field.label}
            {field.required && <span className="text-danger">*</span>}
          </Form.Label>
          {field.type === "select" ? (
            <Form.Select
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              disabled={loading || field.disabled}
              required={field.required}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          ) : (
            <Form.Control
              type={field.type || "text"}
              as={field.as}
              rows={field.rows}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              disabled={loading || field.disabled}
              required={field.required}
              placeholder={field.placeholder}
            />
          )}
          {field.helpText && (
            <Form.Text className="text-muted">{field.helpText}</Form.Text>
          )}
        </Form.Group>
      </Col>
    ));

  const personalFields = [
    {
      label: "Role",
      name: "role",
      type: "select",
      required: true,
      options: roleOptions,
      helpText: "Select employee role",
    },
    {
      label: "Employee Code",
      name: "employeeCode",
      disabled: true,
      helpText: "Auto-generated employee code",
    },
    {
      label: "Designation",
      name: "designation",
      disabled: true,
      helpText: "Auto-filled based on role",
    },
    {
      label: "Full Name",
      name: "name",
      required: true,
      placeholder: "Enter full name",
    },
    {
      label: "Email ID",
      name: "emailId",
      type: "email",
      required: true,
      placeholder: "Enter email address",
    },
    {
      label: "Mobile No",
      name: "mobileNo",
      required: true,
      placeholder: "Enter mobile number",
    },
    {
      label: "Gender",
      name: "gender",
      type: "select",
      options: [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
        { value: "Other", label: "Other" },
      ],
    },
    { label: "Date of Birth", name: "dob", type: "date" },
    { label: "Marriage Date", name: "marriageDate", type: "date" },
    { label: "PAN No", name: "panNo" },
    { label: "Aadhar No", name: "aadharNo" },
    {
      label: "Present Address",
      name: "presentAddress",
      as: "textarea",
      rows: 2,
    },
    {
      label: "Permanent Address",
      name: "permanentAddress",
      as: "textarea",
      rows: 2,
    },
    { label: "Home Town", name: "homeTown" },
    { label: "Family Contact Person", name: "familyContactPerson" },
    { label: "Family Contact Mobile", name: "familyContactMobile" },
    { label: "Emergency Contact Person", name: "emergencyContactPerson" },
    { label: "Emergency Contact Mobile", name: "emergencyContactMobile" },
  ];

  const officialFields = [
    {
      label: "Allotted Login ID",
      name: "allottedLoginId",
      disabled: true,
      helpText: "Same as Employee Code",
    },
    { label: "Office Mobile", name: "officeMobile" },
    { label: "Office Email", name: "officeEmail", type: "email" },
    {
      label: "Password",
      name: "password",
      type: "password",
      disabled: true,
      helpText: "Default password: 123456",
    },
    {
      label: "Confirm Password",
      name: "confirmPassword",
      type: "password",
      disabled: true,
    },
    { label: "Allocated Work Area", name: "allocatedWorkArea" },
    { label: "Date of Joining", name: "dateOfJoining", type: "date" },
    { label: "Date of Termination", name: "dateOfTermination", type: "date" },
    { label: "Salary On Joining", name: "salaryOnJoining" },
    { label: "Expenses", name: "expenses" },
    { label: "Incentives", name: "incentives" },
    { label: "Office Kit", name: "officeKit" },
    { label: "Offer Letter", name: "offerLetter" },
    { label: "Undertaking", name: "undertaking" },
    { label: "Track Record", name: "trackRecord" },
    { label: "Drawer Key Name", name: "drawerKeyName" },
    { label: "Drawer Key Number", name: "drawerKeyNumber" },
    { label: "Office Key", name: "officeKey" },
    { label: "Allotment Date", name: "allotmentDate", type: "date" },
  ];

  const bankFields = [
    { label: "Bank Name", name: "bankName" },
    { label: "Account Number", name: "accountNo" },
    { label: "IFSC Code", name: "ifscCode" },
    { label: "MICR", name: "micr" },
  ];

  const alertFields = [
    {
      label: "On First Joining",
      name: "onFirstJoining",
      as: "textarea",
      rows: 3,
    },
    {
      label: "On Six Month Completion",
      name: "onSixMonthCompletion",
      as: "textarea",
      rows: 3,
    },
    {
      label: "On Twelve Month Completion",
      name: "onTwelveMonthCompletion",
      as: "textarea",
      rows: 3,
    },
  ];

  return (
    <Modal
      show={true}
      onHide={onClose}
      size="xl"
      centered
      backdrop="static"
      style={{ zIndex: 1050 }}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FaUser className="me-2" />
          Add Employee: {candidate.candidateName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Alert variant="info" className="mb-3">
          <strong>Auto-filled from Candidate:</strong>
          <br />
          Name: <strong>{candidate.candidateName}</strong> | Mobile:{" "}
          <strong>{candidate.mobileNo}</strong> | Designation:{" "}
          <strong>{candidate.appliedFor?.designation}</strong>
        </Alert>

        <Form onSubmit={handleSubmit}>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            {/* PERSONAL DETAILS TAB */}
            <Tab
              eventKey="personal"
              title={
                <>
                  <FaUser className="me-1" /> Personal
                </>
              }
            >
              <div className="p-3">
                <Row>{renderFields(personalFields)}</Row>
              </div>
            </Tab>

            {/* OFFICIAL DETAILS TAB */}
            <Tab
              eventKey="official"
              title={
                <>
                  <FaBriefcase className="me-1" /> Official
                </>
              }
            >
              <div className="p-3">
                <Alert variant="info" className="mb-3">
                  <strong>Default Login Credentials:</strong>
                  <br />
                  Employee Code: <strong>{formData.employeeCode}</strong>
                  <br />
                  Password: <strong>123456</strong>
                </Alert>
                <Row>{renderFields(officialFields)}</Row>
              </div>
            </Tab>

            {/* BANK DETAILS TAB */}
            <Tab
              eventKey="bank"
              title={
                <>
                  <FaUniversity className="me-1" /> Bank
                </>
              }
            >
              <div className="p-3">
                <Row>{renderFields(bankFields)}</Row>
              </div>
            </Tab>

            {/* ALERTS TAB */}
            <Tab
              eventKey="alerts"
              title={
                <>
                  <FaBell className="me-1" /> Alerts
                </>
              }
            >
              <div className="p-3">
                <Row>{renderFields(alertFields)}</Row>
              </div>
            </Tab>
          </Tabs>

          <div className="text-center mt-4">
            <Button
              type="submit"
              variant="success"
              disabled={loading}
              size="lg"
              className="px-5"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Adding Employee...
                </>
              ) : (
                "✅ Add as Employee"
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EmployeeAddFormModal;
