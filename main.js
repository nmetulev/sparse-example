const { app, BrowserWindow } = require('electron')
const path = require('path');

// temp workaround for Sparse packaging issues
// do not use in production
app.commandLine.appendSwitch('--no-sandbox');

// Handle deep links
let PROTOCOL = 'sparse-example';

if (process.defaultApp) {
    PROTOCOL += '-dev';
  app.setAsDefaultProtocolClient(
    PROTOCOL,
    process.execPath,
    [path.resolve(process.argv[1])]
  );
} else {
  // in an installed .exe this is enough
  app.setAsDefaultProtocolClient(PROTOCOL);
}

let mainWindow = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, 'preload.js')
  }
  })

  mainWindow.loadFile('index.html')

  if (process.defaultApp) mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
  createWindow()

  const url = process.argv.find(a => a.startsWith(`${PROTOCOL}://`));
  if (url) handleDeepLink(url);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
});

// Ensure single instance mode
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  process.exit(0);
}

app.on('second-instance', (_e, argv) => {
  // argv contains *all* cmd-line args; the deep-link is one of them
  const url = argv.find(a => a.startsWith(`${PROTOCOL}://`));
  if (url) handleDeepLink(url);
  if (mainWindow?.isMinimized()) mainWindow.restore();
  mainWindow?.focus();
});

function handleDeepLink(url) {
  // Handle the deep link URL
  console.log(`Handling deep link: ${url}`);
  
  // You can parse the URL and perform actions based on its content
  const parsedUrl = new URL(url);
  const queryParams = new URLSearchParams(parsedUrl.search);
  
  // Example: Log query parameters
  for (const [key, value] of queryParams.entries()) {
    console.log(`Query param: ${key} = ${value}`);
  }
  
  // You can also send this data to your renderer process if needed
  mainWindow.webContents.send('deep-link', url);
}