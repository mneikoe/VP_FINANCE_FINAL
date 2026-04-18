import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Form, Row, Col, Button, Modal } from "react-bootstrap";
import { FaSave, FaUserPlus, FaTrash } from "react-icons/fa";
import { addFamilyMember, updateFamilyMember } from "../../../redux/feature/ClientRedux/ClientThunx";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

const FamilyMembersForm = ({ clientId, clientData, onClientCreated, familyDetail, setFamilyDetail }) => {
  const dispatch = useDispatch();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [healthModal, setHealthModal] = useState({ show: false, memberIndex: null });
  const selfDobRef = useRef(null);
  const selfDobFocusedRef = useRef(false);
  const { id } = useParams();
  const isEdit = !!id || !!clientData?._id;
  const selfDetails = familyDetail || clientData?.personalDetails || clientData || {};
  const primarySource = clientData?.personalDetails || selfDetails || {};

  // Default member template
  const defaultMember = (isSelf = false, data = {}) => ({
    _id: data._id || undefined,
    title: isSelf ? (data.title || "") : (data.title || ""),
    name: isSelf
      ? (familyDetail?.groupHeadName ||
          familyDetail?.groupName ||
          data.name ||
          "")
      : (data.name || ""),
    relation: isSelf ? "Self" : (data.relation || ""),
    dobActual: data.dobActual || "",
    dobRecord: data.dobRecord || "",
    marriageDate: data.marriageDate || "",
    occupation: data.occupation || "",
    occupationType: data.occupationType || "",
    designation: data.designation || "",
    annualIncome: data.annualIncome || "",
    contact: isSelf ? (familyDetail?.mobileNo || data.contact || "") : (data.contact || ""),
    adharNumber: data.adharNumber || "",
    panCardNumber: data.panCardNumber || "",
    includeHealth: isSelf ? (familyDetail?.includeHealth || data.includeHealth || false) : (data.includeHealth || false),
    healthHistory: {
      submissionDate: data.healthHistory?.submissionDate || "",
      diseaseName: data.healthHistory?.diseaseName || "",
      since: data.healthHistory?.since || "",
      height: data.healthHistory?.height || "",
      weight: data.healthHistory?.weight || "",
      remark: data.healthHistory?.remark || "",
    },
  });

  // Initialize state
  useEffect(() => {
    if (clientData) {
      if (clientData.familyMembers && clientData.familyMembers.length > 0) {
        // Load existing family members
        setFamilyMembers(
          clientData.familyMembers.map((m) =>
            m.relation === "Self" ? defaultMember(true, m) : defaultMember(false, m)
          )
        );
      } else {
        // Initialize with "Self" member
        setFamilyMembers([defaultMember(true, clientData)]);
      }
    } else {
      // Fallback: Initialize with empty "Self" member
      setFamilyMembers([defaultMember(true)]);
    }
  }, [clientData, familyDetail]);

  useEffect(() => {
    setFamilyMembers((prev) =>
      prev.map((member) =>
        member.relation === "Self"
          ? {
              ...member,
              title: selfDetails?.salutation || selfDetails?.title || member.title,
              name:
                selfDetails?.groupHeadName ||
                selfDetails?.groupName ||
                selfDetails?.name ||
                member.name,
              occupation:
                selfDetails?.leadOccupation || selfDetails?.occupation || member.occupation,
              occupationType:
                selfDetails?.leadOccupationType ||
                selfDetails?.occupationType ||
                member.occupationType,
              designation: selfDetails?.designation || member.designation,
              annualIncome: selfDetails?.annualIncome || member.annualIncome,
              contact: selfDetails?.mobileNo || selfDetails?.contact || member.contact,
            }
          : member
      )
    );
  }, [selfDetails]);

  useEffect(() => {
    if (!selfDobFocusedRef.current && familyMembers.length > 0 && selfDobRef.current) {
      selfDobRef.current.focus();
      selfDobFocusedRef.current = true;
    }
  }, [familyMembers]);

  const handleAddMember = () => {
    setFamilyMembers((prev) => [...prev, defaultMember(false)]);
  };

  const handleRemoveMember = (index) => {
    if (familyMembers[index].relation === "Self") {
      toast.warning("Cannot remove the 'Self' member!");
      return;
    }
    setFamilyMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMemberChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    const keys = name.split(".");
    const normalizedValue =
      name === "adharNumber" || name === "contact"
        ? String(value).replace(/\D/g, "")
        : name === "panCardNumber"
        ? String(value).toUpperCase().replace(/[^A-Z0-9]/g, "")
        : value;

    setFamilyMembers((prev) =>
      prev.map((member, i) => {
        if (i !== index) return member;

        if (keys.length === 1) {
          return {
            ...member,
            [keys[0]]: type === "checkbox" ? checked : normalizedValue,
          };
        } else if (keys.length === 2) {
          return {
            ...member,
            [keys[0]]: {
              ...member[keys[0]],
              [keys[1]]: normalizedValue,
            },
          };
        }
        return member;
      })
    );
  };

  const openHealthModal = (index) => {
    setHealthModal({ show: true, memberIndex: index });
  };

  const closeHealthModal = () => {
    setHealthModal({ show: false, memberIndex: null });
  };

  const handleHealthToggle = (index, checked) => {
    setFamilyMembers((prev) =>
      prev.map((member, i) =>
        i === index
          ? {
              ...member,
              includeHealth: checked,
              healthHistory: checked
                ? member.healthHistory
                : {
                    submissionDate: "",
                    diseaseName: "",
                    since: "",
                    height: "",
                    weight: "",
                    remark: "",
                  },
            }
          : member
      )
    );

    if (checked) {
      openHealthModal(index);
    } else if (healthModal.memberIndex === index) {
      closeHealthModal();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValidPan = (pan = "") => !pan || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
    const isValidAadhar = (aadhar = "") => !aadhar || /^\d{12}$/.test(aadhar);

    // Validate required fields
    const isValid = familyMembers.every((member) => {
      if (member.relation === "Self") {
        return (
          (member.name ||
            familyDetail?.groupHeadName ||
            familyDetail?.groupName ||
            clientData?.name) &&
          member.dobActual &&
          isValidAadhar(member.adharNumber) &&
          isValidPan(member.panCardNumber) &&
          (!member.includeHealth ||
            (member.healthHistory?.diseaseName && member.healthHistory?.submissionDate))
        );
      }
      return (
        member.name &&
        member.relation &&
        member.dobActual &&
        isValidAadhar(member.adharNumber) &&
        isValidPan(member.panCardNumber) &&
        (!member.includeHealth ||
          (member.healthHistory?.diseaseName && member.healthHistory?.submissionDate))
      );
    });

    if (!isValid) {
      toast.error("Please fill required fields and valid Aadhaar/PAN for each member.");
      return;
    }

    const idToUse = clientData?._id || clientId || id;
    if (!idToUse) {
      toast.error("No client ID found!");
      return;
    }

    // Prepare payload
    const membersPayload = familyMembers.map((member) => ({
      _id: member._id,
      title: member.relation === "Self" ? (clientData?.title || member.title) : member.title,
      name:
        member.relation === "Self"
          ? (familyDetail?.groupHeadName ||
              familyDetail?.groupName ||
              clientData?.name ||
              member.name)
          : member.name,
      relation: member.relation || "Self",
      dobActual: member.dobActual,
      dobRecord: member.dobRecord,
      marriageDate: member.marriageDate,
      occupation: member.occupation,
      occupationType: member.occupationType,
      designation: member.designation,
      annualIncome: member.annualIncome,
      contact: member.relation === "Self" ? (familyDetail?.mobileNo || clientData?.contact || member.contact) : member.contact,
      adharNumber: member.adharNumber,
      panCardNumber: member.panCardNumber,
      includeHealth: member.includeHealth,
      healthHistory: member.includeHealth ? member.healthHistory : undefined,
    }));

    try {
      let result;
      if (isEdit) {
        result = await dispatch(
          updateFamilyMember({ clientId: idToUse, membersArray: membersPayload })
        );
        if (updateFamilyMember.fulfilled.match(result)) {
          const updatedMembers = result.payload.familyMembers.map((m) => ({
            _id: m._id,
            title: m.title || "",
            name: m.name || "",
            relation: m.relation || "",
            dobActual: m.dobActual || "",
            dobRecord: m.dobRecord || "",
            marriageDate: m.marriageDate || "",
            occupation: m.occupation || "",
            occupationType: m.occupationType || "",
            designation: m.designation || "",
            annualIncome: m.annualIncome || "",
            contact: m.contact || "",
            adharNumber: m.adharNumber || "",
            panCardNumber: m.panCardNumber || "",
            includeHealth: m.includeHealth || false,
            healthHistory: {
              submissionDate: m.healthHistory?.submissionDate || "",
              diseaseName: m.healthHistory?.diseaseName || "",
              since: m.healthHistory?.since || "",
              height: m.healthHistory?.height || "",
              weight: m.healthHistory?.weight || "",
              remark: m.healthHistory?.remark || "",
            },
          }));
          setFamilyMembers(updatedMembers);
          toast.success("Family Members Updated Successfully ✅");
        } else {
          toast.error(result.payload || "Failed to update family members!");
        }
      } else {
        result = await dispatch(
          addFamilyMember({ clientId: idToUse, membersArray: membersPayload })
        );
        if (addFamilyMember.fulfilled.match(result)) {
          const updatedMembers = result.payload.familyMembers.map((m) => ({
            _id: m._id,
            title: m.title || "",
            name: m.name || "",
            relation: m.relation || "",
            dobActual: m.dobActual || "",
            dobRecord: m.dobRecord || "",
            marriageDate: m.marriageDate || "",
            occupation: m.occupation || "",
            occupationType: m.occupationType || "",
            designation: m.designation || "",
            annualIncome: m.annualIncome || "",
            contact: m.contact || "",
            adharNumber: m.adharNumber || "",
            panCardNumber: m.panCardNumber || "",
            includeHealth: m.includeHealth || false,
            healthHistory: {
              submissionDate: m.healthHistory?.submissionDate || "",
              diseaseName: m.healthHistory?.diseaseName || "",
              since: m.healthHistory?.since || "",
              height: m.healthHistory?.height || "",
              weight: m.healthHistory?.weight || "",
              remark: m.healthHistory?.remark || "",
            },
          }));
          setFamilyMembers(updatedMembers);
          toast.success("Family Members Saved Successfully ✅");
          if (onClientCreated && result.payload.clientId) {
            onClientCreated(result.payload.clientId);
          }
          if (result?.payload?.success) {
            setFamilyDetail(null);
          }
        } else {
          toast.error(result.payload || "Failed to save family members!");
        }
      }
    } catch (error) {
      toast.error("An error occurred while saving family members!");
      console.error(error);
    }
  };

  // Find the "Self" member
  const selfMember = familyMembers.find((member) => member.relation === "Self");
  const otherMembers = familyMembers.filter((member) => member.relation !== "Self");
  const primaryTitle =
    primarySource?.salutation || primarySource?.title || selfMember?.title || "-";
  const primaryName =
    primarySource?.groupHeadName ||
    primarySource?.groupName ||
    primarySource?.name ||
    selfMember?.name ||
    "-";
  const primaryMobile =
    primarySource?.mobileNo || primarySource?.contactNo || selfMember?.contact || "-";
  const activeHealthMember =
    healthModal.memberIndex !== null ? familyMembers[healthModal.memberIndex] : null;
  const selfMemberIndex = selfMember ? familyMembers.indexOf(selfMember) : -1;

  return (
    <Form onSubmit={handleSubmit} className="compact-family-form">
      <style>
        {`
          .compact-family-form .row {
            --bs-gutter-x: 0.55rem;
            --bs-gutter-y: 0.25rem;
            margin-bottom: 0.35rem !important;
          }
          .compact-family-form .form-group {
            margin-bottom: 0.2rem;
          }
          .compact-family-form .form-label {
            margin-bottom: 0.18rem;
            font-size: 0.76rem;
            font-weight: 500;
            line-height: 1.1;
          }
          .compact-family-form .form-control,
          .compact-family-form .form-select {
            min-height: 30px;
            padding: 0.18rem 0.45rem;
            font-size: 0.79rem;
          }
          .compact-family-form .btn {
            font-size: 0.78rem;
            padding: 0.28rem 0.6rem;
          }
          .compact-family-form .self-card {
            position: relative;
            padding: 0.45rem !important;
            margin-bottom: 0.35rem !important;
            padding-top: 1.15rem !important;
          }
          .compact-family-form .self-badge {
            position: absolute;
            top: 0.25rem;
            left: 0.5rem;
            font-size: 0.72rem;
            font-weight: 600;
            color: #0d6efd;
            background: #e9f2ff;
            border: 1px solid #b6d4fe;
            border-radius: 10px;
            padding: 0.05rem 0.45rem;
            line-height: 1.2;
          }
        `}
      </style>

    
      {/* Self Member Section */}
      {selfMember && (
        <div className="border rounded p-3 mb-3 bg-light self-card">
          <span className="self-badge">Primary Client (Self)</span>
          <Row className="mb-1">
            <Col md={2}>
              <Form.Group controlId={`title-self`}>
                <Form.Label>Mr/Mrs</Form.Label>
                <Form.Control
                  readOnly
                  value={primaryTitle}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId={`name-self`}>
                <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  readOnly
                  value={primaryName}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId={`relation-self`}>
                <Form.Label>Relation</Form.Label>
                <Form.Control readOnly value="Self" />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId={`mobile-self`}>
                <Form.Label>Mobile No</Form.Label>
                <Form.Control
                  readOnly
                  value={primaryMobile}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-1">
            <Col md={2}>
              <Form.Group controlId={`dobActual-self`}>
                <Form.Label>DOB (Actual) <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  ref={selfDobRef}
                  type="date"
                  name="dobActual"
                  value={selfMember.dobActual ? selfMember.dobActual.split("T")[0] : ""}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId={`dobRecord-self`}>
                <Form.Label>DOB (Record)</Form.Label>
                <Form.Control
                  type="date"
                  name="dobRecord"
                  value={selfMember.dobRecord ? selfMember.dobRecord.split("T")[0] : ""}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId={`marriageDate-self`}>
                <Form.Label>Marriage Date</Form.Label>
                <Form.Control
                  type="date"
                  name="marriageDate"
                  value={selfMember.marriageDate ? selfMember.marriageDate.split("T")[0] : ""}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId={`occupation-self`}>
                <Form.Label>Occupation</Form.Label>
                <Form.Control
                  name="occupation"
                  value={selfMember.occupation || familyDetail?.leadOccupation}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId={`occupationType-self`}>
                <Form.Label>Type of Occupation</Form.Label>
                <Form.Control
                  name="occupationType"
                  value={selfMember.occupationType || ""}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId={`designation-self`}>
                <Form.Label>Designation</Form.Label>
                <Form.Control
                  name="designation"
                  value={selfMember.designation || ""}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-1">
            <Col md={3}>
              <Form.Group controlId={`contact-self`}>
                <Form.Label>Contact</Form.Label>
                <Form.Control
                  readOnly
                  value={primaryMobile}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId={`adhar-self`}>
                <Form.Label>Aadhaar No</Form.Label>
                <Form.Control
                  name="adharNumber"
                  value={selfMember.adharNumber || ""}
                  maxLength={12}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                  isInvalid={Boolean(selfMember.adharNumber) && !/^\d{12}$/.test(selfMember.adharNumber)}
                />
                <Form.Control.Feedback type="invalid">
                  Aadhaar must be 12 digits.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId={`pan-self`}>
                <Form.Label>PAN No</Form.Label>
                <Form.Control
                  name="panCardNumber"
                  value={selfMember.panCardNumber || ""}
                  maxLength={10}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                  isInvalid={Boolean(selfMember.panCardNumber) && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(selfMember.panCardNumber)}
                />
                <Form.Control.Feedback type="invalid">
                  PAN format should be like ABCDE1234F.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group controlId={`includeHealth-self`}>
                <Form.Label className="d-block">Health History</Form.Label>
                <div className="border rounded px-2 py-2 bg-white d-flex flex-wrap align-items-center gap-2">
                  <Form.Check
                    type="checkbox"
                    label="Include"
                    name="includeHealth"
                    className="mb-0"
                    checked={selfMember.includeHealth}
                    onChange={(e) => handleHealthToggle(selfMemberIndex, e.target.checked)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant={selfMember.includeHealth ? "outline-primary" : "outline-secondary"}
                    disabled={!selfMember.includeHealth}
                    onClick={() => openHealthModal(selfMemberIndex)}
                  >
                    Open Details
                  </Button>
                  {selfMember.includeHealth && (
                    <small className="text-muted">
                      {selfMember.healthHistory?.submissionDate &&
                      selfMember.healthHistory?.diseaseName
                        ? "Details added"
                        : "Please complete details"}
                    </small>
                  )}
                </div>
              </Form.Group>
            </Col>
          </Row>
        </div>
      )}

      {/* Other Family Members Section */}
      {otherMembers.map((member, index) => (
        <div key={member._id || index} className="border rounded p-3 mb-3">
          <h5>Family Member {index + 1}</h5>
          <Row className="mb-2">
            <Col md={2}>
              <Form.Group controlId={`title-${member._id || index}`}>
                <Form.Label>Mr/Mrs</Form.Label>
                <Form.Select
                  name="title"
                  value={member.title}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(member))}
                >
                  <option value="">Select</option>
                  <option>Mr.</option>
                  <option>Mrs.</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId={`name-${member._id || index}`}>
                <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  name="name"
                  value={member.name}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(member))}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId={`relation-${member._id || index}`}>
                <Form.Label>Relation <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="relation"
                  value={member.relation}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(member))}
                  required
                >
                  <option value="">Select Relation</option>
                  <option>Wife</option>
                  <option>Husband</option>
                  <option>Son</option>
                  <option>Daughter</option>
                  <option>Mother</option>
                  <option>Father</option>
                  <option>Brother</option>
                  <option>Sister</option>
                  <option>Brother-in-law</option>
                  <option>Sister-in-law</option>
                  <option>Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId={`mobile-${member._id || index}`}>
                <Form.Label>Mobile No</Form.Label>
                <Form.Control
                  name="contact"
                  value={member.contact}
                  maxLength={10}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(member))}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col md={2}>
              <Form.Group controlId={`dobActual-${member._id || index}`}>
                <Form.Label>DOB (Actual) <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date"
                  name="dobActual"
                  value={member.dobActual ? member.dobActual.split("T")[0] : ""}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(member))}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId={`dobRecord-${member._id || index}`}>
                <Form.Label>DOB (Record)</Form.Label>
                <Form.Control
                  type="date"
                  name="dobRecord"
                  value={member.dobRecord ? member.dobRecord.split("T")[0] : ""}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(member))}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId={`marriageDate-${member._id || index}`}>
                <Form.Label>Marriage Date</Form.Label>
                <Form.Control
                  type="date"
                  name="marriageDate"
                  value={member.marriageDate ? member.marriageDate.split("T")[0] : ""}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(member))}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId={`occupation-${member._id || index}`}>
                <Form.Label>Occupation</Form.Label>
                <Form.Control
                  name="occupation"
                  value={member.occupation}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(member))}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId={`occupationType-${member._id || index}`}>
                <Form.Label>Type of Occupation</Form.Label>
                <Form.Control
                  name="occupationType"
                  value={member.occupationType || ""}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(member))}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col md={3}>
              <Form.Group controlId={`contact-${member._id || index}`}>
                <Form.Label>Contact</Form.Label>
                <Form.Control
                  name="contact"
                  value={member.contact}
                  maxLength={10}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(member))}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId={`adhar-${member._id || index}`}>
                <Form.Label>Aadhaar No</Form.Label>
                <Form.Control
                  name="adharNumber"
                  value={member.adharNumber || ""}
                  maxLength={12}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(member))}
                  isInvalid={Boolean(member.adharNumber) && !/^\d{12}$/.test(member.adharNumber)}
                />
                <Form.Control.Feedback type="invalid">
                  Aadhaar must be 12 digits.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId={`pan-${member._id || index}`}>
                <Form.Label>PAN No</Form.Label>
                <Form.Control
                  name="panCardNumber"
                  value={member.panCardNumber || ""}
                  maxLength={10}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(member))}
                  isInvalid={Boolean(member.panCardNumber) && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(member.panCardNumber)}
                />
                <Form.Control.Feedback type="invalid">
                  PAN format should be like ABCDE1234F.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group controlId={`includeHealth-${member._id || index}`}>
                <Form.Label className="d-block">Health History</Form.Label>
                <div className="border rounded px-2 py-2 bg-light d-flex flex-wrap align-items-center gap-2">
                  <Form.Check
                    type="checkbox"
                    label="Include"
                    name="includeHealth"
                    className="mb-0"
                    checked={member.includeHealth}
                    onChange={(e) =>
                      handleHealthToggle(familyMembers.indexOf(member), e.target.checked)
                    }
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant={member.includeHealth ? "outline-primary" : "outline-secondary"}
                    disabled={!member.includeHealth}
                    onClick={() => openHealthModal(familyMembers.indexOf(member))}
                  >
                    Open Details
                  </Button>
                  {member.includeHealth && (
                    <small className="text-muted">
                      {member.healthHistory?.submissionDate && member.healthHistory?.diseaseName
                        ? "Details added"
                        : "Please complete details"}
                    </small>
                  )}
                </div>
              </Form.Group>
            </Col>
          </Row>
          <Button
            variant="danger"
            className="mt-2"
            onClick={() => handleRemoveMember(familyMembers.indexOf(member))}
            title="Remove Member"
          >
            <FaTrash />
          </Button>
        </div>
      ))}
      <Button
        variant="success"
        onClick={handleAddMember}
        type="button"
        className="me-2 btn-sm"
        title="Add New Member"
      >
        <FaUserPlus className="me-1" />
        
      </Button>
      <Button
        type="submit"
        className="btn btn-primary btn-sm"
        title={isEdit && clientData?._id ? "Update Members" : "Save Members"}
      >
        <FaSave />
      </Button>

      <Modal show={healthModal.show} onHide={closeHealthModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Health History Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {activeHealthMember && (
            <Row className="g-2">
              <Col md={6}>
                <Form.Group controlId="healthHistory.submissionDate-modal">
                  <Form.Label>Submission Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="healthHistory.submissionDate"
                    value={activeHealthMember.healthHistory?.submissionDate || ""}
                    onChange={(e) => handleMemberChange(e, healthModal.memberIndex)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="healthHistory.diseaseName-modal">
                  <Form.Label>Disease Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    name="healthHistory.diseaseName"
                    value={activeHealthMember.healthHistory?.diseaseName || ""}
                    onChange={(e) => handleMemberChange(e, healthModal.memberIndex)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="healthHistory.since-modal">
                  <Form.Label>Since</Form.Label>
                  <Form.Control
                    type="date"
                    name="healthHistory.since"
                    value={activeHealthMember.healthHistory?.since || ""}
                    onChange={(e) => handleMemberChange(e, healthModal.memberIndex)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="healthHistory.height-modal">
                  <Form.Label>Height</Form.Label>
                  <Form.Control
                    name="healthHistory.height"
                    value={activeHealthMember.healthHistory?.height || ""}
                    onChange={(e) => handleMemberChange(e, healthModal.memberIndex)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="healthHistory.weight-modal">
                  <Form.Label>Weight</Form.Label>
                  <Form.Control
                    name="healthHistory.weight"
                    value={activeHealthMember.healthHistory?.weight || ""}
                    onChange={(e) => handleMemberChange(e, healthModal.memberIndex)}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group controlId="healthHistory.remark-modal">
                  <Form.Label>Remark</Form.Label>
                  <Form.Control
                    name="healthHistory.remark"
                    value={activeHealthMember.healthHistory?.remark || ""}
                    onChange={(e) => handleMemberChange(e, healthModal.memberIndex)}
                  />
                </Form.Group>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeHealthModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Form>
  );
};

export default FamilyMembersForm;