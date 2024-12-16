const API_KEY = "ece985488c982715535011849742081f"; // API key for TMDb
const imagePath = "https://image.tmdb.org/t/p/w1280"; // Base URL for movie poster images
const input = document.querySelector(".search input"); // Search input element
const button = document.querySelector(".search button"); // Search button element
const mainGridTitle = document.querySelector(".favourite h1"); // Title of the favourite movies section
const mainGrid = document.querySelector(".favourite .movies-grid"); // Grid for displaying favorite movies
const trendingGrid = document.querySelector(".trending .movies-grid"); // Grid for displaying trending movies
const popupContainer = document.querySelector(".popup-container"); // Popup container for movie details

// Initial function that runs when the page loads
window.addEventListener("load", () => {
  renderFavourites(); // Render favourite movies from localStorage
  addTrendingMoviesToDOM(); // Add trending movies to the DOM
});

// Function to fetch movie data by search term
async function getMovieBySearch(search_term) {
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${search_term}`
  );
  const respData = await response.json();
  return respData.results; // Return the list of movie results
}

// Function to add search movie results to the DOM
async function addSearchMoviesToDOM() {
  const search_term = input.value; // Get the search term from input field
  const data = await getMovieBySearch(search_term); // Fetch search results
  mainGridTitle.innerHTML = "Search Results..."; // Update the title

  // Map over the search results and create movie cards
  let resultArr = data.map((m) => {
    return `<div class="card" data-id="${m.id}">
      <!-- card image -->
      <div class="img">
        <img src=${imagePath + m.poster_path} alt="">
      </div>
      <!-- card info -->
      <div class="info">
        <h2>${m.title}</h2>
        <div class="single-info">
          <span>Rating:</span>
          <span>${m.vote_average}</span>
        </div>
        <div class="single-info">
          <span>Release Date:</span>
          <span>${m.release_date}</span>
        </div>
      </div>
    </div>`;
  });

  mainGrid.innerHTML = resultArr.join(" "); // Render movie cards to the DOM
  const cards = document.querySelectorAll(".card"); // Get all movie cards
  addClickEffectToCards(cards); // Add click event to each card
}

// Event listener for search button
button.addEventListener("click", addSearchMoviesToDOM);

// Function to add click effect to movie cards
function addClickEffectToCards(cards) {
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      showPopUp(card); // Show popup when card is clicked
    });
  });
}

// Function to fetch detailed movie information by ID
async function getMovieById(movieId) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`
  );
  const data = await response.json();
  return data; // Return detailed movie data
}

// Function to fetch trailer by movie ID
async function getTrailerById(movieId) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`
  );
  const data = await response.json();
  return data.results[0].key; // Return the trailer key
}

// Function to display movie details in a popup
async function showPopUp(card) {
  popupContainer.classList.add("show-popup"); // Show the popup
  const movieId = card.getAttribute("data-id"); // Get the movie ID from the card
  const movie = await getMovieById(movieId); // Fetch movie data by ID
  const key = await getTrailerById(movieId); // Fetch trailer key for the movie

  // Set popup background image and content
  popupContainer.style.background = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)),
    url(${imagePath + movie.poster_path})`;

  // Insert movie details into the popup
  popupContainer.innerHTML = `
    <span class="x-icon">&#10006;</span>
    <div class="content">
      <div class="left">
        <div class="poster-img">
          <img src="${imagePath + movie.poster_path}" alt="" />
        </div>
        <div class="single-info">
          <span>Add to favourites:</span>
          <span class="heart-icon">&#9829;</span>
        </div>
      </div>

      <div class="right">
        <h1>${movie.title}</h1>
        <h3>${movie.tagline}</h3>

        <div class="single-info-container">
          <div class="single-info">
            <span>Languages:</span>
            <span>${movie.spoken_languages[0].name}</span>
          </div>
          <div class="single-info">
            <span>Length:</span>
            <span>${movie.runtime} minutes</span>
          </div>
          <div class="single-info">
            <span>Rating:</span>
            <span>${movie.vote_average}/10</span>
          </div>
          <div class="single-info">
            <span>Budget:</span>
            <span>${movie.budget}</span>
          </div>
          <div class="single-info">
            <span>Release Date:</span>
            <span>${movie.release_date}</span>
          </div>
        </div>

        <div class="genres">
          <h2>Genres</h2>
          <ul>
            ${movie.genres
              .map((e) => {
                return `<li>${e.name}</li>`;
              })
              .join("")}
          </ul>
        </div>

        <div class="overview">
          <h2>Overview</h2>
          <p>${movie.overview}</p>
        </div>

        <div class="trailer">
          <h2>Trailer</h2>
          <iframe width="560" height="315" src="https://www.youtube.com/embed/${key}?si=SwnsQjPpxw6knwRc"
            title="YouTube video player" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
        </div>
      </div>
    </div>`;

  // Close the popup when the close icon is clicked
  const x_icon = document.querySelector(".x-icon");
  x_icon.addEventListener("click", () => {
    popupContainer.classList.remove("show-popup");
  });

  // Handle adding/removing from favorites
  const heart_icon = document.querySelector(".heart-icon");
  let favorites = JSON.parse(window.localStorage.getItem("favorites")) || {};
  if (favorites[movieId]) {
    heart_icon.classList.add("change-color");
  }

  heart_icon.addEventListener("click", () => {
    if (heart_icon.classList.contains("change-color")) {
      heart_icon.classList.remove("change-color");
      removeFromFavourite(movieId); // Remove from favorites
    } else {
      heart_icon.classList.add("change-color");
      addToFavourite(movieId, movie); // Add to favorites
    }
  });
}

// Function to fetch trending movies
async function getTrendingMovies() {
  const response = await fetch(
    `https://api.themoviedb.org/3/trending/all/day?api_key=${API_KEY}`
  );
  const data = await response.json();
  return data.results; // Return trending movies
}

// Function to add trending movies to the DOM
async function addTrendingMoviesToDOM() {
  const data = await getTrendingMovies();
  const displayMovies = data.slice(0, 10); // Display the top 10 trending movies

  // Create movie cards for trending movies
  let resultArr = displayMovies.map((m) => {
    return `<div class="card" data-id="${m.id}">
      <!-- card image -->
      <div class="img">
        <img src=${imagePath + m.poster_path} alt="">
      </div>
      <!-- card info -->
      <div class="info">
        <h2>${m.title}</h2>
        <div class="single-info">
          <span>Rating:</span>
          <span>${m.vote_average}</span>
        </div>
        <div class="single-info">
          <span>Release Date:</span>
          <span>${m.release_date}</span>
        </div>
      </div>
    </div>`;
  });

  trendingGrid.innerHTML = resultArr.join(" "); // Render trending movie cards
  const cards = document.querySelectorAll(".card"); // Get all trending movie cards
  addClickEffectToCards(cards); // Add click event to each card
}

// Function to remove a movie from favorites
function removeFromFavourite(movieId) {
  let favorites = JSON.parse(window.localStorage.getItem("favorites")) || {};
  delete favorites[movieId]; // Remove the movie from the favorites object
  window.localStorage.setItem("favorites", JSON.stringify(favorites)); // Update localStorage
  renderFavourites(); // Re-render the favorite movies
}

// Function to add a movie to favorites
function addToFavourite(movieId, movie) {
  let favorites = JSON.parse(window.localStorage.getItem("favorites")) || {};
  favorites[movieId] = movie; // Add movie to the favorites object
  window.localStorage.setItem("favorites", JSON.stringify(favorites)); // Update localStorage
  renderFavourites(); // Re-render the favorite movies
}

// Function to render favorite movies from localStorage
function renderFavourites() {
  let favorites = JSON.parse(window.localStorage.getItem("favorites")) || {};
  let keys = Object.keys(favorites);

  // Display the title and render movie cards for favorites
  if (keys.length > 0) {
    mainGridTitle.innerHTML = "My Favourites";
    mainGrid.innerHTML = keys.map((key) => {
      let movie = favorites[key];
      return `<div class="card" data-id="${movie.id}">
        <!-- card image -->
        <div class="img">
          <img src=${imagePath + movie.poster_path} alt="">
        </div>
        <!-- card info -->
        <div class="info">
          <h2>${movie.title}</h2>
          <div class="single-info">
            <span>Rating:</span>
            <span>${movie.vote_average}</span>
          </div>
          <div class="single-info">
            <span>Release Date:</span>
            <span>${movie.release_date}</span>
          </div>
        </div>
      </div>`;
    }).join(" ");
  } else {
    mainGridTitle.innerHTML = "No favourites yet";
    mainGrid.innerHTML = ""; // No favorite movies
  }
}
