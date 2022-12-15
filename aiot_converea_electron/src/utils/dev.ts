const CONFIG_KEY = 'ELECTRON_CONFIG';

export const dlog = (...args: any) => {
  console.log('%cELECTRON', 'background: #222; color: #bada55', ...args);
};

export const putConfig = (json: any) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(json));
};

export const getConfig = () => {
  return localStorage.getItem(CONFIG_KEY);
};
