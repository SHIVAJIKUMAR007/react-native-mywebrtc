function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { NativeModules } from 'react-native';
import * as base64 from 'base64-js';
import { defineCustomEventTarget } from 'event-target-shim';
import MessageEvent from './MessageEvent';
import RTCDataChannelEvent from './RTCDataChannelEvent';
import EventEmitter from './EventEmitter';
const {
  WebRTCModule
} = NativeModules;
const DATA_CHANNEL_EVENTS = ['open', 'message', 'bufferedamountlow', 'closing', 'close', 'error'];
export default class RTCDataChannel extends defineCustomEventTarget(...DATA_CHANNEL_EVENTS) {
  // we only support 'arraybuffer'
  constructor(info) {
    super();

    _defineProperty(this, "_peerConnectionId", void 0);

    _defineProperty(this, "_reactTag", void 0);

    _defineProperty(this, "_id", void 0);

    _defineProperty(this, "_label", void 0);

    _defineProperty(this, "_maxPacketLifeTime", void 0);

    _defineProperty(this, "_maxRetransmits", void 0);

    _defineProperty(this, "_negotiated", void 0);

    _defineProperty(this, "_ordered", void 0);

    _defineProperty(this, "_protocol", void 0);

    _defineProperty(this, "_readyState", void 0);

    _defineProperty(this, "_subscriptions", []);

    _defineProperty(this, "binaryType", 'arraybuffer');

    _defineProperty(this, "bufferedAmount", 0);

    _defineProperty(this, "bufferedAmountLowThreshold", 0);

    this._peerConnectionId = info.peerConnectionId;
    this._reactTag = info.reactTag;
    this._label = info.label;
    this._id = info.id === -1 ? null : info.id; // null until negotiated.

    this._ordered = Boolean(info.ordered);
    this._maxPacketLifeTime = info.maxPacketLifeTime;
    this._maxRetransmits = info.maxRetransmits;
    this._protocol = info.protocol || '';
    this._negotiated = Boolean(info.negotiated);
    this._readyState = info.readyState;

    this._registerEvents();
  }

  get label() {
    return this._label;
  }

  get id() {
    return this._id;
  }

  get ordered() {
    return this._ordered;
  }

  get maxPacketLifeTime() {
    return this._maxPacketLifeTime;
  }

  get maxRetransmits() {
    return this._maxRetransmits;
  }

  get protocol() {
    return this._protocol;
  }

  get negotiated() {
    return this._negotiated;
  }

  get readyState() {
    return this._readyState;
  }

  send(data) {
    if (typeof data === 'string') {
      WebRTCModule.dataChannelSend(this._peerConnectionId, this._reactTag, data, 'text');
      return;
    } // Safely convert the buffer object to an Uint8Array for base64-encoding


    if (ArrayBuffer.isView(data)) {
      data = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    } else if (data instanceof ArrayBuffer) {
      data = new Uint8Array(data);
    } else {
      throw new TypeError('Data must be either string, ArrayBuffer, or ArrayBufferView');
    }

    WebRTCModule.dataChannelSend(this._peerConnectionId, this._reactTag, base64.fromByteArray(data), 'binary');
  }

  close() {
    if (this._readyState === 'closing' || this._readyState === 'closed') {
      return;
    }

    WebRTCModule.dataChannelClose(this._peerConnectionId, this._reactTag);
  }

  _unregisterEvents() {
    this._subscriptions.forEach(e => e.remove());

    this._subscriptions = [];
  }

  _registerEvents() {
    this._subscriptions = [EventEmitter.addListener('dataChannelStateChanged', ev => {
      if (ev.reactTag !== this._reactTag) {
        return;
      }

      this._readyState = ev.state;

      if (this._id === null && ev.id !== -1) {
        this._id = ev.id;
      }

      if (this._readyState === 'open') {
        // @ts-ignore
        this.dispatchEvent(new RTCDataChannelEvent('open', {
          channel: this
        }));
      } else if (this._readyState === 'closing') {
        // @ts-ignore
        this.dispatchEvent(new RTCDataChannelEvent('closing', {
          channel: this
        }));
      } else if (this._readyState === 'closed') {
        // @ts-ignore
        this.dispatchEvent(new RTCDataChannelEvent('close', {
          channel: this
        }));

        this._unregisterEvents();

        WebRTCModule.dataChannelDispose(this._peerConnectionId, this._reactTag);
      }
    }), EventEmitter.addListener('dataChannelReceiveMessage', ev => {
      if (ev.reactTag !== this._reactTag) {
        return;
      }

      let data = ev.data;

      if (ev.type === 'binary') {
        data = base64.toByteArray(ev.data).buffer;
      } // @ts-ignore


      this.dispatchEvent(new MessageEvent('message', {
        data
      }));
    })];
  }

}
//# sourceMappingURL=RTCDataChannel.js.map