

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Form, Row, Col, Button } from "react-bootstrap";
import { addFamilyMember} from "../../../redux/feature/SuspectRedux/SuspectThunx";
import { toast } from "react-toastify";

const FamilyMembersFormForSuspect = ({ suspectId, suspectData, onSuspectCreated }) => {
  const dispatch = useDispatch();
  const [familyMembers, setFamilyMembers] = useState([]);

  useEffect(() => {
    // If editing, load existing members from suspectData
    if (suspectData && suspectData.familyMembers) {
      setFamilyMembers(suspectData.familyMembers);
    }
    // Optionally: if suspectId exists but no suspectData, fetch members from API
    else if (suspectId) {
      // dispatch(fetchFamilyMembers(clientId));
    }
  }, [suspectData, suspectId]);

  const handleAddMember = () => {
    setFamilyMembers((prev) => [
      ...prev,
      {
        title: "",
        name: "",
        relation: "",
        dobActual: "",
        dobRecord: "",
        marriageDate: "",
        occupation: "",
        annualIncome: "",
        includeHealth: false,
        healthHistory: {
          submissionDate: "",
          diseaseName: "",
          since: "",
          height: "",
          weight: "",
          remark: "",
        },
      },
    ]);
  };

  const handleRemoveMember = (index) => {
    setFamilyMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMemberChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    const keys = name.split(".");

    setFamilyMembers((prev) => {
      const members = [...prev];
      if (keys.length === 1) {
        members[index][keys[0]] = type === "checkbox" ? checked : value;
      } else if (keys.length === 2) {
        members[index][keys[0]][keys[1]] = value;
      }
      return members;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Choose ID: either from supectData (edit) or suspectId (new)
    const idToUse = suspectData?._id || suspectId;
    if (!idToUse) {
      toast.error("No Suspect ID found!");
      return;
    }

    const result = await dispatch(addFamilyMember({ suspectId: idToUse, membersArray: familyMembers }));
    if (result) {
      setFamilyMembers([]);
      toast.info("Family Members Added Successfully...");
      const returnedId = result?.payload;
      console.log("Suspect ID in family details:", returnedId);
      if (onSuspectCreated && returnedId) onSuspectCreated(returnedId);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {familyMembers.map((member, index) => (
        <div key={index} className="border rounded p-3 mb-3">
          <Row className="mb-2">
            <Col md={2}>
              <Form.Group controlId={`title-${index}`}>
                <Form.Label>Mr/Mrs</Form.Label>
                <Form.Select
                  name="title"
                  value={member.title}
                  onChange={(e) => handleMemberChange(e, index)}
                >
                  <option value="">Select</option>
                  <option>Mr.</option>
                  <option>Mrs.</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId={`name-${index}`}>
                <Form.Label>Name</Form.Label>
                <Form.Control
                  name="name"
                  value={member.name}
                  onChange={(e) => handleMemberChange(e, index)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId={`relation-${index}`}>
                <Form.Label>Relation</Form.Label>
                <Form.Select
                  name="relation"
                  value={member.relation}
                  onChange={(e) => handleMemberChange(e, index)}
                >
                  <option value="">Select Relation</option>
                  <option>self</option>
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
              <Form.Group controlId={`annualIncome-${index}`}>
                <Form.Label>Annual Income</Form.Label>
                <Form.Control
                  name="annualIncome"
                  value={member.annualIncome}
                  onChange={(e) => handleMemberChange(e, index)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-2">
            <Col md={3}>
              <Form.Group controlId={`dobActual-${index}`}>
                <Form.Label>DOB (Actual)</Form.Label>
                <Form.Control
                  type="date"
                  name="dobActual"
                  value={member.dobActual}
                  onChange={(e) => handleMemberChange(e, index)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId={`dobRecord-${index}`}>
                <Form.Label>DOB (Record)</Form.Label>
                <Form.Control
                  type="date"
                  name="dobRecord"
                  value={member.dobRecord}
                  onChange={(e) => handleMemberChange(e, index)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId={`marriageDate-${index}`}>
                <Form.Label>Marriage Date</Form.Label>
                <Form.Control
                  type="date"
                  name="marriageDate"
                  value={member.marriageDate}
                  onChange={(e) => handleMemberChange(e, index)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId={`occupation-${index}`}>
                <Form.Label>Occupation</Form.Label>
                <Form.Control
                  name="occupation"
                  value={member.occupation}
                  onChange={(e) => handleMemberChange(e, index)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-2">
            <Col md={2}>
              <Form.Group controlId={`includeHealth-${index}`}>
                <Form.Check
                  type="checkbox"
                  label="Include Health History"
                  name="includeHealth"
                  checked={member.includeHealth}
                  onChange={(e) => handleMemberChange(e, index)}
                />
              </Form.Group>
            </Col>
            {member.includeHealth && (
              <Col md={10}>
                <Row>
                  <Col md={2}>
                    <Form.Group controlId={`healthHistory.submissionDate-${index}`}>
                      <Form.Label>Submission Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="healthHistory.submissionDate"
                        value={member.healthHistory.submissionDate}
                        onChange={(e) => handleMemberChange(e, index)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group controlId={`healthHistory.diseaseName-${index}`}>
                      <Form.Label>Disease Name</Form.Label>
                      <Form.Control
                        name="healthHistory.diseaseName"
                        value={member.healthHistory.diseaseName}
                        onChange={(e) => handleMemberChange(e, index)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group controlId={`healthHistory.since-${index}`}>
                      <Form.Label>Since</Form.Label>
                      <Form.Control
                        type="date"
                        name="healthHistory.since"
                        value={member.healthHistory.since ?? ''}
                        onChange={(e) => handleMemberChange(e, index)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group controlId={`healthHistory.height-${index}`}>
                      <Form.Label>Height</Form.Label>
                      <Form.Control
                        name="healthHistory.height"
                        value={member.healthHistory.height}
                        onChange={(e) => handleMemberChange(e, index)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group controlId={`healthHistory.weight-${index}`}>
                      <Form.Label>Weight</Form.Label>
                      <Form.Control
                        name="healthHistory.weight"
                        value={member.healthHistory.weight}
                        onChange={(e) => handleMemberChange(e, index)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group controlId={`healthHistory.remark-${index}`}>
                      <Form.Label>Remark</Form.Label>
                      <Form.Control
                        name="healthHistory.remark"
                        value={member.healthHistory.remark}
                        onChange={(e) => handleMemberChange(e, index)}
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
            onClick={() => handleRemoveMember(index)}
          >
            Remove Member
          </Button>
        </div>
      ))}
      <Button variant="success" onClick={handleAddMember} type="button" className="me-2">
        Add Member
      </Button>
      <Button type="submit" className="btn btn-primary">
        Submit
      </Button>
    </Form>
  );
};

export default FamilyMembersFormForSuspect;
