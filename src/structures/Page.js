'use strict';

const got = require('got');
const cheerio = require('cheerio');
const path = require('path');
const Wiki = require('./Wiki');
const User = require('./User');
const WikiMember = require('./WikiMember');
/**
 * A Wikidot wiki page.
 */
class Page {
  /**
   * @param {Wiki} wiki The wiki that the page belong to
   * @param {String} unixname The page unix name
   */
  constructor(wiki, unixname) {
    /**
     * The Wiki that the page belong to.
     * @type {Wiki}
     */
    this.wiki = wiki;
    /**
     * The page unix name
     * @type {String}
     */
    this.unixname = unixname;
    this.getPageId().then(pid=>{
      /**
       * The page ID.
       * @type {String}
       */
      this.page_id=pid;
    });

    /**
     * The page author.
     * @type {User}
     */
    this.author = null;
    /**
     * The page creator. Only available when the author is still a member of the wiki.
     * @type {WikiMember}
     */
    this.creator = null;

    /**
     * Contributors to the page.
     * @type {Array<User>}
     */
    this.contributors = null;

    /**
     * Parent page of this page. May be Null.
     * @type {Page}
     */
    this.parent = null;

    /**
     * Whether the page is deleted.
     * @type {Boolean}
     */
    this.deleted = null;

    /**
     * Whether the page is locked.
     * @type {Boolean}
     */
    this.locked = null;

    this.getSource().then(source=>{
      /**
       * The page source.
       * @type {String}
       */
      this.source = source;
    })

    this.getTags().then(tags=>{
      /**
       * The page tags.
       * @type {Array<String>}
       */
      this.tags = tags;
    })
  };

  /**
   * Retrieves the page ID of the page.
   * @return {Promise<String>} Page ID
   */
  async getPageId() {
    let pg = await got.get(path.join(this.wiki.baseURL,this.unixname)).text();
  	pg = cheerio.load(pg);
  	let page_id = null;
  	pg(pg("head").children("script")
				.filter((i,el)=>pg(el).html().includes("WIKIREQUEST"))).html()
		    .replace(/WIKIREQUEST\.info\.pageId *?= *?(\d+);/g, (_, id)=>{
    			page_id = id;
    		})
    return page_id;
  }

  /**
   * Retrieves the page source. If no revision ID is given, the latest source is retrieved.
   * @param  {String}  [revision_id] The page revision ID wanted
   * @return {Promise<String>}               The page source
   */
  async getSource(revision_id) {
    if (revision_id) {
      return await this.wiki.module('history/PageSourceModule', {
        revision_id: revision_id
      });
    } else {
      return await this.wiki.module("viewsource/ViewSourceModule", Object.assign({page_id:page_id}, params));
    };
  };

  /**
   * Retrieves the page tags.
   * @return {Promise<Array<String>>} The page tags
   */
  async getTags() {
    let tags = await this.wiki.module("pagetags/PageTagsModule", { pageId: page_id });
    tags = cheerio.load(tags.body)(`input[id="page-tags-input"]`).attr("value").split(" ");
    return tags;
  }

  /**
   * Retrieves the page revision list.
   * @param  {{page?: Number, perpage?: Number, options?: String}}  params    Revision list filters
   * @return {Promise<Array<String>>}    An array of revision IDs
   */
  async getHistory(params) {
  	return await this.wiki.module("history/PageRevisionListModule", Object.assign({
  		page_id: page_id,
      page: 1,
      perpage: 20,
      options: `{"all":true}`
  	}, params))
  }

  /**
   * Edit the page.
   * @param  {{title?: String, source?: String, comments?: String, tags?: String}} params  The components of the edit.
   */
  async edit(params) {
    var lock = await this.wiki.module('edit/PageEditModule', {
            mode: 'page',
            wiki_page: this.unixname,
            force_lock: true});
    return await this.wiki.action("WikiPageAction", Object.assign({
      event: "savePage",
      wiki_page: wiki_page,
      lock_id: lock.lock_id,
      lock_secret: lock.lock_secret,
      revision_id: lock.page_revision_id||null,
    },params));
  };

  /**
   * Edit page tags
   * @param  {String|Array<String>}  params [description]
   * @return {Promise}        [description]
   */
  async editTags(params) {
    let tags = [];
    if (typeof params === "string") {
      tags = params.split(" ");
    } else if (params instanceof Array) {
      tags = params;
    } else if (params instanceof Object) {
      tags = await this.getTags();
      params.add = params.add instanceof Array ? params.add : (typeof params.add === "string" ? params.add.split(" ") : null)
      params.remove = params.remove instanceof Array ? params.remove : (typeof params.remove === "string" ? params.remove.split(" ") : null)
      tags = params.add ? tags.concat(params.add.filter(v=>!tags.includes(v))) : tags
      tags = params.remove ? tags.filter(v=>!params.remove.includes(v)) : tags
    }
    return await this.wiki.action('WikiPageAction', {
      event: 'saveTags',
      pageId: this.page_id,
      tags: tags.join(" "),
    })
  }

  /**
   * Delete the page completely.
   * @return {Promise<Boolean>}        Successful or not
   */
  async delete() {
    return await this.wiki.action('WikiPageAction', {
      event: 'deletePage',
      page_id: this.page_id,
    });
  }

  /**
   * Renaming the page.
   * @param  {String}  new_name The new unixname to rename to
   * @return {Promise<Boolean>}        Successful or not
   */
  async rename(new_name) {
    return await this.wiki.action('WikiPageAction', {
      event: 'renamePage',
      page_id: this.page_id,
      new_name: new_name,
    });
  }
}

module.exports = Page;
