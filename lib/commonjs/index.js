"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "MediaStream", {
  enumerable: true,
  get: function () {
    return _MediaStream.default;
  }
});
Object.defineProperty(exports, "MediaStreamTrack", {
  enumerable: true,
  get: function () {
    return _MediaStreamTrack.default;
  }
});
Object.defineProperty(exports, "RTCIceCandidate", {
  enumerable: true,
  get: function () {
    return _RTCIceCandidate.default;
  }
});
Object.defineProperty(exports, "RTCPeerConnection", {
  enumerable: true,
  get: function () {
    return _RTCPeerConnection.default;
  }
});
Object.defineProperty(exports, "RTCSessionDescription", {
  enumerable: true,
  get: function () {
    return _RTCSessionDescription.default;
  }
});
Object.defineProperty(exports, "RTCView", {
  enumerable: true,
  get: function () {
    return _RTCView.default;
  }
});
Object.defineProperty(exports, "ScreenCapturePickerView", {
  enumerable: true,
  get: function () {
    return _ScreenCapturePickerView.default;
  }
});
Object.defineProperty(exports, "mediaDevices", {
  enumerable: true,
  get: function () {
    return _MediaDevices.default;
  }
});
Object.defineProperty(exports, "permissions", {
  enumerable: true,
  get: function () {
    return _Permissions.default;
  }
});
exports.registerGlobals = registerGlobals;

var _ScreenCapturePickerView = _interopRequireDefault(require("./ScreenCapturePickerView"));

var _RTCPeerConnection = _interopRequireDefault(require("./RTCPeerConnection"));

var _RTCIceCandidate = _interopRequireDefault(require("./RTCIceCandidate"));

var _RTCSessionDescription = _interopRequireDefault(require("./RTCSessionDescription"));

var _RTCView = _interopRequireDefault(require("./RTCView"));

var _MediaStream = _interopRequireDefault(require("./MediaStream"));

var _MediaStreamTrack = _interopRequireDefault(require("./MediaStreamTrack"));

var _MediaDevices = _interopRequireDefault(require("./MediaDevices"));

var _Permissions = _interopRequireDefault(require("./Permissions"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function registerGlobals() {
  // Should not happen. React Native has a global navigator object.
  if (typeof global.navigator !== 'object') {
    throw new Error('navigator is not an object');
  }

  if (!global.navigator.mediaDevices) {
    global.navigator.mediaDevices = {};
  }

  global.navigator.mediaDevices.getUserMedia = _MediaDevices.default.getUserMedia.bind(_MediaDevices.default);
  global.navigator.mediaDevices.getDisplayMedia = _MediaDevices.default.getDisplayMedia.bind(_MediaDevices.default);
  global.navigator.mediaDevices.enumerateDevices = _MediaDevices.default.enumerateDevices.bind(_MediaDevices.default);
  global.RTCPeerConnection = _RTCPeerConnection.default;
  global.RTCIceCandidate = _RTCIceCandidate.default;
  global.RTCSessionDescription = _RTCSessionDescription.default;
  global.MediaStream = _MediaStream.default;
  global.MediaStreamTrack = _MediaStreamTrack.default;
}
//# sourceMappingURL=index.js.map