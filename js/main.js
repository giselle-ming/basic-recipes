import { NetworkError } from "./utils.js";

let catNames = {};
const error = document.querySelector(".error");
let selectCategories = document.querySelector("select");

document.addEventListener("DOMContentLoaded", init);

function init() {
  error.classList.remove("hidden");
  error.classList.remove("error");
  error.textContent = "Please select a category";
  getCategories();
}

function getCategories() {
  const url = "https://www.themealdb.com/api/json/v1/1/categories.php";

  fetch(url)
    .then((response) => {
      if (!response.ok)
        throw new NetworkError("Unable to fetch the URL", response);
      return response.json();
    })
    .then((data) => {
      // Access the 'categories' property from the API response
      const categories = data.categories;
      selectCategories.innerHTML += categories
        .map((item) => {
          return `<option value="${item.strCategory}">${item.strCategory}</option>`;
        })
        .join("");
      // When the user selects a category from the dropdown list, fetch random cat images
      selectCategories.addEventListener("change", getImages);
    })
    .catch((err) => {
      // If an error occurs when fetching the cat categories or images then a message needs to be displayed to the user within the <main> area
      console.log(err);
      showError(1);
      error.textContent = `ERROR ${err.message}`;
    });
}

function getImages(ev) {
  showError(0);
  loader(1);
  document.getElementById("cards").innerHTML = "";
  //change the limit to however many images to use
  const cards = document.querySelector(".cards");
  let mealId = "";
  const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${ev.target.value}`;

  fetch(url)
    .then((response) => {
      if (!response.ok)
        throw new NetworkError("Unable to fetch the URL", response);
      return response.json();
    })
    .then((data) => {
      console.log(data.meals);
      error.classList.add("hidden");
      cards.innerHTML = data.meals
        .map((imageData) => {
          loader(0);
          return `<div class="card" data-id="${imageData.idMeal}">
                    <img src="${imageData.strMealThumb}" class="card__image" alt="A nice photo of ${name}">
                    <p>${imageData.strMeal}</p>
                    </div>`;
        })
        .join("");
      const cardElements = document.querySelectorAll(".card");
      cardElements.forEach((card) => {
        card.addEventListener("click", () => {
          const mealId = card.getAttribute("data-id"); // Get the meal ID from the card's data-id attribute
          showRecipeDetails(mealId); // Pass the meal ID to the showRecipeDetails function
        });
      });
    })
    .catch((err) => {
      // If an error occurs when fetching the cat categories or images then a message needs to be displayed to the user within the <main> area
      console.log(err);
      loader(0);
      showError(1);
      error.textContent = `ERROR ${err.message}`;
    });
}

function showRecipeDetails(mealId) {
  const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`;
  console.log(url);
  loader(1);

  fetch(url)
    .then((response) => {
      if (!response.ok)
        throw new NetworkError("Unable to fetch the URL", response);
      return response.json();
    })
    .then((data) => {
      loader(0);
      const meal = data.meals[0];

      // Hide all cards
      document.querySelector(".cards").classList.add("hidden");

      // Display the recipe details
      const recipeDetails = document.querySelector(".recipe-details");
      recipeDetails.innerHTML = `
        <h2>${meal.strMeal}</h2>
        <img class="recipe-image" src="${meal.strMealThumb}" alt="${
        meal.strMeal
      }">
        <h3>Ingredients</h3>
        <ul>
          ${Object.keys(meal)
            .filter((key) => key.startsWith("strIngredient") && meal[key])
            .map(
              (key) =>
                `<li>${meal[key]} - ${meal[`strMeasure${key.slice(13)}`]}</li>`
            )
            .join("")}
        </ul>
        <h3>Instructions</h3>
        <p>${meal.strInstructions}</p>
        <button class="back-button">Back</button>
      `;
      recipeDetails.classList.remove("hidden");

      // Add event listener to the back button
      document.querySelector(".back-button").addEventListener("click", () => {
        recipeDetails.classList.add("hidden");
        document.querySelector(".cards").classList.remove("hidden");
      });
    })
    .catch((err) => {
      console.log(err);
      loader(0);
      showError(1);
      error.textContent = `ERROR ${err.message}`;
    });
}

function showError(option) {
  if (option === 1) {
    error.classList.remove("hidden");
    error.classList.add("error");
  } else {
    error.classList.add("hidden");
  }
}

function loader(option) {
  if (option === 1) {
    const overlay = document.querySelector(".overlay");
    overlay.classList.remove("hidden");
  } else {
    const overlay = document.querySelector(".overlay");
    overlay.classList.add("hidden");
  }
}
