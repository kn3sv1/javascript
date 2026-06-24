const API_URL = "/movies";

const params = new URLSearchParams(window.location.search);

const id = params.get("id");

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
