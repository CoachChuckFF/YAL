import { Buffer } from 'buffer';
(window as any).global = window;
global.Buffer = global.Buffer || Buffer;
(window as any).process = {
  version: '',
};