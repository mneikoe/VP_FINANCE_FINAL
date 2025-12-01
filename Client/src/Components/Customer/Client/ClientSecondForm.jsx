  import { useEffect, useState } from "react";
  import { Button } from "react-bootstrap";
  import { Col, Container, Form, Row } from "react-bootstrap";

  import FileUpload from "../../FileUpload";

  function ClientSecondForm({ isEdit, onDataChange, firstFormData }) {
    const [formData, setFormData] = useState({
      customerDoc: [
        {
          createdDate: "",
          memberName: "",
          policyName: "",
          documentNo: "",
          documentName: "",
          financialProducts: "",
          remark: "",
          upload: [],
        },
      ],
      proposedPlan: {
        date: "",
        memberName: "",
        financialProduct: "",
        company: "",
        planName: "",
        upload: [],
      },
      taskDetails: "",
    });

    // Get all family member names including the primary client
    const getAllMemberNames = () => {
      const members = [];

      // Add primary client if name exists
      if (firstFormData?.personalDetails?.name) {
        members.push({
          name: firstFormData.personalDetails.name,
          relation: "self",
        });
      }

      // Add family members
      if (firstFormData?.familyMembers) {
        firstFormData.familyMembers.forEach((member) => {
          if (member.name) {
            members.push({
              name: member.name,
              relation: member.relation,
            });
          }
        });
      }

      return members;
    };

    const handleUpload = (sectionName, urls) => {
      if (!urls || urls.length === 0) return;

      const updatedFormData = {
        ...formData,
        [sectionName]: {
          ...formData[sectionName],
          upload: Array.isArray(urls) ? urls : [urls],
        },
      };

      setFormData(updatedFormData);
      onDataChange(updatedFormData);
    };

    const handleCustomerDocUpload = (urls, index) => {
      const updatedDocs = [...formData.customerDoc];
      updatedDocs[index] = {
        ...updatedDocs[index],
        upload: Array.isArray(urls) ? urls : [urls],
      };

      const updatedFormData = { ...formData, customerDoc: updatedDocs };
      setFormData(updatedFormData);
      onDataChange(updatedFormData);
    };

    const handleProposedPlanUpload = (urls) => handleUpload("proposedPlan", urls);



    useEffect(() => {
      if (!firstFormData?.financialInfo?.insuranceInvestment) return;

      const insuranceList = firstFormData.financialInfo.insuranceInvestment || [];

      const docs = insuranceList.map((_, i) => {
        return (
          formData.customerDoc[i] || {
            createdDate: "",
            memberName: "",
            documentNo: "",
            planName:"",
            sa:"",
            mode:"",
            insuCo:"",
            premium:"",
            doe:"",
            dom:"",
            documentName: "",
            financialProducts: "",
            // remark: "",
            upload: [],
          }
        );
      });

      const updatedFormData = {
        ...formData,
        financialInfo: {
          ...formData.financialInfo,
          ...firstFormData.financialInfo,
        },
        customerDoc: docs,
      };

      setFormData(updatedFormData);
      onDataChange(updatedFormData);
    }, [firstFormData?.financialInfo?.insuranceInvestment]);

    const handleCustomerDocChange = (e, index) => {
      const { name, value, files } = e.target;
      const updatedDocs = [...formData.customerDoc];
      updatedDocs[index] = {
        ...updatedDocs[index],
        [name]: files ? files[0] : value,
      };
      const updatedFormData = { ...formData, customerDoc: updatedDocs };
      setFormData(updatedFormData);
      onDataChange(updatedFormData);
    };

    useEffect(() => {
      if (isEdit) {
        const merged = {
          ...formData,
          ...isEdit,  
          proposedPlan: isEdit.proposedPlan || formData.proposedPlan,
        };
        setFormData(merged);
        onDataChange(merged);
      }
    }, [isEdit]);

    const handleChange = (e) => {
      const { name, value, type, checked, files } = e.target;
      const keys = name.split(".");
      const updatedData = { ...formData };
      let current = updatedData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      const lastKey = keys[keys.length - 1];
      current[lastKey] =
        type === "checkbox" ? checked : type === "file" ? files[0] : value;
      setFormData(updatedData);
      onDataChange(updatedData);
    };

    return (
      <Container>
        <Form>

          {firstFormData?.financialInfo?.insuranceInvestment?.map(
            (insurance, index) => (
              <Row className="g-3 mb-3" key={index}>
                <h5 className="mt-4">KYC Document for: {insurance}</h5>

                <Col xs={12} md={6} lg={2}>
                  <Form.Group controlId={`createdDate-${index}`}>
                    <Form.Label>Submission Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="createdDate"
                      value={formData.customerDoc[index]?.createdDate || ""}
                      onChange={(e) => handleCustomerDocChange(e, index)}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6} lg={2}>
                  <Form.Group controlId={`memberName-${index}`}>
                    <Form.Label>Member Name</Form.Label>
                    <Form.Select
                      name="memberName"
                      value={formData.customerDoc[index]?.memberName || ""}
                      onChange={(e) => handleCustomerDocChange(e, index)}
                    >
                      <option value="">Select Member</option>
                      {getAllMemberNames().map((member, i) => (
                        <option key={i} value={member.name}>
                          {member.name} ({member.relation})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                  <Col xs={12} md={6} lg={2}>
                  <Form.Group controlId={`insuCo-${index}`}>
                    <Form.Label>Insu Co</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="InsunCo"
                      name="insu Co"
                      value={formData.customerDoc[index]?.insuCo || ""}
                      onChange={(e) => handleCustomerDocChange(e, index)}
                    />
                  </Form.Group>
                </Col>


              <Col xs={12} md={6} lg={2}>
                  <Form.Group controlId={`policyName-${index}`}>
                    <Form.Label>Policy No</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Policy Name"
                      name="Policy Name"
                      value={formData.customerDoc[index]?.policyName || ""}
                      onChange={(e) => handleCustomerDocChange(e, index)}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6} lg={2}>
                  <Form.Group controlId={`planName-${index}`}>
                    <Form.Label>Plan Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Plan Name"
                      name="Plan Name"
                      value={formData.customerDoc[index]?.planName || ""}
                      onChange={(e) => handleCustomerDocChange(e, index)}
                    />
                  </Form.Group>
                </Col>
                  <Col xs={12} md={6} lg={2}>
                  <Form.Group controlId={`sa-${index}`}>
                    <Form.Label>SA</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Sa"
                      name="Sa"
                      value={formData.customerDoc[index]?.sa || ""}
                      onChange={(e) => handleCustomerDocChange(e, index)}
                    />
                  </Form.Group>
                </Col>
                  <Col xs={12} md={6} lg={2}>
                  <Form.Group controlId={`mode-${index}`}>
                    <Form.Label>Mode</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="mode"
                      name="mode"
                      value={formData.customerDoc[index]?.mode || ""}
                      onChange={(e) => handleCustomerDocChange(e, index)}
                    />
                  </Form.Group>
                </Col>


                  <Col xs={12} md={6} lg={2}>
                  <Form.Group controlId={`premium-${index}`}>
                    <Form.Label>Premium</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="premium"
                      name="premium"
                      value={formData.customerDoc[index]?.premium || ""}
                      onChange={(e) => handleCustomerDocChange(e, index)}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={6} lg={2}>
                  <Form.Group controlId={`doe-${index}`}>
                    <Form.Label>Doe</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Doe"
                      name="Doe"
                      value={formData.customerDoc[index]?.doe || ""}
                      onChange={(e) => handleCustomerDocChange(e, index)}
                    />
                  </Form.Group>
                </Col>


                <Col xs={12} md={6} lg={2}>
                  <Form.Group controlId={`dom-${index}`}>
                    <Form.Label>Dom</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Dom"
                      name="Dom"
                      value={formData.customerDoc[index]?.dom || ""}
                      onChange={(e) => handleCustomerDocChange(e, index)}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6} lg={2}>
                  <Form.Group>
                    <Form.Label>Upload</Form.Label>
                    <FileUpload
                      name="customerDoc"
                      onUpload={(urls) => handleCustomerDocUpload(urls, index)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )
          )}


          
        </Form>
      </Container>
    );
  }

  export default ClientSecondForm;


