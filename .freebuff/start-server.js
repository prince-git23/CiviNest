const { spawn } = require('child_process');
const path = require('path');

const cwd = String.raw`C:\Users\Prince yadav\OneDrive\Desktop\Hackathons\Main Project\CiviNest`;
const logFile = path.join(cwd, '.freebuff', 'preview-bb9b146f-cf27-43b3-9a5e-66f10fba7e82.log');
const errFile = logFile + '.err';
const fs = require('fs');
const logFd = fs.openSync(logFile, 'w');
const errFd = fs.openSync(errFile, 'w');

const p = spawn('node', [path.join(cwd, 'node_modules', '.bin', 'vite'), '--port', '3000', '--host', '0.0.0.0'], {
  cwd,
  detached: true,
  stdio: ['ignore', logFd, errFd],
});
p.unref();
fs.closeSync(logFd);
fs.closeSync(errFd);
console.log('PID:' + p.pid);
