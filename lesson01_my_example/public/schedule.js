async function loadSchedule() {
  const response = await fetch("http://localhost:3000/movies");

  const movies = await response.json();

  const scheduleList = document.getElementById("schedule-list");

  const startDate = new Date();

  const options = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  };

  scheduleList.innerHTML = [...Array(5)]
    .map((_, index) => {
      const currentDate = new Date(startDate);

      currentDate.setDate(startDate.getDate() + index);

      const dayName = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
      });

      const fullDate = currentDate.toLocaleDateString("en-US", options);

      return `
        <div class="day-block">

          <h2>
            📅 ${fullDate}
            (${dayName})
          </h2>

          ${movies
            .map((movie) => {
              const showTimes = [movie.showTime1, movie.showTime2].filter(
                (time) => time !== "",
              );

              return `
              <div class="schedule-row">

                <div class="movie-name">
                  ${movie.title}
                </div>

                <div class="showtime-list">
                  ${showTimes
                    .map(
                      (time) => `
                    <span class="showtime">
                      ${time}
                    </span>
                  `,
                    )
                    .join("")}
                </div>

              </div>
            `;
            })
            .join("")}

        </div>
      `;
    })
    .join("");
}

loadSchedule();
