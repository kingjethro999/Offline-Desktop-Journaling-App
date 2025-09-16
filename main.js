// import { app, BrowserWindow, ipcMain } from 'electron';
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Store from 'electron-store';
import isOnline from 'is-online';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize store for app settings
const store = new Store();

// Initialize the data directory for journal entries
const dataDir = path.join(app.getPath('userData'), 'journal-entries');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

// Check network status and send to renderer
async function checkNetworkStatus() {
  try {
    const online = await isOnline();
    if (mainWindow) {
      mainWindow.webContents.send('network-status', online);
    }
    return online;
  } catch (err) {
    console.error('Error checking network status:', err);
    return false;
  }
}

// App lifecycle events
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', function() {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  
  // Set up periodic network status checks
  checkNetworkStatus();
  const networkCheckInterval = setInterval(checkNetworkStatus, 5000); // Check every 5 seconds
  
  app.on('will-quit', () => {
    clearInterval(networkCheckInterval);
  });
});

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit();
});

// Handle file operations
ipcMain.handle('get-entry-dates', () => {
  try {
    const files = fs.readdirSync(dataDir);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''))
      .sort((a, b) => new Date(b) - new Date(a));
  } catch (err) {
    console.error('Error getting entry dates:', err);
    return [];
  }
});

ipcMain.handle('read-entry', (event, date) => {
  try {
    const filePath = path.join(dataDir, `${date}.json`);
    if (!fs.existsSync(filePath)) {
      return { date: date, content: '' };
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading entry:', err);
    return { date: date, content: '' };
  }
});

ipcMain.handle('save-entry', (event, { date, content }) => {
  try {
    const filePath = path.join(dataDir, `${date}.json`);
    fs.writeFileSync(filePath, JSON.stringify({ date, content }), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving entry:', err);
    return false;
  }
});

ipcMain.handle('check-network-status', async () => {
  return await checkNetworkStatus();
});

