import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Form } from "react-bootstrap";

const SelectedInterview = () => {
  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState("");

  const dummyData = [
    {
      id: 1,
      name: "Abhishek Meena",
      mobile: "9876543210",
      email: "abhishek@example.com",
      city: "Bhopal",
      linkedin: "https://linkedin.com/in/abhishek",
      department: "Frontend Developer",
      resume: "resume_abhishek.pdf",
      date: "2025-05-01",
      status: "Pending",
    },
    {
      id: 2,
      name: "Rohit Sharma",
      mobile: "9123456780",
      email: "rohit@example.com",
      city: "Indore",
      linkedin: "https://linkedin.com/in/rohit",
      department: "Backend Developer",
      resume: "resume_rohit.pdf",
      date: "2025-05-03",
      status: "Pending",
    },
    {
      id: 3,
      name: "Priya Verma",
      mobile: "9001234567",
      email: "priya@example.com",
      city: "Mumbai",
      linkedin: "https://linkedin.com/in/priya",
      department: "UI/UX Designer",
      resume: "resume_priya.pdf",
      date: "2025-05-05",
      status: "Pending",
    },
  ];

  useEffect(() => {
    setData(dummyData);
  }, []);

  const handleReject = (id) => {
    const updated = data.map((item) =>
      item.id === id ? { ...item, status: "Rejected" } : item
    );
    setData(updated);
  };

  const handleSelect = (id) => {
    const updated = data.map((item) =>
      item.id === id ? { ...item, status: "Internship Selected" } : item
    );
    setData(updated);
  };

  // Filtered data based on search
  const filteredData = data.filter((item) => {
    return (
      item.name.toLowerCase().includes(filterText.toLowerCase()) ||
      item.email.toLowerCase().includes(filterText.toLowerCase()) ||
      item.city.toLowerCase().includes(filterText.toLowerCase()) ||
      item.department.toLowerCase().includes(filterText.toLowerCase())
    );
  });

  const columns = [
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Mobile", selector: (row) => row.mobile, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "City", selector: (row) => row.city, sortable: true },
    {
      name: "LinkedIn",
      cell: (row) => (
        <a href={row.linkedin} target="_blank" rel="noopener noreferrer">
          View
        </a>
      ),
    },
    { name: "Department", selector: (row) => row.department, sortable: true },
    {
      name: "Resume",
      cell: (row) => (
        <a href={`/${row.resume}`} download>
          Download
        </a>
      ),
    },
    { name: "Date", selector: (row) => row.date, sortable: true },
    { name: "Status", selector: (row) => row.status, sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <>
          <Button
            variant="success"
            size="sm"
            onClick={() => handleSelect(row.id)}
            className="me-2"
          >
            Select
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleReject(row.id)}
          >
            Reject
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="container mt-4">
      <h4>Selected Interview Candidates</h4>
      <Form.Control
        type="text"
        placeholder="Search by name, email, city, department..."
        className="mb-3"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />
      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        highlightOnHover
        striped
        responsive
      />
    </div>
  );
};

export default SelectedInterview;
