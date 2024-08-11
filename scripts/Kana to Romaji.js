function kanaToRomaji(str) {
	// step 1: sha shu sho, ja ju jo, da du do, etc..
	// ([しじシジちぢチヂ][ゃゅょャュョ])
	// step 2: *ya *yu *yo
	// (?![しじシジちぢチヂ])([\u3040-\u30FF][ゃゅょャュョ])
	// step 3: n followed by vowel
	// ([んン][ぁ-おァ-オゃ-よャ-ヨ])
	// step 4: long vowels and long consonants
	// ([ーっッ])
	let groups = str.split(/([^\u3040-\u30FF])/);
	for (let i in groups) {
		groups[i] = groups[i].replaceAll(/[しじシジちぢチヂ][ゃゅょャュョ]/g, individualKanaToRomaji);
		groups[i] = groups[i].replaceAll(/(?![しじシジちぢチヂ])[\u3040-\u30FF][ゃゅょャュョ]/g, individualKanaToRomaji);
		groups[i] = groups[i].replaceAll(/[んン][ぁ-おァ-オゃ-よャ-ヨ]/g, individualKanaToRomaji);
		groups[i] = groups[i].replaceAll(/[^ーっッ]/g, individualKanaToRomaji);
		groups[i] = groups[i].replaceAll(/[ーっッ]/g, individualKanaToRomaji);
		groups[i] = groups[i].replaceAll(/(\S)(\s*)ー/g, "$1$1$2").replaceAll(/[っッ](\s*)(\S)/g, "$1$2$2");
		groups[i] = groups[i].replaceAll(/[っッ]\W*$/g, "`");
	}
	return groups.join('');
}

function individualKanaToRomaji(match, offset, string) {
	let romaji = match;
	if (/[しじシジちぢチヂ][ゃゅょャュョ]/.test(romaji)) {
		romaji = romaji
			.replace(/[しシ]/, 'sh').replace(/[ちチ]/, 'ch')
			.replace(/[じジぢヂ]/, 'j')
			.replace(/[ゃャ]/, 'a').replace(/[ゅュ]/, 'u').replace(/[ょョ]/, 'o');
	} else if (/(?![しじシジちぢチヂ])[\u3040-\u30FF][ゃゅょャュョ]/.test(romaji)) {
		romaji = romaji
			.replace(/[きキ]/, 'k').replace(/[ぎギ]/, 'g')
			.replace(/[にニ]/, 'n')
			.replace(/[ひヒ]/, 'h').replace(/[びビ]/, 'b').replace(/[ぴピ]/, 'p')
			.replace(/[みミ]/, 'm')
			.replace(/[りリ]/, 'r')
			.replace(/[ゃャ]/, 'ya').replace(/[ゅュ]/, 'yu').replace(/[ょョ]/, 'yo');
	} else if (/[んン][ぁ-おァ-オゃ-よャ-ヨ]/.test(romaji)) {
		romaji = romaji
			.replace(/[んン]/, "n'")
	} else if (/[^ーっッ]/.test(romaji)) {
		romaji = romaji
			.replace(/[あア]/, 'a').replace(/[いイ]/, 'i').replace(/[うウ]/, 'u').replace(/[えエ]/, 'e').replace(/[おオ]/, 'o')
			.replace(/[かカ]/, 'ka').replace(/[きキ]/, 'ki').replace(/[くク]/, 'ku').replace(/[けケ]/, 'ke').replace(/[こコ]/, 'ko')
			.replace(/[がガ]/, 'ga').replace(/[ぎギ]/, 'gi').replace(/[ぐグ]/, 'gu').replace(/[げゲ]/, 'ge').replace(/[ごゴ]/, 'go')
			.replace(/[さサ]/, 'sa').replace(/[しシ]/, 'shi').replace(/[すス]/, 'su').replace(/[せセ]/, 'se').replace(/[そソ]/, 'so')
			.replace(/[ざザ]/, 'za').replace(/[じジ]/, 'ji').replace(/[ずズ]/, 'zu').replace(/[ぜゼ]/, 'ze').replace(/[ぞゾ]/, 'zo')
			.replace(/[たタ]/, 'ta').replace(/[ちチ]/, 'chi').replace(/[つツ]/, 'tsu').replace(/[てテ]/, 'te').replace(/[とト]/, 'to')
			.replace(/[だダ]/, 'da').replace(/[ぢヂ]/, 'ji').replace(/[づヅ]/, 'zu').replace(/[でデ]/, 'de').replace(/[どド]/, 'do')
			.replace(/[なナ]/, 'na').replace(/[にニ]/, 'ni').replace(/[ぬヌ]/, 'nu').replace(/[ねネ]/, 'ne').replace(/[のノ]/, 'no')
			.replace(/[はハ]/, 'ha').replace(/[ひヒ]/, 'hi').replace(/[ふフ]/, 'fu').replace(/[へヘ]/, 'he').replace(/[ほホ]/, 'ho')
			.replace(/[ばバ]/, 'ba').replace(/[びビ]/, 'bi').replace(/[ぶブ]/, 'bu').replace(/[べベ]/, 'be').replace(/[ぼボ]/, 'bo')
			.replace(/[ぱパ]/, 'pa').replace(/[ぴピ]/, 'pi').replace(/[ぷプ]/, 'pu').replace(/[ぺペ]/, 'pe').replace(/[ぽポ]/, 'po')
			.replace(/[まマ]/, 'ma').replace(/[みミ]/, 'mi').replace(/[むム]/, 'mu').replace(/[めメ]/, 'me').replace(/[もモ]/, 'mo')
			.replace(/[やヤゃャ]/, 'ya').replace(/[ゆユゅュ]/, 'yu').replace(/[よヨょョ]/, 'yo')
			.replace(/[らラ]/, 'ra').replace(/[りリ]/, 'ri').replace(/[るル]/, 'ru').replace(/[れレ]/, 're').replace(/[ろロ]/, 'ro')
			.replace(/[わワ]/, 'wa').replace(/[をヲ]/, 'wo')
			.replace(/[んン]/, 'n');
	} else if (/[ーっッ]/.test(romaji)) {
		romaji = romaji
			.replace(/(.)\s*ー/, "$1$1")
			.replace(/[っッ]\s*(.)/, "$1$1"); // Fix the parentheses thing
	}
	return romaji;
}