import React, { useEffect, useState } from "react";
import { Table, Container, Pagination } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import {
  deleteCompanyName,
  fetchCompanyName,
} from "../../../redux/feature/ComapnyName/CompanyThunx";
import { BsPencilSquare, BsTrash } from "react-icons/bs";
function CompanyDetail({ setActiveTab, setEditId }) {
  const dispatch = useDispatch();
  const companyState = useSelector((state) => state.CompanyName);
  console.log(companyState, "Redux State");

  // Extract companies from CompanyNames array
  const companies = companyState.CompanyNames || [];
  const { loading, error } = companyState;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    dispatch(fetchCompanyName());
  }, [dispatch]);

  // Calculate total pages
  const totalPages = Math.ceil(companies.length / itemsPerPage);

  // Get current page companies
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCompanies = companies.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const handleUpdate = (id) => {
    setEditId(id);
    setActiveTab("add");
    // Add your update logic here, e.g., open modal or navigate to update form
  };

  const handleDelete = (companyId) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      dispatch(deleteCompanyName(companyId));
      // Add your delete logic here, e.g., dispatch redux action to delete company
    }
  };

  // Handle page change
  const goToPage = (page) => {
    if (page < 1) page = 1;
    else if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  if (loading) return <p>Loading companies...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!companies.length) return <p>No company data available.</p>;

  return (
    <Container className="mt-4">
      <h3 className="mb-4">Company Details</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Company Name</th>
            <th>Financial Product</th>
            <th>Local Office Address</th>
            <th>Contact No</th>
            <th>Email ID</th>
            <th>Website</th>
            <th>Relationship Manager</th>
            <th>Agency Code</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentCompanies.map((company) => (
            <tr key={company._id}>
              <td>{company.companyName}</td>
              <td>{company.financialProduct?.name || "N/A"}</td>
              <td>{company.localOfficeAddress}</td>
              <td>{company.contactNo}</td>
              <td>{company.emailId}</td>
              <td>{company.website}</td>
              <td>{company.relationshipManagerName}</td>
              <td>{company.agencyCode}</td>
              <td>
                <BsPencilSquare
                  style={{
                    cursor: "pointer",
                    marginRight: "10px",
                    color: "blue",
                  }}
                  onClick={() => handleUpdate(company._id)}
                  title="Update"
                  size={20}
                />
                <BsTrash
                  style={{ cursor: "pointer", color: "red" }}
                  onClick={() => handleDelete(company._id)}
                  title="Delete"
                  size={20}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination>
        <Pagination.Prev
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        />

        {[...Array(totalPages)].map((_, idx) => {
          const page = idx + 1;
          return (
            <Pagination.Item
              key={page}
              active={page === currentPage}
              onClick={() => goToPage(page)}
            >
              {page}
            </Pagination.Item>
          );
        })}

        <Pagination.Next
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    </Container>
  );
}

export default CompanyDetail;
