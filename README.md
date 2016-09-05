# Changelog 2.4.x (now is 2.4.0 on Sep 5, 2016.)

- add ``Velveto.iObject()`` intelligence object manipulation. With this function you can clone, access nested object, assign nested object very easily
- add ``Velveto.template()`` simple data mapping template.

# Plan
- [x] add **simple** template engine to help you bind variable to html strings
- [ ] Add support for private mode in Safari on iOS 7+. This mode supported localStorage but trows: QuotaExceededError when localStorage.setItem() is call, we will use cookie instead if this case happen.

send me your idea! earthchie@gmail.com

# Tutorial

1. Prepare your working directory. Create folder name ``app`` and new text file name ``index.html``.
    ```
my_website
 |_ app
 |_ index.html
    ```

2. Download ``velveto.min.js`` from repo, and put it anywhere you like, for now I'll just put it alongside with index.html. Now our working directory should look like this:
    ```
my_website
 |_ app
 |_ index.html
 |_ velveto.min.js
```

3. Put this code inside ``index.html`` this will become our master template. Every page of your website will have this structure except content inside #velveto will change corresponding to URL.
    ```html
<!DOCTYPE html>
<html>
<head>
    <title>Velveto Tutorial</title>
    <meta charset="UTF-8">
</head>
<body>
    <header>
        <a href="#!/home/">Home</a> 
        <a href="#!/page1/">Page #1</a>
    </header>
    
    <div id="velveto"></div>
    
    <footer>Static Content</footer>
    
    <script type="text/javascript" src="velveto.min.js"></script>
    <script type="text/javascript">
        Velveto.init();
    </script>
</body>
</html>
```

4. Next, create our web pages ``app/home.html`` and ``app/page1.html``. So far, our working directory should look like this:
    ```
my_website
 |_ app
    |_ home.html
    |_ page1.html
 |_ index.html
 |_ velveto.min.js
```

5. Put html in ``app/home.html`` and ``app/page1.html``

    ``app/home.html``
    ```html
<h1>This is Home!</h1>
```

    ``app/page1.html``
    ```html
<h1>This is Page #1!</h1>
```

6. Open browser and navigate to your website. for example ``http://localhost/my_website/``
    - you can access home.html via ``http://localhost/my_website/#!/home/``
    - same for page1.html ``http://localhost/my_website/#!/page1/``

    you can make a link to these pages like this too:
    ```html
<a href="#!/home/">Home</a>
<a href="#!/page1/">Page #1</a>
```

That's it. You have Single Page Application now! Good job!

repeat step 4-6 as much as you like :)

# Events

When page changes, Velveto.js will fire multiple events in following order:

1. unload - before page change
2. beforeLoad - after injected loading animation
3. beforeScriptLoad - after injected the DOM
4. scriptLoaded - after every attached scripts is loaded and executed
5. loaded - after document import successfully
6. loadFail - in case of ajax fail, this event will fire after beforeLoad, all remaining events will not be fired.

This is how you listen to the events:

```javascript
var container = document.getElementById('velveto');

container.addEventListener('unload',function(){
   console.log('unload - fired');
});

container.addEventListener('beforeLoad',function(){
    console.log('beforeLoad - fired');
});

container.addEventListener('beforeScriptLoad',function(){
    console.log('beforeScriptLoad - fired');
});

container.addEventListener('scriptLoaded',function(){
    console.log('scriptLoaded - fired');
});

container.addEventListener('loaded',function(){
    console.log('loaded - fired');
});

container.addEventListener('loadFail',function(){
    console.log('loadFail - fired');
});
```

# Functions

### Velveto.back()

if possible, go back to previous page.
you can check if it can go back with ``Velveto.isBackable()``

### Velveto.clearHistory()
clear browsing history. this will affect the behavior of ``Velveto.back()`` and ``Velveto.isBackable()``.

### Velveto.data()

Accept: **url** *(String:optional)* 

Return: **data** *(Object)* 

Sample Usage: 
```javascript
Velveto.data(); // read from current url
Velveto.data(url); // read from given url
```

Description: parse current URL ``Velveto.data()`` or given URL ``Velveto.data('#!/blog/1-july-2016/')`` then return object of data. 

For example:

```
http://mywebsite.com/#!/news/technology/programming/?id=1234&scrollTo=article
```

when you call ``Velveto.data()`` or ``Velveto.data('#!/news/technology/programming/?id=1234&scrollTo=article')`` it will return

```
{ 
  "0": "technology", 
  "1": "programming", 
  "id": "1234", 
  "scrollTo": "article"
}
```

please note that key with number may be overridden by path values. E.g. URL ``Velveto.data('#!/blog/1-july-2016/?0=zero&1=one&2=two')`` will return

```
{
    "0": "1-july-2016", 
    "1": "one", 
    "2": "two"
}
```
Please use ``Velveto.getPathData()`` for more explicit data.

### Velveto.extend()

Accept: **object1** *(Object or Array)*, **object2** *(Object or Array)* 

Return **mergedObject**

Sample Usage:

```javascript
Velveto.extend({a:1,b:2},{b:3,c:4}); // return {a:1,b:3:c:4}
```

Description: merge two object together. like jQuery.extend().


### Velveto.fireEvent()

Accept: **DOM** *(NodeElement)*, **event** *(String)*

Return: *void*

Sample Usage: 
```javascript
Velveto.fire(document.getElementById('id'),'eventName');
```

Description: fire event at the moment this function called. Just like ``jQuery.trigger();``
to listen event use:
```javascript
document.getElementById('id').addEventListener('eventName', function () {
  // do something
});
```
or by using jQuery

```javascript
$('#id').on('eventName', function(){
  // do something
});
```

Please make sure you listen to the event before firing it.

### Velveto.getBaseURL()

Accept:

Return: **baseURL** *(String)*

Sample Usage:
```javascript
Velveto.getBaseURL();
```

Description: get base URL of your website. In other words, everything before #!/. E.g.

URL is:
```
http://mywebsite.com/blog/#!/read/6957942f55d5/
```

``Velveto.getBaseURL()`` will return
```
http://mywebsite.com/blog/
```

### Velveto.getPath()

Accept:

Return: **path** *(String)*

Sample Usage:
```javascript
Velveto.getPath();
```

Description: get virtual path. In other words, everything after #!/. E.g.

URL is:
```
http://mywebsite.com/blog/#!/read/6957942f55d5/
```

``Velveto.getPath()`` will return
```
/read/6957942f55d5/
```

### Velveto.getPathData()

Accept: **path** *(String:optional)*

Return: data *(Object)*

Sample Usage:
```javascript
Velveto.getPathData();
Velveto.getPathData('#!/news/technology/programming/?id=1234&scrollTo=article');
```

Description: parse path into useful data Object, useful to accept params from URL. This function will always return 3 Object keys, which are: **dir** *(Array)*, **params** *(Object)*, **path** *(String)*

For better understanding let's use this path as example: ``#!/news/technology/programming/?id=1234&scrollTo=article``

```javascript
Velveto.getPathData('#!/news/technology/programming/?id=1234&scrollTo=article');
```

will return

```javascript
{
    "dir" : [
        "news",
        "technology",
        "programming"
    ],
    "params" : {
        "id" : "1234",
        "scrollTo" : "article"
    },
    "path" : "/news/technology/programming/"
}
```

### Velveto.go()

Accept: **path** *(String)*

Return: *void*

Sample Usage:
```javascript
Velveto.go('#!/news/1234/');
Velveto.go('#!/news/1234'); // omit first slash
Velveto.go('#!news/1234/'); // omit last slash
Velveto.go('#!news/1234'); // omit both first and lash slash
Velveto.go('news/1234'); // omit hashbang, first slash, and lash slash
```
Description: Navigate user to given path. For external url, use ``window.location.href = external_url;`` instead.

### Velveto.goTo()
Alias of ``Velveto.go()``

### Velveto.history()

Accept: 

Return: **history** *(Array)*

Sample Usage:
```javascript
Velveto.history();
```

Description: return user's browsing history on this website.

### Velveto.importDocument()

Accept: **url** *(String)*, **DOM** *(NodeElement)*, **callback** *(Function)*

Return: void

Sample Usage:
```javascript
var from = '/app/sidebar.html';
var to = document.getElementById('sidebar');
Velveto.importDocument(from, to, function(){
    console.log('done');
})
```

Description: Load html from given url, then insert into the given container.

Events: this function will fire multiple events in following orders

1. unload - right after function called.
2. beforeLoad - after loading indicator shows up, but before ajax.
3. beforeScriptLoad - before load additional scripts attached to document.
4. scriptLoaded - right after every script loaded and executed.
5. loaded - fire after document import successfully
6. loadFail - in case of ajax fail, this event will fire after beforeLoad, all remaining events will not be fired.

This is how you listen to the events:

```javascript
var from = '/app/sidebar.html';
var to = document.getElementById('sidebar');

to.addEventListener('unload',function(){
   console.log('unload - fired');
});

to.addEventListener('beforeLoad',function(){
    console.log('beforeLoad - fired');
});

to.addEventListener('beforeScriptLoad',function(){
    console.log('beforeScriptLoad - fired');
});

to.addEventListener('scriptLoaded',function(){
    console.log('scriptLoaded - fired');
});

to.addEventListener('loaded',function(){
    console.log('loaded - fired');
});

to.addEventListener('loadFail',function(){
    console.log('loadFail - fired');
});

Velveto.importDocument(from, to, function(){
    console.log('done');
})
```

Please note, callback calls slightly before loaded event.

### Velveto.init()

Accept: **options** *(Object:optional)*

Return: *void*

Sample Usage:
```javascript
Velveto.init();
Velveto.init({
    container_id: 'velveto', // ID of container that Velveto will put the content inside.
    home: 'home', // default html file for homepage.
    html_directory: 'app/', // path to html pages.
    debug: false, // set to true to show console message to help you investigate the error.
    loading_indicator: 'Loading...', // html that injected while page is loading.
    history_max: 20 // max browsing history size
});
```

Description: For initializing Velveto.js Engine. Only need to call once, on document ready event.

### Velveto.iObject()

Accept: **obj** *(Object)*, **key** *(String:optional)*, **val** *(any:optional)*

Return: **obj** *(Array)*

Sample Usage:
```javascript
Velveto.iObject([1,2,3,4,5]); // clone mode
Velveto.iObject([{name: 'John', address: ['address 1', 'address 2']}],'0.address[1]'); // "address 2"; access mode
Velveto.iObject({a:{b:1}},'a.c',2); // {a:{b:1,c:2}}; assign mode
```

Description: 

has 3 modes
1. clone - clone given object. requires obj only.
2. access - get value of given keyset. requires obj, key.
3. assign - assign value to given keyset.requires obj, key and val

### Velveto.isBackable()

Accept:

Return: **isBackable** *(Boolean)*

Sample Usage:
```javascript
Velveto.isBackable();
```

Description: return ``true`` if user can go back to previous page by pressing browser's back button or ``Velveto.back()``

### Velveto.refresh()

Accept:

Return *void*

Sample Usage:
```javascript
Velveto.refresh()
```

Description: refresh current page

### Velveto.setPathData()

Accept: **dir** *(Array or ``null``)*, **params** *(Object:optional)*

Return: *void*

Sample Usage:
```javascript
Velveto.setPathData(['news','technology','programming'],{id:1234});
```

Description: This function will replace current url with given data without affect browsing history and ``Velveto.history()``, also won't trigger hashchange event too. Useful when you want to change your url dynamically so user can copy it.

To make this path take effect, call ``Velveto.refresh()``.

### Velveto.scrollTo()

Accept: **DOM** *(NodeElement)*, **duration** *(Float:optional)*

Return:

Sample Usage:
```javascript
Velveto.scrollTo(document.getElementById('#comment-18'));
```

Description: Scroll page to given element. You can also trigger this function by making anchor link 

``<a href="#comment-18">Scroll to Comment #18</a>``

This will attempt to scroll to element with id="comment-18".

## Helpers - Session
### Velveto.session.get()
### Velveto.session.set()
### Velveto.session.remove()

## Helpers - Ajax
### Velveto.ajax.abortAll()
### Velveto.ajax.executeScript()
### Velveto.ajax.GET()
### Velveto.ajax.POST()
### Velveto.ajax.sendRequest()
### Velveto.ajax.xhr()

## License
WTFPL 2.0 http://www.wtfpl.net/
