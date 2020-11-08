'use strict';

const cheerio = require('cheerio');
const path = require('path');
const qs = require('querystring');
const Client = require('../Client');
const WikiMember = require('./WikiMember');
const MA = require('./MembershipApplication');
/**
 * A wikidot Wiki.
 */
class Wiki {
  /**
   * @param {String} baseURL The URL the wiki is at
   * @param {Client} [client]  The client that accessed this wiki
   */
  constructor(baseURL, client=new Client()) {
    this.baseURL = String(baseURL);
    this.client = client;
    /**
     * The role of client in this wiki. Possible value: NonMember, Member, Moderator, Administrator, Owner
     * @type {String}
     */
    this.clientRole = null;

    this.members = new Map();
    this.moderators = new Map();
    this.administrator = new Map();
    this.owner = null;
  };

  /**
   * Sends AJAX request to a Wikidot php module.
   * @param  {String}  moduleName The name of the module, in the convension 'xxx/yyy'
   * @param  {{}}  [params]     The parameters passed to the module
   * @return {Promise<JSON>}            A response from the module connector
   */
  async module(moduleName, params={}) {
    return await this.client.req(path.join(this.baseURL,'ajax-module-connector.php'), Object.assign({moduleName: moduleName},params))
  };

  /**
   * A Wikidot AJAX action.
   * @param  {String}  action The name of the action
   * @param  {{}}  [params] The parameters passed to the action
   * @return {Promise<JSON>}        A response from the module connector
   */
  async action(action, params={}) {
    return await this.client.req(path.join(this.baseURL,'ajax-module-connector.php'), Object.assign({action: action, moduleName: "Empty"},params))
  };

  /**
   * Using listPages on this wiki.
   * @param  {{}}  [params] The parameters passed to listPages
   * @return {Promise<String>}        The result.
   */
  async listPages(params={}) {
    return await this.module('list/ListPagesModule', Object.assign({
      category: ".",
      order: "created_at desc desc",
      perPage: 20,
      separate: "true",
      module_body: ``,
    }, params));
  }

  /**
   * Get list of members of wiki with specified role.
   * @param  {String}  [role] Select members of this role. Possible value: admins, moderators, members
   * @param  {{showSince?:Boolean,order?:String}} [filter] Filters applied to the list
   * @return {Promise<Map<String,WikiMember>>}      A map of members by their Wikidot ID
   */
  async getMembers(role=null, filter={}) {
    let res = await this.module("membership/MembersListModule", Object.assign({
      "group": role ? role : "members",
    },filter));
    let members = new Map();
    let $ = cheerio.load(res.body);
    $(`img.small`).each((i,elem)=>{
      let id = String(qs.parse($(elem).attr(src).split('?')[1]).userid);
      let name = $(elem).attr(alt);
      members.set(id, new WikiMember(name));
    });
    return members;
  }

  /**
   * Retrieves all the applications the wiki currently has.
   * @return {Promise<Map<String,MA>>} A map of all the applications by the applicant ID
   */
  async getApplications() {
    let users = new Map();
    let res = await this.module("managesite/ManageSiteMembersApplicationsModule");
    let $ = cheerio.load(res.body);
    $(`a.btn-primary[href="javascript:;"]`).each((i,elem)=>{
      let split = $(elem).attr('onclick').split(', ');
      users.set(split[1], new MA({
        user_id: split[1],
        username: split[2].substring(1,split[2].length-1),
        text: '',
      }));
    });
    return users;
  }
}

module.exports = Wiki;
