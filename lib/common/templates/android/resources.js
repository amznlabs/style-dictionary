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

module.exports = ({ dictionary, options={}, file={} }) => {
  const resourceType = file.resourceType || null;

  const resourceMap = file.resourceMap || {
    size: 'dimen',
    color: 'color',
    string: 'string',
    content: 'string',
    time: 'integer',
    number: 'integer'
  };

  function propToType(prop) {
    if (resourceType) {
      return resourceType;
    }
    if (resourceMap[prop.attributes.category]) {
      return resourceMap[prop.attributes.category];
    }
    return 'string';
  }

  function propToValue(prop) {
    if (file.options && file.options.outputReferences && dictionary.usesReference(prop.original.value)) {
      return `@${propToType(prop)}/${dictionary.getReference(prop.original.value).name}`;
    } else {
      return prop.value;
    }
  }

  // for backward compatibility we need to have the user explicitly hide it
  const showFileHeader = options.hasOwnProperty('showFileHeader') ? options.showFileHeader : true;
  const header = `<!--
  Do not edit directly
  Generated on ${new Date().toUTCString()}
-->`

  return `<?xml version="1.0" encoding="UTF-8"?>
${showFileHeader ? header : ''}
<resources>
${dictionary.allProperties
  .map(token => {
    const comment = token.comment ? `<!-- ${token.comment} -->` : ``;
    const type = propToType(token);
    return `  <${type} name="${token.name}">${propToValue(token)}</${type}>${comment}`
  }).join(`\n`)}
</resources>`
}