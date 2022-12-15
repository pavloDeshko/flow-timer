"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXTENSION = exports.SUPPORT_EMAIL = exports.CLIENT_NAME = exports.TOGGL_USER_URL = exports.TOGGL_ADD_URL = exports.TOGGL_URL = exports.TOGGL_TOKEN_URL = exports.ERROR_MESSAGE = exports.POM_TIMES = exports.DEFAULT_RATIO = exports.MAX_REST = exports.MIN_REST = void 0;
//commited envs
exports.MIN_REST = 4;
exports.MAX_REST = 3600;
exports.DEFAULT_RATIO = 2;
exports.POM_TIMES = [1, 5, 10, 15, 20, 30, 45, 50, 60];
exports.ERROR_MESSAGE = 'Unknown error occured :('; // TODO get other messages here too
exports.TOGGL_TOKEN_URL = 'https://track.toggl.com/profile#api-token';
exports.TOGGL_URL = 'https://api.track.toggl.com/api/v8';
exports.TOGGL_ADD_URL = '/time_entries';
exports.TOGGL_USER_URL = '/me?with_related_data=true';
exports.CLIENT_NAME = 'Flow Timer Web-Extension';
exports.SUPPORT_EMAIL = 'pavlodeshko92@gmail.com';
exports.EXTENSION = !process.env["REACT_APP_ENV"];
//private envs
//export const env = process.env['env']
//export const TOGGL_DEBUG = ''
