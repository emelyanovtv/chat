import marked from 'marked';
import CryptoJS from 'crypto-js';

marked.setOptions({
	sanitize: true
});

export function decrypt(str, secret) {
	if (secret !== null) {
		const decrypted = CryptoJS.AES.decrypt(str, secret);
		return decrypted.toString(CryptoJS.enc.Utf8);
	}
	return str;
}

export function encrypt(str, secret) {
	const encrypted = '' + CryptoJS.AES.encrypt(str, secret);
	return encrypted;
}

export function markdown(text) {
	return marked(text);
}
