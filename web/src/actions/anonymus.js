import anonymActionType from '../constants/anonym';
export function setEncryptString(encrypt) {
	return {
		type: anonymActionType.SET_ENCRYPT,
		encrypt
	};
}
