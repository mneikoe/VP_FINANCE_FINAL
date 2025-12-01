import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Spinner } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { deleteSuspectById, getAllSuspects, updateSuspectStatus} from "../../../redux/feature/SuspectRedux/SuspectThunx";
import { useNavigate } from "react-router-dom";
import { Dropdown, ButtonGroup } from "react-bootstrap";

function DisplaySuspect() {
  const dispatch = useDispatch();
  const { suspects = [], loading, error } = useSelector((state) => state.suspect);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    dispatch(getAllSuspects());
  }, [dispatch]);

  useEffect(() => {
    const sortedSuspects = [...(suspects || [])].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const mappedData = sortedSuspects.map((suspect) => {
      const personal = suspect.personalDetails || {};

      return {
        id: suspect._id,
        groupCode: personal.groupCode || "-",
        grade: personal.grade || "-",
        groupName: personal.groupName || "-",
        name: personal.name || "-",
        gender: personal.gender || "-",
        mobile: personal.mobileNo ? `Mobile: ${personal.mobileNo}` : "",
        contactNo: personal.contactNo ? `Contact: ${personal.contactNo}` : "",
        leadSource: personal.leadSource || "-",
        leadName: personal.leadName || "-",
        area: personal.preferredMeetingArea || "-",
        callingPurpose: personal.callingPurpose || "-",
        createdAt: suspect.createdAt || new Date().toISOString(),
      };
    });

    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      const filtered = mappedData.filter((item) => {
        const mobileString = item.mobile ? item.mobile.toString() : "";
        const contactString = item.contactNo ? item.contactNo.toString() : "";
        return (
          (item.groupCode && item.groupCode.toLowerCase().includes(lowerCaseSearch)) ||
          (item.grade && item.grade.toString().toLowerCase().includes(lowerCaseSearch)) ||
          (item.groupName && item.groupName.toLowerCase().includes(lowerCaseSearch)) ||
          (item.name && item.name.toLowerCase().includes(lowerCaseSearch)) ||
          mobileString.toLowerCase().includes(lowerCaseSearch) ||
          contactString.toLowerCase().includes(lowerCaseSearch) ||
          (item.leadSource && item.leadSource.toLowerCase().includes(lowerCaseSearch)) ||
          (item.leadName && item.leadName.toLowerCase().includes(lowerCaseSearch))
        );
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(mappedData);
    }
  }, [suspects, searchText]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this suspect?")) {
      try {
        await dispatch(deleteSuspectById(id)).unwrap();
        toast.success("Suspect deleted successfully");
        dispatch(getAllSuspects());
      } catch (err) {
        toast.error(err || "Failed to delete suspect");
      }
    }
  };

  const handleEdit = (suspect) => {
    navigate(`/suspect/edit/${suspect.id}`);
  };

  const handleView = (id) => {
    navigate(`/suspect/detail/${id}`);
  };

  const handleConvertStatus = (id, status) => {
    dispatch(updateSuspectStatus({ id, status }))
      .unwrap()
      .then(() => {
        toast.success("Suspect status updated successfully");
        dispatch(getAllSuspects());
      })
      .catch((err) => {
        toast.error(err || "Failed to update suspect status");
      });
  };

  const columns = [
    {
      name: "#",
      cell: (row, index) => index + 1,
      sortable: false,
      width: "60px",
    },
    { 
      name: "Group Code", 
      selector: (row) => row.groupCode, 
      sortable: false,
      width: "120px"
    },
    { 
      name: "Grade", 
      selector: (row) => row.grade, 
      sortable: false,
      width: "80px",
      center: true
    },
    { 
      name: "Group Head", 
      selector: (row) => row.groupName, 
      sortable: false,
      width: "150px"
    },
    { 
      name: "Name", 
      selector: (row) => row.name, 
      sortable: false,
      width: "150px"
    },
    { 
      name: "Gender", 
      selector: (row) => row.gender, 
      sortable: false,
      width: "100px"
    },
    { 
      name: "Contact Numbers", 
      cell: (row) => (
        <div style={{ whiteSpace: "pre-line", lineHeight: "1.4" }}>
          {row.mobile && <div>{row.mobile}</div>}
          {row.contactNo && <div>{row.contactNo}</div>}
          {!row.mobile && !row.contactNo && "-"}
        </div>
      ),
      sortable: false,
      width: "180px"
    },
    { 
      name: "Lead Source", 
      selector: (row) => row.leadSource, 
      sortable: false,
      width: "150px"
    },
    { 
      name: "Lead Name", 
      selector: (row) => row.leadName, 
      sortable: false,
      width: "150px"
    },
    { 
      name: "Area", 
      selector: (row) => row.area, 
      sortable: false,
      width: "150px"
    },
    { 
      name: "Calling Purpose", 
      selector: (row) => row.callingPurpose, 
      sortable: false,
      width: "150px"
    },
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
       <Dropdown as={ButtonGroup}>
          <Dropdown.Toggle variant="primary" size="sm" className="text-nowrap">
            Convert Status
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleConvertStatus(row.id, "client")}>
              Client
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleConvertStatus(row.id, "prospect")}>
              Prospect
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ),
      ignoreRowClick: true,
      width: "140px",
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
      <h3>Suspect List</h3>
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
                placeholder="Search by Group Code, Grade, Group Name, Name, Contact No, Lead Source, or Lead Name..."
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
                fontSize: "14px",
              },
            },
            cells: {
              style: {
                padding: "8px",
                verticalAlign: "middle",
                fontSize: "13px",
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default DisplaySuspect;