import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Row, Col, Button } from "react-bootstrap";
import {
  createClient,
  updateClientPersonalDetails,
  getClientById,
} from "../../../redux/feature/ClientRedux/ClientThunx";
import { fetchDetails } from "../../../redux/feature/LeadSource/LeadThunx";
import { getAllOccupationTypes } from "../../../redux/feature/OccupationType/OccupationThunx";
import { getAllOccupations } from "../../../redux/feature/LeadOccupation/OccupationThunx";
import { useNavigate, useParams } from "react-router-dom";
import PersonalDetailsForm from "./PersonalDetailsForm";
import FamilyMembersForm from "./FamilyMembersForm";
import FinancialInformationForm from "./FinancialInformationForm";
import FuturePrioritiesForm from "./FuturePrioritiesForm";
import ProposedPlanForm from "./ProposedPlanForm";
import { FaUser, FaUsers, FaRupeeSign, FaBullseye } from "react-icons/fa";
// import { useParams } from "react-router-dom";

const ClientFirstFrom = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("personal");
  const [clientId, setClientId] = useState(id || "");
  const [isEdit, setIsEdit] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [familyDetail, setFamilyDetail] = useState(null);

  // proposed

  const { tabs } = useParams();

  // useEffect(()=>{
  //   if (tabs == "proposed") {
  //     setActiveTab("proposed")
  //   }
  // },[])

  useEffect(() => {
    if (tabs === "proposed") {
      setActiveTab("proposed");
    }
  }, [tabs]); // tabs pe dependency daalo

  useEffect(() => {
    dispatch(getAllOccupationTypes());
    dispatch(getAllOccupations());
    dispatch(fetchDetails());

    if (id) {
      setIsEdit(true);
      dispatch(getClientById(id)).then((response) => {
        if (response?.payload?.client) {
          setClientData(response?.payload?.client);
        }
      });
    }
  }, [dispatch, id]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleClientCreated = (newClientId) => {
    setClientId(newClientId);
    // setActiveTab("family")
  };

  //   const changeTab=(tabChange)=>{
  // setActiveTab(changeTab)
  //   }
  const changeTab = (tabChange) => {
    setActiveTab(tabChange); // yeh correct hai
  };

  return (
    <div className="container py-5">
      <h1>Client</h1>
      <ul
        className="nav nav-pills mb-3 bg-white shadow-lg"
        id="pills-tab"
        role="tablist"
      >
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link custom-tab ${
              activeTab === "personal" ? "active-custom" : ""
            }`}
            onClick={() => handleTabChange("personal")}
          >
            <FaUser className="me-2" /> Personal Details
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link custom-tab ${
              activeTab === "family" ? "active-custom" : ""
            }`}
            onClick={() => handleTabChange("family")}
          >
            <FaUsers className="me-2" /> Add Family Details
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link custom-tab ${
              activeTab === "financial" ? "active-custom" : ""
            }`}
            onClick={() => handleTabChange("financial")}
          >
            <FaRupeeSign className="me-2" /> Financial Details
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link custom-tab ${
              activeTab === "priorities" ? "active-custom" : ""
            }`}
            onClick={() => handleTabChange("priorities")}
          >
            <FaBullseye className="me-2" /> Future's Priorities
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link custom-tab ${
              activeTab === "proposed" ? "active-custom" : ""
            }`}
            onClick={() => handleTabChange("proposed")}
          >
            <FaBullseye className="me-2" /> Proposed Financial Plan
          </button>
        </li>
      </ul>

      <div className="tab-content p-4 border rounded bg-light">
        {activeTab === "personal" && (
          <PersonalDetailsForm
            isEdit={isEdit}
            clientData={clientData}
            onClientCreated={handleClientCreated}
            setFamilyDetail={setFamilyDetail}
            changeTab={changeTab}
          />
        )}
        {activeTab === "family" && (
          <FamilyMembersForm
            clientId={clientId}
            clientData={isEdit ? clientData : null}
            onClientCreated={handleClientCreated}
            familyDetail={familyDetail}
            setFamilyDetail={setFamilyDetail}
          />
        )}
        {activeTab === "financial" && (
          <FinancialInformationForm
            clientId={clientId}
            clientData={isEdit ? clientData : null}
            onClientCreated={handleClientCreated}
          />
        )}
        {activeTab === "priorities" && (
          <FuturePrioritiesForm
            clientId={clientId}
            clientData={isEdit ? clientData : null}
            onClientCreated={handleClientCreated}
          />
        )}
        {activeTab === "proposed" && (
          <ProposedPlanForm
            clientId={clientId}
            clientData={isEdit ? clientData : null}
          />
        )}
      </div>
    </div>
  );
};

export default ClientFirstFrom;