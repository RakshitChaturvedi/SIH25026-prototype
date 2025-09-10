// --- 1. SETUP: GET ALL THE NECESSARY HTML ELEMENTS ---

// Get references to all the interactive elements on the page
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');
const generateFhirBtn = document.getElementById('generate-fhir-btn');
const fhirOutput = document.getElementById('fhir-output');
const placeholderText = document.querySelector('.placeholder-text');

// This variable will hold the full data object of the term the user selects
let selectedTermData = null;

// The base URL of your FastAPI backend. Make sure the port matches what Uvicorn is using.
const API_BASE_URL = 'http://127.0.0.1:8000';

// --- 2. LIVE SEARCH FUNCTIONALITY ---

/**
 * A "debounce" function. This is a professional touch that prevents us from
 * sending an API request on EVERY single keystroke. Instead, it waits until
 * the user has stopped typing for a brief moment (e.g., 300ms).
 */
let debounceTimer;
searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        performSearch();
    }, 300);
});

/**
 * Fetches search results from the backend and triggers the display update.
 */
async function performSearch() {
    const query = searchInput.value;

    // If the search box is empty or too short, clear the results
    if (query.length < 2) {
        resultsContainer.innerHTML = ''; // Clear old cards
        placeholderText.style.display = 'block'; // Show the placeholder text
        resetSelection();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/search?q=${query}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const results = await response.json();
        displayResults(results);
    } catch (error) {
        console.error("Failed to fetch search results:", error);
        resultsContainer.innerHTML = '<p class="error-text">Could not fetch results. Is the backend server running?</p>';
    }
}

/**
 * Renders the search result cards on the page.
 * @param {Array} results - The array of result objects from the backend.
 */
function displayResults(results) {
    // Clear previous results and the placeholder
    resultsContainer.innerHTML = '';
    placeholderText.style.display = 'none';

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="placeholder-text">No results found.</p>';
        return;
    }

    results.forEach(term => {
        const resultCard = document.createElement('div');
        resultCard.className = 'result-card';
        // Populate the card with data from the term object
        resultCard.innerHTML = `
            <div class="term-primary">Primary Term (NAMAST-E): "${term.namaste_term}"</div>
            <div class="term-secondary">Secondary Term (TM2): "${term.tm2_term}"</div>
            <div class="term-tertiary">Tertiary Term (Biomedicine): "${term.bio_term}"</div>
        `;

        // IMPORTANT: Store the full data object on the element for later use
        resultCard._data = term;

        // Add a click listener to handle selection
        resultCard.addEventListener('click', () => handleSelection(resultCard));

        resultsContainer.appendChild(resultCard);
    });
}


// --- 3. SELECTION & FHIR GENERATION LOGIC ---

/**
 * Handles what happens when a user clicks on a result card.
 * @param {HTMLElement} selectedCard - The card element that was clicked.
 */
function handleSelection(selectedCard) {
    // Store the data from the clicked card into our global variable
    selectedTermData = selectedCard._data;

    // First, remove the 'selected' class from any other card
    document.querySelectorAll('.result-card').forEach(card => card.classList.remove('selected'));
    
    // Then, add the 'selected' class to the card that was just clicked
    selectedCard.classList.add('selected');

    // Enable the "Generate" button
    generateFhirBtn.disabled = false;
}

/**
 * Resets the selection state when the search box is cleared.
 */
function resetSelection() {
    selectedTermData = null;
    generateFhirBtn.disabled = true;
}

// Listen for clicks on the generate button
generateFhirBtn.addEventListener('click', async () => {
    if (!selectedTermData) {
        alert("Please select a term first.");
        return;
    }

    // Show a loading message
    fhirOutput.textContent = "Generating...";
    fhirOutput.style.color = "var(--text-color-secondary)";

    try {
        // Send the selected data object to the backend in the POST request body
        const response = await fetch(`${API_BASE_URL}/api/generate_fhir`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(selectedTermData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const fhirResource = await response.json();

        // Display the formatted FHIR resource in the <pre> tag
        fhirOutput.textContent = JSON.stringify(fhirResource, null, 2);
        fhirOutput.style.color = "#abb2bf"; // Reset to code color

    } catch (error) {
        console.error("Failed to generate FHIR resource:", error);
        fhirOutput.textContent = "Error generating FHIR resource. See console for details.";
        fhirOutput.style.color = "var(--primary-red)";
    }
});