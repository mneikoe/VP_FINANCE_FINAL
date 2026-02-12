import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";

const FinancialProductMaster = () => {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);

  const BASE_URL = "http://localhost:5000/api/department-financial-products";

  // ======================
  // FETCH ALL
  // ======================
  const fetchProducts = async () => {
    try {
      const res = await axios.get(BASE_URL);
      setProducts(res.data.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ======================
  // CREATE / UPDATE
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await axios.put(`${BASE_URL}/${editId}`, { name });
      } else {
        await axios.post(BASE_URL, { name });
      }

      setName("");
      setEditId(null);
      fetchProducts();
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  // ======================
  // EDIT
  // ======================
  const handleEdit = (item) => {
    setName(item.name);
    setEditId(item._id);
  };

  // ======================
  // DELETE
  // ======================
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await axios.delete(`${BASE_URL}/${id}`);
        fetchProducts();
      } catch (error) {
        console.log(error.response?.data || error.message);
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* FORM */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5>{editId ? "Update" : "Add"} Department Product</h5>

              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  className="form-control mb-3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Name"
                  required
                />
                <button className="btn btn-primary w-100">
                  {editId ? "Update" : "Add"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* LIST */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5>Department Financial Product List</h5>

              <ul className="list-group">
                {products.length === 0 && (
                  <li className="list-group-item text-muted text-center">
                    No Products Found
                  </li>
                )}

                {products.map((item) => (
                  <li
                    key={item._id}
                    className="list-group-item d-flex justify-content-between"
                  >
                    {item.name}
                    <div>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdit(item)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(item._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialProductMaster;
