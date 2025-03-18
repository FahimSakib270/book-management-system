document.addEventListener("DOMContentLoaded", () => {
  const bookListDiv = document.getElementById("bookList");
  const bookForm = document.getElementById("bookForm");
  const submitButton = document.getElementById("submitButton");
  const formTitle = document.getElementById("formTitle");
  const bookIdInput = document.getElementById("bookId");
  let currentBookId = null; // To track the book being edited

  // Fetch and display books
  async function fetchBooks() {
    try {
      const response = await fetch("http://localhost:3000/books");
      if (!response.ok) {
        throw new Error(`Failed to fetch books: ${response.statusText}`);
      }
      const books = await response.json();
      displayBooks(books); // Helper function to display books
    } catch (error) {
      console.error("Error fetching books:", error);
      bookListDiv.innerHTML = `<p class="text-center text-red-600">Failed to load books. Please try again later.</p>`;
    }
  }

  // Helper function to display books dynamically
  function displayBooks(books) {
    const bookListDiv = document.getElementById("bookList");
    bookListDiv.innerHTML = ""; // Clear the current list

    if (books.length === 0) {
      bookListDiv.innerHTML = `<p class="text-center text-gray-600 col-span-full">No matching books found.</p>`;
      return;
    }

    // Create a grid container for the books
    const gridContainer = document.createElement("div");
    gridContainer.className =
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"; // Responsive grid layout

    books.forEach((book) => {
      const bookDiv = document.createElement("div");
      bookDiv.className =
        "bg-slate-100 p-4 rounded-lg shadow-md space-y-4 flex flex-col justify-between h-full"; // Card styling

      bookDiv.innerHTML = `
        <!-- Top Section: Title -->
        <h3 class="text-3xl font-bold text-blue-700 text-center">${
          book.title
        }</h3>
  
        <!-- Middle Section: Book Details -->
        <div class="space-y-2">
          <p class="text-lg font-medium">Author: ${book.author}</p>
          <p class="text-lg font-medium">Publisher: ${book.publisher}</p>
          <p class="text-lg font-medium">Price: $${book.price.toFixed(2)}</p>
          <p class="text-lg font-medium">Quantity: ${book.quantity}</p>
        </div>
  
        <!-- Bottom Section: Buttons -->
        <div class="flex justify-between space-x-4">
          <button onclick="editBook('${book._id}')" 
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-300">
            Edit
          </button>
          <button onclick="deleteBook('${book._id}')" 
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300">
            Delete
          </button>
        </div>
      `;

      gridContainer.appendChild(bookDiv);
    });

    // Append the grid container to the book list
    bookListDiv.appendChild(gridContainer);
  }

  // Add/Edit book handler
  bookForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = {
      title: document.getElementById("title").value.trim(),
      author: document.getElementById("author").value.trim(),
      publisher: document.getElementById("publisher").value.trim(),
      price: parseFloat(document.getElementById("price").value),
      quantity: parseInt(document.getElementById("quantity").value),
    };

    // Validate input fields
    if (
      !formData.title ||
      !formData.author ||
      !formData.publisher ||
      isNaN(formData.price) ||
      isNaN(formData.quantity)
    ) {
      alert("Please fill in all fields correctly.");
      return;
    }

    try {
      let response;
      if (currentBookId) {
        // Update existing book
        response = await fetch(`http://localhost:3000/books/${currentBookId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        // Add new book
        response = await fetch("http://localhost:3000/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to save book: ${response.statusText}`);
      }

      resetForm();
      fetchBooks(); // Refresh the book list
    } catch (error) {
      console.error("Error saving book:", error);
      alert("An error occurred while saving the book. Please try again.");
    }
  });

  // Edit a book
  window.editBook = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/books/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch book: ${response.statusText}`);
      }
      const book = await response.json();

      // Populate the form with book details
      document.getElementById("title").value = book.title;
      document.getElementById("author").value = book.author;
      document.getElementById("publisher").value = book.publisher;
      document.getElementById("price").value = book.price;
      document.getElementById("quantity").value = book.quantity;

      // Set the book ID and update the form title/button
      currentBookId = book._id;
      formTitle.textContent = "Edit Book";
      submitButton.textContent = "Update Book";
    } catch (error) {
      console.error("Error fetching book for edit:", error);
      alert("An error occurred while loading the book for editing.");
    }
  };

  // Delete a book
  window.deleteBook = async (id) => {
    if (!confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/books/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete book: ${response.statusText}`);
      }

      fetchBooks(); // Refresh the book list
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("An error occurred while deleting the book. Please try again.");
    }
  };

  // Search books by title or author
  window.searchBooks = async () => {
    const query = document.getElementById("searchInput").value.trim();
    if (!query) {
      alert("Please enter a title or author to search.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/books/query?title=${encodeURIComponent(
          query
        )}&author=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch books: ${response.statusText}`);
      }
      const books = await response.json();
      displayBooks(books); // Display the search results
    } catch (error) {
      console.error("Error searching books:", error);
      alert("An error occurred while searching for books. Please try again.");
    }
  };

  // Fetch low stock books (quantity < 5)
  window.fetchLowStockBooks = async () => {
    try {
      const response = await fetch("http://localhost:3000/books/low-stock");
      if (!response.ok) {
        throw new Error(
          `Failed to fetch low stock books: ${response.statusText}`
        );
      }
      const books = await response.json();
      displayBooks(books); // Display the low stock books
    } catch (error) {
      console.error("Error fetching low stock books:", error);
      alert(
        "An error occurred while fetching low stock books. Please try again."
      );
    }
  };

  // Reset the form
  function resetForm() {
    bookForm.reset();
    currentBookId = null;
    formTitle.textContent = "Add a New Book";
    submitButton.textContent = "Add Book";
  }

  // Initial fetch
  fetchBooks();
});
