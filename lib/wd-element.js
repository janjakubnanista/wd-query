'use strict';

var Q = require('q');

/**
 * Create an intersection of two arrays of WDElements.
 * Since two elements are equal not if they are equal
 * as JavaScript objects but if equals method returns true.
 *
 * @param  {[type]} a [description]
 * @param  {[type]} b [description]
 * @return {[type]}   [description]
 */
var intersect = function(a, b) {
    var intersection = [];
    var promises = [];

    a.forEach(function(one) {
        b.forEach(function(other) {
            promises.push(one.equals(other).then(function(equals) {
                if (equals) intersection.push(one);
            }));
        });
    });

    return Q.all(promises).then(function() {
        return intersection;
    });
};

var unique = function(array) {
    var foundTwoOrMoreTimes = [];
    var promises = [];

    var compare = function(i, j) {
        var promise = array[i].equals(array[j]).then(function(value) {
            foundTwoOrMoreTimes[i] = foundTwoOrMoreTimes[i] || value;
        });

        promises.push(promise);
    };

    for (var i = 0, n = array.length; i < n; i++) {
        for (var j = i + 1; j < n; j++) {
            compare(i, j);
        }
    }

    return Q.all(promises).then(function() {
        return array.filter(function(element, index) {
            return !foundTwoOrMoreTimes[index];
        }).slice(0);
    });
};

var flatten = function(arrayOfArrays) {
    return arrayOfArrays.reduce(function(a, b) {
        return a.concat(b);
    });
};

var proxyAndReturnResult = function(method) {
    return function() {
        var args = arguments;

        return this.then(function(elements) {
            if (!elements[0]) return null;

            return elements[0][method].apply(elements[0], args);
        });
    };
};

var proxyAndReturnThis = function(method) {
    return function() {
        var args = arguments;

        return this.pause(this.then(function(elements) {
            if (!elements[0]) return null;

            elements[0][method].apply(elements[0], args);
        }));
    };
};

/**
 * Element constructor
 *
 * @param {Array|promise} wdElements Array of WDElement instances or promise that resolves with such an array
 * @param {WDElement} context
 */
var Element = function(wdElements) {
    // Accept promise or array of WD elements
    var isPromise = !!wdElements.then;
    var _promise = isPromise ? wdElements : new Q(wdElements);

    // Make promise available to outside world
    //
    // @return Promise
    this.elements = this.promise = function() {
        return _promise;
    };

    // Insert another promise into _promise making it resolve
    // after both of them have been resolved
    //
    // @param Promise until
    // @return Element this
    this.pause = function(until) {
        var promise = _promise;

        _promise = _promise.then(function(elements) {
            return until.then(function() {
                _promise = promise;

                return elements;
            });
        });

        return this;
    };
};

Element.prototype.then = function(done, fail) {
    return this.promise().then(done, fail);
};

Element.prototype.get = function(index) {
    return this.then(function(elements) {
        return elements[index] || null;
    });
};

Element.prototype.first = function() {
    return this.get(0);
};

Element.prototype.last = function() {
    return this.then(function(elements) {
        return elements[elements.length - 1];
    });
};

Element.prototype.length = function() {
    return this.then(function(elements) {
        return elements.length;
    });
};

Element.prototype.unique = function() {
    var promise = this.then(function(elements) {
        return unique(elements);
    });

    return new Element(promise);
};

Element.prototype.each = function(callback) {
    return this.pause(this.map(callback));
};

Element.prototype.map = function(callback) {
    return this.then(function(elements) {
        var promises = elements.map(function(element) {
            return new Q(callback(element));
        });

        return Q.all(promises);
    });
};

Element.prototype.filter = function(selector, type) {
    var elementsPromise = this.elements();
    var matchedPromise = this.parent().find(type || 'css selector', selector).elements();

    var promise = Q.spread([elementsPromise, matchedPromise], function(elements, matched) {
        return intersect(elements, matched);
    }).then(function(filtered) {
        return unique(filtered);
    });

    return new Element(promise);
};

Element.prototype.find = function(selector, type) {
    var elementsPromise = this.map(function(element) {
        return element.elements(type || 'css selector', selector);
    }).then(function(arrayOfArrays) {
        return unique(flatten(arrayOfArrays));
    }.bind(this));

    return new Element(elementsPromise);
};

Element.prototype.parent = function(selector) {
    var elementsPromise = this.map(function(element) {
        return element.elements('xpath', '..');
    }).then(function(arrayOfArrays) {
        return unique(flatten(arrayOfArrays));
    }.bind(this));

    var elements = new Element(elementsPromise);

    return selector ? elements.filter(selector) : elements;
};

Element.prototype.parents = function(selector) {
    var elementsPromise = this.map(function(element) {
        return element.elements('xpath', './ancestor::*');
    }).then(function(arrayOfArrays) {
        return unique(flatten(arrayOfArrays));
    }.bind(this));

    var elements = new Element(elementsPromise);

    return selector ? elements.filter(selector) : elements;
};

Element.prototype.children = function() {
    var elementsPromise = this.then(function(element) {
        return element.elements('xpath', '*');
    }).then(function(arrayOfArrays) {
        return unique(flatten(arrayOfArrays));
    }.bind(this));

    return new Element(elementsPromise);
};

Element.prototype.offset = proxyAndReturnResult('getLocation');

Element.prototype.offsetInView = proxyAndReturnResult('getLocationInView');

Element.prototype.size = proxyAndReturnResult('getSize');

Element.prototype.css = function(properties) {
    if (arguments.length > 1) properties = Array.prototype.slice.call(arguments);

    if (typeof(properties) === 'string') {
        return this.then(function(elements) {
            if (!elements[0]) return;

            return elements[0].getComputedCss(properties);
        });
    } else {
        var css = {};
        var promises = [];

        return this.then(function(elements) {
            if (!elements[0]) return;

            properties.forEach(function(property) {
                promises.push(elements[0].getComputedCss(property).then(function(value) {
                    css[property] = value;
                }));
            });

            return Q.all(promises);
        }).then(function() {
            return css;
        });
    }
};

Element.prototype.attr = proxyAndReturnResult('getAttribute');

Element.prototype.text = proxyAndReturnResult('text');

Element.prototype.type = proxyAndReturnThis('type');

Element.prototype.clear = proxyAndReturnThis('clear');

Element.prototype.tagName = proxyAndReturnResult('getTagName');

// Events

Element.prototype.click = proxyAndReturnThis('click');

Element.prototype.doubleClick = proxyAndReturnThis('doubleClick');

Element.prototype.tap = proxyAndReturnThis('tap');

Element.prototype.hover = function(x, y) {
    return this.then(function(elements) {
        if (!elements[0]) return;

        return elements[0].moveTo(x, y);
    }).then(function() {
        return this;
    }.bind(this));
};

module.exports = Element;
