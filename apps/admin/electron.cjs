const { app, BrowserWindow, Tray, Menu, nativeImage, Notification, shell, nativeTheme } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;
let tray;
let isQuitting = false;

// Prevent multiple instances
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'JETIS Operasyon Merkezi',
    icon: path.join(__dirname, 'build', 'icon.png'),
    backgroundColor: '#0B1220',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    // Frameless with custom title bar feel
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0B1220',
      symbolColor: '#FF7A00',
      height: 36,
    },
  });

  // In production, load the built files
  // In development, connect to Vite dev server
  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5174');
    // Open DevTools in dev
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Elegant fade-in on ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Show startup notification
    if (Notification.isSupported()) {
      new Notification({
        title: 'JETIS Operasyon Merkezi',
        body: 'Sistem başarıyla başlatıldı. Kontrol paneli hazır.',
        icon: path.join(__dirname, 'build', 'icon.png'),
      }).show();
    }
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Minimize to tray instead of closing
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();

      // Show tray notification on first minimize
      if (Notification.isSupported()) {
        new Notification({
          title: 'JETIS Operasyon Merkezi',
          body: 'Uygulama arka planda çalışmaya devam ediyor.',
          icon: path.join(__dirname, 'build', 'icon.png'),
          silent: true,
        }).show();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // --- Poll for new notifications (every 30 seconds) ---
  setInterval(async () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    try {
      const { net } = require('electron');
      const request = net.request('http://localhost:4000/api/notifications/unread-count');
      request.on('response', (response) => {
        let body = '';
        response.on('data', (chunk) => { body += chunk; });
        response.on('end', () => {
          try {
            const json = JSON.parse(body);
            if (json.success && json.data && json.data.count > 0) {
              // Update badge on taskbar
              mainWindow.setTitle(`JETIS Operasyon Merkezi (${json.data.count} yeni bildirim)`);
            } else {
              mainWindow.setTitle('JETIS Operasyon Merkezi');
            }
          } catch {}
        });
      });
      request.on('error', () => {});
      request.end();
    } catch {}
  }, 30000);
}

function createTray() {
  // Create a 16x16 orange tray icon programmatically
  const size = 16;
  const canvas = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const x = i % size;
    const y = Math.floor(i / size);
    const cx = size / 2, cy = size / 2, r = size / 2 - 1;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    if (dist <= r) {
      canvas[i * 4]     = 255; // R
      canvas[i * 4 + 1] = 122; // G
      canvas[i * 4 + 2] = 0;   // B
      canvas[i * 4 + 3] = 255; // A
    } else {
      canvas[i * 4 + 3] = 0;   // Transparent
    }
  }
  const icon = nativeImage.createFromBuffer(canvas, { width: size, height: size });

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '📊 Operasyon Merkezi Aç',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: '📋 Tüm Siparişler',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.executeJavaScript('window.location.hash = "#/dashboard/all-orders"');
        }
      },
    },
    {
      label: '🚚 Kurye Yönetimi',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.executeJavaScript('window.location.hash = "#/dashboard/couriers"');
        }
      },
    },
    {
      label: '📈 Analitik',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.executeJavaScript('window.location.hash = "#/dashboard/analytics"');
        }
      },
    },
    { type: 'separator' },
    {
      label: '🔄 Sayfayı Yenile',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.reload();
        }
      },
    },
    {
      label: '🛠 DevTools',
      visible: !app.isPackaged,
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.toggleDevTools();
        }
      },
    },
    { type: 'separator' },
    {
      label: '❌ Çıkış',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('JETIS Operasyon Merkezi v1.0.0');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else if (mainWindow) {
    mainWindow.show();
  }
});
