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
- add ``javascript Velveto.import()``
- add ``Velveto.data()``
- ``Velveto.session`` is now try to store value in variable if localStorage is not presence
- fix history bug, now browser's back button is working!
- re-write ``Velveto.load()`` to make sure all external scripts will be loaded in order
- remove unused code (mostly ajax functions. E.g. ``Velveto.ajax.HEAD()`` is now removed.)
- rename ``Velveto.goTo()`` to ``Velveto.go()``. (still support ``Velveto.goTo()``)
- Linted

# How to use?

# Functions

## Velveto.init()
## Velveto.fireEvent()
## Velveto.back()
## Velveto.clearHistory()
## Velveto.getBaseURL()
## Velveto.getPath()
## Velveto.getPathData()
## Velveto.data()
## Velveto.go()
## Velveto.goTo()
## Velveto.history()
## Velveto.isBackable()
## Velveto.()refresh
## Velveto.()
## Velveto.()
## Velveto.()
## Velveto.()
## Velveto.()## Velveto.()
