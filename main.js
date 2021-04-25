const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const log = require('electron-log');
const Store = require('./Store');

// Set env
process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV !== 'production',
  isMac = process.platform === 'darwin';

let mainWindow;

// Initialize store & defaults
const store = new Store({
  configName: 'user-settings',
  defaults: {
    settings: {
      cpuOverload: 80,
      alertFrequency: 5
    }
  }
});

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'SysTop',
    width: isDev ? 800 : 355,
    height: 600,
    icon: `${__dirname}/assets/icons/icon.png`,
    resizable: isDev ? true : false,
    backgroundColor: 'white',
    webPreferences: {
      nodeIntegration: true
    }
  });

  isDev && mainWindow.webContents.openDevTools();

  mainWindow.loadFile('./app/index.html');
}

app.on('ready', () => {
  createMainWindow();

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.send('settings:get', store.get('settings'));
  });

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);
});

const menu = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  {
    role: 'fileMenu'
  },
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' }
          ]
        }
      ]
    : [])
];

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// Set settings
ipcMain.on('settings:set', (e, settings) => {
  store.set('settings', settings);
  mainWindow.webContents.send('settings:get', store.get('settings'));
});

app.allowRendererProcessReuse = true;
