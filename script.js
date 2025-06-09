let questions = [];
let currentQuestionIndex = 0;
let prizeMoney = [0, 100, 200, 300, 400, 500, 1000, 1500, 2000, 3000, 5000, 10000 , 20000, 30000, 50000, 100000];

const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const moneyEl = document.getElementById('money');
const fiftyFiftyBtn = document.getElementById('fifty-fifty');

let currentAnswerButtons = [];
let fiftyUsed = false; 

async function loadQuestions() {
  const res = await fetch('questions.json');
  questions = await res.json();
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

  moneyEl.textContent = `Текуща награда: $${prizeMoney[currentQuestionIndex]}`;

  fiftyFiftyBtn.disabled = fiftyUsed;
}
function selectAnswer(correct) {
  if (correct) {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      alert("Поздравления! Спечелихте 100000!");
      resetGame(); 
    }
  } else {
    const earned = currentQuestionIndex > 0 ? prizeMoney[currentQuestionIndex - 1] : 0;
    alert(`Грешен отговор! Край на играта. Спечелихте $${earned}.`);
    resetGame();
  }
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

const audienceHelpBtn = document.getElementById('audience-help');
let audienceUsed = false;

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

function resetGame() {
  currentQuestionIndex = 0;
  fiftyUsed = false;
  audienceUsed = false;
  audienceHelpBtn.disabled = false;
  fiftyFiftyBtn.disabled = false;
  showQuestion();
}


loadQuestions();
