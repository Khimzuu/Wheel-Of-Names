const {app, BrowserWindow, Menu, shell} = require('electron');
const path = require('node:path');
const createWindow = () => {
  const win = new BrowserWindow({
    width: 1450, height: 920, minWidth: 830, minHeight: 580,
    backgroundColor: '#0f101a', autoHideMenuBar: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true }
  });
  win.loadFile(path.join(__dirname, '..', 'index.html'));
  win.webContents.setWindowOpenHandler(({url}) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return {action: 'deny'};
  });
};
app.whenReady().then(() => {Menu.setApplicationMenu(null);createWindow();app.on('activate', () => {if (BrowserWindow.getAllWindows().length === 0) createWindow();});});
app.on('window-all-closed', () => {if (process.platform !== 'darwin') app.quit();});
