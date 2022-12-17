import { exec, fork, spawn, spawnSync } from 'child_process';
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import path from 'path';
import process, { electron } from 'process';
import { dlog, isDebug } from 'utils/dev';

export type Channels = 'ipc-example' | 'ipc-example1' | 'output';

const getScriptPath = (file_name: string) => {
  if (isDebug()) return `assets/scripts/${file_name}`;
  else {
    return path.join(process.resourcesPath, `assets/scripts/${file_name}`);
  }
};

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
        });
      }
    },
    output(args: any[], func: (...args: unknown[]) => void) {
      dlog(args)
    
      const scriptPath = getScriptPath('output.py')
      exec(`python3 ${scriptPath} ${args[0]} ${args[1]}`, (err: any, stdout: any, stderr: any) => {
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
    input(args: any[], func: (data: string) => void) {
      const scriptPath = getScriptPath('input.py')
      const child = spawn('python3', [scriptPath, args[0], args[1], args[2], args[3], args[4]])
      dlog(child)
      child.stdout.on('data', (data: any) => {
          console.log('stdout: ' + data);
          func(String(data))
      });
      child.stderr.on('data', (data: any) => {
          console.log('Error: ' + data);
      });
    }
  },
});
