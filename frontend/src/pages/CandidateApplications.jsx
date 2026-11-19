
import { useEffect, useState } from "react";

function CandidateApplications({ onBack }) {
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("Loading applications...");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("candidate_token");

        const response = await fetch(
          "http://127.0.0.1:5000/api/candidate/applications",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (response.ok) {
          setApplications(data.applications || []);
          setMessage(
            data.applications?.length
              ? ""
              : "You haven't applied for any jobs yet."
          );
        } else {
          setMessage(data.message || "Unable to load applications.");
        }
      } catch (error) {
        console.error("Applications Error:", error);
        setMessage("Unable to connect to the server.");
      }
    };

    fetchApplications();
  }, []);

  const pageStyle = {
    minHeight: "100vh",
    padding: "35px 20px",
    backgroundColor: "#f1f5f9",
    color: "#172b4d",
    boxSizing: "border-box",
    position: "relative"
  };

  const cardStyle = {
    backgroundColor: "#ffffff",
    border: "1px solid #dce3ec",
    padding: "25px",
    margin: "18px auto",
    borderRadius: "12px",
    maxWidth: "950px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.07)",
    textAlign: "center",
    color: "#263746"
  };

  return (
    <div style={pageStyle}>

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

      <div style={{ maxWidth: "1100px", margin: "auto" }}>

        <h2
          style={{
            color: "#123b65",
            fontSize: "30px",
            textAlign: "center",
            marginBottom: "25px",
            fontWeight: "700"
          }}
        >
          My Applications
        </h2>

        {message && (
          <p style={{
            textAlign: "center",
            color: "#475569",
            fontSize: "17px"
          }}>
            {message}
          </p>
        )}

        {applications.map((application) => (
          <div
            key={application.application_id}
            style={cardStyle}
          >
            <h3 style={{
              color: "#123b65",
              fontSize: "23px",
              marginBottom: "12px"
            }}>
              {application.job_title}
            </h3>

            <p>Company: {application.company_name}</p>
            <p>Category: {application.job_category}</p>
            <p>Location: {application.location}</p>
            <p>Job Type: {application.job_type}</p>

            <p style={{ marginTop: "12px" }}>
              Application Status:{" "}
              <strong style={{
                color: "#087443",
                backgroundColor: "#e1f5e9",
                padding: "5px 10px",
                borderRadius: "5px"
              }}>
                {application.application_status}
              </strong>
            </p>

            <p style={{ marginTop: "12px" }}>
              Applied On:{" "}
              {application.applied_at
                ? new Date(application.applied_at).toLocaleDateString()
                : "Not available"}
            </p>
          </div>
        ))}

      </div>
    </div>
  );
}

export default CandidateApplications;
