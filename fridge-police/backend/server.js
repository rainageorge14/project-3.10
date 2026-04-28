const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

/*
========================================
IN-MEMORY DATA STORAGE
========================================
*/

let fridgeItems = [];
let requests = [];

/*
========================================
HEALTH CHECK
========================================
*/

app.get("/", (req, res) => {
  res.send("FridgePolice Backend is running 🚀");
});

/*
========================================
ADD A NEW FOOD ITEM
========================================
POST /items
Body:
{
  name: "Pizza",
  owner: "Alex",
  quantity: 100,
  expiryDate: "2026-04-30"
}
========================================
*/

app.post("/items", (req, res) => {
  const { name, owner, quantity, expiryDate } = req.body;

  if (!name || !owner || quantity == null || !expiryDate) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  const newItem = {
    id: uuidv4(), // Unique identity for Scenario 3
    name,
    owner,
    quantity,
    expiryDate,
    status: "available",
    createdAt: new Date()
  };

  fridgeItems.push(newItem);

  res.status(201).json({
    message: "Food item added successfully",
    item: newItem
  });
});

/*
========================================
GET ALL FOOD ITEMS
========================================
*/

app.get("/items", (req, res) => {
  res.json(fridgeItems);
});

/*
========================================
GET SINGLE ITEM BY ID
========================================
*/

app.get("/items/:id", (req, res) => {
  const item = fridgeItems.find(i => i.id === req.params.id);

  if (!item) {
    return res.status(404).json({
      message: "Item not found"
    });
  }

  res.json(item);
});

/*
========================================
REQUEST A PORTION
========================================
POST /request
Body:
{
  itemId,
  user,
  portion
}
========================================
SCENARIO 1:
Prevents double allocation
========================================
*/

app.post("/request", (req, res) => {
  const { itemId, user, portion } = req.body;

  if (!itemId || !user || portion == null) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  const item = fridgeItems.find(i => i.id === itemId);

  if (!item) {
    return res.status(404).json({
      message: "Food item not found"
    });
  }

  // Prevent stale or unavailable requests
  if (item.status !== "available") {
    return res.status(400).json({
      message: "Item is not available"
    });
  }

  // Prevent double booking
  if (item.quantity < portion) {
    return res.status(400).json({
      message: "Not enough quantity available"
    });
  }

  // Deduct immediately to reserve portion
  item.quantity -= portion;

  // If quantity becomes zero
  if (item.quantity === 0) {
    item.status = "fully consumed";
  }

  const newRequest = {
    id: uuidv4(),
    itemId,
    user,
    portion,
    approved: true,
    consumed: false,
    expired: false,
    createdAt: new Date()
  };

  requests.push(newRequest);

  res.status(201).json({
    message: "Request approved successfully",
    request: newRequest,
    updatedItem: item
  });
});

/*
========================================
MARK REQUEST AS CONSUMED
========================================
PATCH /request/:id/consume
========================================
*/

app.patch("/request/:id/consume", (req, res) => {
  const request = requests.find(r => r.id === req.params.id);

  if (!request) {
    return res.status(404).json({
      message: "Request not found"
    });
  }

  if (!request.approved || request.expired) {
    return res.status(400).json({
      message: "Request is invalid"
    });
  }

  request.consumed = true;

  res.json({
    message: "Food consumption recorded successfully",
    request
  });
});

/*
========================================
SCENARIO 2:
CLEANUP EXPIRED / STALE REQUESTS
========================================
POST /cleanup
========================================
*/

app.post("/cleanup", (req, res) => {
  const today = new Date();

  requests = requests.map(request => {
    const item = fridgeItems.find(i => i.id === request.itemId);

    if (
      item &&
      new Date(item.expiryDate) < today &&
      !request.consumed
    ) {
      request.approved = false;
      request.expired = true;
    }

    return request;
  });

  // Mark spoiled items
  fridgeItems = fridgeItems.map(item => {
    if (new Date(item.expiryDate) < today) {
      item.status = "spoiled";
    }

    return item;
  });

  res.json({
    message: "Expired approvals cleaned successfully",
    requests,
    fridgeItems
  });
});

/*
========================================
SCENARIO 4:
MANUAL INVENTORY CORRECTION
========================================
PATCH /items/:id/correct
Body:
{
  quantity: 0
}
========================================
*/

app.patch("/items/:id/correct", (req, res) => {
  const { quantity } = req.body;

  const item = fridgeItems.find(i => i.id === req.params.id);

  if (!item) {
    return res.status(404).json({
      message: "Item not found"
    });
  }

  if (quantity == null || quantity < 0) {
    return res.status(400).json({
      message: "Valid quantity is required"
    });
  }

  item.quantity = quantity;

  if (quantity === 0) {
    item.status = "gone";
  } else {
    item.status = "available";
  }

  res.json({
    message: "Inventory corrected successfully",
    item
  });
});

/*
========================================
DELETE ITEM
========================================
*/

app.delete("/items/:id", (req, res) => {
  const itemIndex = fridgeItems.findIndex(
    item => item.id === req.params.id
  );

  if (itemIndex === -1) {
    return res.status(404).json({
      message: "Item not found"
    });
  }

  const deletedItem = fridgeItems.splice(itemIndex, 1);

  res.json({
    message: "Item deleted successfully",
    deletedItem
  });
});

/*
========================================
VIEW ALL REQUESTS
========================================
*/

app.get("/requests", (req, res) => {
  res.json(requests);
});

/*
========================================
START SERVER
========================================
*/

app.listen(PORT, () => {
  console.log(`FridgePolice server running on http://localhost:${PORT}`);
});