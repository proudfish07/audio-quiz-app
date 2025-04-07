let audioList = [];
let answers = {};
let currentIndex = 0;
let shuffledList = [];
let userAnswers = [];
let username = "";

async function startQuiz() {
  username = document.getElementById("username").value.trim();
  if (!username) {
    alert("請輸入姓名");
    return;
  }

  // 載入答案檔案
  const res = await fetch("answers.json");
  answers = await res.json();
  audioList = Object.keys(answers);

  // 隨機排序題目
  shuffledList = shuffleArray(audioList);

  document.getElementById("startScreen").style.display = "none";
  document.getElementById("quizScreen").style.display = "block";
  loadQuestion();
}

function loadQuestion() {
  if (currentIndex >= shuffledList.length) {
    endQuiz();
    return;
  }

  document.getElementById("feedback").innerText = "";
  document.getElementById("questionCounter").innerText =
    `題目 ${currentIndex + 1} / ${shuffledList.length}`;

  const audioPlayer = document.getElementById("audioPlayer");
  audioPlayer.src = `audio/${shuffledList[currentIndex]}`;
  audioPlayer.load();

  const currentQuestion = answers[shuffledList[currentIndex]];
  const optionsContainer = document.getElementById("optionsContainer");
  optionsContainer.innerHTML = "";

  // 隨機打亂選項
  const shuffledOptions = shuffleArray(currentQuestion.choices);
  shuffledOptions.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.onclick = () => submitAnswer(option);
    optionsContainer.appendChild(button);
  });
}

function submitAnswer(userInput) {
  const correctAnswer = answers[shuffledList[currentIndex]].answer;
  const isCorrect = userInput.toLowerCase() === correctAnswer.toLowerCase();
  const timestamp = new Date().toISOString();

  userAnswers.push({
    question: shuffledList[currentIndex],
    userAnswer: userInput,
    correctAnswer: correctAnswer,
    isCorrect: isCorrect,
    time: timestamp
  });

  document.getElementById("feedback").innerText = isCorrect
    ? "✅ 正確！"
    : `❌ 錯誤，正確答案是：${correctAnswer}`;

  currentIndex++;
  setTimeout(loadQuestion, 1000);
}

function endQuiz() {
  document.getElementById("quizScreen").style.display = "none";
  document.getElementById("resultScreen").style.display = "block";
}

function downloadResults() {
  const data = {
    username: username,
    results: userAnswers
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${username}_quiz_results.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function shuffleArray(array) {
  const newArray = array.slice();
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}