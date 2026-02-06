import axios from "../../../config/axios";

// GET forms by kindOfForm
export const getServicingFormsByKind = (kindOfForm) => {
  return axios.get(
    `/api/servicing-forms/kind/${encodeURIComponent(kindOfForm)}`
  );
};

// CREATE form
export const createServicingFormApi = (formData) => {
  return axios.post("/api/servicing-forms", formData);
};

// UPDATE form
export const updateServicingFormApi = (id, formData) => {
  return axios.put(`/api/servicing-forms/${id}`, formData);
};

// DELETE form
export const deleteServicingFormApi = (id) => {
  return axios.delete(`/api/servicing-forms/${id}`);
};
