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

var fs = require('fs'),
    _  = require('lodash'),
    GroupMessages = require('../utils/groupMessages'),
    { fileHeader, formattedVariables, iconsWithPrefix, minifyDictionary, sortAllProperties } = require('./formatHelpers');

var SASS_MAP_FORMAT_DEPRECATION_WARNINGS = GroupMessages.GROUP.SassMapFormatDeprecationWarnings;

/**
 * @namespace Formats
 */

module.exports = {
  /**
   * Creates a CSS file with variable definitions based on the style dictionary
   *
   * @memberof Formats
   * @kind member
   * @param {Object} options
   * @param {Boolean} [options.showFileHeader=true] - Whether or not to include a comment that has the build date
   * @param {Boolean} [options.outputReferences=false] - Whether or not to keep [references](/#/formats?id=references-in-output-files) (a -> b -> c) in the output.
   * @example
   * ```css
   * :root {
   *   --color-background-base: #f0f0f0;
   *   --color-background-alt: #eeeeee;
   * }
   * ```
   */
  'css/variables': function({dictionary, options={}, file}) {
    const selector = options.selector ? options.selector : `:root`;
    return fileHeader(file) +
      `${selector} {\n` +
      formattedVariables('css', dictionary, options.outputReferences) +
      `\n}\n`;
  },

  /**
   * Creates a SCSS file with a flat map based on the style dictionary
   *
   * Name the map by adding a 'mapName' attribute on the file object in your config.
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```scss
   * $tokens: (
   *   'color-background-base': #f0f0f0;
   *   'color-background-alt': #eeeeee;
   * )
   * ```
   */
  'scss/map-flat': _.template(
    fs.readFileSync(__dirname + '/templates/scss/map-flat.template')
  ),

  // This will soon be removed, is left here only for backwards compatibility
  'sass/map-flat': function({dictionary, options}) {
    GroupMessages.add(SASS_MAP_FORMAT_DEPRECATION_WARNINGS, "sass/map-flat");
    const templateMapFlat = _.template(fs.readFileSync(__dirname + '/templates/scss/map-flat.template'));
    return templateMapFlat({
      showFileHeader: options.showFileHeader,
      allProperties: dictionary.allProperties
    });
  },

  /**
   * Creates a SCSS file with a deep map based on the style dictionary.
   *
   * Name the map by adding a 'mapName' attribute on the file object in your config.
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```scss
   * $color-background-base: #f0f0f0 !default;
   * $color-background-alt: #eeeeee !default;
   *
   * $tokens: {
   *   'color': (
   *     'background': (
   *       'base': $color-background-base,
   *       'alt': $color-background-alt
   *     )
   *   )
   * )
   * ```
   */
  'scss/map-deep': _.template(
    fs.readFileSync(__dirname + '/templates/scss/map-deep.template')
  ),

  // This will soon be removed, is left here only for backwards compatibility
  'sass/map-deep': function({dictionary, options}) {
    GroupMessages.add(SASS_MAP_FORMAT_DEPRECATION_WARNINGS, "sass/map-deep");
    const templateMapDeep = _.template(fs.readFileSync(__dirname + '/templates/scss/map-deep.template'));
    return templateMapDeep({
      showFileHeader: options.showFileHeader,
      properties: dictionary.properties,
      allProperties: dictionary.allProperties
    });
  },

  /**
   * Creates a SCSS file with variable definitions based on the style dictionary.
   *
   * Add `!default` to any variable by setting a `themeable: true` property in the token's definition.
   *
   * @memberof Formats
   * @kind member
   * @param {Object} options
   * @param {Boolean} [options.showFileHeader=true] - Whether or not to include a comment that has the build date
   * @param {Boolean} [options.outputReferences=false] - Whether or not to keep [references](/#/formats?id=references-in-output-files) (a -> b -> c) in the output.
   * @example
   * ```scss
   * $color-background-base: #f0f0f0;
   * $color-background-alt: #eeeeee !default;
   * ```
   */
  'scss/variables': function({dictionary, options, file}) {
    return fileHeader(file, 'short') +
      formattedVariables('sass', dictionary, options.outputReferences);
  },

  /**
   * Creates a SCSS file with variable definitions and helper classes for icons
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```scss
   * $content-icon-email: '\E001';
   * .icon.email:before { content:$content-icon-email; }
   * ```
   */
  'scss/icons': function({dictionary, options, file}) {
    return fileHeader(file, 'short') + iconsWithPrefix('$', dictionary.allProperties, options);
  },

  /**
   * Creates a LESS file with variable definitions based on the style dictionary
   *
   * @memberof Formats
   * @kind member
   * @param {Object} options
   * @param {Boolean} [options.showFileHeader=true] - Whether or not to include a comment that has the build date
   * @param {Boolean} [options.outputReferences=false] - Whether or not to keep [references](/#/formats?id=references-in-output-files) (a -> b -> c) in the output.
   * @example
   * ```less
   * \@color-background-base: #f0f0f0;
   * \@color-background-alt: #eeeeee;
   * ```
   */
  'less/variables': function({dictionary, options, file}) {
    return fileHeader(file, 'short') +
      formattedVariables('less', dictionary, options.outputReferences);
  },

  /**
   * Creates a LESS file with variable definitions and helper classes for icons
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```less
   * \@content-icon-email: '\E001';
   * .icon.email:before { content:\@content-icon-email; }
   * ```
   */
  'less/icons': function({dictionary, options, file}) {
    return fileHeader(file, 'short') + iconsWithPrefix('@', dictionary.allProperties, options);
  },

  /**
   * Creates a Stylus file with variable definitions based on the style dictionary
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```stylus
   * $color-background-base= #f0f0f0;
   * $color-background-alt= #eeeeee;
   * ```
   */
  'stylus/variables': function({dictionary, options, file}) {
    return fileHeader(file, 'short') +
      formattedVariables('stylus', dictionary, options.outputReferences);
  },

  /**
   * Creates a CommonJS module with the whole style dictionary
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```js
   * module.exports = {
   *   color: {
   *     base: {
   *        red: {
   *          value: '#ff0000'
   *        }
   *     }
   *   }
   * }
   * ```
   */
  'javascript/module': function({dictionary, file}) {
    return fileHeader(file) +
    'module.exports = ' +
      JSON.stringify(dictionary.properties, null, 2) + ';';
  },

  /**
   * Creates a CommonJS module with the whole style dictionary flattened to a single level.
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```js
   * module.exports = {
   *  "ColorBaseRed": "#ff0000"
   *}
   *```
   */
  'javascript/module-flat': function({dictionary, file}) {
    return fileHeader(file) +
      'module.exports = ' +
        module.exports['json/flat']({dictionary}) + ';';
  },

  /**
   * Creates a JS file a global var that is a plain javascript object of the style dictionary.
   * Name the variable by adding a 'name' attribute on the file object in your config.
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```js
   * var StyleDictionary = {
   *   color: {
   *     base: {
   *        red: {
   *          value: '#ff0000'
   *        }
   *     }
   *   }
   * }
   * ```
   */
  'javascript/object': function({dictionary, file}) {
    return  fileHeader(file) +
      'var ' +
      (file.name || '_styleDictionary') +
      ' = ' +
      JSON.stringify(dictionary.properties, null, 2) +
      ';';
  },

  /**
   * Creates a [UMD](https://github.com/umdjs/umd) module of the style
   * dictionary. Name the module by adding a 'name' attribute on the file object
   * in your config.
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```js
   * (function(root, factory) {
   *   if (typeof module === "object" && module.exports) {
   *     module.exports = factory();
   *   } else if (typeof exports === "object") {
   *     exports["_styleDictionary"] = factory();
   *   } else if (typeof define === "function" && define.amd) {
   *     define([], factory);
   *   } else {
   *     root["_styleDictionary"] = factory();
   *   }
   * }(this, function() {
   *   return {
   *     "color": {
   *       "red": {
   *         "value": "#FF0000"
   *       }
   *     }
   *   };
   * }))
   * ```
   */
  'javascript/umd': function({dictionary, file}) {
    var name = file.name || '_styleDictionary'
    return fileHeader(file) +
      '(function(root, factory) {\n' +
      '  if (typeof module === "object" && module.exports) {\n' +
      '    module.exports = factory();\n' +
      '  } else if (typeof exports === "object") {\n' +
      '    exports["' + name + '"] = factory();\n' +
      '  } else if (typeof define === "function" && define.amd) {\n' +
      '    define([], factory);\n' +
      '  } else {\n' +
      '    root["' + name + '"] = factory();\n' +
      '  }\n' +
      '}(this, function() {\n' +
      '  return ' + JSON.stringify(dictionary.properties, null, 2) + ';\n' +
      '}))\n'
  },

  /**
   * Creates a ES6 module of the style dictionary.
   *
   * ```json
   * {
   *   "platforms": {
   *     "js": {
   *       "transformGroup": "js",
   *       "files": [
   *         {
   *           "format": "javascript/es6",
   *           "destination": "colors.js",
   *           "filter": {
   *             "attributes": {
   *               "category": "color"
   *             }
   *           }
   *         }
   *       ]
   *     }
   *   }
   * }
   * ```
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```js
   * export const ColorBackgroundBase = '#ffffff';
   * export const ColorBackgroundAlt = '#fcfcfcfc';
   * ```
   */
  'javascript/es6': function({dictionary, file}) {
    return fileHeader(file) +
      dictionary.allProperties.map(function(prop) {
        var to_ret_prop = 'export const ' + prop.name + ' = ' + JSON.stringify(prop.value) + ';';
        if (prop.comment)
          to_ret_prop = to_ret_prop.concat(' // ' + prop.comment);
        return to_ret_prop;
      }).join('\n');
  },

  // Android templates
  /**
   * Creates a [resource](https://developer.android.com/guide/topics/resources/providing-resources) xml file. It is recommended to use a filter with this format
   * as it is generally best practice in Android development to have resource files
   * organized by type (color, dimension, string, etc.). However, a resource file
   * with mixed resources will still work.
   *
   * This format will try to use the proper resource type for each token based on
   * the category (color => color, size => dimen, etc.). However if you want to
   * force a particular resource type you can provide a 'resourceType' attribute
   * on the file configuration. You can also provide a 'resourceMap' if you
   * don't use Style Dictionary's built-in CTI structure.
   *
   * @memberof Formats
   * @kind member
   * @param {Object} options
   * @param {Boolean} [options.showFileHeader=true] - Whether or not to include a comment that has the build date
   * @param {Boolean} [options.outputReferences=false] - Whether or not to keep [references](/#/formats?id=references-in-output-files) (a -> b -> c) in the output.
   * @example
   * ```xml
   * <?xml version="1.0" encoding="UTF-8"?>
   * <resources>
   *  <color name="color_base_red_5">#fffaf3f2</color>
   *  <color name="color_base_red_30">#fff0cccc</color>
   *  <dimen name="size_font_base">14sp</color>
   * ```
   */
  'android/resources': require('./templates/android/resources'),

  /**
   * Creates a color resource xml file with all the colors in your style dictionary.
   *
   * It is recommended to use the 'android/resources' format with a custom filter
   * instead of this format:
   *
   * ```javascript
   * format: 'android/resources',
   * filter: {
   *   attributes: { category: 'color' }
   * }
   * ```
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```xml
   * <?xml version="1.0" encoding="UTF-8"?>
   * <resources>
   *  <color name="color_base_red_5">#fffaf3f2</color>
   *  <color name="color_base_red_30">#fff0cccc</color>
   *  <color name="color_base_red_60">#ffe19d9c</color>
   * ```
   */
  'android/colors': require('./templates/android/colors'),

  /**
   * Creates a dimen resource xml file with all the sizes in your style dictionary.
   *
   * It is recommended to use the 'android/resources' format with a custom filter
   * instead of this format:
   *
   * ```javascript
   * format: 'android/resources',
   * filter: {
   *   attributes: { category: 'size' }
   * }
   * ```
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```xml
   * <?xml version="1.0" encoding="UTF-8"?>
   * <resources>
   *  <dimen name="size_padding_tiny">5.00dp</dimen>
   *  <dimen name="size_padding_small">10.00dp</dimen>
   *  <dimen name="size_padding_medium">15.00dp</dimen>
   * ```
   */
  'android/dimens': require('./templates/android/dimens'),

  /**
   * Creates a dimen resource xml file with all the font sizes in your style dictionary.
   *
   * It is recommended to use the 'android/resources' format with a custom filter
   * instead of this format:
   *
   * ```javascript
   * format: 'android/resources',
   * filter: {
   *   attributes: { category: 'size' }
   * }
   * ```
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```xml
   * <?xml version="1.0" encoding="UTF-8"?>
   * <resources>
   *  <dimen name="size_font_tiny">10.00sp</dimen>
   *  <dimen name="size_font_small">13.00sp</dimen>
   *  <dimen name="size_font_medium">15.00sp</dimen>
   * ```
   */
  'android/fontDimens': require('./templates/android/fontDimens'),

  /**
   * Creates a resource xml file with all the integers in your style dictionary. It filters your
   * style properties by `prop.attributes.category === 'time'`
   *
   * It is recommended to use the 'android/resources' format with a custom filter
   * instead of this format:
   *
   * ```javascript
   * format: 'android/resources',
   * filter: {
   *   attributes: { category: 'time' }
   * }
   * ```
   *
   * @memberof Formats
   * @kind member
   * @todo Update the filter on this.
   * @example
   * ```xml
   * <?xml version="1.0" encoding="UTF-8"?>
   * <resources>
   *   <integer name="time_duration_short">1000</string>
   *   <integer name="time_duration_medium">2000</string>
   *   <integer name="time_duration_long">4000</string>
   * ```
   */
  'android/integers': require('./templates/android/integers'),

  /**
   * Creates a resource xml file with all the strings in your style dictionary. Filters your
   * style properties by `prop.attributes.category === 'content'`
   *
   * It is recommended to use the 'android/resources' format with a custom filter
   * instead of this format:
   *
   * ```javascript
   * format: 'android/resources',
   * filter: {
   *   attributes: { category: 'content' }
   * }
   * ```
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```xml
   * <?xml version="1.0" encoding="UTF-8"?>
   * <resources>
   *   <string name="content_icon_email">&#xE001;</string>
   *   <string name="content_icon_chevron_down">&#xE002;</string>
   *   <string name="content_icon_chevron_up">&#xE003;</string>
   * ```
   */
  'android/strings': require('./templates/android/strings'),

  // iOS templates
  /**
   * Creates an Objective-C header file with macros for style properties
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```objectivec
   * #import <Foundation/Foundation.h>
   * #import <UIKit/UIKit.h>
   *
   * #define ColorFontLink [UIColor colorWithRed:0.00f green:0.47f blue:0.80f alpha:1.00f]
   * #define SizeFontTiny 176.00f
   * ```
   */
  'ios/macros': require('./templates/ios/macros'),

  /**
   * Creates an Objective-C plist file
   *
   * @memberof Formats
   * @kind member
   * @todo Fix this template and add example and usage
   */
  'ios/plist': _.template(
    fs.readFileSync(__dirname + '/templates/ios/plist.template')
  ),

  /**
   * Creates an Objective-C implementation file of a style dictionary singleton class
   *
   * @memberof Formats
   * @kind member
   * @todo Add example and usage
   */
  'ios/singleton.m': _.template(
    fs.readFileSync(__dirname + '/templates/ios/singleton.m.template')
  ),

  /**
   * Creates an Objective-C header file of a style dictionary singleton class
   *
   * @memberof Formats
   * @kind member
   * @todo Add example and usage
   */
  'ios/singleton.h': _.template(
    fs.readFileSync(__dirname + '/templates/ios/singleton.h.template')
  ),

  /**
   * Creates an Objective-C header file of a static style dictionary class
   *
   * @memberof Formats
   * @kind member
   * @todo Add example and usage
   */
  'ios/static.h': _.template(
    fs.readFileSync(__dirname + '/templates/ios/static.h.template')
  ),

  /**
   * Creates an Objective-C implementation file of a static style dictionary class
   *
   * @memberof Formats
   * @kind member
   * @todo Add example and usage
   */
  'ios/static.m': _.template(
    fs.readFileSync(__dirname + '/templates/ios/static.m.template')
  ),

  /**
   * Creates an Objective-C header file of a color class
   *
   * @memberof Formats
   * @kind member
   * @todo Add example and usage
   */
  'ios/colors.h': require('./templates/ios/colors.h'),

  /**
   * Creates an Objective-C implementation file of a color class
   *
   * @memberof Formats
   * @kind member
   * @todo Add example and usage
   */
  'ios/colors.m': require('./templates/ios/colors.m'),

  /**
   * Creates an Objective-C header file of strings
   *
   * @memberof Formats
   * @kind member
   * @todo Add example and usage
   */
  'ios/strings.h': _.template(
    fs.readFileSync(__dirname + '/templates/ios/strings.h.template')
  ),

  /**
   * Creates an Objective-C implementation file of strings
   *
   * @memberof Formats
   * @kind member
   * @todo Add example and usage
   */
  'ios/strings.m': _.template(
    fs.readFileSync(__dirname + '/templates/ios/strings.m.template')
  ),

  /**
   * Creates a Swift implementation file of a class with values
   *
   * @memberof Formats
   * @kind member
   * @param {Object} options
   * @param {Boolean} [options.showFileHeader=true] - Whether or not to include a comment that has the build date
   * @param {Boolean} [options.outputReferences=false] - Whether or not to keep [references](/#/formats?id=references-in-output-files) (a -> b -> c) in the output.
   * @example
   * ```swift
   * public class StyleDictionary {
   *   public static let colorBackgroundDanger = UIColor(red: 1.000, green: 0.918, blue: 0.914, alpha:1)
   * }
   * ```
   */
  'ios-swift/class.swift': function({dictionary, options, file}) {
    const template = _.template(
      fs.readFileSync(__dirname + '/templates/ios-swift/class.swift.template')
    );
    return template({dictionary, file, options, sortAllProperties});
  },

  /**
   * Creates a Swift implementation file of an enum with values
   *
   * @memberof Formats
   * @kind member
   * @todo Add example and usage
   */
  'ios-swift/enum.swift': function({dictionary, options, file}) {
    const template = _.template(
      fs.readFileSync(__dirname + '/templates/ios-swift/enum.swift.template')
    );
    return template({dictionary, file, options, sortAllProperties});
  },
  // Css templates

  /**
   * Creates CSS file with @font-face declarations
   *
   * @memberof Formats
   * @kind member
   * @todo Add example and usage
   */
  'css/fonts.css': _.template(
    fs.readFileSync(__dirname + '/templates/css/fonts.css.template')
  ),

  // Web templates

  /**
   * Creates a JSON file of the style dictionary.
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```json
   * {
   *   "color": {
   *     "base": {
   *        "red": {
   *          "value": "#ff0000"
   *        }
   *     }
   *   }
   * }
   * ```
   */
  'json': function({dictionary}) {
    return JSON.stringify(dictionary.properties, null, 2);
  },

  /**
   * Creates a JSON file of the assets defined in the style dictionary.
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```js
   * {
   *   "asset": {
   *     "image": {
   *        "logo": {
   *          "value": "assets/logo.png"
   *        }
   *     }
   *   }
   * }
   * ```
   */
  'json/asset': function({dictionary}) {
    return JSON.stringify({asset: dictionary.properties.asset}, null, 2);
  },

  /**
   * Creates a JSON nested file of the style dictionary.
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```json
   * {
   *   "color": {
   *     "base": {
   *        "red": "#ff0000"
   *     }
   *   }
   * }
   * ```
   */
  'json/nested': function({dictionary}) {
    return JSON.stringify(minifyDictionary(dictionary.properties), null, 2);
  },

  /**
   * Creates a JSON flat file of the style dictionary.
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```json
   * {
   *   "color-base-red": "#ff0000"
   * }
   * ```
   */
  'json/flat': function({dictionary}) {
    return '{\n' + dictionary.allProperties.map(function(prop) {
        return `  "${prop.name}": ${JSON.stringify(prop.value)}`;
      }).join(',\n') + '\n}';
  },

  /**
   * Creates a sketchpalette file of all the base colors
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```json
   * {
   *   "compatibleVersion": "1.0",
   *   "pluginVersion": "1.1",
   *   "colors": [
   *     "#ffffff",
   *     "#ff0000",
   *     "#fcfcfc"
   *   ]
   * }
   * ```
   */
  'sketch/palette': function({dictionary}) {
    var to_ret = {
      'compatibleVersion':'1.0',
      'pluginVersion':'1.1'
    };
    to_ret.colors = _.chain(dictionary.allProperties)
      .filter(function(prop) {
        return prop.attributes.category === 'color' && prop.attributes.type === 'base';
      })
      .map(function(prop) {
        return prop.value;
      })
      .value();
    return JSON.stringify(to_ret, null, 2);
  },

  /**
   * Creates a sketchpalette file compatible with version 2 of
   * the sketchpalette plugin. To use this you should use the
   * 'color/sketch' transform to get the correct value for the colors.
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```json
   * {
   *   "compatibleVersion": "2.0",
   *   "pluginVersion": "2.2",
   *   "colors": [
   *     {name: "red", r: 1.0, g: 0.0, b: 0.0, a: 1.0},
   *     {name: "green", r: 0.0, g: 1.0, b: 0.0, a: 1.0},
   *     {name: "blue", r: 0.0, g: 0.0, b: 1.0, a: 1.0}
   *   ]
   * }
   * ```
   */
  'sketch/palette/v2': function({dictionary}) {
    var to_ret = {
      compatibleVersion: '2.0',
      pluginVersion: '2.2',
      colors: dictionary.allProperties.map(function(prop) {
        // Merging the token's value, which should be an object with r,g,b,a channels
        return Object.assign({
          name: prop.name
        }, prop.value)
      })
    };
    return JSON.stringify(to_ret, null, 2);
  },


  // Flutter templates
  /**
   *  Creates a Dart implementation file of a class with values
   *
   * @memberof Formats
   * @kind member
   * @param {Object} options
   * @param {Boolean} [options.showFileHeader=true] - Whether or not to include a comment that has the build date
   * @param {Boolean} [options.outputReferences=false] - Whether or not to keep [references](/#/formats?id=references-in-output-files) (a -> b -> c) in the output.
   * @example
   * ```dart
   * import 'package:flutter/material.dart';
   *
   * class StyleDictionary {
   *   StyleDictionary._();
   *
   *     static const colorBrandPrimary = Color(0x00ff5fff);
   *     static const sizeFontSizeMedium = 16.00;
   *     static const contentFontFamily1 = "NewJune";
   * ```
   */
  'flutter/class.dart': function({dictionary, options, file}) {
    const template = _.template(
      fs.readFileSync(__dirname + '/templates/flutter/class.dart.template')
    );
    return template({dictionary, file, options});
  },
};

// Mark which formats are nested
module.exports['json/nested'].nested = true;
module.exports['javascript/module'].nested = true;
module.exports['javascript/object'].nested = true;