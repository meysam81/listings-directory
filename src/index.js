function createEnvironmentTabs(environments) {
  var tabContainer = document.getElementById("tabContainer");
  var tabsHtml = environments
    .map(function renderEnvironmentButton(env, index) {
      return (
        '<button class="tab-button px-4 py-2 rounded-md ' +
        (index == 0
          ? "bg-blue-500 text-white"
          : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white") +
        '" data-env="' +
        env +
        '">' +
        env.toUpperCase() +
        "</button>"
      );
    })
    .join("");

  tabContainer.innerHTML = tabsHtml;
  tabContainer.classList.remove("hidden");

  var tabButtons = tabContainer.querySelectorAll(".tab-button");
  tabButtons.forEach(function tabButtonEventListener(button) {
    button.addEventListener("click", function tabButtonHandler() {
      tabButtons.forEach(function renderTabButton(btn) {
        btn.classList.remove("bg-blue-500", "text-white");
        btn.classList.add(
          "bg-gray-200",
          "text-gray-800",
          "dark:bg-gray-700",
          "dark:text-white"
        );
      });

      this.classList.remove(
        "bg-gray-200",
        "text-gray-800",
        "dark:bg-gray-700",
        "dark:text-white"
      );
      this.classList.add("bg-blue-500", "text-white");

      renderListings(window.store.listings[this.dataset.env]);
    });
  });
}

function imageHtml(item) {
  if (!item.icon_url) {
    item.icon_url = "/default.png";
  }
  var iconHtml =
    '<img src="' +
    item.icon_url +
    '" alt="' +
    item.label +
    '" class="w-12 h-12 rounded-full">';

  return iconHtml;
}

function renderListings(listings) {
  var listingsContainer = document.getElementById("listingsContainer");

  var sortedListings = [...listings];

  if (window.store.sortState === "asc") {
    sortedListings.sort(function compareAsc(a, b) {
      return a.label.localeCompare(b.label);
    });
  } else if (window.store.sortState === "desc") {
    sortedListings.sort(function compareDesc(a, b) {
      return b.label.localeCompare(a.label);
    });
  }

  var listingsHtml = sortedListings
    .map(function renderListing(item) {
      return (
        '<a href="' +
        item.url +
        '" target="_blank" class="block">' +
        '<div class="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">' +
        imageHtml(item) +
        "<div>" +
        '<h3 class="text-lg font-semibold text-gray-800 dark:text-white">' +
        item.label +
        "</h3>" +
        '<p class="text-gray-600 dark:text-gray-300">' +
        item.url +
        "</p>" +
        "</div>" +
        "</div>" +
        "</a>"
      );
    })
    .join("");

  listingsContainer.innerHTML = listingsHtml;
}

async function setListings() {
  try {
    var response = await fetch("/listings.json");
    window.store.listings = await response.json();
  } catch (error) {
    console.error("Error fetching listings:", error);
  }
}

function listingsUpdatedHandler() {
  console.debug("Listings updated:", window.store.listings);

  var environments = Object.keys(window.store.listings);

  if (environments.length == 1) {
    renderListings(window.store.listings[environments[0]]);
  } else {
    createEnvironmentTabs(environments);
    renderListings(window.store.listings[environments[0]]);
  }
}

function setCurrentYear() {
  var currentYear = window.store.currentYear;
  document.getElementById("currentYear").textContent = `${currentYear} `;
}

function setDarkMode() {
  var isDarkMode = window.store.darkMode;
  var btn = document.getElementById("darkModeToggle");
  if (isDarkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  btn.textContent = isDarkMode ? "☀️" : "🌙";
}

function toggleDarkMode() {
  window.store.darkMode = !window.store.darkMode;
}

function setSortButton() {
  var sortState = window.store.sortState;
  var btn = document.getElementById("sortButton");

  if (sortState === "asc") {
    btn.innerHTML = '<img src="/sort-asc.png" alt="Sorted ascending" class="w-5 h-5 rounded-full">';
    btn.title = "Sorted ascending - click to sort descending";
    btn.setAttribute("aria-label", "Sorted ascending - click to sort descending");
  } else if (sortState === "desc") {
    btn.innerHTML = '<img src="/sort-desc.png" alt="Sorted descending" class="w-5 h-5 rounded-full">';
    btn.title = "Sorted descending - click to turn off sorting";
    btn.setAttribute("aria-label", "Sorted descending - click to turn off sorting");
  } else {
    btn.innerHTML = '<img src="/sort-neutral.png" alt="Sorting off" class="w-5 h-5 rounded-full">';
    btn.title = "Sorting off - click to sort ascending";
    btn.setAttribute("aria-label", "Sorting off - click to sort ascending");
  }
}

function toggleSortState() {
  var currentState = window.store.sortState;

  if (currentState === "asc") {
    window.store.sortState = "desc";
  } else if (currentState === "desc") {
    window.store.sortState = "none";
  } else {
    window.store.sortState = "asc";
  }
}

function sortStateUpdatedHandler() {
  setSortButton();

  // Re-render with the current environment's listings
  var environments = Object.keys(window.store.listings);
  if (environments.length > 0) {
    var activeTab = document.querySelector(".tab-button.bg-blue-500");
    var env = activeTab ? activeTab.dataset.env : environments[0];
    renderListings(window.store.listings[env]);
  }
}

function main() {
  setDarkMode();
  setCurrentYear();
  setSortButton();
  setListings();
}

var store = {
  darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
  currentYear: new Date().getFullYear(),
  listings: [],
  sortState: "asc",
};

var storeProxy = new Proxy(store, {
  set: function set_(store, key, value) {
    store[key] = value;
    window.dispatchEvent(new Event(key + "Updated"));
    return true;
  },
  get: function get_(store, key) {
    return store[key];
  },
});

window.store = storeProxy;

document.addEventListener("DOMContentLoaded", main);
window.addEventListener("listingsUpdated", listingsUpdatedHandler);
window.addEventListener("darkModeUpdated", setDarkMode);
window.addEventListener("sortStateUpdated", sortStateUpdatedHandler);

document
  .getElementById("darkModeToggle")
  .addEventListener("click", toggleDarkMode);
document
  .getElementById("sortButton")
  .addEventListener("click", toggleSortState);
