/**
 * Replaces vulnerable nested copies under jshint and @prantlf/jsonlint
 * with hoisted secure versions from the workspace root.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function replaceNestedPackage(parentDir, packageName, sourceDir) {
  const targetDir = path.join(parentDir, 'node_modules', packageName);

  if (!fs.existsSync(parentDir) || !fs.existsSync(sourceDir)) {
    return;
  }

  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }

  fs.mkdirSync(path.dirname(targetDir), { recursive: true });
  fs.cpSync(sourceDir, targetDir, { recursive: true });
}

try {
  replaceNestedPackage(
    path.join(root, 'node_modules', 'jshint'),
    'lodash',
    path.join(root, 'node_modules', 'lodash')
  );
  replaceNestedPackage(
    path.join(root, 'node_modules', 'jshint'),
    'minimatch',
    path.join(root, 'node_modules', 'minimatch')
  );
  replaceNestedPackage(
    path.join(root, 'node_modules', '@prantlf', 'jsonlint'),
    'ajv',
    path.join(root, 'node_modules', 'ajv')
  );
  replaceNestedPackage(
    path.join(root, 'node_modules', '@prantlf', 'jsonlint'),
    'diff',
    path.join(root, 'node_modules', 'diff')
  );

  const tarSource = path.join(root, 'node_modules', 'tar');
  const mapboxDir = path.join(root, 'node_modules', '@mapbox', 'node-pre-gyp');
  if (fs.existsSync(tarSource) && fs.existsSync(mapboxDir)) {
    replaceNestedPackage(mapboxDir, 'tar', tarSource);
  }
} catch (error) {
  console.warn('[patch-security-deps] Non-fatal patch failure:', error.message);
}
