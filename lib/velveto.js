/**
 * @name velveto.js
 * @version 2.1.0
 * @update September 29, 2014
 * @website http://velveto.project.in.th/
 * @author Earthchie http://www.earthchie.com/
 * @license WTFPL v.2 - http://www.wtfpl.net/
 **/

(function (window) {

	'use strict';
	
	window.Velveto = window.Velveto || {};

	/* ==========================
	 * Ajax Helpers
	 * ========================== */
	Velveto.ajax = {
		x: [],

		abortAll: function () {
			for (var i in Velveto.ajax.x) {
				Velveto.ajax.x[i].abort();
			}
		},

		xhr: function () {
			for (a = 0; a < 4; a++) {
				try {
					return a ? new ActiveXObject([, "Msxml2", "Msxml3", "Microsoft"][a] + ".XMLHTTP") : new XMLHttpRequest
				} catch (e) {}
			}
		},

		sendRequest: function (verb, url, data, success, error) {

			data = data || null;

			if (typeof data == 'object') {
				var serialize = '';
				for (var i in data) {
					serialize += '&' + i + '=' + data[i];
				}
				data = serialize.substring(1);
			}

			var xhttp = new Velveto.ajax.xhr();

			xhttp.onreadystatechange = function () {

				if (xhttp.readyState == 4) {

					for (var i in Velveto.ajax.x) {
						if (Velveto.ajax.x[i] == xhttp) {
							Velveto.ajax.x.splice(i, 1);
							break;
						}
					}

					if (xhttp.status == 200) {
						if (typeof success == 'function') {
							success(xhttp.responseText);
						}
					} else {
						if (typeof error == 'function') {
							error(xhttp);
						}
					}
				}
			}

			xhttp.open(verb.toString().toUpperCase(), url, true);
			xhttp.send(data);

			Velveto.ajax.x.push(xhttp);

		},

		GET: function (url, success, error) {
			Velveto.ajax.sendRequest('GET', url, null, success, error);
		},

		HEAD: function (url, success, error) {
			Velveto.ajax.sendRequest('HEAD', url, null, success, error);
		},

		PURGE: function (url, success, error) {
			Velveto.ajax.sendRequest('PURGE', url, null, success, error);
		},

		COPY: function (url, success, error) {
			Velveto.ajax.sendRequest('COPY', url, null, success, error);
		},

		OPTIONS: function (url, success, error) {
			Velveto.ajax.sendRequest('OPTIONS', url, null, success, error);
		},

		POST: function (options, success, error) {
			Velveto.ajax.sendRequest('POST', options.url || options, options.data || null, success, error);
		},

		DELETE: function (options, success, error) {
			Velveto.ajax.sendRequest('DELETE', options.url || options, options.data || null, success, error);
		},

		PUT: function (options, success, error) {
			Velveto.ajax.sendRequest('PUT', options.url || options, options.data || null, success, error);
		},

		PATCH: function (options, success, error) {
			Velveto.ajax.sendRequest('PATCH', options.url || options, options.data || null, success, error);
		},

		LINK: function (options, success, error) {
			Velveto.ajax.sendRequest('LINK', options.url || options, options.data || null, success, error);
		},

		UNLINK: function (options, success, error) {
			Velveto.ajax.sendRequest('UNLINK', options.url || options, options.data || null, success, error);
		},

		executeScript: function (url) {
			Velveto.ajax.GET(url, eval);
		}

	}

	/* end - Ajax Helpers */

	/* ==========================
	 * Session Helpers
	 * ========================== */
	Velveto.session = {
		get: function (session) {
			if (localStorage) {
				return localStorage.getItem(session) || '';
			} else {
				return '';
			}
		},

		set: function (session, value) {
			if (localStorage) {
				localStorage.setItem(session, value);
			}
		},

		remove: function (session) {
			if (localStorage) {
				localStorage.removeItem(session);
			}
		}
	}

	/* end - Session Helpers */

	/* ==========================
	 * Private Methods
	 * ========================== */

	/*
	 * name: load
	 * desc: Fire beforeLoad event.
	 *		 Perform AJAX request (fetch /app/<filename>.html).
	 *		 Insert content into container.
	 *		 Update browsing history.
	 *		 Execute external scripts.
	 *		 Bind proper action to internal links.
	 *		 Fire onLoaded event.
	 * params: filename (String), history (boolean)
	 * return: void
	 */
	var load = function (filename, history) {
		Velveto.ajax.abortAll();

		setTimeout(function () { // wait 10ms, to make sure all active ajax is aborted.
			var body = document.getElementById('velveto');
			if (body) {

				// show loading indicator
				var loading = body.getAttribute('data-loading-indicator');
				// if not null and not false
				if (loading != null && loading != 'false' && loading != '0') {
					body.innerHTML = loading;
				}

				// fire beforeLoad event to #velveto
				Velveto.fireEvent(document.getElementById('velveto'), 'beforeLoad');

				// fetch content
				Velveto.ajax.get('app/' + filename + '.html', function (r) {

					// insert content to container
					body.innerHTML = r;

					// execute scripts
					var scripts = document.querySelectorAll('#velveto script');
					for (var i in scripts) {
						if (scripts[i].innerHTML) eval(scripts[i].innerHTML);
						if (scripts[i].src) Velveto.ajax.executeScript(scripts[i].src);
					}

					// bind event to internal a tags
					var a = document.getElementsByTagName('a');
					for (var i = 0; i < a.length; i++) {
						/* if...
						 * - on same directory
						 * - contains #!
						 * - not binded already
						 */
						if (a[i].href.indexOf(Velveto.getBaseURL()) > -1 && a[i].href.indexOf('#!') > -1 && a[i].getAttribute('data-ajax') === null) {

							a[i].setAttribute('data-ajax', 'true'); // mark as binded
							a[i].addEventListener('click', function (e) {
								e.stopPropagation();
								e.preventDefault();

								var now = JSON.stringify(Velveto.getPathData(window.location.hash));
								var next = JSON.stringify(Velveto.getPathData(this.href));

								if (now != next) {
									Velveto.goTo(this.href);
								}

								return false;
							});
						}

						// make smooth scroll for hash link
						if (a[i].href.indexOf('#!') < 0 && a[i].href.indexOf('#') > -1 && a[i].getAttribute('data-smooth') === null) {
							a[i].setAttribute('data-smooth', 'true'); // mark as binded
							a[i].addEventListener('click', function (e) {
								e.preventDefault();
								var target = document.getElementById(this.href.split('#').pop());
								Velveto.scrollTo(target);
								return false;
							});
						}
					}

					// fire loaded event to #velveto
					Velveto.fireEvent(document.getElementById('velveto'), 'loaded');

					// history
					if (history !== false) {
						pushHistory();
					}

				}, function () {
					// fire loadFail event to #velveto
					Velveto.fireEvent(document.getElementById('velveto'), 'loadFail');
				});
			} else {
				console.error('Error - Element with id = velveto is not found.')
			}
		}, 10);
	}

	/*
	 * name: pushHistory
	 * desc: insert new history records.
	 * params:
	 * return: void
	 */
	var pushHistory = function () {
		var history = Velveto.history();
		if (history.length == 0 || history[history.length - 1] != window.location.hash) {
			history.push(window.location.hash);
			session.set('Velveto', history.join(' || '));
		}
	}

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
		if (document.createEventNodeList) {
			var evt = document.createEventNodeList();
			dom.fireEvent(event, evt)
		} else {
			var evt = document.createEvent("HTMLEvents");
			evt.initEvent(event, true, true);
			dom.dispatchEvent(evt);
		}
	}

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
			Velveto.goTo(history.pop()); // previous url
			Velveto.session.set('Velveto', history.join(' || '));
		}
	}

	/*
	 * name: clearHistory
	 * desc: clear browsing history
	 * params:
	 * return: void
	 */
	Velveto.clearHistory = function () {
		Velveto.session.set('Velveto', '');
	}

	/*
	 * name: getBaseURL
	 * desc: get base url of this project. a.k.a. project directory.
	 * params:
	 * return: void
	 */
	Velveto.getBaseURL = function () {
		return window.location.origin + window.location.pathname;
	}

	/*
	 * name: getPath
	 * desc: get virtual path (everything after hashbang).
	 * params:
	 * return: void
	 */
	Velveto.getPath = function () {
		return window.location.hash.replace('#!', '');
	}

	/*
	 * name: getPathData
	 * desc: parse path.
	 * params: path (String)
	 * return: path data (Object)
	 */
	Velveto.getPathData = function (path) {
		var updatePathData = false;
		var data = {};

		if (!path) { // use current url
			updatePathData = true;
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
		if (path.charAt(0) == '/') {
			path = path.substring(1);
		}
		if (path.charAt(path.length - 1) == '/') {
			path = path.slice(0, -1);
		}
		data.dir = path.split('/');

		// prepare path - put / in front, and after - if file extension not found. 
		if (data.path.charAt(0) != '/') {
			data.path = '/' + data.path;
		}
		if (data.path.indexOf('.') == -1) {
			if (data.path.charAt(data.path.length - 1) != '/') {
				data.path += '/';
			}
		} else {
			if (data.path.charAt(data.path.length - 1) == '/') {
				data.path = data.path.slice(0, -1);
			}
		}

		// prepare parameters - make it became object
		if (data.params != "") {
			var temp = data.params.split('&');
			var params = {};
			for (var i in temp) {
				if (temp[i].indexOf('=') == -1) {
					params[temp[i]] = '';
				} else {
					var query = temp[i].split('=');
					params[query[0]] = query[1];
				}
			}
			data.params = params;
		}

		if (updatePathData) {
			Velveto.setPathData(data.dir, data.params); // make sure url have proper format
		}

		return data;
	}

	/*
	 * name: goTo
	 * desc: navigate to given path. If set history to false, this action won't be recorded in browsing history.
	 * params: path (String), history (boolean)
	 * return: void
	 */
	Velveto.goTo = function (path, history, updatePath) {
		var data = this.getPathData(path);
		if (updatePath !== false) this.setPathData(data.dir, data.params);
		load(data.dir[0], history);
	}

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
	}

	/*
	 * name: isBackable
	 * desc: check if back() is available.
	 * params:
	 * return: result (boolean)
	 */
	Velveto.isBackable = function () {
		return (Velveto.history().length > 2);
	}

	/*
	 * name: refresh
	 * desc: refresh page
	 * params:
	 * return: void
	 */
	Velveto.refresh = function () {
		Velveto.goTo(window.location.hash, false, false);
	}

	/*
	 * name: scrollTo
	 * desc: scroll page to given element
	 * params: to (DOM Object), duration (number <milliseconds>)
	 * return: void
	 */
	Velveto.scrollTo = function (to, duration) {
		var start = new Date().getTime();
		var duration = duration || 250;
		var from = window.scrollY;
		var to = to.offsetTop;
		var timer = setInterval(function () {
			var step = Math.min(1, (new Date().getTime() - start) / duration);
			document.body['scrollTop'] = (from + step * (to - from));
			if (step == 1) clearInterval(timer);
		}, 25);
		document.body.style['scrollTop'] = from;
	}

	/*
	 * name: setPathData
	 * desc: override path in the url bar
	 * params: dir (String), params (Data Object)
	 * return: void
	 */
	Velveto.setPathData = function (dir, params) {
		var query = '?';
		var path = ''

		if (dir) {
			path = '/' + dir.join('/');
			if (path.indexOf('.') == -1) {
				path += '/';
			}
		}
		if (params) {
			for (var i in params) {
				if (params[i]) {
					query += i + '=' + params[i] + '&';
				} else {
					query += i + '&';
				}
			}
		}
		query = query.slice(0, -1);
		if (!path || path == '//') {
			path = '';
			query = query.substring(1); // remove ?
		}
		history.pushState(Velveto.getBaseURL(), '', Velveto.getBaseURL() + '#!' + path + query);
	}

	/* ==========================
	 * Constructor
	 * ========================== */

	// ie fix
	if (!window.location.origin) {
		window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
	}

	// set default page to home
	if (window.location.hash == '') {
		Velveto.goTo('home');
	} else {
		Velveto.goTo(window.location.hash);
	}

	// bind event to browser's back button
	window.addEventListener('hashchange', function (e) {
		Velveto.goTo(window.location.hash);
	});

	/* end Constructor */

})(window);