import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { fetchCompanyNames } from
  "../../../redux/feature/FormCompany/FormCompanyThunx";

import {
  fetchServicingFormsByKind,
  createServicingForm,
  updateServicingForm,
  deleteServicingForm,
} from "../../../redux/feature/ServicingForms/servicingFormsThunk";

const BASE_URL = import.meta.env.VITE_API_URL;
const KIND_OF_FORM = "life insurance"; // 🔒 FIXED

const ServicingLife = () => {
  const dispatch = useDispatch();

  const { forms = [], loading = false } = useSelector(
    (state) => state.servicingForms || {}
  );

  const { companies = [] } = useSelector(
    (state) => state.formCompany || {}
  );

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [existingFile, setExistingFile] = useState(null);

  const [formData, setFormData] = useState({
    companyName: "",
    formType: "",
    formName: "",
    file: null,
  });

  /* ===== FETCH COMPANIES ===== */
  useEffect(() => {
    dispatch(fetchCompanyNames());
  }, [dispatch]);

  /* ===== FETCH SERVICING Life FORMS ===== */
  useEffect(() => {
    dispatch(fetchServicingFormsByKind(KIND_OF_FORM));
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleEdit = (form) => {
    setFormData({
      companyName: form.companyName,
      formType: form.formType,
      formName: form.formName,
      file: null,
    });
    setExistingFile(form.file);
    setEditId(form._id);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!formData.companyName || !formData.formType || !formData.formName) {
      toast.error("All fields are required");
      return;
    }

    const fd = new FormData();
    fd.append("companyName", formData.companyName);
    fd.append("formType", formData.formType);
    fd.append("formName", formData.formName);
    fd.append("kindOfForm", KIND_OF_FORM);

    if (formData.file) fd.append("file", formData.file);

    try {
      if (editId) {
        await dispatch(
          updateServicingForm({ id: editId, formData: fd })
        ).unwrap();
        toast.success("Form updated successfully");
      } else {
        await dispatch(createServicingForm(fd)).unwrap();
        toast.success("Form created successfully");
      }

      dispatch(fetchServicingFormsByKind(KIND_OF_FORM));
      setOpen(false);
      setEditId(null);
      setExistingFile(null);
      setFormData({
        companyName: "",
        formType: "",
        formName: "",
        file: null,
      });
    } catch (err) {
      toast.error(err || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this form?")) return;

    try {
      await dispatch(deleteServicingForm(id)).unwrap();
      toast.success("Form deleted");
      dispatch(fetchServicingFormsByKind(KIND_OF_FORM));
    } catch (err) {
      toast.error(err || "Delete failed");
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex navbar mb-6 border-b border-gray-300">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setOpen(true)}
        >
          + Add Life Insurance Form
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] p-4 rounded">
            <h2 className="text-lg font-semibold mb-3">
              Servicing Life Form
            </h2>

            {/* COMPANY DROPDOWN */}
            <select
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded mb-3"
            >
              <option value="">Select Company</option>
              {companies.map((c) => (
                <option key={c._id} value={c.companyName}>
                  {c.companyName}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="formType"
              placeholder="Form Type"
              value={formData.formType}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded mb-3"
            />

            <input
              type="text"
              name="formName"
              placeholder="Form Name"
              value={formData.formName}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded mb-3"
            />

            {existingFile && (
              <p className="text-sm mb-2">
                Current file:
                <a
                  href={`${BASE_URL}${existingFile.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 ml-1"
                >
                  View
                </a>
              </p>
            )}

            <input
              type="file"
              name="file"
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 border rounded"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Company</th>
            <th className="border px-2 py-1">Type</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1 text-center">File</th>
            <th className="border px-2 py-1 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="text-center">Loading...</td>
            </tr>
          ) : forms.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">No forms</td>
            </tr>
          ) : (
            forms.map((f) => (
              <tr key={f._id}>
                <td className="border px-2 py-1">{f.companyName}</td>
                <td className="border px-2 py-1">{f.formType}</td>
                <td className="border px-2 py-1">{f.formName}</td>
                <td className="border px-2 py-1 text-center">
                  {f.file?.url && (
                    <a
                      href={`${BASE_URL}${f.file.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600"
                    >
                      View
                    </a>
                  )}
                </td>
                <td className="flex border items-center justify-center px-2 py-1 text-center gap-2">
                  <button
                    className="text-blue-600 px-2 py-1 border bg-blue-100 rounded"
                    onClick={() => handleEdit(f)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 px-2 py-1 border bg-red-100 rounded"
                    onClick={() => handleDelete(f._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ServicingLife;
