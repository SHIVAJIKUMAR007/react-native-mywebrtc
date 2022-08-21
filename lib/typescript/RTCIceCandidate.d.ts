export default class RTCIceCandidate {
    candidate: string;
    sdpMLineIndex: number;
    sdpMid: string;
    constructor(info: any);
    toJSON(): {
        candidate: string;
        sdpMLineIndex: number;
        sdpMid: string;
    };
}
