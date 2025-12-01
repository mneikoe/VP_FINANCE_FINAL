import React, { useEffect, useReducer, useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { Modal, Button, Table } from "react-bootstrap";
import { Row, Col } from 'react-bootstrap';
import { useRef } from 'react';

import {
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiDownload,
  FiUpload,
} from "react-icons/fi";
import {
  FaBusinessTime,
  FaIdCardAlt,
  FaUsers,
  FaHeartbeat,
  FaMoneyBillWave,
  FaTasks,
  FaBullseye,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {getSuspectById} from "../../../redux/feature/SuspectRedux/SuspectThunx";
import TasksTab from "../TaskTab";

const SuspectDetail = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [checklists, setChecklists] = useState([{ name: "", file: null }]);
  const [textChecklists, setTextChecklists] = useState([""]);
  const [userData, setUserData] = useState(null);
  const [suspectId, setsuspectId] = useState("");
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [futurePriorities, setfuturePriorities] = useState([])
  const [proposedPlans, setproposedPlans] = useState([])


  const handleOpenModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType("");
  };

  const user = useSelector((state) => state.suspect);



  const handleFileChanges = (e) => {
    setKycFile(e.target.files[0]);
  };

  // Userdataconst

  console.log(id);

  const dispatch = useDispatch();

  useEffect(() => {
    const init = async () => {
      const res = await dispatch(getSuspectById(id)).unwrap();
      console.log("suspect Details fetched successfully", res);
      setUserData(res?.suspect);
      setfuturePriorities(userData?.futurePriorities?.futurePriorities)
      setproposedPlans(userData?.proposedPlan)
    };
    init();
  }, []);


  const addChecklist = () => {
    setChecklists([...checklists, { name: "", file: null }]);
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };



  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };



  const formatFieldName = (key) => {
    return key
      .split(/(?=[A-Z])/)
      .join(" ")
      .replace(/^./, (str) => str.toUpperCase());
  };

  // Fields that should be formatted as currency
  const currencyFields = [
    'amount', 'totalAmount', 'premium', 'sumAssured', 'investment',
    'monthlyAmount', 'yearlyAmount', 'targetAmount', 'currentValue'
  ];

  // Fields that should be formatted as dates
  const dateFields = [
    'date', 'startDate', 'endDate', 'maturityDate', 'createdAt', 'updatedAt'
  ];


  // Remove checklist item
  const removeChecklist = (index) => {
    const newChecklists = [...checklists];
    newChecklists.splice(index, 1);
    setChecklists(newChecklists);
  };

  // Handle checklist name change
  const handleChecklistChange = (index, e) => {
    const newChecklists = [...checklists];
    newChecklists[index].name = e.target.value;
    setChecklists(newChecklists);
  };

  // Handle file change
  const handleFileChange = (index, e) => {
    const newChecklists = [...checklists];
    newChecklists[index].file = e.target.files[0];
    setChecklists(newChecklists);
  };

  // Add new text checklist
  const addTextChecklist = () => {
    setTextChecklists([...textChecklists, ""]);
  };

  // Handle text checklist change
  const handleTextChecklistChange = (index, e) => {
    const newChecklists = [...textChecklists];
    newChecklists[index] = e.target.value;
    setTextChecklists(newChecklists);
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };


  const hasValidFamilyMembers = userData?.familyMembers?.some(member =>
    member.name && member.name.trim() !== ''
  );


  return (
    <>
      {!userData ? (
        <h1>loading</h1>
      ) : (
        <div className=" container customer-profile-container">
          {/* Header Section */}
          <div className="profile-header">
            <h1>Suspect Profile</h1>
            <div className="status-badge">
              <span
                className={`status-dot ${userData?.status}`}
              ></span>
              {userData?.status}
            </div>
          </div>

          <div className="profile-grid">
            {/* Profile Card */}
            <div className="profile-card">
             

              <div className="profile-info">
                <h2 className="profile-name">{userData?.personalDetails?.name || "N/A"}</h2>
                <div className="profile-meta"> 
                  <span className="badge text-bg-danger">
                    {userData?.suspect?.personalDetails?.groupCode || "N/A"}
                  </span>
                  <span className="badge secondary">{userData.grade || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <FiPhone className="detail-icon" />
                  <div>
                    <p className="detail-label">Name</p>
                    <p className="detail-value">
                      {userData?.personalDetails?.groupName || "Finance"}
                    </p>
                  </div>
                </div>

                

                <div className="profile-details">
                  <div className="detail-item">
                    <FiUser className="detail-icon" />
                    <div>
                      <p className="detail-label">Occupation</p>
                      <p className="detail-value ">
                        {userData?.personalDetails?.organisation || "N/A"}
                      </p>
                    </div>
                    {console.log("occupation", userData)}
                  </div>
                  <div className="detail-item">
                    <FiPhone className="detail-icon" />
                    <div>
                      <p className="detail-label">Phone</p>
                      <p className="detail-value">
                        {userData?.personalDetails?.mobileNo || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <FiMail className="detail-icon" />
                    <div>
                      <p className="detail-label">Email</p>
                      <p className="detail-value">
                        {userData?.personalDetails?.emailId || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <FiMail className="detail-icon" />
                    <div>
                      <p className="detail-label">Status</p>
                      <p className="detail-value">
                        {userData?.status || "N/A"}
                      </p>
                    </div>
                  </div>


                 
                </div>

                <div className="profile-stats">
                  <div className="stat-item">
                    <p className="stat-value">{userData?.familyMembers.length}</p>
                    <p className="stat-label">Family Members</p>
                  </div>
                  <div className="stat-item">
                    <p className="stat-value">5</p>
                    <p className="stat-label">Active Policies</p>
                  </div>
                  <div className="stat-item">
                    <p className="stat-value">12</p>
                    <p className="stat-label">Total Interactions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="content-area">
              {/* Quick Info Cards */}
              <div className="info-cards">
                <div className="info-card">
                  <div className="info-icon">
                    <FiUser size={24} />
                  </div>
                  <div>
                    <h3>Member Since</h3>
                    {/* <p>{userData.createdAt}</p>
                     */}
                    <p>{formatDate(userData.createdAt)}</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-icon">
                    <FiPhone size={24} />
                  </div>
                  <div>
                    <h3>Last Contact</h3>
                    {/* <p>{userData.lastContact}</p> */}
                    <p>Last month</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-icon">
                    <FaIdCardAlt size={24} />
                  </div>
                  <div>
                    <h3>Referred By</h3>
                    <p>{userData?.personalDetails?.leadPerson}</p>
                  </div>
                </div>
              </div>

             
              <div className="tabs-container">
                <Tabs
                  selectedIndex={tabIndex}
                  onSelect={(index) => setTabIndex(index)}
                >
                  <TabList className="custom-tablist">

                    <Tab
                      className={`custom-tab ${tabIndex === 0 ? "active" : ""}`}
                    >
                      <FiUser className="tab-icon" />
                      <span>Personal Details</span>
                    </Tab>
                    <Tab
                      className={`custom-tab ${tabIndex === 1 ? "active" : ""}`}
                    >
                      <FaUsers className="tab-icon" />
                      <span>Family Members</span>
                    </Tab>

                    <Tab
                      className={`custom-tab ${tabIndex === 2 ? "active" : ""}`}
                    >
                      <FaMoneyBillWave className="tab-icon" />
                      <span>Financial Details</span>
                    </Tab>

                    <Tab
                      className={`custom-tab ${tabIndex === 3 ? "active" : ""}`}
                    >
                      <FaBullseye className="tab-icon" />
                      <span>Future Priorities</span>
                    </Tab>
                    <Tab
                      className={`custom-tab ${tabIndex === 4 ? "active" : ""}`}
                    >
                      <FaBullseye className="tab-icon" />
                      <span>Proposal Financial Plan"</span>
                    </Tab>
                   
                  

                     <Tab
                      className={`custom-tab ${tabIndex === 6 ? "active" : ""}`}
                    >
                      <FaTasks className="tab-icon" />
                      <span>Tasks</span>
                    </Tab>


                  </TabList>


                  {/* // personal Details tab */}
                  <TabPanel>
                    <div className="profile-details-container p-4">
                      <div className="row g-4">
                        {/* Left Column */}
                        <div className="col-md-12">
                          <div className="card shadow-sm h-100">
                            <div className="card-body">
                              <h5 className="card-title text-[#3498db] mb-4 border-bottom pb-2">
                                <FiUser className="me-2" />
                                Basic Information
                              </h5>

                              <div className="row">
                                {/* First Row - 2 items in one line */}
                                <div className="col-md-6">
                                  <div className="detail-item d-flex align-items-center mb-3">
                                    <div className="d-flex flex-grow-1">
                                      <span className="text-muted me-2">
                                        Group Code:
                                      </span>
                                      <span className="fw-semibold">
                                        {userData?.personalDetails?.groupCode || "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="detail-item d-flex align-items-center mb-3">
                                    <div className="d-flex flex-grow-1">
                                      <span className="text-muted me-2">
                                        Group Head:
                                      </span>
                                      <span className="fw-semibold">
                                        {userData?.personalDetails?.familyHead || "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Second Row - 2 items in one line */}
                                <div className="col-md-6">
                                  <div className="detail-item d-flex align-items-center mb-3">
                                    <div className="d-flex flex-grow-1">
                                      <span className="text-muted me-2">
                                        WhatsApp:
                                      </span>
                                      <span className="fw-semibold">
                                        {userData?.personalDetails?.whatsappNo || "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="detail-item d-flex align-items-center mb-3">
                                    <div className="d-flex flex-grow-1">
                                      <span className="text-muted me-2">
                                        PA Name:
                                      </span>
                                      <span className="fw-semibold">
                                        {userData?.personalDetails?.paName || "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="detail-item d-flex align-items-center mb-3">
                                    <div className="d-flex flex-grow-1">
                                      <span className="text-muted me-2">
                                        Area:
                                      </span>
                                      <span className="fw-semibold text-break">
                                        {
                                          userData?.personalDetails
                                            ?.preferredMeetingArea || "N/A"
                                        } 
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Third Row - 2 items in one line */}

                                <div className="col-md-6">
                                  <div className="detail-item d-flex align-items-center mb-3">
                                    <div className="d-flex flex-grow-1">
                                      <span className="text-muted me-2">
                                        PA Mobile:
                                      </span>
                                      <span className="fw-semibold">
                                        {userData?.personalDetails?.paMobileNo || "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Full width items */}
                                <div className="col-md-6">
                                  <div className="detail-item d-flex align-items-center mb-3">
                                    <div className="d-flex flex-grow-1">
                                      <span className="text-muted me-2">
                                        Meeting Address:
                                      </span>
                                      <span className="fw-semibold">
                                        {
                                          userData?.personalDetails
                                            ?.preferredMeetingAddr || "N/A"
                                        }
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="detail-item d-flex align-items-center mb-3">
                                    <div className="d-flex flex-grow-1">
                                      <span className="text-muted me-2">
                                        Best Time:
                                      </span>
                                      <span className="fw-semibold">
                                        {userData?.personalDetails?.bestTime || "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Full Width Card */}
                        <div className="col-12">
                          <div className="card shadow-sm">
                            <div className="card-body">
                              <h5 className="card-title text-[#3498db] mb-4 border-bottom pb-2">
                                <FiUser className="me-2" />
                                Additional Information
                              </h5>

                              <div className="row">
                                <div className="col-md-4">
                                  <div className="detail-item d-flex align-items-center mb-3">
                                    <div className="d-flex flex-grow-1">
                                      <span className="text-muted me-2">
                                        Purpose:
                                      </span>
                                      <span className="fw-semibold">
                                        {
                                          userData?.personalDetails
                                            ?.callingPurpose || "N/A"
                                        }
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="col-md-4">
                                  <div className="detail-item d-flex align-items-center mb-3">
                                    <div className="d-flex flex-grow-1">
                                      <span className="text-muted me-2">
                                        Select Name:
                                      </span>
                                      <span className="fw-semibold">
                                        {userData?.personalDetails?.name || "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="col-md-4">
                                  <div className="detail-item d-flex align-items-center mb-3">
                                    <div className="d-flex flex-grow-1">
                                      <span className="text-muted me-2">
                                        CRE Name:
                                      </span>
                                      <span className="fw-semibold">
                                        {
                                          userData?.personalDetails
                                            ?.allocatedCRE || "N/A"
                                        }
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabPanel>


                  {/* fmily members tab */}
                  <TabPanel>
                    <div className="tab-content">

                      {userData?.familyMembers?.length > 0 ? <div className="family-grid">
                        <h3>Family Members</h3>
                        {userData?.familyMembers
                          ?.filter(
                            (member) =>
                              member?.relation?.toLowerCase() !== "self"
                          )
                          .map((member, index) => (
                            <div
                              className="family-card"
                              key={`member-${index}`}
                            >
                              <div className="family-avatar">
                                {member?.name?.charAt(0) || "N"}
                              </div>
                              <div className="family-info">
                                <h3 className="mb-2 fw-semibold">
                                  {member?.name || "N/A"}
                                </h3>

                                <p>
                                  <strong>Relation:</strong> {member?.relation || "N/A"}
                                </p>

                                <p>
                                  <strong>Age:</strong>{" "}
                                  {member?.dobActual
                                    ? `${calculateAge(
                                      member.dobActual
                                    )} years (${new Date(
                                      member.dobActual
                                    ).toLocaleDateString("en-GB")})`
                                    : "N/A"}
                                </p>

                                <p>
                                  <strong>Annual Income:</strong>{" "}
                                  {member?.annualIncome || "N/A"}
                                </p>

                                <span className="badge bg-info text-dark">
                                  {member?.occupation || "Dependent"}
                                </span>

                              </div>
                            </div>
                          ))}


                      </div> : "No Family Members"}
                    </div>
                  </TabPanel>


                   {/* // financial tab    */}
                  <TabPanel>
                    <div className="tab-content">
                      <h3>Financial Overview</h3>

                      <Row className="mb-3">
                        <Col md={4}>
                          <div className="financial-card  " style={{ background: "darkblue" }} onClick={() => handleOpenModal('insurance')}>
                            <h4>Total Insurance
                            </h4>

                            {/* <p className="meta">`Total ${userData?.financialInfo?.insurance.length} policies`</p> */}
                            <p className="meta">Total {userData?.financialInfo?.insurance?.length || 0} policies</p>
                          </div>
                        </Col>

                        <Col md={4}>
                          <div className="financial-card " style={{ background: "green" }} onClick={() => handleOpenModal('investment')}>
                            <h4>Total Investment</h4>

                            {/* <p className="meta">`Total ${userData?.financialInfo?.investments.length} Investments`</p> */}
                            <p className="meta">Total {userData?.financialInfo?.investments?.length || 0} Investments</p>
                          </div>
                        </Col>

                        <Col md={4}>
                          <div style={{ background: "darkred" }} className="financial-card " onClick={() => handleOpenModal('loan')}>
                            <h4>Loan & Liabilities</h4>

                            {/* <p className="meta">`Total ${userData?.financialInfo?.loans.length}  Loan & Liabilities`</p> */}
                            <p className="meta">Total {userData?.financialInfo?.loans?.length || 0} Loan & Liabilities</p>
                          </div>
                        </Col>
                      </Row>


                    </div>
                  </TabPanel>


              
                   {/* // future priorities  */}
                  <TabPanel>
                    <div className="">
                      <div className="card-body mb-5">
                        <h5 className="card-title p-3 border-bottom pb-2 mb-2">
                          Future Priorities
                        </h5>

                        {userData?.futurePriorities.length > 0 ? (
                          <div className="row">
                            {userData?.futurePriorities.map((priority, index) => (
                              <div key={priority._id || index} className="col-md-6 col-lg-4 mb-4">
                                <div className="card h-100 shadow-sm">
                                  <div className="card-header badge bg-info text-dark">
                                    <h6 className="mb-0">{priority.priorityName || 'Unnamed Priority'}</h6>
                                  </div>
                                  <div className="card-body">
                                    <div className="mb-3">
                                      <strong>Approximate Amount:</strong>
                                      <div className="text-success fs-5">
                                        {priority.approxAmount ? formatCurrency(priority.approxAmount) : 'Not specified'}
                                      </div>
                                    </div>

                                    <div className="mb-3">
                                      <strong>Duration:</strong>
                                      <div>{priority.duration || 'Not specified'}</div>
                                    </div>

                                    <div className="mb-3">
                                      <strong>Members:</strong>
                                      <div>
                                        {priority.members && priority.members.length > 0 ? (
                                          priority.members.map((member, memberIndex) => (
                                            <span key={memberIndex} className="badge bg-info text-dark me-1 mb-1">
                                              {member}
                                            </span>
                                          ))
                                        ) : (
                                          'Not specified'
                                        )}
                                      </div>
                                    </div>

                                    {priority.remark && (
                                      <div className="mb-2">
                                        <strong>Remark:</strong>
                                        <div className="text-muted small">{priority.remark || "N/A"}</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <div className="alert alert-info">

                              <p className="mb-0 text-muted">No future priorities have been added yet.</p>
                            </div>
                          </div>
                        )}

                        {/* Summary at the bottom if there are priorities */}
                        {userData?.futurePriorities?.length > 0 && (
                          <div className="mt-4 p-3 bg-light rounded">
                            <div className="row text-center">
                              <div className="col-md-6">
                                <h6>Total Priorities</h6>
                                <span className="badge bg-info text-dark">
                                  {userData?.futurePriorities.length || 0}
                                </span>
                              </div>
                              <div className="col-md-6">
                                <h6>Total Estimated Amount</h6>
                                <span className="text-success fw-bold">
                                  {formatCurrency(
                                    userData?.futurePriorities.reduce(
                                      (total, priority) => total + (priority.approxAmount || 0),
                                      0
                                    )
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabPanel>



                  {/* //proposedPlan */}
                    <TabPanel>
  <div className="tab-content p-4">
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h3 className=" fw-bold mb-0">
        <i className="bi bi-graph-up-arrow me-2"></i>
        Proposed Financial Plans
      </h3>
      <span className="badge bg-info text-dark fs-6 px-3 py-2">
        {userData?.proposedPlan?.length || 0} Plans
      </span>
    </div>

    {userData?.proposedPlan && userData?.proposedPlan?.length > 0 ? (
      <>
        <div className="row">
          {userData?.proposedPlan?.map((plan, index) => {
            return (
              <div className="col-lg-6 col-xl-4 mb-4" key={index}>
                <div className="card h-100 shadow-sm border-0 position-relative overflow-hidden">
                  <div className="card-header bg-gradient-primary text-white border-0 py-3 badge bg-info text-dark">
                    <div className="d-flex justify-content-between align-items-center ">
                      <h6 className="mb-0 fw-bold">
                        <i className="bi bi-file-earmark-text me-2"></i>
                        Plan {index + 1}
                      </h6>
                    
                    </div>
                  </div>
                  
                  <div className="card-body p-4">
                    <div className="row g-3">
                      <div className="col-12">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted fw-medium">Created On</small>
                          <div className="fw-bold text-dark">{formatDate(plan?.createdDate || "N/A")}</div>
                        </div>
                      </div>
                      
                      <div className="col-12">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted fw-medium">Member Name</small>
                          <div className="fw-bold text-dark">{plan?.memberName || 'N/A'}</div>
                        </div>
                      </div>
                      
                      <div className="col-12">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted fw-medium">Financial Product</small>
                          <div className="fw-bold text-dark">{plan?.financialProduct || 'N/A'}</div>
                        </div>
                      </div>
                      
                      <div className="col-12">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted fw-medium">Plan Name</small>
                          <div className="fw-bold text-dark">{plan?.planName || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                 
                  
                  
                </div>
              </div>
            );
          })}
        </div>
      </>
    ) : (
      <div className="text-center py-5">
        <div className="mb-4">
          <i className="bi bi-inbox display-1 text-muted"></i>
        </div>
        <div className="alert alert-info border-0 shadow-sm mx-auto" style={{maxWidth: '400px'}}>
          <h5 className="alert-heading mb-2">
            <i className="bi bi-info-circle me-2"></i>
            No Plans Available
          </h5>
          <p className="mb-0">No Proposed Financial Plans have been added yet. Create your first plan to get started!</p>
        </div>
        <button className="btn btn-primary mt-3">
          <i className="bi bi-plus-circle me-2"></i>
          Add New Plan
        </button>
      </div>
    )}
  </div>

  <style jsx>{`
    
    .card {
      transition: all 0.3s ease;
      border-radius: 12px !important;
    }
    
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
    }
    
    .rounded-circle {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .bg-light {
      background-color: #f8f9fa !important;
      border: 1px solid #e9ecef;
    }
  `}</style>
                   </TabPanel>

                   
              


                   {/* // tasks tab */}
                   <TabPanel>
                    <TasksTab/>
                  </TabPanel>
                  

                     {/* model open */}
                  <Modal
                    show={showModal}
                    onHide={handleCloseModal}
                    size="xl"
                    centered
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>
                        {modalType === "insurance" && "Insurance Policies Details"}
                        {modalType === "investment" && "Investment Details"}
                        {modalType === "loan" && "Loan & Liabilities Details"}
                      </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                      <Table striped bordered hover responsive>
                        {/* Header */}
                        <thead>
                          {modalType === "insurance" && (
                            <tr>
                              <th>Policy Number</th>
                              <th>Plan Name</th>
                              <th>Company</th>
                              <th>Member Name</th>
                              <th>Premium</th>
                              <th>Sum Assured</th>
                              <th>Start Date</th>
                              <th>Maturity Date</th>
                              <th>Mode</th>
                            </tr>
                          )}

                          {modalType === "investment" && (
                            <tr>
                              <th>Company Name</th>
                              <th>Product Type</th>
                              <th>Plan Name</th>
                              <th>Member Name</th>
                              <th>Amount</th>
                              <th>Start Date</th>
                              <th>Maturity Date</th>
                              <th>Submission Date</th>
                            </tr>
                          )}

                          {modalType === "loan" && (
                            <tr>
                              <th>Account Number</th>
                              <th>Loan Type</th>
                              <th>Company Name</th>
                              <th>Member Name</th>
                              <th>Outstanding Amount</th>
                              <th>Interest Rate</th>
                              <th>Term</th>
                              <th>Start Date</th>
                              <th>Maturity Date</th>
                            </tr>
                          )}
                        </thead>

                        {/* Body */}
                        <tbody>
                          {modalType === "insurance" &&
                            userData?.financialInfo?.insurance?.map((item, index) => (
                              <tr key={item._id || index}>
                                <td>{item.policyNumber || 'N/A'}</td>
                                <td>{item.planName || 'N/A'}</td>
                                <td>{item.insuranceCompany || 'N/A'}</td>
                                <td>{item.memberName || 'N/A'}</td>
                                <td>{item.premium ? formatCurrency(item.premium) : 'N/A'}</td>
                                <td>{item.sumAssured ? formatCurrency(item.sumAssured) : 'N/A'}</td>
                                <td>{formatDate(item.startDate)}</td>
                                <td>{formatDate(item.maturityDate)}</td>
                                <td>{item.mode || 'N/A'}</td>
                              </tr>
                            ))
                          }

                          {modalType === "investment" &&
                            userData?.financialInfo?.investments?.map((item, index) => (
                              <tr key={item._id || index}>
                                <td>{item.companyName || 'N/A'}</td>
                                <td>{item.financialProduct || 'N/A'}</td>
                                <td>{item.planName || 'N/A'}</td>
                                <td>{item.memberName || 'N/A'}</td>
                                <td>{item.amount ? formatCurrency(item.amount) : 'N/A'}</td>
                                <td>{formatDate(item.startDate)}</td>
                                <td>{formatDate(item.maturityDate)}</td>
                                <td>{formatDate(item.submissionDate)}</td>
                              </tr>
                            ))
                          }

                          {modalType === "loan" &&
                            userData?.financialInfo?.loans?.map((item, index) => (
                              <tr key={item._id || index}>
                                <td>{item.loanAccountNumber || 'N/A'}</td>
                                <td>{item.loanType || 'N/A'}</td>
                                <td>{item.companyName || 'N/A'}</td>
                                <td>{item.memberName || 'N/A'}</td>
                                <td>{item.outstandingAmount ? formatCurrency(item.outstandingAmount) : 'N/A'}</td>
                                <td>{item.interestRate ? `${item.interestRate}%` : 'N/A'}</td>
                                <td>{item.term || 'N/A'}</td>
                                <td>{formatDate(item.startDate)}</td>
                                <td>{formatDate(item.maturityDate)}</td>
                              </tr>
                            ))
                          }
                        </tbody>
                      </Table>

                      {/* Show message if no data */}
                      {modalType === "insurance" && (!userData?.financialInfo?.insurance || userData.financialInfo.insurance.length === 0) && (
                        <div className="text-center py-4">
                          <p className="text-muted">No insurance policies found</p>
                        </div>
                      )}

                      {modalType === "investment" && (!userData?.financialInfo?.investments || userData.financialInfo.investments.length === 0) && (
                        <div className="text-center py-4">
                          <p className="text-muted">No investments found</p>
                        </div>
                      )}

                      {modalType === "loan" && (!userData?.financialInfo?.loans || userData.financialInfo.loans.length === 0) && (
                        <div className="text-center py-4">
                          <p className="text-muted">No loans found</p>
                        </div>
                      )}
                    </Modal.Body>

                    <Modal.Footer>
                      <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                      </Button>
                    </Modal.Footer>
                  </Modal>


                  

                </Tabs>
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

            .status-badge {
              display: flex;
              align-items: center;
              background: #f8f9fa;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 14px;
            }

            .status-dot {
              width: 10px;
              height: 10px;
              border-radius: 50%;
              margin-right: 8px;
            }

            .status-dot.active {
              background: #28a745;
            }

            .status-dot.inactive {
              background: #6c757d;
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

            .profile-image-container {
              position: relative;
              height: 200px;
            }

            .profile-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .profile-actions {
              position: absolute;
              bottom: 10px;
              right: 10px;
              display: flex;
              gap: 8px;
            }

            .btn-icon {
              background: rgba(255, 255, 255, 0.9);
              border: none;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              color: #555;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              transition: all 0.2s;
            }

            .btn-icon:hover {
              background: white;
              color: #3498db;
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

            .profile-stats {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              margin-top: 20px;
              text-align: center;
            }

            .stat-item {
              background: #f8f9fa;
              padding: 12px;
              border-radius: 8px;
            }

            .stat-value {
              font-size: 20px;
              font-weight: 600;
              margin: 0;
              color: #2c3e50;
            }

            .stat-label {
              font-size: 12px;
              color: #7f8c8d;
              margin: 4px 0 0 0;
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
              list-style: none;
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
            }

            .form-group {
              margin-bottom: 20px;
            }

            .form-group label {
              display: block;
              font-size: 14px;
              margin-bottom: 8px;
              color: #555;
              font-weight: 500;
            }

            .form-control {
              width: 100%;
              padding: 10px 12px;
              border: 1px solid #ddd;
              border-radius: 6px;
              font-size: 14px;
              transition: border 0.2s;
            }

            .form-control:focus {
              outline: none;
              border-color: #3498db;
            }

            textarea.form-control {
              min-height: 100px;
              resize: vertical;
            }

            .input-group {
              display: flex;
              gap: 8px;
            }

            .input-group .form-control {
              flex: 1;
            }

            .btn-primary {
              background: #3498db;
              color: white;
              border: none;
              padding: 10px 16px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              transition: background 0.2s;
            }

            .btn-primary:hover {
              background: #2980b9;
            }

            .btn-secondary {
              background: #f8f9fa;
              color: #555;
              border: none;
              padding: 10px 16px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              transition: all 0.2s;
            }

            .btn-secondary:hover {
              background: #e9ecef;
            }

            .btn-outline {
              background: transparent;
              color: #3498db;
              border: 1px solid #3498db;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              transition: all 0.2s;
            }

            .btn-outline:hover {
              background: rgba(52, 152, 219, 0.1);
            }

            .btn-danger {
              background: #fff5f5;
              color: #e74c3c;
              border: none;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              transition: all 0.2s;
            }

            .btn-danger:hover {
              background: #ffecec;
            }

            .document-item {
              display: grid;
              grid-template-columns: 1fr 1fr auto;
              gap: 15px;
              align-items: end;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 8px;
              margin-bottom: 15px;
            }

            .remove-btn {
              margin-bottom: 8px;
            }

            .file-upload {
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .file-name {
              font-size: 13px;
              color: #7f8c8d;
            }

            .family-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
              gap: 15px;
            }

            .family-card {
              background: white;
              border: 1px solid #eee;
              border-radius: 8px;
              padding: 15px;
              display: flex;
              align-items: center;
              gap: 12px;
            }

            .family-avatar {
              width: 40px;
              height: 40px;
              background: #e3f2fd;
              color: #3498db;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
            }

            .family-info h4 {
              font-size: 14px;
              margin: 0 0 4px 0;
            }

            .family-info p {
              font-size: 12px;
              color: #7f8c8d;
              margin: 0 0 4px 0;
            }

            .add-family-btn {
              background: #f8f9fa;
              border: 1px dashed #ddd;
              border-radius: 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 20px;
              color: #7f8c8d;
              cursor: pointer;
              transition: all 0.2s;
            }

            .add-family-btn:hover {
              background: #e9ecef;
              color: #555;
            }

            .health-timeline {
              border-left: 2px solid #eee;
              padding-left: 20px;
              margin-left: 10px;
            }

            .timeline-item {
              position: relative;
              padding-bottom: 20px;
            }

            .timeline-item:before {
              content: "";
              position: absolute;
              left: -26px;
              top: 5px;
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: #3498db;
            }

            .timeline-date {
              font-size: 12px;
              color: #7f8c8d;
              margin-bottom: 5px;
            }

            .timeline-content {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
            }

            .timeline-content h4 {
              font-size: 15px;
              margin: 0 0 8px 0;
            }

            .timeline-content p {
              font-size: 13px;
              color: #555;
              margin: 0 0 12px 0;
            }

            .timeline-actions {
              display: flex;
              gap: 8px;
            }

            .financial-cards {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }

            .financial-card {
              padding: 15px;
              border-radius: 8px;
              color: white;
            }

            .financial-card.primary {
              background: linear-gradient(135deg, #3498db, #2980b9);
            }

            .financial-card.success {
              background: linear-gradient(135deg, #2ecc71, #27ae60);
            }

            .financial-card.warning {
              background: linear-gradient(135deg, #f39c12, #e67e22);
            }

            .financial-card h4 {
              font-size: 14px;
              margin: 0 0 10px 0;
              font-weight: 500;
            }

            .amount {
              font-size: 22px;
              font-weight: 600;
              margin: 0 0 5px 0;
            }

            .meta {
              font-size: 12px;
              opacity: 0.9;
              margin: 0;
            }

            .task-list {
              border: 1px solid #eee;
              border-radius: 8px;
              overflow: hidden;
            }

            .task-item {
              display: flex;
              align-items: center;
              padding: 12px 15px;
              border-bottom: 1px solid #eee;
              background: white;
            }

            .task-item:last-child {
              border-bottom: none;
            }

            .task-checkbox {
              margin-right: 12px;
            }

            .task-content {
              flex: 1;
            }

            .task-content label {
              font-size: 14px;
              cursor: pointer;
            }

            .task-content label.completed {
              text-decoration: line-through;
              color: #7f8c8d;
            }

            .task-meta {
              font-size: 12px;
              color: #7f8c8d;
              margin: 4px 0 0 0;
            }

            .task-actions {
              margin-left: 10px;
            }

            .add-task {
              display: flex;
              padding: 15px;
              background: #f8f9fa;
            }

            .add-task input {
              flex: 1;
              padding: 8px 12px;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 14px;
            }

            .add-task button {
              margin-left: 8px;
            }

            .priority-cards {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }

            .priority-card {
              background: white;
              border: 1px solid #eee;
              border-radius: 8px;
              padding: 15px;
              display: flex;
              align-items: center;
              gap: 12px;
            }

            .priority-icon {
              background: #e3f2fd;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #3498db;
            }

            .priority-card h4 {
              font-size: 15px;
              margin: 0 0 5px 0;
            }

            .priority-card p {
              font-size: 13px;
              color: #7f8c8d;
              margin: 0 0 8px 0;
            }

            .progress-bar {
              height: 6px;
              background: #eee;
              border-radius: 3px;
              overflow: hidden;
            }

            .progress {
              height: 100%;
              background: #3498db;
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default SuspectDetail
