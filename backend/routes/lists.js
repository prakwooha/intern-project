const express = require("express");
const jwt = require("jsonwebtoken");
const List = require("../models/List");

const router = express.Router();

// =====================================================
// AUTHENTICATION
// =====================================================

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
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
      message: "Invalid or expired token",
    });
  }
};

// =====================================================
// RECURRING LIST HELPER
// =====================================================

const getNextDate = (date, frequency) => {
  const next = new Date(date);

  if (frequency === "monthly") {
    next.setMonth(next.getMonth() + 1);
  } else {
    next.setDate(next.getDate() + 7);
  }

  return next;
};

// =====================================================
// PROCESS RECURRING LISTS
// =====================================================

const processRecurringLists = async (userId) => {
  const now = new Date();

  const recurringLists = await List.find({
    userId,
    recurring: true,
    recurringFrequency: {
      $in: ["weekly", "monthly"],
    },
    nextRecurringAt: {
      $lte: now,
    },
  });

  for (const original of recurringLists) {
    const copiedItems = (original.items || []).map(
      (item) => ({
        name: item.name,
        quantity: item.quantity,
        category: item.category,
        estimatedPrice: item.estimatedPrice,
        purchased: false,
      })
    );

    const nextDue = getNextDate(
      now,
      original.recurringFrequency
    );

    await List.create({
      userId: original.userId,

      name: `${original.name} - ${
        original.recurringFrequency === "weekly"
          ? "Weekly"
          : "Monthly"
      }`,

      items: copiedItems,

      recurring: true,

      recurringFrequency:
        original.recurringFrequency,

      budget: original.budget || 0,

      nextRecurringAt: nextDue,
    });

    original.nextRecurringAt = nextDue;

    await original.save();
  }
};

// =====================================================
// CREATE LIST
// POST /api/lists
// =====================================================

router.post("/", protect, async (req, res) => {
  try {
    const {
      name,
      recurring,
      recurringFrequency,
      budget,
    } = req.body;

    const isRecurring =
      recurring === true &&
      ["weekly", "monthly"].includes(
        recurringFrequency
      );

    const now = new Date();

    const newList = new List({
      userId: req.userId,

      name: name?.trim(),

      recurring: isRecurring,

      recurringFrequency: isRecurring
        ? recurringFrequency
        : "none",

      budget: Number(budget) || 0,

      items: [],

      nextRecurringAt: isRecurring
        ? getNextDate(
            now,
            recurringFrequency
          )
        : null,
    });

    await newList.save();

    res.status(201).json({
      message: "Shopping list created",

      list: newList,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// =====================================================
// GET ALL LISTS
// GET /api/lists
// =====================================================

router.get("/", protect, async (req, res) => {
  try {
    await processRecurringLists(
      req.userId
    );

    const lists = await List.find({
      userId: req.userId,
    }).sort({
      createdAt: -1,
    });

    res.json(lists);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// =====================================================
// SMART SUGGESTIONS
// IMPORTANT: THIS MUST COME BEFORE /:id
// =====================================================

router.get(
  "/suggestions",
  protect,
  async (req, res) => {
    try {
      const lists = await List.find({
        userId: req.userId,
      });

      const counts = {};

      lists.forEach((list) => {
        (list.items || []).forEach(
          (item) => {
            const name =
              item.name?.trim();

            if (!name) {
              return;
            }

            const key =
              name.toLowerCase();

            if (!counts[key]) {
              counts[key] = {
                name,
                timesAdded: 0,
              };
            }

            counts[key].timesAdded += 1;
          }
        );
      });

      const suggestions =
        Object.values(counts)
          .sort(
            (a, b) =>
              b.timesAdded -
              a.timesAdded
          )
          .slice(0, 10);

      res.json({
        suggestions,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// =====================================================
// SHOPPING INSIGHTS
// =====================================================

router.get(
  "/insights",
  protect,
  async (req, res) => {
    try {
      const lists = await List.find({
        userId: req.userId,
      });

      let totalItems = 0;
      let purchasedItems = 0;
      let totalSpending = 0;
      let estimatedSpending = 0;

      const categories = {};

      lists.forEach((list) => {
        (list.items || []).forEach(
          (item) => {
            const quantity =
              Number(item.quantity) || 1;

            const price =
              Number(
                item.estimatedPrice
              ) || 0;

            const lineTotal =
              quantity * price;

            totalItems += quantity;

            estimatedSpending +=
              lineTotal;

            if (item.purchased) {
              purchasedItems +=
                quantity;

              totalSpending +=
                lineTotal;
            }

            const category =
              item.category ||
              "Other";

            categories[category] =
              (categories[category] ||
                0) + quantity;
          }
        );
      });

      const completionRate =
        totalItems > 0
          ? Math.round(
              (purchasedItems /
                totalItems) *
                100
            )
          : 0;

      const topCategory =
        Object.entries(categories)
          .sort(
            (a, b) =>
              b[1] - a[1]
          )[0] || null;

      res.json({
        totalLists:
          lists.length,

        totalItems,

        purchasedItems,

        completionRate,

        totalSpending,

        estimatedSpending,

        topCategory:
          topCategory
            ? {
                name:
                  topCategory[0],

                quantity:
                  topCategory[1],
              }
            : null,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// =====================================================
// GET ONE LIST
// GET /api/lists/:id
// =====================================================

router.get(
  "/:id",
  protect,
  async (req, res) => {
    try {
      const list =
        await List.findOne({
          _id: req.params.id,
          userId: req.userId,
        });

      if (!list) {
        return res.status(404).json({
          message:
            "Shopping list not found",
        });
      }

      res.json(list);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// =====================================================
// UPDATE LIST
// =====================================================

router.put(
  "/:id",
  protect,
  async (req, res) => {
    try {
      const {
        name,
        recurring,
        recurringFrequency,
        budget,
      } = req.body;

      const existing =
        await List.findOne({
          _id: req.params.id,
          userId: req.userId,
        });

      if (!existing) {
        return res.status(404).json({
          message:
            "Shopping list not found",
        });
      }

      const isRecurring =
        recurring === true &&
        ["weekly", "monthly"].includes(
          recurringFrequency
        );

      const updateData = {
        name: name?.trim(),

        recurring: isRecurring,

        recurringFrequency:
          isRecurring
            ? recurringFrequency
            : "none",

        budget:
          Number(budget) || 0,

        nextRecurringAt:
          isRecurring
            ? existing.recurring &&
              existing.nextRecurringAt
              ? existing.nextRecurringAt
              : getNextDate(
                  new Date(),
                  recurringFrequency
                )
            : null,
      };

      const list =
        await List.findOneAndUpdate(
          {
            _id: req.params.id,
            userId: req.userId,
          },
          updateData,
          {
            new: true,
          }
        );

      res.json({
        message:
          "Shopping list updated",

        list,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// =====================================================
// DELETE LIST
// =====================================================

router.delete(
  "/:id",
  protect,
  async (req, res) => {
    try {
      const list =
        await List.findOneAndDelete({
          _id: req.params.id,
          userId: req.userId,
        });

      if (!list) {
        return res.status(404).json({
          message:
            "Shopping list not found",
        });
      }

      res.json({
        message:
          "Shopping list deleted",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// =====================================================
// ADD ITEM
// =====================================================

router.post(
  "/:id/items",
  protect,
  async (req, res) => {
    try {
      const {
        name,
        quantity,
        category,
        estimatedPrice,
      } = req.body;

      const list =
        await List.findOne({
          _id: req.params.id,
          userId: req.userId,
        });

      if (!list) {
        return res.status(404).json({
          message:
            "Shopping list not found",
        });
      }

      list.items.push({
        name: name?.trim(),

        quantity:
          Number(quantity) || 1,

        category:
          category || "Other",

        estimatedPrice:
          Number(
            estimatedPrice
          ) || 0,

        purchased: false,
      });

      await list.save();

      res.status(201).json({
        message: "Item added",

        list,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// =====================================================
// UPDATE ITEM
// =====================================================

router.put(
  "/:id/items/:itemId",
  protect,
  async (req, res) => {
    try {
      const list =
        await List.findOne({
          _id: req.params.id,
          userId: req.userId,
        });

      if (!list) {
        return res.status(404).json({
          message:
            "Shopping list not found",
        });
      }

      const item =
        list.items.id(
          req.params.itemId
        );

      if (!item) {
        return res.status(404).json({
          message:
            "Item not found",
        });
      }

      if (
        req.body.name !==
        undefined
      ) {
        item.name =
          req.body.name.trim();
      }

      if (
        req.body.quantity !==
        undefined
      ) {
        item.quantity =
          Number(
            req.body.quantity
          ) || 1;
      }

      if (
        req.body.category !==
        undefined
      ) {
        item.category =
          req.body.category ||
          "Other";
      }

      if (
        req.body.estimatedPrice !==
        undefined
      ) {
        item.estimatedPrice =
          Number(
            req.body.estimatedPrice
          ) || 0;
      }

      if (
        req.body.purchased !==
        undefined
      ) {
        item.purchased =
          Boolean(
            req.body.purchased
          );
      }

      await list.save();

      res.json({
        message: "Item updated",

        list,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// =====================================================
// DELETE ITEM
// =====================================================

router.delete(
  "/:id/items/:itemId",
  protect,
  async (req, res) => {
    try {
      const list =
        await List.findOne({
          _id: req.params.id,
          userId: req.userId,
        });

      if (!list) {
        return res.status(404).json({
          message:
            "Shopping list not found",
        });
      }

      const item =
        list.items.id(
          req.params.itemId
        );

      if (!item) {
        return res.status(404).json({
          message:
            "Item not found",
        });
      }

      item.deleteOne();

      await list.save();

      res.json({
        message: "Item deleted",

        list,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// =====================================================
// BUDGET WATCH
// GET /api/lists/:id/budget
// =====================================================

router.get(
  "/:id/budget",
  protect,
  async (req, res) => {
    try {
      const list =
        await List.findOne({
          _id: req.params.id,
          userId: req.userId,
        });

      if (!list) {
        return res.status(404).json({
          message:
            "Shopping list not found",
        });
      }

      const estimatedTotal =
        (list.items || []).reduce(
          (sum, item) =>
            sum +
            Number(
              item.estimatedPrice ||
                0
            ) *
              Number(
                item.quantity || 1
              ),
          0
        );

      const budget =
        Number(
          list.budget || 0
        );

      const remaining =
        budget -
        estimatedTotal;

      let status =
        "no-budget";

      if (budget > 0) {
        if (remaining < 0) {
          status =
            "over-budget";
        } else if (
          remaining <=
          budget * 0.2
        ) {
          status =
            "warning";
        } else {
          status =
            "within-budget";
        }
      }

      res.json({
        budget,

        estimatedTotal,

        remaining,

        status,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

module.exports = router;