"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrievedError = exports.log = exports.parse = exports.padTwoZeros = exports.objectToSeconds = exports.secondsToObject = exports.getRestTime = exports.ZERO_TIMER_FULL = exports.ZERO_TIMER = exports.useFreeze = exports.useTimeoutUnless = void 0;
var settings_1 = require("../settings");
var react_1 = require("react");
var zod_1 = require("zod");
var JWT = /^[A-Za-z0-9-_=]+$/;
var useTimeoutUnless = function (callback, shouldCancel, timeout) {
    var _a = (0, react_1.useState)(null), timeoutId = _a[0], setTimeoutId = _a[1];
    (0, react_1.useEffect)(function () {
        setTimeoutId(setTimeout(callback, timeout));
        return function () {
            (timeoutId !== null) && clearTimeout(timeoutId); //wtf overloads
        };
    }, []);
    (0, react_1.useEffect)(function () {
        (timeoutId !== null) && shouldCancel && clearTimeout(timeoutId);
    });
};
exports.useTimeoutUnless = useTimeoutUnless;
var useFreeze = function (value) {
    return (0, react_1.useState)(value)[0];
};
exports.useFreeze = useFreeze;
exports.ZERO_TIMER = {
    hours: 0,
    minutes: 0,
    seconds: 0
};
exports.ZERO_TIMER_FULL = __assign(__assign({ days: 0 }, exports.ZERO_TIMER), { secondTenths: 0 });
var getRestTime = function (workTimeObj, ratio) {
    if (ratio === void 0) { ratio = settings_1.DEFAULT_RATIO; }
    var seconds = Math.floor((0, exports.objectToSeconds)(workTimeObj) / ratio);
    return (0, exports.secondsToObject)(seconds < settings_1.MIN_REST ? settings_1.MIN_REST : seconds > settings_1.MAX_REST ? settings_1.MAX_REST : seconds);
};
exports.getRestTime = getRestTime;
var secondsToObject = function (totalSeconds) {
    var values = __assign({}, exports.ZERO_TIMER_FULL);
    values.days = Math.floor(totalSeconds / 86400), totalSeconds %= 86400; //TODO bitwise?
    values.hours = Math.floor(totalSeconds / 3600), totalSeconds %= 3600;
    values.minutes = Math.floor(totalSeconds / 60), totalSeconds %= 60;
    values.seconds = Math.floor(totalSeconds / 1), totalSeconds %= 1;
    values.secondTenths = Math.floor(totalSeconds / 0.1);
    return values;
};
exports.secondsToObject = secondsToObject;
var objectToSeconds = function (obj) {
    var seconds = 0;
    seconds += (obj.days || 0) * 86400;
    seconds += (obj.hours || 0) * 3600;
    seconds += (obj.minutes || 0) * 60;
    seconds += (obj.seconds || 0) * 1;
    seconds += (obj.secondTenths || 0) * 0.1;
    return Math.floor(seconds);
};
exports.objectToSeconds = objectToSeconds;
var padTwoZeros = function (number) {
    return ('00' + number).slice(-2);
};
exports.padTwoZeros = padTwoZeros;
var makeParseNumber = function (max) { return function (value, fallback) {
    if (fallback === void 0) { fallback = 0; }
    var result = zod_1.z.number().nonnegative().max(max).int().safeParse(Number(value));
    return result.success ? result.data : fallback;
}; };
exports.parse = {
    twoDigit: makeParseNumber(99),
    h: makeParseNumber(24),
    m: makeParseNumber(60),
    s: makeParseNumber(60),
    togglToken: function (value) {
        return zod_1.z.string().regex(JWT).safeParse(value.replace(/(^\s+)|(\s+$)/g, ''));
    },
    togglDesc: function (value, fallback) {
        if (fallback === void 0) { fallback = ''; }
        var result = zod_1.z.string().max(1000).safeParse(value);
        return result.success ? result.data : fallback;
    }
};
exports.log = {
    error: function (message, error, state) {
        console.log('Error logged: ', message);
        error && console.log(' error: ', error.toString());
        state && console.log('   ', JSON.stringify(state, undefined, 2));
    },
    bug: function (message, state) {
        if (process.env['NODE_ENV'] != 'production') {
            console.log('Bug met: ', message);
            state && console.dir('   ', state);
        }
    },
    debug: function (message, state) {
        if (process.env['NODE_ENV'] != 'production') {
            console.log('Debug info: ', message);
            state && console.dir('   ', state);
        }
    },
    throw: function (message, state) {
        if (process.env['NODE_ENV'] != 'production') {
            throw new Error("Test error: ".concat(message, "\n  state: ").concat(state));
        }
    }
};
var RetrievedError = /** @class */ (function (_super) {
    __extends(RetrievedError, _super);
    function RetrievedError(value) {
        var _this = _super.call(this, 'Last error retrived from local storage') || this;
        _this.name = 'RetrievedError';
        _this.lastError = typeof value == 'string' ? value : String(value); // value ? value.toString() : ''
        return _this;
    }
    RetrievedError.prototype.toString = function () {
        return "".concat(this.name, ": ").concat(this.message, "\n  ").concat(this.lastError);
    };
    return RetrievedError;
}(Error));
exports.RetrievedError = RetrievedError;
