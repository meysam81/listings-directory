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

      window.store.currentTab = this.dataset.env;

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

  if (window.store.sortState == "asc") {
    sortedListings.sort(function compareAsc(a, b) {
      return a.label.localeCompare(b.label);
    });
  } else if (window.store.sortState == "desc") {
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
        '<div class="min-w-0 flex-1">' +
        '<h3 class="text-lg font-semibold text-gray-800 dark:text-white truncate">' +
        item.label +
        "</h3>" +
        '<p class="text-gray-600 dark:text-gray-300 truncate">' +
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

async function fetchListings() {
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

  if (environments.length > 1) {
    createEnvironmentTabs(environments);

    if (window.store.currentTab && environments.includes(window.store.currentTab)) {
      var savedTabButton = document.querySelector(`.tab-button[data-env="${window.store.currentTab}"]`);
      if (savedTabButton) {
        savedTabButton.click();
        return;
      }
    }
    document.querySelector('.tab-button').click();
  } else if (environments.length == 1) {
    window.store.currentTab = environments[0];
    renderListings(window.store.listings[environments[0]]);
  }
}

function setCurrentYear() {
  document.getElementById("current-year").textContent = `${CURRENT_YEAR} `;
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
  var btn = document.getElementById("sort-button");

  if (sortState == "asc") {
    btn.innerHTML = sortIcons.asc;
    btn.setAttribute("aria-label", "Sorted ascending - click to sort descending");
  } else if (sortState == "desc") {
    btn.innerHTML = sortIcons.desc;
    btn.setAttribute("aria-label", "Sorted descending - click to turn off sorting");
  } else {
    btn.innerHTML = sortIcons.neutral;
    btn.setAttribute("aria-label", "Sorting off - click to sort ascending");
  }
}

function toggleSortState() {
  var currentState = window.store.sortState;

  if (currentState == "asc") {
    window.store.sortState = "desc";
  } else if (currentState == "desc") {
    window.store.sortState = "none";
  } else {
    window.store.sortState = "asc";
  }
}

function sortStateUpdatedHandler() {
  setSortButton();

  var environments = Object.keys(window.store.listings);
  if (environments.length > 0) {
    var activeTab = document.querySelector(".tab-button.bg-blue-500");
    var env = activeTab ? activeTab.dataset.env : environments[0];
    window.store.currentTab = env;
    renderListings(window.store.listings[env]);
  }
}

function loadStoreFromLocalStorage() {
  const savedStore = localStorage.getItem('listingsDirectoryStore');
  if (savedStore) {
    try {
      const parsedStore = JSON.parse(savedStore);
      return {
        darkMode: parsedStore.darkMode != undefined ? parsedStore.darkMode : window.matchMedia("(prefers-color-scheme: dark)").matches,
        listings: parsedStore.listings || [],
        sortState: parsedStore.sortState || "asc",
        currentTab: parsedStore.currentTab || '',
      };
    } catch (e) {
      console.error("Error parsing localStorage:", e);
    }
  }

  return {
    darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
    listings: [],
    sortState: "asc",
    currentTab: '',
  };
}

function saveStoreToLocalStorage(store) {
  try {
    localStorage.setItem('listingsDirectoryStore', JSON.stringify(store));
  } catch (e) {
    console.error("Error saving to localStorage:", e);
  }
}

var sortIcons = {
  asc: '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAV0lEQVR4nO2SMQoAIAwD+2tH/XlEcBCRSgpihh5kKZQroWYJCYisnGZ/BFEgIwBZjZ4gCmQEIKvRE0SBjABkNXoChuI8RH0pqd4CW80uuV4eEQzaTGI0HeVscXWNg/R7AAAAAElFTkSuQmCC" alt="Sorted ascending" class="w-5 h-5 rounded-full">',
  desc: '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAABHElEQVR4nO2Z3QqDMAyF83hzF3M3Yzd7dgWVvYSDMwoVRrHFn/SPnQ8CXtSS08REowghhJTKVUR6EYGimf2aVAIGZecXmyhgIybUnfLpm/0uWx0ghOTvA1vq/t2W1sFeF9cHQnX/ISLzz9qPiLxqEeA6ry5Cow/46v7T4zyszXZNkfhOHrEikcN5lChiLW1mT/oUl05twDE45hNq9ojeB3x1fwycKhwTjwhTFXcxHaw8xlmXdyAlsCJgTYTZYxejooDWnmC3kgrwCFju6+29txR94Mj7PgICqgAUkBkwAif6gMacB7EiMCSa84ACTvQBjTkP+BBnBozAP/WBPsJ8H6nLqPZ8H7UL6J2yHLUPxJjvN/YjyBj/HRBCpC6+JdPIkqnmmRUAAAAASUVORK5CYII=" alt="Sorted descending" class="w-5 h-5 rounded-full">',
  neutral: '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAaUlEQVR4nN2UwQrAIAxD89c96nF/nSHobcNYFUoDvUmeaaBAZlUAz01z9plBxjuXOQXIEuDLnGKSLXOegniic7WDcAC3wgAYtgNVDAtg2g5MOCnlJqSoJrPotvtzZbd2ci34UTvzbZLqBUWsWbH6WtfbAAAAAElFTkSuQmCC" alt="sorting-arrows" alt="No sorting" class="w-5 h-5 rounded-full">',
}

function main() {
  setDarkMode();
  setCurrentYear();
  setSortButton();
  fetchListings();
}

var store = loadStoreFromLocalStorage();
if (store) {
  saveStoreToLocalStorage(store);
}

var storeProxy = new Proxy(store, {
  set: function setStoreProxy(store, key, value) {
    store[key] = value;

    if (key == 'listings') {
      store.currentTab = store.currentTab || Object.keys(store.listings)[0];
    }

    saveStoreToLocalStorage(store);
    window.dispatchEvent(new Event(key + "Updated"));
    return true;
  },
  get: function getStoreProxy(store, key) {
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
