// Dancing baby gif when all answers are finished
// Rotating skull gif when you get the wrong answer

const questionBox = questionGrid.lastElementChild.lastElementChild;
const answerTemplate = answerGrid.children[0].cloneNode(true);
while (answerTemplate.children[0].children[0].childElementCount > 0) {answerTemplate.children[0].children[0].removeChild(answerTemplate.children[0].children[0].lastElementChild)}
answerGrid.lastElementChild.remove();

const getWordsRequest = new XMLHttpRequest();
getWordsRequest.onload = function() {
	let res = JSON.parse(this.response);

	Object.assign(loadedQuestions, res.word);
	let levelDiv = addQuestionSelectionLevel(res.level);
	
	if (userData.testData.questionPool.length < 4) {
		Object.assign(userData.testData.questionPool, Object.keys(loadedQuestions));
		resetTestScore();
	}

	for (let word in res.word) {
		addToQuestionSelection(word, levelDiv, userData.testData.questionPool.includes(word));
	}
	
	if (levelToRequest != res.level && levelToRequest > 0) {
		getWordsRequest.open("GET", `data/words.json?level=${levelToRequest}`);
		getWordsRequest.send();
		levelToRequest -= 1;
	} else {
		updateTestScore(false);
		startNewQuestion();
	}
}
var levelToRequest = 5;

function init() {
	refreshBox(questionBox);
	userData.testSettings.questionDisplay = symbolTypes.includes(document.querySelector('input[name="questionDisplay"]:checked').value) ? document.querySelector('input[name="questionDisplay"]:checked').value : 'kanji';
	userData.testSettings.answerDisplay = symbolTypes.includes(document.querySelector('input[name="answerDisplay"]:checked').value) ? document.querySelector('input[name="answerDisplay"]:checked').value : 'english';
	userData.testSettings.furigana = document.querySelector('input[name="furigana"]').checked;
	userData.testSettings.romaji = document.querySelector('input[name="romaji"]').checked;
	getWordsRequest.open("GET", `data/words.json?level=${levelToRequest}`);
	getWordsRequest.send();
	levelToRequest = 4;
	try {
		Object.assign(userData, JSON.parse(getCookie('userData')));
	} catch (err) {}
	
	for (display of ['questionDisplay', 'answerDisplay']) {
		for (radioButton of document.querySelectorAll(`input[name="${display}"]`)) {
			radioButton.checked = userData.testSettings[display] == radioButton.value;
		}
	}
	document.querySelector('input[name="furigana"]').checked = userData.testSettings.furigana;
	document.querySelector('input[name="romaji"]').checked = userData.testSettings.romaji;
	populateAnswerGrid();
}


var pageFont;
var pageFontHeight;
opentype.load('fonts/MSGOTHIC.TTF', function (err, font) {
	if (err) {
		console.error('Font could not be loaded: ' + err);
		return;
	}
	pageFont = font;
	pageFontHeight = pageFont.getPath('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZあアいイうウえエおオかカきキくクけケこコさサしシすスせセそソたタちチつツてテとトなナにニぬヌねネのノはハひヒふフへヘほホまマみミむムめメもモやヤゆユよヨらラりリるルれレろロわワをヲんンゃャゅュょョがガぎギぐグげゲごゴざザじジずズぜゼぞゾだダぢヂづヅでデどドばバびビぶブべベぼボぱパぴピぷプぺペぽポ!?.', 0, 0, 35).getBoundingBox();
	init();
});


