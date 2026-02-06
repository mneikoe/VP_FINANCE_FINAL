import axios from "../../../config/axios";

// GET forms by kindOfForm
export const getMarketingFormsByKind = (kindOfForm) => {
  return axios.get(`/api/marketing-forms/kind/${kindOfForm}`);
};

// CREATE form
export const createMarketingFormApi = (formData) => {
  return axios.post("/api/marketing-forms", formData);
};

// UPDATE form
export const updateMarketingFormApi = (id, formData) => {
  return axios.put(`/api/marketing-forms/${id}`, formData);
};

// DELETE form
export const deleteMarketingFormApi = (id) => {
  return axios.delete(`/api/marketing-forms/${id}`);
};
