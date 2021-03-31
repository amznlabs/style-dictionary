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

const createPropertyFormatter = require('./createPropertyFormatter');
const sortByReference = require('./sortByReference');

/**
 *
 * This is used to create lists of variables like Sass variables or CSS custom properties
 * @memberof module:formatHelpers
 * @param {String} format - What type of variables to output. Options are: css, sass, less, and stylus
 * @param {Object} dictionary - The dictionary object that gets passed to the formatter method.
 * @param {Boolean} outputReferences - Whether or not to output references
 * @returns {String}
 * @example
 * ```js
 * StyleDictionary.registerFormat({
 *   name: 'myCustomFormat',
 *   formatter: function({ dictionary, options }) {
 *     return formattedVariables('less', dictionary, options.outputReferences);
 *   }
 * });
 * ```
 */
function formattedVariables(format, dictionary, outputReferences = false) {
  let {allProperties} = dictionary;

  // Some languages are imperative, meaning a variable has to be defined
  // before it is used. If `outputReferences` is true, check if the token
  // has a reference, and if it does send it to the end of the array.
  // We also need to account for nested references, a -> b -> c. They
  // need to be defined in reverse order: c, b, a so that the reference always
  // comes after the definition
  if (outputReferences) {
    // note: using the spread operator here so we get a new array rather than
    // mutating the original
    allProperties = [...allProperties].sort(sortByReference(dictionary));
  }

  return allProperties
    .map(createPropertyFormatter({ outputReferences, dictionary, format }))
    .filter(function(strVal) { return !!strVal })
    .join('\n');
}

module.exports = formattedVariables;