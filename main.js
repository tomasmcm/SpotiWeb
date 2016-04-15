'use strict';
const electron = require('electron');
const path = require('path');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const globalShortcut = electron.globalShortcut;
const ipcMain = electron.ipcMain;


switch (process.platform) {
  case 'win32':
  case 'win64':
    app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, '/plugins/pepflashplayer.dll') );
    app.commandLine.appendSwitch('ppapi-flash-version', '21.0.0.216');
    break;
  case 'linux':
    app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, '/plugins/libpepflashplayer.so') );
    app.commandLine.appendSwitch('ppapi-flash-version', '21.0.0.216');
    break;
  case 'darwin':
  default:
    app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, '/plugins/PepperFlashPlayer.plugin') );
    app.commandLine.appendSwitch('ppapi-flash-version', '21.0.0.216');
}


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Quit when all windows are closed.
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
    frame: false,
    nodeIntegration: false,
    webSecurity: false,
    allowDisplayingInsecureContent: true,
    allowRunningInsecureContent: true,
    icon: __dirname + '/assets/icon.png',
    preload: __dirname+'/preload.js',
    'web-preferences': {
      'plugins': true
    }
  });
  //mainWindow.maximize();

  // and load the SpotifyWebDesktop website.
  mainWindow.loadURL("https://play.spotify.com");

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();


  mainWindow.on('page-title-updated', function(){
    let title = mainWindow.webContents.getTitle();
    if(title.indexOf("▶") !== -1){
      title = title.substring(2);
    }else{
      return;
    }
    let music = title.substring(0, title.indexOf("-")-1);
    let author = title.substring(title.indexOf("-")+1, title.length-10);
    let script = "notify('"+music+"', '"+author+"');";
    mainWindow.webContents.executeJavaScript(script);
    //console.log(script);
  })


  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    mainWindow = null;
    app.quit();
  });

  globalShortcut.register('CmdOrCtrl+H', function () {
    mainWindow.hide();
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

});

//helper function to simulate button clicks on mainWindow
function simulateClick(command) {
    mainWindow.webContents.executeJavaScript("playerKey('" + command + "')");
}
