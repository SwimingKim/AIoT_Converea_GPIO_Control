import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, redirect, HashRouter } from 'react-router-dom';
import ChartExample from './ChartExample';
import GPIO from './GPIO';
import Settings from './Settings';
// import 'semantic-ui-css/semantic.min.css'


const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
  <HashRouter>
    <Routes>
      <Route path='/' element={<GPIO/>}/>
      <Route path='/settings' element={<Settings/>}/>
    </Routes>
  </HashRouter>
);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
