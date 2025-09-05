import { MusicGenerator } from './sonantx.js';

// DOM Elements
const startMenu = document.getElementById('start-menu');
const startButton = document.getElementById('start-button');
const gameContainer = document.querySelector('.game-container');
const cat = document.getElementById('cat');
const problemElement = document.getElementById('problem');
const answerElement = document.getElementById('answer');
const submitButton = document.getElementById('submit');
const yarnElement = document.getElementById('yarn');
const sharperClawsButton = document.getElementById('sharper-claws');
const catnipBoostButton = document.getElementById('catnip-boost');

// Game State
let yarn = 0;
let yarnPerClick = 1;
let yarnPerSecond = 0;
let sharperClawsCost = 10;
let catnipBoostCost = 50;
let currentProblem;

async function initAudio() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const response = await fetch('music.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const song = await response.json();
        const musicGenerator = new MusicGenerator(audioCtx, song);
        musicGenerator.connect(audioCtx.destination);
        musicGenerator.start();
        console.log("Music started successfully!");
    } catch (error) {
        console.error("Could not initialize or play music:", error);
    }
}

function startGame() {
    startMenu.style.display = 'none';
    gameContainer.style.display = 'flex';
    
    initAudio();

    // Initialize passive yarn generation
    setInterval(() => {
        yarn += yarnPerSecond;
        updateYarn();
    }, 1000);

    // Initial setup
    generateProblem();
    updateYarn();
}

function generateProblem() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let question, answer;

    switch (operator) {
        case '+':
            question = `${num1} + ${num2}`;
            answer = num1 + num2;
            break;
        case '-':
            if (num1 < num2) {
                [question, answer] = [`${num2} - ${num1}`, num2 - num1];
            } else {
                [question, answer] = [`${num1} - ${num2}`, num1 - num2];
            }
            break;
        case '*':
            question = `${num1} * ${num2}`;
            answer = num1 * num2;
            break;
    }

    problemElement.textContent = question;
    currentProblem = { answer: answer };
}

function checkAnswer() {
    const userAnswer = parseInt(answerElement.value, 10);
    if (!isNaN(userAnswer) && userAnswer === currentProblem.answer) {
        yarn += yarnPerClick;
        updateYarn();
        cat.classList.add('hop');
        setTimeout(() => {
            cat.classList.remove('hop');
        }, 500);
        generateProblem();
        answerElement.value = '';
    }
}

function updateYarn() {
    yarnElement.textContent = yarn;
    sharperClawsButton.disabled = yarn < sharperClawsCost;
    catnipBoostButton.disabled = yarn < catnipBoostCost;
}

sharperClawsButton.addEventListener('click', () => {
    if (yarn >= sharperClawsCost) {
        yarn -= sharperClawsCost;
        yarnPerClick++;
        sharperClawsCost = Math.ceil(sharperClawsCost * 1.5);
        sharperClawsButton.textContent = `Cost: ${sharperClawsCost} Yarn`;
        updateYarn();
    }
});

catnipBoostButton.addEventListener('click', () => {
    if (yarn >= catnipBoostCost) {
        yarn -= catnipBoostCost;
        yarnPerSecond++;
        catnipBoostCost = Math.ceil(catnipBoostCost * 1.8);
        catnipBoostButton.textContent = `Cost: ${catnipBoostCost} Yarn`;
        updateYarn();
    }
});

// Event Listeners
startButton.addEventListener('click', startGame);
submitButton.addEventListener('click', checkAnswer);
answerElement.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});
