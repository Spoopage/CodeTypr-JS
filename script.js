let wordsPath = 'resources/words.json';
let achievementPath = 'resources/achievements.json';
let currentWords = [];  // Initialize empty array for current word list
let currentWord = "";
let userInput = document.getElementById("user-input");
let wordDisplay = document.getElementById("word-display");
let mistypedDisplay = document.getElementById("mistyped-display");
let scoreDisplay = document.getElementById("score");
let timerDisplay = document.getElementById("timer");
let wpmDisplay = document.getElementById("wpm");
let score = 0;
let timer = 0;
let totalCharactersTyped = 0;
let gameInterval;
let timerInterval;
let gameStarted = false;
let difficulty = "medium";  // Default difficulty
let achievements = []; // Store unlocked achievements
let allAchievements = []; // Store all available achievements

// Function to load words and achievements from JSON files
async function loadData() {
    try {
        const wordsResponse = await fetch(wordsPath);
        const wordsData = await wordsResponse.json();
        setDifficulty(difficulty, wordsData);

        const achievementsResponse = await fetch(achievementPath);
        const achievementsData = await achievementsResponse.json();
        allAchievements = achievementsData.achievements;

        // Display all achievements even if none are unlocked yet
        displayAchievements();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Set difficulty based on the loaded JSON data
function setDifficulty(selectedDifficulty, wordsData) {
    difficulty = selectedDifficulty;
    switch (difficulty) {
        case "easy":
            currentWords = wordsData.easy;
            break;
        case "medium":
            currentWords = wordsData.medium;
            break;
        case "hard":
            currentWords = wordsData.hard;
            break;
    }
    if (gameStarted) {
        restartGame();
    }
}

// Start the game
function startGame() {
    score = 0;
    timer = 0;
    totalCharactersTyped = 0;
    achievements = [];  // Reset achievements when the game starts
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timer;
    wpmDisplay.textContent = 0;
    userInput.value = "";
    userInput.disabled = false;
    userInput.focus();
    currentWord = currentWords[Math.floor(Math.random() * currentWords.length)];
    wordDisplay.textContent = currentWord;
    gameStarted = true;
    document.getElementById("restart-button").style.display = "none";
    mistypedDisplay.innerHTML = ""; // Clear mistyped characters display

    // Start Timer
    timerInterval = setInterval(function() {
        timer++;
        timerDisplay.textContent = timer;
        updateWPM(); // Update WPM every second
    }, 1000);  // Every second

    // Start Game Interval (Check Input)
    gameInterval = setInterval(checkInput, 100);
}

// Check input function
function checkInput() {
    let inputValue = userInput.value;
    let currentWordLength = currentWord.length;

    // Display correct word (without mistakes) in wordDisplay
    let highlightedText = "";
    for (let i = 0; i < currentWordLength; i++) {
        highlightedText += `<span>${currentWord[i]}</span>`; // Always display the correct word
    }
    wordDisplay.innerHTML = highlightedText;

    // Highlight mistyped characters below the correct word
    let mistypedText = "";
    for (let i = 0; i < currentWordLength; i++) {
        if (inputValue[i] === currentWord[i]) {
            mistypedText += `<span>${inputValue[i]}</span>`; // Correct characters
        } else {
            mistypedText += `<span class="mistyped">${inputValue[i] || ''}</span>`; // Mistyped characters
        }
    }

    // If the input is longer than the current word, handle the excess input and highlight them
    if (inputValue.length > currentWordLength) {
        mistypedText += `<span class="mistyped">${inputValue.slice(currentWordLength).split('').join('</span><span class="mistyped">')}</span>`;
    }

    mistypedDisplay.innerHTML = mistypedText;

    // Check if the input matches the current word
    if (inputValue === currentWord) {
        score++;
        scoreDisplay.textContent = score;
        totalCharactersTyped += currentWord.length;
        checkAchievements(); // Check achievements every time the word is typed correctly
        userInput.value = ""; // Reset input after correct word
        currentWord = currentWords[Math.floor(Math.random() * currentWords.length)];
        wordDisplay.textContent = currentWord; // Update the current word
        mistypedDisplay.innerHTML = ""; // Clear the mistyped display
    }
}

// Function to check if achievements are met
function checkAchievements() {
    allAchievements.forEach((achievement) => {
        if (eval(achievement.condition) && !achievements.includes(achievement.name)) {
            achievements.push(achievement.name);
            showAchievementNotification(achievement.name);
            displayAchievements();
        }
    });
}

// Show achievement notification
function showAchievementNotification(achievement) {
    const achievementNotification = document.getElementById("achievement-notification");
    achievementNotification.textContent = `Achievement unlocked: ${achievement}`;
    setTimeout(() => achievementNotification.textContent = "", 3000); // Hide after 3 seconds
}

// Function to update WPM (Words Per Minute)
function updateWPM() {
    let wpm = Math.floor(totalCharactersTyped / 5 / (timer / 60));
    wpmDisplay.textContent = wpm;
}

// Function to display achievements
function displayAchievements() {
    const achievementDisplay = document.getElementById("achievement-display");
    achievementDisplay.innerHTML = "<h3>All Achievements</h3>";
    
    const unlocked = achievements.map(achievement => `<div class="achievement">${achievement} (Unlocked)</div>`).join('');
    const locked = allAchievements
        .filter(achievement => !achievements.includes(achievement.name))
        .map(achievement => `<div class="achievement">${achievement.name} (Locked)</div>`).join('');

    achievementDisplay.innerHTML += unlocked + locked;
}

// Toggle the achievement display visibility
function toggleAchievementsDisplay() {
    const achievementDisplay = document.getElementById("achievement-display");
    if (achievementDisplay.style.display === "none") {
        achievementDisplay.style.display = "block";
    } else {
        achievementDisplay.style.display = "none";
    }
}

// Restart the game
function restartGame() {
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    gameStarted = false;
    document.getElementById("restart-button").style.display = "none";
    startGame();
}

userInput.addEventListener("input", function() {
    if (!gameStarted) {
        startGame();
    }
});

// Initialize game
loadData();