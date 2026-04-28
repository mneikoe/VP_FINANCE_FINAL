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
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../config/axios";
import EmployeeList from "./EmployeeList";

const EmployeeAddForm = () => {
  const navigate = useNavigate();

  const initial = {
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

    // AREA OF WORK FIELDS (NEW - EXACTLY LIKE SUSPECT FORM)
    workArea: "",
    workPincode: "",
    workSubArea: "",
    workCity: "",

    // Official
    designation: "",
    employeeCode: "",
    officeMobile: "",
    officeEmail: "",
    password: "123456",
    confirmPassword: "123456",
    allottedLoginId: "",
    allocatedWorkArea: "",
    dateOfJoining: "",
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
    role: "",

    // Bank
    bankName: "",
    accountNo: "",
    ifscCode: "",
    micr: "",

    // Alerts
    onFirstJoining: "",
    onSixMonthCompletion: "",
    onTwelveMonthCompletion: "",
  };

  const [formData, setFormData] = useState(initial);
  const [activeTab, setActiveTab] = useState("addEmployee");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // AREA STATES (EXACTLY LIKE SUSPECT FORM)
  const [areas, setAreas] = useState([]);
  const [subAreas, setSubAreas] = useState([]);
  const [filteredSubAreas, setFilteredSubAreas] = useState([]);

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
    { value: "OA", label: "🏢 OA", designation: "Office Admin" },
    { value: "RM", label: "🤵 RM", designation: "Relationship Manager" },
    { value: "Accountant", label: "📊 Accountant", designation: "Accountant" },
  ];

  // Fetch areas and subareas on component mount
  useEffect(() => {
    fetchAreas();
    fetchSubAreas();
  }, []);

  // Fetch areas from API
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

  // Fetch subareas from API
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

  // Filter subareas when area is selected
  useEffect(() => {
    if (formData.workArea) {
      const selectedArea = areas.find(
        (area) => area.name === formData.workArea
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
  }, [formData.workArea, areas, subAreas]);

  // Function to fetch area by pincode (EXACTLY LIKE SUSPECT FORM)
  const fetchAreaByPincode = async (pincode) => {
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

  // Handle pincode change - auto populate area and city
  const handlePincodeChange = async (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If pincode is 6 digits, fetch area and city
    if (value.length === 6 && name === "workPincode") {
      const areaData = await fetchAreaByPincode(value);

      setFormData((prev) => ({
        ...prev,
        workArea: areaData.name || "",
        workCity: areaData.city || "",
      }));
    }
  };

  // Handle area change - filter subareas
  const handleAreaChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // When area changes, clear subarea if it doesn't belong to new area
    if (name === "workArea" && formData.workSubArea) {
      const isSubAreaValid = filteredSubAreas.some(
        (sub) => sub.subAreaName === formData.workSubArea
      );
      if (!isSubAreaValid) {
        setFormData((prev) => ({ ...prev, workSubArea: "" }));
      }
    }
  };

  // Generate employee code when role is selected
  useEffect(() => {
    if (formData.role) {
      const generateEmployeeCode = (role) => {
        const roleCodes = {
          Telecaller: "TC",
          Telemarketer: "TM",
          OE: "OE",
          HR: "HR",
          RM: "RM",
          Accountant: "AC",
        };

        const roleCode = roleCodes[role] || "EMP";
        const randomNum = Math.floor(100 + Math.random() * 900);
        return `${roleCode}${randomNum}`;
      };

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEmployee = async (e) => {
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

      const response = await axiosInstance.post(
        "/api/employee/addEmployee",
        formData
      );

      console.log("✅ API Response:", response.data);

      if (response.data && response.data.success) {
        setSuccess(
          `Employee added successfully! Login: ${formData.employeeCode} / 123456`
        );
        setFormData(initial);
        setActiveTab("allEmployees");
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
      <Col xl={3} lg={4} md={6} key={i}>
        <Form.Group className="mb-2 compact-form-group">
          <Form.Label className="compact-form-label">
            {field.label}
            {field.required && <span className="text-danger">*</span>}
          </Form.Label>
          {field.type === "select" ? (
            <Form.Select
              className="compact-form-control"
              name={field.name}
              value={formData[field.name]}
              onChange={field.onChange || handleChange}
              disabled={loading || field.disabled}
              required={field.required}
            >
              <option value="">--</option>
              {field.options?.map((option) => (
                <option
                  key={option.value || option._id}
                  value={option.value || option.name}
                >
                  {option.label || option.name}
                </option>
              ))}
            </Form.Select>
          ) : (
            <Form.Control
              className="compact-form-control"
              type={field.type || "text"}
              as={field.as}
              rows={field.rows}
              name={field.name}
              value={formData[field.name]}
              onChange={field.onChange || handleChange}
              disabled={loading || field.disabled}
              required={field.required}
              maxLength={field.maxLength}
              readOnly={field.readOnly}
            />
          )}
          {field.helpText && (
            <Form.Text className="text-muted">{field.helpText}</Form.Text>
          )}
        </Form.Group>
      </Col>
    ));

  return (
    <Container fluid className="p-0">
      <div className="employee-form-shell border rounded-3 bg-white p-2 shadow-sm">

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-1 compact-main-tabs"
          fill
        >
          <Tab eventKey="addEmployee" title="➕ Add Employee">
            <Form onSubmit={handleSaveEmployee}>
              <Tabs defaultActiveKey="personal" className="mb-1 compact-inner-tabs">
                {/* PERSONAL DETAILS */}
                <Tab eventKey="personal" title="Personal Details">
                  <Row className="g-1">
                    {renderFields([
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
                      },
                      {
                        label: "Email ID",
                        name: "emailId",
                        type: "email",
                        required: true,
                      },
                      {
                        label: "Mobile No",
                        name: "mobileNo",
                        required: true,
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
                      {
                        label: "Marriage Date",
                        name: "marriageDate",
                        type: "date",
                      },
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
                      {
                        label: "Family Contact Person",
                        name: "familyContactPerson",
                      },
                      {
                        label: "Family Contact Mobile",
                        name: "familyContactMobile",
                      },
                      {
                        label: "Emergency Contact Person",
                        name: "emergencyContactPerson",
                      },
                      {
                        label: "Emergency Contact Mobile",
                        name: "emergencyContactMobile",
                      },

                      // AREA OF WORK SECTION (EXACTLY LIKE SUSPECT FORM)
                      {
                        label: "Work Pincode",
                        name: "workPincode",
                        onChange: handlePincodeChange,
                        maxLength: 6,
                        helpText: "Enter pincode to auto-fetch area",
                      },
                      {
                        label: "Work Area",
                        name: "workArea",
                        type: "select",
                        options: areas.map((area) => ({
                          value: area.name,
                          label: `${area.name} (${area.pincode})`,
                        })),
                        onChange: handleAreaChange,
                        helpText: "Area will auto-fill from pincode",
                      },
                      {
                        label: "Work Sub Area",
                        name: "workSubArea",
                        type: "select",
                        options: filteredSubAreas.map((sub) => ({
                          value: sub.subAreaName,
                          label: sub.subAreaName,
                        })),
                        helpText: "Select sub-area based on chosen area",
                      },
                      {
                        label: "Work City",
                        name: "workCity",
                        readOnly: true,
                        helpText: "City auto-filled from pincode",
                      },
                    ])}
                  </Row>
                </Tab>

                {/* OFFICIAL DETAILS */}
                <Tab eventKey="official" title="Official Details">
                  <Alert variant="info" className="mb-2 py-2">
                    <strong>Default Login Credentials:</strong>
                    <br />
                    Employee Code: <strong>{formData.employeeCode}</strong>
                    <br />
                    Password: <strong>123456</strong>
                  </Alert>

                  <Row className="g-1">
                    {renderFields([
                      {
                        label: "Allotted Login ID",
                        name: "allottedLoginId",
                        disabled: true,
                        helpText: "Same as Employee Code",
                      },
                      { label: "Office Mobile", name: "officeMobile" },
                      {
                        label: "Office Email",
                        name: "officeEmail",
                        type: "email",
                      },
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
                      {
                        label: "Allocated Work Area",
                        name: "allocatedWorkArea",
                      },
                      {
                        label: "Date of Joining",
                        name: "dateOfJoining",
                        type: "date",
                      },
                      {
                        label: "Date of Termination",
                        name: "dateOfTermination",
                        type: "date",
                      },
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
                      {
                        label: "Allotment Date",
                        name: "allotmentDate",
                        type: "date",
                      },
                    ])}
                  </Row>
                </Tab>

                {/* BANK DETAILS */}
                <Tab eventKey="bank" title="Bank Details">
                  <Row className="g-1">
                    {renderFields([
                      { label: "Bank Name", name: "bankName" },
                      { label: "Account Number", name: "accountNo" },
                      { label: "IFSC Code", name: "ifscCode" },
                      { label: "MICR", name: "micr" },
                    ])}
                  </Row>
                </Tab>

                {/* ALERTS */}
                <Tab eventKey="alerts" title="Alerts / Messages">
                  <Row className="g-1">
                    {renderFields([
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
                    ])}
                  </Row>
                </Tab>
              </Tabs>

              <div className="text-center mt-1">
                <Button
                  type="submit"
                  className="px-3 py-1 fw-medium rounded-2"
                  style={{ backgroundColor: "#2B3A4A", border: "none" }}
                  disabled={loading || !formData.employeeCode}
                >
                  {loading ? "🔄 Adding Employee..." : "✅ Add Employee"}
                </Button>
              </div>
            </Form>
          </Tab>

          {/* ALL EMPLOYEES TAB */}
          <Tab eventKey="allEmployees" title="👥 All Employees">
            <EmployeeList />
          </Tab>
        </Tabs>
      </div>
      <style>{`
        .employee-form-shell {
          border-color: #e5e7eb !important;
        }
        .compact-main-tabs .nav-link,
        .compact-inner-tabs .nav-link {
          font-size: 0.82rem;
          font-weight: 500;
          padding: 0.35rem 0.6rem;
        }
        .compact-main-tabs .nav-link.active,
        .compact-inner-tabs .nav-link.active {
          font-weight: 600;
        }
        .compact-form-group {
          margin-bottom: 0.35rem !important;
        }
        .compact-form-label {
          font-size: 0.76rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.12rem;
        }
        .compact-form-control {
          min-height: 30px;
          font-size: 0.8rem;
          padding: 0.2rem 0.5rem;
          border-color: #d1d5db;
        }
        textarea.compact-form-control {
          min-height: 48px;
        }
        .compact-form-group .form-text {
          font-size: 0.68rem;
          margin-top: 0.08rem;
          line-height: 1.2;
          margin-bottom: 0;
        }
        .compact-main-tabs,
        .compact-inner-tabs {
          margin-bottom: 0.35rem !important;
        }
        .tab-content > .tab-pane {
          padding-top: 0.1rem;
        }
        .compact-form-control:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 0.15rem rgba(37, 99, 235, 0.12);
        }
      `}</style>
    </Container>
  );
};

export default EmployeeAddForm;
