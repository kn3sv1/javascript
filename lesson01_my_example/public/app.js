const API_URL = "/movies";

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

loadMovies();
