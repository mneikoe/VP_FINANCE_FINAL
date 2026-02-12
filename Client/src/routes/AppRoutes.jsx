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
import Marketing from "../Components/Masters/Marketing/Marketing";
import Servicing from "../Components/Masters/Servicing/Servicing";
import LeadType from "../Components/Masters/Leads/LeadType";
import LeadOccupation from "../Components/Masters/Leads/LeadOccupation";
import OccupationType from "../Components/Masters/Leads/OccupationType";
import SuspectEditWrapper from "../Components/EmployeeDashboard/TelecallerDashboard/SuspectEditWrapper";
import MeetingPurpose from "../Components/Masters/Leads/MeetingPurpose";
// Customer Components
import CustomerDetail from "../Components/Customer/Client/CustomerDetail";
import ProspectDetail from "../Components/Customer/Prospect/ProspectDetail";
import SuspectDetail from "../Components/Customer/Suspect/SuspectDetailOA";
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
import LoginTelecaller from "../pages/telecaller/Login";
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
import AppointmentsDonePage from "../Components/EmployeeDashboard/TelecallerDashboard/AppointmentsPage";
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
import OEDashboard from "../Components/OEDashboard/OEDashboard";

// Department Components:
import FormCompanyMaster from "../Components/Departments/Masters/FormCompanyMaster";
import FinancialProductMaster from "../Components/Departments/Masters/FinancialProductMaster";
// marketing
import MarketingLife from "../Components/Departments/MarketingDepartment/MarketingLife";
import MarketingHealth from "../Components/Departments/MarketingDepartment/MarketingHealth";
import MarketingReal from "../Components/Departments/MarketingDepartment/MarketingReal";
import MarketingMutual from "../Components/Departments/MarketingDepartment/MarketingMutual";

// servicing
import ServicingLife from "../Components/Departments/ServicingDepartment/ServicingLife";
import ServicingHealth from "../Components/Departments/ServicingDepartment/ServicingHealth"
import ServicingReal from "../Components/Departments/ServicingDepartment/ServicingReal";
import ServicingMutual from "../Components/Departments/ServicingDepartment/ServicingMutual";
//account department
import IncomeHead from "../Components/Departments/AccountDepartment/IncomeHead/IncomeHead"

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
import ProspectAppointmentList from "../Components/Reports/ProspectAppointmentList";
import EmployeeReport from "../Components/Reports/EmployeeReport";
import EmployeeReportDetail from "../Components/Reports/EmployeeReportDetail";
import TelecallerReport from "../Components/Reports/TelecallerReport";
import TelecallerReportDetail from "../Components/Reports/TelecallerReportDetail";
import TelecallerReportDateActivities from "../Components/Reports/TelecallerReportDateActivities";
import RMDashboard from "../Components/RMDashboard/RMDashboard";
import SuspectDetailsPage from "../Components/EmployeeDashboard/TelecallerDashboard/SuspectDetailsPageTelecaller";
import StatusBasedLeadsPage from "../Components/EmployeeDashboard/TelecallerDashboard/StatusBasedLeadsPage";
import RMAssignment from "../Components/Masters/RMAssignment";
import CompositeAssignments from "../Components/Masters/Composite/CompositeAssignment";
import MarketingAssignments from "../Components/Masters/Marketing/MarketingAssignment";
import ServiceAssignments from "../Components/Masters/Servicing/ServiceAssignment";

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
        <Route path="suspect/details/:id" element={<SuspectDetailsPage />} />
        <Route
          path="appointments-scheduled"
          element={<AppointmentsDonePage />}
        />
        <Route path="appointments" element={<Monthlyappointment />} />

        {/* 🟢 Active Leads Parent */}
        <Route path="/telecaller/active" element={<ActiveLeadsPage />} />

        {/* 🟢 Children of Active Leads */}
        <Route path="Callback" element={<StatusBasedLeadsPage />} />
        <Route path="busy-on-another-call" element={<StatusBasedLeadsPage />} />
        <Route path="call-after-some-time" element={<StatusBasedLeadsPage />} />
        <Route path="call-not-picked" element={<StatusBasedLeadsPage />} />
        <Route path="others" element={<StatusBasedLeadsPage />} />
        <Route path="not-interested" element={<StatusBasedLeadsPage />} />
        <Route path="wrong-number" element={<StatusBasedLeadsPage />} />
        <Route path="not-reachable" element={<StatusBasedLeadsPage />} />
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
        <Route path="/appointment-assign" element={<RMAssignment />} />
        <Route path="/area" element={<Area />} />
        <Route path="/sub-area" element={<SubArea />} />
        <Route path="/city" element={<City />} />
        <Route path="/composite" element={<Composite />} />
        <Route path="/kycdocument" element={<Kycdocument />} />
        <Route path="/task-composite" element={<CompositeAssignments />} />
        <Route path="/task-marketing" element={<MarketingAssignments />} />
        <Route path="/task-servicing" element={<ServiceAssignments />} />
        <Route path="/lead-type" element={<LeadType />} />
        <Route path="/occupation-type" element={<OccupationType />} />
        <Route path="/lead-occupation" element={<LeadOccupation />} />
        <Route path="/lead-source" element={<LeadSource />} />
        <Route path="/marketing-task" element={<Marketing />} />
        <Route path="/servicing-task" element={<Servicing />} />
        <Route path="/meeting-purpose" element={<MeetingPurpose />} />
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
        <Route
          path="/reports/prospect-list"
          element={<ProspectAppointmentList />}
        />
        <Route path="/reports/employee-report" element={<EmployeeReport />} />
        <Route
          path="/reports/employee-report/:employeeId"
          element={<EmployeeReportDetail />}
        />
        <Route path="/reports/telecaller-report" element={<TelecallerReport />} />
        <Route
          path="/reports/telecaller-report/:telecallerId/date/:date"
          element={<TelecallerReportDateActivities />}
        />
        <Route
          path="/reports/telecaller-report/:telecallerId"
          element={<TelecallerReportDetail />}
        />
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
        {/* departments */}
        <Route path="/department-company" element={<FormCompanyMaster />} />
        <Route path="/department-financial" element={<FinancialProductMaster />} />
        {/* accounts department */}
        <Route path="/income-head" element={<IncomeHead />} />
        {/* marketing */}
        <Route path="/marketing-life" element={<MarketingLife />} />
        <Route path="/marketing-health" element={<MarketingHealth />} />
        <Route path="/marketing-mutual" element={<MarketingMutual />} />
        <Route path="/marketing-realestate" element={<MarketingReal />} />
        {/* servicing */}
        <Route path="/servicing-life" element={<ServicingLife />} />
        <Route path="/servicing-health" element={<ServicingHealth />} />
        <Route path="/servicing-mutual" element={<ServicingMutual />} />
        <Route path="/servicing-realestate" element={<ServicingReal />} />
      </Route>

      {/* 🏦 RM Dashboard Routes - Only RM can access */}
      <Route
        path="/rm/*"
        element={
          <ProtectedRoute allowedRoles={["RM"]}>
            <RMDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/oe/*"
        element={
          <ProtectedRoute allowedRoles={["OE"]}>
            <OEDashboard />
          </ProtectedRoute>
        }
      />
      {/* 🚀 Default Route - Redirect based on role */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <NavigateToRoleBasedRoute />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

// Helper component to redirect based on user role
const NavigateToRoleBasedRoute = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  switch (user.role) {
    case "RM":
      return <Navigate to="/rm/dashboard" replace />;
    case "OE":
      return <Navigate to="/oe/dashboard" replace />;
    case "HR":
      return <Navigate to="/dashboard" replace />;
    case "Telecaller":
      return <Navigate to="/telecaller/dashboard" replace />;
    case "OA":
      return <Navigate to="/" replace />;
    default:
      return <Navigate to="/auth/login" replace />;
  }
};

export default AppRoutes;
