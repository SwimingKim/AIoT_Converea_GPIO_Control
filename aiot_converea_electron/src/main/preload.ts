import { exec } from 'child_process';
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { dlog } from 'utils/dev';

export type Channels = 'ipc-example' | 'ipc-example1' | 'output';

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

      if (channel == 'ipc-example1') {
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
      }
    },
    output(args: any[], func: (...args: unknown[]) => void) {
      dlog(args)
    
      exec(`python3 assets/scripts/output.py ${args[0]} ${args[1]}`, (err: any, stdout: any, stderr: any) => {
          const vv = stdout;
          console.log(err, vv, stderr);
          func(vv);
          // ipcRenderer.emit(channel, vv)
  
          // ipcRenderer.emit(channel, vv)
          // ipcRenderer.invoke(channel, vv)
          // ipcRenderer.once(channel, (_event, ...args) => func(vv))
          //   ipcRenderer.send(channel, vv);
        });
    }
  },
});
