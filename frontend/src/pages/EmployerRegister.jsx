
import { useState } from "react";

function EmployerRegister({ onBack }) {
  const [formData, setFormData] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    password: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/employer/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "Registration successful! Your account is waiting for admin approval."
        );

        setFormData({
          company_name: "",
          contact_person: "",
          email: "",
          phone: "",
          password: ""
        });
      } else {
        setMessage(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Employer Registration Error:", error);
      setMessage("Unable to connect to the server.");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <button
          type="button"
          onClick={onBack}
          style={backButtonStyle}
          title="Back to Home"
          aria-label="Back to Home"
        >
          ←
        </button>

        <h2 style={{ color: "#12345a", textAlign: "center" }}>
          Employer Registration
        </h2>

        <form onSubmit={handleRegister}>
          {[
            { name: "company_name", label: "Company Name", type: "text" },
            { name: "contact_person", label: "Contact Person", type: "text" },
            { name: "email", label: "Email", type: "email" },
            { name: "phone", label: "Phone", type: "tel" },
            { name: "password", label: "Password", type: "password" }
          ].map((field) => (
            <div key={field.name} style={{ marginBottom: "15px" }}>
              <label>{field.label}</label>

              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
          ))}

          <button type="submit" style={registerButtonStyle}>
            Register
          </button>
        </form>

        <p style={{ textAlign: "center" }}>{message}</p>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f4f7fb",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "30px"
};

const containerStyle = {
  position: "relative",
  background: "white",
  padding: "55px 35px 35px",
  width: "100%",
  maxWidth: "450px",
  borderRadius: "10px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
};

const backButtonStyle = {
  position: "absolute",
  top: "15px",
  left: "18px",
  width: "35px",
  height: "35px",
  background: "transparent",
  border: "none",
  color: "#12345a",
  fontSize: "30px",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const inputStyle = {
  width: "100%",
  padding: "11px",
  marginTop: "6px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  boxSizing: "border-box"
};

const registerButtonStyle = {
  width: "100%",
  background: "#12345a",
  color: "white",
  padding: "12px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

export default EmployerRegister;
