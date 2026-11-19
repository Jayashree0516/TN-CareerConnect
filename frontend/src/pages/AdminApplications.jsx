
import { useEffect, useState } from "react";

function AdminApplications({ onBack }) {
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("Loading applications...");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("admin_token");

      const response = await fetch(
        "http://127.0.0.1:5000/api/admin/applications",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to load applications.");
        return;
      }

      setApplications(data.applications || []);
      setMessage(
        data.applications?.length
          ? ""
          : "No applications found."
      );
    } catch (error) {
      console.error("Applications Error:", error);
      setMessage("Unable to connect to the server.");
    }
  };

  useEffect(() => {
    const loadApplications = async () => {
      await fetchApplications();
    };

    loadApplications();
  }, []);

  const updateStatus = async (applicationId, newStatus) => {
    try {
      setUpdatingId(applicationId);
      setMessage("");

      const token = localStorage.getItem("admin_token");

      const response = await fetch(
        `http://127.0.0.1:5000/api/admin/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            application_status: newStatus
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to update application status.");
        return;
      }

      setApplications((previousApplications) =>
        previousApplications.map((application) =>
          application.application_id === applicationId
            ? { ...application, application_status: newStatus }
            : application
        )
      );

      setMessage("Application status updated successfully.");
    } catch (error) {
      console.error("Application Status Error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Selected" || status === "Shortlisted") {
      return {
        backgroundColor: "#dcfce7",
        color: "#166534"
      };
    }

    if (status === "Rejected") {
      return {
        backgroundColor: "#fee2e2",
        color: "#b91c1c"
      };
    }

    if (status === "Under Review") {
      return {
        backgroundColor: "#dbeafe",
        color: "#1d4ed8"
      };
    }

    return {
      backgroundColor: "#fef3c7",
      color: "#92400e"
    };
  };

  const detailStyle = {
    color: "#475569",
    fontSize: "14px",
    lineHeight: "1.7",
    margin: "8px 0"
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
        maxWidth: "1100px",
        margin: "auto"
      }}>

        <h2 style={{
          color: "#123b65",
          fontSize: "27px",
          marginBottom: "8px"
        }}>
          Manage Applications
        </h2>

        <p style={{
          color: "#64748b",
          fontSize: "14px",
          marginBottom: "25px"
        }}>
          Review candidate applications and manage their application status.
        </p>

        {message && (
          <div style={{
            padding: "13px 16px",
            marginBottom: "20px",
            borderRadius: "7px",
            backgroundColor:
              message.includes("Unable")
                ? "#fee2e2"
                : message.includes("successfully")
                  ? "#dcfce7"
                  : "#e2e8f0",
            color:
              message.includes("Unable")
                ? "#b91c1c"
                : message.includes("successfully")
                  ? "#166534"
                  : "#475569",
            fontSize: "14px",
            fontWeight: "500"
          }}>
            {message}
          </div>
        )}

        {applications.map((application) => {
          const applicationId = application.application_id;
          const currentStatus = application.application_status || "Applied";

          return (
            <div
              key={applicationId}
              style={{
                backgroundColor: "#ffffff",
                padding: "24px",
                marginBottom: "18px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 3px 10px rgba(0,0,0,0.05)"
              }}
            >

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "18px"
              }}>
                <h3 style={{
                  color: "#123b65",
                  fontSize: "20px",
                  margin: 0
                }}>
                  {application.job_title || "Job title not available"}
                </h3>

                <span style={{
                  ...getStatusStyle(currentStatus),
                  padding: "6px 13px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700"
                }}>
                  {currentStatus}
                </span>
              </div>

              <div style={{
                backgroundColor: "#f8fafc",
                padding: "16px",
                borderRadius: "7px",
                marginBottom: "20px"
              }}>
                <p style={detailStyle}>
                  <strong>Candidate:</strong>{" "}
                  {application.candidate_name ||
                    application.full_name ||
                    application.name ||
                    "Not available"}
                </p>

                <p style={detailStyle}>
                  <strong>Email:</strong>{" "}
                  {application.candidate_email ||
                    application.email ||
                    "Not available"}
                </p>

                <p style={detailStyle}>
                  <strong>Company:</strong>{" "}
                  {application.company_name || "Not available"}
                </p>

                <p style={detailStyle}>
                  <strong>Applied Date:</strong>{" "}
                  {application.applied_at
                    ? new Date(application.applied_at).toLocaleDateString()
                    : "Not available"}
                </p>
              </div>

              <h4 style={{
                color: "#123b65",
                fontSize: "15px",
                marginBottom: "8px"
              }}>
                Cover Letter
              </h4>

              <p style={{
                color: "#475569",
                fontSize: "14px",
                lineHeight: "1.7",
                whiteSpace: "pre-wrap",
                marginBottom: "22px"
              }}>
                {application.cover_letter || "Not provided"}
              </p>

              <div style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap"
              }}>
                <label style={{
                  color: "#123b65",
                  fontSize: "14px",
                  fontWeight: "600"
                }}>
                  Update Status:
                </label>

                <select
                  value={currentStatus}
                  disabled={updatingId === applicationId}
                  onChange={(event) =>
                    updateStatus(applicationId, event.target.value)
                  }
                  style={{
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    color: "#334155",
                    fontSize: "14px",
                    cursor: "pointer",
                    minWidth: "180px"
                  }}
                >
                  <option value="Applied">Applied</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Selected">Selected</option>
                </select>

                {updatingId === applicationId && (
                  <span style={{
                    color: "#64748b",
                    fontSize: "13px"
                  }}>
                    Updating...
                  </span>
                )}
              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}

export default AdminApplications;
