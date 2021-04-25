const path = require('path'),
  osu = require('node-os-utils'),
  os = require('os'),
  { ipcRenderer } = require('electron');

const cpu = osu.cpu,
  mem = osu.mem;

const cpuModel = document.querySelector('#cpu-model');
(cpuUsage = document.querySelector('#cpu-usage')),
  (cpuFree = document.querySelector('#cpu-free')),
  (cpuProgress = document.querySelector('#cpu-progress')),
  (compName = document.querySelector('#comp-name')),
  (compOs = document.querySelector('#os')),
  (sysUptime = document.querySelector('#sys-uptime')),
  (memTotal = document.querySelector('#mem-total'));

let cpuOverload, alertFrequency;

// Get settings
ipcRenderer.on('settings:get', (e, settings) => {
  cpuOverload = +settings.cpuOverload;
  alertFrequency = +settings.alertFrequency;
});

sendNotification({
  title: 'CPU Overload',
  body: `CPU usage is over ${cpuOverload}%`,
  icon: path.join(__dirname, 'img/icon.png')
});

setInterval(() => {
  cpu.usage().then(info => {
    cpuUsage.textContent = `${info}%`;
    cpuProgress.style.width = `${info}%`;

    info > cpuOverload
      ? (cpuProgress.style.background = 'red')
      : (cpuProgress.style.background = '#30c88b');

    if (info >= cpuOverload && runNotify(alertFrequency)) {
      sendNotification({
        title: 'CPU Overload',
        body: `CPU usage is over ${cpuOverload}%`,
        icon: path.join(__dirname, 'img/icon.png')
      });

      localStorage.setItem('lastNotify', +new Date());
    }
  });

  cpu.free().then(info => {
    cpuFree.textContent = `${info}%`;
  });

  sysUptime.textContent = secondsToDhms(os.uptime());
}, 1000);

cpuModel.textContent = cpu.model();
compName.textContent = os.hostname();
compOs.textContent = `${os.type()} ${os.arch()}`;
mem.info().then(info => {
  memTotal.textContent = `${Math.round(info.totalMemMb)} Mb`;
});

// Show daya, hours, mins, secs
function secondsToDhms(sec) {
  sec = +sec;

  const d = Math.floor(sec / (3600 * 24));
  const h = Math.floor((sec % (3600 * 24)) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);

  return `${d}d, ${h}h, ${m}m, ${s}s`;
}

// Send notification
function sendNotification(options) {
  new Notification(options.title, options);
}

// Check how much time has passed since the last notification was displayed
function runNotify(frequency) {
  if (localStorage.getItem('lastNotify') === null) {
    // Store timestamp
    localStorage.setItem('lastNotify', +new Date());
    return true;
  }

  const notifyTime = new Date(parseInt(localStorage.getItem('lastNotify'))),
    now = new Date();

  const diffTime = Math.abs(now - notifyTime);
  const minutesPassed = Math.ceil(diffTime / (1000 * 60));

  return minutesPassed > frequency;
}
