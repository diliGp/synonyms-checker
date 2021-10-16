// Require the given module
const fs = require('fs');

const _readFile = file => {
  return fs.readFileSync(file, 'utf-8');
};

const _writeFile = (file, content) => {
  return fs.writeFileSync(file, content);
};

// Store the content and read from
// readMe.txt to a file WriteMe.txt

module.exports = {
  _readFile,
  _writeFile,
};
