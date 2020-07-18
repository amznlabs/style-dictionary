/*
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

require('json5/lib/register');

var glob = require('glob'),
  deepExtend = require('./deepExtend'),
  extend = require('lodash/extend'),
  path = require('path'),
  resolveCwd = require('resolve-cwd');

/**
 * Takes an array of json files and merges
 * them together. Optionally does a deep extend.
 * @private
 * @param {String[]} arr - Array of paths to json (or node modules that export objects) files
 * @param {Boolean} [deep=false] - If it should perform a deep merge
 * @param {Function} collision - A function to be called when a name collision happens that isn't a normal deep merge of objects
 * @returns {Object}
 */
function combineJSON(arr, deep, collision, useFilePathAsCTI) {
  var i, files = [],
    to_ret = {};

  for (i = 0; i < arr.length; i++) {
    var new_files = glob.sync(arr[i], {});
    files = files.concat(new_files);
  }

  for (i = 0; i < files.length; i++) {
    var resolvedPath = resolveCwd(path.isAbsolute(files[i]) ? files[i] : './' + files[i]);
    var file_content;

    try {
      // This delete force require(resolvedPath) to take the latest version of the file. It's handfull when using the node package along chokidar.
      delete require.cache[resolvedPath]
      file_content = require(resolvedPath);
    } catch (e) {
      e.message = 'Failed to load or parse JSON or JS Object: ' + e.message;
      throw e;
    }

    if(useFilePathAsCTI) {
      let filePath = path.relative('./', files[i]);
      let ctisetup = filePath.split('.');
      if(ctisetup.length > 1) {
        ctisetup.pop();
      }
      ctisetup = ctisetup.join('.').split('/');

      // should this be included? This removes the initial "properties" folder if it is containing all the properties
      if(ctisetup[0]==='properties') {
        ctisetup.shift();
      }

      let newContent = {};
      let contentPos = newContent;
      ctisetup.forEach((pathPiece, index) => {
        if(index < ctisetup.length-1) {
          contentPos[pathPiece] = {};
          contentPos = contentPos[pathPiece];
        }
        else {
          contentPos[pathPiece] = file_content;
        }
      });

      file_content = newContent;
    }

    if (deep) {
      deepExtend([to_ret, file_content], collision);
    } else {
      extend(to_ret, file_content);
    }
  }

  return to_ret;
}

module.exports = combineJSON;
