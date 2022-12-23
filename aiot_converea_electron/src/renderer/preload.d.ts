import { Channels } from 'main/preload';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage(channel: Channels, args: unknown[]): void;
        on(
          channel: Channels,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: Channels, func: (...args: unknown[]) => void): void;
        output(args: any[], func: (data: string) => void): void;
        input(args: any[], func: (data: string) => void): void;
        state(args: any[], func: (data: string) => void): void;
        kill(): void;
      };
    };
  }
}

export {};
