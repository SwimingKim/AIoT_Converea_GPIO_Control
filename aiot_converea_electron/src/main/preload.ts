import { exec } from 'child_process';
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example' | 'ipc-example1';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));

      console.log('Here!!', channel);
      exec('python3 assets/test.py', (err: any, stdout: any, stderr: any) => {
        const vv = stdout;
        console.log(err, vv, stderr);
        func(vv);
        // ipcRenderer.emit(channel, vv)

        // ipcRenderer.emit(channel, vv)
        // ipcRenderer.invoke(channel, vv)
        // ipcRenderer.once(channel, (_event, ...args) => func(vv))
        //   ipcRenderer.send(channel, vv);
      });
    },
  },
});
