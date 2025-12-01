import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, Tabs, Tab, Container, Alert, Spinner } from "react-bootstrap";
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

    // Official
    designation: "", // This should be auto-filled based on role
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
  };

  const [formData, setFormData] = useState(initial);
  const [activeTab, setActiveTab] = useState("addEmployee");
  const [loading, setLoading] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Role options with designations
  const roleOptions = [
    { value: "Telecaller", label: "📞 Telecaller", designation: "Telecaller Executive" },
    { value: "Telemarketer", label: "💼 Telemarketer", designation: "Telemarketing Executive" },
    { value: "OE", label: "👨‍💼 OE", designation: "Operation Executive" },
    { value: "HR", label: "👥 HR", designation: "HR Executive" },
    { value: "RM", label: "🤵 RM", designation: "Relationship Manager" }
  ];

  // Generate employee code (simple version for now)
  const generateEmployeeCode = (role) => {
    const roleCodes = {
      'Telecaller': 'TC',
      'Telemarketer': 'TM', 
      'OE': 'OE',
      'HR': 'HR',
      'RM': 'RM'
    };
    
    const roleCode = roleCodes[role] || 'EMP';
    const randomNum = Math.floor(100 + Math.random() * 900); // 100-999
    return `${roleCode}${randomNum}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Auto-generate employee code and designation when role is selected
  useEffect(() => {
    if (formData.role) {
      const generatedCode = generateEmployeeCode(formData.role);
      
      // Find the selected role to get designation
      const selectedRole = roleOptions.find(role => role.value === formData.role);
      const designation = selectedRole ? selectedRole.designation : formData.role;
      
      setFormData(prev => ({ 
        ...prev, 
        employeeCode: generatedCode,
        allottedLoginId: generatedCode,
        designation: designation // Auto-fill designation based on role
      }));
    }
  }, [formData.role]);

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
      
      const response = await axiosInstance.post("/api/employee/addEmployee", formData);
      
      console.log("✅ API Response:", response.data);
      
      if (response.data && response.data.success) {
        setSuccess(`Employee added successfully! Login: ${formData.employeeCode} / 123456`);
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
      <Col md={4} key={i}>
        <Form.Group className="mb-3">
          <Form.Label>
            {field.label}
            {field.required && <span className="text-danger">*</span>}
          </Form.Label>
          {field.type === 'select' ? (
            <Form.Select
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              disabled={loading || field.disabled}
              required={field.required}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map(option => (
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
            <Form.Text className="text-muted">
              {field.helpText}
            </Form.Text>
          )}
        </Form.Group>
      </Col>
    ));

  return (
    <Container fluid className="p-4">
      <div className="border rounded bg-light p-4">
        <h4 className="mb-4 text-center">Employee Management</h4>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Tabs 
          activeKey={activeTab} 
          onSelect={(k) => setActiveTab(k)} 
          className="mb-4"
          fill
        >
          {/* ADD EMPLOYEE TAB */}
          <Tab eventKey="addEmployee" title="➕ Add Employee">
            <Form onSubmit={handleSaveEmployee}>
              <Tabs defaultActiveKey="personal" className="mb-3">
                {/* PERSONAL DETAILS */}
                <Tab eventKey="personal" title="Personal Details">
                  <Row>
                    {renderFields([
                      { 
                        label: "Role", 
                        name: "role", 
                        type: "select", 
                        required: true,
                        options: roleOptions,
                        helpText: "Select employee role"
                      },
                      { 
                        label: "Employee Code", 
                        name: "employeeCode", 
                        disabled: true,
                        helpText: "Auto-generated employee code"
                      },
                      { 
                        label: "Designation", 
                        name: "designation", 
                        disabled: true,
                        helpText: "Auto-filled based on role"
                      },
                      { 
                        label: "Full Name", 
                        name: "name", 
                        required: true,
                        placeholder: "Enter full name" 
                      },
                      { 
                        label: "Email ID", 
                        name: "emailId", 
                        type: "email", 
                        required: true,
                        placeholder: "Enter email address" 
                      },
                      { 
                        label: "Mobile No", 
                        name: "mobileNo", 
                        required: true,
                        placeholder: "Enter mobile number" 
                      },
                      { 
                        label: "Gender", 
                        name: "gender", 
                        type: "select",
                        options: [
                          { value: "Male", label: "Male" },
                          { value: "Female", label: "Female" },
                          { value: "Other", label: "Other" }
                        ] 
                      },
                      { label: "Date of Birth", name: "dob", type: "date" },
                      { label: "Marriage Date", name: "marriageDate", type: "date" },
                      { label: "PAN No", name: "panNo" },
                      { label: "Aadhar No", name: "aadharNo" },
                      { label: "Present Address", name: "presentAddress", as: "textarea", rows: 2 },
                      { label: "Permanent Address", name: "permanentAddress", as: "textarea", rows: 2 },
                      { label: "Home Town", name: "homeTown" },
                      { label: "Family Contact Person", name: "familyContactPerson" },
                      { label: "Family Contact Mobile", name: "familyContactMobile" },
                      { label: "Emergency Contact Person", name: "emergencyContactPerson" },
                      { label: "Emergency Contact Mobile", name: "emergencyContactMobile" },
                    ])}
                  </Row>
                </Tab>

                {/* OFFICIAL DETAILS */}
                <Tab eventKey="official" title="Official Details">
                  <Alert variant="info" className="mb-3">
                    <strong>Default Login Credentials:</strong><br />
                    Employee Code: <strong>{formData.employeeCode}</strong><br />
                    Password: <strong>123456</strong>
                  </Alert>
                  
                  <Row>
                    {renderFields([
                      { 
                        label: "Allotted Login ID", 
                        name: "allottedLoginId", 
                        disabled: true,
                        helpText: "Same as Employee Code" 
                      },
                      { label: "Office Mobile", name: "officeMobile" },
                      { label: "Office Email", name: "officeEmail", type: "email" },
                      { 
                        label: "Password", 
                        name: "password", 
                        type: "password", 
                        disabled: true,
                        helpText: "Default password: 123456" 
                      },
                      { 
                        label: "Confirm Password", 
                        name: "confirmPassword", 
                        type: "password", 
                        disabled: true 
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
                    ])}
                  </Row>
                </Tab>

                {/* BANK DETAILS */}
                <Tab eventKey="bank" title="Bank Details">
                  <Row>
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
                  <Row>
                    {renderFields([
                      { label: "On First Joining", name: "onFirstJoining", as: "textarea", rows: 3 },
                      { label: "On Six Month Completion", name: "onSixMonthCompletion", as: "textarea", rows: 3 },
                      { label: "On Twelve Month Completion", name: "onTwelveMonthCompletion", as: "textarea", rows: 3 },
                    ])}
                  </Row>
                </Tab>
              </Tabs>

              <div className="text-center mt-4">
                <Button 
                  type="submit" 
                  style={{ backgroundColor: "#2B3A4A", border: "none", padding: "10px 30px" }}
                  disabled={loading || !formData.employeeCode}
                  size="lg"
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
    </Container>
  );
};

export default EmployeeAddForm;