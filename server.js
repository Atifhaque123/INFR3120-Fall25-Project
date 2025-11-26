const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const fs = require("fs");
const session = require("express-session");
const bcrypt = require("bcryptjs");

const usersFile = "./users/users.json";

function readUsers() {
  try {
    const fileData = fs.readFileSync(usersFile, "utf8");
    const parsed = JSON.parse(fileData);
    return parsed.users || [];
  } catch (err) {
    console.log("Error reading users file:", err);
    return [];
  }
}

function saveUsers(usersArray) {
  const data = { users: usersArray };
  fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));
}

function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "You must be logged in to do this" });
  }
  next();
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.use(
  session({
    secret: "event-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

console.log("MONGO_URI from env:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("connected to mongodb"))
  .catch((err) => console.log("connection error:", err));

const itemSchema = new mongoose.Schema({
  title: String,
  date: String,
  time: String,
  location: String,
  status: String,
  createdAt: { type: Date, default: Date.now },
  owner: String,
});

const Item = mongoose.model("Item", itemSchema);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/session-status", (req, res) => {
  if (req.session && req.session.user) {
    return res.json({
      loggedIn: true,
      username: req.session.user.username,
    });
  }
  res.json({ loggedIn: false });
});

app.get("/api/items", requireLogin, async (req, res) => {
  try {
    const username = req.session.user.username;
    const items = await Item.find({ owner: username }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.log("get error:", err);
    res.status(500).json({ error: "error getting items" });
  }
});

app.post("/api/items", requireLogin, async (req, res) => {
  try {
    const username = req.session.user.username;
    const { title, date, time, location, status } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const newItem = await Item.create({
      title,
      date,
      time,
      location,
      status,
      owner: username,
    });

    res.status(201).json(newItem);
  } catch (err) {
    console.log("error in POST /api/items:", err);
    res.status(500).json({ error: "error creating item" });
  }
});

app.put("/api/items/:id", requireLogin, async (req, res) => {
  try {
    const username = req.session.user.username;
    const { title, date, time, location, status } = req.body;

    const updated = await Item.findOneAndUpdate(
      { _id: req.params.id, owner: username },
      { title, date, time, location, status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Item not found or not yours" });
    }

    res.json(updated);
  } catch (err) {
    console.log("put error:", err);
    res.status(500).json({ error: "error updating item" });
  }
});

app.delete("/api/items/:id", requireLogin, async (req, res) => {
  try {
    const username = req.session.user.username;

    const deleted = await Item.findOneAndDelete({
      _id: req.params.id,
      owner: username,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Item not found or not yours." });
    }

    res.json({ message: "deleted" });
  } catch (err) {
    console.log("delete error:", err);
    res.status(500).json({ error: "error deleting item" });
  }
});

app.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  const users = readUsers();
  const existingUser = users.find((u) => u.username === username);

  if (existingUser) {
    return res.status(400).json({ error: "That username is already taken." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now(),
      username: username,
      password: hashedPassword,
    };

    users.push(newUser);
    saveUsers(users);

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.log("Error in /register:", err);
    res.status(500).json({ error: "Problem creating user." });
  }
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const users = readUsers();
  const existingUser = users.find((u) => u.username === username);

  if (!existingUser) {
    return res.status(400).json({ error: "Invalid username or password." });
  }

  try {
    const match = await bcrypt.compare(password, existingUser.password);

    if (!match) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    req.session.user = {
      id: existingUser.id,
      username: existingUser.username,
    };

    res.json({ message: "Login successful." });
  } catch (err) {
    console.log("Error in /login:", err);
    res.status(500).json({ error: "Problem logging in" });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

app.listen(PORT, () => console.log("server running on port", PORT));
