const { app, BrowserWindow, Menu, ipcMain, Tray } = require('electron');
const log = require('electron-log');
const path = require('path');
const Store = require('./Store');

// Set env
process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV !== 'production',
  isMac = process.platform === 'darwin';

let mainWindow, tray;

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
    show: false,
    opacity: 0.9,
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

  mainWindow.on('close', e => {
    if (!app.isQuitting) {
      e.preventDefault(), mainWindow.hide();
    }
    return true;
  });

  // Tray icon
  const icon = path.join(__dirname, 'assets/icons/tray_icon.png');
  tray = new Tray(icon);
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
  tray.on('right-click', () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Quit',
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);
    tray.popUpContextMenu(contextMenu);
  });

  mainWindow.on('ready', () => (mainWindow = null));
});

const menu = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  {
    role: 'fileMenu'
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Navigation',
        click: () => mainWindow.webContents.send('nav:toggle')
      }
    ]
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
