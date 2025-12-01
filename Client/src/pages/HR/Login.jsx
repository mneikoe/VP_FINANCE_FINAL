import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";



import { loginHR } from "../../redux/feature/HR/HRthunx";

export default function LoginHR() {
  const dispatch = useDispatch();
  const { loading, error, token } = useSelector((state) => state.HR);

  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch( loginHR(formData));
  };

  return (
    <div className="container">
      <form className="card" onSubmit={handleSubmit}>
        <h2>HR Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {token && <p style={{ color: "green" }}>Login successful ✅</p>}
      </form>

      <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #eef2ff;
        }
        .card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0px 4px 12px rgba(0,0,0,0.1);
          width: 320px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        h2 {
          text-align: center;
          color: #111827;
        }
        input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }
        input:focus {
          outline: none;
          border-color: #4f46e5;
        }
        button {
          background: #4f46e5;
          color: white;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: 0.3s;
        }
        button:hover {
          background: #3730a3;
        }
      `}</style>
    </div>
  );
}
