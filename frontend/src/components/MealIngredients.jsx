import { useState } from "react";

function MealIngredients({ selectedList, onItemAdded }) {
  const [meal, setMeal] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingIngredient, setAddingIngredient] = useState(null);
  const [error, setError] = useState("");

  // ==========================================
  // FIND INGREDIENTS
  // ==========================================

  const findIngredients = async () => {
    if (!meal.trim()) {
      setError("Please enter a meal name.");
      return;
    }

    setLoading(true);
    setError("");
    setIngredients([]);

    try {
      const response = await fetch(
        "http://localhost:5001/api/ingredients",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            meal: meal.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to get ingredients"
        );
      }

      setIngredients(data.ingredients || []);
    } catch (error) {
      console.error("Find ingredients error:", error);

      setError(
        "Unable to get ingredients. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ADD INGREDIENT TO SELECTED SHOPPING LIST
  // ==========================================

  const addToShoppingList = async (ingredient, index) => {
    // Make sure a shopping list is selected
    if (!selectedList) {
      alert(
        "Please select a shopping list first. 🛒"
      );
      return;
    }

    setAddingIngredient(index);
    setError("");

    try {
      // Get logged-in user's JWT
      const token = localStorage.getItem("token");

      if (!token) {
        alert(
          "You are not logged in. Please login again."
        );
        return;
      }

      // Send ingredient to your MongoDB backend
      const response = await fetch(
        `http://localhost:5001/api/lists/${selectedList._id}/items`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: ingredient.name,

            quantity:
              Number(ingredient.quantity) || 1,

            category:
              ingredient.category || "Other",

            estimatedPrice:
              Number(
                ingredient.estimatedPrice
              ) || 0,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add ingredient"
        );
      }

      // Show success message
      alert(
        `${ingredient.name} added to shopping list! 🛒`
      );

      // Refresh dashboard list
      if (onItemAdded) {
        await onItemAdded();
      }
    } catch (error) {
      console.error(
        "Add ingredient error:",
        error
      );

      alert(
        "Unable to add ingredient to shopping list."
      );
    } finally {
      setAddingIngredient(null);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      style={{
        width: "100%",
      }}
    >
      {/* TITLE */}

      <h2
        style={{
          color: "#1f1425",
          marginBottom: "15px",
        }}
      >
        🍽️ Meal Ingredients
      </h2>

      {/* SELECTED LIST */}

      {selectedList ? (
        <p
          style={{
            color: "#80539b",
            marginBottom: "15px",
            fontWeight: "600",
          }}
        >
          Adding ingredients to:{" "}
          <strong>
            {selectedList.name}
          </strong>
        </p>
      ) : (
        <p
          style={{
            color: "#b34b4b",
            marginBottom: "15px",
          }}
        >
          ⚠️ Please select a shopping list
          before adding ingredients.
        </p>
      )}

      {/* MEAL INPUT */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Enter a meal name..."
          value={meal}
          onChange={(e) =>
            setMeal(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              findIngredients();
            }
          }}
          style={{
            flex: 1,
            minWidth: "220px",
            padding: "12px 15px",
            borderRadius: "10px",
            border: "1px solid #d8c9df",
            outline: "none",
            background: "white",
            color: "black",
            fontSize: "14px",
          }}
        />

        <button
          onClick={findIngredients}
          disabled={loading}
          style={{
            padding: "12px 20px",
            border: "none",
            borderRadius: "10px",
            background: "#80539b",
            color: "white",
            fontWeight: "600",
            cursor: loading
              ? "not-allowed"
              : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading
            ? "Finding..."
            : "✨ Find Ingredients"}
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <p
          style={{
            color: "#b34b4b",
            marginBottom: "15px",
          }}
        >
          {error}
        </p>
      )}

      {/* INGREDIENT RESULTS */}

      {ingredients.length > 0 && (
        <div
          style={{
            marginTop: "20px",
          }}
        >
          <h3
            style={{
              color: "#3b2d42",
              marginBottom: "15px",
            }}
          >
            Ingredients for {meal}
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {ingredients.map(
              (ingredient, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    gap: "15px",
                    padding: "14px 16px",
                    background: "white",
                    borderRadius: "12px",
                    border:
                      "1px solid #eadcf0",
                    flexWrap: "wrap",
                  }}
                >
                  {/* INGREDIENT NAME */}

                  <div
                    style={{
                      flex: 1,
                      minWidth: "180px",
                    }}
                  >
                    <strong
                      style={{
                        color: "#3b2d42",
                      }}
                    >
                      {ingredient.name}
                    </strong>

                    <div
                      style={{
                        marginTop: "4px",
                        color: "#8a7d8e",
                        fontSize: "13px",
                      }}
                    >
                      Quantity:{" "}
                      {ingredient.quantity}
                    </div>
                  </div>

                  {/* ADD BUTTON */}

                  <button
                    onClick={() =>
                      addToShoppingList(
                        ingredient,
                        index
                      )
                    }
                    disabled={
                      addingIngredient === index
                    }
                    style={{
                      border: "none",
                      background:
                        "#80539b",
                      color: "white",
                      padding:
                        "9px 14px",
                      borderRadius:
                        "9px",
                      cursor:
                        addingIngredient ===
                        index
                          ? "not-allowed"
                          : "pointer",
                      fontWeight: "600",
                      opacity:
                        addingIngredient ===
                        index
                          ? 0.7
                          : 1,
                    }}
                  >
                    {addingIngredient ===
                    index
                      ? "Adding..."
                      : "🛒 Add to Shopping List"}
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* NO INGREDIENTS */}

      {!loading &&
        ingredients.length === 0 &&
        !error &&
        meal && (
          <p
            style={{
              color: "#8a7d8e",
              marginTop: "15px",
            }}
          >
            Enter a meal name and click
            "Find Ingredients". 🍳
          </p>
        )}
    </div>
  );
}

export default MealIngredients;