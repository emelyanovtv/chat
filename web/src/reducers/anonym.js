import assign from 'object-assign';
import anonymActionType from '../constants/anonym';
const defaultAnonymData = {encryptString: null};

export function anonym(state = defaultAnonymData, action) {
	switch (action.type) {
	case anonymActionType.SET_ENCRYPT:
		return assign({}, state, {encryptString: action.encrypt});
	default:
		return state;
	}
}
