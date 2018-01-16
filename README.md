# jsfwk
Simple and minimalistic framework to build single page apps (SPA). Its aim is to keep as close as possible to existing DOM api while providing a nice layer for building interactive web pages that makes use of reusable components.

### HOW TO use it:

#### STEP 1. Initialize framework library:

###### require('jsfwk')(*globalObject*, *[name]*);

#### where:
 * globalObject - reference to an object that has DOM api and optionally allows to set variable with global scope
 * name - (optional) name for global variable for framework

#### returns:
 * framework object


Example:

```javascript
require('jsfwk')(window, '$');
```

#### STEP 2. Build your dom tree

###### $((*tagName* | *componentFunction*), ... (*text* | *componentFunction* | *attributesObject*));

#### where:
 * tagName - string representing html tag name
 * componentFunction - function that returns DOM element or string (can be used to dynamically select tagName)
 * text - text to add to DOM tree
 * attributesObject - object with attributes and behaviours to set (described below)

#### returns:
 * DOM element


Examples:

```javascript
$('div')
```

```javascript
$('div', 
  $('span', 'hello '),
  $('span', 'world')
)
```

#### STEP 3. Release your creativity, add some styles: ;-)

###### $.style(styleContent, [styleSelector, [styleMediaSelector]]);

Example:

```javascript
const myStyle = $.style(`
  margin: 5px;
  padding: 5px;
  width: 20%;
  border: 1px solid darkblue;
`);
```

#### STEP 4. Apply your styles and other attributes:

Example:

```javascript
$('div', {$class: myStyle} 
  $('span', 'what', ' ', 'is', ' '),
  $('span', 'up?')
)
```



### Check example app for code patterns:
[Github!](https://github.com/DanielMazurkiewicz/jsfwk-app-example)