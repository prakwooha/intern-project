import { useState, useEffect } from "react";
import "./App.css";

import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";

// =====================================================
// DASHBOARD
// =====================================================

function Dashboard({ onBack }) {
  const [shoppingLists, setShoppingLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);

  // CREATE LIST
  const [showCreateList, setShowCreateList] =
    useState(false);

  const [listName, setListName] = useState("");
  const [listRecurring, setListRecurring] =
    useState(false);
  const [listFrequency, setListFrequency] =
    useState("none");
  const [listBudget, setListBudget] =
    useState(0);

  // EDIT LIST
  const [showEditList, setShowEditList] =
    useState(false);

  const [editListName, setEditListName] =
    useState("");
  const [editListRecurring, setEditListRecurring] =
    useState(false);
  const [editListFrequency, setEditListFrequency] =
    useState("none");
  const [editListBudget, setEditListBudget] =
    useState(0);

  // ADD ITEM
  const [showAddItem, setShowAddItem] =
    useState(false);

  const [toastMessage, setToastMessage] =
    useState("");

  // =====================================================
  // SHOPSMART CUSTOM MODAL
  // =====================================================

  const [modal, setModal] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
    confirm: false,
    onConfirm: null,
  });

  const showModal = ({
    type = "success",
    title,
    message,
    confirm = false,
    onConfirm = null,
  }) => {
    setModal({
      show: true,
      type,
      title,
      message,
      confirm,
      onConfirm,
    });
  };

  const closeModal = () => {
    setModal({
      show: false,
      type: "success",
      title: "",
      message: "",
      confirm: false,
      onConfirm: null,
    });
  };

  const [itemName, setItemName] =
    useState("");
  const [itemQuantity, setItemQuantity] =
    useState(1);
  const [itemCategory, setItemCategory] =
    useState("Other");
  const [itemPrice, setItemPrice] =
    useState(0);

  // EDIT ITEM
  const [editingItem, setEditingItem] =
    useState(null);

  const [editName, setEditName] =
    useState("");
  const [editQuantity, setEditQuantity] =
    useState(1);
  const [editPrice, setEditPrice] =
    useState(0);

  // SMART FEATURES
  const [suggestions, setSuggestions] =
    useState([]);

  const [budgetInfo, setBudgetInfo] =
    useState(null);

  const [insights, setInsights] =
    useState(null);

  const [showInsights, setShowInsights] =
    useState(false);

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () =>
    localStorage.getItem("token");

  // =====================================================
  // GET ALL LISTS
  // =====================================================

  const fetchShoppingLists = async () => {
    const token = getToken();

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5001/api/lists",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (Array.isArray(data)) {
        setShoppingLists(data);

        if (data.length > 0) {
          setSelectedList(data[0]);
        } else {
          setSelectedList(null);
        }
      }
    } catch (error) {
      console.error(
        "Error fetching lists:",
        error
      );
    }
  };

  // =====================================================
  // SMART SUGGESTIONS
  // =====================================================

  const fetchSuggestions = async () => {
    const token = getToken();

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5001/api/lists/suggestions",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (
        response.ok &&
        Array.isArray(data.suggestions)
      ) {
        setSuggestions(
          data.suggestions
        );
      }
    } catch (error) {
      console.error(
        "Suggestions error:",
        error
      );
    }
  };

  // =====================================================
  // SHOPPING INSIGHTS
  // =====================================================

  const fetchInsights = async () => {
    const token = getToken();

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5001/api/lists/insights",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (response.ok) {
        setInsights(data);
      }
    } catch (error) {
      console.error(
        "Insights error:",
        error
      );
    }
  };

  // =====================================================
  // BUDGET
  // =====================================================

  const fetchBudget = async (listId) => {
    const token = getToken();

    if (!token || !listId) {
      setBudgetInfo(null);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/lists/${listId}/budget`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (response.ok) {
        setBudgetInfo(data);
      }
    } catch (error) {
      console.error(
        "Budget error:",
        error
      );
    }
  };

  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  useEffect(() => {
    fetchShoppingLists();
    fetchSuggestions();
    fetchInsights();
  }, []);

  // =====================================================
  // LOAD BUDGET WHEN LIST CHANGES
  // =====================================================

  useEffect(() => {
    if (selectedList) {
      fetchBudget(
        selectedList._id
      );
    } else {
      setBudgetInfo(null);
    }
  }, [selectedList]);

  // =====================================================
  // SELECT LIST
  // =====================================================

  const selectList = (list) => {
    setSelectedList(list);
    setEditingItem(null);
  };

  // =====================================================
  // CREATE LIST
  // =====================================================

  const createList = async (event) => {
    event.preventDefault();

    if (!listName.trim()) {
      return;
    }

    const token = getToken();

    try {
      const response = await fetch(
        "http://localhost:5001/api/lists",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: listName,
            recurring: listRecurring,

            recurringFrequency:
              listRecurring
                ? listFrequency
                : "none",

            budget:
              Number(listBudget) || 0,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        showModal({
          type: "error",
          title: "Couldn't Create List",
          message:
            data.message ||
            "Something went wrong while creating your list.",
        });
        return;
      }

      setShoppingLists(
        (previousLists) => [
          data.list,
          ...previousLists,
        ]
      );

      setSelectedList(data.list);

      setListName("");
      setListRecurring(false);
      setListFrequency("none");
      setListBudget(0);

      setShowCreateList(false);

      setShowAddItem(true);

      fetchSuggestions();
      fetchInsights();

      showModal({
        type: "success",
        title: "List Created!",
        message:
          "Your new shopping list is ready.",
      });
    } catch (error) {
      console.error(
        "Create list error:",
        error
      );

      showModal({
        type: "error",
        title: "Connection Error",
        message:
          "We couldn't connect to the server. Please try again.",
      });
    }
  };

  // =====================================================
  // EDIT LIST
  // =====================================================

  const updateList = async (event) => {
    event.preventDefault();

    if (
      !selectedList ||
      !editListName.trim()
    ) {
      return;
    }

    const token = getToken();

    try {
      const response = await fetch(
        `http://localhost:5001/api/lists/${selectedList._id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: editListName,

            recurring:
              editListRecurring,

            recurringFrequency:
              editListRecurring
                ? editListFrequency
                : "none",

            budget:
              Number(editListBudget) || 0,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        showModal({
          type: "error",
          title: "Couldn't Update List",
          message:
            data.message ||
            "Something went wrong while updating your list.",
        });
        return;
      }

      setSelectedList(data.list);

      setShoppingLists(
        (previousLists) =>
          previousLists.map(
            (list) =>
              list._id ===
              data.list._id
                ? data.list
                : list
          )
      );

      setShowEditList(false);

      setEditListName("");
      setEditListRecurring(false);
      setEditListFrequency("none");
      setEditListBudget(0);

      fetchBudget(data.list._id);

      showModal({
        type: "success",
        title: "List Updated!",
        message:
          "Your shopping list has been updated successfully.",
      });
    } catch (error) {
      console.error(
        "Update list error:",
        error
      );

      showModal({
        type: "error",
        title: "Connection Error",
        message:
          "We couldn't connect to the server. Please try again.",
      });
    }
  };

  // =====================================================
  // DELETE LIST
  // =====================================================

  const performDeleteList = async () => {
    if (!selectedList) {
      return;
    }

    const token = getToken();

    try {
      const response =
        await fetch(
          `http://localhost:5001/api/lists/${selectedList._id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        showModal({
          type: "error",
          title: "Couldn't Delete List",
          message:
            data.message ||
            "Something went wrong while deleting the list.",
        });
        return;
      }

      const remainingLists =
        shoppingLists.filter(
          (list) =>
            list._id !==
            selectedList._id
        );

      setShoppingLists(
        remainingLists
      );

      if (
        remainingLists.length > 0
      ) {
        setSelectedList(
          remainingLists[0]
        );
      } else {
        setSelectedList(null);
      }

      fetchSuggestions();
      fetchInsights();

      showModal({
        type: "success",
        title: "List Deleted!",
        message:
          "The shopping list has been removed successfully.",
      });
    } catch (error) {
      console.error(
        "Delete list error:",
        error
      );

      showModal({
        type: "error",
        title: "Connection Error",
        message:
          "We couldn't connect to the server. Please try again.",
      });
    }
  };

  const deleteList = () => {
    if (!selectedList) {
      return;
    }

    showModal({
      type: "delete",
      title: "Delete this list?",
      message:
        `Are you sure you want to delete "${selectedList.name}"? This action cannot be undone.`,
      confirm: true,
      onConfirm: async () => {
        closeModal();
        await performDeleteList();
      },
    });
  };

  // =====================================================
  // ADD ITEM
  // =====================================================

  const addItem = async (event) => {
    event.preventDefault();

    if (!selectedList) {
      showModal({
        type: "error",
        title: "No List Selected",
        message:
          "Please select a shopping list before adding an item.",
      });
      return;
    }

    if (!itemName.trim()) {
      showModal({
        type: "error",
        title: "Item Name Required",
        message:
          "Please enter an item name.",
      });
      return;
    }

    const token = getToken();

    try {
      const response =
        await fetch(
          `http://localhost:5001/api/lists/${selectedList._id}/items`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              name: itemName,
              quantity:
                Number(itemQuantity),
              category:
                itemCategory,
              estimatedPrice:
                Number(itemPrice),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        showModal({
          type: "error",
          title: "Couldn't Add Item",
          message:
            data.message ||
            "Something went wrong while adding the item.",
        });
        return;
      }

      setSelectedList(data.list);

      setShoppingLists(
        (previousLists) =>
          previousLists.map(
            (list) =>
              list._id ===
              data.list._id
                ? data.list
                : list
          )
      );

      setItemName("");
      setItemQuantity(1);
      setItemCategory("Other");
      setItemPrice(0);

      setShowAddItem(false);

      await fetchSuggestions();
      await fetchInsights();
      await fetchBudget(
        data.list._id
      );

      showModal({
        type: "success",
        title: "Item Added!",
        message:
          "Your item has been added to the shopping list.",
      });
    } catch (error) {
      console.error(
        "Add item error:",
        error
      );

      showModal({
        type: "error",
        title: "Connection Error",
        message:
          "We couldn't connect to the server. Please try again.",
      });
    }
  };

  // =====================================================
  // DELETE ITEM
  // =====================================================

  const deleteItem = async (itemId) => {
    if (!selectedList) {
      return;
    }

    const token = getToken();

    try {
      const response =
        await fetch(
          `http://localhost:5001/api/lists/${selectedList._id}/items/${itemId}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        showModal({
          type: "error",
          title: "Couldn't Delete Item",
          message:
            data.message ||
            "Something went wrong while deleting the item.",
        });
        return;
      }

      setSelectedList(data.list);

      setShoppingLists(
        (previousLists) =>
          previousLists.map(
            (list) =>
              list._id ===
              data.list._id
                ? data.list
                : list
          )
      );

      await fetchBudget(
        data.list._id
      );

      await fetchSuggestions();
      await fetchInsights();
    } catch (error) {
      console.error(
        "Delete item error:",
        error
      );
    }
  };

  // =====================================================
  // TOGGLE PURCHASED
  // =====================================================

  const togglePurchased = async (
    item
  ) => {
    if (!selectedList) {
      return;
    }

    const token = getToken();

    try {
      const response =
        await fetch(
          `http://localhost:5001/api/lists/${selectedList._id}/items/${item._id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              purchased:
                !item.purchased,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        showModal({
        type: "error",
        title: "Couldn't Update Item",
        message:
          data.message ||
          "Something went wrong while updating the item.",
      });
        return;
      }

      setSelectedList(data.list);

      setShoppingLists(
        (previousLists) =>
          previousLists.map(
            (list) =>
              list._id ===
              data.list._id
                ? data.list
                : list
          )
      );

      await fetchBudget(
        data.list._id
      );

      await fetchInsights();
      await fetchSuggestions();
    } catch (error) {
      console.error(
        "Purchase update error:",
        error
      );
    }
  };

  // =====================================================
  // START EDIT ITEM
  // =====================================================

  const startEditing = (item) => {
    setEditingItem(item._id);

    setEditName(item.name);
    setEditQuantity(
      item.quantity
    );
    setEditPrice(
      item.estimatedPrice
    );
  };

  // =====================================================
  // CANCEL EDIT ITEM
  // =====================================================

  const cancelEditing = () => {
    setEditingItem(null);

    setEditName("");
    setEditQuantity(1);
    setEditPrice(0);
  };

  // =====================================================
  // SAVE ITEM
  // =====================================================

  const saveItem = async (itemId) => {
    if (!selectedList) {
      return;
    }

    const token = getToken();

    try {
      const response =
        await fetch(
          `http://localhost:5001/api/lists/${selectedList._id}/items/${itemId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              name: editName,
              quantity:
                Number(editQuantity),
              estimatedPrice:
                Number(editPrice),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        showModal({
          type: "error",
          title: "Couldn't Update Item",
          message:
            data.message ||
            "Something went wrong while updating the item.",
        });
        return;
      }

      setSelectedList(data.list);

      setShoppingLists(
        (previousLists) =>
          previousLists.map(
            (list) =>
              list._id ===
              data.list._id
                ? data.list
                : list
          )
      );

      cancelEditing();

      await fetchBudget(
        data.list._id
      );

      await fetchInsights();
      await fetchSuggestions();
    } catch (error) {
      console.error(
        "Edit item error:",
        error
      );
    }
  };

  // =====================================================
  // TOTAL
  // =====================================================

  const total =
    selectedList?.items?.reduce(
      (sum, item) =>
        sum +
        Number(
          item.estimatedPrice || 0
        ) *
          Number(
            item.quantity || 1
          ),
      0
    ) || 0;

  // =====================================================
  // PROGRESS
  // =====================================================

  const totalItems =
    selectedList?.items?.length ||
    0;

  const purchasedItems =
    selectedList?.items?.filter(
      (item) => item.purchased
    ).length || 0;

  const progress =
    totalItems > 0
      ? Math.round(
          (purchasedItems /
            totalItems) *
            100
        )
      : 0;

  // =====================================================
  // RECURRENCE LABEL
  // =====================================================

  const getRecurrenceLabel = (
    list
  ) => {
    if (!list?.recurring) {
      return "No recurrence";
    }

    if (
      list.recurringFrequency ===
      "weekly"
    ) {
      return "↻ Weekly";
    }

    if (
      list.recurringFrequency ===
      "monthly"
    ) {
      return "↻ Monthly";
    }

    return "↻ Recurring";
  };

  // =====================================================
  // BUDGET STATUS
  // =====================================================

  const getBudgetMessage = () => {
    if (!budgetInfo) {
      return "No budget set";
    }

    if (
      budgetInfo.status ===
      "over-budget"
    ) {
      return "⚠️ You are over budget";
    }

    if (
      budgetInfo.status ===
      "warning"
    ) {
      return "⚠️ You are close to your budget";
    }

    if (
      budgetInfo.status === "safe"
    ) {
      return "✓ You are within budget";
    }

    return "Set a budget to start tracking";
  };

  // =====================================================
  // DASHBOARD UI
  // =====================================================

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <header className="dashboard-header">

        <div className="logo">

          <span className="logo-icon">
            🛒
          </span>

          <span>
            ShopSmart
          </span>

        </div>

        <button
          className="logout-btn"
          onClick={onBack}
        >
          ← Home
        </button>

      </header>

      <main className="dashboard-content">

        {/* WELCOME */}

        <div className="dashboard-welcome">

          <p className="small-label">
            WELCOME BACK ✨
          </p>

          <h1>
            Let's make your{" "}
            <span>
              shopping smarter.
            </span>
          </h1>

          <p>
            Everything you need for
            your next shopping trip,
            all in one beautiful place.
          </p>

        </div>

        {/* LIST SELECTOR */}

        <div
          style={{
            marginBottom: "30px",
          }}
        >

          <p className="small-label">
            MY SHOPPING LISTS
          </p>

          <div
            style={{
              display: "flex",
              gap: "15px",
              overflowX: "auto",
              padding:
                "12px 0 8px",
            }}
          >

            {shoppingLists.map(
              (list) => {

                const listTotal =
                  list.items?.reduce(
                    (sum, item) =>
                      sum +
                      Number(
                        item.estimatedPrice ||
                          0
                      ) *
                        Number(
                          item.quantity ||
                            1
                        ),
                    0
                  ) || 0;

                const isSelected =
                  selectedList?._id ===
                  list._id;

                return (
                  <button
                    key={list._id}
                    onClick={() =>
                      selectList(list)
                    }
                    style={{
                      minWidth:
                        "200px",
                      padding: "18px",
                      borderRadius:
                        "18px",

                      border:
                        isSelected
                          ? "2px solid #80539b"
                          : "1px solid #eee7ef",

                      background:
                        isSelected
                          ? "#f5edfa"
                          : "white",

                      textAlign:
                        "left",
                      cursor:
                        "pointer",

                      boxShadow:
                        "0 8px 20px rgba(80,50,100,0.05)",
                    }}
                  >

                    <strong
                      style={{
                        display:
                          "block",
                        color:
                          "#3b2d42",
                        marginBottom:
                          "7px",
                      }}
                    >
                      🛒 {list.name}
                    </strong>

                    <span
                      style={{
                        color:
                          "#8a7d8e",
                        fontSize:
                          "13px",
                      }}
                    >
                      {list.items?.length ||
                        0}{" "}
                      items · ₹
                      {listTotal}
                    </span>

                    <div
                      style={{
                        marginTop:
                          "8px",
                        fontSize:
                          "12px",
                        fontWeight:
                          "600",
                        color:
                          "#80539b",
                      }}
                    >
                      {getRecurrenceLabel(
                        list
                      )}
                    </div>

                  </button>
                );
              }
            )}

            <button
              onClick={() =>
                setShowCreateList(true)
              }
              style={{
                minWidth:
                  "200px",
                padding: "18px",
                borderRadius:
                  "18px",
                border:
                  "2px dashed #cdbbd6",
                background:
                  "transparent",
                color:
                  "#80539b",
                fontWeight:
                  "700",
                cursor:
                  "pointer",
              }}
            >
              + Create New List
            </button>

          </div>
        </div>

        {/* MAIN DASHBOARD */}

        <div className="dashboard-grid">

          {/* LIST CARD */}

          <div className="shopping-card main-list-card">

            <div className="card-top">

              <div>

                <p className="small-label">
                  YOUR LIST
                </p>

                <h2>
                  {selectedList?.name ||
                    "No list selected"}
                </h2>

                {selectedList && (
                  <div
                    style={{
                      display:
                        "flex",
                      gap: "12px",
                      marginTop:
                        "8px",
                    }}
                  >

                    <button
                      onClick={() => {
                        setEditListName(
                          selectedList.name
                        );

                        setEditListRecurring(
                          selectedList.recurring ||
                            false
                        );

                        setEditListFrequency(
                          selectedList.recurringFrequency ||
                            "none"
                        );

                        setEditListBudget(
                          selectedList.budget ||
                            0
                        );

                        setShowEditList(
                          true
                        );
                      }}
                      style={{
                        border:
                          "none",
                        background:
                          "transparent",
                        cursor:
                          "pointer",
                        color:
                          "#80539b",
                        fontWeight:
                          "600",
                      }}
                    >
                      ✏️ Edit List
                    </button>

                    <button
                      onClick={
                        deleteList
                      }
                      style={{
                        border:
                          "none",
                        background:
                          "transparent",
                        cursor:
                          "pointer",
                        color:
                          "#b34b4b",
                        fontWeight:
                          "600",
                      }}
                    >
                      🗑️ Delete List
                    </button>

                  </div>
                )}

              </div>

              <span className="weekly-badge">
                {getRecurrenceLabel(
                  selectedList
                )}
              </span>

            </div>

            {/* PROGRESS */}

            <div className="progress-info">

              <span>
                Shopping progress
              </span>

              <strong>
                {progress}%
              </strong>

            </div>

            <div className="progress-bar">

              <div
                className="progress-fill"
                style={{
                  width:
                    `${progress}%`,
                }}
              />

            </div>

            {/* ADD ITEM */}

            {selectedList && (
              <button
                onClick={() =>
                  setShowAddItem(
                    true
                  )
                }
                className="new-list-button"
                style={{
                  width:
                    "100%",
                  marginBottom:
                    "20px",
                }}
              >
                + Add Item
              </button>
            )}

            {/* ITEMS */}

            <div className="shopping-items">

              {selectedList?.items
                ?.length > 0 ? (

                selectedList.items.map(
                  (item) => (

                    <div
                      className="dashboard-item"
                      key={item._id}
                    >

                      {editingItem !==
                      item._id ? (
                        <>

                          <button
                            onClick={() =>
                              togglePurchased(
                                item
                              )
                            }
                            style={{
                              border:
                                "none",
                              background:
                                "transparent",
                              cursor:
                                "pointer",
                              fontSize:
                                "20px",
                            }}
                          >
                            {item.purchased
                              ? "✓"
                              : "○"}
                          </button>

                          <span
                            style={{
                              flex:
                                1,
                              textDecoration:
                                item.purchased
                                  ? "line-through"
                                  : "none",
                            }}
                          >
                            {item.name}
                          </span>

                          <span>
                            ×{" "}
                            {
                              item.quantity
                            }
                          </span>

                          <span>
                            ₹
                            {Number(
                              item.estimatedPrice ||
                                0
                            ) *
                              Number(
                                item.quantity ||
                                  1
                              )}
                          </span>

                          <button
                            onClick={() =>
                              startEditing(
                                item
                              )
                            }
                            style={{
                              border:
                                "none",
                              background:
                                "transparent",
                              cursor:
                                "pointer",
                            }}
                          >
                            ✏️
                          </button>

                          <button
                            onClick={() =>
                              deleteItem(
                                item._id
                              )
                            }
                            style={{
                              border:
                                "none",
                              background:
                                "transparent",
                              cursor:
                                "pointer",
                            }}
                          >
                            🗑️
                          </button>

                        </>
                      ) : (

                        <div
                          style={{
                            display:
                              "flex",
                            gap:
                              "8px",
                            width:
                              "100%",
                            alignItems:
                              "center",
                          }}
                        >

                          <input
                            value={
                              editName
                            }
                            onChange={(
                              event
                            ) =>
                              setEditName(
                                event
                                  .target
                                  .value
                              )
                            }
                            style={{
                              flex:
                                2,
                              padding:
                                "8px",
                            }}
                          />

                          <input
                            type="number"
                            min="1"
                            value={
                              editQuantity
                            }
                            onChange={(
                              event
                            ) =>
                              setEditQuantity(
                                event
                                  .target
                                  .value
                              )
                            }
                            style={{
                              width:
                                "65px",
                              padding:
                                "8px",
                            }}
                          />

                          <input
                            type="number"
                            min="0"
                            value={
                              editPrice
                            }
                            onChange={(
                              event
                            ) =>
                              setEditPrice(
                                event
                                  .target
                                  .value
                              )
                            }
                            style={{
                              width:
                                "80px",
                              padding:
                                "8px",
                            }}
                          />

                          <button
                            onClick={() =>
                              saveItem(
                                item._id
                              )
                            }
                            style={{
                              border:
                                "none",
                              background:
                                "#80539b",
                              color:
                                "white",
                              padding:
                                "8px 12px",
                              borderRadius:
                                "8px",
                              cursor:
                                "pointer",
                            }}
                          >
                            ✓
                          </button>

                          <button
                            onClick={
                              cancelEditing
                            }
                            style={{
                              border:
                                "none",
                              background:
                                "#eee",
                              padding:
                                "8px 12px",
                              borderRadius:
                                "8px",
                              cursor:
                                "pointer",
                            }}
                          >
                            ✕
                          </button>

                        </div>
                      )}

                    </div>
                  )
                )

              ) : (

                <p
                  style={{
                    padding:
                      "30px",
                    textAlign:
                      "center",
                    color:
                      "#8a7d8e",
                  }}
                >
                  This list is empty.
                  <br />
                  Add items to start
                  shopping!
                </p>

              )}

            </div>

            {/* TOTAL */}

            <div className="total-section">

              <span>
                Estimated total
              </span>

              <strong>
                ₹{total}
              </strong>

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="dashboard-side">

            {/* SMART SUGGESTIONS */}

            <div className="mini-card">

              <span className="mini-icon">
                ✨
              </span>

              <h3>
                Smart Suggestions
              </h3>

              <p>
                Based on your previous
                shopping lists.
              </p>

              {suggestions.length >
              0 ? (

                <div
                  style={{
                    marginTop:
                      "15px",
                  }}
                >

                  {suggestions
                    .slice(0, 5)
                    .map(
                      (
                        suggestion
                      ) => (
                        <div
                          key={
                            suggestion.name
                          }
                          style={{
                            padding:
                              "8px 0",
                            borderBottom:
                              "1px solid #eee",
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            gap:
                              "10px",
                          }}
                        >

                          <span>
                            🛒{" "}
                            {
                              suggestion.name
                            }
                          </span>

                          <span
                            style={{
                              fontSize:
                                "12px",
                              color:
                                "#80539b",
                            }}
                          >
                            {
                              suggestion.timesAdded
                            }x
                          </span>

                        </div>
                      )
                    )}

                </div>

              ) : (

                <p
                  style={{
                    marginTop:
                      "12px",
                    fontSize:
                      "13px",
                    color:
                      "#8a7d8e",
                  }}
                >
                  Add more items to
                  get suggestions.
                </p>

              )}

            </div>

            {/* BUDGET WATCH */}

            <div className="mini-card">

              <span className="mini-icon">
                💰
              </span>

              <h3>
                Budget Watch
              </h3>

              {budgetInfo &&
              budgetInfo.budget >
                0 ? (

                <>

                  <p>
                    Budget:{" "}
                    <strong>
                      ₹
                      {
                        budgetInfo.budget
                      }
                    </strong>
                  </p>

                  <p>
                    Estimated:{" "}
                    <strong>
                      ₹
                      {
                        budgetInfo.estimatedTotal
                      }
                    </strong>
                  </p>

                  <p
                    style={{
                      fontWeight:
                        "700",
                      marginTop:
                        "10px",
                    }}
                  >
                    {budgetInfo.remaining >=
                    0
                      ? `₹${budgetInfo.remaining} remaining`
                      : `₹${Math.abs(
                          budgetInfo.remaining
                        )} over budget`}
                  </p>

                  <p
                    style={{
                      marginTop:
                        "8px",
                      color:
                        budgetInfo.status ===
                        "over-budget"
                          ? "#b34b4b"
                          : budgetInfo.status ===
                              "warning"
                            ? "#b07820"
                            : "#4b8a62",
                      fontWeight:
                        "600",
                    }}
                  >
                    {getBudgetMessage()}
                  </p>

                </>

              ) : (

                <p>
                  No budget set for
                  this list.
                  <br />
                  Edit the list to
                  add one.
                </p>

              )}

            </div>

            {/* SHOPPING INSIGHTS */}

            <div className="mini-card">

              <span className="mini-icon">
                📊
              </span>

              <h3>
                Shopping Insights
              </h3>

              {insights ? (

                <>

                  <p>
                    Lists created:{" "}
                    <strong>
                      {
                        insights.totalLists
                      }
                    </strong>
                  </p>

                  <p>
                    Total items:{" "}
                    <strong>
                      {
                        insights.totalItems
                      }
                    </strong>
                  </p>

                  <p>
                    Purchased:{" "}
                    <strong>
                      {
                        insights.purchasedItems
                      }
                    </strong>
                  </p>

                  <p>
                    Completion:{" "}
                    <strong>
                      {
                        insights.completionRate
                      }%
                    </strong>
                  </p>

                  <p>
                    Purchased spending:{" "}
                    <strong>
                      ₹
                      {
                        insights.totalSpending
                      }
                    </strong>
                  </p>

                  <button
                    onClick={() =>
                      setShowInsights(
                        !showInsights
                      )
                    }
                    style={{
                      marginTop:
                        "12px",
                      border:
                        "none",
                      background:
                        "#f5edfa",
                      color:
                        "#80539b",
                      padding:
                        "8px 12px",
                      borderRadius:
                        "8px",
                      cursor:
                        "pointer",
                      fontWeight:
                        "600",
                    }}
                  >
                    {showInsights
                      ? "Hide details"
                      : "View details"}
                  </button>

                  {showInsights && (
                    <div
                      style={{
                        marginTop:
                          "15px",
                      }}
                    >

                      <strong>
                        Top Categories
                      </strong>

                      {insights.topCategories
                        ?.length >
                      0 ? (
                        insights.topCategories.map(
                          (
                            category
                          ) => (
                            <p
                              key={
                                category.name
                              }
                              style={{
                                fontSize:
                                  "13px",
                              }}
                            >
                              {category.name}
                              : ₹
                              {
                                category.amount
                              }
                            </p>
                          )
                        )
                      ) : (
                        <p>
                          No category
                          data yet.
                        </p>
                      )}

                      <strong>
                        Frequently Added
                      </strong>

                      {insights.frequentItems
                        ?.length >
                      0 ? (
                        insights.frequentItems.map(
                          (item) => (
                            <p
                              key={
                                item.name
                              }
                              style={{
                                fontSize:
                                  "13px",
                              }}
                            >
                              🛒{" "}
                              {
                                item.name
                              }{" "}
                              —{" "}
                              {item.count}x
                            </p>
                          )
                        )
                      ) : (
                        <p>
                          No item
                          history yet.
                        </p>
                      )}

                    </div>
                  )}

                </>

              ) : (

                <p>
                  Your shopping
                  insights will
                  appear here.
                </p>

              )}

            </div>

          </div>

        </div>

      </main>

      {/* =================================================
          CREATE LIST POPUP
      ================================================= */}

      {showCreateList && (
        <div
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(30,20,40,0.45)",
            display:
              "flex",
            justifyContent:
              "center",
            alignItems:
              "center",
            zIndex:
              9999,
          }}
        >

          <div
            style={{
              width:
                "420px",
              maxWidth:
                "90%",
              background:
                "white",
              padding:
                "35px",
              borderRadius:
                "24px",
              boxShadow:
                "0 25px 70px rgba(0,0,0,0.2)",
            }}
          >

            <h2>
              Create New List
            </h2>

            <p
              style={{
                color:
                  "#8a7d8e",
              }}
            >
              Give your new shopping
              list a name.
            </p>

            <form
              onSubmit={
                createList
              }
            >

              <input
                type="text"
                placeholder="e.g. College Snacks"
                value={
                  listName
                }
                onChange={(
                  event
                ) =>
                  setListName(
                    event.target
                      .value
                  )
                }
                required
                style={{
                  width:
                    "100%",
                  padding:
                    "13px",
                  marginTop:
                    "20px",
                  boxSizing:
                    "border-box",
                  border:
                    "1px solid #ddd",
                  borderRadius:
                    "10px",
                  fontSize:
                    "16px",
                }}
              />

              <label
                style={{
                  display:
                    "block",
                  marginTop:
                    "15px",
                  marginBottom:
                    "7px",
                  fontWeight:
                    "600",
                }}
              >
                Repeat this list?
              </label>

              <select
                value={
                  listRecurring
                    ? listFrequency
                    : "none"
                }
                onChange={(
                  event
                ) => {
                  const value =
                    event.target
                      .value;

                  if (
                    value ===
                    "none"
                  ) {
                    setListRecurring(
                      false
                    );
                    setListFrequency(
                      "none"
                    );
                  } else {
                    setListRecurring(
                      true
                    );
                    setListFrequency(
                      value
                    );
                  }
                }}
                style={{
                  width:
                    "100%",
                  padding:
                    "13px",
                  boxSizing:
                    "border-box",
                  border:
                    "1px solid #ddd",
                  borderRadius:
                    "10px",
                  fontSize:
                    "16px",
                  background:
                    "white",
                }}
              >

                <option value="none">
                  No recurrence
                </option>

                <option value="weekly">
                  Every week
                </option>

                <option value="monthly">
                  Every month
                </option>

              </select>

              <label
                style={{
                  display:
                    "block",
                  marginTop:
                    "15px",
                  marginBottom:
                    "7px",
                  fontWeight:
                    "600",
                }}
              >
                Budget ₹
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  listBudget
                }
                onChange={(
                  event
                ) =>
                  setListBudget(
                    event.target
                      .value
                  )
                }
                style={{
                  width:
                    "100%",
                  padding:
                    "13px",
                  boxSizing:
                    "border-box",
                  border:
                    "1px solid #ddd",
                  borderRadius:
                    "10px",
                  fontSize:
                    "16px",
                }}
              />

              <button
                type="submit"
                className="new-list-button"
                style={{
                  width:
                    "100%",
                  marginTop:
                    "20px",
                }}
              >
                Create List →
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCreateList(
                    false
                  );
                  setListName("");
                  setListRecurring(
                    false
                  );
                  setListFrequency(
                    "none"
                  );
                  setListBudget(0);
                }}
                style={{
                  width:
                    "100%",
                  padding:
                    "12px",
                  marginTop:
                    "10px",
                  border:
                    "1px solid #ddd",
                  borderRadius:
                    "10px",
                  background:
                    "white",
                  cursor:
                    "pointer",
                }}
              >
                Cancel
              </button>

            </form>

          </div>

        </div>
      )}

      {/* =================================================
          EDIT LIST POPUP
      ================================================= */}

      {showEditList &&
        selectedList && (
          <div
            style={{
              position:
                "fixed",
              inset: 0,
              background:
                "rgba(30,20,40,0.45)",
              display:
                "flex",
              justifyContent:
                "center",
              alignItems:
                "center",
              zIndex:
                9999,
            }}
          >

            <div
              style={{
                width:
                  "420px",
                maxWidth:
                  "90%",
                background:
                  "white",
                padding:
                  "35px",
                borderRadius:
                  "24px",
                boxShadow:
                  "0 25px 70px rgba(0,0,0,0.2)",
              }}
            >

              <h2>
                Edit Shopping List
              </h2>

              <p
                style={{
                  color:
                    "#8a7d8e",
                }}
              >
                Update your list
                details.
              </p>

              <form
                onSubmit={
                  updateList
                }
              >

                <label
                  style={{
                    display:
                      "block",
                    marginTop:
                      "20px",
                    marginBottom:
                      "7px",
                    fontWeight:
                      "600",
                  }}
                >
                  List Name
                </label>

                <input
                  type="text"
                  value={
                    editListName
                  }
                  onChange={(
                    event
                  ) =>
                    setEditListName(
                      event.target
                        .value
                    )
                  }
                  required
                  style={{
                    width:
                      "100%",
                    padding:
                      "13px",
                    boxSizing:
                      "border-box",
                    border:
                      "1px solid #ddd",
                    borderRadius:
                      "10px",
                    fontSize:
                      "16px",
                  }}
                />

                <label
                  style={{
                    display:
                      "block",
                    marginTop:
                      "15px",
                    marginBottom:
                      "7px",
                    fontWeight:
                      "600",
                  }}
                >
                  Repeat this list?
                </label>

                <select
                  value={
                    editListRecurring
                      ? editListFrequency
                      : "none"
                  }
                  onChange={(
                    event
                  ) => {
                    const value =
                      event.target
                        .value;

                    if (
                      value ===
                      "none"
                    ) {
                      setEditListRecurring(
                        false
                      );
                      setEditListFrequency(
                        "none"
                      );
                    } else {
                      setEditListRecurring(
                        true
                      );
                      setEditListFrequency(
                        value
                      );
                    }
                  }}
                  style={{
                    width:
                      "100%",
                    padding:
                      "13px",
                    boxSizing:
                      "border-box",
                    border:
                      "1px solid #ddd",
                    borderRadius:
                      "10px",
                    fontSize:
                      "16px",
                    background:
                      "white",
                  }}
                >

                  <option value="none">
                    No recurrence
                  </option>

                  <option value="weekly">
                    Every week
                  </option>

                  <option value="monthly">
                    Every month
                  </option>

                </select>

                <label
                  style={{
                    display:
                      "block",
                    marginTop:
                      "15px",
                    marginBottom:
                      "7px",
                    fontWeight:
                      "600",
                  }}
                >
                  Budget ₹
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    editListBudget
                  }
                  onChange={(
                    event
                  ) =>
                    setEditListBudget(
                      event.target
                        .value
                    )
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      "13px",
                    boxSizing:
                      "border-box",
                    border:
                      "1px solid #ddd",
                    borderRadius:
                      "10px",
                    fontSize:
                      "16px",
                  }}
                />

                <button
                  type="submit"
                  className="new-list-button"
                  style={{
                    width:
                      "100%",
                    marginTop:
                      "25px",
                  }}
                >
                  Save Changes →
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowEditList(
                      false
                    );
                    setEditListName("");
                    setEditListRecurring(
                      false
                    );
                    setEditListFrequency(
                      "none"
                    );
                    setEditListBudget(
                      0
                    );
                  }}
                  style={{
                    width:
                      "100%",
                    padding:
                      "12px",
                    marginTop:
                      "10px",
                    border:
                      "1px solid #ddd",
                    borderRadius:
                      "10px",
                    background:
                      "white",
                    cursor:
                      "pointer",
                  }}
                >
                  Cancel
                </button>

              </form>

            </div>
          </div>
        )}

      {/* =================================================
          ADD ITEM POPUP
      ================================================= */}

      {showAddItem &&
        selectedList && (
          <div
            style={{
              position:
                "fixed",
              inset: 0,
              background:
                "rgba(30,20,40,0.45)",
              display:
                "flex",
              justifyContent:
                "center",
              alignItems:
                "center",
              zIndex:
                9999,
            }}
          >

            <div
              style={{
                width:
                  "450px",
                maxWidth:
                  "90%",
                background:
                  "white",
                padding:
                  "35px",
                borderRadius:
                  "24px",
                boxShadow:
                  "0 25px 70px rgba(0,0,0,0.2)",
              }}
            >

              <h2>
                Add Item
              </h2>

              <p
                style={{
                  color:
                    "#8a7d8e",
                }}
              >
                Add an item to{" "}
                <strong>
                  {
                    selectedList.name
                  }
                </strong>
              </p>

              <form
                onSubmit={
                  addItem
                }
              >

                <label
                  style={{
                    display:
                      "block",
                    marginTop:
                      "20px",
                    marginBottom:
                      "7px",
                    fontWeight:
                      "600",
                  }}
                >
                  Item Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Milk"
                  value={
                    itemName
                  }
                  onChange={(
                    event
                  ) =>
                    setItemName(
                      event.target
                        .value
                    )
                  }
                  required
                  style={{
                    width:
                      "100%",
                    padding:
                      "13px",
                    boxSizing:
                      "border-box",
                    border:
                      "1px solid #ddd",
                    borderRadius:
                      "10px",
                    fontSize:
                      "16px",
                  }}
                />

                <label
                  style={{
                    display:
                      "block",
                    marginTop:
                      "15px",
                    marginBottom:
                      "7px",
                    fontWeight:
                      "600",
                  }}
                >
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    itemQuantity
                  }
                  onChange={(
                    event
                  ) =>
                    setItemQuantity(
                      event.target
                        .value
                    )
                  }
                  required
                  style={{
                    width:
                      "100%",
                    padding:
                      "13px",
                    boxSizing:
                      "border-box",
                    border:
                      "1px solid #ddd",
                    borderRadius:
                      "10px",
                    fontSize:
                      "16px",
                  }}
                />

                <label
                  style={{
                    display:
                      "block",
                    marginTop:
                      "15px",
                    marginBottom:
                      "7px",
                    fontWeight:
                      "600",
                  }}
                >
                  Category
                </label>

                <select
                  value={
                    itemCategory
                  }
                  onChange={(
                    event
                  ) =>
                    setItemCategory(
                      event.target
                        .value
                    )
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      "13px",
                    boxSizing:
                      "border-box",
                    border:
                      "1px solid #ddd",
                    borderRadius:
                      "10px",
                    fontSize:
                      "16px",
                    background:
                      "white",
                  }}
                >

                  <option value="Other">
                    Other
                  </option>

                  <option value="Dairy">
                    Dairy
                  </option>

                  <option value="Fruits">
                    Fruits
                  </option>

                  <option value="Vegetables">
                    Vegetables
                  </option>

                  <option value="Bakery">
                    Bakery
                  </option>

                  <option value="Snacks">
                    Snacks
                  </option>

                  <option value="Beverages">
                    Beverages
                  </option>

                  <option value="Household">
                    Household
                  </option>

                </select>

                <label
                  style={{
                    display:
                      "block",
                    marginTop:
                      "15px",
                    marginBottom:
                      "7px",
                    fontWeight:
                      "600",
                  }}
                >
                  Estimated Price
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    itemPrice
                  }
                  onChange={(
                    event
                  ) =>
                    setItemPrice(
                      event.target
                        .value
                    )
                  }
                  required
                  style={{
                    width:
                      "100%",
                    padding:
                      "13px",
                    boxSizing:
                      "border-box",
                    border:
                      "1px solid #ddd",
                    borderRadius:
                      "10px",
                    fontSize:
                      "16px",
                  }}
                />

                <button
                  type="submit"
                  className="new-list-button"
                  style={{
                    width:
                      "100%",
                    marginTop:
                      "25px",
                  }}
                >
                  Add Item →
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddItem(
                      false
                    );
                    setItemName("");
                    setItemQuantity(
                      1
                    );
                    setItemCategory(
                      "Other"
                    );
                    setItemPrice(
                      0
                    );
                  }}
                  style={{
                    width:
                      "100%",
                    padding:
                      "12px",
                    marginTop:
                      "10px",
                    border:
                      "1px solid #ddd",
                    borderRadius:
                      "10px",
                    background:
                      "white",
                    cursor:
                      "pointer",
                  }}
                >
                  Cancel
                </button>

              </form>

            </div>
          </div>
        )}

      {/* =================================================
          SHOPSMART CUSTOM MODAL
      ================================================= */}

      {modal.show && (
        <div
          onClick={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(45, 30, 55, 0.42)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter:
              "blur(8px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 20000,
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "430px",
              maxWidth: "100%",
              background: "#fffdfd",
              borderRadius: "28px",
              padding: "34px",
              boxSizing: "border-box",
              textAlign: "center",
              boxShadow:
                "0 30px 90px rgba(50, 30, 70, 0.25)",
              border:
                "1px solid rgba(128, 83, 155, 0.14)",
              animation:
                "shopSmartModalIn 0.22s ease-out",
            }}
          >
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                margin: "0 auto 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                background:
                  modal.type === "error"
                    ? "#fff0f0"
                    : modal.type === "delete"
                    ? "#fff3ee"
                    : "#f3e8fa",
              }}
            >
              {modal.type === "error"
                ? "!"
                : modal.type === "delete"
                ? "🗑️"
                : "✨"}
            </div>

            <h2
              style={{
                margin: "0 0 10px",
                color: "#33283a",
                fontSize: "24px",
                fontWeight: "700",
              }}
            >
              {modal.title}
            </h2>

            <p
              style={{
                margin: "0 auto",
                maxWidth: "350px",
                color: "#8a7d8e",
                fontSize: "15px",
                lineHeight: "1.6",
              }}
            >
              {modal.message}
            </p>

            {modal.confirm ? (
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "28px",
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: "13px",
                    borderRadius: "12px",
                    border:
                      "1px solid #e4dce7",
                    background: "white",
                    color: "#665a6c",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (modal.onConfirm) {
                      modal.onConfirm();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "13px",
                    borderRadius: "12px",
                    border: "none",
                    background:
                      "linear-gradient(135deg, #80539b, #684080)",
                    color: "white",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "14px",
                    boxShadow:
                      "0 8px 20px rgba(128, 83, 155, 0.25)",
                  }}
                >
                  Delete List
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={closeModal}
                style={{
                  width: "100%",
                  marginTop: "28px",
                  padding: "13px",
                  borderRadius: "12px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #80539b, #684080)",
                  color: "white",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                  boxShadow:
                    "0 8px 20px rgba(128, 83, 155, 0.25)",
                }}
              >
                Got it ✨
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// =====================================================
// MAIN APP
// =====================================================

function App() {
  const [
    showDashboard,
    setShowDashboard,
  ] = useState(false);

  const [
    showLogin,
    setShowLogin,
  ] = useState(false);

  const [
    showRegister,
    setShowRegister,
  ] = useState(false);

  // REGISTER
  if (showRegister) {
    return (
      <Register
        onRegister={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
        onBack={() =>
          setShowRegister(false)
        }
      />
    );
  }

  // LOGIN
  if (showLogin) {
    return (
      <Login
        onLogin={() => {
          setShowLogin(false);
          setShowDashboard(true);
        }}
        onBack={() =>
          setShowLogin(false)
        }
      />
    );
  }

  // DASHBOARD
  if (showDashboard) {
    return (
      <Dashboard
        onBack={() =>
          setShowDashboard(false)
        }
      />
    );
  }

  // =====================================================
  // LANDING PAGE
  // =====================================================

  return (
    <div className="landing-page">

      <nav className="navbar">

        <div className="logo">

          <span className="logo-icon">
            🛒
          </span>

          <span>
            ShopSmart
          </span>

        </div>

        <div className="nav-links">

          <a href="#features">
            Features
          </a>

          <a href="#how">
            How it works
          </a>

          <button
            className="login-btn"
            onClick={() =>
              setShowLogin(true)
            }
          >
            Log in
          </button>

          <button
            className="signup-btn"
            onClick={() =>
              setShowRegister(true)
            }
          >
            Get Started
          </button>

        </div>

      </nav>

      <section className="hero">

        <div className="hero-content">

          <div className="hero-badge">
            ✨ Smarter shopping starts here
          </div>

          <h1>
            Your
            <br />
            groceries.
            <br />
            <span>
              Your way.
            </span>
          </h1>

          <p>
            Create beautiful shopping
            lists, track your spending,
            and never forget the little
            things again.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-btn"
              onClick={() =>
                setShowRegister(true)
              }
            >
              Start Shopping →
            </button>

            <button
              className="secondary-btn"
              onClick={() =>
                document
                  .getElementById(
                    "how"
                  )
                  ?.scrollIntoView({
                    behavior:
                      "smooth",
                  })
              }
            >
              See how it works
            </button>

          </div>

          <div className="hero-features">
            ✦ Free to use
            &nbsp; • &nbsp;
            Simple
            &nbsp; • &nbsp;
            Smart
          </div>

        </div>

        <div className="hero-card">

          <div className="shopping-preview">

            <div className="preview-top">

              <div>

                <small>
                  THIS WEEK
                </small>

                <h2>
                  Weekend Grocery
                </h2>

              </div>

              <span className="weekly-badge">
                ↻ Weekly
              </span>

            </div>

            <div className="progress-info">

              <span>
                Shopping progress
              </span>

              <strong>
                20%
              </strong>

            </div>

            <div className="progress-bar">

              <div
                className="progress-fill"
                style={{
                  width:
                    "20%",
                }}
              />

            </div>

            <div className="preview-item purchased">

              <span>
                ✓
              </span>

              <s>
                Milk
              </s>

              <strong>
                ₹60
              </strong>

            </div>

            <div className="preview-item">

              <span>
                ○
              </span>

              <span>
                Eggs
              </span>

              <strong>
                ₹90
              </strong>

            </div>

            <div className="preview-item">

              <span>
                ○
              </span>

              <span>
                Apples
              </span>

              <strong>
                ₹120
              </strong>

            </div>

            <div className="preview-item">

              <span>
                ○
              </span>

              <span>
                Bread
              </span>

              <strong>
                ₹45
              </strong>

            </div>

            <div className="preview-item">

              <span>
                ○
              </span>

              <span>
                Chips
              </span>

              <strong>
                ₹60
              </strong>

            </div>

            <div className="total">

              <span>
                Estimated total
              </span>

              <strong>
                ₹375
              </strong>

            </div>

          </div>

        </div>

      </section>

      <section
        className="features-section"
        id="features"
      >

        <p className="section-label">
          WHY SHOPSMART?
        </p>

        <h2>
          Shopping, but{" "}
          <span>
            smarter.
          </span>
        </h2>

        <div className="features-grid">

          <div className="feature-card">

            <div className="feature-icon">
              ✓
            </div>

            <h3>
              Smart Lists
            </h3>

            <p>
              Create and organize your
              shopping lists easily.
            </p>

          </div>

          <div className="feature-card">

            <div className="feature-icon">
              ₹
            </div>

            <h3>
              Track Spending
            </h3>

            <p>
              Know how much you're
              spending before checkout.
            </p>

          </div>

          <div className="feature-card">

            <div className="feature-icon">
              ↻
            </div>

            <h3>
              Recurring Lists
            </h3>

            <p>
              Keep weekly and monthly
              shopping lists ready.
            </p>

          </div>

          <div className="feature-card">

            <div className="feature-icon">
              ✦
            </div>

            <h3>
              Shopping Insights
            </h3>

            <p>
              Understand your shopping
              habits at a glance.
            </p>

          </div>

        </div>

      </section>

      <section
        className="how-section"
        id="how"
      >

        <p className="section-label">
          HOW IT WORKS
        </p>

        <h2>
          Simple from{" "}
          <span>
            start to finish.
          </span>
        </h2>

        <div className="how-grid">

          <div className="how-card">

            <div className="how-number">
              1
            </div>

            <h3>
              Create your list
            </h3>

            <p>
              Add everything you need
              for your next shopping trip.
            </p>

          </div>

          <div className="how-card">

            <div className="how-number">
              2
            </div>

            <h3>
              Track your spending
            </h3>

            <p>
              Keep an eye on your
              estimated total while shopping.
            </p>

          </div>

          <div className="how-card">

            <div className="how-number">
              3
            </div>

            <h3>
              Shop smarter
            </h3>

            <p>
              Stay organized and never
              forget the little things.
            </p>

          </div>

        </div>

      </section>

      <section className="cta-section">

        <p>
          READY TO SHOP SMARTER?
        </p>

        <h2>
          Make your next shopping trip
          <br />
          a little smarter.
        </h2>

        <button
          className="cta-button"
          onClick={() =>
            setShowRegister(true)
          }
        >
          Create my first list →
        </button>

      </section>

    </div>
  );
}

export default App;