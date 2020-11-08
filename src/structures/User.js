'use strict';

const {normalize,isNormal} = require('../Util');

/**
 * Represents a member of a wiki.
 * @extends User
 */
class User {
  /**
   * @param {String} name Name of user, displayName or unixname are both applicable
   * @param {String} [id]  ID of user
   */
  constructor(name, id='') {
    /**
     * The ID by which Wikidot identifies the user.
     * @type {String}
     */
    this.id = null;
    if (id) {
      this.id=id;
    }
    if (isNormal(name)) {
      this.displayName = null;
      this.unixname = unixname;
    } else {
      this.displayName = name;
      this.unixname = normalize(name);
    }
  }
};

module.exports = User;
