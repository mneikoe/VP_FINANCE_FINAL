import React from "react";
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
  const dropdownItems = {
    masters: [
      { name: "Sub Master 1", to: "/composite" },
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
      { name: "Financial Reports", to: "/reports/financial" },
      { name: "Sales Reports", to: "/reports/sales" },
      { name: "Customer Reports", to: "/reports/customer" },
    ],
  };

  return (
    <div className="vpfinancial-navbar">
      <div className="blue-header">
        <Container>
          <h1 className="brand-title">Vpfinancial Nest</h1>
        </Container>
      </div>

      <div className="dashboard-section">
        <Container>
          <div className="dashboard-header">
            <h2 className="dashboard-title">Dashboard</h2>
            <div className="breadcrumb">Lexa &gt; Dashboard</div>
          </div>
        </Container>
      </div>

      <Navbar bg="white" expand="lg" className="main-navigation">
        <Container fluid>
          <Navbar.Toggle
            aria-controls="main-navbar-nav"
            className="navbar-toggler-custom"
          >
            <FiMenu className="toggle-icon" />
          </Navbar.Toggle>

          <Navbar.Collapse id="main-navbar-nav">
            <Nav className="mx-auto">
              <Nav.Link as={Link} to="/dashboard" className="nav-item">
                <FiGrid className="nav-icon" />
                <span className="nav-text">Dashboard</span>
              </Nav.Link>

              {/* Masters Dropdown */}
              <Dropdown as={Nav.Item} className="nav-item dropdown-hover">
                <Dropdown.Toggle as={Nav.Link} className="nav-link">
                  <FiLayers className="nav-icon" />
                  <span className="nav-text">
                    Masters{" "}
                    <FiChevronDown
                      size={12}
                      className="ms-1 dropdown-chevron"
                    />
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="p-3" style={{ minWidth: "400px" }}>
                  <div className="row">
                    {dropdownItems.masters.map((item, index) => (
                      <div className="col-md-6" key={index}>
                        <Dropdown.Item as={Link} to={item.to}>
                          {item.name}
                        </Dropdown.Item>
                        {item.divider && <Dropdown.Divider />}
                      </div>
                    ))}
                  </div>
                </Dropdown.Menu>
              </Dropdown>

              {/* Customers Dropdown */}
              <Dropdown as={Nav.Item} className="nav-item dropdown-hover">
                <Dropdown.Toggle as={Nav.Link} className="nav-link">
                  <FiUsers className="nav-icon" />
                  <span className="nav-text">
                    Customers{" "}
                    <FiChevronDown
                      size={12}
                      className="ms-1 dropdown-chevron"
                    />
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="p-3" style={{ minWidth: "400px" }}>
                  <div className="row">
                    {dropdownItems.customers.map((item, index) => (
                      <div className="col-md-6" key={index}>
                        <Dropdown.Item as={Link} to={item.to}>
                          {item.name}
                        </Dropdown.Item>
                      </div>
                    ))}
                  </div>
                </Dropdown.Menu>
              </Dropdown>

              {/* Employee Dropdown */}
              <Dropdown as={Nav.Item} className="nav-item dropdown-hover">
                <Dropdown.Toggle as={Nav.Link} className="nav-link">
                  <FiUser className="nav-icon" />
                  <span className="nav-text">
                    Employee{" "}
                    <FiChevronDown
                      size={12}
                      className="ms-1 dropdown-chevron"
                    />
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="p-3" style={{ minWidth: "400px" }}>
                  <div className="row">
                    {dropdownItems.employee.map((item, index) => (
                      <div className="col-md-6" key={index}>
                        <Dropdown.Item as={Link} to={item.to}>
                          {item.name}
                        </Dropdown.Item>
                      </div>
                    ))}
                  </div>
                </Dropdown.Menu>
              </Dropdown>

              <Nav.Link as={Link} to="/departments" className="nav-item">
                <FiBriefcase className="nav-icon" />
                <span className="nav-text">Departments</span>
              </Nav.Link>

              <Nav.Link as={Link} to="/office" className="nav-item">
                <FiHome className="nav-icon" />
                <span className="nav-text">Office</span>
              </Nav.Link>

              {/* CRM Dropdown */}
              <Dropdown as={Nav.Item} className="nav-item dropdown-hover">
                <Dropdown.Toggle as={Nav.Link} className="nav-link">
                  <FiMessageSquare className="nav-icon" />
                  <span className="nav-text">
                    CRM{""}
                    <FiChevronDown
                      size={12}
                      className="ms-1 dropdown-chevron"
                    />
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="p-3" style={{ minWidth: "400px" }}>
                  <div className="row">
                    {dropdownItems.crm.map((item, index) => (
                      <div className="col-md-6" key={index}>
                        <Dropdown.Item as={Link} to={item.to}>
                          {item.name}
                        </Dropdown.Item>
                      </div>
                    ))}
                  </div>
                </Dropdown.Menu>
              </Dropdown>

              

              <Nav.Link as={Link} to="/task" className="nav-item">
                <FiCheckSquare className="nav-icon" />
                <span className="nav-text">Task</span>
              </Nav.Link>

              {/* Reports Dropdown */}
              <Dropdown as={Nav.Item} className="nav-item dropdown-hover">
                <Dropdown.Toggle as={Nav.Link} className="nav-link">
                  <FiFileText className="nav-icon" />
                  <span className="nav-text">
                    Reports{" "}
                    <FiChevronDown
                      size={12}
                      className="ms-1 dropdown-chevron"
                    />
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="p-3" style={{ minWidth: "400px" }}>
                  <div className="row">
                    {dropdownItems.reports.map((item, index) => (
                      <div className="col-md-6" key={index}>
                        <Dropdown.Item as={Link} to={item.to}>
                          {item.name}
                        </Dropdown.Item>
                      </div>
                    ))}
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
