const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/bookdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Define Book Schema
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  publisher: String,
  price: Number,
  quantity: Number,
});
const Book = mongoose.model("Book", bookSchema);

// Routes

// Get all books
app.get("/books", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Add a new book
app.post("/books", async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).send(book);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Query books by title or author
app.get("/books/query", async (req, res) => {
  const { title, author } = req.query;
  let query = {};
  if (title) query.title = title;
  if (author) query.author = author;

  try {
    const books = await Book.find(query);
    res.json(books);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Update a book by ID
app.put("/books/:id", async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedBook) {
      return res.status(404).send("Book not found");
    }
    res.send(updatedBook);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Delete a book by ID
app.delete("/books/:id", async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) {
      return res.status(404).send("Book not found");
    }
    res.send(deletedBook);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Get low stock books (quantity < 5)
app.get("/books/low-stock", async (req, res) => {
  try {
    const books = await Book.find({ quantity: { $lt: 5 } });
    res.json(books);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get a single book by ID (for editing)
app.get("/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).send("Book not found");
    }
    res.send(book);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Serve static files
app.use(express.static("public"));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
