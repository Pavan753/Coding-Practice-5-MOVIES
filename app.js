const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT 
        movie_name 
    FROM 
        movie;`;
  const moviesArray = await database.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `UPDATE movie SET director_id = ${directorId}, movie_name = '${movieName}', lead_actor = '${leadActor}' WHERE movie_id = ${movieId};`; // Fix variable name

  await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `SELECT movie_name FROM movie WHERE director_id = ${directorId};`;
  const moviesArray = await database.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
