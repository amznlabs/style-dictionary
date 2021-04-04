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
  // for backward compatibility we need to have the user explicitly hide it
  const showFileHeader = options.hasOwnProperty('showFileHeader') ? options.showFileHeader : true;
  const header = `// Do not edit directly
// Generated on ${new Date().toUTCString()}
//`

  return `
//
// ${file.destination}
//
${showFileHeader ? header : ''}

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

${dictionary.allProperties.map((token) => {
  return `#define ${token.name} ${token.value}`;
}).join(',\n')}
`
}