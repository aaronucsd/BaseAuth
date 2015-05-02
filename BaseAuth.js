/**
 * @module BaseAuth
 * Simple authentication services for login/logout <br />
 *
 * company.services.auth or easy access with BaseAuth <br />
 * Requirements:  Jquery
 *
 * //1) To authenticate on login <br />
 * 		window.company.services.BaseAuth.login() <br />
 * //2) To authenticate on logout <br />
 * 		window.company.services.BaseAuth.logout() <br />
 *
 * //3) To authenticate only <br />
 * 		window.company.services.BaseAuth.isAuthenticated() <br />
 *
 * //4) To getToken  <br />
 * 		var token = window.company.services.BaseAuth.getToken() <br />
 *
 * @desc can change 'company' to your domain name
 */

(function(ctx){// MODULE DESIGN PATTERN

    ctx.services = ctx.services || {};
    /**
     * @lends module: BaseAuth
     */
    ctx.services.BaseAuth = ctx.services.BaseAuth || function(){

        return {
          /**
           * @type {Object}
           * @description custom default options, can be extended.
           */
           options: {
             /**
              * @type {String|URL}
              * @description Your backend server URL to do authentication from.
              */
              serverUrl: "http://localhost:8081",
              /**
               * @type {String|URL}
               * @description Your backend server URL to do authentication from.
               */
              loginUrl: "/api/auth/login",
               /**
                * @type {String|URL}
                * @description Your backend server URL to do authentication from.
                */
              logoutUrl: "/api/auth/logout"
           },
          /**
           * @type {String}
           * @description Token coming back from the server
           */
           token: undefined,
          /**
           * @type {Boolean}
           * @description Check user session is authenticated or not. Default to false.
           */
           isAuth: false,
            /**
             *
             * @param {Object} opt Options to override the default property
             * @method
             */
              init: function (opt) {
                $.extend(this.options, options);//override options
              },
            /**
             *
             * @description reset all headers injection from subsequent Ajax call
             * @example
             *      Auth.resetHeaders();
             *      $.ajax("http://something"); <-- won't have any headers pre-set
             */
            resetHeaders: function () {
                $.ajaxSetup({
                    headers: {}
                });
            },
            /**
             * @description remove any token in user's sessionStorage
             */
            resetSession: function () {
                if (sessionStorage !== undefined) {//remove from storage and set auth=false
                    sessionStorage.removeItem("x-auth-token");
                }
                this.isAuth = false;
                this.token = undefined;
            },
            /**
             * @description inject the token as header on all subsequent ajax call
             *              this method will be automatically invoke on successful login
             */
            setHeaders: function () {
                var parent = this;
                $.ajaxSetup({
                    headers: {//Save token into the header
                        "X-AUTH-TOKEN": this.token
                    }
                });
                // make sure user get redirected when login is expired
                $(document).ajaxComplete(function (event, xhr, settings) {
                    var data = xhr.responseJSON || xhr.responseText;

                    if (typeof (data) === "object" || xhr.status === 0) {
                        if ((data.hasOwnProperty("status") && data.status === 401) || xhr.status === 0) {
                            parent.resetHeaders();
                            parent.resetSession();
                            // this mean unauthorized, go back to login page
                            window.location.href = $Constants.CONTEXT_PATH;
                        }
                    }
                });
            },
            /**
             * @description pick up any session stored on sessionStorage, this allow
             *          multi spa to share same authentication token.
             */
            setSession: function () {
                // also need to keep this in sessionStorage or html5 web storage
            	//sessionstorage for now
                if (sessionStorage !== undefined &&
                    typeof this.token !== "undefined") {//Create if now in sessionStorage yet, and set auth=true
                    sessionStorage.setItem("x-auth-token", this.token);
                    this.isAuth = true;
                }
            },
            /**
             *
             * @description Login into the system which also involves adding the correct
             *      token into user's sessionStorage (on successful login)
             * @param {String} username Username to login to the system
             * @param {String} password Password
             * @param {String} hostUrl (Optional) to give different server authentication URL
             * @returns {jQuery.Deferred} It will gives back deferred object in which can be
             *          chain with any .done or .fail callback
             *
             * @example
             *
                             window.company.services.BaseAuth
                                .login({
                                    username: "longh",
                                    password: "password"
                                })
                                .done(function (response) {
                                    //OK
                                })
                                .fail(function (response) {
                                    //FAILED
                                });
             */
            login: function (data, hostUrl) {
                var parent = this;
                if (hostUrl !== undefined) {
                  this.options.serverUrl = hostUrl;
                }
                if (data === undefined) {
                    data = {};
                }

                // sending for login
                var deferred = new jQuery.Deferred();

                $.ajax({
                    type: "POST",//Access-Control-Request-Method:
                    url: this.options.serverUrl + this.options.loginUrl,
                    data: data,//
                    headers: {},//Access-Control-Request-Headers:
                    processData: true
                }).done(function (response) {
                    // extract json w/ token (JWT) from response
                    if (response.hasOwnProperty("token")) {
                        parent.token = response.token;
                    }
                    console.log('setting up headers...');
                    // setup the on next upcoming access with correct header
                    parent.setHeaders();//set token to header
                    parent.setSession();//save token to sessionStorage and set auth to true
                    deferred.resolve(true);
                }).fail(function (response) {
                    deferred.reject(response.responseJSON || response.responseText);
                }).always(function () {
                    //something
                });

                /* UNCOMMENT TO TEST - COMMENT ALL $ajax above to
                this.token = "eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9";
                parent.setHeaders();//set token to header
                parent.setSession();//save token to sessionStorage and set auth to true
                debugger;//check   the SessionStorage on chrome debugger => Resource => Session Storage
                 */
                return deferred.promise();
            },
            /**
             * @description Logout completely from the system and remove any token in
             *      sessionStorage
             * @param {URL} hostUrl (Optional)
             * @returns {jQuery.Deferred}
             *
             * @example
                  window.company.services.BaseAuth.logout();
             */
            logout: function (hostUrl) {
                var parent = this;
                if (hostUrl !== undefined) {
                  this.options.serverUrl = hostUrl;
                }
                // do another query
                var deferred = new jQuery.Deferred();
                $.ajax({
                    type: "GET",//Access-Control-Request-Method:
                    url: this.options.serverUrl + this.options.loginOutUrl,
                    processData: true,
                }).done(function (resp) {
                    console.log('logout success...');
                    parent.resetHeaders();
                    parent.resetSession();
                    deferred.resolve();
                }).fail(function (resp) {
                    console.log('logout fail...');
                    // should clear the session on unauthorized status code 401
                    if (resp && resp.status === 401) {
                        // 401 -- also means the token is invalid
                        parent.resetHeaders();//clear token from header
                        parent.resetSession();//clean the session
                    }
                    deferred.reject(resp.responseJSON || resp.responseText);
                });


                /* UNCOMMENT TO TEST - COMMENT ALL $ajax above to
                  parent.resetHeaders();//clear token from header
                  parent.resetSession();//clean the session
                  debugger;//check   the SessionStorage on chrome debugger => Resource => Session Storage
                  */
                return deferred;
            },
            /**
             * @description Checks whether current user session has been authenticated or not
             *              by checking the existence of user token.
             * @returns {Boolean}
             *
             * @example
             *
             *
                //If not authenticated route to login page
                if (!BaseAuth.isAuthenticated()) {
                    window.location.href = this.loginUrl;
                    return false;
                }
             */
            isAuthenticated: function () {
                if (!this.authenticated && sessionStorage !== undefined &&
                    sessionStorage.getItem("x-auth-token") !== null) {
                	  //retrieve token from sessionStorage and add into header
                    this.token = sessionStorage.getItem("x-auth-token");
                    this.setHeaders();
                    // temporary make it authenticated, any subsequent ajax request
                    // will re-validate for the token
                    this.isAuth = true;
                }
                return this.isAuth;
            },
            /**
             * @description Returns current user token
             * @returns {String}
             */
            getToken: function () {
                return this.token;
            }
          };
      };

})(window.company = window.company || {});

////UNCOMMENT BELOW TO TEST: for global access from window, and namespace access
var oneAuth = new window.company.services.BaseAuth({
     serverUrl: "http://localhost:8081"
   });

console.log(oneAuth.isAuthenticated());
console.log(oneAuth.getToken());

console.log(oneAuth.login({username: "longh",password: "password"});//mock login
console.log(oneAuth.isAuthenticated());
console.log(oneAuth.getToken());

//console.log(oneAuth.logout());//mock logout
//console.log(oneAuth.isAuthenticated());
//console.log(oneAuth.getToken());
