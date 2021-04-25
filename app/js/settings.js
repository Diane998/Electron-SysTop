const { ipcRenderer } = require('electron');

const settingsForm = document.querySelector('#settings-form'),
  cpuOverloadInput = document.querySelector('#cpu-overload'),
  alertFrequencyInput = document.querySelector('#alert-frequency'),
  alert = document.querySelector('#alert');

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

  showAlert('Settings Saved');
});

// Show alert for settings
function showAlert(msg) {
  alert.classList.remove('hide');
  alert.classList.add('alert');
  alert.textContent = msg;

  setTimeout(() => alert.classList.add('hide'), 3000);
}
