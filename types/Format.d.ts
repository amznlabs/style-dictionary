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

import { Dictionary } from './Dictionary';
import { File } from './File';
import { Options } from './Options';
import { Platform } from './Platform';

export interface FormatterArguments {
  /**
   * The transformed and resolved dictionary object
   */
  dictionary: Dictionary;
  /**
   * The file configuration the format is called in
   */
  file: File;
  /**
   * The options object,
   */
  options: Options;
  /**
   * The platform configuration the format is called in
   */
  platform: Platform;
}

/**
 * The formatter function receives positional arguments and it should return a
 * string, which will be written to a file.
 */
declare function formatter(dictionary: Dictionary, platform: Platform, file: File): string;
/**
 * The formatter function receives an overloaded object as its argument and
 * it should return a string, which will be written to a file.
 */
declare function formatter(arguments: FormatterArguments): string;

export type Formatter = typeof formatter;

export interface Format {
  formatter: Formatter;
}