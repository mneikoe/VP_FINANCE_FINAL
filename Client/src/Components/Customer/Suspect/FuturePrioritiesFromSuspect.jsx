
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Form, Row, Col, Button } from "react-bootstrap";
import { addFuturePrioritiesAndNeeds } from "../../../redux/feature/SuspectRedux/SuspectThunx";
import { toast } from "react-toastify";

const futurePriorityOptions = [
  ["Life Insurance", "Health Insurance", "Retirement Fund", "Wealth Creation"],
  [
    "Child Higher Education",
    "Child Professional Education",
    "Child Marriage",
    "Property Investment",
  ],
  [
    "Purchase House",
    "Purchase Car",
    "Business Fund Creation",
    "Business Expansion",
  ],
];

const FuturePrioritiesFormForSuspect = ({ suspectId, suspectData, onSuspectCreated }) => {
  const dispatch = useDispatch();
  const [futurePriorities, setFuturePriorities] = useState([]);
  const [futurePriorityForms, setFuturePriorityForms] = useState({});
  const [savedFuturePriorityForms, setSavedFuturePriorityForms] = useState({});
  const [needs, setNeeds] = useState({
    createdDate: new Date(),
    memberName: "",
    financialProduct: "",
    financialCompany: "",
    planName: "",
    documents: [],
    financialCalculation: false,
    assesmentOfNeed: false,
    portfolioManagement: false,
    doorStepServices: false,
    purchaseNewProducts: false,
    anyCorrection: "",
    anyUpdation: "",
  });

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setNeeds((prev) => ({ ...prev, [name]: checked }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNeeds((prev) => ({ ...prev, [name]: value }));
  };

  const handleFuturePriorityChange = (e) => {
    const { value, checked } = e.target;
    setFuturePriorities((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const handleFormChange = (priority, field, value) => {
    setFuturePriorityForms((prev) => ({
      ...prev,
      [priority]: {
        ...prev[priority],
        [field]: field === "approxAmount" ? parseFloat(value) : value,
        members:
          field === "members"
            ? value.split(",").map((item) => item.trim())
            : prev[priority]?.members,
      },
    }));
  };

  const handleSaveForm = (priority) => {
    const formData = futurePriorityForms[priority];

    if (
      !formData?.priorityName ||
      !formData?.members ||
      !formData?.approxAmount ||
      !formData?.duration
    ) {
      toast.error("Please complete all required fields before saving.");
      return;
    }

    // Save to saved forms
    setSavedFuturePriorityForms((prev) => ({
      ...prev,
      [priority]: formData,
    }));

    // Clear current form
    setFuturePriorityForms((prev) => {
      const newForms = { ...prev };
      delete newForms[priority];
      return newForms;
    });

    // Close the form UI
    setFuturePriorities((prev) => prev.filter((p) => p !== priority));
    toast.success(`${priority} saved.`);
  };

  const handleCloseForm = (priority) => {
    setFuturePriorityForms((prev) => {
      const newForms = { ...prev };
      delete newForms[priority];
      return newForms;
    });
    setFuturePriorities((prev) => prev.filter((p) => p !== priority));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const aggregatedFuturePriorities = Object.entries(savedFuturePriorityForms).map(
      ([priority, data]) => ({
        priorityName: data?.priorityName || "",
        members: data?.members || [],
        approxAmount: data?.approxAmount || 0,
        duration: data?.duration || "",
        remark: data?.remark || "",
      })
    );

    const idToUse = suspectData && suspectData._id || suspectId;
    console.log("IdToUse", idToUse)

    const result = await dispatch(
      addFuturePrioritiesAndNeeds({
        suspectId : idToUse,
        futurePriorities: aggregatedFuturePriorities,
        needs,
      })
    );

    if(result){
        const suspectIdFromRedux = result?.payload;
    if (onSuspectCreated && suspectIdFromRedux) onSuspectCreated(suspectIdFromRedux);

    setFuturePriorities([]);
    setFuturePriorityForms({});
    setSavedFuturePriorityForms({});
    setNeeds({
      createdDate: new Date(),
      memberName: "",
      financialProduct: "",
      financialCompany: "",
      planName: "",
      documents: [],
      financialCalculation: false,
      assesmentOfNeed: false,
      portfolioManagement: false,
      doorStepServices: false,
      purchaseNewProducts: false,
      anyCorrection: "",
      anyUpdation: "",
    });

    toast.info("Future Priorities Added Successfully.");
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="mb-3">
        {futurePriorityOptions.map((column, colIdx) => (
          <Col md={4} key={colIdx}>
            {column.map((option) => (
              <Form.Check
                key={option}
                type="checkbox"
                label={option}
                value={option}
                checked={futurePriorities.includes(option)}
                onChange={handleFuturePriorityChange}
              />
            ))}
          </Col>
        ))}
      </Row>

      {futurePriorities.map((priority) => (
        <div key={priority} className="border p-3 mb-3">
          <h5 className="text-info">{priority} Form</h5>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Priority Name</Form.Label>
                <Form.Control
                  type="text"
                  value={futurePriorityForms[priority]?.priorityName || ""}
                  onChange={(e) =>
                    handleFormChange(priority, "priorityName", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Members</Form.Label>
                <Form.Control
                  type="text"
                  value={
                    futurePriorityForms[priority]?.members?.join(", ") || ""
                  }
                  onChange={(e) =>
                    handleFormChange(priority, "members", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Approx Amount</Form.Label>
                <Form.Control
                  type="number"
                  value={futurePriorityForms[priority]?.approxAmount || ""}
                  onChange={(e) =>
                    handleFormChange(priority, "approxAmount", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Duration</Form.Label>
                <Form.Control
                  type="text"
                  value={futurePriorityForms[priority]?.duration || ""}
                  onChange={(e) =>
                    handleFormChange(priority, "duration", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Remark</Form.Label>
                <Form.Control
                  type="text"
                  value={futurePriorityForms[priority]?.remark || ""}
                  onChange={(e) =>
                    handleFormChange(priority, "remark", e.target.value)
                  }
                />
              </Form.Group>
            </Col>
          </Row>
          <Button variant="primary" className="me-2" onClick={() => handleSaveForm(priority)}>
            Save
          </Button>
          <Button variant="secondary" onClick={() => handleCloseForm(priority)}>
            Close
          </Button>
        </div>
      ))}

      <Row className="mb-3">
        <Col md={12}>
          <Form.Check
            inline
            type="checkbox"
            label="Financial Calculation"
            name="financialCalculation"
            checked={needs.financialCalculation}
            onChange={handleCheckboxChange}
          />
          <Form.Check
            inline
            type="checkbox"
            label="Assessment of Need"
            name="assesmentOfNeed"
            checked={needs.assesmentOfNeed}
            onChange={handleCheckboxChange}
          />
          <Form.Check
            inline
            type="checkbox"
            label="Portfolio Management"
            name="portfolioManagement"
            checked={needs.portfolioManagement}
            onChange={handleCheckboxChange}
          />
          <Form.Check
            inline
            type="checkbox"
            label="Door Step Services"
            name="doorStepServices"
            checked={needs.doorStepServices}
            onChange={handleCheckboxChange}
          />
          <Form.Check
            inline
            type="checkbox"
            label="Purchase New Products"
            name="purchaseNewProducts"
            checked={needs.purchaseNewProducts}
            onChange={handleCheckboxChange}
          />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group controlId="financialProduct">
            <Form.Label>Financial Products</Form.Label>
            <Form.Control
              type="text"
              name="financialProduct"
              value={needs.financialProduct}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="anyCorrection">
            <Form.Label>Any Correction</Form.Label>
            <Form.Control
              type="text"
              name="anyCorrection"
              value={needs.anyCorrection}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="anyUpdation">
            <Form.Label>Any Updation</Form.Label>
            <Form.Control
              type="text"
              name="anyUpdation"
              value={needs.anyUpdation}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <Button type="submit" className="btn btn-primary">
        Submit
      </Button>
    </Form>
  );
};

export default FuturePrioritiesFormForSuspect;
