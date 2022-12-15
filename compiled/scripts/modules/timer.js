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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var easytimer_js_1 = __importDefault(require("easytimer.js"));
var utils_1 = require("./utils");
var TimerWrapper = /** @class */ (function () {
    function TimerWrapper(onUpdate, onEnd) {
        if (onUpdate === void 0) { onUpdate = function (t) { }; }
        if (onEnd === void 0) { onEnd = function (t) { }; }
        var _this = this;
        this.eTimer = new easytimer_js_1.default();
        this.update = function () { return onUpdate(_this.values); };
        this.end = function () { return onEnd(_this.values); };
        this.eTimer.on('secondsUpdated', this.update);
        this.eTimer.on('targetAchieved', this.end);
    }
    TimerWrapper.prototype.up = function () {
        this.eTimer.stop();
        this.eTimer.start();
        return __assign({}, utils_1.ZERO_TIMER);
    };
    TimerWrapper.prototype.down = function (t) {
        this.eTimer.stop();
        this.eTimer.start({ countdown: true, startValues: t });
        return __assign({}, t);
    };
    TimerWrapper.prototype.pause = function () {
        this.eTimer.pause();
        return this.values;
    };
    TimerWrapper.prototype.reset = function () {
        this.eTimer.stop();
        return __assign({}, utils_1.ZERO_TIMER);
    };
    TimerWrapper.prototype.clear = function () {
        this.eTimer.removeAllEventListeners();
    };
    Object.defineProperty(TimerWrapper.prototype, "values", {
        get: function () {
            return __assign({}, this.eTimer.getTimeValues());
        },
        enumerable: false,
        configurable: true
    });
    return TimerWrapper;
}());
exports.default = TimerWrapper;
