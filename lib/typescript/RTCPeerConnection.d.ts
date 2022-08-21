import { defineCustomEventTarget } from 'event-target-shim';
import MediaStream from './MediaStream';
import RTCDataChannel from './RTCDataChannel';
import RTCSessionDescription from './RTCSessionDescription';
declare type RTCSignalingState = 'stable' | 'have-local-offer' | 'have-remote-offer' | 'have-local-pranswer' | 'have-remote-pranswer' | 'closed';
declare type RTCIceGatheringState = 'new' | 'gathering' | 'complete';
declare type RTCPeerConnectionState = 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed';
declare type RTCIceConnectionState = 'new' | 'checking' | 'connected' | 'completed' | 'failed' | 'disconnected' | 'closed';
declare type RTCDataChannelInit = {
    ordered?: boolean;
    maxPacketLifeTime?: number;
    maxRetransmits?: number;
    protocol?: string;
    negotiated?: boolean;
    id?: number;
};
declare const RTCPeerConnection_base: defineCustomEventTarget.CustomEventTargetConstructor<Record<string, import("event-target-shim").Event<string>>, "standard">;
export default class RTCPeerConnection extends RTCPeerConnection_base {
    localDescription: RTCSessionDescription | null;
    remoteDescription: RTCSessionDescription | null;
    signalingState: RTCSignalingState;
    iceGatheringState: RTCIceGatheringState;
    connectionState: RTCPeerConnectionState;
    iceConnectionState: RTCIceConnectionState;
    _peerConnectionId: number;
    _localStreams: Array<MediaStream>;
    _remoteStreams: Array<MediaStream>;
    _subscriptions: Array<any>;
    constructor(configuration: any);
    addStream(stream: MediaStream): void;
    removeStream(stream: MediaStream): void;
    createOffer(options: any): Promise<unknown>;
    createAnswer(options?: {}): Promise<unknown>;
    setConfiguration(configuration: any): void;
    setLocalDescription(sessionDescription?: RTCSessionDescription): Promise<void>;
    setRemoteDescription(sessionDescription: RTCSessionDescription): Promise<void>;
    addIceCandidate(candidate: any): Promise<void>;
    getStats(): any;
    getLocalStreams(): MediaStream[];
    getRemoteStreams(): MediaStream[];
    close(): void;
    restartIce(): void;
    _unregisterEvents(): void;
    _registerEvents(): void;
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
    createDataChannel(label: string, dataChannelDict?: RTCDataChannelInit): RTCDataChannel;
}
export {};
