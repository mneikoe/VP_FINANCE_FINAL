
// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { Form, Row, Col, Button } from "react-bootstrap";
// import { addProposedFinancialPlan} from "../../../redux/feature/ProspectRedux/ProspectThunx";
// import { toast } from "react-toastify";

// const ProposedPlanFormForProspect = ({ prospectId, prospectData, onProspectCreated }) => {
//   const dispatch = useDispatch();

//   const [plans, setPlans] = useState([{
//     createdDate: "",
//     memberName: "",
//     financialProduct: "",
//     financialCompany: "",
//     planName: "",
//     documents: [], // This will store actual File objects
//   }]);
//   const [savedPlans, setSavedPlans] = useState([]);

//   const handleInputChange = (index, e) => {
//     const { name, value } = e.target;
//     const newPlans = [...plans];
//     newPlans[index] = {
//       ...newPlans[index],
//       [name]: value
//     };
//     setPlans(newPlans);
//   };

//   const handleFileUpload = (index, e) => {
//     const files = e.target.files;
//     const newPlans = [...plans];
//     newPlans[index] = {
//       ...newPlans[index],
//       documents: files ? Array.from(files) : [] // Store actual File objects
//     };
//     setPlans(newPlans);
//   };

//   const addPlan = () => {
//     setPlans([...plans, {
//       createdDate: "",
//       memberName: "",
//       financialProduct: "",
//       financialCompany: "",
//       planName: "",
//       documents: []
//     }]);
//   };

//   const removePlan = (index) => {
//     const newPlans = [...plans];
//     newPlans.splice(index, 1);
//     setPlans(newPlans);
//   };

//   const savePlan = (index) => {
//     const planToSave = plans[index];
    
//     // Validate that all required fields are filled
//     if (!planToSave.createdDate || !planToSave.memberName || 
//         !planToSave.financialProduct || !planToSave.financialCompany || 
//         !planToSave.planName) {
//       toast.error("Please fill in all required fields before saving the plan");
//       return;
//     }

//     // Check if documents are uploaded
//     if (!planToSave.documents || planToSave.documents.length === 0) {
//       toast.error("Please upload at least one document for this plan");
//       return;
//     }

//     const newSavedPlans = [...savedPlans, planToSave];
//     setSavedPlans(newSavedPlans);
//     removePlan(index);
//     toast.success("Plan saved successfully");
//   };


//   const handleSubmit = async (e) => {
//   e.preventDefault();

//   if (savedPlans.length === 0) {
//     toast.error("Please save at least one plan before submitting");
//     return;
//   }

//   try {
//     for (const plan of savedPlans) {
//       const formData = new FormData();
//       formData.append('createdDate', plan.createdDate);
//       formData.append('memberName', plan.memberName);
//       formData.append('financialProduct', plan.financialProduct);
//       formData.append('financialCompany', plan.financialCompany);
//       formData.append('planName', plan.planName);

//       plan.documents.forEach(file => {
//         formData.append('documents', file);
//       });

//      const idToUse = prospectData && prospectData._id || prospectId;
//     console.log("IdToUse", idToUse)

//      const result = await dispatch(addProposedFinancialPlan({ prospectId :idToUse, formData }));
//      if(result){
//     setSavedPlans([]);
//     setPlans([{
//       createdDate: "",
//       memberName: "",
//       financialProduct: "",
//       financialCompany: "",
//       planName: "",
//       documents: [],
//     }]);
//     toast.success("All Proposed Plans Submitted!");
//      }
//     }

//   } catch (error) {
//     toast.error("Failed to submit plans. Please try again.");
//     console.error("Submit error:", error);
//   }
// };

//   return (
//     <div>
//       {/* Display saved plans */}
//       {savedPlans.length > 0 && (
//         <div className="mb-4">
//           <h5>Saved Plans ({savedPlans.length})</h5>
//           {savedPlans.map((savedPlan, index) => (
//             <div key={index} className="border p-2 mb-2 bg-light">
//               <strong>{savedPlan.planName}</strong> - {savedPlan.memberName} 
//               ({savedPlan.documents.length} document(s))
//             </div>
//           ))}
//         </div>
//       )}

//       <Form onSubmit={handleSubmit}>
//         {plans.map((plan, index) => (
//           <div key={index} className="border p-3 mb-3">
//             <Row className="mb-3">
//               <Col md={4}>
//                 <Form.Group controlId={`createdDate-${index}`}>
//                   <Form.Label>Date <span className="text-danger">*</span></Form.Label>
//                   <Form.Control
//                     type="date"
//                     name="createdDate"
//                     value={plan.createdDate}
//                     onChange={(e) => handleInputChange(index, e)}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={4}>
//                 <Form.Group controlId={`memberName-${index}`}>
//                   <Form.Label>Member Name <span className="text-danger">*</span></Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="memberName"
//                     value={plan.memberName}
//                     onChange={(e) => handleInputChange(index, e)}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={4}>
//                 <Form.Group controlId={`financialProduct-${index}`}>
//                   <Form.Label>Financial Product <span className="text-danger">*</span></Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="financialProduct"
//                     value={plan.financialProduct}
//                     onChange={(e) => handleInputChange(index, e)}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row className="mb-3">
//               <Col md={4}>
//                 <Form.Group controlId={`financialCompany-${index}`}>
//                   <Form.Label>Company <span className="text-danger">*</span></Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="financialCompany"
//                     value={plan.financialCompany}
//                     onChange={(e) => handleInputChange(index, e)}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={4}>
//                 <Form.Group controlId={`planName-${index}`}>
//                   <Form.Label>Plan Name <span className="text-danger">*</span></Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="planName"
//                     value={plan.planName}
//                     onChange={(e) => handleInputChange(index, e)}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={4}>
//                 <Form.Group controlId={`documents-${index}`}>
//                   <Form.Label>Upload Document <span className="text-danger">*</span></Form.Label>
//                   <Form.Control
//                     type="file"
//                     name="documents"
//                     onChange={(e) => handleFileUpload(index, e)}
//                     multiple
//                     required
//                   />
//                   {plan.documents.length > 0 && (
//                     <small className="text-muted">
//                       {plan.documents.length} file(s) selected
//                     </small>
//                   )}
//                 </Form.Group>
//               </Col>
//             </Row>
//             <div className="d-flex gap-2">
//               <Button variant="danger" onClick={() => removePlan(index)}>
//                 Remove Plan
//               </Button>
//               <Button variant="success" onClick={() => savePlan(index)}>
//                 Save Plan
//               </Button>
//             </div>
//           </div>
//         ))}
        
//         <div className="d-flex justify-content-between align-items-center">
//           <Button variant="primary" onClick={addPlan}>
//             Add Another Plan
//           </Button>
          
//           <Button 
//             type="submit" 
//             variant="success"
//             disabled={savedPlans.length === 0}
//           >
//             Submit All Plans ({savedPlans.length})
//           </Button>
//         </div>
//       </Form>
//     </div>
//   );
// };

// export default ProposedPlanFormForProspect;



import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Form, Row, Col, Button } from "react-bootstrap";
import { addProposedFinancialPlan } from "../../../redux/feature/ProspectRedux/ProspectThunx";
import { toast } from "react-toastify";

const ProposedPlanFormForProspect = ({ prospectId, prospectData, onProspectCreated }) => {
  const dispatch = useDispatch();

  const [plans, setPlans] = useState([{
    createdDate: "",
    memberName: "",
    financialProduct: "",
    financialCompany: "",
    planName: "",
    documents: [], // This will store actual File objects
    status: "Proposed", // Added status field with default value
  }]);
  const [savedPlans, setSavedPlans] = useState([]);

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const newPlans = [...plans];
    newPlans[index] = {
      ...newPlans[index],
      [name]: value
    };
    setPlans(newPlans);
  };

  const handleFileUpload = (index, e) => {
    const files = e.target.files;
    const newPlans = [...plans];
    newPlans[index] = {
      ...newPlans[index],
      documents: files ? Array.from(files) : []
    };
    setPlans(newPlans);
  };

  const addPlan = () => {
    setPlans([...plans, {
      createdDate: "",
      memberName: "",
      financialProduct: "",
      financialCompany: "",
      planName: "",
      documents: [],
      status: "Proposed", // Added status field
    }]);
  };

  const removePlan = (index) => {
    const newPlans = [...plans];
    newPlans.splice(index, 1);
    setPlans(newPlans);
  };

  const savePlan = (index) => {
    const planToSave = plans[index];
    
    // Validate that all required fields are filled
    if (!planToSave.createdDate || !planToSave.memberName || 
        !planToSave.financialProduct || !planToSave.financialCompany || 
        !planToSave.planName || !planToSave.status) {
      toast.error("Please fill in all required fields before saving the plan");
      return;
    }

    // Check if documents are uploaded
    if (!planToSave.documents || planToSave.documents.length === 0) {
      toast.error("Please upload at least one document for this plan");
      return;
    }

    const newSavedPlans = [...savedPlans, planToSave];
    setSavedPlans(newSavedPlans);
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
        formData.append('createdDate', plan.createdDate);
        formData.append('memberName', plan.memberName);
        formData.append('financialProduct', plan.financialProduct);
        formData.append('financialCompany', plan.financialCompany);
        formData.append('planName', plan.planName);
        formData.append('status', plan.status); // Added status to formData

        plan.documents.forEach(file => {
          formData.append('documents', file);
        });

        const idToUse = prospectData && prospectData._id || prospectId;
        console.log("IdToUse", idToUse);

        const result = await dispatch(addProposedFinancialPlan({ prospectId: idToUse, formData }));
        if (result) {
          setSavedPlans([]);
          setPlans([{
            createdDate: "",
            memberName: "",
            financialProduct: "",
            financialCompany: "",
            planName: "",
            documents: [],
            status: "Proposed", // Reset status
          }]);
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
      {/* Display saved plans */}
      {savedPlans.length > 0 && (
        <div className="mb-4">
          <h5>Saved Plans ({savedPlans.length})</h5>
          {savedPlans.map((savedPlan, index) => (
            <div key={index} className="border p-2 mb-2 bg-light">
              <strong>{savedPlan.planName}</strong> - {savedPlan.memberName} 
              ({savedPlan.documents.length} document(s)) - Status: {savedPlan.status}
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
                  <Form.Label>Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="createdDate"
                    value={plan.createdDate}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId={`memberName-${index}`}>
                  <Form.Label>Member Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="memberName"
                    value={plan.memberName}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId={`financialProduct-${index}`}>
                  <Form.Label>Financial Product <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="financialProduct"
                    value={plan.financialProduct}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId={`financialCompany-${index}`}>
                  <Form.Label>Company <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="financialCompany"
                    value={plan.financialCompany}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId={`planName-${index}`}>
                  <Form.Label>Plan Name <span className="text-danger">*</span></Form.Label>
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
                <Form.Group controlId={`status-${index}`}>
                  <Form.Label>Status <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="status"
                    value={plan.status}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                  >
                    <option value="Proposed">Proposed</option>
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group controlId={`documents-${index}`}>
                  <Form.Label>Upload Document <span className="text-danger">*</span></Form.Label>
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

export default ProposedPlanFormForProspect;