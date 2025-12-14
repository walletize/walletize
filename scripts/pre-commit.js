#!/usr/bin/env node

const { execSync } = require('child_process');
const { join } = require('path');
const { existsSync } = require('fs');

const rootDir = join(__dirname, '..');

function runLintStaged(directory) {
  const dirPath = join(rootDir, directory);
  if (!existsSync(join(dirPath, 'package.json'))) {
    console.log(`Skipping ${directory} - no package.json found`);
    return true;
  }

  console.log(`Running lint-staged in ${directory}...`);
  try {
    execSync('pnpm exec lint-staged', {
      cwd: dirPath,
      stdio: 'inherit',
    });
    return true;
  } catch (error) {
    console.error(`lint-staged failed in ${directory}`);
    return false;
  }
}

const webSuccess = runLintStaged('web');
const serverSuccess = runLintStaged('server');

if (!webSuccess || !serverSuccess) {
  process.exit(1);
}

