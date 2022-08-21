"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _eventTargetShim = require("event-target-shim");

var _reactNative = require("react-native");

var _MediaStream = _interopRequireDefault(require("./MediaStream"));

var _MediaStreamEvent = _interopRequireDefault(require("./MediaStreamEvent"));

var _MediaStreamTrackEvent = _interopRequireDefault(require("./MediaStreamTrackEvent"));

var _RTCDataChannel = _interopRequireDefault(require("./RTCDataChannel"));

var _RTCDataChannelEvent = _interopRequireDefault(require("./RTCDataChannelEvent"));

var _RTCSessionDescription = _interopRequireDefault(require("./RTCSessionDescription"));

var _RTCIceCandidate = _interopRequireDefault(require("./RTCIceCandidate"));

var _RTCIceCandidateEvent = _interopRequireDefault(require("./RTCIceCandidateEvent"));

var _RTCEvent = _interopRequireDefault(require("./RTCEvent"));

var RTCUtil = _interopRequireWildcard(require("./RTCUtil"));

var _EventEmitter = _interopRequireDefault(require("./EventEmitter"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const {
  WebRTCModule
} = _reactNative.NativeModules;
const PEER_CONNECTION_EVENTS = ['connectionstatechange', 'icecandidate', 'icecandidateerror', 'iceconnectionstatechange', 'icegatheringstatechange', 'negotiationneeded', 'signalingstatechange', 'datachannel', 'addstream', 'removestream'];
let nextPeerConnectionId = 0;

class RTCPeerConnection extends (0, _eventTargetShim.defineCustomEventTarget)(...PEER_CONNECTION_EVENTS) {
  constructor(configuration) {
    super();

    _defineProperty(this, "localDescription", null);

    _defineProperty(this, "remoteDescription", null);

    _defineProperty(this, "signalingState", 'stable');

    _defineProperty(this, "iceGatheringState", 'new');

    _defineProperty(this, "connectionState", 'new');

    _defineProperty(this, "iceConnectionState", 'new');

    _defineProperty(this, "_peerConnectionId", void 0);

    _defineProperty(this, "_localStreams", []);

    _defineProperty(this, "_remoteStreams", []);

    _defineProperty(this, "_subscriptions", []);

    this._peerConnectionId = nextPeerConnectionId++;
    WebRTCModule.peerConnectionInit(configuration, this._peerConnectionId);

    this._registerEvents();
  }

  addStream(stream) {
    const index = this._localStreams.indexOf(stream);

    if (index !== -1) {
      return;
    }

    WebRTCModule.peerConnectionAddStream(stream._reactTag, this._peerConnectionId);

    this._localStreams.push(stream);
  }

  removeStream(stream) {
    const index = this._localStreams.indexOf(stream);

    if (index === -1) {
      return;
    }

    this._localStreams.splice(index, 1);

    WebRTCModule.peerConnectionRemoveStream(stream._reactTag, this._peerConnectionId);
  }

  createOffer(options) {
    return new Promise((resolve, reject) => {
      WebRTCModule.peerConnectionCreateOffer(this._peerConnectionId, RTCUtil.normalizeOfferAnswerOptions(options), (successful, data) => {
        if (successful) {
          resolve(data);
        } else {
          reject(data); // TODO: convert to NavigatorUserMediaError
        }
      });
    });
  }

  createAnswer() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return new Promise((resolve, reject) => {
      WebRTCModule.peerConnectionCreateAnswer(this._peerConnectionId, RTCUtil.normalizeOfferAnswerOptions(options), (successful, data) => {
        if (successful) {
          resolve(data);
        } else {
          reject(data);
        }
      });
    });
  }

  setConfiguration(configuration) {
    WebRTCModule.peerConnectionSetConfiguration(configuration, this._peerConnectionId);
  }

  async setLocalDescription(sessionDescription) {
    const desc = sessionDescription ? sessionDescription.toJSON ? sessionDescription.toJSON() : sessionDescription : null;
    const newSdp = await WebRTCModule.peerConnectionSetLocalDescription(this._peerConnectionId, desc);
    this.localDescription = new _RTCSessionDescription.default(newSdp);
  }

  setRemoteDescription(sessionDescription) {
    return new Promise((resolve, reject) => {
      WebRTCModule.peerConnectionSetRemoteDescription(sessionDescription.toJSON ? sessionDescription.toJSON() : sessionDescription, this._peerConnectionId, (successful, data) => {
        if (successful) {
          this.remoteDescription = new _RTCSessionDescription.default(data);
          resolve();
        } else {
          reject(data);
        }
      });
    });
  }

  async addIceCandidate(candidate) {
    if (!candidate || !candidate.candidate) {
      // XXX end-of cantidates is not implemented: https://bugs.chromium.org/p/webrtc/issues/detail?id=9218
      return;
    }

    const newSdp = await WebRTCModule.peerConnectionAddICECandidate(this._peerConnectionId, candidate.toJSON ? candidate.toJSON() : candidate);
    this.remoteDescription = new _RTCSessionDescription.default(newSdp);
  }

  getStats() {
    return WebRTCModule.peerConnectionGetStats(this._peerConnectionId).then(data => {
      /* On both Android and iOS it is faster to construct a single
      JSON string representing the Map of StatsReports and have it
      pass through the React Native bridge rather than the Map of
      StatsReports. While the implementations do try to be faster in
      general, the stress is on being faster to pass through the React
      Native bridge which is a bottleneck that tends to be visible in
      the UI when there is congestion involving UI-related passing.
       TODO Implement the logic for filtering the stats based on 
      the sender/receiver
      */
      return new Map(JSON.parse(data));
    });
  }

  getLocalStreams() {
    return this._localStreams.slice();
  }

  getRemoteStreams() {
    return this._remoteStreams.slice();
  }

  close() {
    WebRTCModule.peerConnectionClose(this._peerConnectionId);
  }

  restartIce() {
    WebRTCModule.peerConnectionRestartIce(this._peerConnectionId);
  }

  _unregisterEvents() {
    this._subscriptions.forEach(e => e.remove());

    this._subscriptions = [];
  }

  _registerEvents() {
    this._subscriptions = [_EventEmitter.default.addListener('peerConnectionOnRenegotiationNeeded', ev => {
      if (ev.id !== this._peerConnectionId) {
        return;
      } // @ts-ignore


      this.dispatchEvent(new _RTCEvent.default('negotiationneeded'));
    }), _EventEmitter.default.addListener('peerConnectionIceConnectionChanged', ev => {
      if (ev.id !== this._peerConnectionId) {
        return;
      }

      this.iceConnectionState = ev.iceConnectionState; // @ts-ignore

      this.dispatchEvent(new _RTCEvent.default('iceconnectionstatechange'));

      if (ev.iceConnectionState === 'closed') {
        // This PeerConnection is done, clean up event handlers.
        this._unregisterEvents();
      }
    }), _EventEmitter.default.addListener('peerConnectionStateChanged', ev => {
      if (ev.id !== this._peerConnectionId) {
        return;
      }

      this.connectionState = ev.connectionState; // @ts-ignore

      this.dispatchEvent(new _RTCEvent.default('connectionstatechange'));

      if (ev.connectionState === 'closed') {
        // This PeerConnection is done, clean up event handlers.
        this._unregisterEvents();
      }
    }), _EventEmitter.default.addListener('peerConnectionSignalingStateChanged', ev => {
      if (ev.id !== this._peerConnectionId) {
        return;
      }

      this.signalingState = ev.signalingState; // @ts-ignore

      this.dispatchEvent(new _RTCEvent.default('signalingstatechange'));
    }), _EventEmitter.default.addListener('peerConnectionAddedStream', ev => {
      if (ev.id !== this._peerConnectionId) {
        return;
      }

      const stream = new _MediaStream.default(ev);

      this._remoteStreams.push(stream);

      this.remoteDescription = new _RTCSessionDescription.default(ev.sdp); // @ts-ignore

      this.dispatchEvent(new _MediaStreamEvent.default('addstream', {
        stream
      }));
    }), _EventEmitter.default.addListener('peerConnectionRemovedStream', ev => {
      if (ev.id !== this._peerConnectionId) {
        return;
      }

      const stream = this._remoteStreams.find(s => s._reactTag === ev.streamId);

      if (stream) {
        const index = this._remoteStreams.indexOf(stream);

        if (index !== -1) {
          this._remoteStreams.splice(index, 1);
        }
      }

      this.remoteDescription = new _RTCSessionDescription.default(ev.sdp); // @ts-ignore

      this.dispatchEvent(new _MediaStreamEvent.default('removestream', {
        stream
      }));
    }), _EventEmitter.default.addListener('mediaStreamTrackMuteChanged', ev => {
      if (ev.peerConnectionId !== this._peerConnectionId) {
        return;
      }

      let track;

      for (const stream of this._remoteStreams) {
        const t = stream._tracks.find(track => track.id === ev.trackId);

        if (t) {
          track = t;
          break;
        }
      }

      if (track) {
        track._muted = ev.muted;
        const eventName = ev.muted ? 'mute' : 'unmute';
        track.dispatchEvent(new _MediaStreamTrackEvent.default(eventName, {
          track
        }));
      }
    }), _EventEmitter.default.addListener('peerConnectionGotICECandidate', ev => {
      if (ev.id !== this._peerConnectionId) {
        return;
      }

      this.localDescription = new _RTCSessionDescription.default(ev.sdp);
      const candidate = new _RTCIceCandidate.default(ev.candidate); // @ts-ignore

      this.dispatchEvent(new _RTCIceCandidateEvent.default('icecandidate', {
        candidate
      }));
    }), _EventEmitter.default.addListener('peerConnectionIceGatheringChanged', ev => {
      if (ev.id !== this._peerConnectionId) {
        return;
      }

      this.iceGatheringState = ev.iceGatheringState;

      if (this.iceGatheringState === 'complete') {
        this.localDescription = new _RTCSessionDescription.default(ev.sdp); // @ts-ignore

        this.dispatchEvent(new _RTCIceCandidateEvent.default('icecandidate', {
          candidate: null
        }));
      } // @ts-ignore


      this.dispatchEvent(new _RTCEvent.default('icegatheringstatechange'));
    }), _EventEmitter.default.addListener('peerConnectionDidOpenDataChannel', ev => {
      if (ev.id !== this._peerConnectionId) {
        return;
      }

      const channel = new _RTCDataChannel.default(ev.dataChannel); // @ts-ignore

      this.dispatchEvent(new _RTCDataChannelEvent.default('datachannel', {
        channel
      }));
    })];
  }
  /**
   * Creates a new RTCDataChannel object with the given label. The
   * RTCDataChannelInit dictionary can be used to configure properties of the
   * underlying channel such as data reliability.
   *
   * @param {string} label - the value with which the label attribute of the new
   * instance is to be initialized
   * @param {RTCDataChannelInit} dataChannelDict - an optional dictionary of
   * values with which to initialize corresponding attributes of the new
   * instance such as id
   */


  createDataChannel(label, dataChannelDict) {
    if (dataChannelDict && 'id' in dataChannelDict) {
      const id = dataChannelDict.id;

      if (typeof id !== 'number') {
        throw new TypeError('DataChannel id must be a number: ' + id);
      }
    }

    const channelInfo = WebRTCModule.createDataChannel(this._peerConnectionId, label, dataChannelDict);

    if (channelInfo === null) {
      throw new TypeError('Failed to create new DataChannel');
    }

    return new _RTCDataChannel.default(channelInfo);
  }

}

exports.default = RTCPeerConnection;
//# sourceMappingURL=RTCPeerConnection.js.map