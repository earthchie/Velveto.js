# Changelog 2.3.x (now is 2.3.1 on July 1, 2016.)

- now you have to init it by yourself, to let you add more options before initialization.``Velveto.init()``
- add init options (these values are defaults)
```javascript
Velveto.init({
    container_id: 'velveto', // ID of container that Velveto will put the content inside.
    home: 'home', // default html file for homepage.
    html_directory: 'app/', // path to html pages.
    debug: false, // set to true to show console message to help you investigate the error.
    loading_indicator: 'Loading...', // html that injected while page is loading.
    history_max: 20 // max browsing history size
});
```
- add ``Velveto.importDocument()``
- add ``Velveto.data()``
- ``Velveto.session`` is now try to store value in variable if localStorage is not presence
- fix history bug, now browser's back button is working!
- re-write ``Velveto.load()`` to make sure all external scripts will be loaded in order
- remove unused code (mostly ajax functions. E.g. ``Velveto.ajax.HEAD()`` is now removed.)
- rename ``Velveto.goTo()`` to ``Velveto.go()``. (still support ``Velveto.goTo()``)
- Linted

# Plan
- add **simple** template engine to help you bind variable to html strings

send me your idea! earthchie@gmail.com

# How to use?

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

```
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
```
document.getElementById('id').addEventListener('eventName', function () {
  // do something
});
```
or by using jQuery

```
$('#id').on('eventName', function(){
  // do something
});
```

Please make sure you listen to the event before firing it.

### Velveto.getBaseURL()

Accept:

Return: **baseURL** *(String)*

Sample Usage:
```
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
```
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
```
Velveto.getPathData();
Velveto.getPathData('#!/news/technology/programming/?id=1234&scrollTo=article');
```

Description: parse path into useful data Object, useful to accept params from URL. This function will always return 3 Object keys, which are: **dir** *(Array)*, **params** *(Object)*, **path** *(String)*

For better understanding let's use this path as example: ``#!/news/technology/programming/?id=1234&scrollTo=article``

```
Velveto.getPathData('#!/news/technology/programming/?id=1234&scrollTo=article');
```

will return

```
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
```
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
```
Velveto.history();
```

Description: return user's browsing history on this website.

### Velveto.importDocument()
### Velveto.init()
### Velveto.isBackable()
### Velveto.refresh()
### Velveto.setPathData()
### Velveto.scrollTo()

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
