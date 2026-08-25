const express = require("express");
const jwt = require("jsonwebtoken");
const List = require("../models/List");

const router = express.Router();


// Authentication
const protect = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.userId = decoded.userId;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired token"
        });

    }

};


// GET SHOPPING HISTORY
// GET /api/history

router.get("/", protect, async (req, res) => {

    try {

        const history = await List.find({
            userId: req.userId
        }).sort({
            createdAt: -1
        });

        res.json(history);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });

    }

});


module.exports = router;