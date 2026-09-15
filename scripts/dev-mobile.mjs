#!/usr/bin/env node
/* eslint-disable */
// Cross-platform launcher for Expo dev server.
// Sets EXPO_PUBLIC_API_URL if not already set, then runs `expo start --host lan`.
// Works in PowerShell, bash, zsh, cmd — no shell-specific syntax.

import { spawn } from 'node:child_process';
import os from 'node:os';

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIp();
const DEFAULT_API_URL = `http://${localIp}:3000`;

if (!process.env.EXPO_PUBLIC_API_URL) {
  process.env.EXPO_PUBLIC_API_URL = DEFAULT_API_URL;
}

if (!process.env.REACT_NATIVE_PACKAGER_HOSTNAME && localIp !== 'localhost') {
  process.env.REACT_NATIVE_PACKAGER_HOSTNAME = localIp;
}

console.log(`[dev-mobile] EXPO_PUBLIC_API_URL=${process.env.EXPO_PUBLIC_API_URL}`);
console.log(
  `[dev-mobile] REACT_NATIVE_PACKAGER_HOSTNAME=${process.env.REACT_NATIVE_PACKAGER_HOSTNAME}`,
);

const child = spawn(
  'pnpm',
  ['--filter', '@kidscare/mobile', 'exec', 'expo', 'start', '--host', 'lan'],
  { stdio: 'inherit', env: process.env, shell: true },
);

child.on('exit', (code) => process.exit(code ?? 0));
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
