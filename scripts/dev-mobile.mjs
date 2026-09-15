#!/usr/bin/env node
/* eslint-disable */
// Cross-platform launcher for Expo dev server.
// Sets EXPO_PUBLIC_API_URL if not already set, then runs `expo start`.
// Filters out virtual adapters (VMware, WSL, Hyper-V) to use the real Wi-Fi/Ethernet IP.

import { spawn } from 'node:child_process';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';

function getLocalIp() {
  const nets = os.networkInterfaces();
  const fallbackIps = [];

  // 1. First search for actual physical Wi-Fi / Ethernet adapters
  for (const name of Object.keys(nets)) {
    const isVirtual = /vmnet|vethernet|wsl|virtualbox|hyper-v|loopback|bluetooth/i.test(name);
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        if (
          !isVirtual &&
          !net.address.startsWith('192.168.186.') &&
          !net.address.startsWith('192.168.133.') &&
          !net.address.startsWith('172.')
        ) {
          return net.address;
        }
        fallbackIps.push(net.address);
      }
    }
  }
  return fallbackIps[0] || 'localhost';
}

const localIp = getLocalIp();
const DEFAULT_API_URL = `http://${localIp}:3000`;

// Unconditionally set EXPO_PUBLIC_API_URL to the actual current IP
process.env.EXPO_PUBLIC_API_URL = DEFAULT_API_URL;
process.env.REACT_NATIVE_PACKAGER_HOSTNAME = localIp !== 'localhost' ? localIp : undefined;

console.log(`[dev-mobile] Detected Local IP: ${localIp}`);
console.log(`[dev-mobile] EXPO_PUBLIC_API_URL=${process.env.EXPO_PUBLIC_API_URL}`);
console.log(
  `[dev-mobile] REACT_NATIVE_PACKAGER_HOSTNAME=${process.env.REACT_NATIVE_PACKAGER_HOSTNAME}`,
);

const args = ['--filter', '@kidscare/mobile', 'exec', 'expo', 'start', '--clear'];
if (process.argv.includes('--tunnel')) {
  args.push('--tunnel');
} else {
  args.push('--host', 'lan');
}

const logFile = path.resolve(process.cwd(), 'expo-live.log');
const logStream = fs.createWriteStream(logFile, { flags: 'w' });

function writeLog(chunk) {
  process.stdout.write(chunk);
  try {
    logStream.write(chunk);
  } catch {}
}

function writeErr(chunk) {
  process.stderr.write(chunk);
  try {
    logStream.write(chunk);
  } catch {}
}

const child = spawn('pnpm', args, { stdio: 'inherit', env: process.env, shell: true });

child.on('exit', (code) => {
  logStream.end();
  process.exit(code ?? 0);
});
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
