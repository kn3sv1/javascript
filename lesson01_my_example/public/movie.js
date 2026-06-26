const API_URL = "/movies";

const params = new URLSearchParams(window.location.search);

const id = params.get("id");

const commentForm = document.getElementById("comment-form");

async function loadMovie() {
  const response = await fetch(API_URL + "/" + id);

  const movie = await response.json();

  document.getElementById("movie-details").innerHTML = `
  <div class="movie-detail-card">

    <div class="movie-image">
      <img
        src="${movie.photo}"
        alt="${movie.title}"
      />
    </div>

    <div class="movie-info">
      <h1>${movie.title}</h1>

      <p>
        <strong>Genre:</strong>
        ${movie.genre}
      </p>

      <p>
        <strong>Description:</strong>
        ${movie.description}
      </p>

      <p>
        <strong>Duration:</strong>
        ${movie.duration}
      </p>

      <p>
        <strong>Language:</strong>
        ${movie.language}
      </p>
    </div>

  </div>
`;
}

loadMovie();

commentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = document.getElementById("comment-user").value;

  const text = document.getElementById("comment-input").value;

  const response = await fetch("http://localhost:3000/comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      user,
      text,
    }),
  });
});

