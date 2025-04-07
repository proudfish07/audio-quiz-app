let audioList = [];
let answers = {};
let currentIndex = 0;
let shuffledList = [];
let userAnswers = [];
let username = "";

const QUESTION_COUNT = 10;

async function startQuiz() {
  username = document.getElementById("username").value.trim();
  if (!username) {
    alert("請輸入姓名");
    return;
  }

  const res = await fetch("answers.json");
  const answersArray = await res.json();

  // 將陣列轉為以音檔檔名為 key 的物件
  answers = {};
  answersArray.forEach(item => {
    answers[item.id] = item.answer;
  });

  audioList = Object.keys(answers);

  // 隨機抽取題目
  shuffledList = shuffleArray(audioList).slice(0, QUESTION_COUNT);

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

  const audioFile = shuffledList[currentIndex];
  const audioPlayer = document.getElementById("audioPlayer");
  audioPlayer.src = `audio/${audioFile}`;  // 不要加副檔名
  audioPlayer.load();

  const correctAnswer = answers[audioFile];
  const allAnswers = [...new Set(Object.values(answers))];
  const incorrectChoices = shuffleArray(allAnswers.filter(a => a !== correctAnswer)).slice(0, 3);
  const choices = shuffleArray([correctAnswer, ...incorrectChoices]);

  const optionsContainer = document.getElementById("optionsContainer");
  optionsContainer.innerHTML = "";

  choices.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.onclick = () => submitAnswer(option);
    optionsContainer.appendChild(button);
  });
}

function submitAnswer(userInput) {
  const currentAudio = shuffledList[currentIndex];
  const correctAnswer = answers[currentAudio];
  const isCorrect = userInput === correctAnswer;
  const timestamp = new Date().toISOString();

  userAnswers.push({
    question: currentAudio,
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

  const score = userAnswers.filter(ans => ans.isCorrect).length * 10;
  document.getElementById("finalScore").innerText = `得分：${score} 分`;
}

function downloadResults() {
  let csvContent = "姓名,題目,使用者答案,正確答案,是否正確,時間\n";
  userAnswers.forEach(ans => {
    csvContent += `${username},${ans.question},${ans.userAnswer},${ans.correctAnswer},${ans.isCorrect ? '正確' : '錯誤'},${ans.time}\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${username}_quiz_results.csv`;
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
