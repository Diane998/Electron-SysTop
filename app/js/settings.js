const { ipcRenderer } = require('electron');

const settingsForm = document.querySelector('#settings-form'),
  cpuOverloadInput = document.querySelector('#cpu-overload'),
  alertFrequencyInput = document.querySelector('#alert-frequency');

// Get settings
ipcRenderer.on('settings:get', (e, settings) => {
  cpuOverloadInput.value = settings.cpuOverload;
  alertFrequencyInput.value = settings.alertFrequency;
});

// Submit settings
settingsForm.addEventListener('submit', e => {
  e.preventDefault();

  const cpuOverload = cpuOverloadInput.value,
    alertFrequency = alertFrequencyInput.value;

  // send new settings to main process
  ipcRenderer.send('settings:set', {
    cpuOverload,
    alertFrequency
  });
});
