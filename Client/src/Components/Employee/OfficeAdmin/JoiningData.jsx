import React, { useState } from "react";
import { Table, Pagination, Form, Dropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const JoiningData = () => {
  // Sample data - in a real app, you'd fetch this from an API
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "TM1",
      department: "Seller Account Handler",
      designation: "",
      joiningDate: "",
      rank: "",
      type: "emp",
      status: "Enabled",
    },
    {
      id: 2,
      name: "TL-2",
      department: "Telecaller",
      designation: "",
      joiningDate: "",
      rank: "",
      type: "freelancer",
      status: "Enabled",
    },
    {
      id: 3,
      name: "TL-1",
      department: "Telecaller",
      designation: "",
      joiningDate: "",
      rank: "",
      type: "freelancer",
      status: "Enabled",
    },
    {
      id: 4,
      name: "Ankit CRE",
      department: "CRE",
      designation: "",
      joiningDate: "",
      rank: "",
      type: "cre",
      status: "Enabled",
    },
  ]);

  // State for table controls
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Sorting functionality
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedEmployees = [...employees].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;

  const filteredEmployees = sortedEmployees.filter((emp) =>
    Object.values(emp).some((val) =>
      val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const currentEntries = filteredEmployees.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredEmployees.length / entriesPerPage);

  // Action handlers
  const handleRankChange = (empId, empType, newRank) => {
    if (
      window.confirm(
        "Are you sure want to change Rank of Seller Account Holder?"
      )
    ) {
      setEmployees(
        employees.map((emp) =>
          emp.id === empId && emp.type === empType
            ? { ...emp, rank: newRank }
            : emp
        )
      );
    }
  };

  const handleStatusChange = (empId, empType) => {
    if (window.confirm("Are you sure want to change status of employee?")) {
      setEmployees(
        employees.map((emp) =>
          emp.id === empId && emp.type === empType
            ? {
                ...emp,
                status: emp.status === "Enabled" ? "Disabled" : "Enabled",
              }
            : emp
        )
      );
    }
  };

  const handleDelete = (empId, empType) => {
    if (
      window.confirm(
        "Are you sure want to Delete? Once you delete you can not access employee related information!"
      )
    ) {
      setEmployees(
        employees.filter((emp) => !(emp.id === empId && emp.type === empType))
      );
    }
  };

  // Render sortable header
  const renderSortableHeader = (key, label) => (
    <th onClick={() => requestSort(key)} style={{ cursor: "pointer" }}>
      {label}
      {sortConfig.key === key && (sortConfig.direction === "asc" ? " ↑" : " ↓")}
    </th>
  );

  return (
    <div className="content">
      <div className="row">
        <div className="col-xs-12">
          <div className="box">
            <div className="box-body">
              <div className="dataTables_wrapper form-inline dt-bootstrap">
                <div className="row">
                  <div className="col-sm-6">
                    <div className="dataTables_length">
                      <label>
                        Show{" "}
                        <select
                          className="form-control input-sm"
                          value={entriesPerPage}
                          onChange={(e) => {
                            setEntriesPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                        >
                          {[10, 25, 50, 100].map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>{" "}
                        entries
                      </label>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="dataTables_filter">
                      <label>
                        Search:
                        <input
                          type="search"
                          className="form-control input-sm"
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-12">
                    <Table responsive bordered hover>
                      <thead>
                        <tr>
                          {renderSortableHeader("id", "#")}
                          {renderSortableHeader("name", "Name")}
                          {renderSortableHeader("department", "Department")}
                          {renderSortableHeader("designation", "Designation")}
                          {renderSortableHeader("joiningDate", "Joining Date")}
                          {renderSortableHeader("rank", "Rank")}
                          <th>
                            <img src="img/Enabled.png" alt="Status" />
                          </th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentEntries.map((emp, index) => (
                          <tr key={`${emp.id}-${emp.type}`}>
                            <td>{index + 1 + indexOfFirstEntry}</td>
                            <td>
                              <a
                                href={`profile.php?emp_id=${emp.id}&emp_type=${emp.type}`}
                                data-toggle="tooltip"
                                title="Employee Detail"
                              >
                                {emp.name}
                              </a>
                            </td>
                            <td>{emp.department}</td>
                            <td>{emp.designation}</td>
                            <td>{emp.joiningDate || "-"}</td>
                            <td>
                              <Dropdown>
                                <Dropdown.Toggle
                                  variant="danger"
                                  size="sm"
                                  id="dropdown-rank"
                                >
                                  {emp.rank || "Select Rank"}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(
                                    (rank) => (
                                      <Dropdown.Item
                                        key={rank}
                                        onClick={() =>
                                          handleRankChange(
                                            emp.id,
                                            emp.type,
                                            rank
                                          )
                                        }
                                      >
                                        {rank}
                                      </Dropdown.Item>
                                    )
                                  )}
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                            <td>
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleStatusChange(emp.id, emp.type);
                                }}
                                data-toggle="tooltip"
                                title="Status Active/Deactive"
                              >
                                <img
                                  src={`img/${emp.status}.png`}
                                  alt={emp.status}
                                />
                              </a>
                            </td>
                            <td>
                              <a
                                href={`emp_login_log.php?emp=${emp.id}&emp_type=${emp.type}`}
                                className="mr-2"
                                data-toggle="tooltip"
                                title="Login Details"
                              >
                                <i className="fa fa-expeditedssl" />
                              </a>
                              <a
                                href={`upload_emp.php?emp_id=${emp.id}&emp_type=${emp.type}`}
                                className="mr-2"
                                data-toggle="tooltip"
                                title="Documents"
                              >
                                <i className="fa fa-file-text-o" />
                                hey
                              </a>
                              <a
                                href={`add_ahm.php?action=edit&emp_type=${emp.type}&id=${emp.id}`}
                                className="mr-2"
                                data-toggle="tooltip"
                                title="Edit"
                              >
                                <i className="fa fa-edit" />
                              </a>
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDelete(emp.id, emp.type);
                                }}
                                data-toggle="tooltip"
                                title="Delete"
                              >
                                <i className="fa fa-trash text-danger" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-5">
                    <div className="dataTables_info">
                      Showing {indexOfFirstEntry + 1} to{" "}
                      {Math.min(indexOfLastEntry, filteredEmployees.length)} of{" "}
                      {filteredEmployees.length} entries
                    </div>
                  </div>
                  <div className="col-sm-7">
                    <Pagination className="float-right">
                      <Pagination.Prev
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      />
                      {Array.from({ length: totalPages }, (_, i) => (
                        <Pagination.Item
                          key={i + 1}
                          active={i + 1 === currentPage}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      />
                    </Pagination>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoiningData;
