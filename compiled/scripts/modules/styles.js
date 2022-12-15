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
Object.defineProperty(exports, "__esModule", { value: true });
exports.darkTheme = exports.lightTheme = void 0;
var styles_1 = require("@mui/material/styles");
var colors = {
    primary: {
        'main': '#5ea8a7',
        'contrastText': '#fff'
    },
    secondary: {
        'main': '#ff4447',
        'contrastText': '#fff'
    },
    error: {
        'main': '#c4001f',
        'contrastText': '#fff'
    }
};
exports.lightTheme = (0, styles_1.createTheme)({
    palette: __assign(__assign({ mode: 'light' }, colors), { background: {
            paper: '#f3fbf5',
            default: '#bfdccf'
        }, text: {
            primary: 'rgba(0, 0, 0, 0.8)'
        } })
});
exports.darkTheme = (0, styles_1.createTheme)({
    palette: __assign(__assign({ mode: 'dark' }, colors), { background: {
            paper: '#2c2c2c',
            default: '#1e1e1e'
        }, text: {
            primary: 'rgba(255, 255, 255, 0.87)'
        } })
});
