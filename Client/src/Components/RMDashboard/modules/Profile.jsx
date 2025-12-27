import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Spinner, Alert, Button, Badge, Row, Col } from "react-bootstrap";
import { FiUser, FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import {
  FaBusinessTime,
  FaIdCardAlt,
  FaUsers,
  FaMoneyBillWave,
  FaBriefcase,
  FaCalendarAlt,
  FaHome,
  FaCity,
  FaShieldAlt,
  FaUniversity,
  FaFileAlt,
  FaKey,
  FaFileContract,
} from "react-icons/fa";

const RMProfile = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRMData();
  }, []);

  const fetchRMData = async () => {
    setLoading(true);
    setError(null);

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        throw new Error("User not found. Please login again.");
      }

      const user = JSON.parse(userStr);
      const userId = user._id || user.id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await axios.get("/api/employee/getEmployeeById", {
        params: { employeeId: userId },
      });

      if (response.data.success && response.data.data) {
        const profileData = mapEmployeeToUI(response.data.data);
        setEmployee(profileData);
      } else {
        throw new Error(response.data.message || "Failed to fetch profile");
      }
    } catch (err) {
      console.error("❌ Error fetching RM profile:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const mapEmployeeToUI = (empData) => {
    return {
      _id: empData._id,
      name: empData.name,
      emailId: empData.emailId,
      mobileNo: empData.mobileNo,
      role: empData.role,
      employeeCode: empData.employeeCode,
      designation: empData.designation,
      gender: empData.gender,
      dob: empData.dob,
      marriageDate: empData.marriageDate,
      presentAddress: empData.presentAddress,
      permanentAddress: empData.permanentAddress,
      homeTown: empData.homeTown,
      familyContactPerson: empData.familyContactPerson,
      familyContactMobile: empData.familyContactMobile,
      emergencyContactPerson: empData.emergencyContactPerson,
      emergencyContactMobile: empData.emergencyContactMobile,
      officeMobile: empData.officeMobile,
      officeEmail: empData.officeEmail,
      allottedLoginId: empData.allottedLoginId,
      allocatedWorkArea: empData.allocatedWorkArea,
      dateOfJoining: empData.dateOfJoining,
      dateOfTermination: empData.dateOfTermination,
      salaryOnJoining: empData.salaryOnJoining,
      expenses: empData.expenses,
      incentives: empData.incentives,
      bankName: empData.bankName,
      accountNo: empData.accountNo,
      ifscCode: empData.ifscCode,
      micr: empData.micr,
      panNo: empData.panNo,
      aadharNo: empData.aadharNo,
      officeKit: empData.officeKit,
      offerLetter: empData.offerLetter,
      undertaking: empData.undertaking,
      trackRecord: empData.trackRecord,
      drawerKeyName: empData.drawerKeyName,
      drawerKeyNumber: empData.drawerKeyNumber,
      officeKey: empData.officeKey,
      onFirstJoining: empData.onFirstJoining,
      onSixMonthCompletion: empData.onSixMonthCompletion,
      onTwelveMonthCompletion: empData.onTwelveMonthCompletion,
      status: "Active",
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
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

  const calculateExperience = (doj) => {
    if (!doj) return "N/A";
    const joinDate = new Date(doj);
    const today = new Date();

    let years = today.getFullYear() - joinDate.getFullYear();
    let months = today.getMonth() - joinDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    if (years === 0) {
      return `${months} month${months !== 1 ? "s" : ""}`;
    }

    return `${years} year${years !== 1 ? "s" : ""} ${months} month${
      months !== 1 ? "s" : ""
    }`;
  };

  const tabs = [
    { id: 0, label: "Personal", icon: FiUser },
    { id: 1, label: "Official", icon: FaUsers },
    { id: 2, label: "Address", icon: FiMapPin },
    { id: 3, label: "Bank", icon: FaMoneyBillWave },
    { id: 4, label: "Employment", icon: FaBriefcase },
    { id: 5, label: "Emergency", icon: FaShieldAlt },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-8">
          <Spinner animation="border" role="status" />
          <p className="mt-2 text-sm text-gray-600">Loading RM profile...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert variant="danger" className="max-w-lg mx-auto">
          <Alert.Heading className="text-base font-semibold">
            Error
          </Alert.Heading>
          {error || "RM profile not found"}
          <div className="mt-3">
            <Button variant="primary" size="sm" onClick={fetchRMData}>
              Retry
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-800">RM Profile</h1>
          <Badge bg="primary" className="text-xs px-2 py-1">
            {employee.role}
          </Badge>
          <Badge bg="success" className="text-xs px-2 py-1">
            Relationship Manager
          </Badge>
        </div>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => navigate("/rm/dashboard")}
          className="flex items-center gap-1"
        >
          ← Back to Dashboard
        </Button>
      </div>

      {/* Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Profile Card */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 truncate">
                {employee.name || "N/A"}
              </h2>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge bg="primary" className="text-xs px-2 py-0.5">
                  {employee.employeeCode || "N/A"}
                </Badge>
                <Badge bg="secondary" className="text-xs px-2 py-0.5">
                  {employee.designation || "RM"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FaBriefcase className="text-gray-500 text-xs" />
                <div>
                  <p className="text-xs text-gray-500">Designation</p>
                  <p className="font-medium text-gray-800">
                    {employee.designation || "Relationship Manager"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FiPhone className="text-gray-500 text-xs" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-gray-800">
                    {employee.mobileNo || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FiMail className="text-gray-500 text-xs" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-800 truncate">
                    {employee.emailId || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FaBusinessTime className="text-gray-500 text-xs" />
                <div>
                  <p className="text-xs text-gray-500">Experience</p>
                  <p className="font-medium text-gray-800">
                    {calculateExperience(employee.dateOfJoining)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FaCalendarAlt className="text-gray-500 text-xs" />
                <div>
                  <p className="text-xs text-gray-500">Date of Joining</p>
                  <p className="font-medium text-gray-800">
                    {formatDate(employee.dateOfJoining)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FaIdCardAlt className="text-gray-500 text-xs" />
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <Badge bg="success" className="text-xs px-2 py-0.5">
                    {employee.status || "Active"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-3">
              <div className="bg-blue-50 rounded-lg p-2">
                <FaCalendarAlt className="text-blue-600 text-sm" />
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-500">
                  Joining Date
                </h3>
                <p className="text-sm font-semibold text-gray-800">
                  {formatDate(employee.dateOfJoining)}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-3">
              <div className="bg-green-50 rounded-lg p-2">
                <FaIdCardAlt className="text-green-600 text-sm" />
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-500">
                  Employee Code
                </h3>
                <p className="text-sm font-semibold text-gray-800">
                  {employee.employeeCode || "N/A"}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-3">
              <div className="bg-purple-50 rounded-lg p-2">
                <FaBusinessTime className="text-purple-600 text-sm" />
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-500">Work Area</h3>
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {employee.allocatedWorkArea || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Tabs Header */}
            <div className="flex flex-wrap border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                    tabIndex === tab.id
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setTabIndex(tab.id)}
                >
                  <tab.icon className="text-xs" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {/* Personal Details */}
              {tabIndex === 0 && (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-800">
                    Personal Information
                  </h3>
                  <Row>
                    <Col md={6}>
                      <div className="space-y-3">
                        <h5 className="text-sm font-medium text-blue-600 pb-2 border-b border-gray-200">
                          Basic Information
                        </h5>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Full Name:</span>
                          <span className="font-medium text-gray-800">
                            {employee.name || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Gender:</span>
                          <span className="font-medium text-gray-800">
                            {employee.gender || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Date of Birth:</span>
                          <span className="font-medium text-gray-800">
                            {formatDate(employee.dob)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Age:</span>
                          <span className="font-medium text-gray-800">
                            {employee.dob
                              ? calculateAge(employee.dob) + " years"
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Marriage Date:</span>
                          <span className="font-medium text-gray-800">
                            {formatDate(employee.marriageDate)}
                          </span>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-blue-600 pb-2 border-b border-gray-200">
                            Contact Information
                          </h5>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Mobile No:</span>
                            <span className="font-medium text-gray-800">
                              {employee.mobileNo || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium text-gray-800">
                              {employee.emailId || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Office Mobile:
                            </span>
                            <span className="font-medium text-gray-800">
                              {employee.officeMobile || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Office Email:</span>
                            <span className="font-medium text-gray-800">
                              {employee.officeEmail || "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-blue-600 pb-2 border-b border-gray-200">
                            Identification
                          </h5>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">PAN No:</span>
                            <span className="font-medium text-gray-800">
                              {employee.panNo || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Aadhar No:</span>
                            <span className="font-medium text-gray-800">
                              {employee.aadharNo || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Official Details */}
              {tabIndex === 1 && (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-800">
                    Official Information
                  </h3>
                  <Row>
                    <Col md={6}>
                      <div className="space-y-3">
                        <h5 className="text-sm font-medium text-blue-600 pb-2 border-b border-gray-200">
                          Employment Details
                        </h5>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Employee Code:</span>
                          <span className="font-medium text-gray-800">
                            {employee.employeeCode || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Designation:</span>
                          <span className="font-medium text-gray-800">
                            {employee.designation || "RM"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Role:</span>
                          <span className="font-medium text-gray-800">
                            {employee.role || "RM"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Date of Joining:
                          </span>
                          <span className="font-medium text-gray-800">
                            {formatDate(employee.dateOfJoining)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Date of Termination:
                          </span>
                          <span className="font-medium text-gray-800">
                            {formatDate(employee.dateOfTermination)}
                          </span>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-blue-600 pb-2 border-b border-gray-200">
                            Office Information
                          </h5>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Allotted Login ID:
                            </span>
                            <span className="font-medium text-gray-800">
                              {employee.allottedLoginId || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Allocated Work Area:
                            </span>
                            <span className="font-medium text-gray-800">
                              {employee.allocatedWorkArea || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Home Town:</span>
                            <span className="font-medium text-gray-800">
                              {employee.homeTown || "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-blue-600 pb-2 border-b border-gray-200">
                            Compensation
                          </h5>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Salary on Joining:
                            </span>
                            <span className="font-medium text-gray-800">
                              {employee.salaryOnJoining || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Expenses:</span>
                            <span className="font-medium text-gray-800">
                              {employee.expenses || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Incentives:</span>
                            <span className="font-medium text-gray-800">
                              {employee.incentives || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Address Details */}
              {tabIndex === 2 && (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-800">
                    Address Information
                  </h3>
                  <Row>
                    <Col md={6}>
                      <div className="space-y-3">
                        <h5 className="text-sm font-medium text-blue-600 pb-2 border-b border-gray-200">
                          Present Address
                        </h5>
                        <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm min-h-[80px]">
                          {employee.presentAddress || "Not specified"}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="space-y-3">
                        <h5 className="text-sm font-medium text-blue-600 pb-2 border-b border-gray-200">
                          Permanent Address
                        </h5>
                        <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm min-h-[80px]">
                          {employee.permanentAddress || "Not specified"}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Bank Details */}
              {tabIndex === 3 && (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-800">
                    Bank Information
                  </h3>
                  <Row>
                    <Col md={6}>
                      <div className="space-y-3">
                        <h5 className="text-sm font-medium text-blue-600 pb-2 border-b border-gray-200">
                          Account Details
                        </h5>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Bank Name:</span>
                          <span className="font-medium text-gray-800">
                            {employee.bankName || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Account Number:</span>
                          <span className="font-medium text-gray-800">
                            {employee.accountNo || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">IFSC Code:</span>
                          <span className="font-medium text-gray-800">
                            {employee.ifscCode || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">MICR Code:</span>
                          <span className="font-medium text-gray-800">
                            {employee.micr || "N/A"}
                          </span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Employment Details */}
              {tabIndex === 4 && (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-800">
                    Employment Documents & Assets
                  </h3>
                  <Row>
                    <Col md={6}>
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-blue-600 pb-2 border-b border-gray-200">
                            Documents
                          </h5>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Offer Letter:</span>
                            <span className="font-medium text-gray-800">
                              {employee.offerLetter || "Not provided"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Undertaking:</span>
                            <span className="font-medium text-gray-800">
                              {employee.undertaking || "Not provided"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Track Record:</span>
                            <span className="font-medium text-gray-800">
                              {employee.trackRecord || "Not provided"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-blue-600 pb-2 border-b border-gray-200">
                            Alerts
                          </h5>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              On First Joining:
                            </span>
                            <span className="font-medium text-gray-800">
                              {employee.onFirstJoining || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              On 6 Month Completion:
                            </span>
                            <span className="font-medium text-gray-800">
                              {employee.onSixMonthCompletion || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              On 12 Month Completion:
                            </span>
                            <span className="font-medium text-gray-800">
                              {employee.onTwelveMonthCompletion || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="space-y-3">
                        <h5 className="text-sm font-medium text-blue-600 pb-2 border-b border-gray-200">
                          Office Assets
                        </h5>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Office Kit:</span>
                          <span className="font-medium text-gray-800">
                            {employee.officeKit || "Not provided"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Drawer Key:</span>
                          <span className="font-medium text-gray-800">
                            {employee.drawerKeyName
                              ? `${employee.drawerKeyName} (${
                                  employee.drawerKeyNumber || "No number"
                                })`
                              : "Not assigned"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Office Key:</span>
                          <span className="font-medium text-gray-800">
                            {employee.officeKey || "Not assigned"}
                          </span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Emergency Contacts */}
              {tabIndex === 5 && (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-800">
                    Emergency Contacts
                  </h3>
                  <Row>
                    <Col md={6}>
                      <div className="space-y-3">
                        <h5 className="text-sm font-medium text-blue-600 pb-2 border-b border-gray-200">
                          Family Contacts
                        </h5>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Family Contact Person:
                          </span>
                          <span className="font-medium text-gray-800">
                            {employee.familyContactPerson || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Family Contact Mobile:
                          </span>
                          <span className="font-medium text-gray-800">
                            {employee.familyContactMobile || "N/A"}
                          </span>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="space-y-3">
                        <h5 className="text-sm font-medium text-blue-600 pb-2 border-b border-gray-200">
                          Emergency Contacts
                        </h5>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Emergency Contact Person:
                          </span>
                          <span className="font-medium text-gray-800">
                            {employee.emergencyContactPerson || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Emergency Contact Mobile:
                          </span>
                          <span className="font-medium text-gray-800">
                            {employee.emergencyContactMobile || "N/A"}
                          </span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RMProfile;
