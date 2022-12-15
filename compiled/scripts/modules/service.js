"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reload = exports.notify = exports.storageErrorGet = exports.storageErrorSave = exports.storageSave = exports.storageGet = exports.iconChange = exports.togglApiAdd = exports.togglApiDisconnect = exports.togglApiConnect = void 0;
var favicon_js_1 = __importDefault(require("favicon.js")); //write @types TODO
var wretch_1 = __importDefault(require("wretch"));
//import favicon from 'favicon.js'
var types_1 = require("./types");
var settings_1 = require("../settings");
var utils_1 = require("./utils");
var WORK_SOUND = 'res/work.ogg';
var POM_SOUND = 'res/pom.ogg';
var WORK_ALERT_ICON = 'res/workAlert.svg';
var POM_ALERT_ICON = 'res/pomAlert.svg';
/* const storage = EXTENSION ?
  {get : browser.storage.local.get, set : browser.storage.local.set} :
  {
    get:
     (keys :string[]) => keys.map(k=>localStorage.getItem(k)),
    set:
      () => localStorage.setItem
  }
const ICON = ''
const NOTIFICATION = ''*/
var STORAGE_ERROR_KEY = 'STORAGE_ERROR_KEY';
var STORAGE_USER_KEY = 'STORAGE_USER_KEY';
var w = (0, wretch_1.default)()
    .url(settings_1.TOGGL_URL);
var getAuth = function (auth) { return 'Basic ' + btoa(typeof auth == 'string' ? "".concat(auth, ":api_token") : "".concat(auth.user, ":").concat(auth.pass)); };
var handleToggl403 = function (err) {
    utils_1.log.error('403 on trying to connect to Toggl', err);
    throw new Error('Looks like your toggl credentials are wrong :(');
};
var handleTogglOther = function (err) {
    utils_1.log.error('Error on trying to reach to Toggl', err);
    throw new Error("Can't reach out to Toggl :(");
};
var handleInvalidData = function (err) {
    utils_1.log.error('Error on parsing data from Toggl', err);
    throw new Error("Can't make sence of data from Toggl :( Updating extension might help..");
};
var togglApiConnect = function (credential) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, w.url(settings_1.TOGGL_USER_URL)
                .auth(getAuth(credential))
                .get()
                .unauthorized(handleToggl403)
                .fetchError(handleTogglOther)
                .json(function (d) {
                var _a;
                var valid = types_1.Toggl_Me_Schema.parse(d);
                return {
                    projects: valid.data.projects.map(function (p) { return ({ id: p.id, name: p.name }); }),
                    last: (_a = valid.data.time_entries[0]) === null || _a === void 0 ? void 0 : _a.pid
                };
            })
                .catch(handleInvalidData)];
    });
}); };
exports.togglApiConnect = togglApiConnect;
var togglApiDisconnect = function (credential) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/];
    });
}); };
exports.togglApiDisconnect = togglApiDisconnect;
var togglApiAdd = function (credential, start, stop, description, project) { return __awaiter(void 0, void 0, void 0, function () {
    var data;
    return __generator(this, function (_a) {
        data = { time_entry: {
                start: new Date(start).toISOString(),
                duration: Math.floor((stop - start) / 1e3),
                //stop: new Date(stop).toISOString(),
                description: description,
                created_with: settings_1.CLIENT_NAME,
                pid: project != null ? project : undefined
            } };
        w.url(settings_1.TOGGL_ADD_URL)
            .auth(getAuth(credential))
            .post(data)
            .unauthorized(handleToggl403)
            .res().catch(handleTogglOther);
        return [2 /*return*/];
    });
}); };
exports.togglApiAdd = togglApiAdd;
var iconChange = function (path) {
    settings_1.EXTENSION ? browser.browserAction.setIcon({ path: path }) : favicon_js_1.default.change(typeof path == 'string' ? path : path[16]);
};
exports.iconChange = iconChange;
var storageGet = function () { return __awaiter(void 0, void 0, void 0, function () {
    var data, _a, _b, _c, err_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 4, , 5]);
                _b = (_a = types_1.UserStorageSchema).parse;
                if (!settings_1.EXTENSION) return [3 /*break*/, 2];
                return [4 /*yield*/, browser.storage.local.get(['config', 'toggle'])];
            case 1:
                _c = _d.sent();
                return [3 /*break*/, 3];
            case 2:
                _c = JSON.parse(localStorage.getItem(STORAGE_USER_KEY) || '{}');
                _d.label = 3;
            case 3:
                data = _b.apply(_a, [_c]);
                utils_1.log.debug('Retrieved from storage: ', data);
                return [2 /*return*/, data];
            case 4:
                err_1 = _d.sent();
                utils_1.log.error('Error on trying to get data to storage', err_1);
                throw new Error("Problems trying to restore your options :/");
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.storageGet = storageGet;
var storageSave = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                if (!settings_1.EXTENSION) return [3 /*break*/, 2];
                return [4 /*yield*/, browser.storage.local.set(data)];
            case 1:
                _a = _b.sent();
                return [3 /*break*/, 3];
            case 2:
                _a = localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data));
                _b.label = 3;
            case 3:
                _a;
                utils_1.log.debug('Saved to storage.', data);
                return [3 /*break*/, 5];
            case 4:
                err_2 = _b.sent();
                utils_1.log.error('Error on trying to save to storage', err_2);
                throw new Error("Can't save your options for future use :(");
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.storageSave = storageSave;
var storageErrorSave = function (err) { return __awaiter(void 0, void 0, void 0, function () {
    var data;
    var _a;
    return __generator(this, function (_b) {
        data = JSON.stringify(err, undefined, 2) //TODO string wrongly saved `${err.name}: ${err.message} ${err.stack ? `Stack: \n  ${err.stack}`:''}`
        ;
        return [2 /*return*/, settings_1.EXTENSION ?
                browser.storage.local.set((_a = {}, _a[STORAGE_ERROR_KEY] = data, _a)) :
                localStorage.setItem(STORAGE_ERROR_KEY, data)];
    });
}); };
exports.storageErrorSave = storageErrorSave;
var storageErrorGet = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, settings_1.EXTENSION ?
                browser.storage.local.get(STORAGE_ERROR_KEY).then(function (storage) { return storage[STORAGE_ERROR_KEY]; }) :
                localStorage.getItem(STORAGE_ERROR_KEY)];
    });
}); };
exports.storageErrorGet = storageErrorGet;
var notify = function (type) {
    var pomodoro = type == types_1.NotifyType.POM;
    settings_1.EXTENSION ? browser.notifications.create({
        type: 'basic',
        title: pomodoro ? 'Pomodoro alert!' : 'Time to work!',
        message: pomodoro ? 'you\'ve been working for a long time, take a rest' : 'your rest time is up',
        iconUrl: pomodoro ? POM_ALERT_ICON : WORK_ALERT_ICON
    }) : function () { }; //TODO implement web notification
    new Audio(pomodoro ? POM_SOUND : WORK_SOUND).play();
};
exports.notify = notify;
var reload = function () { settings_1.EXTENSION ? browser.runtime.reload() : location.reload(); };
exports.reload = reload;
