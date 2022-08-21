"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _reactNative = require("react-native");

const {
  WebRTCModule
} = _reactNative.NativeModules;
const EventEmitter = new _reactNative.NativeEventEmitter(WebRTCModule);
var _default = EventEmitter;
exports.default = _default;
//# sourceMappingURL=EventEmitter.js.map