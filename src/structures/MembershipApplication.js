'use strict';

const User = require('./User');

class MembershipApplication {
  constructor(data) {
    this.text = data.text;
    this.user = new User(data.username);
    this.wiki = data.wiki;
  };

  /**
   * Accepting the application or not.
   * @param  {Boolean} [decision=true]  Accept or decline. Default true.
   * @param  {String}  [reason]     The reason for accept/decline, but is a dummy entry that will not actually be sent to the applicant. WTF wikidot?
   * @return {Promise<Boolean>}     Successful or not.
   */
  async accept(decision=true, reason='') {
    let res = await this.wiki.action("ManageSiteMembershipAction", {
      event: "acceptApplication",
      user_id: this.user.id,
      text: reason ? reason : "",
      type: decision ? "accept" : "decline",
    });
  };

  /**
   * Alias of accept, but with default decision false.
   * @param  {Boolean} [decision=false] Accept or decline. Default false.
   * @param  {String}  [reason]     The reason for accept/decline, but is a dummy entry that will not actually be sent to the applicant. WTF wikidot?
   * @return {Promise<Boolean>}     Successful or not.
   */
  async decline(decision=false, reason='') {
    return await this.accept(decision, reason);
  }
};

module.exports = MembershipApplication;
