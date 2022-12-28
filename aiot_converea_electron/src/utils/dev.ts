const CONFIG_KEY = 'ELECTRON_CONFIG';
import pin_config from '../../assets/pin.json';

export const dlog = (...args: any) => {
  console.log('%cELECTRON', 'background: #222; color: #bada55', ...args);
};

export const putConfig = (json: any) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(json));
};

export const getConfig = () => {
  return localStorage.getItem(CONFIG_KEY);
};

export const isDebug = () => {
  return process.env.NODE_ENV === 'development';
};

export const getPinInformation = () => {
  const info = JSON.parse(window.electron.ipcRenderer.loadPin());
  if (info['result'] == true) return info["data"];
  else {
    const config = JSON.parse(getConfig() as string);
    if (config != null) return config;
    else return pin_config;
  }
};
