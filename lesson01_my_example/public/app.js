const API_URL = "/movies";
const API_COMMENTS = "/comments";

const movieList = document.getElementById("movieList");

async function loadMovies() {
  const response = await fetch(API_URL);
  const movies = await response.json();

  movieList.innerHTML = "";

  movies.forEach((movie) => {
    const article = document.createElement("article");

    article.classList.add("movie-card");

    article.innerHTML = `
      <a href="movie.html?id=${movie.id}">
        <img
          src="${movie.photo}"
          alt="${movie.title}"
        />
      </a>
    `;

    movieList.appendChild(article);
  });
}

async function loadComments() {
  const response = await fetch(API_COMMENTS);

  const comments = await response.json();

  const commentsList = document.getElementById("commentsList");

  commentsList.innerHTML = "";

  comments.forEach((comment) => {
    const article = document.createElement("article");

    article.classList.add("comment-card");

    article.innerHTML = `
  <div class="comment-header">
    <h3>${comment.user}</h3>
  </div>
    <p>${comment.text}</p>
    <div class="comment-actions">
    <button
      class="edit-btn"
      data-id="${comment.id}"
    >
      Edit
    </button>

    <button
      class="delete-btn"
      data-id="${comment.id}"
    >
      Delete
    </button>
    </div>
    `;

    commentsList.appendChild(article);
  });
}

loadMovies();
loadComments();

async function deleteComment(id) {
  const response = await fetch("http://localhost:3000/comments/" + id, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Delete failed");
  }

  console.log("Deleted comment:", id);

  const commentDeletedEvent = new CustomEvent("commentDeleted", {
    detail: {
      message: "Comment deleted successfully",
      id: id,
    },
  });

  document.dispatchEvent(commentDeletedEvent);

  loadComments();
}

document.addEventListener("commentDeleted", (e) => {
  alert(e.detail.message + " (ID: " + e.detail.id + ")");

  console.log("Custom event data:", e.detail);
});

async function editComment(id) {
  const newText = prompt("Edit your comment:");

  if (!newText) return;

  const response = await fetch("http://localhost:3000/comments/" + id, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: newText,
    }),
  });

  if (!response.ok) {
    throw new Error("Edit failed");
  }

  console.log("Updated comment:", id);

  loadComments();
}

document.addEventListener("click", async (e) => {
  if (e.target.matches(".delete-btn")) {
    const id = e.target.dataset.id;

    await deleteComment(id);
  }

  if (e.target.matches(".edit-btn")) {
    const id = e.target.dataset.id;

    await editComment(id);
  }
});
