import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Form, Row, Col, Button, Modal } from "react-bootstrap";
import {
  addFamilyMember,
  updateFamilyMembers,
} from "../../../redux/feature/SuspectRedux/SuspectThunx";
import { toast } from "react-toastify";

const FamilyMembersFormForSuspect = ({ suspectId, suspectData, onDataUpdate }) => {
  const dispatch = useDispatch();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [healthModal, setHealthModal] = useState({
    show: false,
    memberIndex: null,
  });
  const selfDobRef = useRef(null);

  const personalDetails = suspectData?.personalDetails || {};

  const defaultMember = (isSelf = false, data = {}) => ({
    _id: data._id || undefined,
    title: data.title || "",
    name: isSelf
      ? personalDetails.groupName || personalDetails.name || data.name || ""
      : data.name || "",
    relation: isSelf ? "Self" : data.relation || "",
    dobActual: data.dobActual || "",
    dobRecord: data.dobRecord || "",
    marriageDate: data.marriageDate || "",
    occupation: data.occupation || "",
    occupationType: data.occupationType || "",
    annualIncome: data.annualIncome || "",
    contact: isSelf
      ? personalDetails.mobileNo || data.contact || ""
      : data.contact || "",
    adharNumber: data.adharNumber || "",
    panCardNumber: data.panCardNumber || "",
    includeHealth: data.includeHealth || false,
    healthHistory: {
      submissionDate: data.healthHistory?.submissionDate || "",
      diseaseName: data.healthHistory?.diseaseName || "",
      since: data.healthHistory?.since || "",
      height: data.healthHistory?.height || "",
      weight: data.healthHistory?.weight || "",
      remark: data.healthHistory?.remark || "",
    },
  });

  useEffect(() => {
    if (suspectData?.familyMembers?.length > 0) {
      setFamilyMembers(
        suspectData.familyMembers.map((m) =>
          m.relation === "Self" ? defaultMember(true, m) : defaultMember(false, m)
        )
      );
    } else {
      setFamilyMembers([defaultMember(true)]);
    }
  }, [suspectData]);

  useEffect(() => {
    setFamilyMembers((prev) =>
      prev.map((member) =>
        member.relation === "Self"
          ? {
              ...member,
              title: personalDetails?.salutation || personalDetails?.title || member.title,
              name: personalDetails?.groupName || personalDetails?.name || member.name,
              occupation:
                personalDetails?.leadOccupation ||
                personalDetails?.occupation ||
                member.occupation,
              occupationType:
                personalDetails?.leadOccupationType ||
                personalDetails?.occupationType ||
                member.occupationType,
              annualIncome: personalDetails?.annualIncome || member.annualIncome,
              contact: personalDetails?.mobileNo || member.contact,
            }
          : member
      )
    );
  }, [personalDetails]);

  useEffect(() => {
    if (selfDobRef.current) {
      selfDobRef.current.focus();
    }
  }, [familyMembers.length]);

  useEffect(() => {
    if (onDataUpdate) {
      onDataUpdate(familyMembers);
    }
  }, [familyMembers, onDataUpdate]);

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
        }
        if (keys.length === 2) {
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

    const isValidPan = (pan = "") =>
      !pan || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
    const isValidAadhar = (aadhar = "") => !aadhar || /^\d{12}$/.test(aadhar);

    const isValid = familyMembers.every((member) => {
      if (member.relation === "Self") {
        return (
          (member.name || personalDetails.groupName || personalDetails.name) &&
          member.dobActual &&
          isValidAadhar(member.adharNumber) &&
          isValidPan(member.panCardNumber) &&
          (!member.includeHealth ||
            (member.healthHistory?.diseaseName &&
              member.healthHistory?.submissionDate))
        );
      }
      return (
        member.name &&
        member.relation &&
        member.dobActual &&
        isValidAadhar(member.adharNumber) &&
        isValidPan(member.panCardNumber) &&
        (!member.includeHealth ||
          (member.healthHistory?.diseaseName &&
            member.healthHistory?.submissionDate))
      );
    });

    if (!isValid) {
      toast.error("Please fill required fields and valid Aadhaar/PAN for each member.");
      return;
    }

    const idToUse = suspectData?._id || suspectId;
    if (!idToUse) {
      toast.error("No Suspect ID found!");
      return;
    }

    const membersPayload = familyMembers.map((member) => ({
      _id: member._id,
      title: member.title,
      name:
        member.relation === "Self"
          ? personalDetails.groupName || personalDetails.name || member.name
          : member.name,
      relation: member.relation || "Self",
      dobActual: member.dobActual,
      dobRecord: member.dobRecord,
      marriageDate: member.marriageDate,
      occupation: member.occupation,
      occupationType: member.occupationType,
      annualIncome: member.annualIncome,
      contact:
        member.relation === "Self"
          ? personalDetails.mobileNo || member.contact
          : member.contact,
      adharNumber: member.adharNumber,
      panCardNumber: member.panCardNumber,
      includeHealth: member.includeHealth,
      healthHistory: member.includeHealth ? member.healthHistory : undefined,
    }));

    const hasExistingMembers = Boolean(suspectData?.familyMembers?.length);
    const result = hasExistingMembers
      ? await dispatch(updateFamilyMembers({ id: idToUse, familyMembers: membersPayload }))
      : await dispatch(addFamilyMember({ suspectId: idToUse, membersArray: membersPayload }));

    if (result?.meta?.requestStatus === "fulfilled") {
      toast.success(
        hasExistingMembers
          ? "Family Members Updated Successfully"
          : "Family Members Saved Successfully"
      );
    } else {
      toast.error(result?.payload || "Failed to save family members");
    }
  };

  const selfMember = familyMembers.find((member) => member.relation === "Self");
  const otherMembers = familyMembers.filter((member) => member.relation !== "Self");
  const activeHealthMember =
    healthModal.memberIndex !== null ? familyMembers[healthModal.memberIndex] : null;

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
        `}
      </style>

      {selfMember && (
        <div className="border rounded p-3 mb-3 bg-light">
          <h5>Primary Client (Self)</h5>
          <Row className="mb-2">
            <Col md={2}>
              <Form.Group controlId="title-self">
                <Form.Label>Mr/Mrs</Form.Label>
                <Form.Control plaintext readOnly value={selfMember.title || "N/A"} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="name-self">
                <Form.Label>
                  Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  plaintext
                  readOnly
                  value={
                    personalDetails.groupName || personalDetails.name || selfMember.name || "N/A"
                  }
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="relation-self">
                <Form.Label>Relation</Form.Label>
                <Form.Control plaintext readOnly value="Self" />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="mobile-self">
                <Form.Label>Mobile No</Form.Label>
                <Form.Control
                  plaintext
                  readOnly
                  value={personalDetails.mobileNo || selfMember.contact || "N/A"}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col md={2}>
              <Form.Group controlId="dobActual-self">
                <Form.Label>
                  DOB (Actual) <span className="text-danger">*</span>
                </Form.Label>
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
              <Form.Group controlId="dobRecord-self">
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
              <Form.Group controlId="marriageDate-self">
                <Form.Label>Marriage Date</Form.Label>
                <Form.Control
                  type="date"
                  name="marriageDate"
                  value={selfMember.marriageDate ? selfMember.marriageDate.split("T")[0] : ""}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="occupation-self">
                <Form.Label>Occupation</Form.Label>
                <Form.Control
                  name="occupation"
                  value={selfMember.occupation}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="occupationType-self">
                <Form.Label>Type of Occupation</Form.Label>
                <Form.Control
                  name="occupationType"
                  value={selfMember.occupationType || ""}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col md={3}>
              <Form.Group controlId="contact-self">
                <Form.Label>Contact</Form.Label>
                <Form.Control
                  plaintext
                  readOnly
                  value={personalDetails.mobileNo || selfMember.contact || "N/A"}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId="adhar-self">
                <Form.Label>Aadhaar No</Form.Label>
                <Form.Control
                  name="adharNumber"
                  value={selfMember.adharNumber || ""}
                  maxLength={12}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                  isInvalid={
                    Boolean(selfMember.adharNumber) &&
                    !/^\d{12}$/.test(selfMember.adharNumber)
                  }
                />
                <Form.Control.Feedback type="invalid">
                  Aadhaar must be 12 digits.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId="pan-self">
                <Form.Label>PAN No</Form.Label>
                <Form.Control
                  name="panCardNumber"
                  value={selfMember.panCardNumber || ""}
                  maxLength={10}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                  isInvalid={
                    Boolean(selfMember.panCardNumber) &&
                    !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(selfMember.panCardNumber)
                  }
                />
                <Form.Control.Feedback type="invalid">
                  PAN format should be like ABCDE1234F.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId="includeHealth-self">
                <Form.Check
                  type="checkbox"
                  label="Include Health History"
                  name="includeHealth"
                  checked={selfMember.includeHealth}
                  onChange={(e) =>
                    handleHealthToggle(familyMembers.indexOf(selfMember), e.target.checked)
                  }
                />
              </Form.Group>
            </Col>
          </Row>
        </div>
      )}

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
                <Form.Label>
                  Name <span className="text-danger">*</span>
                </Form.Label>
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
                <Form.Label>
                  Relation <span className="text-danger">*</span>
                </Form.Label>
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
                <Form.Label>
                  DOB (Actual) <span className="text-danger">*</span>
                </Form.Label>
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
                  isInvalid={
                    Boolean(member.adharNumber) && !/^\d{12}$/.test(member.adharNumber)
                  }
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
                  isInvalid={
                    Boolean(member.panCardNumber) &&
                    !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(member.panCardNumber)
                  }
                />
                <Form.Control.Feedback type="invalid">
                  PAN format should be like ABCDE1234F.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId={`includeHealth-${member._id || index}`}>
                <Form.Check
                  type="checkbox"
                  label="Include Health History"
                  name="includeHealth"
                  checked={member.includeHealth}
                  onChange={(e) =>
                    handleHealthToggle(familyMembers.indexOf(member), e.target.checked)
                  }
                />
              </Form.Group>
            </Col>
          </Row>
          <Button
            variant="danger"
            className="mt-2"
            onClick={() => handleRemoveMember(familyMembers.indexOf(member))}
          >
            Remove Member
          </Button>
        </div>
      ))}

      <Button variant="success" onClick={handleAddMember} type="button" className="me-2 btn-sm">
        Add New Member
      </Button>
      <Button type="submit" className="btn btn-primary btn-sm">
        Save Members
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
                  <Form.Label>
                    Submission Date <span className="text-danger">*</span>
                  </Form.Label>
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
                  <Form.Label>
                    Disease Name <span className="text-danger">*</span>
                  </Form.Label>
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

export default FamilyMembersFormForSuspect;
