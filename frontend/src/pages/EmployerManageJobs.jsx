
import { useEffect, useState } from "react";

function EmployerManageJobs({ onBack }) {
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState("Loading jobs...");
  const [messageType, setMessageType] = useState("");

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("employer_token");

      const response = await fetch(
        "http://127.0.0.1:5000/api/employer/jobs",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setJobs(data.jobs || []);
        setMessage(
          data.jobs?.length === 0 ? "No jobs posted yet." : ""
        );
        setMessageType("");
      } else {
        setMessage(data.message || "Unable to fetch jobs.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Fetch Jobs Error:", error);
      setMessage("Unable to connect to the server.");
      setMessageType("error");
    }
  };

  useEffect(() => {
    const loadJobs = async () => {
      await fetchJobs();
    };

    loadJobs();
  }, []);

  const closeJob = async (jobId) => {
    const confirmClose = window.confirm(
      "Are you sure you want to close this job?"
    );

    if (!confirmClose) return;

    try {
      const token = localStorage.getItem("employer_token");

      const response = await fetch(
        `http://127.0.0.1:5000/api/employer/jobs/${jobId}/close`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Job closed successfully.");
        setMessageType("success");
        await fetchJobs();
      } else {
        setMessage(data.message || "Unable to close job.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Close Job Error:", error);
      setMessage("Unable to connect to the server.");
      setMessageType("error");
    }
  };

  const getStatusStyle = (status) => {
    const normalizedStatus = status?.toLowerCase();

    if (normalizedStatus === "approved") {
      return {
        background: "#dcfce7",
        color: "#166534"
      };
    }

    if (normalizedStatus === "closed") {
      return {
        background: "#fee2e2",
        color: "#b91c1c"
      };
    }

    return {
      background: "#fef3c7",
      color: "#92400e"
    };
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
        maxWidth: "1050px",
        margin: "auto"
      }}>

        <h2 style={{
          color: "#123b65",
          fontSize: "28px",
          marginBottom: "8px"
        }}>
          Manage My Jobs
        </h2>

        <p style={{
          color: "#64748b",
          marginBottom: "25px",
          fontSize: "14px"
        }}>
          View your posted jobs and manage their status.
        </p>

        {message && (
          <div style={{
            padding: "13px 16px",
            marginBottom: "20px",
            borderRadius: "7px",
            backgroundColor:
              messageType === "error"
                ? "#fee2e2"
                : messageType === "success"
                  ? "#dcfce7"
                  : "#e2e8f0",
            color:
              messageType === "error"
                ? "#b91c1c"
                : messageType === "success"
                  ? "#166534"
                  : "#475569",
            fontWeight: "500"
          }}>
            {message}
          </div>
        )}

        {jobs.map((job) => (
          <div
            key={job.job_id}
            style={{
              backgroundColor: "#ffffff",
              padding: "25px",
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
                fontSize: "21px",
                margin: 0
              }}>
                {job.job_title}
              </h3>

              <span style={{
                ...getStatusStyle(job.job_status),
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700"
              }}>
                {job.job_status}
              </span>

            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              color: "#475569",
              fontSize: "14px",
              marginBottom: "20px"
            }}>

              <p style={{ margin: 0 }}>
                <strong style={{ color: "#334155" }}>Category:</strong>
                {" "}{job.job_category}
              </p>

              <p style={{ margin: 0 }}>
                <strong style={{ color: "#334155" }}>Location:</strong>
                {" "}{job.location}
              </p>

              <p style={{ margin: 0 }}>
                <strong style={{ color: "#334155" }}>Job Type:</strong>
                {" "}{job.job_type}
              </p>

            </div>

            {job.job_status !== "Closed" && (
              <button
                onClick={() => closeJob(job.job_id)}
                style={{
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "13px"
                }}
              >
                Close Job
              </button>
            )}

            {job.job_status === "Closed" && (
              <p style={{
                color: "#b91c1c",
                fontSize: "13px",
                fontWeight: "600",
                margin: 0
              }}>
                This job is closed.
              </p>
            )}

          </div>
        ))}

      </div>
    </div>
  );
}

export default EmployerManageJobs;
