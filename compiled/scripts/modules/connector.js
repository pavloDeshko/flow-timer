"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onConnect = exports.connect = void 0;
var settings_1 = require("../settings");
var ExtensionConnector = /** @class */ (function () {
    function ExtensionConnector(port) {
        this.port = port;
    }
    ExtensionConnector.prototype.postMessage = function (message) {
        this.port.postMessage(message);
    };
    ExtensionConnector.prototype.onMessage = function (cb) {
        this.port.onMessage.addListener(cb);
    };
    ExtensionConnector.prototype.onDisconnect = function (cb) {
        this.port.onDisconnect.addListener(cb);
    };
    return ExtensionConnector;
}());
var onConnectExt = function (cb) {
    browser.runtime.onConnect.addListener(function (p) {
        cb(new ExtensionConnector(p));
    });
};
var connectExt = function () {
    return new ExtensionConnector(browser.runtime.connect());
};
/***********/
var WebConnector = /** @class */ (function () {
    function WebConnector() {
        this.onMessageCb = null;
        this._sibling = null;
    }
    WebConnector.prototype.postMessage = function (message) {
        var _this = this;
        setTimeout(function () { var _a; return ((_a = _this._sibling) === null || _a === void 0 ? void 0 : _a.onMessageCb) && _this._sibling.onMessageCb(message); }, 0);
    };
    WebConnector.prototype.onMessage = function (cb) {
        this.onMessageCb = cb;
    };
    WebConnector.prototype.onDisconnect = function (cb) { };
    return WebConnector;
}());
var onConnectCb = null;
var onConnectWeb = function (cb) {
    onConnectCb = cb;
};
var connectWeb = function () {
    var pair = getWebConnectorPair();
    setTimeout(function () { return onConnectCb && onConnectCb(pair[0]); }, 0);
    return pair[1];
};
var getWebConnectorPair = function () {
    var two = new WebConnector();
    var one = new WebConnector();
    one._sibling = two;
    two._sibling = one;
    return [one, two];
};
exports.connect = settings_1.EXTENSION ? connectExt : connectWeb;
exports.onConnect = settings_1.EXTENSION ? onConnectExt : onConnectWeb;
