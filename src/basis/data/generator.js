/*!
 * Basis javasript library 
 * http://code.google.com/p/basis-js/
 *
 * @copyright
 * Copyright (c) 2006-2010 Roman Dvornov.
 *
 * @license
 * GNU General Public License v2.0 <http://www.gnu.org/licenses/gpl-2.0.html>
 */

!function(basis){

 /**
  * @namespace basis.data.generator
  */ 
  
  var namespace = 'basis.data.generator';

  //
  // Main part
  //

  var words = (
               'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
               'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ' +
               'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ' +
               'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
              )
              .replace(/[^a-z]/gi, ' ')
              .trim()
              .split(/\s+/);

 /**
  * @func
  */
  function genNumber(precision, min, max){
    min = min || 0;
    max = max || 1;
    if (min > max) return genNumber(precision, max, min);
    return Number((min + Math.random() * (max - min)).toFixed(precision || 0));
  };

 /**
  * @func
  */
  function genString(minLen, maxLen){
    if (arguments.length < 1) minLen = 0;
    if (arguments.length < 2) maxLen = 16;
    if (minLen <= 0) minLen = 0;
    if (maxLen <= 1) maxLen = 1;
    var len = Math.floor(minLen + Math.random() * (maxLen - minLen));
    var result = '', base = ['a'.charCodeAt(), 'A'.charCodeAt()];
    for (var i = 0; i < len; i++)
      result += String.fromCharCode(Math.floor(Math.random() * 26) + base[Math.round(Math.random())]);
    return result;
  };

 /**
  * @func
  */
  function genSentence(wordCount){
    var result = [];
    var count = parseInt(wordCount);

    while (count--)
      result.push(words[Math.round(Math.random() * words.length)]);

    return result.join(' ');
  };


  //
  // export names
  //

  basis.namespace(namespace).extend({
    number: genNumber,
    string: genString,
    sentence: genSentence
  });

}(basis);