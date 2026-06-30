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

  renderSchedule(movie);
  renderActions(movie);
}

function renderSchedule(movie) {
  const schedule = document.getElementById("movie-schedule");

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  schedule.innerHTML = `
    <div class="schedule-box">
      <h3>SCHEDULE</h3>

      ${days
        .map(
          (day) => `
        <div class="schedule-row">
          <span>${day}</span>
          <div class="show-time">
            <span>${movie.showTime1}</span>
            <span>${movie.showTime2}</span>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

function renderActions(movie) {
  const actions = document.getElementById("movie-actions");

  actions.innerHTML = `
    <div class="actions-box">
      <a
        href="${movie.trailer}"
        target="_blank"
        class="action-btn"
      >
        WATCH TRAILER
      </a>

      <a
        href="${movie.imdb}"
        target="_blank"
        class="action-btn"
      >
        VIEW ON IMDB
      </a>
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

  if (!response.ok) {
    throw new Error("Failed to save comment");
  }

  // redirect/reload same page
  window.location.reload();
});
