import { ChildProcessWithoutNullStreams, exec, spawn } from 'child_process';
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import path from 'path';
import process, { electron, kill } from 'process';
import { dlog, isDebug } from 'utils/dev';

export type Channels = 'ipc-example' | 'ipc-example1' | 'output';
let input_process: ChildProcessWithoutNullStreams |  null = null

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
    output(args: any[], func: (data: string) => void) {
      const scriptPath = getScriptPath('output.py');
      exec(
        `python3 ${scriptPath} ${args[0]} ${args[1]}`,
        (err: any, stdout: any, stderr: any) => {
          console.log(err, stdout, stderr);
          func(stdout);
        }
      );

      // const scriptPath = getScriptPath('output.py')
      // const child = spawn('python3', [scriptPath, args[0], args[1]])
      // dlog(child, args)
      // child.stdout.on('data', (data: any) => {
      //     console.log('stdout: ' + data);
      //     // func(String(data))
      // });
      // child.stderr.on('data', (data: any) => {
      //     console.log('Error: ' + data);
      // });
    },
    input(args: any[], func: (data: string) => void) {
      const scriptPath = getScriptPath('input_db.py');
      input_process = spawn('python3', [
        scriptPath,
        args[0],
        args[1],
        args[2],
        args[3],
        args[4],
      ]);
      input_process.stdout.on('data', (data: any) => {
        console.log('stdout: ' + data);
        func(String(data));
      });
      input_process.stderr.on('data', (data: any) => {
        console.log('Error: ' + data);
      });
    },
    state(args: any[], func: (data: string) => void) {
      const scriptPath = getScriptPath('state.py');
      dlog(args[0], args[1]);
      exec(
        `python3 ${scriptPath} ${args[0]} ${args[1]}`,
        (err: any, stdout: any, stderr: any) => {
          console.log(err, stdout, stderr);
          func(stdout);
        }
      );
    },
    kill() {
      if (input_process != null) {
        input_process.kill()
      }
    }
  },
});
