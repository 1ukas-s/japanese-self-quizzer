<h1>Kanji Self Quizzer</h1><br>
<p>Must be served for now as some data is loaded as needed (there's a lot of kanji). For personal use, I recommend nodejs serve or express. See example JSON for the current data layout. I use and recommend KanjiVG for kanji graphics. Unpack the entire set of SVGs into \<page directory\>/data/kanji for them to be loaded. SVG generation requires opentype.js. There isn't currently a fallback when opentype isn't found, so make sure to get it.</p>
<p>Future plans:</p>
<ul>
	<li>Switching data layout to use KanjiDict2 as a drop-in.</li>
	<li>Finding low-filesize fonts that cover <i>at least</i> that have licenses that would allow distribution in this repository. For now, find your own.</li>
	<li>Extending test settings and statistics</li>
</ul>