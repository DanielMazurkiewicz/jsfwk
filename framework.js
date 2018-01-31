'use strict'

let styleId = 0;
const frameworkFactory = (global, globalName) => {
  const document = global.document;
  const head = document.head;
  const body = document.body;

  const attributeOperations = {
    class: (element, value) => {
      if (value instanceof Array) {
        value.forEach(className => element.classList.add(className));
      } else {
        element.classList.add(value);
      }
    }
  }

  function setPredefinedAttribute(name, operation) {
    attributeOperations[name] = operation;
  }

  function appendChild(child, content) {
    if (!content) content = '@content';
    this.$.c[content].appendChild(child);
  }

  function removeChild(child, content) {
    if (!content) content = '@content';
    this.$.c[content].appendChild(child);
  }

  function setAttribute(name, value) {
    const element = this.$
    const attributesVisible = element.av;
    if (attributesVisible[name]!==undefined){
      element.a[name] = value;
      if (attributesVisible[name]) {
        this.$_sa(name, value);
      }
    } else if (attributeOperations[name]) {
      attributeOperations[name](this, value);
    } else {
      this.$_sa(name, value);
    }
  }

  function getAttribute(name) {
    const element = this.$
    const attributesVisible = element.av;
    if (attributesVisible[name]!==undefined){
      return element.a[name];
    } else {
      return this.$_ga(name);
    }
  }

  function removeAttribute(name) {
    const element = this.$
    const attributesVisible = element.av;
    if (attributesVisible[name]!==undefined){
      element.a[name] = undefined;
      if (attributesVisible[name]) {
        this.$_ra(name);
      }
    } else {
      this.$_ra(name);
    }
  }

  /*===============================================================*/

  function createElement(tag) {
    let element;
    if (typeof tag === 'function') {
      tag = tag();
    }

    if (tag instanceof HTMLElement || tag instanceof SVGElement || tag instanceof Text) {
      element = tag;
    } else {
      switch (tag) {
        case 'text':
          return document.createTextNode(arguments[1]);
        case 'body':
          element = body;
          break;
        default:
          element = document.createElement(tag);
      }
    }

    const argumentsLength = arguments.length;
    for (let argumentPosition = 1; argumentPosition < argumentsLength; argumentPosition++) {
      let argument = arguments[argumentPosition];

      if (typeof argument === 'function') {
        argument = argument();
      }

      if (typeof argument === 'string') {
        element.appendChild(document.createTextNode(argument));
      } else if (argument instanceof HTMLElement || argument instanceof SVGElement || argument instanceof Text){
        element.appendChild(argument)
      } else if (argument instanceof Array){
        argument.forEach(e => createElement(element, e))
      } else { // assume object?
        for (let attribute in argument) {
          const value = argument[attribute];

          let operation, currentObj = element.$;
          if (currentObj) {
            currentObj = currentObj.av;
            if (currentObj) {
              currentObj = currentObj[attribute];
            }
          }

          if (currentObj!== undefined) {
            operation = attributeOperations[attribute];
          }

          if (operation) {
            operation(element, value);
          } else {
            let parentFwk;
            switch (attribute[0]) {
              case '@': //put element/elements to widget placeholder
                if (typeof value === 'function') {
                  value = value(element);
                }
    
                if (value instanceof Array) {
                  value.forEach(contentElement => {
                    if (typeof contentElement === 'function') {
                      contentElement = contentElement(element);
                    }
    
                    if (contentElement instanceof HTMLElement || contentElement instanceof SVGElement || contentElement instanceof Text) {
                      element.appendChild(contentElement, attribute);
                    } else if (contentElement !== undefined) {
                      element.appendChild(document.createTextNode(contentElement), attribute);
                    }
                  });
                } else if (value instanceof HTMLElement || value instanceof SVGElement || value instanceof Text) {
                  element.appendChild(value, attribute);
                } else if (value !== undefined) {
                  element.appendChild(document.createTextNode(value), attribute);
                }
                break;

              case '+': //assign placeholder for content
                attribute = '@' + attribute.substr(1); //replace first character

                if (element.$) {
                  parentFwk = element.$;
                } else {
                  element.$ = parentFwk = {};
                }

                if (!parentFwk.content) {
                  parentFwk.content = parentFwk.c = {};
                  element.$_ac = element.appendChild;
                  element.$_rc = element.removeChild;
                  element.appendChild = appendChild;
                  element.removeChild = removeChild;
                }
                parentFwk.content[attribute] = value;
                break;

              case '=': //add new attribute to element
                attribute = attribute.substr(1); //attribute name

                if (element.$) {
                  parentFwk = element.$;
                } else {
                  element.$ = parentFwk = {};
                }

                if (!parentFwk.a) {
                  parentFwk.attributes = parentFwk.a = {};
                  parentFwk.attributesVisible = parentFwk.av = {};                    
                  element.$_sa = element.setAttribute;
                  element.$_ga = element.getAttribute;
                  element.$_ra = element.removeAttribute;
                  element.setAttribute = setAttribute;
                  element.getAttribute = getAttribute;
                  element.removeAttribute = removeAttribute;
                }

                let propertyConstructor;
                if (typeof value === 'function') {
                  propertyConstructor = {set: value}
                } else {
                  propertyConstructor = value;
                }

                if (propertyConstructor.visible) {
                  parentFwk.av[attribute] = true;
                } else {
                  parentFwk.av[attribute] = false;                  
                }

                Object.defineProperty(parentFwk.a, attribute, propertyConstructor);
                break;

              case '&': //set event
                attribute = attribute.substr(1); //event name
                element.addEventListener(attribute, value);

              default:
                element.setAttribute(attribute, value);
            }
          }
        }
      }
    }
    return element;
  }

  const createStyleFromObject = (style, name) => {
    var result = '';
    for (let media in style) {
      const selectors = style[media];
      let selectorText = '';
      for (let selector in selectors) {
        const content = selectors[selector];
        if (name) {
          if (selector === '!') {
            selectorText += '.' + name + '{' + content + '} ';
          } else {
            selectorText += '.' + name + selector + '{' + content + '} ';
          }
        } else if (selector !== '!') {
            selectorText += selector + '{' + content + '} ';
        } else {
          //TODO: throw some error, or something...
        }
      }
      if (media === '!') {
        result += selectorText;
      } else {
        result += '@media ' + media + '{' + selectorText + '} ';
      }
    }
    return result;
  }

  const createStyleFromText = (id, style, selector, media) => {
    let result;
    if (media) {
      if (selector) {
        result = '@media ' + media + '{.' + id + selector + '{' + style + '}} ';
      } else {
        result = '@media ' + media + '{.' + id + '{' + style + '}} ';
      }
    } else if (selector) {
      result = '.' + id + selector + '{' + style + '} ';
    } else {
      result = '.' + id + '{' + style + '} ';      
    }
    return result;
  }

  const createStyle = (style, selector, media) => {
    let id;
    if (!styleId) {
      id = String.fromCharCode(65);
    } else {
      id = '';
      let idNumeric = styleId;
      while (idNumeric) {
        let rest = idNumeric % 28;
        id += String.fromCharCode(rest + 65);
        idNumeric = (idNumeric / 28) | 0;
      }
    }

    const css = document.createElement('style');
    if (typeof style !== 'string') {
      if (selector) {
        css.innerHTML = createStyleFromObject(style)
      } else {
        css.innerHTML = createStyleFromObject(style, id)
      }
    } else {
      css.innerHTML = createStyleFromText(id, style, selector, media);
    }

    head.appendChild(css);

    styleId++;
    return id;
  }

  const raiseEvent = (element, eventName, value) => {
    element.dispatchEvent(new CustomEvent(eventName, value));
  }

  createElement.style = createStyle;
  createElement.attribute = setPredefinedAttribute;
  createElement.raise = raiseEvent;
  
  if (global && globalName) global[globalName] = createElement;
  return createElement;
}

module.exports = frameworkFactory;