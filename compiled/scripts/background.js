"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var timer_1 = __importDefault(require("./modules/timer"));
var types_1 = require("./modules/types");
var utils_1 = require("./modules/utils");
var service_1 = require("./modules/service");
var connector_1 = require("./modules/connector");
var settings = __importStar(require("./settings"));
//ICONS
var DEFAULT_ICON = { 16: "res/idle_16.png", 32: "res/idle_32.png", 64: "res/idle_64.png" };
var WORK_ICON = { 16: "res/work_16.png", 32: "res/work_32.png", 64: "work/idle_64.png" };
var REST_ICON = { 16: "res/rest_16.png", 32: "res/rest_32.png", 64: "res/rest_64.png" };
var App = /** @class */ (function () {
    function App() {
        var _this = this;
        this.state = new types_1.State();
        this.port = null;
        //LISTENERS AND SETUP
        this.on_Connection = function (p) {
            p.onMessage(_this.on_Action);
            p.onDisconnect(function () {
                _this.port = null;
            });
            _this.port = p;
            console.debug('connection in background');
            _this.out_Dispatch();
            console.debug('dispatched state on connection');
        };
        this.on_TimerUpdate = function (t) {
            _this.state.time = t;
            _this._recalculateRest();
            _this.out_Dispatch();
        };
        this.on_RestEnd = function () {
            _this.stopRest();
            _this.out_Notify();
        };
        this.on_PomodoroEnd = function () {
            _this.state.config.pomActive && _this.out_Notify(true);
        };
        this.on_Action = function (action) {
            if (!('type' in action))
                return; //TODO log bug
            switch (action.type) {
                case 'WORK':
                    _this.state.working != null ? _this.stopWork() : _this.startWork();
                    break;
                case 'REST':
                    _this.state.resting != null ? _this.stopRest() : _this.startRest();
                    break;
                case 'ADJUST':
                    _this.adjustRest(action.time);
                    break;
                case 'CONFIG':
                    _this.reconfig(action.config);
                    break;
                case 'TOGGL_IN':
                    _this.toggl_Connect(action.token);
                    break;
                case 'TOGGL_OUT':
                    _this.toggl_Disconnect();
                    break;
                case 'TOGGL_FORM':
                    _this.state.toggl.form = __assign(__assign({}, _this.state.toggl.form), action.form);
                    _this.out_Dispatch();
                    break;
                case 'TOGGL_SAVE_LAST':
                    _this.toggl_RetroSave();
                    break;
                case 'NOTIFY':
                case 'STATE':
                    utils_1.log.bug('FrontEnd action recieved in background', action);
                    break;
                default:
                    var _check = action;
                    utils_1.log.bug('Unknown object at background port', action);
            }
        };
        //APP ACTIONS
        this.startWork = function () {
            _this.state.toggl.form.unsaved = null;
            _this.state.resting = null;
            _this.state.working = Date.now();
            _this.state.time = _this.timer.up();
            _this.pomTimer.down(__assign(__assign({}, utils_1.ZERO_TIMER), { minutes: _this.state.config.pomTime }));
            (0, service_1.iconChange)(WORK_ICON);
            _this.out_SaveStorage();
            _this.out_Dispatch();
        };
        this.stopWork = function () {
            _this.toggl_Save();
            _this.state.working = null;
            _this.state.time = _this.timer.reset();
            _this.pomTimer.reset();
            (0, service_1.iconChange)(DEFAULT_ICON);
            _this.out_Dispatch();
        };
        this.startRest = function () {
            _this.state.working && _this.toggl_Save();
            _this.state.working = null;
            _this.state.resting = Date.now();
            _this.state.time = _this.timer.down(_this.state.nextRest);
            _this.pomTimer.reset();
            if (_this.state.config.mode) {
                _this.state.config.mode = types_1.Mode.ON;
                _this._recalculateRest();
            }
            (0, service_1.iconChange)(REST_ICON);
            _this.out_SaveStorage(); //to save ratio and mode
            _this.out_Dispatch();
        };
        this.stopRest = function () {
            _this.state.resting = null;
            _this.state.time = _this.timer.reset();
            (0, service_1.iconChange)(DEFAULT_ICON);
            _this.out_Dispatch();
        };
        this.reconfig = function (config) {
            _this.state.config = __assign(__assign({}, _this.state.config), config);
            _this._recalculateRest();
            _this.out_Dispatch();
        };
        this.adjustRest = function (value) {
            if (!value) {
                _this.state.config.mode = types_1.Mode.ON; //TODO recalculation is dependent on this change
                _this._recalculateRest();
            }
            else {
                _this.state.config.mode = _this.state.config.mode && types_1.Mode.PAUSED;
                _this.state.nextRest = value;
            }
            _this.out_Dispatch();
        };
        this.restoreFromStorage = function () { return __awaiter(_this, void 0, void 0, function () {
            var data, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, (0, service_1.storageGet)()];
                    case 1:
                        data = _a.sent();
                        if (data.config) {
                            this.state.config = __assign(__assign({}, this.state.config), data.config);
                        }
                        if (!data.toggl) return [3 /*break*/, 3];
                        this.state.toggl.form.shouldSave = data.toggl.shouldSave;
                        return [4 /*yield*/, this.toggl_Connect(data.toggl.auth)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!data.config && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                            this.state.config.dark = true;
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        this.out_Dispatch();
                        return [2 /*return*/];
                }
            });
        }); };
        this._recalculateRest = function () {
            if (_this.state.config.mode === types_1.Mode.ON) {
                _this.state.nextRest = (0, utils_1.getRestTime)(_this.state.working ? _this.state.time : utils_1.ZERO_TIMER, _this.state.config.ratio);
            }
        };
        //TOGGL APP ACTIONS
        this.toggl_Save = function () { return __awaiter(_this, void 0, void 0, function () {
            var form, login, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        form = this.state.toggl.form, login = this.state.toggl.login;
                        if (!this.state.working) {
                            utils_1.log.bug('invalid toggle save', this.state);
                            return [2 /*return*/];
                        }
                        if (!(form.shouldSave && login.token)) return [3 /*break*/, 6];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        login.loading = true;
                        this.out_Dispatch();
                        return [4 /*yield*/, (0, service_1.togglApiAdd)(login.token, this.state.working, Date.now(), form.desc, form.projectId)];
                    case 2:
                        _a.sent();
                        login.error = null;
                        return [3 /*break*/, 5];
                    case 3:
                        e_1 = _a.sent();
                        this.out_Toggl_Error(e_1);
                        return [3 /*break*/, 5];
                    case 4:
                        login.loading = false;
                        form.unsaved = null;
                        this.out_SaveStorage(); //to save form
                        this.out_Dispatch();
                        return [7 /*endfinally*/];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        form.unsaved = { start: this.state.working, end: Date.now() };
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        this.toggl_RetroSave = function () { return __awaiter(_this, void 0, void 0, function () {
            var form, login, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        form = this.state.toggl.form, login = this.state.toggl.login;
                        if (!(login.token && form.unsaved)) return [3 /*break*/, 6];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        login.loading = true;
                        this.out_Dispatch();
                        return [4 /*yield*/, (0, service_1.togglApiAdd)(login.token, form.unsaved.start, form.unsaved.end, form.desc, form.projectId)];
                    case 2:
                        _a.sent();
                        login.error = null;
                        return [3 /*break*/, 5];
                    case 3:
                        e_2 = _a.sent();
                        this.out_Toggl_Error(e_2);
                        return [3 /*break*/, 5];
                    case 4:
                        login.loading = false;
                        form.unsaved = null;
                        this.out_SaveStorage(); //to save form
                        this.out_Dispatch();
                        return [7 /*endfinally*/];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        utils_1.log.bug('Inavild retrosaved action recieved', { token: login.token, unsaved: form.unsaved });
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        this.toggl_Connect = function (token) { return __awaiter(_this, void 0, void 0, function () {
            var t, data, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        t = this.state.toggl.login;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        t.loading = true;
                        this.out_Dispatch();
                        return [4 /*yield*/, (0, service_1.togglApiConnect)(token)];
                    case 2:
                        data = _a.sent();
                        t.projects = data.projects;
                        t.token = token;
                        this.state.toggl.form.projectId = data.last || null;
                        t.error = null;
                        return [3 /*break*/, 5];
                    case 3:
                        e_3 = _a.sent();
                        this.out_Toggl_Error(e_3);
                        return [3 /*break*/, 5];
                    case 4:
                        t.loading = false;
                        this.out_SaveStorage();
                        this.out_Dispatch();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        this.toggl_Disconnect = function () { return __awaiter(_this, void 0, void 0, function () {
            var t, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        t = this.state.toggl.login;
                        t.token = null;
                        t.projects = [];
                        t.error = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        if (!t.token) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, service_1.togglApiDisconnect)(t.token)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 6];
                    case 4:
                        e_4 = _a.sent();
                        this.out_Toggl_Error(e_4);
                        return [3 /*break*/, 6];
                    case 5:
                        this.out_Dispatch();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        //OUTPUT METHODS
        this.out_Dispatch = function (action) {
            if (action === void 0) { action = { type: 'STATE', state: _this.state }; }
            _this.port && _this.port.postMessage(action);
        };
        this.out_Notify = function (pomodoro) {
            if (pomodoro === void 0) { pomodoro = false; }
            _this.out_Dispatch({ type: "NOTIFY", subType: pomodoro ? types_1.NotifyType.POM : types_1.NotifyType.WORK });
            (0, service_1.notify)(pomodoro ? types_1.NotifyType.POM : types_1.NotifyType.WORK);
        };
        /*   out_ChangeIcon = (path : string | IconObject)=> {
            browser.browserAction.setIcon({path})
          } */
        this.out_Toggl_Error = function (e) {
            var message = typeof e.message == 'string' ? e.message : settings.ERROR_MESSAGE;
            _this.state.toggl.login.error = message;
            utils_1.log.error("Toggl network error", e, _this.state);
        };
        this.out_SaveStorage = function () { return __awaiter(_this, void 0, void 0, function () {
            var e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, service_1.storageSave)({
                                config: this.state.config,
                                toggl: this.state.toggl.login.token ? {
                                    auth: this.state.toggl.login.token,
                                    shouldSave: this.state.toggl.form.shouldSave
                                } : undefined
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_5 = _a.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.timer = new timer_1.default(this.on_TimerUpdate, this.on_RestEnd);
        this.pomTimer = new timer_1.default(function () { }, this.on_PomodoroEnd);
        utils_1.log.debug('onConnect added');
        (0, connector_1.onConnect)(this.on_Connection);
        this.restoreFromStorage();
    }
    return App;
}());
//GLOBAL ERROR CATCHERS
var handleError = function (err) {
    utils_1.log.error('Error caught in background script', err);
    (0, service_1.storageErrorSave)(err);
    throw err;
};
addEventListener('error', function (e) { handleError(e.error); }); //TODO not working in firefox
addEventListener('unhandledrejection', function (e) { handleError(e.reason); });
//LAUNCH
new App();
