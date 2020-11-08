'use strict';

const User = require('./User');

/**
 * Represents a member of a wiki.
 * @extends User
 */
class WikiMember extends User {
  constructor(unixname, wiki) {
    super(unixname);
    this.wiki = wiki;
    this.role = null;
  }
};

module.exports = WikiMember;
