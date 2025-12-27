import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button } from "react-bootstrap";
import { getSuspectById } from "../../../redux/feature/SuspectRedux/SuspectThunx";
import { fetchDetails } from "../../../redux/feature/LeadSource/LeadThunx";
import { getAllOccupationTypes } from "../../../redux/feature/OccupationType/OccupationThunx";
import { getAllOccupations } from "../../../redux/feature/LeadOccupation/OccupationThunx";
import { createSuspect } from "../../../redux/feature/SuspectRedux/SuspectThunx";
import { useNavigate, useParams } from "react-router-dom";
import PersonalDetailFormSuspect from "./PersonalDetailFormSuspect";
import FamilyMembersFormSuspect from "./FamilyMembersFormSuspect";
import FinancialInformationFormSuspect from "./FinancialInformationFormSuspect";
import FuturePrioritiesFromSuspect from "./FuturePrioritiesFromSuspect";
import ProposedPanFormSuspect from "./ProposedPanFormSuspect";
import {
  FaUser,
  FaUsers,
  FaRupeeSign,
  FaBullseye,
  FaFileAlt,
  FaSave,
} from "react-icons/fa";
import { toast } from "react-toastify";

const SuspectFirstForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("personal");
  const [suspectId, setSuspectId] = useState(id || "");
  const [isEdit, setIsEdit] = useState(false);
  const [suspectData, setSuspectData] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Store all form data
  const [personalData, setPersonalData] = useState(null);
  const [familyData, setFamilyData] = useState([]);
  const [financialData, setFinancialData] = useState({
    insurance: [],
    investments: [],
    loans: [],
  });
  const [prioritiesData, setPrioritiesData] = useState({
    futurePriorities: [],
    needs: {},
  });
  const [proposedPlanData, setProposedPlanData] = useState([]);

  useEffect(() => {
    dispatch(getAllOccupationTypes());
    dispatch(getAllOccupations());
    dispatch(fetchDetails());

    if (id) {
      setIsEdit(true);
      dispatch(getSuspectById(id)).then((response) => {
        if (response?.payload?.suspect) {
          const data = response.payload.suspect;
          setSuspectData(data);
          setSuspectId(data._id || id);

          // Load existing data for editing
          setPersonalData(data.personalDetails || null);
          setFamilyData(data.familyMembers || []);
          setFinancialData(
            data.financialInfo || {
              insurance: [],
              investments: [],
              loans: [],
            }
          );
          setPrioritiesData({
            futurePriorities: data.futurePriorities || [],
            needs: data.needs || {},
          });
          setProposedPlanData(data.proposedPlan || []);
        }
      });
    }
  }, [dispatch, id]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Data collection functions
  const handlePersonalDataUpdate = (formData) => {
    setPersonalData(formData);
  };

  const handleFamilyDataUpdate = (data) => {
    setFamilyData(data);
  };

  const handleFinancialDataUpdate = (data) => {
    setFinancialData(data);
  };

  const handlePrioritiesDataUpdate = (data) => {
    setPrioritiesData(data);
  };

  const handleProposedPlanDataUpdate = (data) => {
    setProposedPlanData(data);
  };

  // Handle Next button click - ONLY NAVIGATION
  const handleNextClick = () => {
    // Simple navigation only
    switch (activeTab) {
      case "personal":
        handleTabChange("family");
        break;
      case "family":
        handleTabChange("financial");
        break;
      case "financial":
        handleTabChange("priorities");
        break;
      case "priorities":
        handleTabChange("proposed");
        break;
      default:
        break;
    }
  };

  // Handle Create button click - CREATE ONLY
  const handleCreateClick = async () => {
    if (!personalData) {
      toast.error("Please fill in personal details first");
      return;
    }

    if (!personalData.groupName || !personalData.mobileNo) {
      toast.error("Please fill in required fields (Group Head and Mobile No)");
      return;
    }

    setIsCreating(true);

    try {
      // Prepare suspect data with whatever data we have
      const suspectDataToCreate = {
        personalDetails: personalData,
        familyMembers: familyData,
        financialInfo: financialData,
        futurePriorities: prioritiesData.futurePriorities,
        needs: prioritiesData.needs,
        proposedPlan: proposedPlanData,
        status: "suspect",
      };

      console.log("Creating suspect with current data");

      const resultAction = await dispatch(createSuspect(suspectDataToCreate));

      if (resultAction?.payload) {
        const newSuspectId =
          resultAction.payload.suspect?._id || resultAction.payload;
        setSuspectId(newSuspectId);
        toast.success("🎉 Suspect Created Successfully!");

        // Optional: Auto redirect after creation
        // setTimeout(() => {
        //   navigate("/suspects");
        // }, 2000);
      }
    } catch (error) {
      toast.error("Failed to create suspect");
      console.error("Create error:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Tab configurations
  const tabs = [
    {
      id: "personal",
      name: "Personal Details",
      icon: <FaUser className="me-2" />,
      enabled: true,
    },
  ];

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-primary">
          {isEdit ? "Edit Suspect" : "Create New Suspect"}
        </h1>
        {isEdit && suspectId && (
          <div className="badge bg-info text-dark p-2">
            <small>Suspect ID: {suspectId.substring(0, 8)}...</small>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div
        className="nav nav-pills mb-4 bg-white shadow-sm rounded"
        role="tablist"
      >
        {tabs.map((tab) => (
          <div className="nav-item" key={tab.id} role="presentation">
            <button
              className={`nav-link custom-tab d-flex align-items-center ${
                activeTab === tab.id
                  ? "active-custom bg-primary text-white"
                  : ""
              }`}
              onClick={() => handleTabChange(tab.id)}
              style={{
                minWidth: "180px",
                borderRadius: "0",
                padding: "12px 20px",
                borderRight: "1px solid #dee2e6",
              }}
            >
              {tab.icon}
              {tab.name}
            </button>
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content p-4 border rounded bg-light shadow-sm">
        {/* Personal Details Tab */}
        {activeTab === "personal" && (
          <div className="tab-pane fade show active">
            <h3 className="mb-4 text-primary">
              <FaUser className="me-2" />
              Personal Details
            </h3>
            <PersonalDetailFormSuspect
              isEdit={isEdit}
              suspectData={suspectData}
              onFormDataUpdate={handlePersonalDataUpdate}
            />
          </div>
        )}

        {/* Family Members Tab */}
        {activeTab === "family" && (
          <div className="tab-pane fade show active">
            <h3 className="mb-4 text-primary">
              <FaUsers className="me-2" />
              Family Details
            </h3>
            <FamilyMembersFormSuspect
              suspectId={suspectId}
              suspectData={isEdit ? suspectData : null}
              onDataUpdate={handleFamilyDataUpdate}
              onBack={() => handleTabChange("personal")}
            />
          </div>
        )}

        {/* Financial Information Tab */}
        {activeTab === "financial" && (
          <div className="tab-pane fade show active">
            <h3 className="mb-4 text-primary">
              <FaRupeeSign className="me-2" />
              Financial Information
            </h3>
            <FinancialInformationFormSuspect
              suspectId={suspectId}
              suspectData={isEdit ? suspectData : null}
              onDataUpdate={handleFinancialDataUpdate}
              onBack={() => handleTabChange("family")}
            />
          </div>
        )}

        {/* Future Priorities Tab */}
        {activeTab === "priorities" && (
          <div className="tab-pane fade show active">
            <h3 className="mb-4 text-primary">
              <FaBullseye className="me-2" />
              Future Priorities
            </h3>
            <FuturePrioritiesFromSuspect
              suspectId={suspectId}
              suspectData={isEdit ? suspectData : null}
              onDataUpdate={handlePrioritiesDataUpdate}
              onBack={() => handleTabChange("financial")}
            />
          </div>
        )}

        {/* Proposed Plan Tab */}
        {activeTab === "proposed" && (
          <div className="tab-pane fade show active">
            <h3 className="mb-4 text-primary">
              <FaFileAlt className="me-2" />
              Proposed Financial Plan
            </h3>
            <ProposedPanFormSuspect
              suspectId={suspectId}
              suspectData={isEdit ? suspectData : null}
              onDataUpdate={handleProposedPlanDataUpdate}
              onBack={() => handleTabChange("priorities")}
            />
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="d-flex justify-content-between mt-4">
        <Button
          variant="secondary"
          onClick={() => {
            if (activeTab === "family") handleTabChange("personal");
            else if (activeTab === "financial") handleTabChange("family");
            else if (activeTab === "priorities") handleTabChange("financial");
            else if (activeTab === "proposed") handleTabChange("priorities");
            else navigate(-1);
          }}
          disabled={activeTab === "personal"}
        >
          ← Back
        </Button>

        <div>
          {/* Create Button - Always visible */}
          <Button
            variant="success"
            onClick={handleCreateClick}
            disabled={isCreating || !personalData}
            className="me-2"
          >
            <FaSave className="me-2" />
            {isCreating ? "Creating..." : "Create Suspect"}
          </Button>

          {/* Next Button - For all tabs except proposed */}
          {activeTab !== "proposed" && (
            <Button variant="primary" onClick={handleNextClick}>
              Next →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuspectFirstForm;
