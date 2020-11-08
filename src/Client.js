'use strict';

const got = require('got');
const EventEmitter = require('events');
/**
 * The client for Wikidot.
 * @extends {EventEmitter}
 */
class Client extends EventEmitter {
  /**
   * @param {ClientOptions} [options] Options for the client.
   */
  constructor(options={}) {
    super();
    this.authCookie = '';
    if (options.username && options.password) {
      this.login(options.username, options.password);
    };
  }

  /**
   * A Wikidot AJAX request.
   * @param  {String}  url    The url where the request is POSTed to
   * @param  {{}}  params The parameters passed to the request
   * @return {Promise<JSON>}        A response from the module connector
   */
  async req(url, params={}) {
      const wikidotToken7 = Math.random().toString(36).substring(4);
      return await got.post(url, {
        headers: {Cookie: `${this.authCookie}wikidot_token7=${wikidotToken7}`},
        form: Object.assign({wikidot_token7: wikidotToken7, callbackIndex: 0}, params)
      }).json();
  };

  /**
   * Logging in to Wikidot.
   * @param  {String} username Wikidot username
   * @param  {String} password Wikidot password
   */
  async login(username, password) {
    const wikidotToken7 = Math.random().toString(36).substring(4);
    var res = await got.post('https://www.wikidot.com/default--flow/login__LoginPopupScreen', {
      headers: {Cookie: `wikidot_token7=${wikidotToken7}`},
      form: {
				login: username,
				password: password,
				action: 'Login2Action',
				event: 'login',
        wikidot_token7: wikidotToken7,
        callbackIndex: 0
			}
		})
    if (res.body.includes("The login and password do not match.")) {throw new Error("The login and password do not match.")}
  	this.wdSessCookie = res.headers['set-cookie'][1].split("; ")[0]
    this.authCookie = `${this.wdSessCookie}; wikidot_udsession=1; `
    return this;
  }
}

module.exports = Client;
