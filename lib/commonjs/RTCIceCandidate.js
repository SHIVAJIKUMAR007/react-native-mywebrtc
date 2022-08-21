"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class RTCIceCandidate {
  constructor(info) {
    _defineProperty(this, "candidate", void 0);

    _defineProperty(this, "sdpMLineIndex", void 0);

    _defineProperty(this, "sdpMid", void 0);

    this.candidate = info.candidate;
    this.sdpMLineIndex = info.sdpMLineIndex;
    this.sdpMid = info.sdpMid;
  }

  toJSON() {
    return {
      candidate: this.candidate,
      sdpMLineIndex: this.sdpMLineIndex,
      sdpMid: this.sdpMid
    };
  }

}

exports.default = RTCIceCandidate;
//# sourceMappingURL=RTCIceCandidate.js.map