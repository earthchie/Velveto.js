/**
 * @name velveto.js
 * @version 2.0.1
 * @update September 16, 2014
 * @website http://velveto.project.in.th/
 * @author Earthchie http://www.earthchie.com/
 * @license WTFPL v.2 - http://www.wtfpl.net/
 **/

var Velveto = new function(){
	
	/* ==========================
	 * Helpers 
	 * ========================== */
	
	var session = new function(){

		this.get = function(session){
			if(localStorage){
				return localStorage.getItem(session)||'';
			}else{
				return '';
			}
		}

		this.set = function(session,value){
			if(localStorage){
				localStorage.setItem(session,value);
			}
		}
		
	}
	
	var ajax = new function(){
	
		var xhr = [];
		
		this.abortAll = function(){
			for(var i in xhr){
				xhr[i].abort();
			}
		}
		
		this.x = function(){
			for(a=0;a<4;a++){
				try{
					return a ? new ActiveXObject([,"Msxml2","Msxml3","Microsoft"][a]+".XMLHTTP"): new XMLHttpRequest
				}catch(e){}
			}
		}
		
		this.get = function(url,success,error) {
			var x = new this.x();
			xhr.push(x);
			x.open('GET', url, true);
			x.send();
			
			x.onreadystatechange = function(){
			
				if(x.readyState == 4){
				
					for(var i in xhr){
						if(xhr[i] == x){
							xhr.splice(i,1);
							break;
						}
					}
				
					if(x.status == 200){ 
						if(typeof success == 'function'){
							success(x.responseText); 
						}
					}else{ 
						if(typeof error == 'function'){
							error(x);
						}
					}
				}
				
			};
		}
		
		this.getScript = function(url){
			this.get(url,function(r){
				eval(r);
			});
		}
	};
	
	/* end Helpers */
	
	/* ==========================
	 * Private Methods
	 * ========================== */
	
	/*
	 * name: fireEvent
	 * desc: fire given event
	 * params: dom (DOM Object), event (String)
	 * return: void
	 */
	var fireEvent = function(dom,event){
		if(document.createEventNodeList){
			var evt = document.createEventNodeList();
			dom.fireEvent(event,evt)
		}else{
			var evt = document.createEvent("HTMLEvents");
			evt.initEvent(event,true,true);
			dom.dispatchEvent(evt);
		}
	}
	
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
	var load = function(filename,history){
		ajax.abortAll();
		var _this = this;
		
		setTimeout(function(){ // wait 10ms, to make sure all active ajax is aborted.
			var body = document.getElementById('velveto');
			if(body){
				
				// show loading indicator
				var loading = body.getAttribute('data-loading-indicator');
				// if not null and not false
				if(loading != null && loading != 'false' && loading != '0'){
					body.innerHTML = loading;
				}
				
				// fire beforeLoad event to #velveto
				fireEvent(document.querySelector('#velveto'),'beforeLoad');
				
				// fetch content
				ajax.get('app/'+filename+'.html',function(r){
				
					// insert content to container
					body.innerHTML = r;
					
					// execute scripts
					var scripts = document.querySelectorAll('#velveto script');
					for(var i in scripts){
						if(scripts[i].innerHTML) eval(scripts[i].innerHTML);
						if(scripts[i].src) ajax.getScript(scripts[i].src);
					}
					
					// bind event to internal a tags
					var a = document.getElementsByTagName('a');
					for(var i = 0; i < a.length; i++){
						/* if...
						 * - on same directory
						 * - contains #!
						 * - not binded already
						 */
						if(a[i].href.indexOf(_this.Velveto.getBaseURL()) > -1 && a[i].href.indexOf('#!') > -1 && a[i].getAttribute('data-ajax') === null){
							
							a[i].setAttribute('data-ajax','true'); // mark as binded
							a[i].addEventListener('click',function(e){
								e.stopPropagation();
								e.preventDefault();
								
								var now = JSON.stringify(_this.Velveto.getPathData(window.location.hash));
								var next = JSON.stringify(_this.Velveto.getPathData(this.href));
								
								if(now != next){
									_this.Velveto.goTo(this.href);
								}
								
								return false;
							});
						}
						
						// make smooth scroll for hash link
						if(a[i].href.indexOf('#!') < 0 && a[i].href.indexOf('#') > -1 && a[i].getAttribute('data-smooth') === null){
							a[i].setAttribute('data-smooth','true'); // mark as binded
							a[i].addEventListener('click',function(e){
								e.preventDefault();
								var to = document.getElementById(this.href.split('#').pop());
								_this.Velveto.scroll(to);
								return false;
							});
						}
					}
					
					// fire loaded event to #velveto
					fireEvent(document.querySelector('#velveto'),'loaded');
					
					// history
					if(history !== false){
						pushHistory();
					}
					
				},function(){ // error - go to home
					// fire loadFail event to #velveto
					fireEvent(document.querySelector('#velveto'),'loadFail');
					_this.Velveto.goTo('home',false);
				});
			}else{
				console.error('Error - Element with id = velveto is not found.')
			}
		},10);
	}
	
	/*
	 * name: pushHistory
	 * desc: insert new history records.
	 * params: 
	 * return: void
	 */
	var pushHistory = function(){
		var history = this.Velveto.history();
		if(history.length == 0 || history[history.length-1] != window.location.hash){
			history.push(window.location.hash);
			session.set('Velveto',history.join(' || '));
		}
	}
	
	/* end Private Methods */
	
	/* ==========================
	 * Public Methods
	 * ========================== */
	
	/*
	 * name: back
	 * desc: go back to previous page (if possible)
	 * params:
	 * return: void
	 */
	this.back = function(){
		if(this.isBackable()){
			var history = this.history();
			history.pop(); // current
			this.goTo(history.pop()); // previous url
			session.set('Velveto',history.join(' || '));
		}
	}
	
	/*
	 * name: clearHistory
	 * desc: clear browsing history
	 * params:
	 * return: void
	 */
	this.clearHistory = function(){
		session.set('Velveto','');
	}
	
	/*
	 * name: getBaseURL
	 * desc: get base url of this project. a.k.a. project directory.
	 * params:
	 * return: void
	 */
	this.getBaseURL = function(){
		return window.location.origin+window.location.pathname;
	}
	
	/*
	 * name: getPath
	 * desc: get virtual path (everything after hashbang).
	 * params: 
	 * return: void
	 */
	this.getPath = function(){
		return window.location.hash.replace('#!','');
	}
	
	/*
	 * name: getPathData
	 * desc: parse path.
	 * params: path (String)
	 * return: path data (Object)
	 */
	this.getPathData = function(path){
		var updatePathData = false;
		var data = {};
		
		if(!path){ // use current url
			updatePathData = true;
			path = window.location.hash;
		}
		
		path = decodeURI(path.replace(this.getBaseURL(),'').replace('#!',''));
		
		// split raw url as path and params
		if(path.indexOf('?') > -1){
			path = path.split('?');
			data.path = path[0];
			data.params = path[1];
		}else{
			data.path = path;
			data.params = "";
		}
		
		// prepare directory - remove / at first and last
		path = data.path;
		if(path.charAt(0) == '/'){
			path = path.substring(1);
		}
		if(path.charAt(path.length-1) == '/'){
			path = path.slice(0,-1);
		}
		data.dir = path.split('/');
		
		// prepare path - put / in front, and after - if file extension not found. 
		if(data.path.charAt(0) != '/'){
			data.path = '/'+data.path;
		}
		if(data.path.indexOf('.') == -1){
			if(data.path.charAt(data.path.length-1) != '/'){
				data.path += '/';
			}
		}else{
			if(data.path.charAt(data.path.length-1) == '/'){
				data.path = data.path.slice(0,-1);
			}
		}
		
		// prepare parameters - make it became object
		if(data.params != ""){
			var temp = data.params.split('&');
			var params = {};
			for(var i in temp){
				if(temp[i].indexOf('=') == -1){
					params[temp[i]] = '';
				}else{
					var query = temp[i].split('=');
					params[query[0]] = query[1];
				}
			}
			data.params = params;
		}
		
		if(updatePathData){
			this.setPathData(data.dir,data.params); // make sure url have proper format
		}
		
		return data;
	}
	
	/*
	 * name: goTo
	 * desc: navigate to given path. If set history to false, this action won't be recorded in browsing history.
	 * params: path (String), history (boolean)
	 * return: void
	 */
	this.goTo = function(path,history){
		var data = this.getPathData(path);
		this.setPathData(data.dir,data.params);
		load(data.dir[0],history);
	}
	
	/*
	 * name: history
	 * desc: get browsing history list
	 * params: 
	 * return: browsing history (Array of String)
	 */
	this.history = function(){
		if(session.get('Velveto')){
			return session.get('Velveto').split(' || ');
		}else{
			return [];
		}
	}
	
	/*
	 * name: isBackable
	 * desc: check if back() is available. 
	 * params: 
	 * return: result (boolean)
	 */
	this.isBackable = function(){
		return (this.history().length > 2);
	}
	
	/*
	 * name: refresh
	 * desc: refresh page
	 * params: 
	 * return: void
	 */
	this.refresh = function(){
		this.goTo(window.location.hash,false);
	}
	
	/*
	 * name: scroll
	 * desc: scroll page to given element
	 * params: to (DOM Object)
	 * return: void
	 */
	this.scroll = function(to){
		//http://stackoverflow.com/a/17733311/3468584
		if(to){
			animate(document.body, "scrollTop", "", window.scrollY, to.offsetTop, 250, true);
		}
		function animate(elem,style,unit,from,to,time,prop) {
			if(!elem) return;
			var start = new Date().getTime(),
				timer = setInterval(function() {
					var step = Math.min(1,(new Date().getTime()-start)/time);
					if (prop) {
						elem[style] = (from+step*(to-from))+unit;
					} else {
						elem.style[style] = (from+step*(to-from))+unit;
					}
					if( step == 1) clearInterval(timer);
				},25);
			elem.style[style] = from+unit;
		}
	}
	
	/*
	 * name: setPathData
	 * desc: override path in the url bar
	 * params: dir (String), params (Data Object)
	 * return: void
	 */
	this.setPathData = function(dir,params){
		var query = '?';
		var path = ''
		
		if(dir){
			path = '/'+dir.join('/');
			if(path.indexOf('.') == -1){
				path += '/';
			}
		}
		if(params){
			for(var i in params){
				if(params[i]){
					query += i+'='+params[i]+'&';
				}else{
					query += i+'&';
				}
			}
		}
		query = query.slice(0,-1);
		if(!path || path == '//'){
			path = '';
			query = query.substring(1); // remove ?
		}
		history.pushState(this.getBaseURL(),'',this.getBaseURL()+'#!'+path+query);
	}
	
	/* end Public Methods */
	
	/* ==========================
	 * Constructor
	 * ========================== */
	
	// ie fix
	if(!window.location.origin){
		window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
	}
	
	// set default page to home
	if(window.location.hash == ''){
		this.goTo('home');
	}else{
		this.goTo(window.location.hash);
	}
	
	// bind event to browser's back button
	var _this = this;
	window.addEventListener('hashchange',function(e){
		_this.goTo(window.location.hash);
	});
	
	/* end Constructor */
};