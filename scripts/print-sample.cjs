const { app, BrowserWindow } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');

const outputPath = path.join(__dirname, '..', 'sample', 'sample-payroll.pdf');

const draft = require('./sample-draft.json');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    webPreferences: { sandbox: true, contextIsolation: true },
  });

  const file = path.join(__dirname, '..', 'dist', 'index.html');

  await win.loadFile(file);

  await win.webContents.executeJavaScript(
    `localStorage.setItem('pitac-payroll-general-draft-v1', ${JSON.stringify(
      JSON.stringify(draft),
    )});`,
  );

  await win.loadFile(file);

  await new Promise((resolve) => setTimeout(resolve, 1200));

  const pdf = await win.webContents.printToPDF({
    printBackground: false,
    pageSize: 'A4',
    landscape: false,
    preferCSSPageSize: true,
  });

  await fs.writeFile(outputPath, pdf);

  console.log(`Saved ${outputPath}`);

  app.quit();
});
