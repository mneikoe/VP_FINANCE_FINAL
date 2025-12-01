import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../../config/axios";
import { Spinner, Alert, Button, Badge, Row, Col } from "react-bootstrap";
import { 
  FiUser, FiPhone, FiMail, FiMapPin 
} from "react-icons/fi";
import { 
  FaBusinessTime, FaIdCardAlt, FaUsers, FaMoneyBillWave 
} from "react-icons/fa";

const EmployeeDetails = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchEmployeeData();
  }, [id, location]);

  const fetchEmployeeData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // ✅ PEHLE STATE CHECK KARO
      const employeeDataFromState = location.state?.employeeData;
      const source = location.state?.source;
      
      if (employeeDataFromState) {
        console.log("🎯 Using data from state");
        setEmployee(employeeDataFromState);
        setLoading(false);
        return;
      }

      // ✅ AGAR STATE NAHI HAI TO API CALL KARO
      console.log("🔄 Fetching from API...");
      
      // Try different APIs based on possible sources
      try {
        await fetchFromHRAPI();
      } catch (hrErr) {
        console.log("❌ HR API failed, trying Telecaller API...");
        try {
          await fetchFromTelecallerAPI();
        } catch (teleErr) {
          console.log("❌ Telecaller API failed");
          throw new Error("Employee not found in any system");
        }
      }
      
    } catch (err) {
      console.error("❌ Final error:", err);
      setError("Failed to load employee details");
      setLoading(false);
    }
  };

  const fetchFromHRAPI = async () => {
    const response = await axiosInstance.get(`/api/hr/${id}`);
    
    if (response.data && response.data.success) {
      console.log("✅ HR data found from HR API");
      const hrData = mapHRToEmployee(response.data.HR);
      setEmployee(hrData);
    } else {
      throw new Error("HR not found");
    }
  };

  const fetchFromTelecallerAPI = async () => {
    const response = await axiosInstance.get(`/api/telecaller/${id}`);
    
    if (response.data && response.data.success) {
      console.log("✅ Employee data found from Telecaller API");
      const telecallerData = mapTelecallerToEmployee(response.data.data);
      setEmployee(telecallerData);
    } else {
      throw new Error("Employee/Telecaller not found");
    }
  };

  const mapHRToEmployee = (hrData) => {
    return {
      // ✅ COMMON FIELDS
      _id: hrData._id,
      name: hrData.username,
      emailId: hrData.email,
      mobileNo: hrData.mobileno,
      role: "HR",
      
      // Personal Details
      employeeCode: hrData.employeeCode,
      designation: hrData.designation,
      gender: hrData.gender,
      dob: hrData.dob,
      marriageDate: hrData.marriageDate,
      
      // Address Details
      presentAddress: hrData.presentAddress,
      permanentAddress: hrData.permanentAddress,
      homeTown: hrData.homeTown,
      
      // Contact Details
      familyContactPerson: hrData.familyContactPerson,
      familyContactMobile: hrData.familyContactMobile,
      emergencyContactPerson: hrData.emergencyContactPerson,
      emergencyContactMobile: hrData.emergencyContactMobile,
      
      // Office Details
      officeMobile: hrData.officeMobile,
      officeEmail: hrData.officeEmail,
      allottedLoginId: hrData.allottedLoginId,
      allocatedWorkArea: hrData.allocatedWorkArea,
      dateOfJoining: hrData.dateOfJoining,
      dateOfTermination: hrData.dateOfTermination,
      
      // Financial Details
      salaryOnJoining: hrData.salaryOnJoining,
      expenses: hrData.expenses,
      incentives: hrData.incentives,
      
      // Bank Details
      bankName: hrData.bankName,
      accountNo: hrData.accountNo,
      ifscCode: hrData.ifscCode,
      micr: hrData.micr,
      
      // Identification
      panNo: hrData.panNo,
      aadharNo: hrData.aadharNo,
      
      // HR Specific
      hrResponsibilities: hrData.hrResponsibilities,
      managedEmployees: hrData.managedEmployees,
      recruitmentStats: hrData.recruitmentStats,
      
      // Source identifier
      source: "hr"
    };
  };

  const mapTelecallerToEmployee = (telecallerData) => {
    return {
      // ✅ COMMON FIELDS
      _id: telecallerData._id,
      name: telecallerData.username,
      emailId: telecallerData.email,
      mobileNo: telecallerData.mobileno,
      role: "Telecaller",
      
      // Personal Details
      employeeCode: telecallerData.employeeCode,
      designation: telecallerData.designation,
      gender: telecallerData.gender,
      dob: telecallerData.dob,
      marriageDate: telecallerData.marriageDate,
      
      // Address Details
      presentAddress: telecallerData.presentAddress,
      permanentAddress: telecallerData.permanentAddress,
      homeTown: telecallerData.homeTown,
      
      // Contact Details
      familyContactPerson: telecallerData.familyContactPerson,
      familyContactMobile: telecallerData.familyContactMobile,
      emergencyContactPerson: telecallerData.emergencyContactPerson,
      emergencyContactMobile: telecallerData.emergencyContactMobile,
      
      // Office Details
      officeMobile: telecallerData.officeMobile,
      officeEmail: telecallerData.officeEmail,
      allottedLoginId: telecallerData.allottedLoginId,
      allocatedWorkArea: telecallerData.allocatedWorkArea,
      dateOfJoining: telecallerData.dateOfJoining,
      dateOfTermination: telecallerData.dateOfTermination,
      
      // Financial Details
      salaryOnJoining: telecallerData.salaryOnJoining,
      expenses: telecallerData.expenses,
      incentives: telecallerData.incentives,
      
      // Bank Details
      bankName: telecallerData.bankName,
      accountNo: telecallerData.accountNo,
      ifscCode: telecallerData.ifscCode,
      micr: telecallerData.micr,
      
      // Identification
      panNo: telecallerData.panNo,
      aadharNo: telecallerData.aadharNo,
      
      // Source identifier
      source: "telecaller"
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // ✅ COMMON TABS
  const tabs = [
    { id: 0, label: "Personal Details", icon: FiUser },
    { id: 1, label: "Official Details", icon: FaUsers },
    { id: 2, label: "Address Details", icon: FiMapPin },
    { id: 3, label: "Bank Details", icon: FaMoneyBillWave }
  ];

  // ✅ HR SPECIFIC TAB
  if (employee?.source === "hr") {
    tabs.push({ id: 4, label: "HR Details", icon: FaUsers });
  }

  if (loading) {
    return (
      <div className="container customer-profile-container">
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
          <p className="mt-2">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="container customer-profile-container">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          {error || "Employee not found"}
        </Alert>
        <Button onClick={() => navigate("/add-employee")}>
          ← Back to Employee List
        </Button>
      </div>
    );
  }

  return (
    <div className="container customer-profile-container">
      {/* Header */}
      <div className="profile-header">
        <h1>
          Employee Profile
          <Badge bg="primary" className="ms-2">{employee.role}</Badge>
          {employee.source === "hr" && (
            <Badge bg="info" className="ms-1">💼 HR</Badge>
          )}
          {employee.source === "telecaller" && (
            <Badge bg="success" className="ms-1">📞 Telecaller</Badge>
          )}
        </h1>
        <Button variant="outline-secondary" onClick={() => navigate("/add-employee")}>
          ← Back to List
        </Button>
      </div>

      {/* Profile Grid */}
      <div className="profile-grid">
        {/* Left Profile Card */}
        <div className="profile-card">
          <div className="profile-info">
            <h2 className="profile-name">{employee.name || "N/A"}</h2>
            <div className="profile-meta">
              <Badge bg="primary">{employee.employeeCode || "N/A"}</Badge>
              <Badge bg="secondary">{employee.role || "N/A"}</Badge>
            </div>

            <div className="profile-details">
              <div className="detail-item">
                <FiUser className="detail-icon" />
                <div>
                  <p className="detail-label">Designation</p>
                  <p className="detail-value">{employee.designation || "N/A"}</p>
                </div>
              </div>
              <div className="detail-item">
                <FiPhone className="detail-icon" />
                <div>
                  <p className="detail-label">Phone</p>
                  <p className="detail-value">{employee.mobileNo || "N/A"}</p>
                </div>
              </div>
              <div className="detail-item">
                <FiMail className="detail-icon" />
                <div>
                  <p className="detail-label">Email</p>
                  <p className="detail-value">{employee.emailId || "N/A"}</p>
                </div>
              </div>
              <div className="detail-item">
                <FaBusinessTime className="detail-icon" />
                <div>
                  <p className="detail-label">Date of Joining</p>
                  <p className="detail-value">{formatDate(employee.dateOfJoining)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="content-area">
          {/* Quick Info Cards */}
          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon">
                <FiUser size={24} />
              </div>
              <div>
                <h3>Employee Since</h3>
                <p>{formatDate(employee.dateOfJoining)}</p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <FaIdCardAlt size={24} />
              </div>
              <div>
                <h3>Employee Code</h3>
                <p>{employee.employeeCode || "N/A"}</p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <FaBusinessTime size={24} />
              </div>
              <div>
                <h3>Department</h3>
                <p>{employee.role || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="tabs-container">
            <div className="custom-tablist">
              {tabs.map((tab) => (
                <button 
                  key={tab.id}
                  className={`custom-tab ${tabIndex === tab.id ? "active" : ""}`}
                  onClick={() => setTabIndex(tab.id)}
                >
                  <tab.icon className="tab-icon" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Personal Details Tab */}
            {tabIndex === 0 && (
              <div className="tab-content">
                <h3>Personal Information</h3>
                <Row>
                  <Col md={6}>
                    <div className="detail-section">
                      <h5>Basic Information</h5>
                      <div className="detail-item">
                        <strong>Full Name:</strong> {employee.name || "N/A"}
                      </div>
                      <div className="detail-item">
                        <strong>Gender:</strong> {employee.gender || "N/A"}
                      </div>
                      <div className="detail-item">
                        <strong>Date of Birth:</strong> {formatDate(employee.dob)}
                      </div>
                      <div className="detail-item">
                        <strong>Age:</strong> {employee.dob ? calculateAge(employee.dob) + " years" : "N/A"}
                      </div>
                      <div className="detail-item">
                        <strong>Mobile No:</strong> {employee.mobileNo || "N/A"}
                      </div>
                      <div className="detail-item">
                        <strong>Email:</strong> {employee.emailId || "N/A"}
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="detail-section">
                      <h5>Identification</h5>
                      <div className="detail-item">
                        <strong>PAN No:</strong> {employee.panNo || "N/A"}
                      </div>
                      <div className="detail-item">
                        <strong>Aadhar No:</strong> {employee.aadharNo || "N/A"}
                      </div>
                      <div className="detail-item">
                        <strong>Home Town:</strong> {employee.homeTown || "N/A"}
                      </div>
                    </div>

                    <div className="detail-section">
                      <h5>Emergency Contacts</h5>
                      <div className="detail-item">
                        <strong>Emergency Contact Person:</strong> {employee.emergencyContactPerson || "N/A"}
                      </div>
                      <div className="detail-item">
                        <strong>Emergency Contact Mobile:</strong> {employee.emergencyContactMobile || "N/A"}
                      </div>
                      <div className="detail-item">
                        <strong>Family Contact Person:</strong> {employee.familyContactPerson || "N/A"}
                      </div>
                      <div className="detail-item">
                        <strong>Family Contact Mobile:</strong> {employee.familyContactMobile || "N/A"}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            )}

            {/* Official Details Tab */}
            {tabIndex === 1 && (
              <div className="tab-content">
                <h3>Official Information</h3>
                <Row>
                  <Col md={6}>
                    <div className="detail-section">
                      <h5>Employment Details</h5>
                      <div className="detail-item">
                        <strong>Employee Code:</strong> {employee.employeeCode || "N/A"}
                      </div>
                      <div className="detail-item">
                        <strong>Designation:</strong> {employee.designation || "N/A"}
                      </div>
                      <div className="detail-item">
                        <strong>Role:</strong> {employee.role || "N/A"}
                      </div>
                      <div className="detail-item">
                        <strong>Date of Joining:</strong> {formatDate(employee.dateOfJoining)}
                      </div>
                      <div className="detail-item">
                        <strong>Date of Termination:</strong> {formatDate(employee.dateOfTermination)}
                      </div>
                      <div className="detail-item">
                        <strong>Allotted Login ID:</strong> {employee.allottedLoginId || "N/A"}
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="detail-section">
                      <h5>Contact Information</h5>
                      <div className="detail-item">
                        <strong>Office Mobile:</strong> {employee.officeMobile || "N/A"}
                      </div>
                      <div className="detail-item">
                        <strong>Office Email:</strong> {employee.officeEmail || "N/A"}
                      </div>
                      <div className="detail-item">
                        <strong>Allocated Work Area:</strong> {employee.allocatedWorkArea || "N/A"}
                      </div>
                    </div>

                    <div className="detail-section">
                      <h5>Compensation</h5>
                      <div className="detail-item">
                        <strong>Salary on Joining:</strong> {employee.salaryOnJoining || "N/A"}
                      </div>
                      <div className="detail-item">
                        <strong>Expenses:</strong> {employee.expenses || "N/A"}
                      </div>
                      <div className="detail-item">
                        <strong>Incentives:</strong> {employee.incentives || "N/A"}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            )}

            {/* Address Details Tab */}
            {tabIndex === 2 && (
              <div className="tab-content">
                <h3>Address Information</h3>
                <Row>
                  <Col md={6}>
                    <div className="detail-section">
                      <h5>Present Address</h5>
                      <div className="address-box">
                        {employee.presentAddress || "Not specified"}
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="detail-section">
                      <h5>Permanent Address</h5>
                      <div className="address-box">
                        {employee.permanentAddress || "Not specified"}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            )}

            {/* Bank Details Tab */}
            {tabIndex === 3 && (
              <div className="tab-content">
                <h3>Bank Information</h3>
                <Row>
                  <Col md={6}>
                    <div className="detail-section">
                      <h5>Account Details</h5>
                      <div className="detail-item">
                        <strong>Bank Name:</strong> {employee.bankName || "N/A"}
                      </div>
                      <div className="detail-item">
                        <strong>Account Number:</strong> {employee.accountNo || "N/A"}
                      </div>
                      <div className="detail-item">
                        <strong>IFSC Code:</strong> {employee.ifscCode || "N/A"}
                      </div>
                      <div className="detail-item">
                        <strong>MICR Code:</strong> {employee.micr || "N/A"}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            )}

            {/* HR Details Tab (Only for HR employees) */}
            {tabIndex === 4 && employee.source === "hr" && (
              <div className="tab-content">
                <h3>HR Specific Information</h3>
                <Row>
                  <Col md={6}>
                    <div className="detail-section">
                      <h5>Recruitment Statistics</h5>
                      <div className="detail-item">
                        <strong>Total Hired:</strong> {employee.recruitmentStats?.totalHired || 0}
                      </div>
                      <div className="detail-item">
                        <strong>Total Interviews:</strong> {employee.recruitmentStats?.totalInterviews || 0}
                      </div>
                      <div className="detail-item">
                        <strong>Success Rate:</strong> {employee.recruitmentStats?.successRate || 0}%
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="detail-section">
                      <h5>Managed Employees</h5>
                      <div className="detail-item">
                        <strong>Total Managed:</strong> {employee.managedEmployees?.length || 0}
                      </div>
                    </div>
                    
                    <div className="detail-section">
                      <h5>HR Responsibilities</h5>
                      {employee.hrResponsibilities && employee.hrResponsibilities.length > 0 ? (
                        <ul>
                          {employee.hrResponsibilities.map((resp, index) => (
                            <li key={index}>{resp.responsibility}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No specific responsibilities assigned</p>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .customer-profile-container {
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .profile-header h1 {
          font-size: 28px;
          font-weight: 600;
          color: #2c3e50;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 20px;
        }

        .profile-card {
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .profile-info {
          padding: 20px;
        }

        .profile-name {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 5px 0;
        }

        .profile-meta {
          display: flex;
          gap: 8px;
          margin-bottom: 15px;
        }

        .badge {
          background: #3498db;
          color: white;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .badge.secondary {
          background: #6c757d;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #eee;
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .detail-icon {
          color: #7f8c8d;
          min-width: 24px;
        }

        .detail-label {
          font-size: 12px;
          color: #7f8c8d;
          margin: 0;
        }

        .detail-value {
          font-size: 14px;
          font-weight: 500;
          margin: 2px 0 0 0;
        }

        .content-area {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .info-card {
          background: white;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .info-icon {
          background: #e3f2fd;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3498db;
        }

        .info-card h3 {
          font-size: 14px;
          color: #7f8c8d;
          margin: 0 0 4px 0;
        }

        .info-card p {
          font-size: 15px;
          font-weight: 500;
          margin: 0;
        }

        .tabs-container {
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .custom-tablist {
          display: flex;
          background: #f8f9fa;
          padding: 0;
          margin: 0;
          border-bottom: 1px solid #eee;
        }

        .custom-tab {
          padding: 15px 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #7f8c8d;
          display: flex;
          align-items: center;
          gap: 8px;
          border: none;
          background: none;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .custom-tab:hover {
          color: #3498db;
          background: rgba(52, 152, 219, 0.05);
        }

        .custom-tab.active {
          color: #3498db;
          border-bottom: 2px solid #3498db;
          background: white;
        }

        .tab-icon {
          font-size: 16px;
        }

        .tab-content {
          padding: 20px;
        }

        .tab-content h3 {
          font-size: 18px;
          margin-top: 0;
          color: #2c3e50;
          margin-bottom: 20px;
        }

        .detail-section {
          margin-bottom: 25px;
        }

        .detail-section h5 {
          color: #3498db;
          border-bottom: 1px solid #eee;
          padding-bottom: 8px;
          margin-bottom: 15px;
        }

        .detail-section .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f8f9fa;
        }

        .address-box {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          min-height: 100px;
        }

        @media (max-width: 768px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
          
          .info-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeDetails;