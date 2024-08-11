function resetTestScore() {
	userData.testData.correct = 0;
	userData.testData.incorrect = 0;
	userData.testData.probabilityWeights = Array(userData.testData.questionPool.length).fill(1);
	userData.testData.currentQuestion = undefined;
	userData.testData.currentQuestionIndex = -1;
	updateTestScore();
}

function addSet(set_) {
	for (const word of set_.MatchCards) {
		let word_ = {
			kanji: word.kanji,
			onyomi: word.hasOwnProperty('onyomi') ? word.onyomi.replaceAll(',', '').split(' ') : [],
			kunyomi: word.hasOwnProperty('kunyomi') ? word.kunyomi.replaceAll(',', '').split(' ') : word.hasOwnProperty('kana') ? [word.kana] : [],
			english: word.english
		};
		if (!(myjson.level[set_.level] instanceof Object) || !myjson.level[set_.level].hasOwnProperty('word')) {
			myjson.level[set_.level] = {word: {}};
		}
		if (word_.kanji) {
			myjson.level[set_.level].word[word_.kanji] = word_;
		} else {
			myjson.level[set_.level].word[word_.english] = word_;
		}
	}
}

function clamp(i, l, u) {return Math.min(Math.max(u, l), Math.max(Math.min(l, u), i))}

function changeNumAnswers(n) {
	userData.testSettings.numAnswers = clamp(userData.testSettings.numAnswers + n, 2, Math.min(5, Math.floor(Math.sqrt(userData.testData.questionPool.length))));
	answerGrid.style.gridTemplate = `repeat(${userData.testSettings.numAnswers}, ${100/userData.testSettings.numAnswers}%) / repeat(${userData.testSettings.numAnswers}, ${100/userData.testSettings.numAnswers}%)`;
	startNewQuestion();
}

function showFurigana() {
	return userData.testSettings.furigana && ![userData.testSettings.answerDisplay, userData.testSettings.questionDisplay].includes('kana');
}

function questionsLeft() {
	return userData.testData.probabilityWeights.length > 0 ? userData.testData.probabilityWeights.reduce((e, a) => {return a + e}) : 0;
}

function numAnswers() {
	return Math.min(userData.testSettings.numAnswers*userData.testSettings.numAnswers, userData.testData.questionPool.length);
}

function chooseAnswer(event) {
	let elem = this;
	if (Array.from(answerGrid.getElementsByClassName('correct')).includes(this.firstElementChild)) {
		userData.testData.correct += 1;
		userData.testData.probabilityWeights[userData.testData.currentQuestionIndex] = Math.max(userData.testData.probabilityWeights[userData.testData.currentQuestionIndex] - 1, 0);
		this.style.outline = '4px solid #0f0';
		this.style.outlineOffset = '-2px';
		questionBox.style.outline = '4px solid #0f0';
		questionBox.style.outlineOffset = '-2px';
	} else {
		userData.testData.incorrect += 1;
		userData.testData.probabilityWeights[userData.testData.currentQuestionIndex] += 1;
		this.style.outline = '4px solid #f00';
		this.style.outlineOffset = '-2px';
		questionBox.style.outline = '4px solid #f00';
		questionBox.style.outlineOffset = '-2px';
	}
	refreshBox(questionBox, true);
	refreshBox(this, true);
	updateTestScore();
	overlay.style.display = '';
	overlay.style.filter =  'alpha(opacity=0)';
	overlay.style.opacity = '0.0';
	overlay.onclick = () => {
		this.style.outline = '';
		this.style.outlineOffset = '';
		questionBox.style.outline = '';
		questionBox.style.outlineOffset = '';
		overlay.style.display = 'none';
		overlay.style.filter =  '';
		overlay.style.opacity = '';
		overlay.onclick = undefined;
		startNewQuestion();
		}
}

function startNewQuestion() {
	if (questionsLeft() > 0) {
		const tempWeights = Array(userData.testData.questionPool.length).fill(1);
		userData.testData.currentQuestionIndex = rng.chooseIndex(userData.testData.probabilityWeights);
		tempWeights[userData.testData.currentQuestionIndex] = 0;
		userData.testData.currentQuestion = loadedQuestions[userData.testData.questionPool[userData.testData.currentQuestionIndex]];
		const newAnswerIndices = [userData.testData.currentQuestionIndex];
		while (newAnswerIndices.length < numAnswers()) {
			const j = rng.chooseIndex(tempWeights);
			tempWeights[j] = 0;
			newAnswerIndices.push(j);
		}
		rng.permute(newAnswerIndices);
		const range = Math.max(newAnswerIndices.length, answerGrid.childElementCount);
		while (answerGrid.childElementCount > newAnswerIndices.length) {answerGrid.lastElementChild.remove()}
		for (let i in newAnswerIndices) {
			if (answerGrid.childElementCount <= i) {
				addAnswer(loadedQuestions[userData.testData.questionPool[newAnswerIndices[i]]], newAnswerIndices[i] == userData.testData.currentQuestionIndex);
			} else {
				setData(answerGrid.children[i].lastElementChild, loadedQuestions[userData.testData.questionPool[newAnswerIndices[i]]], newAnswerIndices[i] == userData.testData.currentQuestionIndex);
			}
		}
		setData(questionBox, userData.testData.currentQuestion);
		questionBox.classList.remove('incorrect');
		refreshBoxes();
	} else {
		setTimeout(() => {resetTestScore(); startNewQuestion()}, 750);
		setData(questionBox, noneData);
		clearAnswers(true);
	}
}