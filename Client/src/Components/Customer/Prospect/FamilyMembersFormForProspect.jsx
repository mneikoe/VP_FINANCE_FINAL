        


import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Form, Row, Col, Button } from "react-bootstrap";
import { addFamilyMember, updateFamilyMember } from "../../../redux/feature/ClientRedux/ClientThunx";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

const  FamilyMembersFormForProspect          
 = ({ clientId, clientData, onClientCreated, familyDetail, setFamilyDetail }) => {
  const dispatch = useDispatch();
  const [familyMembers, setFamilyMembers] = useState([]);
  const { id } = useParams();
  const isEdit = !!id || !!clientData?._id;

  // Default member template
  const defaultMember = (isSelf = false, data = {}) => ({
    _id: data._id || undefined,
    title: isSelf ? (familyDetail?.salutation || data.title || "") : (data.title || ""),
    name: isSelf ? (familyDetail?.groupName || data.name || "") : (data.name || ""),
    relation: isSelf ? "Self" : (data.relation || ""),
    dobActual: data.dobActual || "",
    dobRecord: data.dobRecord || "",
    marriageDate: data.marriageDate || "",
    occupation: data.occupation || "",
    annualIncome: data.annualIncome || "",
    contact: isSelf ? (familyDetail?.mobileNo || data.contact || "") : (data.contact || ""),
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

    setFamilyMembers((prev) =>
      prev.map((member, i) => {
        if (i !== index) return member;

        if (keys.length === 1) {
          return {
            ...member,
            [keys[0]]: type === "checkbox" ? checked : value,
          };
        } else if (keys.length === 2) {
          return {
            ...member,
            [keys[0]]: {
              ...member[keys[0]],
              [keys[1]]: value,
            },
          };
        }
        return member;
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const isValid = familyMembers.every((member) => {
      if (member.relation === "Self") {
        return (
          (member.name || familyDetail?.groupName || clientData?.name) &&
          member.dobActual &&
          (!member.includeHealth ||
            (member.healthHistory?.diseaseName && member.healthHistory?.submissionDate))
        );
      }
      return (
        member.name &&
        member.relation &&
        member.dobActual &&
        (!member.includeHealth ||
          (member.healthHistory?.diseaseName && member.healthHistory?.submissionDate))
      );
    });

    if (!isValid) {
      toast.error("Please fill all required fields for each member!");
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
      title: member.relation === "Self" ? (familyDetail?.salutation || clientData?.title || member.title) : member.title,
      name: member.relation === "Self" ? (familyDetail?.groupName || clientData?.name || member.name) : member.name,
      relation: member.relation || "Self",
      dobActual: member.dobActual,
      dobRecord: member.dobRecord,
      marriageDate: member.marriageDate,
      occupation: member.occupation,
      annualIncome: member.annualIncome,
      contact: member.relation === "Self" ? (familyDetail?.mobileNo || clientData?.contact || member.contact) : member.contact,
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
            annualIncome: m.annualIncome || "",
            contact: m.contact || "",
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
            annualIncome: m.annualIncome || "",
            contact: m.contact || "",
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

  return (
    <Form onSubmit={handleSubmit}>
      {/* Self Member Section */}
      {selfMember && (
        <div className="border rounded p-3 mb-3 bg-light">
          <h5>Primary Client (Self)</h5>
          <Row className="mb-2">
            <Col md={2}>
              <Form.Group controlId={`title-self`}>
                <Form.Label>Mr/Mrs</Form.Label>
                <Form.Control
                  plaintext
                  readOnly
                  value={familyDetail?.salutation || clientData?.title || selfMember.title || "N/A"}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId={`name-self`}>
                <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  plaintext
                  readOnly
                  value={familyDetail?.groupName || clientData?.name || selfMember.name || "N/A"}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId={`relation-self`}>
                <Form.Label>Relation</Form.Label>
                <Form.Control plaintext readOnly value="Self" />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId={`annualIncome-self`}>
                <Form.Label>Annual Income</Form.Label>
                <Form.Control
                  name="annualIncome"
                  value={selfMember.annualIncome}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col md={3}>
              <Form.Group controlId={`dobActual-self`}>
                <Form.Label>DOB (Actual) <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date"
                  name="dobActual"
                  value={selfMember.dobActual ? selfMember.dobActual.split("T")[0] : ""}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
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
            <Col md={3}>
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
            <Col md={3}>
              <Form.Group controlId={`occupation-self`}>
                <Form.Label>Occupation</Form.Label>
                <Form.Control
                  name="occupation"
                  value={selfMember.occupation}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col md={3}>
              <Form.Group controlId={`contact-self`}>
                <Form.Label>Contact</Form.Label>
                <Form.Control
                  plaintext
                  readOnly
                  value={familyDetail?.mobileNo || clientData?.contact || selfMember.contact || "N/A"}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId={`includeHealth-self`}>
                <Form.Check
                  type="checkbox"
                  label="Include Health History"
                  name="includeHealth"
                  checked={selfMember.includeHealth}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                />
              </Form.Group>
            </Col>
            {selfMember.includeHealth && (
              <Col md={7}>
                <Row>
                  <Col md={4}>
                    <Form.Group controlId={`healthHistory.submissionDate-self`}>
                      <Form.Label>Submission Date <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="date"
                        name="healthHistory.submissionDate"
                        value={selfMember.healthHistory.submissionDate || ""}
                        onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId={`healthHistory.diseaseName-self`}>
                      <Form.Label>Disease Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        name="healthHistory.diseaseName"
                        value={selfMember.healthHistory.diseaseName || ""}
                        onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId={`healthHistory.since-self`}>
                      <Form.Label>Since</Form.Label>
                      <Form.Control
                        type="date"
                        name="healthHistory.since"
                        value={selfMember.healthHistory.since || ""}
                        onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId={`healthHistory.height-self`}>
                      <Form.Label>Height</Form.Label>
                      <Form.Control
                        name="healthHistory.height"
                        value={selfMember.healthHistory.height || ""}
                        onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId={`healthHistory.weight-self`}>
                      <Form.Label>Weight</Form.Label>
                      <Form.Control
                        name="healthHistory.weight"
                        value={selfMember.healthHistory.weight || ""}
                        onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId={`healthHistory.remark-self`}>
                      <Form.Label>Remark</Form.Label>
                      <Form.Control
                        name="healthHistory.remark"
                        value={selfMember.healthHistory.remark || ""}
                        onChange={(e) => handleMemberChange(e, familyMembers.indexOf(selfMember))}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
            )}
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
              <Form.Group controlId={`annualIncome-${member._id || index}`}>
                <Form.Label>Annual Income</Form.Label>
                <Form.Control
                  name="annualIncome"
                  value={member.annualIncome}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(member))}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col md={3}>
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
            <Col md={3}>
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
            <Col md={3}>
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
          </Row>
          <Row className="mb-2">
            <Col md={3}>
              <Form.Group controlId={`contact-${member._id || index}`}>
                <Form.Label>Contact</Form.Label>
                <Form.Control
                  name="contact"
                  value={member.contact}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(member))}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId={`includeHealth-${member._id || index}`}>
                <Form.Check
                  type="checkbox"
                  label="Include Health History"
                  name="includeHealth"
                  checked={member.includeHealth}
                  onChange={(e) => handleMemberChange(e, familyMembers.indexOf(member))}
                />
              </Form.Group>
            </Col>
            {member.includeHealth && (
              <Col md={7}>
                <Row>
                  <Col md={4}>
                    <Form.Group controlId={`healthHistory.submissionDate-${member._id || index}`}>
                      <Form.Label>Submission Date <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="date"
                        name="healthHistory.submissionDate"
                        value={member.healthHistory.submissionDate || ""}
                        onChange={(e) => handleMemberChange(e, familyMembers.indexOf(member))}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId={`healthHistory.diseaseName-${member._id || index}`}>
                      <Form.Label>Disease Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        name="healthHistory.diseaseName"
                        value={member.healthHistory.diseaseName || ""}
                        onChange={(e) => handleMemberChange(e, familyMembers.indexOf(member))}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId={`healthHistory.since-${member._id || index}`}>
                      <Form.Label>Since</Form.Label>
                      <Form.Control
                        type="date"
                        name="healthHistory.since"
                        value={member.healthHistory.since || ""}
                        onChange={(e) => handleMemberChange(e, familyMembers.indexOf(member))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId={`healthHistory.height-${member._id || index}`}>
                      <Form.Label>Height</Form.Label>
                      <Form.Control
                        name="healthHistory.height"
                        value={member.healthHistory.height || ""}
                        onChange={(e) => handleMemberChange(e, familyMembers.indexOf(member))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId={`healthHistory.weight-${member._id || index}`}>
                      <Form.Label>Weight</Form.Label>
                      <Form.Control
                        name="healthHistory.weight"
                        value={member.healthHistory.weight || ""}
                        onChange={(e) => handleMemberChange(e, familyMembers.indexOf(member))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId={`healthHistory.remark-${member._id || index}`}>
                      <Form.Label>Remark</Form.Label>
                      <Form.Control
                        name="healthHistory.remark"
                        value={member.healthHistory.remark || ""}
                        onChange={(e) => handleMemberChange(e, familyMembers.indexOf(member))}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
            )}
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
      <Button
        variant="success"
        onClick={handleAddMember}
        type="button"
        className="me-2"
      >
        Add New Member
      </Button>
      <Button type="submit" className="btn btn-primary">
        {isEdit && clientData?._id ? "Update Members" : "Save Members"}
      </Button>
    </Form>
  );
};

export default  FamilyMembersFormForProspect          
