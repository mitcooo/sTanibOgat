let questions = [];
let currentQuestionIndex = 0;
let score = 0; // брояч за правилни отговори
let startTime, endTime;

let playerName = prompt("Въведи името си:");

// Вместо prizeMoney, можем да ползваме score, но можеш да оставиш и наградите

const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const moneyEl = document.getElementById('money');
const fiftyFiftyBtn = document.getElementById('fifty-fifty');

let currentAnswerButtons = [];
let fiftyUsed = false; 
let audienceUsed = false;

const audienceHelpBtn = document.getElementById('audience-help');

async function loadQuestions() {
  const res = await fetch('questions.json');
  questions = await res.json();
  startTime = Date.now();  // Започва времето при зареждане на въпросите
  showQuestion();
}

function showQuestion() {
  if(currentQuestionIndex >= questions.length){
    endGame();
    return;
  }
  
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

  moneyEl.textContent = `Текущ резултат: ${score} точки`;

  fiftyFiftyBtn.disabled = fiftyUsed;
  audienceHelpBtn.disabled = audienceUsed;
}

function selectAnswer(correct) {
  if (correct) {
    score++;
  }
  currentQuestionIndex++;
  showQuestion();
}

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

  fiftyFiftyBtn.disabled = true;
  fiftyUsed = true; 
});

function showAudienceHelp() {
  if (audienceUsed) return;

  const correctBtn = currentAnswerButtons.find(btn => btn.correct);
  const incorrectBtns = currentAnswerButtons.filter(btn => !btn.correct);

  const correctPercent = Math.floor(Math.random() * 31) + 50;

  let remainingPercent = 100 - correctPercent;
  let percentages = [];

  if (incorrectBtns.length === 2) {
    const first = Math.floor(Math.random() * (remainingPercent + 1));
    const second = remainingPercent - first;
    percentages = [first, second];
  } else if (incorrectBtns.length === 3) {
    let parts = [];
    let sum = 0;
    for (let i = 0; i < 2; i++) {
      const val = Math.floor(Math.random() * (remainingPercent - sum));
      parts.push(val);
      sum += val;
    }
    parts.push(remainingPercent - sum);
    percentages = parts;
  } else {
    percentages = [];
  }

  currentAnswerButtons.forEach((btnObj, i) => {
    let percent;
    if (btnObj.correct) {
      percent = correctPercent;
    } else {
      percent = percentages.shift() || 0;
    }

    btnObj.element.textContent = `${btnObj.element.textContent} (${percent}%)`;
  });

  audienceHelpBtn.disabled = true;
  audienceUsed = true;
}

audienceHelpBtn.addEventListener('click', showAudienceHelp);

function endGame() {
  endTime = Date.now();
  const timeSpent = (endTime - startTime) / 1000; // секунди
  alert(`Играта приключи!\nИграч: ${playerName}\nТочки: ${score}\nВреме: ${timeSpent.toFixed(2)} секунди`);
  resetGame();
}

function resetGame() {
  currentQuestionIndex = 0;
  score = 0;
  fiftyUsed = false;
  audienceUsed = false;
  fiftyFiftyBtn.disabled = false;
  audienceHelpBtn.disabled = false;
  startTime = Date.now();
  showQuestion();
}
