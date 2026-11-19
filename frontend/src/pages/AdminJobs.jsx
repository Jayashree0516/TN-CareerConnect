
import { useEffect, useState } from "react";

function AdminJobs({ onBack }) {
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState("Loading jobs...");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("admin_token");

      const response = await fetch(
        "http://127.0.0.1:5000/api/admin/jobs",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        const jobList = data.jobs || [];

        setJobs(jobList);

        setMessage(
          jobList.length === 0
            ? "No jobs found."
            : ""
        );
      } else {
        setMessage(data.message || "Unable to fetch jobs.");
      }
    } catch (error) {
      console.error("Admin Jobs Error:", error);
      setMessage("Unable to connect to the server.");
    }
  };

  const updateJobStatus = async (jobId, newStatus) => {
    try {
      setUpdatingId(jobId);
      setMessage("");

      const token = localStorage.getItem("admin_token");

      const response = await fetch(
        `http://127.0.0.1:5000/api/admin/jobs/${jobId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            job_status: newStatus
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setJobs((previousJobs) =>
          previousJobs.map((job) =>
            job.job_id === jobId
              ? { ...job, job_status: newStatus }
              : job
          )
        );

        setMessage(
          `Job ${newStatus.toLowerCase()} successfully.`
        );
      } else {
        setMessage(data.message || "Unable to update job status.");
      }
    } catch (error) {
      console.error("Job Status Error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    const loadJobs = async () => {
      await fetchJobs();
    };

    loadJobs();
  }, []);

  const getStatusStyle = (status) => {
    if (status === "Approved") {
      return { backgroundColor: "#dcfce7", color: "#166534" };
    }

    if (status === "Rejected") {
      return { backgroundColor: "#fee2e2", color: "#b91c1c" };
    }

    if (status === "Closed") {
      return { backgroundColor: "#e2e8f0", color: "#475569" };
    }

    return { backgroundColor: "#fef3c7", color: "#92400e" };
  };

  const detailStyle = {
    color: "#475569",
    fontSize: "14px",
    lineHeight: "1.7",
    margin: "7px 0"
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
          Manage Jobs
        </h2>

        <p style={{
          color: "#64748b",
          fontSize: "14px",
          marginBottom: "25px"
        }}>
          Review job postings and manage their approval status.
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

        {jobs.map((job) => (
          <div
            key={job.job_id}
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
                {job.job_title}
              </h3>

              <span style={{
                ...getStatusStyle(job.job_status),
                padding: "6px 13px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700"
              }}>
                {job.job_status}
              </span>
            </div>

            <div style={{
              backgroundColor: "#f8fafc",
              padding: "15px",
              borderRadius: "7px",
              marginBottom: "18px"
            }}>
              <p style={detailStyle}>
                <strong>Company:</strong> {job.company_name}
              </p>

              <p style={detailStyle}>
                <strong>Category:</strong> {job.job_category}
              </p>

              <p style={detailStyle}>
                <strong>Job Type:</strong> {job.job_type}
              </p>

              <p style={detailStyle}>
                <strong>Location:</strong> {job.location}
              </p>

              <p style={detailStyle}>
                <strong>Salary:</strong>{" "}
                {job.salary_min ?? "Not specified"} -{" "}
                {job.salary_max ?? "Not specified"}
              </p>

              <p style={detailStyle}>
                <strong>Qualification:</strong> {job.qualification}
              </p>

              <p style={detailStyle}>
                <strong>Experience:</strong> {job.experience_required}
              </p>

              <p style={detailStyle}>
                <strong>Application Deadline:</strong>{" "}
                {job.application_deadline || "Not specified"}
              </p>
            </div>

            {job.job_status === "Pending" && (
              <div style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap"
              }}>
                <button
                  disabled={updatingId === job.job_id}
                  onClick={() =>
                    updateJobStatus(job.job_id, "Approved")
                  }
                  style={{
                    backgroundColor: "#15803d",
                    color: "#ffffff",
                    padding: "11px 20px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: updatingId === job.job_id
                      ? "not-allowed"
                      : "pointer",
                    opacity: updatingId === job.job_id ? 0.7 : 1,
                    fontWeight: "600",
                    fontSize: "13px"
                  }}
                >
                  {updatingId === job.job_id
                    ? "Updating..."
                    : "Approve"}
                </button>

                <button
                  disabled={updatingId === job.job_id}
                  onClick={() =>
                    updateJobStatus(job.job_id, "Rejected")
                  }
                  style={{
                    backgroundColor: "#dc2626",
                    color: "#ffffff",
                    padding: "11px 20px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: updatingId === job.job_id
                      ? "not-allowed"
                      : "pointer",
                    opacity: updatingId === job.job_id ? 0.7 : 1,
                    fontWeight: "600",
                    fontSize: "13px"
                  }}
                >
                  {updatingId === job.job_id
                    ? "Updating..."
                    : "Reject"}
                </button>
              </div>
            )}

          </div>
        ))}

      </div>
    </div>
  );
}

export default AdminJobs;
