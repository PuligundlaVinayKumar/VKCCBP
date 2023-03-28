const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

const dBase = path.join(__dirname, "moviesData.db");

let db = null;

const installingDb = async () => {
  try {
    db = await open({
      filename: dBase,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Db Installed Successfully");
    });
  } catch (error) {
    console.log(`DB Error: ${error}`);
    process.exit(1);
  }
};

installingDb();

function convertingCamel(jsonObjectFromResponse) {
  let mainObj = [];
  jsonObjectFromResponse.forEach((element) => {
    let sortedEl = {};
    for (let x in element) {
      let keyVal = x;
      let valueInKey = element[x];
      let keyList = keyVal.split("_");
      let sortedKey = [];
      keyList.forEach((keyWord, index) => {
        if (index > 0) {
          sortedKey.push(
            keyWord[0].toUpperCase() + keyWord.slice(1, keyWord.length)
          );
        } else {
          sortedKey.push(keyWord);
        }
      });
      let joinedKey = sortedKey.join("");
      sortedEl[joinedKey] = valueInKey;
    }
    mainObj.push(sortedEl);
  });
  return mainObj;
}

app.get(`/movies/`, async (request, response) => {
  const query = `SELECT movie_name FROM movie;`;
  const movies = await db.all(query);
  let moviesData = convertingCamel(movies);
  response.send(moviesData);
});

app.post("/movies/", async (request, response) => {
  const dataObject = request.body;
  const { directorId, movieName, leadActor } = dataObject;
  const query = `INSERT INTO movie (director_id, movie_name, lead_actor) VALUES (${directorId}, '${movieName}', '${leadActor}');`;
  await db.run(query);
  response.send("Movie Successfully Added");
});

app.get(`/movies/:movieId/`, async (request, response) => {
  const { movieId } = request.params;
  const query = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movie = await db.get(query);
  let moviesData = convertingCamel([movie]);
  response.send(moviesData);
});

app.put(`/movies/:movieId/`, async (request, response) => {
  const { movieId } = request.params;
  const dataObject = request.body;
  const { directorId, movieName, leadActor } = dataObject;
  const query = `UPDATE movie SET director_id=${directorId}, movie_name='${movieName}', lead_actor='${leadActor}' WHERE movie_id = ${movieId};`;
  await db.run(query);
  response.send("Movie Details Updated");
});

app.delete(`/movies/:movieId/`, async (request, response) => {
  const { movieId } = request.params;
  const query = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.get(query);
  response.send("Movie Removed");
});

app.get(`/directors/`, async (request, response) => {
  const query = `SELECT * FROM director;`;
  const movies = await db.all(query);
  let moviesData = convertingCamel(movies);
  response.send(moviesData);
});

app.get(`/directors/:directorId/movies/`, async (request, response) => {
  const { directorId } = request.params;
  const query = `SELECT movie.movie_name FROM director LEFT JOIN movie ON director.director_id = movie.director_id WHERE director.director_id=${directorId};`;
  const movies = await db.all(query);
  let moviesData = convertingCamel(movies);
  response.send(moviesData);
});

module.exports = app;
