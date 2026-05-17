const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { parseDataFileFromPath } = require('@usebruno/common/runner');
const constants = require('../constants');

const loadIterationRows = async ({ csvFilePath, jsonFilePath }) => {
  if (csvFilePath && jsonFilePath) {
    console.error(chalk.red('Cannot use --csv-file-path and --json-file-path together'));
    process.exit(constants.EXIT_STATUS.ERROR_GENERIC);
  }

  if (!csvFilePath && !jsonFilePath) {
    return [{}];
  }

  const filePath = path.resolve(process.cwd(), csvFilePath || jsonFilePath);
  const fileExists = await fs.promises.access(filePath).then(() => true).catch(() => false);
  if (!fileExists) {
    console.error(chalk.red(`Data file not found: ${filePath}`));
    process.exit(constants.EXIT_STATUS.ERROR_FILE_NOT_FOUND);
  }

  try {
    const { rows } = await parseDataFileFromPath(filePath, fs.promises);
    return rows;
  } catch (err) {
    console.error(chalk.red(err.message || 'Failed to parse data file'));
    process.exit(constants.EXIT_STATUS.ERROR_INVALID_FILE);
  }
};

module.exports = loadIterationRows;
