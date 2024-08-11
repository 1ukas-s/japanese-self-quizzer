

class Box {
	static createHTMLElement(isQuestion = false) {
		let parentElement = document.createElement('div');
		parentElement.classList.add('cell', 'flippable', 'card', isQuestion ? 'question-container' : 'answer-container');
		let element = document.createElement('div');
		element.classList.add('inner-box');
		parentElement.appendChild(element);
		for (let i = 0; i < 4; i++) {element.appendChild(document.createElement('p'))}
		element.children[0].classList.add('romaji');
		element.children[1].classList.add('kana');
		element.children[2].classList.add('kanji');
		element.children[3].classList.add('english');
		return parentElement;
	}
	
	static setData(container, answerData = noneData, isCorrect = false) {
		let box = container.firstElementChild;
		while (box.children[2].childElementCount > 0) {box.children[2].removeChild(box.children[2].lastElementChild)}
		while (box.children[3].childElementCount > 0) {box.children[3].removeChild(box.children[3].lastElementChild)}
		container.classList.remove('correct', 'incorrect');
		if (Array.from(container.classList).includes('answer-container')) {
			container.classList.add(isCorrect ? 'correct' : 'incorrect');
		}
		for (const datum of symbolTypes) {
			let p = box.getElementsByClassName(datum)[0];
			if (datum == 'romaji' || datum == 'kana') {
				for (const reading of answerData['kunyomi']) {
					p.appendChild(document.createElement('span'));
					p.lastElementChild.classList.add('kunyomi');
					p.lastElementChild.textContent = (datum == 'romaji' ? toRomaji(reading) : reading);
				}
				for (const reading of answerData['onyomi']) {
					p.appendChild(document.createElement('span'));
					p.lastElementChild.classList.add('onyomi');
					p.lastElementChild.textContent = (datum == 'romaji' ? toRomaji(reading) : reading);
				}
				if (p.lastElementChild) {p.lastElementChild.textContent = p.lastElementChild.textContent.slice(0, p.lastElementChild.textContent.length - 2)}
			} else {
				p.textContent = answerData[datum]
			}
		}
	}
	
	static refreshBox(box) {
		for (const datum of symbolTypes) {
			if (datum == testSettings.answerDisplay) {
				box.getElementsByClassName(datum)[0].style.display = "flex";
			} else if (datum == 'kana' && testSettings.answerFurigana && testSettings.answerDisplay == 'kanji') {
				box.getElementsByClassName(datum)[0].style.display = "flex";
			} else {
				box.getElementsByClassName(datum)[0].style.display = "none";
			}
		}
	}
	
	constructor(boxData = noneData, isQuestion = false) {
		this.data = boxData;
		this.isQuestion = isQuestion;
		this.container;
		this.init();
	}
	
	init() {
		this.container = Box.createHTMLElement(this.isQuestion);
		this.setData(this.data, false);
	}

	setData(boxData = noneData, isCorrect = false) {
		this.data = boxData;
		Box.setData(this.container, boxData, isCorrect);
	}
	
	refresh(testSettings) {
		Box.refreshBox(this.box, testSettings)
	}
	
	// Mainly for inheritors
	get box() {
		return this.container.firstElementChild;
	}

	set box(boxElement) {
		this.container = boxElement.parentElement;
	}
}
