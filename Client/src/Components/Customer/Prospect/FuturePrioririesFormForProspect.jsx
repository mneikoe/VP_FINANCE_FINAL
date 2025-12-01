



import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "/src/config/axios";
import { Form, Row, Col, Button } from "react-bootstrap";
import {
  addFuturePrioritiesAndNeeds,
  updateFuturePrioritiesAndNeeds,
  getClientById,
} from "../../../redux/feature/ClientRedux/ClientThunx";
import { toast } from "react-toastify";

const FUTURE_PRIORITY_OPTIONS = [
  ["Life Insurance", "Health Insurance", "Retirement Fund", "Wealth Creation"],
  ["Child Higher Education", "Child Professional Education", "Child Marriage", "Property Investment"],
  ["Purchase House", "Purchase Car", "Business Fund Creation", "Business Expansion"],
];

const initialFuturePriorityForm = {
  _id: null,
  priorityName: "",
  submissionDate: "",
  members: [],
  approxAmount: "",
  duration: "",
  remark: "",
  documents: [],
};

const initialNeeds = {
  createdDate: new Date().toISOString(),
  financialCalculation: false,
  assesmentOfNeed: false,
  portfolioManagement: false,
  doorStepServices: false,
  purchaseNewProducts: false,
  anyCorrection: "",
  anyUpdation: "",
};

const FuturePrioritiesFormForProspect= ({ clientId }) => {
  const dispatch = useDispatch();
  const { client, loading, error } = useSelector((state) => state.client || {});

  const [openPriorities, setOpenPriorities] = useState([]);
  const [futurePriorityForms, setFuturePriorityForms] = useState({});
  const [savedFuturePriorityForms, setSavedFuturePriorityForms] = useState([]);
  const [needs, setNeeds] = useState(initialNeeds);
  const [priorityFiles, setPriorityFiles] = useState({});
  const [familyMembers, setFamilyMembers] = useState([]);

  useEffect(() => {
    if (clientId) {
      dispatch(getClientById(clientId));
    }
      
  }, [clientId, dispatch]);




  useEffect(() => {
    const fetchClientData = async () => {
      try {
        if (!clientId) return;
        const response = await axiosInstance.get(`/api/client/${clientId}`);
        const result = response.data;
        if (result.success) {
             setFamilyMembers(result.client.familyMembers || []);
          setSavedFuturePriorityForms(result.client.futurePriorities || []);
          // Prepopulate forms with existing financial info
       
        } else {
          toast.error(result.message || "Failed to load client data.");
        }
      } catch (error) {
        console.error("Error fetching client data:", error);
        toast.error(error.response?.data?.message || "Error loading client data. Check your network.");
      }
    };

    fetchClientData();
  }, [clientId]);


  useEffect(() => {
    if (client) {
      console.log("Client data:", client); // Debug
      setFamilyMembers(client.familyMembers || []);
      setSavedFuturePriorityForms(client.futurePriorities || []);
console.log("savedFuturePriorityForms",savedFuturePriorityForms)
  
      setNeeds({
        ...initialNeeds,
        ...client.needs,
        createdDate: client.needs?.createdDate || new Date().toISOString(),
      });
    }
  }, [client]);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleCheckboxChange = (option) => {
    setOpenPriorities((prev) =>
      prev.includes(option) ? prev.filter((v) => v !== option) : [...prev, option]
    );

    setFuturePriorityForms((prev) => ({
      ...prev,
      [option]: prev[option] || {
        ...initialFuturePriorityForm,
        priorityName: option,
        submissionDate: getCurrentDate(),
      },
    }));
  };

  const handleFormChange = (priority, field, value) => {
    setFuturePriorityForms((prev) => ({
      ...prev,
      [priority]: {
        ...prev[priority],
        [field]:
          field === "approxAmount"
            ? parseFloat(value) || ""
            : field === "members"
            ? value
            : value,
      },
    }));
  };

  const handleFileChange = (priority, files) => {
    setPriorityFiles((prev) => ({
      ...prev,
      [priority]: files ? Array.from(files) : [],
    }));
  };

  const handleSaveForm = (priority) => {
    const formData = futurePriorityForms[priority];
    if (!formData?.priorityName || !formData?.members?.length || !formData?.approxAmount || !formData?.duration) {
      toast.error("Please complete all required fields before saving.");
      return;
    }

    setSavedFuturePriorityForms((prev) => {
      const existingIndex = prev.findIndex((item) => item._id === formData._id);
      if (existingIndex >= 0) {
        const updatedForms = [...prev];
        updatedForms[existingIndex] = {
          ...formData,
          submissionDate: formData.submissionDate || getCurrentDate(),
          documents: priorityFiles[priority] || [],
        };
        return updatedForms;
      }
      return [
        ...prev,
        {
          ...formData,
          submissionDate: formData.submissionDate || getCurrentDate(),
          documents: priorityFiles[priority] || [],
        },
      ];
    });

    setOpenPriorities((prev) => prev.filter((v) => v !== priority));
    setFuturePriorityForms((prev) => {
      const copy = { ...prev };
      delete copy[priority];
      return copy;
    });
    setPriorityFiles((prev) => {
      const copy = { ...prev };
      delete copy[priority];
      return copy;
    });

    toast.success(`${priority} saved.`);
  };

  const handleCloseForm = (priority) => {
    setOpenPriorities((prev) => prev.filter((v) => v !== priority));
    setFuturePriorityForms((prev) => {
      const copy = { ...prev };
      delete copy[priority];
      return copy;
    });
    setPriorityFiles((prev) => {
      const copy = { ...prev };
      delete copy[priority];
      return copy;
    });
  };

  const handleNeedsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNeeds((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e, isUpdate = false) => {
    e.preventDefault();

    try {
      if (!clientId) {
        toast.error("Client ID is missing.");
        return;
      }

      const payload = {
        clientId,
        futurePriorities: savedFuturePriorityForms,
        needs: { ...needs, createdDate: new Date().toISOString() },
        documents: Object.values(priorityFiles).flat(),
      };

      const action = isUpdate
        ? await dispatch(updateFuturePrioritiesAndNeeds(payload))
        : await dispatch(addFuturePrioritiesAndNeeds(payload));

      if (
        isUpdate
          ? updateFuturePrioritiesAndNeeds.fulfilled.match(action)
          : addFuturePrioritiesAndNeeds.fulfilled.match(action)
      ) {
        toast.success(action.payload.message || "Future Priorities saved successfully.");
        await dispatch(getClientById(clientId));
      } else {
        toast.error(action.payload || "Failed to save future priorities.");
      }
    } catch (error) {
      console.error("Error submitting future priorities:", error);
      toast.error("Failed to submit. Please try again.");
    }
  };

  const handleEditForm = (item) => {
    setOpenPriorities((prev) => [...prev, item.priorityName]);
    setFuturePriorityForms((prev) => ({
      ...prev,
      [item.priorityName]: { ...item },
    }));
  };

  return (
    <Form onSubmit={(e) => handleSubmit(e, false)}>
      <Row className="mb-3">
        {FUTURE_PRIORITY_OPTIONS.map((column, colIdx) => (
          <Col md={4} key={colIdx}>
            <Form.Group>
              <Form.Label>Future Priorities</Form.Label>
              {column.map((option) => (
                <Form.Check
                  key={option}
                  type="checkbox"
                  label={option}
                  value={option}
                  checked={openPriorities.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                />
              ))}
            </Form.Group>
          </Col>
        ))}
      </Row>

      <h6 className="mt-3">Saved Future Priorities</h6>
      {savedFuturePriorityForms.map((item) => (
        <div key={item._id || item.priorityName} className="border p-2 mb-2">
          <p>
            {item.priorityName} - {item.members.join(", ")} - {item.approxAmount}
          </p>
          <Button size="sm" onClick={() => handleEditForm(item)}>
            Edit
          </Button>
        </div>
      ))}

      {openPriorities.map((priority) => (
        <div key={priority} className="border p-3 mb-3">
          <h5 className="text-info">{priority} Form</h5>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Submission Date</Form.Label>
                <Form.Control
                  type="date"
                  value={futurePriorityForms[priority]?.submissionDate || getCurrentDate()}
                  onChange={(e) => handleFormChange(priority, "submissionDate", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Members</Form.Label>
                <Form.Select
                  // multiple
                  value={futurePriorityForms[priority]?.members || []}
                  onChange={(e) =>
                    handleFormChange(
                      priority,
                      "members",
                      Array.from(e.target.selectedOptions, (option) => option.value)
                    )
                  }
                  required
                >
                  {familyMembers.map((member) => (
                    <option key={member._id} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Approx Amount</Form.Label>
                <Form.Control
                  type="number"
                  value={futurePriorityForms[priority]?.approxAmount || ""}
                  onChange={(e) => handleFormChange(priority, "approxAmount", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Duration</Form.Label>
                <Form.Control
                  type="text"
                  value={futurePriorityForms[priority]?.duration || ""}
                  onChange={(e) => handleFormChange(priority, "duration", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Remark</Form.Label>
                <Form.Control
                  type="text"
                  value={futurePriorityForms[priority]?.remark || ""}
                  onChange={(e) => handleFormChange(priority, "remark", e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Upload Documents (up to 10)</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/gif,image/avif,application/pdf"
                  onChange={(e) => handleFileChange(priority, e.target.files)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Button variant="primary" className="me-2 mt-2" onClick={() => handleSaveForm(priority)}>
            Save
          </Button>
          <Button variant="secondary" className="mt-2" onClick={() => handleCloseForm(priority)}>
            Close
          </Button>
        </div>
      ))}

       <Row className="mb-3">
     <Col md={12}>
       <Form.Group>
         {/* <Form.Label>Needs</Form.Label> */}
   
         <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center" }}>
           <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
             Financial Calculation
             <Form.Check
               type="checkbox"
               name="financialCalculation"
               checked={needs.financialCalculation}
               onChange={handleNeedsChange}
               label=""
               style={{ margin: 0 }}
             />
           </label>
   
           <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
             Assessment of Need
             <Form.Check
               type="checkbox"
               name="assesmentOfNeed"
               checked={needs.assesmentOfNeed}
               onChange={handleNeedsChange}
               label=""
               style={{ margin: 0 }}
             />
           </label>
   
           <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
             Portfolio Management
             <Form.Check
               type="checkbox"
               name="portfolioManagement"
               checked={needs.portfolioManagement}
               onChange={handleNeedsChange}
               label=""
               style={{ margin: 0 }}
             />
           </label>
   
           <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
             Door Step Services
             <Form.Check
               type="checkbox"
               name="doorStepServices"
               checked={needs.doorStepServices}
               onChange={handleNeedsChange}
               label=""
               style={{ margin: 0 }}
             />
           </label>
   
           <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
             Purchase New Products
             <Form.Check
               type="checkbox"
               name="purchaseNewProducts"
               checked={needs.purchaseNewProducts}
               onChange={handleNeedsChange}
               label=""
               style={{ margin: 0 }}
             />
           </label>
         </div>
       </Form.Group>
     </Col>
   </Row>

      <Button type="submit" className="btn btn-primary mt-3 me-2" disabled={loading}>
        Add Future Priorities
      </Button>
      <Button
        type="button"
        className="btn btn-primary mt-3"
        onClick={(e) => handleSubmit(e, true)}
        disabled={loading}
      >
        Update Future Priorities
      </Button>
    </Form>
  );
};

export default FuturePrioritiesFormForProspect