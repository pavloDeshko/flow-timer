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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_dom_1 = __importDefault(require("react-dom"));
var styles_1 = require("@mui/material/styles");
var react_error_boundary_1 = require("react-error-boundary");
require("./background"); //TODO DIFF WITH EXT
var components_1 = require("./modules/components");
var types_1 = require("./modules/types");
var service_1 = require("./modules/service");
var utils_1 = require("./modules/utils");
var styles_2 = require("./modules/styles");
var connector_1 = require("./modules/connector");
var App = function () {
    var _a = (0, react_1.useState)([function (a) { utils_1.log.bug('Action dispatched on popup while no port is present: ', a); }]), dispatch = _a[0][0], setDispatch = _a[1];
    var _b = (0, react_1.useState)(null), state = _b[0], setAppState = _b[1];
    var memoProjects = (0, react_1.useMemo)(function () { return state ? state.toggl.login.projects : []; }, [state === null || state === void 0 ? void 0 : state.toggl.login.projects.length]);
    var _c = (0, react_1.useState)(null), alert = _c[0], setAlert = _c[1];
    var cancelAlerts = function (work, rest) {
        (alert == types_1.NotifyType.POM && !work ||
            alert == types_1.NotifyType.WORK && !rest) && setAlert(null);
    };
    var handleFatal = (0, react_error_boundary_1.useErrorHandler)();
    var crash = function (reason) {
        (0, service_1.storageErrorGet)().then(function (errorJSON) {
            utils_1.log.error(reason + ' retrived object: ', errorJSON);
            handleFatal(new utils_1.RetrievedError(errorJSON));
        }, handleFatal);
    };
    (0, utils_1.useTimeoutUnless)(function () { return crash('Crashed on timeout'); }, !!state, 1000);
    var react = function (action) {
        utils_1.log.debug('New action recieved', action);
        if ('type' in action) {
            if (action.type == 'STATE') {
                setAppState(__assign({}, action.state)); //TODO clones state twice on extension
                cancelAlerts(!!action.state.working, !!action.state.resting);
            }
            else if (action.type == 'NOTIFY') {
                setAlert(action.subType);
            }
        }
        else {
            utils_1.log.bug('Unknown object at popup port', action);
        }
    };
    (0, react_1.useEffect)(function () {
        var p = (0, connector_1.connect)();
        setDispatch([function (action) {
                utils_1.log.debug('Action dispatched: ', action);
                p.postMessage(action);
            }]);
        p.onMessage(react);
        p.onDisconnect(function () { return crash('Crashed on disconnect'); }); //check
    }, []);
    return state && (react_1.default.createElement(components_1.DispatchContext.Provider, { value: dispatch },
        react_1.default.createElement(styles_1.ThemeProvider, { theme: state.config.dark ? styles_2.darkTheme : styles_2.lightTheme },
            react_1.default.createElement(components_1.AppContainer, null,
                react_1.default.createElement(components_1.BlockContainer, { className: "CounterBlock", stacked: true },
                    react_1.default.createElement(components_1.Counter, __assign({}, state.time)),
                    react_1.default.createElement(components_1.Controls, { working: !!state.working, resting: !!state.resting }),
                    react_1.default.createElement(components_1.RestAdjust, { nextRest: state.nextRest, mode: state.config.mode }),
                    react_1.default.createElement(components_1.TimeAlert, { type: alert })),
                react_1.default.createElement(components_1.BlockContainer, { className: "OptionsBlock" },
                    react_1.default.createElement(components_1.Options, __assign({}, state.config))),
                react_1.default.createElement(components_1.AccordionContainer, { className: "TogglBlock", label: react_1.default.createElement(components_1.TogglCollapsed, { logged: !!state.toggl.login.token }), expanded: !!state.toggl.login.token },
                    !state.toggl.login.token ?
                        react_1.default.createElement(components_1.TogglLogin, __assign({}, state.toggl.login)) :
                        react_1.default.createElement(components_1.TogglForm, __assign({}, state.toggl.form, { projects: memoProjects })),
                    react_1.default.createElement(components_1.TogglError, { error: state.toggl.login.error }))))));
};
react_dom_1.default.render(//TODO what about ThemeProvider here?
react_1.default.createElement(react_error_boundary_1.ErrorBoundary, { FallbackComponent: components_1.AppFallback },
    react_1.default.createElement(App, null)), document.getElementById('appRoot'));
