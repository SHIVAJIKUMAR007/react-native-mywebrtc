import { NativeModules, NativeEventEmitter } from 'react-native';
const {
  WebRTCModule
} = NativeModules;
const EventEmitter = new NativeEventEmitter(WebRTCModule);
export default EventEmitter;
//# sourceMappingURL=EventEmitter.js.map