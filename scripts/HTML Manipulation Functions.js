function addQuestionSelectionLevel(level) {
	let levelDiv;
	if (questionSelect.getElementsByClassName(`level ${level}`).length < 1) {
		levelDiv = document.createElement('div');
		levelDiv.classList.add('level', level);
		levelDiv.appendChild(document.createElement('span'));
		levelDiv.firstElementChild.textContent = `Level ${level}`;
		let checkAllDiv = checkall.cloneNode(true);
		let uncheckAllDiv = uncheckall.cloneNode(true);
		checkAllDiv.onclick = () => setManyQuestions(level, true);
		uncheckAllDiv.onclick = () => setManyQuestions(level, false);
		levelDiv.appendChild(checkAllDiv);
		levelDiv.appendChild(uncheckAllDiv);
		levelDiv.appendChild(document.createElement('br'));
		questionSelect.appendChild(levelDiv);
	} else {
		levelDiv = questionSelect.getElementsByClassName(`level ${level}`)[0];
	}
	return levelDiv;
}

function addToQuestionSelection(word, levelDiv, startChecked = false) {
	let input = document.createElement('input'); input.type = "checkbox"; input.name = word; input.style.cursor = "pointer"; input.checked = startChecked;
	let newDiv = document.createElement('div'); newDiv.style.cursor = 'pointer'; newDiv.appendChild(input); newDiv.appendChild(document.createElement('span'));
	newDiv.onclick = () => toggleQuestion(word, true);
	newDiv.lastElementChild.textContent = word;
	levelDiv.appendChild(newDiv);
}

function setManyQuestions(level, on) {
	let parentElem;

	if (level == 'all') {
		parentElem = questionSelect;
	} else {
		parentElem = questionSelect.getElementsByClassName(`level ${level}`)[0];
	}
	
	for (let elem of parentElem.querySelectorAll("input[type='checkbox']")) {
		setQuestion(elem.name, on);
	}
}

function toggleQuestion(question) {
	if (!loadedQuestions.hasOwnProperty(question)) {return}
	let questionIdx = userData.testData.questionPool.findIndex(e => e == question);
	if (questionIdx == -1) {
		document.querySelector(`input[name="${question}"]`).checked = true;
		userData.testData.questionPool.push(question);
	} else {
		document.querySelector(`input[name="${question}"]`).checked = false;
		userData.testData.questionPool.splice(questionIdx, 1);
	}
	numSelected.textContent = `${userData.testData.questionPool.length} questions selected`;
	if (userData.testData.questionPool.length > 3) {numSelectedWarning.textContent = ''}
	setCookie('userData', JSON.stringify(userData), 2147483647);
	resetTestScore();
}

function setQuestion(question, on) {
	if (userData.testData.questionPool.findIndex(e => e == question) == -1 ^ !on) {
		toggleQuestion(question);
	}
}

function populateAnswerGrid() {
	answerGrid.style.gridTemplate = `repeat(${userData.testSettings.numAnswers}, ${100/userData.testSettings.numAnswers}%) / repeat(${userData.testSettings.numAnswers}, ${100/userData.testSettings.numAnswers}%)`;
	while (answerGrid.children.length < numAnswers()) {
		addAnswer(noneData);
	}
	while (answerGrid.children.length > numAnswers()) {
		answerGrid.lastElementChild.remove();
	}
}

function updateTestSettings(setting, value) {
	const prior = userData.testSettings[setting];
	userData.testSettings[setting] = value;
	if (document.querySelector(`input[name="${setting}"]`).type == "radio") {
		document.querySelector(`input[name="${setting}"][value="${value}"]`).checked = true;
	} else {
		document.querySelector(`input[name="${setting}"]`).checked = userData.testSettings[setting];
	}
	if (userData.testSettings.answerDisplay == userData.testSettings.questionDisplay) {
		if (setting == 'answerDisplay') {
			updateTestSettings('questionDisplay', prior);
		} else {
			updateTestSettings('answerDisplay', prior);
		}
		return
	}
	
	refreshBoxes();
	setCookie('userData', JSON.stringify(userData), 2147483647);
}

function openQuestionSelect() {
	numSelected.textContent = `${userData.testData.questionPool.length} questions selected`
	questionSelectContainer.style.display = '';
	overlay.style.display = '';
	overlay.onclick = closeQuestionSelect;
}

function closeQuestionSelect() {
	if (userData.testData.questionPool.length < 4) {
		numSelectedWarning.textContent = 'You must select at least 4 questions.'
		return
	}
	numSelectedWarning.textContent = '';
	changeNumAnswers(0);
	questionSelectContainer.style.display = 'none';
	overlay.style.display = 'none';
	overlay.onclick = undefined;
}

function clearAnswers(remove=false) {
	if (remove) {
		for (const child of Array.from(answerGrid.children)) {
			child.remove();
		}
	} else {
		for (const child of Array.from(answerGrid.children))  {
			setData(child.children[0], noneData);
		}
	}
}

function updateTestScore(store = true) {
	correct.textContent = userData.testData.correct;
	incorrect.textContent = userData.testData.incorrect;
	remaining.textContent = questionsLeft();
	let acc = Math.abs(userData.testData.correct/(userData.testData.correct + userData.testData.incorrect));
	grade.textContent = (acc < Infinity ? (100*acc).toFixed(2) : "?") + "%";
	if (acc < Infinity) {
		grade.style.color = "rgb(" +
		Math.floor(256*clamp(0.25 - 1.5*(acc - 1), 0.16, 1)) + ","+
		Math.floor(256*clamp(4*acc*acc, 0, 1)) + "," +
		Math.floor(256*clamp(0.4 - Math.abs(1.75*acc - 0.5), 0, 0.01)) + ")";
	} else {
		grade.style.color = "";
	}
	if (store) {
		setCookie('userData', JSON.stringify(userData), 2147483647);
	}
}

function refreshBox(box, showAll = false) {
	for (const datum of symbolTypes) {
		if (datum == userData.testSettings.answerDisplay || showAll) {
			box.getElementsByClassName(datum)[0].style.display = "flex";
		} else if (datum == 'kana' && userData.testSettings.answerDisplay == 'kanji' && showFurigana()) {
			box.getElementsByClassName(datum)[0].style.display = "flex";
		} else {
			box.getElementsByClassName(datum)[0].style.display = "none";
		}
	}
	for (const svg of box.querySelectorAll('svg.kana')) {
		svg.style.display = userData.testSettings.romaji ? "none" : "";
	}
	for (const svg of box.querySelectorAll('svg.romaji')) {
		svg.style.display = userData.testSettings.romaji ? "" : "none";
	}
}

function refreshBoxes() {
	for (const answerContainer of answerGrid.children) {refreshBox(answerContainer.firstElementChild)}
	for (const datum of symbolTypes) {
		if (datum == userData.testSettings.questionDisplay) {
			questionBox.getElementsByClassName(datum)[0].style.display = "flex";
		} else if (datum == 'kana' && userData.testSettings.questionDisplay == 'kanji' && showFurigana()) {
			questionBox.getElementsByClassName(datum)[0].style.display = "flex";
		} else {
			questionBox.getElementsByClassName(datum)[0].style.display = "none";
		}
	}
	for (const svg of questionBox.querySelectorAll('svg.kana')) {
		svg.style.display = userData.testSettings.romaji ? "none" : "";
	}
	for (const svg of questionBox.querySelectorAll('svg.romaji')) {
		svg.style.display = userData.testSettings.romaji ? "" : "none";
	}

	document.querySelector('input[value="kana"][name="questionDisplay"] + span').textContent = userData.testSettings.romaji ? "Kana" : "かな"
	document.querySelector('input[value="kana"][name="answerDisplay"] + span').textContent = userData.testSettings.romaji ? "Kana" : "かな"
	
}

function addAnswer(answerData, isCorrect=false) {
	let newAnswer = answerTemplate.cloneNode(true); refreshBox(newAnswer.firstElementChild);
	setData(newAnswer.firstElementChild, answerData, isCorrect);
	newAnswer.onclick = chooseAnswer;
	answerGrid.appendChild(newAnswer);
	
}

async function setData(answerBox, answerData, isCorrect=false) {
	while (answerBox.children[0].childElementCount > 0) {answerBox.children[0].removeChild(answerBox.children[0].lastElementChild)}
	while (answerBox.children[1].childElementCount > 0) {answerBox.children[1].removeChild(answerBox.children[1].lastElementChild)}
	while (answerBox.children[2].childElementCount > 0) {answerBox.children[2].removeChild(answerBox.children[2].lastElementChild)}
	
	answerBox.classList.remove('correct', 'incorrect');
	answerBox.classList.add(isCorrect ? 'correct' : 'incorrect');
	questionBox.classList.remove('correct', 'incorrect');

	for (const datum of symbolTypes) {
		let p = answerBox.getElementsByClassName(datum)[0];
		if (datum == 'kana') {
			for (const reading of answerData.kunyomi) {
				if (reading) {
					const kanasvg = generateTextSVG(reading);
					kanasvg.classList.add('kunyomi', 'kana');
					const romajisvg = generateTextSVG(kanaToRomaji(reading));
					romajisvg.classList.add('kunyomi', 'romaji');
					
					const width = Math.max(kanasvg.viewBox.baseVal.width, romajisvg.viewBox.baseVal.width);
					kanasvg.viewBox.baseVal.x += (kanasvg.viewBox.baseVal.width - width)*0.5;
					kanasvg.viewBox.baseVal.width = width;
					
					romajisvg.viewBox.baseVal.x += (romajisvg.viewBox.baseVal.width - width)*0.5;
					romajisvg.viewBox.baseVal.width = width;
					
					if (userData.testSettings.romaji) {
						kanasvg.style.display = "none"
					} else {
						romajisvg.style.display = "none"
					}
					p.appendChild(kanasvg);
					p.appendChild(romajisvg);
				}
			}
			for (const reading of answerData.onyomi) {
				if (reading) {
					const kanasvg = generateTextSVG(reading);
					kanasvg.classList.add('onyomi', 'kana');
					const romajisvg = generateTextSVG(kanaToRomaji(reading), {width: kanasvg.viewBox.baseVal.width - 2});
					romajisvg.classList.add('onyomi', 'romaji');
					
					const width = Math.max(kanasvg.viewBox.baseVal.width, romajisvg.viewBox.baseVal.width);
					kanasvg.viewBox.baseVal.x += (kanasvg.viewBox.baseVal.width - width)*0.5;
					kanasvg.viewBox.baseVal.width = width;
					
					romajisvg.viewBox.baseVal.x += (romajisvg.viewBox.baseVal.width - width)*0.5;
					romajisvg.viewBox.baseVal.width = width;
					
					if (userData.testSettings.romaji) {
						kanasvg.style.display = "none"
					} else {
						romajisvg.style.display = "none"
					}
					
					if (userData.testSettings.romaji) {
						kanasvg.style.display = "none"
					} else {
						romajisvg.style.display = "none"
					}
					p.appendChild(kanasvg);
					p.appendChild(romajisvg);
				}
			}
		} else if (datum == 'kanji') {
			const newSVG = await getSVG(answerData[datum]);
			p.appendChild(newSVG);
		} else {
			p.appendChild(generateTextSVG(answerData[datum]));
		}
	}
}

function generateTextSVG(text, options = {}) {
	const color = options.color || 'white';

	const svgNS = "http://www.w3.org/2000/svg";
	const svgElement = document.createElementNS(svgNS, "svg");
	svgElement.setAttribute("xmlns", svgNS);
	svgElement.setAttribute("preserveAspectRatio", "none");

	try {
		const path = pageFont.getPath(text, 0, 0, 35);
		const pathElement = document.createElementNS(svgNS, 'path');
		pathElement.setAttribute('d', path.toPathData());
		pathElement.setAttribute('fill', color);

		const bbox = path.getBoundingBox();
		
		svgElement.setAttribute('viewBox', `${bbox.x1 - 3} ${pageFontHeight.y1 - 2} ${6 + bbox.x2 - bbox.x1} ${4 + pageFontHeight.y2 - pageFontHeight.y1}`);
		svgElement.appendChild(pathElement);

		return svgElement;
	} catch (err) {
		console.log(err);
	}
	return svgElement;
}

async function getSVG(character) {
	if (loadedSVGs.hasOwnProperty(character)) {
		return loadedSVGs[character].cloneNode(true);
	} else if (character.length != 1) {
		//if (character.length > 1) console.log(`Character length must be 1! Length of '${character}' is ${character.length}`);
		const svg = generateTextSVG(character);
		svg.style.filter = 'url(#outlineFilter)';
		loadedSVGs[character] = svg.cloneNode(true);
		return svg;
	}
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	try {
		const response = await fetch(`data/kanji/${character.charCodeAt().toString(16).padStart(5, '0')}.svg`);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.text();
		const expr = /(?!\s)+\w+(?:\s)*?=(?:\s)*?.*?(?=(?:(?:\s)*?\w*(?:\s)*?(?:=|$)))/g
		Array.from(data.substring(data.indexOf('<svg') + 4, data.indexOf('>', data.indexOf('<svg'))).matchAll(expr), e => e.shift()).forEach((e, i) => {
		    let attr = e.split('=');
			let name = attr[0].trim();
			let val = attr[1].trim().match(/[^"]+/g)[0];
			svg.setAttribute(attr[0].trim(), attr[1].trim().match(/[^"]+/g)[0]);
		})
		
		svg.innerHTML = data.substring(data.indexOf('>', data.indexOf('<svg')) + 1, data.indexOf('</svg>'));
		svg.preserveAspectRatio.baseVal.align = 1;
		toggleStrokeNumbers(svg);
		setPathColors(svg);
		svg.style.filter = 'url(#outlineFilter)';
		svg.style.overflow = "visible";
		loadedSVGs[character] = svg.cloneNode(true);
		return svg;
	} catch (error) {
		console.log('Error fetching data:', error.message);
		const svg = generateTextSVG(character);
		loadedSVGs[character] = svg.cloneNode(true);
		return svg;
	}
}

function toggleStrokeNumbers(svg) {
	const group = svg.querySelector('g[id^="kvg:StrokeNumbers"]')
	group.style.display = (group.style.display === "none") ? "" : "none";
}

function setPathColors(svg) {
	const paths = svg.querySelectorAll('path[id^="kvg:"]');
	paths.forEach((p, i) => {
		p.style.strokeWidth = "3";
		p.style.stroke = strokeColors[i % strokeColors.length];
	});
}