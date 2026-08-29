import { useEffect, useState } from "react";

function Profile({ onBack, onLogout }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser
      ? JSON.parse(savedUser)
      : {};
  });

  const [editing, setEditing] = useState(false);
  const [shoppingLists, setShoppingLists] = useState([]);
  const [selectedHistory, setSelectedHistory] =
    useState(null);
  const [loadingHistory, setLoadingHistory] =
    useState(true);

  const [name, setName] = useState(
    user.name || ""
  );

  const [email, setEmail] = useState(
    user.email || ""
  );

  // =====================================================
  // FETCH SHOPPING HISTORY
  // =====================================================

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoadingHistory(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/lists`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (Array.isArray(data)) {
          setShoppingLists(data);
        }
      } catch (error) {
        console.error(
          "Error fetching shopping history:",
          error
        );
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, []);

  // =====================================================
  // COMPLETED LISTS = HISTORY
  // =====================================================

  const historyLists = shoppingLists.filter(
    (list) => {
      const items = list.items || [];

      return (
        items.length > 0 &&
        items.every(
          (item) => item.purchased === true
        )
      );
    }
  );

  // =====================================================
  // TOTAL FOR A LIST
  // =====================================================

  const getListTotal = (list) => {
    return (list.items || []).reduce(
      (total, item) => {
        const quantity =
          Number(item.quantity) || 1;

        const price =
          Number(item.estimatedPrice) || 0;

        return total + quantity * price;
      },
      0
    );
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSave = () => {
    const updatedUser = {
      ...user,
      name,
      email,
    };

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);
    setEditing(false);
  };

  // =====================================================
  // VIEW HISTORY ITEM
  // =====================================================

  if (selectedHistory) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#faf7fc",
          padding: "40px 20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <button
            onClick={() =>
              setSelectedHistory(null)
            }
            style={{
              border: "none",
              background: "transparent",
              color: "#80539b",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              marginBottom: "25px",
            }}
          >
            ← Back to History
          </button>

          <div
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "35px",
              boxShadow:
                "0 15px 45px rgba(80, 50, 100, 0.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "flex-start",
                marginBottom: "10px",
              }}
            >
              <div>
                <h1
                  style={{
                    margin: 0,
                    color: "#2f2038",
                  }}
                >
                  🛒 {selectedHistory.name}
                </h1>

                <p
                  style={{
                    color: "#8a7d8e",
                    marginTop: "8px",
                  }}
                >
                  {new Date(
                    selectedHistory.createdAt
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>

              <span
                style={{
                  background: "#eee4f2",
                  color: "#80539b",
                  padding: "8px 14px",
                  borderRadius: "20px",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                ✓ Completed
              </span>
            </div>

            <div
              style={{
                marginTop: "25px",
              }}
            >
              {(selectedHistory.items || []).map(
                (item) => (
                  <div
                    key={item._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      padding: "16px 0",
                      borderBottom:
                        "1px solid #eee8f0",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: "600",
                          color: "#3b2d42",
                        }}
                      >
                        ✓ {item.name}
                      </div>

                      <div
                        style={{
                          color: "#95899a",
                          fontSize: "14px",
                          marginTop: "4px",
                        }}
                      >
                        {item.category ||
                          "Other"}{" "}
                        • Qty:{" "}
                        {item.quantity || 1}
                      </div>
                    </div>

                    <div
                      style={{
                        fontWeight: "600",
                        color: "#80539b",
                      }}
                    >
                      ₹
                      {(
                        Number(
                          item.estimatedPrice
                        ) || 0
                      ).toFixed(2)}
                    </div>
                  </div>
                )
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginTop: "25px",
                paddingTop: "20px",
                borderTop:
                  "2px solid #eee8f0",
                fontSize: "18px",
                fontWeight: "700",
                color: "#3b2d42",
              }}
            >
              <span>Total</span>

              <span
                style={{
                  color: "#80539b",
                }}
              >
                ₹
                {getListTotal(
                  selectedHistory
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // PROFILE PAGE
  // =====================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#faf7fc",
        padding: "40px 20px",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={onBack}
          style={{
            border: "none",
            background: "transparent",
            color: "#80539b",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          ← Back to Dashboard
        </button>

        <h1
          style={{
            margin: 0,
            color: "#2f2038",
          }}
        >
          My Profile
        </h1>

        <div style={{ width: "130px" }} />
      </div>

      {/* PROFILE CARD */}

      <div
        style={{
          maxWidth: "650px",
          margin: "0 auto",
          background: "white",
          borderRadius: "24px",
          padding: "40px",
          boxSizing: "border-box",
          boxShadow:
            "0 15px 45px rgba(80, 50, 100, 0.12)",
          border:
            "1px solid rgba(128, 83, 155, 0.12)",
        }}
      >
        {/* AVATAR */}

        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, #80539b, #a979bb)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
            fontSize: "42px",
            color: "white",
          }}
        >
          👤
        </div>

        <h2
          style={{
            textAlign: "center",
            margin: "0 0 6px",
            color: "#2f2038",
          }}
        >
          {user.name || "User"}
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#8a7d8e",
            marginBottom: "35px",
          }}
        >
          {user.email || "No email available"}
        </p>

        {/* NAME */}

        <label
          style={{
            display: "block",
            marginBottom: "8px",
            color: "#3b2d42",
            fontWeight: "600",
          }}
        >
          Name
        </label>

        <input
          type="text"
          value={name}
          disabled={!editing}
          onChange={(event) =>
            setName(event.target.value)
          }
          style={{
            width: "100%",
            padding: "14px",
            boxSizing: "border-box",
            border: "1px solid #ddd",
            borderRadius: "12px",
            fontSize: "16px",
            background: editing
              ? "#fff"
              : "#f7f3f9",
            color: "#3b2d42",
            marginBottom: "20px",
          }}
        />

        {/* EMAIL */}

        <label
          style={{
            display: "block",
            marginBottom: "8px",
            color: "#3b2d42",
            fontWeight: "600",
          }}
        >
          Email
        </label>

        <input
          type="email"
          value={email}
          disabled={!editing}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          style={{
            width: "100%",
            padding: "14px",
            boxSizing: "border-box",
            border: "1px solid #ddd",
            borderRadius: "12px",
            fontSize: "16px",
            background: editing
              ? "#fff"
              : "#f7f3f9",
            color: "#3b2d42",
            marginBottom: "30px",
          }}
        />

        {/* EDIT / SAVE */}

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "12px",
              background:
                "linear-gradient(135deg, #80539b, #684080)",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            ✏️ Edit Profile
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "12px",
            }}
          >
            <button
              onClick={() => {
                setName(user.name || "");
                setEmail(user.email || "");
                setEditing(false);
              }}
              style={{
                flex: 1,
                padding: "14px",
                border: "1px solid #ddd",
                borderRadius: "12px",
                background: "white",
                color: "#665a6c",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: "14px",
                border: "none",
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, #80539b, #684080)",
                color: "white",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Save Changes
            </button>
          </div>
        )}

        {/* =================================================
            SHOPPING HISTORY
        ================================================= */}

        <div
          style={{
            marginTop: "45px",
            paddingTop: "30px",
            borderTop: "1px solid #eee8f0",
          }}
        >
          <h2
            style={{
              margin: "0 0 6px",
              color: "#2f2038",
            }}
          >
            🕒 Shopping History
          </h2>

          <p
            style={{
              marginTop: "0",
              marginBottom: "20px",
              color: "#8a7d8e",
              fontSize: "14px",
            }}
          >
            Your completed shopping lists
          </p>

          {loadingHistory ? (
            <p
              style={{
                textAlign: "center",
                color: "#8a7d8e",
                padding: "20px",
              }}
            >
              Loading history...
            </p>
          ) : historyLists.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                background: "#faf7fc",
                borderRadius: "16px",
                padding: "30px 20px",
                color: "#8a7d8e",
              }}
            >
              <div
                style={{
                  fontSize: "35px",
                  marginBottom: "10px",
                }}
              >
                🛒
              </div>

              <strong
                style={{
                  color: "#3b2d42",
                }}
              >
                No shopping history yet
              </strong>

              <p
                style={{
                  marginBottom: 0,
                  fontSize: "14px",
                }}
              >
                Completed shopping lists will
                appear here.
              </p>
            </div>
          ) : (
            historyLists.map((list) => (
              <div
                key={list._id}
                style={{
                  background: "#faf7fc",
                  border:
                    "1px solid #eee5f1",
                  borderRadius: "16px",
                  padding: "18px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    gap: "15px",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: "0 0 6px",
                        color: "#3b2d42",
                      }}
                    >
                      ✓ {list.name}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        color: "#8a7d8e",
                        fontSize: "13px",
                      }}
                    >
                      {new Date(
                        list.createdAt
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}{" "}
                      •{" "}
                      {list.items.length}{" "}
                      items
                    </p>

                    <p
                      style={{
                        margin:
                          "6px 0 0",
                        color: "#80539b",
                        fontWeight: "600",
                      }}
                    >
                      ₹
                      {getListTotal(
                        list
                      ).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedHistory(
                        list
                      )
                    }
                    style={{
                      border: "none",
                      borderRadius: "10px",
                      padding:
                        "10px 15px",
                      background:
                        "#80539b",
                      color: "white",
                      fontWeight:
                        "600",
                      cursor: "pointer",
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    View →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* LOGOUT */}

        <button
          onClick={onLogout}
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "14px",
            border:
              "1px solid #eadde9",
            borderRadius: "12px",
            background: "#fff8fb",
            color: "#9b5574",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;