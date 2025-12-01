// ClientForm.js (Parent)
import React, { useState, useEffect } from "react";
import axiosInstance from "../../../config/axios";
import { toast } from "react-toastify";
import { Tab, Tabs } from "react-bootstrap";
import PersonalDetailsForm from "./PersonalDetailsForm";
import FamilyMembersForm from "./FamilyMembersForm";
// ... other imports

// ClientForm.js (Parent)
const ClientForm = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [createdClientId, setCreatedClientId] = useState(null);
  
  const [globalFormData, setGlobalFormData] = useState({
    personalDetails: { /* initial state */ },
    // ... other tabs
  });

  // ✅ Client create success handler
  const handleClientCreated = async (clientId) => {
    setCreatedClientId(clientId);
    
    // ✅ Client data fetch karke globalFormData me store karo
    try {
      const response = await axiosInstance.get(`/api/client/${clientId}`);
      
      if (response.data.success && response.data.data) {
        setGlobalFormData(prev => ({
          ...prev,
          personalDetails: { ...prev.personalDetails, ...response.data.data.personalDetails },
          // family details bhi pre-load kar sakte ho agar available ho
        }));
        
        toast.success("Client data loaded and ready for editing!");
      }
    } catch (error) {
      console.error("Error loading client data:", error);
      toast.error(error.response?.data?.message || "Failed to load client data.");
    }
  };

  return (
    <div>
      <Tabs activeKey={activeTab} onSelect={setActiveTab}>
        <Tab eventKey="personal" title="Personal Details">
          <PersonalDetailsForm 
            formData={globalFormData.personalDetails}
            updateFormData={updatePersonalDetails}
            changeTab={setActiveTab}
            onClientCreated={handleClientCreated}  // ✅ Pass handler
            isEdit={!!createdClientId}  // ✅ Edit mode enable after creation
            clientData={{ _id: createdClientId, personalDetails: globalFormData.personalDetails }}
          />
        </Tab>
        
        <Tab eventKey="family" title="Add Family Details">
          <FamilyMembersForm 
            formData={globalFormData.familyDetails}
            updateFormData={(data) => 
              setGlobalFormData(prev => ({
                ...prev, 
                familyDetails: { ...prev.familyDetails, ...data }
              }))
            }
            clientId={createdClientId}  // ✅ Client ID pass karo
          />
        </Tab>
      </Tabs>
    </div>
  );
};

export default ClientForm;