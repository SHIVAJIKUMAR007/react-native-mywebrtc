"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class MediaStreamEvent {
  constructor(type, eventInitDict) {
    _defineProperty(this, "type", void 0);

    _defineProperty(this, "stream", void 0);

    this.type = type.toString();
    this.stream = eventInitDict.stream;
  }

}

exports.default = MediaStreamEvent;
//# sourceMappingURL=MediaStreamEvent.js.map