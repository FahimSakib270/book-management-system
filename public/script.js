document.addEventListener("DOMContentLoaded", () => {
  const bookListDiv = document.getElementById("bookList");
  const addBookForm = document.getElementById("addBookForm");

  // Fetch and display books
  async function fetchBooks() {
    try {
      const response = await fetch("http://localhost:3000/books");
      const books = await response.json();
      bookListDiv.innerHTML = ""; // Clear the current list
      books.forEach((book) => {
        const bookDiv = document.createElement("div");
        bookDiv.className = "bg-white p-4 shadow rounded";
        bookDiv.innerHTML = `
            <strong>${book.title}</strong> by ${book.author} 
            <br>Publisher: ${book.publisher}, Price: $${book.price}, Quantity: ${book.quantity}
          `;
        bookListDiv.appendChild(bookDiv);
      });
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  }

  // Add book handler
  addBookForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = {
      title: document.getElementById("title").value,
      author: document.getElementById("author").value,
      publisher: document.getElementById("publisher").value,
      price: parseFloat(document.getElementById("price").value),
      quantity: parseInt(document.getElementById("quantity").value),
    };

    try {
      const response = await fetch("http://localhost:3000/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchBooks(); // Refresh the book list
        addBookForm.reset(); // Reset the form
      } else {
        console.error("Failed to add book");
      }
    } catch (error) {
      console.error("Error adding book:", error);
    }
  });

  // Initial fetch
  fetchBooks();
});
