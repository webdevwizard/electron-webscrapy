// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron');
const fetchScrappingData = require('./helper/scraper');
const writeCSV = require('./helper/writecsv');
const path = require('path');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('asynchronous-message', async (event, arg) => {
  const { url, id: start_id, count } = arg;
  const processId = 'test';

  const result = await fetchScrappingData(url, start_id, count, processId);

  const valid_count = result.reduce((prev, item) => {
    if (item.status == 'success') {
      writeCSV(item.data);
      return prev + 1;
    }
    return prev;
  }, 0);

  const tot_count = result.length;
  event.reply('asynchronous-reply', { count: valid_count, tot_count, result });
});
