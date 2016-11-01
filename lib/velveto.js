/**
 * @name velveto.js
 * @version 2.4.2
 * @update Nov 2, 2016
 * @website https://github.com/earthchie/Velveto.js
 * @author Earthchie http://www.earthchie.com/
 * @license WTFPL v.2 - http://www.wtfpl.net/
 **/

(function (window) {

    'use strict';

    var Velveto = window.Velveto || {},
        load,
        pushHistory;
    window.Velveto = Velveto;

    Velveto.initialized = false;
    Velveto.options = {
        container_id: 'velveto', // ID of container that Velveto will put the content inside.
        home: 'home', // default html file for homepage.
        html_directory: 'app/', // path to html pages.
        debug: false, // set to true to show console message to help you investigate the error.
        loading_indicator: 'Loading...', // html that injected while page is loading.
        history_max: 20 // max browsing history size
    };

    /* ==========================
     * Ajax Helpers
     * ========================== */
    Velveto.ajax = {
        x: [],

        abortAll: function () {
            var i;
            for (i in Velveto.ajax.x) {
                if (Object.prototype.hasOwnProperty.call(Velveto.ajax.x, i)) {
                    Velveto.ajax.x[i].abort();
                }
            }
        },

        xhr: function () {
            var a;
            for (a = 0; a < 4; a = a + 1) {
                try {
                    return a ? new ActiveXObject(['', 'Msxml2', 'Msxml3', 'Microsoft'][a] + '.XMLHTTP') : new XMLHttpRequest();
                } catch (e) {}
            }
        },

        sendRequest: function (verb, url, data, success, error) {

            data = data || null;
            var xhttp = new Velveto.ajax.xhr(),
                serialize = '',
                i;

            if (typeof data === 'object') {

                for (i in data) {
                    if (Object.prototype.hasOwnProperty.call(data, i)) {
                        serialize += '&' + i + '=' + data[i];
                    }
                }
                data = serialize.substring(1);
            }

            xhttp.onreadystatechange = function () {

                if (xhttp.readyState === 4) {
                    var i;
                    for (i in Velveto.ajax.x) {
                        if (Velveto.ajax.x[i] === xhttp) {
                            Velveto.ajax.x.splice(i, 1);
                            break;
                        }
                    }

                    if (xhttp.status === 200) {
                        if (typeof success === 'function') {
                            success(xhttp.responseText);
                        }
                    } else {
                        if (typeof error === 'function') {
                            error(xhttp);
                        }
                    }
                }
            };

            xhttp.open(verb.toString().toUpperCase(), url, true);
            xhttp.send(data);

            Velveto.ajax.x.push(xhttp);

        },

        GET: function (url, success, error) {

            if (url.indexOf('?') > -1) {
                url += '&';
            } else {
                url += '?';
            }
            
            if (Velveto.options.debug) {
                url += 'nonce=' + (new Date()).getTime();
            }

            Velveto.ajax.sendRequest('GET', url, null, success, error);
        },

        POST: function (options, success, error) {
            Velveto.ajax.sendRequest('POST', options.url || options, options.data || null, success, error);
        },

        executeScript: function (url, callback) {
            Velveto.ajax.GET(url, function (script) {
                eval(script);

                if (typeof callback === 'function') {
                    callback();
                }

            });
        }

    };

    /* ==========================
     * End - Ajax Helpers
     * ========================== */

    /* ==========================
     * Session Helpers
     * ========================== */
    Velveto.session = {
        get: function (session) {
            if (localStorage) {
                return localStorage.getItem(session + '@' + Velveto.getBaseURL()) || '';
            } else {
                if (typeof Velveto.tmp === 'undefined') {
                    return '';
                }
                return Velveto.tmp[session] || '';
            }
        },

        set: function (session, value) {
            if (localStorage) {
                localStorage.setItem(session + '@' + Velveto.getBaseURL(), value);
            } else {
                if (typeof Velveto.tmp === 'undefined') {
                    Velveto.tmp = [];
                }
                Velveto.tmp[session] = value;
            }
        },

        remove: function (session) {
            if (localStorage) {
                localStorage.removeItem(session + '@' + Velveto.getBaseURL());
            } else {
                if (typeof Velveto.tmp !== 'undefined') {
                    delete Velveto.tmp[session];
                }
            }
        }
    };

    /* ==========================
     * End - Session Helpers
     * ========================== */

    /* ==========================
     * Utilities
     * ========================== */

    /*
     * name: extend
     * desc: merge two object together. like jQuery.extend().
     * params: defaults - first object
     *         options - second object
     * return: merged object.
     */
    Velveto.extend = function (defaults, options) {
        var extended = {},
            prop;
        for (prop in defaults) {
            if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
                extended[prop] = defaults[prop];
            }
        }
        for (prop in options) {
            if (Object.prototype.hasOwnProperty.call(options, prop)) {
                extended[prop] = options[prop];
            }
        }
        return extended;
    };

    /*
     * name: importDocument
     * desc: import document by ajax html from url to given element.
     *       also execute attached script too.
     *       This method fire multiple events in following order:
     *       1. unload - right after function called.
     *       2. beforeLoad - after loading indicator shows up, but before ajax.
     *       3. beforeScriptLoad - before load additional scripts attached to document.
     *       4. scriptLoaded - right after every script loaded and executed.
     *       5. loaded - fire after document import successfully
     *       6. loadFail - in case of ajax fail, this event will fire after beforeScriptLoad, all remaining events will not be fired.
     * params: url - url of document
     *         container - element of document container
     *         callback - executed when everything's done. Please note, this callback calls before fire loaded event.
     * return: void
     */
    Velveto.importDocument = function (url, container, callback) {

        Velveto.fireEvent(container, 'unload');

        var loading = container.getAttribute('data-loading-indicator') || Velveto.options.loading_indicator;
        container.innerHTML = loading;
        Velveto.fireEvent(container, 'beforeLoad');

        Velveto.ajax.GET(url, function (html) {
            container.innerHTML = html;

            var hook = function () {
                    // bind event to internal a tags
                    var a = document.getElementsByTagName('a'),
                        i,
                        id;
                    for (i = 0; i < a.length; i = i + 1) {

                        /* if...
                         * - on same directory
                         * - contains #!
                         * - not binded already
                         */
                        if (a[i].href.indexOf(Velveto.getBaseURL()) > -1 && a[i].href.indexOf('#!') > -1 && a[i].getAttribute('data-ajax') !== 'true') {

                            a[i].addEventListener('click', function (e) {

                                e.stopPropagation();
                                e.preventDefault();

                                this.setAttribute('data-ajax', 'true'); // mark as binded
                                var now = JSON.stringify(Velveto.getPathData(window.location.hash)),
                                    next = JSON.stringify(Velveto.getPathData(this.href));

                                if (now !== next) {
                                    Velveto.go(this.href);
                                }

                                return false;
                            });

                        }

                        // make smooth scroll for hash link
                        if (a[i].href.indexOf('#!') < 0 && a[i].href.indexOf('#') > -1 && a[i].getAttribute('data-smooth') !== 'false') {

                            a[i].addEventListener('click', function (e) {
                                e.preventDefault();
                                id = this.href.split('#').pop();
                                if (id !== '') {
                                    this.setAttribute('data-smooth', 'true'); // mark as binded
                                    var target = document.getElementById(id);
                                    Velveto.scrollTo(target);
                                }
                                return false;
                            });
                        }
                    }

                    // history
                    if (history !== false) {
                        pushHistory();
                    }

                    if (typeof callback === 'function') {
                        callback();
                    }

                    // fire loaded event to container
                    Velveto.fireEvent(container, 'loaded');

                },
                scripts = container.getElementsByTagName('script'),
                i = 0,
                executeScript;

            if (scripts.length > 0) {

                executeScript = function (script) {

                    if (typeof script !== 'undefined') {
                        var next_yet = false;

                        if (script.innerHTML) {
                            eval(script.innerHTML);
                        }

                        if (script.src) {
                            next_yet = true;
                            Velveto.ajax.executeScript(script.src, function () {
                                i = i + 1;
                                executeScript(scripts[i]);
                            });
                        }

                        if (!next_yet) {
                            i = i + 1;
                            executeScript(scripts[i]);
                        }

                    } else {
                        Velveto.fireEvent(container, 'scriptLoaded');
                        hook();
                    }
                };

                Velveto.fireEvent(container, 'beforeScriptLoad');
                executeScript(scripts[i]);

            } else {
                Velveto.fireEvent(container, 'beforeLoadScript');
                Velveto.fireEvent(container, 'afterLoadScript');
                hook();
            }

        }, function () {
            if (Velveto.options.debug) {
                console.error('ERROR - fail to import document. URL: ' + url + ' was not found.');
            }
            // fire loadFail event to container
            Velveto.fireEvent(container, 'loadFail');
        });
    };
    
    /*
     * name: iObject (intelligence object)
     * desc: has 3 modes
     *       1. clone - clone given object. requires obj only.
     *       2. access - get value of given keyset. requires obj, key.
     *       3. assign - assign value to given keyset.requires obj, key and val
     * params: obj - object to be manipulated
     *         key - key of the object separated with dot notation (brackets also supported)
     *         val - value to be assigned to given object.
     * return: Object obj
     */
    Velveto.iObject = function (obj, key, val) {
        
        var clone = function () {
                return JSON.parse(JSON.stringify(obj));
            },
        
            access = function (obj, key) {

                key = key.replace(/\[(\w+)\]/g, '.$1').split('.');
                while (key.length > 0) {
                    obj = obj[key.shift()];
                }
                return obj;

            },
        
            assign = function (obj, key, val) {

                var data = clone(obj),
                    // http://stackoverflow.com/a/2061827
                    setData = function (key, val, obj) {
                        if (!obj) {
                            obj = data; //outside (non-recursive) call, use "data" as our base object
                        }
                        var ka = key.replace(/\[(\w+)\]/g, '.$1').split(/\./); //split the key by the dots
                        if (ka.length < 2) {
                            obj[ka[0]] = val; //only one part (no dots) in key, just set value
                        } else {
                            if (!obj[ka[0]]) {
                                obj[ka[0]] = {}; //create our "new" base obj if it doesn't exist
                            }
                            obj = obj[ka.shift()]; //remove the new "base" obj from string array, and hold actual object for recursive call
                            setData(ka.join("."), val, obj); //join the remaining parts back up with dots, and recursively set data on our new "base" obj
                        }
                    };
                setData(key, val);

                return data;
            };
        
        
        if (val === undefined) {
            return access(obj, key);
        } else if (key === undefined) {
            return clone(obj);
        } else {
            return assign(obj, key, val);
        }
    };
    
    /*
     * name: template
     * desc: map data to mustache-style variables
     * params: dom - as String or DOM Node.
     *         obj - data to be mapped
     * return: If dom is String, will return String of mapped data. If dom is DOM Node will has no return (void), because data are rendered to dom already.
     */
    Velveto.template = function (dom, obj) {

        if (typeof obj === 'array') {
            obj = obj.reduce(function (o, v, i) {
                o[i] = v;
                return o;
            }, {});
        }

        var html = '',
            found,
            temp;

        if (typeof dom === 'string') {
            html = dom;
        }

        if (dom.nodeType === 1) {
            html = dom.innerHTML;
        }

        found = (html.match(/\{\{(.*?)\}\}/g) || []).map(function (item) {
            return item.replace(/\{|\}/g, '');
        }) || [];

        found.map(function (field) {
            temp = field.split('||');
            temp[1] = temp[1] || '';
            html = html.replace(new RegExp('{{' + field.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') + '}}', 'g'), (Velveto.iObject(obj, temp[0]) || temp[1]));
        });

        if (typeof dom === 'string') {
            return html;
        }

        if (dom.nodeType === 1) {
            dom.innerHTML = html;
        }
    };

    /* ==========================
     * End - Utilities
     * ========================== */

    /* ==========================
     * Private Methods
     * ========================== */

    /*
     * name: load
     * desc: import document corresponding to hashbang parameters
     * params: filename (String), history (boolean)
     * return: void
     */
    load = function (filename, history) {

        Velveto.ajax.abortAll();

        setTimeout(function () { // wait 10ms, to make sure all active ajax is aborted.
            var container = document.getElementById(Velveto.options.container_id);
            if (container) {
                Velveto.importDocument(Velveto.options.html_directory + filename + '.html', container);
            } else if (Velveto.options.debug) {
                console.error('ERROR - Element with id = ' + Velveto.options.container_id + ' is not found.');
            }
        }, 10);

    };

    /*
     * name: pushHistory
     * desc: insert new history records.
     * params:
     * return: void
     */
    pushHistory = function () {
        var history = Velveto.history();
        if (history.length === 0 || history[history.length - 1] !== window.location.hash) {

            if (history.length >= Velveto.options.history_max) {
                history = history.slice((Velveto.options.history_max - 1) * -1);
            }

            history.push(window.location.hash);
            Velveto.session.set('Velveto', history.join(' || '));
        }
    };

    /* end Private Methods */

    /* ==========================
     * Public Methods
     * ========================== */

    /*
     * name: fireEvent
     * desc: fire given event
     * params: dom (DOM Object), event (String)
     * return: void
     */
    Velveto.fireEvent = function (dom, event) {
        var evt;
        if (document.createEventNodeList) {
            evt = document.createEventNodeList();
            dom.fireEvent(event, evt);
        } else {
            evt = document.createEvent("HTMLEvents");
            evt.initEvent(event, true, true);
            dom.dispatchEvent(evt);
        }
    };

    /*
     * name: back
     * desc: go back to previous page (if possible)
     * params:
     * return: void
     */
    Velveto.back = function () {
        if (Velveto.isBackable()) {
            var history = Velveto.history();
            history.pop(); // current
            Velveto.go(history.pop()); // previous url
            Velveto.session.set('Velveto', history.join(' || '));
        }
    };

    /*
     * name: goBackOrGoHome
     * desc: go back if possible, else go to home
     * params:
     * return: void
     */
    Velveto.goBackOrGoHome = function () {
        if (Velveto.isBackable()) {
            Velveto.back();
        } else {
            Velveto.go(Velveto.options.home);
        }
    };

    /*
     * name: goBackOrGoTo
     * desc: go back if possible, else go to given location
     * params:
     * return: void
     */
    Velveto.goBackOrGoTo = function (location) {
        if (Velveto.isBackable()) {
            Velveto.back();
        } else {
            Velveto.go(location);
        }
    };

    /*
     * name: clearHistory
     * desc: clear browsing history
     * params:
     * return: void
     */
    Velveto.clearHistory = function () {
        Velveto.session.set('Velveto', '');
    };

    /*
     * name: getBaseURL
     * desc: get base url of this project. a.k.a. project directory.
     * params:
     * return: void
     */
    Velveto.getBaseURL = function () {
        return window.location.origin + window.location.pathname;
    };

    /*
     * name: getPath
     * desc: get virtual path (everything after hashbang).
     * params:
     * return: void
     */
    Velveto.getPath = function () {
        return window.location.hash.replace('#!', '');
    };

    /*
     * name: getPathData
     * desc: parse path.
     * params: path (String)
     * return: path data (Object)
     */
    Velveto.getPathData = function (path) {
        var data = {},
            temp,
            params = {},
            query,
            i;

        if (!path) { // use current url
            path = window.location.hash;
        }

        path = decodeURI(path.replace(Velveto.getBaseURL(), '').replace('#!', ''));

        // split raw url as path and params
        if (path.indexOf('?') > -1) {
            path = path.split('?');
            data.path = path[0];
            data.params = path[1];
        } else {
            data.path = path;
            data.params = "";
        }

        // prepare directory - remove / at first and last
        path = data.path;
        if (path.charAt(0) === '/') {
            path = path.substring(1);
        }
        if (path.charAt(path.length - 1) === '/') {
            path = path.slice(0, -1);
        }
        data.dir = path.split('/');

        // prepare path - put / in front, and after - if file extension not found.
        if (data.path.charAt(0) !== '/') {
            data.path = '/' + data.path;
        }
        if (data.path.indexOf('.') === -1) {
            if (data.path.charAt(data.path.length - 1) !== '/') {
                data.path += '/';
            }
        } else {
            if (data.path.charAt(data.path.length - 1) === '/') {
                data.path = data.path.slice(0, -1);
            }
        }

        // prepare parameters - make it became object
        if (data.params === "") {
            data.params = {};
        } else {
            temp = data.params.split('&');

            for (i in temp) {
                if (Object.prototype.hasOwnProperty.call(temp, i)) {
                    if (temp[i].indexOf('=') === -1) {
                        params[temp[i]] = '';
                    } else {
                        query = temp[i].split('=');
                        params[query[0]] = query[1];
                    }
                }
            }

            data.params = params;
        }

        return data;
    };

    /*
     * name: data
     * desc: get data from path
     * params: path (String)
     * return: data (Object), in order. E.g. #!/page/a/b/c/ will yield ['a','b','c'].
     */
    Velveto.data = function (path) {
        var pathData = Velveto.getPathData(path),
            params = pathData.params,
            data = pathData.dir,
            i;
        data.shift();
        for (i in data) {
            if (Object.prototype.hasOwnProperty.call(data, i)) {
                params[i] = data[i];
            }
        }
        return params;
    };

    /*
     * name: go
     * desc: navigate to given path. If set history to false, this action won't be recorded in browsing history.
     * params: path (String), history (boolean)
     * return: void
     */
    Velveto.go = function (path, history, updatePath) {
        var data = this.getPathData(path);

        if (updatePath !== false) {
            this.setPathData(data.dir, data.params);
        }

        load(data.dir[0], history);
    };
    Velveto.goTo = Velveto.go; // backward compatibility

    /*
     * name: history
     * desc: get browsing history list
     * params:
     * return: browsing history (Array of String)
     */
    Velveto.history = function () {
        if (Velveto.session.get('Velveto')) {
            return Velveto.session.get('Velveto').split(' || ');
        } else {
            return [];
        }
    };

    /*
     * name: isBackable
     * desc: check if back() is available.
     * params:
     * return: result (boolean)
     */
    Velveto.isBackable = function () {
        return (Velveto.history().length > 2);
    };

    /*
     * name: refresh
     * desc: refresh page
     * params:
     * return: void
     */
    Velveto.refresh = function () {
        Velveto.go(window.location.hash, false, false);
    };

    /*
     * name: scrollTo
     * desc: scroll page to given element
     * params: to (DOM Object), duration (number <milliseconds>)
     * return: void
     */
    Velveto.scrollTo = function (to, duration) {
        if (to !== null && typeof to.offsetTop === 'number') {
            if (duration === undefined) {
                duration = 250;
            }
            to = to.offsetTop;
            var start = new Date().getTime(),
                from = window.scrollY,
                timer = setInterval(function () {
                    var step = Math.min(1, (new Date().getTime() - start) / duration);
                    document.body.scrollTop = (from + step * (to - from));
                    if (step === 1) {
                        clearInterval(timer);
                    }
                }, 25);
            document.body.scrollTop = from;
        }
    };

    /*
     * name: setPathData
     * desc: override path in the url bar
     * params: dir (String), params (Data Object)
     * return: void
     */
    Velveto.setPathData = function (dir, params) {

        var query = '?',
            path = '',
            hash = '',
            i;

        if (dir) {
            path = '/' + dir.join('/');
            if (path.indexOf('.') === -1) {
                path += '/'; // make sure path always has / at the end
            }
        }
        if (params) {

            for (i in params) {
                if (Object.prototype.hasOwnProperty.call(params, i)) {
                    if (params[i]) {
                        query += i + '=' + params[i] + '&';
                    } else {
                        query += i + '&';
                    }
                }
            }
        }
        query = query.slice(0, -1);
        if (!path || path === '//') {
            path = '';
            query = query.substring(1); // remove ?
        }

        hash = '#!' + path + query;
        if (window.location.hash + '/' === hash) {
            history.replaceState(Velveto.getBaseURL(), '', Velveto.getBaseURL() + hash);
        } else {
            history.pushState(Velveto.getBaseURL(), '', Velveto.getBaseURL() + hash);
        }
    };


    /* ==========================
     * Initiator
     * ========================== */

    Velveto.init = function (options) {

        if (Velveto.initialized) {

            if (Velveto.options.debug) {
                console.warn('NOTICE - Velveto is already initiated.');
            }

        } else {

            Velveto.initialized = true;
            Velveto.options = Velveto.extend(Velveto.options, options || {});

            // ie fix
            if (!window.location.origin) {
                window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
            }

            // set default page
            if (window.location.hash === '') {
                var query = window.location.href.replace(Velveto.getBaseURL(), '');
                Velveto.go(Velveto.options.home + query);
            } else {
                Velveto.go(window.location.hash);
            }

            // bind event to browser's back button
            window.addEventListener('hashchange', function (e) {
                Velveto.go(window.location.hash);
            });

        }
    };

    /* ==========================
     * End - Initiator
     * ========================== */
}(window));