interface Constraints {
    audio?: boolean | object;
    video?: boolean | object;
}
export default function getUserMedia(constraints?: Constraints): Promise<unknown>;
export {};
