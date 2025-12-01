import React, { useState } from "react";
import { Navbar, Container, Nav, Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FiGrid,
  FiLayers,
  FiUsers,
  FiUser,
  FiBriefcase,
  FiHome,
  FiMessageSquare,
  FiCheckSquare,
  FiFileText,
  FiChevronDown,
  FiMenu,
} from "react-icons/fi";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbarfristn = () => {
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(!open);

  const dropdownItems = {
    masters: [
      { name: "Composite", to: "/composite" },
      { name: "Sub Master 2", to: "/masters/sub-master2" },
      { name: "Sub Master 3", to: "/masters/sub-master3" },
      { name: "All Masters", to: "/masters/all-masters", divider: true },
    ],
    customers: [
      { name: "Customer List", to: "/customers/list" },
      { name: "Add Customer", to: "/customers/add" },
      { name: "Customer Groups", to: "/customers/groups" },
    ],
    employee: [
      { name: "Employee List", to: "/employee/list" },
      { name: "Add Employee", to: "/employee/add" },
      { name: "Roles", to: "/employee/roles" },
    ],
    crm: [
      { name: "Leads", to: "/crm/leads" },
      { name: "Contacts", to: "/crm/contacts" },
      { name: "Opportunities", to: "/crm/opportunities" },
    ],
    reports: [
      { name: "Financial Reports", to: "/financial-product-list" },
      { name: "Sales Reports", to: "/reports/sales" },
      { name: "Customer Reports", to: "/reports/customer" },
    ],
  };

  const renderDropdownItems = (items) => (
    <div className="row">
      {items.map((item, index) => (
        <div className="col-md-6 mb-2" key={index}>
          <Dropdown.Item as={Link} to={item.to}>
            {item.name}
          </Dropdown.Item>
          {item.divider && <Dropdown.Divider />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="vpfinancial-navbar">
      <div className="blue-header px-3   py-2">
        <Container>
          <h1 className="brand-title mb-0">
            Vpfinancial{" "}
            <span style={{ color: "red", backgroundColor: "white" }}>Nest</span>
          </h1>
        </Container>
      </div>

      <div className="dashboard-section p-4 ">
        <Container>
          <div className="dashboard-header d-flex justify-content-between align-items-center">
            <h2 className="dashboard-title m-0">Dashboard</h2>
            <div className="breadcrumb">Vp &gt; Dashboard</div>
          </div>
        </Container>
      </div>

      <Navbar
        style={{ width: "100%" }}
        bg="white"
        expand="lg"
        className="main-navigation border-top border-bottom d-flex justify-content-center align-content-center"
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
      >
        <Container fluid>
          <Navbar.Toggle
            aria-controls="main-navbar-nav"
            className="navbar-toggler-custom"
          >
            <FiMenu className="toggle-icon" />
          </Navbar.Toggle>

          <Navbar.Collapse id="main-navbar-nav">
            <Nav className="m-auto gap-4">
              <Nav.Link as={Link} to="/" className="nav-item">
                <FiGrid className="nav-icon" />
                <span className="nav-text">Dashboard</span>
              </Nav.Link>

              {/* Masters */}
              <Dropdown as={Nav.Item} className="nav-item dropdown-hover">
                <Dropdown.Toggle as={Nav.Link}>
                  <FiLayers className="nav-icon" />
                  Masters <FiChevronDown size={12} className="ms-1" />
                </Dropdown.Toggle>
                <Dropdown.Menu
                  className="custom-dropdown p-4"
                  style={{ minWidth: "600px" }}
                >
                  <div className="row">
                    {/* Task Master */}
                    <div className="col-md-4">
                      <h6 className="text-danger">TASK MASTER</h6>
                      <Dropdown.Item as={Link} to="/composite">
                        Composite Task
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/marketing-task">
                        Marketing Task
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/servicing-task">
                        Servicing Task
                      </Dropdown.Item>
                    </div>

                    {/* Location Master */}
                    <div className="col-md-4">
                      <h6 className="text-danger">LOCATION MASTER</h6>
                      <Dropdown.Item as={Link} to="/area">
                        Add Location
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/sub-area">
                        Add Sub Location
                      </Dropdown.Item>
                      {/* <Dropdown.Item as={Link} to="/city">
                        Add City
                      </Dropdown.Item> */}
                    </div>

                    {/* Lead Master */}
                    <div className="col-md-4">
                      <h6 className="text-danger">LEAD MASTER</h6>

                      <Dropdown.Item as={Link} to="/lead-type">
                        Lead Source
                      </Dropdown.Item>

                      <Dropdown.Item as={Link} to="/lead-source">
                        Lead Name
                      </Dropdown.Item>

                      <Dropdown.Item as={Link} to="/lead-occupation">
                        Lead Occupation
                      </Dropdown.Item>

                      <Dropdown.Item as={Link} to="/occupation-type">
                        Occupation Type
                      </Dropdown.Item>
                    </div>

                    <div className="col-md-4">
                      <h6 className="text-danger">Kyc Document</h6>

                      <Dropdown.Item as={Link} to="/kycdocument">
                        document type
                      </Dropdown.Item>
                    </div>
                  </div>
                </Dropdown.Menu>
              </Dropdown>

              {/* Customers */}
              <Dropdown as={Nav.Item} className="nav-item dropdown-hover">
                <Dropdown.Toggle as={Nav.Link}>
                  <FiLayers className="nav-icon" />
                  Customers <FiChevronDown size={12} className="ms-1" />
                </Dropdown.Toggle>
                <Dropdown.Menu
                  className="custom-dropdown p-4"
                  style={{ minWidth: "600px" }}
                >
                  <div className="row">
                    {/* Task Master */}
                    <div className="col-md-4">
                      <h6 className="text-danger">Suspect</h6>

                      <Dropdown.Item as={Link} to="/suspect/add">
                        Add Suspect
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/suspect">
                        Suspect List
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/import-lead">
                        Import Lead
                      </Dropdown.Item>
                    </div>
                    <div className="col-md-4">
                      <h6 className="text-danger">Prospect</h6>
                      <Dropdown.Item as={Link} to="/prospect/add">
                        Add Prospect
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/prospect">
                        Prospect List
                      </Dropdown.Item>
                    </div>

                    <div className="col-md-4">
                      <h6 className="text-danger">Client</h6>

                      <Dropdown.Item
                        as={Link}
                        to="/client/add"
                        state={{ tab: "add" }}
                      >
                        Add Client
                      </Dropdown.Item>
                      <Dropdown.Item
                        as={Link}
                        to="/client"
                        state={{ tab: "display" }}
                      >
                        Client List
                      </Dropdown.Item>
                    </div>

                    {/* Location Master */}
                  </div>
                </Dropdown.Menu>
              </Dropdown>

              {/* Employee */}
              <Dropdown as={Nav.Item} className="nav-item dropdown-hover">
                <Dropdown.Toggle as={Nav.Link}>
                  <FiUsers className="nav-icon" />
                  Employee <FiChevronDown size={12} className="ms-1" />
                </Dropdown.Toggle>

                <Dropdown.Menu
                  className="custom-dropdown p-4"
                  style={{ minWidth: "900px" }}
                >
                  <div className="row">
                    {/* Office Admin */}
                    <div className="col-md-4">
                      <h6 className="text-danger">Office Admin</h6>
                      <Dropdown.Item as={Link} to="/job-profile-target-admin">
                        Job Profile & Target
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/employee-recruitment">
                        Employee Recruitment
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/vacancy-notice">
                        Vacancy Notice
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/addcandidate">
                        Add Candidate
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/career-enquiry">
                        Career Enquiry
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/resume-shortlist">
                        Resume Shortlist
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/interview-process">
                        Interview Process
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/internship-candidate">
                        Internship Candidate
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/add-employee">
                        Add Employee
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/joining-data">
                        Joining Data
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/job-profile-target-admin">
                        Show Appointments
                      </Dropdown.Item>
                    </div>

                    {/* Telecaller, Telemarketer, CRE */}
                    <div className="col-md-4">
                      <h6 className="text-danger">Telecaller</h6>
                      <Dropdown.Item
                        as={Link}
                        to="/job-profile-target-telecaller"
                      >
                        Job Profile & Target
                      </Dropdown.Item>

                      <h6 className="text-danger mt-3">Telemarketer</h6>
                      <Dropdown.Item
                        as={Link}
                        to="/job-profile-target-telemarketer"
                      >
                        Job Profile & Target
                      </Dropdown.Item>

                      <h6 className="text-danger mt-3">CRE</h6>
                      <Dropdown.Item as={Link} to="/job-profile-target-cre">
                        Job Profile & Target
                      </Dropdown.Item>
                    </div>

                    {/* Office Executive, HR Rules, Training */}
                    <div className="col-md-4">
                      <h6 className="text-danger">Office Executive</h6>
                      <Dropdown.Item
                        as={Link}
                        to="/job-profile-target-office-executive"
                      >
                        Job Profile & Target
                      </Dropdown.Item>

                      <h6 className="text-danger mt-3">HR Rules</h6>
                      <Dropdown.Item as={Link} to="/hr-rules">
                        HR Rules & Regulations
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/employee-training">
                        Employee Training
                      </Dropdown.Item>
                    </div>

                    <div className="col-md-4">
                      <h6 className="text-danger">Office Executive</h6>
                      <Dropdown.Item
                        as={Link}
                        to="/job-profile-target-office-executive"
                      >
                        Job Profile & Target
                      </Dropdown.Item>

                      <h6 className="text-danger mt-3">HR Rules</h6>
                      <Dropdown.Item as={Link} to="/hr-rules">
                        HR Rules & Regulations
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/employee-training">
                        Employee Training
                      </Dropdown.Item>
                    </div>
                  </div>
                </Dropdown.Menu>
              </Dropdown>

              {/* Departments */}
              <Dropdown as={Nav.Item} className="nav-item dropdown-hover">
                <Dropdown.Toggle as={Nav.Link}>
                  <FiBriefcase className="nav-icon" />
                  Departments <FiChevronDown size={12} className="ms-1" />
                </Dropdown.Toggle>

                <Dropdown.Menu
                  className="custom-dropdown p-4"
                  style={{ minWidth: "800px" }}
                >
                  <div className="row">
                    {/* HR Department */}
                    <div className="col-md-3">
                      <h6 className="text-danger">HR Department</h6>
                      <Dropdown.Item as={Link} to="/employee-recruitment">
                        Employee Recruitment
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/vacancy-notice">
                        Vacancy Notice
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/addcandidate">
                        Add Candidate
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/career-enquiry">
                        Career Enquiry
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/resume-shortlist">
                        Resume Shortlist
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/interview-process">
                        Interview Process
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/intership-candidate">
                        Internship Candidate
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/add-employee">
                        Add Employee
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/joining-data">
                        Joining Data
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/job-profile-target">
                        Job Profile & Target
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/hr-rules">
                        HR Rules & Regulations
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/employee-training">
                        Employee Training
                      </Dropdown.Item>
                    </div>

                    {/* Account Department */}
                    <div className="col-md-3">
                      <h6 className="text-danger">Account Department</h6>
                      <Dropdown.Item as={Link} to="/income-head">
                        Income Head
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/expenses-head">
                        Expenses Head
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/salary-wages">
                        Salary & Wages
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/incentives">
                        Incentives
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/office-purchase">
                        Office Purchase
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/utility-expenses">
                        Utility Expenses
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/loss-discount">
                        Loss & Discount
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/promotional-expenses">
                        Promotional Expenses
                      </Dropdown.Item>
                    </div>

                    {/* Marketing Department */}
                    <div className="col-md-3">
                      <h6 className="text-danger">Marketing Department</h6>
                      <Dropdown.Item as={Link} to="/marketing-composite">
                        Composite Data
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/marketing-life">
                        Life Insurance
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/marketing-health">
                        Health Insurance
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/marketing-mutual">
                        Mutual Fund
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/marketing-realestate">
                        Real Estate
                      </Dropdown.Item>
                    </div>

                    {/* Servicing Department + CRM */}
                    <div className="col-md-3">
                      <h6 className="text-danger">Servicing Department</h6>
                      <Dropdown.Item as={Link} to="/servicing-composite">
                        Composite Data
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/servicing-life">
                        Life Insurance
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/servicing-health">
                        Health Insurance
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/servicing-mutual">
                        Mutual Fund
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/servicing-realestate">
                        Real Estate
                      </Dropdown.Item>

                      <h6 className="text-danger mt-3">CRM</h6>
                      <Dropdown.Item as={Link} to="/crm-department">
                        CRM Department
                      </Dropdown.Item>
                    </div>
                  </div>
                </Dropdown.Menu>
              </Dropdown>

              {/* Office */}
              <Dropdown as={Nav.Item} className="nav-item dropdown-hover">
                <Dropdown.Toggle as={Nav.Link}>
                  <FiHome className="nav-icon" />
                  <i className="ti-pie-chart"></i> Office{" "}
                  <FiChevronDown size={12} className="ms-1" />
                </Dropdown.Toggle>
                <Dropdown.Menu
                  className="custom-dropdown p-4"
                  style={{ minWidth: "600px" }}
                >
                  <div className="row">
                    {/* Financial */}
                    <div className="col-md-4">
                      <h6 className="text-danger">FINANCIAL</h6>
                      <Dropdown.Item as={Link} to="/financial-product-list">
                        Financial Product List
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/company-name">
                        Company Name
                      </Dropdown.Item>

                      {/* <Dropdown.Item as={Link} to="/mutual-fund">
                        Mutual Fund
                      </Dropdown.Item> */}
                      <Dropdown>
                        <Dropdown.Item
                          variant="light"
                          id="dropdown-basic"
                          className="menu-item"
                          onClick={toggleMenu}
                        >
                          <span className="bullet"></span> Mutual Fund{" "}
                          {open ? "▾" : "▸"}
                          {open && (
                            <div className="submenu">
                              <ul>
                                <li>
                                  <div className="submenu-item">
                                    <span className="bullet"></span>
                                    <Link to="/mutual-fund/registrar">
                                      Registrar
                                    </Link>
                                  </div>
                                </li>
                                <li>
                                  <div className="submenu-item">
                                    <span className="bullet"></span>
                                    <Link to="/mutual-fund/amc">AMC Name</Link>
                                  </div>
                                </li>
                              </ul>
                            </div>
                          )}
                        </Dropdown.Item>
                      </Dropdown>
                      <Dropdown.Item as={Link} to="/other-product">
                        Other Product
                      </Dropdown.Item>
                    </div>

                    {/* Office Records */}
                    <div className="col-md-4">
                      <h6 className="text-danger">OFFICE RECORDS</h6>

                      <Dropdown.Item as={Link} to="/office-diary">
                        Office Diary
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/office-purchase">
                        Office Purchase
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/important-documents">
                        Important Documents
                      </Dropdown.Item>
                    </div>
                  </div>
                </Dropdown.Menu>
              </Dropdown>

              {/* CRM */}

              <Dropdown as={Nav.Item} className="nav-item dropdown-hover">
                <Dropdown.Toggle as={Nav.Link}>
                  <FiMessageSquare className="nav-icon" />
                  <i className="ti-support"></i> CRM{" "}
                  <FiChevronDown size={12} className="ms-1" />
                </Dropdown.Toggle>
                <Dropdown.Menu
                  className="custom-dropdown p-4"
                  style={{ minWidth: "400px" }}
                >
                  <div className="row">
                    {/* CRM Records */}
                    <div className="col-md-6">
                      <h6 className="text-danger">CRM RECORDS</h6>
                      <Dropdown.Item as={Link} to="/crm-relationship">
                        Relationship
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/crm-employee">
                        Employee
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/crm-customer">
                        Customer
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/crm-associates">
                        Associates
                      </Dropdown.Item>
                    </div>

                    {/* CRM Activities */}
                    <div className="col-md-6">
                      <h6 className="text-danger">CRM ACTIVITIES</h6>
                      <Dropdown.Item as={Link} to="/crm-creative-activity">
                        Creative Activity
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/crm-advertisement">
                        Advertisement
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/crm-composite">
                        Composite Data
                      </Dropdown.Item>
                    </div>

                    {/* CRM Insurance & Funds */}
                    <div className="col-md-6">
                      <h6 className="text-danger">CRM INSURANCE & FUNDS</h6>
                      <Dropdown.Item as={Link} to="/crm-life">
                        Life Insurance
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/crm-health">
                        Health Insurance
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/crm-mutual">
                        Mutual Fund
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/crm-realestate">
                        Real Estate
                      </Dropdown.Item>
                    </div>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
              {/* task */}
              <Dropdown as={Nav.Item} className="nav-item dropdown-hover">
                <Dropdown.Toggle as={Nav.Link}>
                  <FiCheckSquare className="nav-icon" />
                  <i className="ti-check-box"></i> Task{" "}
                  <FiChevronDown size={12} className="ms-1" />
                </Dropdown.Toggle>
                <Dropdown.Menu
                  className="custom-dropdown p-4"
                  style={{ minWidth: "400px" }}
                >
                  <div className="row">
                    {/* Task Categories */}
                    <div className="col-md-6">
                      <h6 className="text-danger">TASK CATEGORIES</h6>
                      <Dropdown.Item as={Link} to="/task-composite">
                        Composite
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/task-marketing">
                        Marketing
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/task-servicing">
                        Servicing
                      </Dropdown.Item>
                    </div>
                    {/* Task Assign */}
                    <div className="col-md-6">
                      <h6 className="text-danger">Task Assign</h6>
                      <Dropdown.Item as={Link} to="/task-assign">
                        Assign Task
                      </Dropdown.Item>
                    </div>
                  </div>
                </Dropdown.Menu>
              </Dropdown>

              {/* Reports */}
              <Dropdown as={Nav.Item} className="nav-item dropdown-hover">
                <Dropdown.Toggle as={Nav.Link}>
                  <FiFileText className="nav-icon" />
                  Reports <FiChevronDown size={12} className="ms-1" />
                </Dropdown.Toggle>
                <Dropdown.Menu
                  className="custom-dropdown p-4"
                  style={{ minWidth: "300px" }}
                >
                  <div className="row">
                    {/* Report Items */}
                    <div className="col-md-12">
                      <h6 className="text-danger">REPORTS</h6>
                      <Dropdown.Item as={Link} to="/report-1">
                        Report 1
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/report-2">
                        Report 2
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/report-3">
                        Report 3
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/report-4">
                        Report 4
                      </Dropdown.Item>
                    </div>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default Navbarfristn;
