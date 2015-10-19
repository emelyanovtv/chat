import {combineReducers} from 'redux';
import {channels} from './channels';
import {messages} from './messages';
import {user} from './user';
import {ui} from './ui';
import {anonym} from './anonym';

const app = combineReducers({channels, messages, user, ui, anonym});

export default app;
