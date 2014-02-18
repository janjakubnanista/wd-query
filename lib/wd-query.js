'use strict';

var wd = require('wd');
var WDElement = wd.Element;
var Element = require('./wd-element');

/**
 * Main library method and only access point
 *
 * @param {WDElement|String|Element} selector
 * @param {WDElement|AaaitElement} context
 * @param {String} type
 */
var WDQuery = function(selector, context, type) {
    if (selector instanceof WDElement) {
        return new Element([selector]);
    }

    if (selector instanceof Element) {
        return selector;
    }

    type = type || 'css selector';

    if (typeof(selector) === 'string') {
        if (!context || !context.elements) throw 'Invalid context';

        if (context instanceof Element) {
            return context.find(selector, type);
        } else {
            return new Element(context.elements(type, selector));
        }
    }

    throw 'Invalid arguments';
};

WDQuery.Element = Element;

WDQuery.isElement = function(element) {
    return element instanceof Element;
};

module.exports = WDQuery;
