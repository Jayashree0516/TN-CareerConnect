
import { useEffect, useState } from "react";

function AdminEmployers({ onBack }) {
  const [employers, setEmployers] = useState([]);
  const [message, setMessage] = useState("Loading employers...");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchEmployers = async () => {
    try {
      const token = localStorage.getItem("admin_token");

      const response = await fetch(
        "http://127.0.0.1:5000/api/admin/employers",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        const employerList = data.employers || [];

        setEmployers(employerList);
        setMessage(
          employerList.length === 0
            ? "No employers found."
            : ""
        );
      } else {
        setMessage(data.message || "Unable to fetch employers.");
      }
    } catch (error) {
      console.error("Employers Error:", error);
      setMessage("Unable to connect to the server.");
    }
  };

  const updateEmployerStatus = async (employerId, newStatus) => {
    try {
      setUpdatingId(employerId);
      setMessage("");

      const token = localStorage.getItem("admin_token");

      const response = await fetch(
        `http://127.0.0.1:5000/api/admin/employers/${employerId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            approval_status: newStatus
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setEmployers((previousEmployers) =>
          previousEmployers.map((employer) =>
            employer.employer_id === employerId
              ? { ...employer, approval_status: newStatus }
              : employer
          )
        );

        setMessage(`Employer ${newStatus.toLowerCase()} successfully.`);
      } else {
        setMessage(data.message || "Unable to update employer status.");
      }
    } catch (error) {
      console.error("Employer Status Error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    const loadEmployers = async () => {
      await fetchEmployers();
    };

    loadEmployers();
  }, []);

  const getStatusStyle = (status) => {
    if (status === "Approved") {
      return { backgroundColor: "#dcfce7", color: "#166534" };
    }

    if (status === "Rejected") {
      return { backgroundColor: "#fee2e2", color: "#b91c1c" };
    }

    return { backgroundColor: "#fef3c7", color: "#92400e" };
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
          Manage Employers
        </h2>

        <p style={{
          color: "#64748b",
          fontSize: "14px",
          marginBottom: "25px"
        }}>
          Review employer registrations and manage their approval status.
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

        {employers.map((employer) => (
          <div
            key={employer.employer_id}
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
                {employer.company_name}
              </h3>

              <span style={{
                ...getStatusStyle(employer.approval_status),
                padding: "6px 13px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700"
              }}>
                {employer.approval_status}
              </span>
            </div>

            <div style={{
              backgroundColor: "#f8fafc",
              padding: "15px",
              borderRadius: "7px",
              marginBottom: "18px"
            }}>
              <p style={{
                color: "#475569",
                fontSize: "14px",
                margin: "7px 0"
              }}>
                <strong>Contact Person:</strong> {employer.contact_person}
              </p>

              <p style={{
                color: "#475569",
                fontSize: "14px",
                margin: "7px 0"
              }}>
                <strong>Email:</strong> {employer.email}
              </p>

              <p style={{
                color: "#475569",
                fontSize: "14px",
                margin: "7px 0"
              }}>
                <strong>Phone:</strong> {employer.phone}
              </p>
            </div>

            {employer.approval_status === "Pending" && (
              <div style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap"
              }}>
                <button
                  disabled={updatingId === employer.employer_id}
                  onClick={() =>
                    updateEmployerStatus(
                      employer.employer_id,
                      "Approved"
                    )
                  }
                  style={{
                    backgroundColor: "#15803d",
                    color: "#ffffff",
                    padding: "11px 20px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: updatingId === employer.employer_id
                      ? "not-allowed"
                      : "pointer",
                    opacity: updatingId === employer.employer_id ? 0.7 : 1,
                    fontWeight: "600",
                    fontSize: "13px"
                  }}
                >
                  {updatingId === employer.employer_id
                    ? "Updating..."
                    : "Approve"}
                </button>

                <button
                  disabled={updatingId === employer.employer_id}
                  onClick={() =>
                    updateEmployerStatus(
                      employer.employer_id,
                      "Rejected"
                    )
                  }
                  style={{
                    backgroundColor: "#dc2626",
                    color: "#ffffff",
                    padding: "11px 20px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: updatingId === employer.employer_id
                      ? "not-allowed"
                      : "pointer",
                    opacity: updatingId === employer.employer_id ? 0.7 : 1,
                    fontWeight: "600",
                    fontSize: "13px"
                  }}
                >
                  {updatingId === employer.employer_id
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

export default AdminEmployers;
