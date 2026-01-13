import React, { useState, useEffect, useMemo } from "react";
import { Button, Spinner, Card } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  UserOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axiosInstance from "../../config/axios";
import { Modal, message, Tag } from "antd";

function ProspectAppointmentList() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/prospect/all");

      if (response.data && response.data.success) {
        const prospectsData = response.data.prospects || [];


        const processedProspects = prospectsData.map((prospect, index) => {
          const personalDetails = prospect.personalDetails || {};

          return {
            id: prospect._id || index,
            sn: index + 1,
            groupCode: personalDetails.groupCode || "-",
            groupName: personalDetails.groupName || "-",
            name: personalDetails.name || "-",
            gender: personalDetails.gender || "-",
            mobile: personalDetails.mobileNo || "-",
            whatsapp: personalDetails.whatsappNo || "-",
            contact: personalDetails.contactNo || "-",
            email: personalDetails.emailId || "-",
            organisation: personalDetails.organisation || "-",
            designation: personalDetails.designation || "-",
            annualIncome: personalDetails.annualIncome || "-",
            grade: personalDetails.grade || "-",
            city: personalDetails.city || "-",
            preferredMeetingArea: personalDetails.preferredMeetingArea || "-",
            resiAddr: personalDetails.resiAddr || "-",
            officeAddr: personalDetails.officeAddr || "-",
            leadSource: personalDetails.leadSource || "-",
            leadName: personalDetails.leadName || "-",
            leadOccupation: personalDetails.leadOccupation || "-",
            leadOccupationType: personalDetails.leadOccupationType || "-",
            callingPurpose: personalDetails.callingPurpose || "-",
            allocatedCRE: personalDetails.allocatedCRE || "-",
            allocatedRM: personalDetails.allocatedRM || "-",
            adharNumber: personalDetails.adharNumber || "-",
            panCardNumber: personalDetails.panCardNumber || "-",
            hobbies: personalDetails.hobbies || "-",
            nativePlace: personalDetails.nativePlace || "-",
            habits: personalDetails.habits || "-",
            socialLink: personalDetails.socialLink || "-",
            bestTime: personalDetails.bestTime || "-",
            time: personalDetails.time || "-",
            remark: personalDetails.remark || "-",
            createdAt: prospect.createdAt
              ? dayjs(prospect.createdAt).format("DD/MM/YYYY")
              : "-",
            rawData: prospect,
          };
        });

        setProspects(processedProspects);
        setFilteredData(processedProspects);
      } else {
        message.error(response.data?.message || "Failed to fetch prospects");
        setProspects([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error("Error fetching prospects:", error);
      message.error(
        error.response?.data?.message ||
        error.message ||
        "Error loading prospects."
      );
      setProspects([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchText) {
      setFilteredData(prospects);
      return;
    }

    const lowerCaseSearch = searchText.toLowerCase();
    const filtered = prospects.filter((item) => {
      const searchableFields = [
        item.groupCode,
        item.groupName,
        item.name,
        item.mobile,
        item.whatsapp,
        item.contact,
        item.email,
        item.organisation,
        item.designation,
        item.city,
        item.leadSource,
        item.leadName,
        item.callingPurpose,
        item.allocatedCRE,
      ]
        .filter(Boolean)
        .map((field) => field.toString().toLowerCase());

      return searchableFields.some((field) => field.includes(lowerCaseSearch));
    });
    setFilteredData(filtered);
  }, [searchText, prospects]);

  const handleDelete = (prospect) => {
    if (window.confirm(`Are you sure you want to delete ${prospect.name}?`)) {
      axiosInstance
        .delete(`/api/prospect/delete/${prospect.id}`)
        .then(() => {
          message.success("Prospect deleted successfully");
          fetchProspects();
        })
        .catch((error) => {
          message.error("Failed to delete prospect");
        });
    }
  };

  const handleEdit = (prospect) => {
    navigate(`/prospect/edit/${prospect.id}`);
  };

  const handleView = (id) => {
    navigate(`/prospect/detail/${id}`);
  };

  const handleConvertToClient = (prospect) => {
    if (window.confirm(`Convert ${prospect.name} to Client?`)) {
      axiosInstance
        .put(`/api/prospect/convert/${prospect.id}`, {
          status: "client",
        })
        .then(() => {
          message.success("Converted to Client successfully");
          fetchProspects();
        })
        .catch((error) => {
          message.error("Failed to convert");
        });
    }
  };

  const columns = [
    {
      name: "#",
      cell: (row) => row.sn,
      sortable: true,
      width: "60px",
      center: true,
    },
    {
      name: "Group Code",
      selector: (row) => row.groupCode,
      sortable: true,
      cell: (row) => (
        <span style={{ fontWeight: "bold", color: "#1890ff" }}>
          {row.groupCode}
        </span>
      ),
      width: "120px",
    },
    {
      name: "Group Head",
      selector: (row) => row.groupName,
      sortable: true,
      width: "150px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.name}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>{row.gender}</div>
        </div>
      ),
      width: "150px",
    },
    {
      name: "Contact",
      selector: (row) => row.mobile,
      sortable: true,
      cell: (row) => (
        <div>
          <div>
            <PhoneOutlined style={{ marginRight: 5 }} />
            {row.mobile}
          </div>
          {row.whatsapp !== "-" && (
            <div style={{ fontSize: "12px", color: "#666" }}>
              WA: {row.whatsapp}
            </div>
          )}
        </div>
      ),
      width: "150px",
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      cell: (row) => (
        <div>
          <MailOutlined style={{ marginRight: 5 }} />
          {row.email}
        </div>
      ),
      width: "200px",
    },
    {
      name: "Organisation",
      selector: (row) => row.organisation,
      sortable: true,
      width: "150px",
    },
    {
      name: "Designation",
      selector: (row) => row.designation,
      sortable: true,
      width: "120px",
    },
    {
      name: "Annual Income",
      selector: (row) => row.annualIncome,
      sortable: true,
      cell: (row) => (
        <div>
          <div>{row.annualIncome}</div>
          <span
            style={{
              fontSize: "12px",
              backgroundColor: "#52c41a",
              color: "white",
              padding: "2px 8px",
              borderRadius: "4px",
            }}
          >
            Grade: {row.grade}
          </span>
        </div>
      ),
      width: "150px",
    },
    {
      name: "Location",
      selector: (row) => row.city,
      sortable: true,
      cell: (row) => (
        <div>
          <EnvironmentOutlined style={{ marginRight: 5 }} />
          {row.city}
          {row.preferredMeetingArea !== "-" && (
            <div style={{ fontSize: "12px", color: "#666" }}>
              Area: {row.preferredMeetingArea}
            </div>
          )}
        </div>
      ),
      width: "150px",
    },
    {
      name: "Lead Source",
      selector: (row) => row.leadSource,
      sortable: true,
      cell: (row) => (
        <div>
          <div>{row.leadSource}</div>
          {row.leadName !== "-" && (
            <div style={{ fontSize: "12px", color: "#666" }}>
              {row.leadName}
            </div>
          )}
        </div>
      ),
      width: "150px",
    },
    {
      name: "Allocated CRE",
      selector: (row) => row.allocatedCRE,
      sortable: true,
      width: "120px",
    },
    {
      name: "Created At",
      selector: (row) => row.createdAt,
      sortable: true,
      width: "120px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex flex-wrap gap-1">
          <Button
            variant="info"
            size="sm"
            onClick={() => handleView(row.id)}
            className="text-nowrap"
            style={{
              backgroundColor: "#1890ff",
              borderColor: "#1890ff",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <EyeOutlined /> View
          </Button>
          <Button
            variant="warning"
            size="sm"
            onClick={() => handleEdit(row)}
            className="text-nowrap"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <EditOutlined /> Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(row)}
            className="text-nowrap"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <DeleteOutlined /> Delete
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
          onClick={() => handleConvertToClient(row)}
          className="text-nowrap"
          style={{
            backgroundColor: "#52c41a",
            borderColor: "#52c41a",
            fontWeight: "bold",
          }}
        >
          To Client
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

  return (
    <div className="w-100 p-2 mt-4">
      <div className="d-flex align-items-center mb-3">
        <UserOutlined
          style={{ fontSize: "24px", color: "#1890ff", marginRight: "10px" }}
        />
        <h3 style={{ margin: 0 }}>Prospects List</h3>
        <span
          style={{
            marginLeft: "15px",
            backgroundColor: "#52c41a",
            color: "white",
            padding: "4px 12px",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {filteredData.length} Prospects
        </span>
        <div className="ms-auto">
          <Button
            variant="primary"
            onClick={fetchProspects}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {loading ? <Spinner size="sm" /> : "Refresh"}
          </Button>
        </div>
      </div>

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
              <div className="input-group" style={{ maxWidth: "600px" }}>
                <span className="input-group-text">
                  <SearchOutlined />
                </span>
                <input
                  type="text"
                  placeholder="Search prospects by name, mobile, email, organisation, etc..."
                  className="form-control"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
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
                padding: "12px",
                verticalAlign: "middle",
                fontSize: "14px",
              },
            },
            rows: {
              style: {
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default ProspectAppointmentList;
