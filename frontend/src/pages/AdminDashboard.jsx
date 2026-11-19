
function AdminDashboard({
  onLogout,
  onCandidatesClick,
  onEmployersClick,
  onJobsClick,
  onApplicationsClick,
  onJobFairsClick
}) {
  const cards = [
    {
      title: "View Candidates",
      description: "View and manage registered candidates.",
      icon: "👥",
      action: onCandidatesClick
    },
    {
      title: "Manage Employers",
      description: "Review and manage employer accounts.",
      icon: "🏢",
      action: onEmployersClick
    },
    {
      title: "Manage Jobs",
      description: "Manage job postings and approval status.",
      icon: "💼",
      action: onJobsClick
    },
    {
      title: "Manage Applications",
      description: "Review candidate job applications.",
      icon: "📄",
      action: onApplicationsClick
    },
    {
      title: "Manage Job Fairs",
      description: "Create and manage job fair details.",
      icon: "📅",
      action: onJobFairsClick
    }
  ];

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f1f5f9",
      padding: "35px 25px",
      boxSizing: "border-box"
    }}>

      <div style={{
        maxWidth: "1150px",
        margin: "auto"
      }}>

        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          backgroundColor: "#123b65",
          color: "#ffffff",
          padding: "22px 28px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(18,59,101,0.15)"
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: "25px"
            }}>
              Admin Dashboard
            </h2>

            <p style={{
              margin: "7px 0 0",
              color: "#dbeafe",
              fontSize: "14px"
            }}>
              TN CareerConnect Administration
            </p>
          </div>

          <button
            onClick={onLogout}
            style={{
              backgroundColor: "#ffffff",
              color: "#123b65",
              padding: "11px 22px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px"
            }}
          >
            Logout
          </button>
        </header>

        <div style={{
          marginTop: "35px",
          marginBottom: "22px"
        }}>
          <h3 style={{
            color: "#123b65",
            fontSize: "23px",
            margin: "0 0 8px"
          }}>
            Admin Management
          </h3>

          <p style={{
            color: "#64748b",
            fontSize: "14px",
            margin: 0
          }}>
            Select an option below to manage the portal.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "22px"
        }}>
          {cards.map((card) => (
            <div
              key={card.title}
              onClick={card.action}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  card.action();
                }
              }}
              role="button"
              tabIndex={0}
              style={{
                backgroundColor: "#ffffff",
                padding: "28px 22px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
                cursor: "pointer",
                textAlign: "center",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
            >
              <div style={{
                fontSize: "38px",
                marginBottom: "15px"
              }}>
                {card.icon}
              </div>

              <h4 style={{
                color: "#123b65",
                fontSize: "17px",
                margin: "0 0 10px"
              }}>
                {card.title}
              </h4>

              <p style={{
                color: "#64748b",
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0
              }}>
                {card.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
