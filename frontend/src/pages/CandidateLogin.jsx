
import { useState } from "react";

function CandidateLogin({ onBack, onRegister, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (data.access_token) {
          localStorage.setItem("candidate_token", data.access_token);
        }

        setMessage(data.message || "Login successful!");
        onLoginSuccess();
      } else {
        setMessage(data.message || "Login failed.");
      }
    } catch {
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
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

      <h2 style={{ textAlign: "center", color: "#12345a" }}>
        Candidate Login
      </h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {message && (
        <p style={{ textAlign: "center", marginTop: "15px" }}>
          {message}
        </p>
      )}

      <p style={{ textAlign: "center" }}>
        Don't have an account?{" "}
        <button onClick={onRegister}>Register</button>
      </p>
    </div>
  );
}

const containerStyle = {
  position: "relative",
  maxWidth: "450px",
  margin: "50px auto",
  padding: "30px",
  paddingTop: "55px",
  background: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#12345a",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
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
  justifyContent: "center",
};

export default CandidateLogin;
