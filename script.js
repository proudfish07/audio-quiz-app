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
    showResults();
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


function shuffleArray(array) {
  const newArray = array.slice();
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function restartQuiz() {
  // 重設狀態
  currentIndex = 0;
  userAnswers = [];
  shuffledList = [];

  // 顯示起始畫面，隱藏其他畫面
  document.getElementById("startScreen").style.display = "block";
  document.getElementById("quizScreen").style.display = "none";
  document.getElementById("resultScreen").style.display = "none";

  // 清空表格與文字
  document.getElementById("resultTable").innerHTML = "";
  document.getElementById("finalScore").innerText = "";

  // 清空輸入的名字
  document.getElementById("username").value = "";
}

function submitResultsToGoogleForm() {
  const endpoint = "https://script.google.com/macros/s/AKfycbw6fRFcIr1SeJ5fKTj_umGnj0CEHsNBTwMLrZXzNsA2Xft70eVlZfmM3VYLHiYSIBEBMg/exec";

  const payload = userAnswers.map(ans => ({
    name: username,
    question: ans.question,
    userAnswer: ans.userAnswer,
    correctAnswer: ans.correctAnswer,
    isCorrect: ans.isCorrect,
    time: ans.time
  }));

  fetch(endpoint, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(res => res.text())
  .then(response => {
    console.log("已送出至 Google 表單：", response);
  })
  .catch(err => {
    console.error("送出資料失敗", err);
  });
}


function showResults() {
  document.getElementById("quizScreen").style.display = "none";
  document.getElementById("resultScreen").style.display = "block";

  const correctCount = userAnswers.filter(ans => ans.isCorrect).length;
  const total = userAnswers.length;
  document.getElementById("finalScore").innerText = `你的得分是 ${correctCount} / ${total}`;

  const table = document.getElementById("resultTable");
  table.innerHTML = `
    <tr>
      <th>題號</th>
      <th>你的答案</th>
      <th>正確答案</th>
      <th>正確與否</th>
      <th>作答時間</th>
    </tr>
  `;

  userAnswers.forEach((ans, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${ans.userAnswer}</td>
      <td>${ans.correctAnswer}</td>
      <td>${ans.isCorrect ? "✅" : "❌"}</td>
      <td>${ans.time}</td>
    `;
    table.appendChild(row);
  });

  // 送出到 Google 表單
  submitResultsToGoogleForm();
}
