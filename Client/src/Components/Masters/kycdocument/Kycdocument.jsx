import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createKycDocument,
  deleteKycDocument,
  fetchKycDocuments,
  updateKycDocument,
} from "../../../redux/feature/kycdocument/documentthunx";
function Kycdocument() {
  const [docName, setDocName] = useState("");
  const [editId, setEditId] = useState(null);
  const dispatch = useDispatch();
  const { documents, loading, error } = useSelector((state) => state.kycdoc);

  useEffect(() => {
    dispatch(fetchKycDocuments());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const typeName = docName.trim();
    if (!typeName) return;
    if (editId) {
      dispatch(updateKycDocument({ id: editId, updatedData: { name: typeName } }));
      setEditId(null);
    } else {
      dispatch(createKycDocument({ name: typeName }));
    }
    setDocName("");
  };

  const handleEdit = (doc) => {
    setDocName(doc.name);
    setEditId(doc._id);
  };

  const handleDelete = (id) => {
    dispatch(deleteKycDocument(id));
    if (editId === id) {
      setEditId(null);
      setDocName("");
    }
  };

  return (
    <div className="form-container">
      <h2>Document Type Master</h2>
      <p className="helper">Document names ka master alag page me manage hoga.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={docName}
          onChange={(e) => setDocName(e.target.value)}
          placeholder="Enter document type"
          required
        />
        <button type="submit">{editId ? "Update Type" : "Add Type"}</button>
      </form>

      <div className="list-container">
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        <ul>
          {documents.map((doc) => (
            <li key={doc._id}>
              <div>
                <strong>{doc.name}</strong>
                <p className="count">{(doc.documentNames || []).length} names linked</p>
              </div>
              <div>
                <button onClick={() => handleEdit(doc)}>Edit</button>
                <button onClick={() => handleDelete(doc._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        .form-container {
          max-width: 560px;
          margin: 30px auto;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 10px;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        }
        h2 {
          text-align: center;
          color: #333;
          margin-bottom: 4px;
        }
        .helper {
          text-align: center;
          color: #666;
          font-size: 13px;
          margin-bottom: 14px;
        }
        form {
          display: flex;
          gap: 10px;
        }
        input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 14px;
        }
        button {
          padding: 8px 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.3s;
        }
        button:hover {
          background: #0056b3;
        }
        .list-container {
          margin-top: 20px;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          padding: 10px;
          background: #fff;
          border: 1px solid #ddd;
          margin-bottom: 10px;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .count {
          margin: 4px 0 0;
          color: #666;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}

export default Kycdocument;
