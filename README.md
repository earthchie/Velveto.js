# Changelog 2.3.0 - June 30, 2016.

- now you have to init it by yourself, to let you add more options before initialization.``Velveto.init()``
- add init options (these values are defaults)
```javascript
Velveto.init({
    container_id: 'velveto', // ID of container that Velveto will put the content inside.
    home: 'home', // default html file for homepage.
    html_directory: 'app/', // path to html pages.
    debug: false, // set to true to show console message to help you investigate the error.
    loading_indicator: 'Loading...' // html that injected while page is loading.
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
### Velveto.clearHistory()
### Velveto.data()
### Velveto.extend()
### Velveto.fireEvent()
### Velveto.getBaseURL()
### Velveto.getPath()
### Velveto.getPathData()
### Velveto.go()
### Velveto.goTo()
### Velveto.history()
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
