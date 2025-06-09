import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Firebase конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyC347ETQi-etyfa1rv_E18cOw-JvhowdLc",
  authDomain: "stayprof-18b6e.firebaseapp.com",
  databaseURL: "https://stayprof-18b6e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "stayprof-18b6e",
  storageBucket: "stayprof-18b6e.firebasestorage.app",
  messagingSenderId: "613932567888",
  appId: "1:613932567888:web:962448ec2a42046eda7055"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Променливи
let questions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let startTime;
let playerName = prompt("Въведи името си:");

// DOM елементи
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const moneyEl = document.getElementById('money');
const fiftyFiftyBtn = document.getElementById('fifty-fifty');
const audienceHelpBtn = document.getElementById('audience-help');

let currentAnswerButtons = [];
let fiftyUsed = false;
let audienceUsed = false;

// Зареждане на въпроси
async function loadQuestions() {
  const res = await fetch('questions.json');
  questions = await res.json();
  startTime = new Date();
  showQuestion();
}

function showQuestion() {
  const q = questions[currentQuestionIndex];
  questionEl.textContent = q.question;
  answersEl.innerHTML = '';
  currentAnswerButtons = [];

  q.answers.forEach(answer => {
    const btn = document.createElement('button');
    btn.textContent = answer.text;
    btn.onclick = () => selectAnswer(answer.correct);
    answersEl.appendChild(btn);
    currentAnswerButtons.push({ element: btn, correct: answer.correct });
  });

  moneyEl.textContent = `Въпрос ${currentQuestionIndex + 1} от ${questions.length}`;
  fiftyFiftyBtn.disabled = fiftyUsed;
  audienceHelpBtn.disabled = audienceUsed;
}

function selectAnswer(correct) {
  if (correct) correctAnswers++;

  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    endGame();
  }
}

function endGame() {
  const endTime = new Date();
  const seconds = Math.floor((endTime - startTime) / 1000);
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  const timeFormatted = `${minutes}:${restSeconds.toString().padStart(2, '0')}`;

  // Покажи в конзолата
  console.log(`Играч: ${playerName}, Точки: ${correctAnswers}, Време: ${timeFormatted}`);

  // Запис във Firebase
  const resultRef = ref(db, 'results');
  push(resultRef, {
    name: playerName,
    score: correctAnswers,
    time: timeFormatted
  });

  alert(`Благодарим ти, ${playerName}!\nТочки: ${correctAnswers}\nВреме: ${timeFormatted}`);
  resetGame();
}

function resetGame() {
  currentQuestionIndex = 0;
  correctAnswers = 0;
  fiftyUsed = false;
  audienceUsed = false;
  showQuestion();
}

// 50/50
fiftyFiftyBtn.addEventListener('click', () => {
  if (fiftyUsed) return;
  const incorrect = currentAnswerButtons.filter(btn => !btn.correct);
  const correct = currentAnswerButtons.find(btn => btn.correct);
  const randomIncorrect = incorrect[Math.floor(Math.random() * incorrect.length)];

  currentAnswerButtons.forEach(btn => {
    if (btn !== correct && btn !== randomIncorrect) {
      btn.element.style.display = 'none';
    }
  });

  fiftyUsed = true;
  fiftyFiftyBtn.disabled = true;
});

// Помощ от публиката
audienceHelpBtn.addEventListener('click', () => {
  if (audienceUsed) return;

  const correctBtn = currentAnswerButtons.find(btn => btn.correct);
  const incorrectBtns = currentAnswerButtons.filter(btn => !btn.correct);

  const correctPercent = Math.floor(Math.random() * 31) + 50;
  let remaining = 100 - correctPercent;
  let percentages = incorrectBtns.map(() => {
    const p = Math.floor(Math.random() * remaining);
    remaining -= p;
    return p;
  });

  currentAnswerButtons.forEach(btnObj => {
    let percent = btnObj.correct ? correctPercent : (percentages.shift() || 0);
    btnObj.element.textContent += ` (${percent}%)`;
  });

  audienceUsed = true;
  audienceHelpBtn.disabled = true;
});

loadQuestions();
