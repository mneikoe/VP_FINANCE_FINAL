// AppRoutes.jsx - Updated with Proper HR Routes
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import DashboardCards from "../Components/Dashbord/DashboardCards";
import ActiveLeadsPage from "../Components/EmployeeDashboard/TelecallerDashboard/ActiveLeadsPage";
import BusyOnAnotherCallPage from "../Components/EmployeeDashboard/TelecallerDashboard/BusyOnAnotherCallPage";
import CallAfterSomeTimePage from "../Components/EmployeeDashboard/TelecallerDashboard/CallAfterSomeTimePage";
import CallNotPickedPage from "../Components/EmployeeDashboard/TelecallerDashboard/CallNotPickedPage";
import OthersLeadsPage from "../Components/EmployeeDashboard/TelecallerDashboard/OthersLeadsPage";
import BalanceLeadsPage from "../Components/EmployeeDashboard/TelecallerDashboard/BalanceLeadsPage";
import CallingDonePage from "../Components/EmployeeDashboard/TelecallerDashboard/CallingDonePage";
// Master Components
import Composite from "../Components/Masters/Composite/Composite";
import Area from "../Components/Masters/Leads/Area";
import City from "../Components/Masters/Leads/City";
import LeadSource from "../Components/Masters/Leads/LeadSource";
import SubArea from "../Components/Masters/Leads/SubArea";
import MarketingTask from "../Components/Masters/Marketing/MarketingTask";
import ServicingTask from "../Components/Masters/Servicing/ServicingTask";
import LeadType from "../Components/Masters/Leads/LeadType";
import LeadOccupation from "../Components/Masters/Leads/LeadOccupation";
import OccupationType from "../Components/Masters/Leads/OccupationType";
import SuspectEditWrapper from "../Components/EmployeeDashboard/TelecallerDashboard/SuspectEditWrapper";
// Customer Components
import CustomerDetail from "../Components/Customer/Client/CustomerDetail";
import ProspectDetail from "../Components/Customer/Prospect/ProspectDetail";
import SuspectDetail from "../Components/Customer/Suspect/SuspectDetail";
import ClientFirstFrom from "../Components/Customer/Client/ClientFirstFrom";
import ProspectFirstForm from "../Components/Customer/Prospect/ProspectFirstForm";
import SuspectFirstForm from "../Components/Customer/Suspect/SuspectFirstForm";
import ClientLeadTabs from "../Components/Customer/Client/ClientLeadTabs";
import SuspectLeadsTabs from "../Components/Customer/Suspect/SuspectLeadTabs";
import ProspectLeadTabs from "../Components/Customer/Prospect/ProspectLeadTabs";
import ImportLead from "../Components/Customer/ImportLead";
import KYCtabs from "../Components/Customer/KYC/KYCtabs";

// Employee Components
import EmployeeAddForm from "../Components/Employee/OfficeAdmin/EmployeeAddForm";
import CareerEnquiry from "../Components/Employee/HR/CareerEnquiry";
import ResumesShortlist from "../Components/Employee/HR/ResumesShortlist";
import SelectedInterviewTable from "../Components/Employee/OfficeAdmin/SelectedInterviewTable";
import JoiningData from "../Components/Employee/OfficeAdmin/JoiningData";
import Kycdocument from "../Components/Masters/kycdocument/Kycdocument";
// Office Components
import FinancialProduct from "../Components/Offices/Financlal/FinancialProduct";
import CompanyTabs from "../Components/Offices/Financlal/CompanyTabs";
import RegistrarTabs from "../Components/Offices/Mutual Funds/Registrar/RegistrarTabs";
import AMCtabs from "../Components/Offices/Mutual Funds/AMC/AMCtabs";
import OfficeDiaryTabs from "../Components/Offices/OfficeRecord/Office Diary/OfficeDiaryTabs";
import OfficePurchase from "../Components/Offices/Other/OfficePurchase";
import ImpDocument from "../Components/Offices/Other/ImportantDocument/ImpDocument";
import Registertelecaller from "../pages/telecaller/Register";
import TelecallerPanel from "../Components/EmployeeDashboard/TelecallerDashboard/telecallerDashboard";
import LoginTelecaller from "../pages/telecaller/login";
import Registertelemarketer from "../pages/telemarketer/Register";
import RegisterOE from "../pages/OE/Register";
import RegisterOA from "../pages/OA/Register";
import RegisterHR from "../pages/HR/Register";
import LoginOE from "../pages/OE/Login";
import LoginOA from "../pages/OA/Login";
import LoginHR from "../pages/HR/Login";
import LoginTelemarketer from "../pages/telemarketer/Login";
import Login from "../pages/COMMONLOGIN/Login";
import AddSuspect from "../Components/EmployeeDashboard/TelecallerDashboard/AddSuspect";
import DashboardPage from "../Components/EmployeeDashboard/TelecallerDashboard/Dashboard";
import ForwardedLeadsPage from "../Components/EmployeeDashboard/TelecallerDashboard/ForwardedLeadsPage";
import RejectedLeadsPage from "../Components/EmployeeDashboard/TelecallerDashboard/RejectedLeadsPage";
import AppointmentsDonePage from "../Components/EmployeeDashboard/TelecallerDashboard/AppointmentsDonePage";
import NotInterested from "../Components/EmployeeDashboard/TelecallerDashboard/NotInterested";
import NotReachable from "../Components/EmployeeDashboard/TelecallerDashboard/NotReachable";
import WrongNumber from "../Components/EmployeeDashboard/TelecallerDashboard/WrongNumber";
import TaskAssign from "../Components/Masters/Taskassign";
import VacancyNotice from "../Components/Employee/HR/VacancyNotice";
import Addcandidate from "../Components/Employee/HR/Addcandidate";
import Monthlyappointment from "../Components/EmployeeDashboard/TelecallerDashboard/Monthlyappointment";
import Callback from "../Components/EmployeeDashboard/TelecallerDashboard/Callback";
import Appointment from "../Components/Appointment";
import CREDashboard from "../Components/CREDashboard";
import HRDashboard from "../Components/HRDashboard/HRDashboard";
import EmployeeDetails from "../Components/Employee/OfficeAdmin/EmployeeDetails";

// Import new HR Dashboard modules
import HRDashboardHome from "../Components/HRDashboard/HRDashboardHome";
import Analytics from "../Components/HRDashboard/modules/Analytics";
import BusinessAssociates from "../Components/HRDashboard/modules/BusinessAssociates";
import VacancyManagement from "../Components/HRDashboard/modules/VacancyManagement";
import AddCandidate from "../Components/HRDashboard/modules/AddCandidate";
import CareerEnquiryHR from "../Components/HRDashboard/modules/CareerEnquiry";
import ResumeShortlistHR from "../Components/HRDashboard/modules/ResumeShortlist";
import InterviewProcessHR from "../Components/HRDashboard/modules/InterviewProcess";
import JoiningDataHR from "../Components/HRDashboard/modules/JoiningData";

// 🔒 ProtectedRoute Component (Strict Role Check)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || null);

  if (!token || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* 🌍 Public Routes ONLY - Register & Login */}
      <Route path="/telecaller/register" element={<Registertelecaller />} />
      <Route path="/telemarketer/register" element={<Registertelemarketer />} />
      <Route path="/OE/register" element={<RegisterOE />} />
      <Route path="/HR/register" element={<RegisterHR />} />
      <Route path="/OA/register" element={<RegisterOA />} />
      <Route path="/telemarketer/login" element={<LoginTelemarketer />} />
      <Route path="/OA/login" element={<LoginOA />} />
      <Route path="/HR/login" element={<LoginHR />} />
      <Route path="/telecaller/login" element={<LoginTelecaller />} />
      <Route path="/OE/login" element={<LoginOE />} />
      <Route path="/auth/login" element={<Login />} />

      {/* 👥 HR Dashboard Routes - Complete Implementation */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute allowedRoles={["HR"]}>
            <HRDashboard />
          </ProtectedRoute>
        }
      />

      {/* 📞 TELECALLER - Only Telecaller Routes */}
      <Route
        path="/telecaller"
        element={
          <ProtectedRoute allowedRoles={["Telecaller"]}>
            <TelecallerPanel />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="suspect/add" element={<AddSuspect />} />
        <Route path="suspect/edit/:id" element={<SuspectEditWrapper />} />
        <Route path="balance-leads" element={<BalanceLeadsPage />} />
        <Route path="calling-done" element={<CallingDonePage />} />
        <Route path="forwarded-leads" element={<ForwardedLeadsPage />} />
        <Route path="rejected-leads" element={<RejectedLeadsPage />} />
        <Route path="appointments-done" element={<AppointmentsDonePage />} />
        <Route path="appointments" element={<Monthlyappointment />} />

        {/* 🟢 Active Leads Parent */}
        <Route path="/telecaller/active" element={<ActiveLeadsPage />} />

        {/* 🟢 Children of Active Leads */}
        <Route path="Callback" element={<Callback />} />
        <Route
          path="busy-on-another-call"
          element={<BusyOnAnotherCallPage />}
        />
        <Route
          path="call-after-some-time"
          element={<CallAfterSomeTimePage />}
        />
        <Route path="call-not-picked" element={<CallNotPickedPage />} />
        <Route path="others" element={<OthersLeadsPage />} />

        <Route path="not-interested" element={<NotInterested />} />
        <Route path="wrong-number" element={<WrongNumber />} />
        <Route path="not-reachable" element={<NotReachable />} />
      </Route>

      {/* 🏢 OA (Office Admin) - Only OA can access Layout & all other routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["OA"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardCards />} />

        {/* Masters - Only OA */}
        <Route path="/task-assign" element={<TaskAssign />} />
        <Route path="/area" element={<Area />} />
        <Route path="/sub-area" element={<SubArea />} />
        <Route path="/city" element={<City />} />
        <Route path="/composite" element={<Composite />} />

        <Route path="/kycdocument" element={<Kycdocument />} />
        <Route path="/lead-type" element={<LeadType />} />
        <Route path="/occupation-type" element={<OccupationType />} />
        <Route path="/lead-occupation" element={<LeadOccupation />} />
        <Route path="/lead-source" element={<LeadSource />} />
        <Route path="/marketing-task" element={<MarketingTask />} />
        <Route path="/servicing-task" element={<ServicingTask />} />

        {/* Customer - Only OA */}
        <Route path="/client" element={<ClientLeadTabs />} />
        <Route path="/client/:tabs" element={<ClientLeadTabs />} />
        <Route path="/client/add" element={<ClientFirstFrom />} />
        <Route path="/client/edit/:id" element={<ClientFirstFrom />} />
        <Route path="/client/detail/:id" element={<CustomerDetail />} />

        <Route path="/suspect" element={<SuspectLeadsTabs />} />
        <Route path="/suspect/add" element={<SuspectFirstForm />} />
        <Route path="/suspect/edit/:id" element={<SuspectFirstForm />} />
        <Route path="/suspect/detail/:id" element={<SuspectDetail />} />

        <Route path="/prospect" element={<ProspectLeadTabs />} />
        <Route path="/prospect/add" element={<ProspectFirstForm />} />
        <Route path="/prospect/edit/:id" element={<ProspectFirstForm />} />
        <Route path="/prospect/detail/:id" element={<ProspectDetail />} />

        <Route path="/import-lead" element={<ImportLead />} />
        <Route path="/kyc" element={<KYCtabs />} />

        {/* Employee - Only OA */}
        <Route path="/add-employee" element={<EmployeeAddForm />} />
        <Route path="/employee/:id" element={<EmployeeDetails />} />

        {/* HR Module Routes for OA */}
        <Route path="/career-enquiry" element={<CareerEnquiry />} />
        <Route path="/vacancy-notice" element={<VacancyNotice />} />
        <Route path="/addcandidate" element={<Addcandidate />} />
        <Route path="/resume-shortlist" element={<ResumesShortlist />} />
        <Route path="/interview-process" element={<SelectedInterviewTable />} />
        <Route path="/joining-data" element={<JoiningData />} />
        <Route path="/job-profile-target-admin" element={<Appointment />} />

        {/* Office - Only OA */}
        <Route path="/financial-product-list" element={<FinancialProduct />} />
        <Route path="/company-name" element={<CompanyTabs />} />
        <Route path="/mutual-fund/registrar" element={<RegistrarTabs />} />
        <Route path="/mutual-fund/amc" element={<AMCtabs />} />
        <Route path="/office-diary" element={<OfficeDiaryTabs />} />
        <Route path="/office-purchase" element={<OfficePurchase />} />
        <Route path="/important-documents" element={<ImpDocument />} />
        <Route path="/CRE" element={<CREDashboard />} />
      </Route>

      {/* 🔧 OE - Only OE specific routes (if any) can be added here */}
      {/* 📈 Telemarketer - Only Telemarketer specific routes (if any) can be added here */}
    </Routes>
  );
};

export default AppRoutes;
