
import React, { useState, useEffect } from "react";
import { useDispatch,useSelector } from "react-redux";
import axiosInstance from "../../../config/axios";
import { Form, Row, Col, Button } from "react-bootstrap";
import { addProposedFinancialPlan } from "../../../redux/feature/ClientRedux/ClientThunx";
import { fetchCompanyName } from "../../../redux/feature/ComapnyName/CompanyThunx";
import {fetchFinancialProduct} from '../../../redux/feature/FinancialProduct/FinancialThunx'
import { toast } from "react-toastify";

const ProposedPlanForm = ({ clientId, clientData }) => {

 const companies = useSelector((state) => state.CompanyName.CompanyNames);
    console.log("comapnies",companies)
  const products = useSelector((state) => state.financialProduct.FinancialProducts);
  console.log("products",products)

   

   
  const dispatch = useDispatch();

  const [plans, setPlans] = useState([
    {
      createdDate: "",
      memberName: "",
      financialProduct: "",
      financialCompany: "",
      planName: "",
      documents: [],
    },
  ]);
  const [savedPlans, setSavedPlans] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);

  useEffect(() => {
      dispatch(fetchCompanyName());
      dispatch(fetchFinancialProduct())
    }, [dispatch]);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        if (!clientId) return;
        const response = await axiosInstance.get(`/api/client/${clientId}`);
        const result = response.data;
        if (result.success) {
          setFamilyMembers(result.client.familyMembers || []);
        } else {
          console.error("Failed to fetch client data:", result.message);
        }
      } catch (error) {
        console.error("Error fetching client data:", error);
      }
    };
    fetchClientData();
  }, [clientId]);

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    setPlans((prevPlans) =>
      prevPlans.map((plan, i) =>
        i === index ? { ...plan, [name]: value } : plan
      )
    );
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleFileUpload = (index, e) => {
    const files = e.target.files;
    setPlans((prevPlans) =>
      prevPlans.map((plan, i) =>
        i === index ? { ...plan, documents: files ? Array.from(files) : [] } : plan
      )
    );
  };

  const addPlan = () => {
    setPlans((prev) => [
      ...prev,
      {
        createdDate: "",
        memberName: "",
        financialProduct: "",
        financialCompany: "",
        planName: "",
        documents: [],
      },
    ]);
  };

  const removePlan = (index) => {
    setPlans((prev) => prev.filter((_, i) => i !== index));
  };

  const savePlan = (index) => {
    const planToSave = plans[index];

    if (
     
      !planToSave.memberName ||
      !planToSave.financialProduct ||
      !planToSave.financialCompany ||
      !planToSave.planName
    ) {
      toast.error("Please fill in all required fields before saving the plan");
      return;
    }

    if (!planToSave.documents || planToSave.documents.length === 0) {
      toast.error("Please upload at least one document for this plan");
      return;
    }

    setSavedPlans((prev) => [...prev, planToSave]);
    removePlan(index);
    toast.success("Plan saved successfully");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (savedPlans.length === 0) {
      toast.error("Please save at least one plan before submitting");
      return;
    }

    try {
      for (const plan of savedPlans) {
        const formData = new FormData();
        formData.append("createdDate", plan.createdDate);
        formData.append("memberName", plan.memberName);
        formData.append("financialProduct", plan.financialProduct);
        formData.append("financialCompany", plan.financialCompany);
        formData.append("planName", plan.planName);

        plan.documents.forEach((file) => {
          formData.append("documents", file);
        });

        const idToUse = (clientData && clientData._id) || clientId;

        const result = await dispatch(
          addProposedFinancialPlan({ clientId: idToUse, formData })
        );

        if (result) {
          setSavedPlans([]);
          setPlans([
            {
              createdDate: "",
              memberName: "",
              financialProduct: "",
              financialCompany: "",
              planName: "",
              documents: [],
            },
          ]);
          toast.success("All Proposed Plans Submitted!");
        }
      }
    } catch (error) {
      toast.error("Failed to submit plans. Please try again.");
      console.error("Submit error:", error);
    }
  };

  return (
    <div>
      {savedPlans.length > 0 && (
        <div className="mb-4">
          <h5>Saved Plans ({savedPlans.length})</h5>
          {savedPlans.map((savedPlan, index) => (
            <div key={index} className="border p-2 mb-2 bg-light">
              <strong>{savedPlan.planName}</strong> - {savedPlan.memberName} (
              {savedPlan.documents.length} document(s))
            </div>
          ))}
        </div>
      )}

      <Form onSubmit={handleSubmit}>
        {plans.map((plan, index) => (
          <div key={index} className="border p-3 mb-3">
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId={`createdDate-${index}`}>
                  <Form.Label>
                    Date <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="createdDate"
                    value={plan.createdDate || getCurrentDate()}
                    onChange={(e) => handleInputChange(index, e)}
                    
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId={`memberName-${index}`}>
                  <Form.Label>
                    Member Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="memberName"
                    value={plan.memberName}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                  >
                    <option value="">Select Member</option>
                    {familyMembers.map((member) => (
                      <option key={member._id} value={member.name}>
                        {member.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

      <Col md={4}>
  <Form.Group controlId={`financialProduct-${index}`}>
    <Form.Label>
      Financial Product <span className="text-danger">*</span>
    </Form.Label>
    <Form.Select
      name="financialProduct"
      value={plan.financialProduct || ""}
      onChange={(e) => handleInputChange(index, e)}
      required
    >
      <option value="">Select Financial Product</option>
      {products?.map((product) => (
        <option key={product._id} value={product.name}>
          {product.name}
        </option>
      ))}
    </Form.Select>
  </Form.Group>
</Col>

            </Row>

            <Row className="mb-3">
             <Col md={4}>
  <Form.Group controlId={`financialCompany-${index}`}>
    <Form.Label>
      Company <span className="text-danger">*</span>
    </Form.Label>
    <Form.Select
      name="financialCompany"
      value={plan.financialCompany || ""}
      onChange={(e) => handleInputChange(index, e)}
      required
    >
      <option value="">Select Company</option>
      {companies?.map((company) => (
        <option key={company._id} value={company.companyName}>
          {company.companyName}
        </option>
      ))}
    </Form.Select>
  </Form.Group>
</Col>


              <Col md={4}>
                <Form.Group controlId={`planName-${index}`}>
                  <Form.Label>
                    Plan Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="planName"
                    value={plan.planName}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId={`documents-${index}`}>
                  <Form.Label>
                    Upload Document <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="file"
                    name="documents"
                    onChange={(e) => handleFileUpload(index, e)}
                    multiple
                    required
                  />
                  {plan.documents.length > 0 && (
                    <small className="text-muted">
                      {plan.documents.length} file(s) selected
                    </small>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2">
              <Button variant="danger" onClick={() => removePlan(index)}>
                Remove Plan
              </Button>
              <Button variant="success" onClick={() => savePlan(index)}>
                Save Plan
              </Button>
            </div>
          </div>
        ))}

        <div className="d-flex justify-content-between align-items-center">
          <Button variant="primary" onClick={addPlan}>
            Add Another Plan
          </Button>

          <Button
            type="submit"
            variant="success"
            disabled={savedPlans.length === 0}
          >
            Submit All Plans ({savedPlans.length})
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ProposedPlanForm;
