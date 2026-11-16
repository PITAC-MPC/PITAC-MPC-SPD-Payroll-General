const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('payrollApi', {
  savePdf: (suggestedName) =>
    ipcRenderer.invoke('payroll:save-pdf', suggestedName),
  print: () => ipcRenderer.invoke('payroll:print'),
});
