

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Spinner } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { deleteClientById, getAllClients, updateCleintStatus } from "../../../redux/feature/ClientRedux/ClientThunx";
import { useNavigate } from "react-router-dom";

function DisplayClient() {
  const dispatch = useDispatch();
  const { clients = [], loading, error } = useSelector((state) => state.client);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    dispatch(getAllClients());
  }, [dispatch]);

  useEffect(() => {
    // Safety check for clients array
    if (!clients || !Array.isArray(clients)) {
      setFilteredData([]);
      return;
    }

    const sortedClients = [...clients].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const mappedData = sortedClients.map((client) => {
      const personal = client.personalDetails || {};
      const contact = client.contactInfo || {};

      return {
        id: client._id,
        groupCode: personal.groupCode || "-",
        paName: contact.paName || "-",
        name: `${personal.salutation || ""} ${
          personal.groupName || personal.name || ""
        }`.trim(),
        mobile: personal.contactNo || contact.mobileNo || "",
        email: personal.emailId || personal.email || "",
        meetingArea: personal.preferredMeetingArea || "",
        meetinAdd: personal.preferredMeetingAddr || "",
        city: personal.city || "-",
        createdAt: client.createdAt || new Date().toISOString(),
      };
    });

    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      const filtered = mappedData.filter((item) => {
        const mobileString = item.mobile ? item.mobile.toString() : "";
        return (
          (item.groupCode && item.groupCode.toLowerCase().includes(lowerCaseSearch)) ||
          (item.paName && item.paName.toLowerCase().includes(lowerCaseSearch)) ||
          mobileString.includes(searchText) ||
          (item.name && item.name.toLowerCase().includes(lowerCaseSearch))
        );
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(mappedData);
    }
  }, [clients, searchText]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await dispatch(deleteClientById(id)).unwrap();
        toast.success("Client deleted successfully");
        dispatch(getAllClients());
      } catch (err) {
        toast.error(err || "Failed to delete client");
      }
    }
  };

  const handleEdit = (client) => {
    navigate(`/client/edit/${client.id}`);
  };

  const handleView = (id) => {
    navigate(`/client/detail/${id}`);
  };

  const handleConvertStatus = (id, status) => {
    dispatch(updateCleintStatus({ id, status }))
      .unwrap()
      .then(() => {
        toast.success("Client status updated successfully");
        dispatch(getAllClients());
      })
      .catch((err) => {
        toast.error(err || "Failed to update client status");
      });
  };

  const columns = [
    {
      name: "#",
      cell: (row, index) => index + 1,
      sortable: true,
      width: "60px",
    },
    { name: "Group Code", selector: (row) => row.groupCode, sortable: true },
    { name: "Group Head", selector: (row) => row.name, sortable: true },
    { name: "Address", selector: (row) => row.meetinAdd, sortable: true },
    { name: "Contact No", selector: (row) => row.mobile, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "Area", selector: (row) => row.meetingArea, sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex flex-wrap gap-1">
          <Button
            variant="warning"
            size="sm"
            onClick={() => handleEdit(row)}
            className="text-nowrap"
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(row.id)}
            className="text-nowrap"
          >
            Delete
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={() => handleView(row.id)}
            className="text-nowrap"
          >
            View
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      width: "220px",
    },
    {
      name: "Convert",
      cell: (row) => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleConvertStatus(row.id, "prospect")}
          className="text-nowrap"
        >
          To Prospect
        </Button>
      ),
      ignoreRowClick: true,
      width: "120px",
    },
  ];

  if (loading)
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" />
      </div>
    );

  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="w-100 p-2 mt-4">
      <h3>Client List</h3>
      <div className="card shadow-sm">
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          defaultSortFieldId="createdAt"
          defaultSortAsc={false}
          highlightOnHover
          responsive
          striped
          bordered
          fixedHeader
          fixedHeaderScrollHeight="600px"
          progressPending={loading}
          progressComponent={
            <div className="py-5">
              <Spinner animation="border" />
            </div>
          }
          subHeader
          subHeaderComponent={
            <div className="w-100 d-flex justify-content-between">
              <input
                type="text"
                placeholder="Search by Group Code, PA Name, Contact No, or Name..."
                className="form-control"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <div className="ms-2">
                <Button
                  variant="secondary"
                  onClick={() => setSearchText("")}
                  disabled={!searchText}
                >
                  Clear
                </Button>
              </div>
            </div>
          }
          customStyles={{
            headCells: {
              style: {
                backgroundColor: "#f8f9fa",
                fontWeight: "bold",
              },
            },
            cells: {
              style: {
                padding: "8px",
                verticalAlign: "middle",
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default DisplayClient;





