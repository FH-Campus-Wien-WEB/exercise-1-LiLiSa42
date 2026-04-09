const express = require('express')
const path = require('path')
const app = express()
const apiKey = "199c9473"
const movies = [
    "Grave of the Fireflies",
    "My Neighbor Totoro",
    "Princess Mononoke",
    "Howl's Moving Castle",
    "From Up on Poppy Hill"
 ];
const fields = [
  "Released", "Runtime","Actors", "Plot", "Poster", "Metascore", "imdbRating"
];

// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, 'files')));

// Configure a 'get' endpoint for data..
app.get('/movies', function (req, res) {


  const promises = movies.map(function(title) { // promise für jeden Film
    // macht für jeden Film einen fetch request, um die Daten zu holen
    return fetch(`http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`)
      .then(response => response.json())
            .then(movie => {
        // Formatiert Released zu ISO 8601
        let releasedISO = "N/A";
        if (movie.Released && movie.Released !== "N/A") {
          const d = new Date(movie.Released);
          if (!isNaN(d)) releasedISO = d.toISOString().split('T')[0]; // YYYY-MM-DD
        }

        // Formatiert Runtime zu einer Zahl
        let runtimeNum = "N/A";
        if (movie.Runtime && movie.Runtime !== "N/A") {
          const match = movie.Runtime.match(/\d+/); // nur Zahl extrahieren
          if (match) runtimeNum = parseInt(match[0], 10); //10 = Basis (Dezimal)
        }
        
        let metascoreNum = "N/A";
        if (movie.Metascore && movie.Metascore !== "N/A") {
          const match = movie.Metascore.match(/\d+/); // nur Zahl extrahieren
          if (match) metascoreNum = parseInt(match[0], 10); //10 = Basis (Dezimal)
        }

        let imdbRating = "N/A";
        if (movie.imdbRating && movie.imdbRating !== "N/A") {
          imdbRating = parseFloat(movie.imdbRating);
        }


        let genresArray = [];
        if (movie.Genre && movie.Genre !== "N/A") {
          genresArray = movie.Genre.split(",").map(g => g.trim());
        }

        let directorsArray = [];
        if (movie.Director && movie.Director !== "N/A") {
          directorsArray = movie.Director.split(",").map(d => d.trim());
        }

        let writersArray = [];
        if (movie.Writer && movie.Writer !== "N/A") {
          writersArray = movie.Writer.split(",").map(w => w.trim());
        }
        
        let actorsArray = [];
        if (movie.Actors && movie.Actors !== "N/A") {
          actorsArray = movie.Actors.split(",").map(a => a.trim());
        }


        const filtered = {
          Title: movie.Title,
          Poster: movie.Poster || "N/A",
          Genres: genresArray,
          Directors: directorsArray,
          Writers: writersArray,
          Actors: actorsArray,
          Released: releasedISO,
          Runtime: runtimeNum,
          Metascore: metascoreNum,
          imdbRating: imdbRating  
        };
          
        return filtered;
      });
  });
  Promise.all(promises)
  .then(function(moviedata) {
    res.json(moviedata); // für html
  });

});
app.listen(3000, () => {

console.log("Server now listening on http://localhost:3000/")
});