
import { useState, useRef } from "react";

function EmployerPostJob({ onBack }) {
  const initialFormData = {
    job_title: "",
    job_description: "",
    job_category: "",
    job_type: "Full Time",
    location: "",
    salary_min: "",
    salary_max: "",
    qualification: "",
    experience_required: "",
    skills_required: "",
    application_deadline: ""
  };

  const [formData, setFormData] = useState(initialFormData);
  const deadlineInputRef = useRef(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("employer_token");

      const response = await fetch(
        "http://127.0.0.1:5000/api/employer/jobs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formData,
            salary_min: formData.salary_min || null,
            salary_max: formData.salary_max || null,
            application_deadline: formData.application_deadline || null
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Job posted successfully!");
        setMessageType("success");
        setFormData(initialFormData);
      } else {
        setMessage(data.message || "Unable to post job.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Post Job Error:", error);
      setMessage("Unable to connect to the server.");
      setMessageType("error");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    marginTop: "8px",
    marginBottom: "20px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "14px",
    color: "#263746",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
    outlineColor: "#123b65",
    cursor: "pointer",
    position: "relative",
    zIndex: 1
  };

  const labelStyle = {
    display: "block",
    color: "#334155",
    fontWeight: "600",
    fontSize: "14px"
  };

  const buttonStyle = {
    width: "100%",
    padding: "13px",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer"
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f1f5f9",
      padding: "35px 20px",
      boxSizing: "border-box",
      position: "relative"
    }}>

      <button
        type="button"
        onClick={onBack}
        title="Back to Dashboard"
        aria-label="Back to Dashboard"
        style={{
          position: "absolute",
          top: "15px",
          left: "20px",
          width: "38px",
          height: "38px",
          border: "none",
          background: "transparent",
          color: "#123b65",
          fontSize: "32px",
          fontWeight: "bold",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        ←
      </button>

      <div style={{
        maxWidth: "850px",
        margin: "auto",
        backgroundColor: "#ffffff",
        padding: "35px",
        borderRadius: "12px",
        boxShadow: "0 3px 12px rgba(0,0,0,0.07)",
        border: "1px solid #dce3ec",
        boxSizing: "border-box"
      }}>

        <h2 style={{
          color: "#123b65",
          fontSize: "28px",
          textAlign: "center",
          marginBottom: "10px"
        }}>
          Post a Job
        </h2>

        <p style={{
          color: "#64748b",
          textAlign: "center",
          marginBottom: "30px",
          fontSize: "14px"
        }}>
          Enter the job details to create a new job opportunity.
        </p>

        <form onSubmit={handleSubmit}>

          <label style={labelStyle}>Job Title *</label>
          <input
            name="job_title"
            value={formData.job_title}
            onChange={handleChange}
            required
            placeholder="Enter job title"
            style={inputStyle}
          />

          <label style={labelStyle}>Job Description *</label>
          <textarea
            name="job_description"
            value={formData.job_description}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Describe the job responsibilities and requirements"
            style={{ ...inputStyle, resize: "vertical" }}
          />

          <label style={labelStyle}>Job Category *</label>
          <input
            name="job_category"
            value={formData.job_category}
            onChange={handleChange}
            required
            placeholder="Example: IT, Finance, Marketing"
            style={inputStyle}
          />

          <label style={labelStyle}>Job Type *</label>
          <select
            name="job_type"
            value={formData.job_type}
            onChange={handleChange}
            style={inputStyle}
          >
            <option>Full Time</option>
            <option>Part Time</option>
            <option>Internship</option>
            <option>Contract</option>
          </select>

          <label style={labelStyle}>Location *</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="Enter job location"
            style={inputStyle}
          />

          <h3 style={{
            color: "#123b65",
            fontSize: "19px",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "10px",
            marginBottom: "20px"
          }}>
            Salary Details
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px"
          }}>
            <div>
              <label style={labelStyle}>Minimum Salary</label>
              <input
                type="number"
                name="salary_min"
                value={formData.salary_min}
                onChange={handleChange}
                min="0"
                placeholder="Minimum salary"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Maximum Salary</label>
              <input
                type="number"
                name="salary_max"
                value={formData.salary_max}
                onChange={handleChange}
                min="0"
                placeholder="Maximum salary"
                style={inputStyle}
              />
            </div>
          </div>

          <h3 style={{
            color: "#123b65",
            fontSize: "19px",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "10px",
            marginBottom: "20px"
          }}>
            Candidate Requirements
          </h3>

          <label style={labelStyle}>Qualification</label>
          <input
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            placeholder="Required educational qualification"
            style={inputStyle}
          />

          <label style={labelStyle}>Experience Required</label>
          <input
            name="experience_required"
            value={formData.experience_required}
            onChange={handleChange}
            placeholder="Example: 0-2 years"
            style={inputStyle}
          />

          <label style={labelStyle}>Skills Required</label>
          <textarea
            name="skills_required"
            value={formData.skills_required}
            onChange={handleChange}
            rows="3"
            placeholder="Example: Python, SQL, Excel"
            style={{ ...inputStyle, resize: "vertical" }}
          />

          <h3 style={{
            color: "#123b65",
            fontSize: "19px",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "10px",
            marginBottom: "20px"
          }}>
            Application Details
          </h3>

          <label style={labelStyle}>Application Deadline</label>
          <input
            ref={deadlineInputRef}
            type="date"
            name="application_deadline"
            value={formData.application_deadline}
            onChange={handleChange}
            onClick={() => deadlineInputRef.current?.showPicker()}
            style={inputStyle}
          />

          <button
            type="submit"
            style={{
              ...buttonStyle,
              backgroundColor: "#123b65",
              color: "#ffffff",
              border: "none"
            }}
          >
            Submit Job
          </button>

        </form>

        {message && (
          <p style={{
            marginTop: "20px",
            padding: "13px",
            borderRadius: "6px",
            textAlign: "center",
            fontWeight: "600",
            backgroundColor:
              messageType === "error" ? "#fee2e2" : "#dcfce7",
            color:
              messageType === "error" ? "#b91c1c" : "#166534"
          }}>
            {message}
          </p>
        )}

      </div>
    </div>
  );
}

export default EmployerPostJob;
