const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const listRoutes = require("./routes/lists");
const historyRoutes = require("./routes/history");
const ingredientRoutes = require("./routes/ingredientRoutes");

const app = express();


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());


// ===============================
// ROUTES
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/ingredients", ingredientRoutes);
console.log("INGREDIENT ROUTE LOADED");
// ===============================
// TEST ROUTE
// ===============================

app.get("/", (req, res) => {
    res.send("ShopSmart API is working!");
});


// ===============================
// CONNECT TO MONGODB
// ===============================

mongoose.connect(process.env.MONGO_URI)

    .then(() => {

        console.log("MongoDB connected");

        // Start server
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });

    })

    .catch((error) => {

        console.log(
            "MongoDB connection error:",
            error
        );

    }); 