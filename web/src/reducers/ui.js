import assign from 'object-assign';
import uiActionType from '../constants/ui';

const defaultData = {
	errors: {
		addChannel: {
			status: false,
			message: 'sorry, contact is not found',
			additional: null
		},
		submitMessage: {
			status: false,
			message: 'You can\'t send the message',
			additional: null
		}
	},
	videoPanel: {
		active: false
	}
};

export function ui(state = defaultData, action) {
	switch (action.type) {

	case uiActionType.SET_ERROR:
		state.errors[action.errorName].status = true;
		if (action.additional !== null) {
			state.errors[action.errorName].additional = action.additional;
		}
		return assign({}, state);

	case uiActionType.REMOVE_ERROR:
		state.errors[action.errorName].status = false;
		state.errors[action.errorName].additional = null;
		return assign({}, state);

	case uiActionType.ACTIVATE_VIDEO_PANEL:
		state.videoPanel.active = true;
		state.videoPanel.localStream = action.localStream;
		state.videoPanel.remoteStream = action.remoteStream;
		return assign({}, state);

	case uiActionType.DEACTIVATE_VIDEO_PANEL:
		state.videoPanel.active = false;
		state.videoPanel.localStream = null;
		state.videoPanel.remoteStream = null;
		return assign({}, state);

	default:
		return state;
	}
}
