
import { useEffect, useState } from "react";

const formatDateForInput = (value) => {
  if (!value) return "";

  const dateString = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    return dateString.slice(0, 10);
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "";

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0")
  ].join("-");
};

const formatTime = (value) => {
  if (!value) return "Not specified";

  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

  if (!match) return "Not specified";

  return `${match[1].padStart(2, "0")}:${match[2]}`;
};

function AdminJobFairs({ onBack }) {
  const [jobFairs, setJobFairs] = useState([]);
  const [message, setMessage] = useState("Loading job fairs...");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    event_name: "",
    description: "",
    organizer: "",
    location: "",
    event_date: "",
    start_time: "",
    end_time: "",
    registration_link: "",
    event_status: "Upcoming"
  };

  const [form, setForm] = useState(emptyForm);

  const fetchJobFairs = async () => {
    try {
      const token = localStorage.getItem("admin_token");

      const response = await fetch(
        "http://127.0.0.1:5000/api/admin/job-fairs",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to load job fairs.");
        return;
      }

      setJobFairs(data.job_fairs || []);
      setMessage("");
    } catch (error) {
      console.error("Job Fairs Error:", error);
      setMessage("Unable to connect to the server.");
    }
  };

  useEffect(() => {
    const loadJobFairs = async () => {
      await fetchJobFairs();
    };

    loadJobFairs();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.event_name.trim() || !form.event_date) {
      setMessage("Event name and event date are required.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const token = localStorage.getItem("admin_token");

      const url = editingId
        ? `http://127.0.0.1:5000/api/admin/job-fairs/${editingId}`
        : "http://127.0.0.1:5000/api/admin/job-fairs";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to save job fair.");
        return;
      }

      setMessage(
        data.message || "Job fair saved successfully!"
      );

      resetForm();
      await fetchJobFairs();
    } catch (error) {
      console.error("Save Job Fair Error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (fair) => {
    setEditingId(fair.job_fair_id);

    setForm({
      event_name: fair.event_name || "",
      description: fair.description || "",
      organizer: fair.organizer || "",
      location: fair.location || "",
      event_date: formatDateForInput(fair.event_date),
      start_time:
        formatTime(fair.start_time) === "Not specified"
          ? ""
          : formatTime(fair.start_time),
      end_time:
        formatTime(fair.end_time) === "Not specified"
          ? ""
          : formatTime(fair.end_time),
      registration_link: fair.registration_link || "",
      event_status: fair.event_status || "Upcoming"
    });

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStatusChange = async (fairId, newStatus) => {
    try {
      const token = localStorage.getItem("admin_token");

      const response = await fetch(
        `http://127.0.0.1:5000/api/admin/job-fairs/${fairId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            event_status: newStatus
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to update event status.");
        return;
      }

      setMessage("Event status updated successfully!");
      await fetchJobFairs();
    } catch (error) {
      console.error("Job Fair Status Error:", error);
      setMessage("Unable to connect to the server.");
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Completed") {
      return {
        backgroundColor: "#dcfce7",
        color: "#166534"
      };
    }

    if (status === "Cancelled") {
      return {
        backgroundColor: "#fee2e2",
        color: "#b91c1c"
      };
    }

    if (status === "Ongoing") {
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

  const inputStyle = {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    boxSizing: "border-box",
    fontSize: "14px",
    color: "#334155",
    backgroundColor: "#ffffff",
    marginTop: "7px"
  };

  const labelStyle = {
    display: "block",
    color: "#334155",
    fontSize: "14px",
    fontWeight: "600"
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
          Manage Job Fairs
        </h2>

        <p style={{
          color: "#64748b",
          fontSize: "14px",
          marginBottom: "25px"
        }}>
          Create, edit and manage job fair events.
        </p>

        {message && (
          <div style={{
            padding: "13px 16px",
            marginBottom: "20px",
            borderRadius: "7px",
            backgroundColor:
              message.includes("Unable") || message.includes("required")
                ? "#fee2e2"
                : message.includes("successfully")
                  ? "#dcfce7"
                  : "#e2e8f0",
            color:
              message.includes("Unable") || message.includes("required")
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

        {/* Add / Edit Job Fair Form */}

        <div style={{
          backgroundColor: "#ffffff",
          padding: "25px",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
          marginBottom: "30px"
        }}>

          <h3 style={{
            color: "#123b65",
            fontSize: "20px",
            marginTop: 0,
            marginBottom: "22px"
          }}>
            {editingId ? "Edit Job Fair" : "Add New Job Fair"}
          </h3>

          <form onSubmit={handleSubmit}>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px"
            }}>

              <div>
                <label style={labelStyle}>
                  Event Name *
                </label>
                <input
                  style={inputStyle}
                  type="text"
                  name="event_name"
                  value={form.event_name}
                  onChange={handleChange}
                  placeholder="Enter event name"
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Organizer
                </label>
                <input
                  style={inputStyle}
                  type="text"
                  name="organizer"
                  value={form.organizer}
                  onChange={handleChange}
                  placeholder="Enter organizer name"
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Location
                </label>
                <input
                  style={inputStyle}
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Enter event location"
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Event Date *
                </label>
                <input
                  style={inputStyle}
                  type="date"
                  name="event_date"
                  value={form.event_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Start Time
                </label>
                <input
                  style={inputStyle}
                  type="time"
                  name="start_time"
                  value={form.start_time}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  End Time
                </label>
                <input
                  style={inputStyle}
                  type="time"
                  name="end_time"
                  value={form.end_time}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Registration Link
                </label>
                <input
                  style={inputStyle}
                  type="url"
                  name="registration_link"
                  value={form.registration_link}
                  onChange={handleChange}
                  placeholder="https://example.com/register"
                />
              </div>

              {editingId && (
                <div>
                  <label style={labelStyle}>
                    Event Status
                  </label>
                  <select
                    style={inputStyle}
                    name="event_status"
                    value={form.event_status}
                    onChange={handleChange}
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              )}

            </div>

            <div style={{ marginTop: "20px" }}>
              <label style={labelStyle}>
                Description
              </label>
              <textarea
                style={{
                  ...inputStyle,
                  minHeight: "100px",
                  resize: "vertical"
                }}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter event description"
              />
            </div>

            <div style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "22px"
            }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  backgroundColor: "#123b65",
                  color: "#ffffff",
                  padding: "12px 22px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                  fontSize: "14px",
                  fontWeight: "600"
                }}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Job Fair"
                    : "Add Job Fair"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    backgroundColor: "#64748b",
                    color: "#ffffff",
                    padding: "12px 22px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>

          </form>
        </div>

        {/* Existing Job Fairs */}

        <h3 style={{
          color: "#123b65",
          fontSize: "21px",
          marginBottom: "18px"
        }}>
          All Job Fairs ({jobFairs.length})
        </h3>

        {jobFairs.length === 0 && !message && (
          <div style={{
            backgroundColor: "#ffffff",
            padding: "22px",
            borderRadius: "8px",
            color: "#64748b",
            fontSize: "14px"
          }}>
            No job fairs available.
          </div>
        )}

        {jobFairs.map((fair) => (
          <div
            key={fair.job_fair_id}
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
                {fair.event_name}
              </h3>

              <span style={{
                ...getStatusStyle(fair.event_status),
                padding: "6px 13px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700"
              }}>
                {fair.event_status}
              </span>
            </div>

            <div style={{
              backgroundColor: "#f8fafc",
              padding: "16px",
              borderRadius: "7px",
              marginBottom: "18px"
            }}>
              <p style={detailStyle}>
                <strong>Description:</strong>{" "}
                {fair.description || "Not provided"}
              </p>

              <p style={detailStyle}>
                <strong>Organizer:</strong>{" "}
                {fair.organizer || "Not specified"}
              </p>

              <p style={detailStyle}>
                <strong>Location:</strong>{" "}
                {fair.location || "Not specified"}
              </p>

              <p style={detailStyle}>
                <strong>Date:</strong>{" "}
                {fair.event_date
                  ? (() => {
                      const date = new Date(
                        formatDateForInput(fair.event_date) + "T00:00:00"
                      );

                      return Number.isNaN(date.getTime())
                        ? "Not specified"
                        : date.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric"
                          });
                    })()
                  : "Not specified"}
              </p>

              <p style={detailStyle}>
                <strong>Start Time:</strong>{" "}
                {formatTime(fair.start_time)}
              </p>

              <p style={detailStyle}>
                <strong>End Time:</strong>{" "}
                {formatTime(fair.end_time)}
              </p>

              <p style={detailStyle}>
                <strong>Registration:</strong>{" "}
                {fair.registration_link ? (
                  <a
                    href={fair.registration_link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#2563eb",
                      fontWeight: "600",
                      textDecoration: "none"
                    }}
                  >
                    Register Here
                  </a>
                ) : (
                  "Not provided"
                )}
              </p>
            </div>

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
                value={fair.event_status || "Upcoming"}
                onChange={(e) =>
                  handleStatusChange(
                    fair.job_fair_id,
                    e.target.value
                  )
                }
                style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#334155",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <button
                onClick={() => handleEdit(fair)}
                style={{
                  backgroundColor: "#123b65",
                  color: "#ffffff",
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600"
                }}
              >
                Edit Job Fair
              </button>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}

export default AdminJobFairs;
