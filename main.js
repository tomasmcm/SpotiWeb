'use strict';
const electron = require('electron');
const path = require('path');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const globalShortcut = electron.globalShortcut;
const ipcMain = electron.ipcMain;
const shell = electron.shell
const Menu = electron.Menu;
const updateUtil = require('./utils');
let options = {
  repo: 'tomasmcm/SpotiWeb',
  name: 'SpotiWeb',
  currentVersion: app.getVersion()
}
const updater = new updateUtil(options);
updater.check();
let checkForImageDownload = false;
let notificationTimeout = 2000;
if(process.platform === 'linux') notificationTimeout = 1000;

let flashPath = path.join(path.resolve(__dirname, '../'), '/app.asar.unpacked/plugins/');

process.argv.forEach(function (arg, index, array) {
  if (arg === 'dev') {
    flashPath = path.join(__dirname, '/plugins/');
  }
});

switch (process.platform) {
  case 'win32':
  case 'win64':
    app.commandLine.appendSwitch('ppapi-flash-path', path.join(flashPath, 'PepperFlashPlayer-win32.dll') );
    app.commandLine.appendSwitch('ppapi-flash-version', '21.0.0.216');
    break;
  case 'linux':
    app.commandLine.appendSwitch('ppapi-flash-path', path.join(flashPath, 'PepperFlashPlayer-linux.so') );
    app.commandLine.appendSwitch('ppapi-flash-version', '21.0.0.216');
    break;
  case 'darwin':
  default:
    app.commandLine.appendSwitch('ppapi-flash-path', path.join(flashPath, 'PepperFlashPlayer-mac.plugin') );
    app.commandLine.appendSwitch('ppapi-flash-version', '21.0.0.216');
}


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Quit when all windows are closed and no other one is listening to this.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', function() {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

app.on('activate', function() {
  mainWindow.show();
});
ipcMain.on('show', function() {
    mainWindow.show();
});


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 680,
    //frame: false,
    titleBarStyle: "hidden",
    fullscreenable: true,
    icon: __dirname + '/assets/icon.png',
    backgroundColor: '#121314',
    webPreferences: {
      nodeIntegration: false,
      plugins: true,
      preload: __dirname + '/preload.js',
      allowDisplayingInsecureContent: true,
      scrollBounce: false
    }
  });
  //mainWindow.maximize();

  // and load the SpotifyWebDesktop website.
  mainWindow.loadURL("https://play.spotify.com");

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();


  mainWindow.on('page-title-updated', function(){
    checkForImageDownload = true;
    setTimeout(function(){
      let title = mainWindow.webContents.getTitle();
      if(title.indexOf("▶") !== -1){
        title = title.substring(2);
      }else{
        return;
      }
      mainWindow.webContents.executeJavaScript("notify();");
      //console.log(script);
      checkForImageDownload = false;
    }, notificationTimeout);
  });


  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    mainWindow = null;
    app.quit();
  });

  mainWindow.webContents.on('crashed plugin-crashed unresponsive', () => {
    mainWindow.reload();
  });

  app.on('gpu-process-crashed', () => {
    mainWindow.reload();
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if(url.indexOf('file:/') > -1){
      event.preventDefault();
    }
  });

  var registeredNext = globalShortcut.register('MediaNextTrack', function () {
    console.log('medianexttrack pressed');
    simulateClick("next");
  });
  if (!registeredNext) {
    console.log('medianexttrack registration failed');
  } else {
    console.log('medianexttrack registration bound!');
  }

  var registeredPlay = globalShortcut.register('MediaPlayPause', function () {
    console.log('mediaplaypause pressed');
    simulateClick("play-pause");
  });
  if (!registeredPlay) {
    console.log('mediaplaypause registration failed');
  } else {
    console.log('mediaplaypause registration bound!');
  }

  var registeredPrevious = globalShortcut.register('MediaPreviousTrack', function () {
    console.log('mediaprevioustrack pressed');
    simulateClick("previous");
  });
  if (!registeredPrevious) {
    console.log('mediaprevioustrack registration failed');
  } else {
    console.log('mediaprevioustrack registration bound!');
  }


  var filter = {
    urls: ["https://pubads.g.doubleclick.net/*", "https://video-ad-stats.googlesyndication.com/*",
    "https://simage2.pubmatic.com/AdServer/*",
    "https://pagead2.googlesyndication.com/*",
    "https://securepubads.g.doubleclick.net/*",
    "https://googleads.g.doubleclick.net/*"]
  };
  var ses = mainWindow.webContents.session;
  ses.webRequest.onBeforeRequest(filter, function(details, callback) {
    //console.log(details.url);
    callback({cancel: true});
  });

  var imageFilter = {
    urls: ["http://o.scdn.co/300/*"]
  };

  ses.webRequest.onCompleted(imageFilter, function(details) {
    //console.log(details.url);
    if (checkForImageDownload) {
      mainWindow.webContents.executeJavaScript("setCurrentImage('" + details.url + "')");
      checkForImageDownload = false;
    }
  });


});

//helper function to simulate button clicks on mainWindow
function simulateClick(command) {
    mainWindow.webContents.executeJavaScript("playerKey('" + command + "')");
}


app.once('ready', function () {
  if (Menu.getApplicationMenu()) return

  var template = [
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: function (item, focusedWindow) {
            if (focusedWindow) focusedWindow.reload()
          }
        },
        {
          label: 'Toggle Full Screen',
          accelerator: (function () {
            return (process.platform === 'darwin') ? 'Ctrl+Command+F' : 'F11'
          })(),
          click: function (item, focusedWindow) {
            if (focusedWindow) focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
          }
        }
      ]
    },
    {
      label: 'Player',
      submenu: [
        {
          label: 'Play / Pause',
          accelerator: 'MediaPlayPause',
          click: function () {
            simulateClick("play-pause");
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Next',
          accelerator: 'MediaNextTrack',
          click: function () {
            simulateClick("next");
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Previous',
          accelerator: 'MediaPreviousTrack',
          click: function () {
            simulateClick("previous");
          }
        }
      ]
    },
    {
      label: 'Window',
      role: 'window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }
      ]
    },
    {
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: function () {
            shell.openExternal('https://github.com/tomasmcm/SpotiWeb')
          }
        },
        {
          label: 'Search Issues',
          click: function () {
            shell.openExternal('https://github.com/tomasmcm/SpotiWeb/issues')
          }
        }
      ]
    }
  ]

  if (process.platform === 'darwin') {
    template.unshift({
      label: 'SpotiWeb',
      submenu: [
        {
          label: 'About SpotiWeb',
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: 'Services',
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          label: 'Hide SpotiWeb',
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Alt+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: function () { app.quit() }
        }
      ]
    })
    template[3].submenu.push(
      {
        type: 'separator'
      },
      {
        label: 'Bring All to Front',
        role: 'front'
      }
    )
  }

  var menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
})
