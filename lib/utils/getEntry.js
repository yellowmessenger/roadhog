"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

var _fs = require("fs");

var _glob = _interopRequireDefault(require("glob"));

var _isPlainObject = _interopRequireDefault(require("is-plain-object"));

var _reactDevUtils = require("af-webpack/react-dev-utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// entry 支持 4 种格式：
//
// 1. 什么都没配，取 src/index.(j|t)sx?
// 2. 对象
// 3. 字符串
// 4. 数组
function _default(opts = {}) {
  const cwd = opts.cwd,
        entry = opts.entry,
        isBuild = opts.isBuild;
  let entryObj = null;

  if (!entry) {
    entryObj = {
      index: getExistsDefaultEntry(cwd)
    };
  } else if (typeof entry === 'string') {
    const files = getFiles(entry, cwd);
    entryObj = getEntries(files);
  } else if (Array.isArray(entry)) {
    const files = entry.reduce((memo, entryItem) => {
      return memo.concat(getFiles(entryItem, cwd));
    }, []);
    entryObj = getEntries(files);
  } else if ((0, _isPlainObject.default)(entry)) {
    entryObj = entry;
  } else {
    throw new Error(`entry should be String, Array or Plain Object, but got ${entry}`);
  }

  if (!isBuild) {
    entryObj = Object.keys(entryObj).reduce((memo, key) => !Array.isArray(entryObj[key]) ? _objectSpread({}, memo, {
      [key]: [_reactDevUtils.webpackHotDevClientPath, entryObj[key]]
    }) : _objectSpread({}, memo, {
      [key]: entryObj[key]
    }), {});
  } // add setPublicPath


  const setPublicPathFile = (0, _path.join)(__dirname, '../../template/setPublicPath.js');

  if (process.env.SET_PUBLIC_PATH) {
    entryObj = Object.keys(entryObj).reduce((memo, key) => {
      return _objectSpread({}, memo, {
        [key]: [setPublicPathFile, ...(Array.isArray(entryObj[key]) ? entryObj[key] : [entryObj[key]])]
      });
    }, {});
  }

  return entryObj;
}

function getEntry(filePath) {
  const key = (0, _path.basename)(filePath).replace(/\.(j|t)sx?$/, '');
  return {
    [key]: filePath
  };
}

function getFiles(entry, cwd) {
  const files = _glob.default.sync(entry, {
    cwd
  });

  return files.map(file => {
    return file.charAt(0) === '.' ? file : `.${_path.sep}${file}`;
  });
}

function getEntries(files) {
  return files.reduce((memo, file) => {
    return _objectSpread({}, memo, getEntry(file));
  }, {});
}

function getExistsDefaultEntry(cwd) {
  if ((0, _fs.existsSync)((0, _path.join)(cwd, './src/index.js'))) {
    return './src/index.js';
  }

  if ((0, _fs.existsSync)((0, _path.join)(cwd, './src/index.jsx'))) {
    return './src/index.jsx';
  }

  if ((0, _fs.existsSync)((0, _path.join)(cwd, './src/index.ts'))) {
    return './src/index.ts';
  }

  if ((0, _fs.existsSync)((0, _path.join)(cwd, './src/index.tsx'))) {
    return './src/index.tsx';
  } // default


  return './src/index.js';
}