'use strict';

/**
 * normalize a string into a wikidot-compatible string.
 * @param  {String} src Source string to normalize
 * @return {String}     normalize result
 */
function normalize(src) {
  this.NON_URL = /([^\w:/\-]+|-{2,})/g;
  this.MULTIPLE_COLONS = /:{2,}/g;
  this.START_DASHES = /(?P<body>^|\/+)(-+)/g;
  this.END_DASHES = /(-+)(?P<body>$|\/+)/g;
  this.MULTIPLE_SLASHES = /\/{2,}/g;
  this.END_SLASHES = /\/+$/g;
  let name = src.toLowerCase();

  // Squash multiple colons
  if (this.MULTIPLE_COLONS.test(name)) {
    name.match(this.MULTIPLE_COLONS).forEach((item) => {
      name.replace(item, ":")
    });
  };

  // Convert non-URL characters to dashes
  if (this.NON_URL.test(name)) {
    name.match(this.NON_URL).forEach((item) => {
      name.replace(item, "-")
    });
  };

  if (this.START_DASHES.test(name)) {
    [...name.matchAll(this.START_DASHES)].forEach((item) => {
      name.replace(item, item.group.body)
    });
  };

  if (this.END_DASHES.test(name)) {
    [...name.matchAll(this.END_DASHES)].reverse().forEach((item) => {
      let start = name.lastIndexOf(item);
      name = name.substring(0,start)+item.groups.body+name.substring(start+item.length);
    });
  };

  // Squash multiple slashes
  if (this.MULTIPLE_SLASHES.test(name)) {
    name.match(this.MULTIPLE_SLASHES).forEach((item) => {
      name.replace(item, "/")
    });
  };

  // Remove trailing slashes, unless it's just '/'
  if (name.length>1 && this.END_SLASHES.test(name)) {
    name.match(this.END_SLASHES).reverse().forEach((item) => {
      let start = name.lastIndexOf(item);
      name = name.substring(0,start)+name.substring(start+item.length);
    });
  };

  return name;
}

/**
 * Checks if a string is wikidot-normalized.
 * @param  {String}  name  Name to check
 * @param  {Boolean}  slash Accepting forward slashes or not
 * @return {Boolean} Normal or not
 */
function isNormal(name, slash) {
  this.NON_URL = /([^\w:/\-]+|-{2,})/g;
  this.MULTIPLE_COLONS = /:{2,}/g;
  this.START_DASHES = /(^|\/+)(?P<dash>-+)/g;
  this.END_DASHES = /(?P<dash>-+)($|\/+)/g;
  this.MULTIPLE_SLASHES = /\/{2,}/g;
  this.END_SLASHES = /\/+$/g;
  this.IS_VALID_CHAR = slash ? /[^a-z:-_\/]/g : /[^a-z:-_]/g

  if (this.IS_VALID_CHAR.test(name)) {
    return false;
  }

  if (this.NON_URL.test(name)) {
    return false;
  }

  if (this.MULTIPLE_COLONS.test(name)) {
    return false;
  }

  if (this.START_DASHES.test(name)) {
    return false;
  }

  if (this.END_DASHES.test(name)) {
    return false;
  }

  if (this.MULTIPLE_SLASHES.test(name)) {
    return false;
  }

  if (name.length>1 && this.END_SLASHES.test(name)) {
    return false;
  }

  return true;
}

module.exports = {
  normalize: normalize,
  isNormal: isNormal,
}
