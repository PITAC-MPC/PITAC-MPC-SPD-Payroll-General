const { app, BrowserWindow } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');

const outputPath = path.join(
  __dirname,
  '..',
  'sample',
  process.argv.includes('screen') ? 'sample-screen.png' : 'sample-print.png',
);

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1123,
    height: 794,
    webPreferences: { sandbox: true, contextIsolation: true },
  });

  const file = path.join(__dirname, '..', 'dist', 'index.html');

  await win.loadFile(file);

  await win.webContents.executeJavaScript(
    `localStorage.setItem('pitac-payroll-general-draft-v1', ${JSON.stringify(
      JSON.stringify(
        JSON.parse(
          require('node:fs').readFileSync(
            path.join(__dirname, 'sample-draft.json'),
            'utf8',
          ),
        ),
      ),
    )});`,
  );

  await win.loadFile(file);

  await new Promise((resolve) => setTimeout(resolve, 1500));

  await win.webContents.executeJavaScript(`
    if (${JSON.stringify(process.argv.includes('screen'))}) {
      const doc = document.querySelector('.print-document');
      if (doc) doc.style.display = 'none';
      document.body.style.background = '#f3f5f9';
    } else {
      const app = document.querySelector('.app-shell');
      if (app) app.style.display = 'none';
      const doc = document.querySelector('.print-document');
      if (doc) doc.style.display = 'block';
      document.body.style.background = '#ffffff';
      document.body.style.padding = '12mm';
    }
  `);

  await new Promise((resolve) => setTimeout(resolve, 500));

  const image = await win.webContents.capturePage();

  await fs.writeFile(outputPath, image.toPNG());

  console.log(`Saved ${outputPath}`);

  app.quit();
});
