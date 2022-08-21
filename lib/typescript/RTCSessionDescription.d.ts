export default class RTCSessionDescription {
    _sdp: string;
    _type: string | null;
    constructor(info?: {
        type: null;
        sdp: string;
    });
    get sdp(): string;
    get type(): string | null;
    toJSON(): {
        sdp: string;
        type: string | null;
    };
}
