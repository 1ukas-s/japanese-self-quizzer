function getCookie(cookieName) {
	if (document.cookie.indexOf(cookieName) > -1) {
		let cookie = document.cookie.substring(document.cookie.indexOf('=', document.cookie.indexOf(cookieName))+1);
		return cookie.substring(0, cookie.indexOf(';') > -1 ? cookie.indexOf(';') : undefined).trim();
	} else {
		return undefined
	}
}

function setCookieVararg(cookieName, value, kwargs = {}) {
	let totalCookie = `${cookieName}=${value}`;
	for (arg in kwargs) {
		totalCookie += `; ${arg}=${kwargs[arg]}`;
	}
	document.cookie = totalCookie;
}

function setCookie(cookieName, value, expirationTimeMS = -1, path = undefined) {
	let kwargs = {SameSite: 'Lax'}
	if (expirationTimeMS > 0) {
		kwargs.expires = new Date(Date.now() + expirationTimeMS).toUTCString();
	}
	if (path) {
		kwargs.path = path;
	}
	setCookieVararg(cookieName, value, kwargs);
}