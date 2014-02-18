var Em = require('ember-runtime');
var $ = require('./aaait_query');

var isPromise = function (object) {
    return object && typeof(object.then) === 'function';
};

var Fragment = Em.Object.extend({
    content: null,

    init: function() {
        this._super();

        Em.assert('Fragment must have a content', this.get('content'));
    },

    get: function(key, strategy) {
        // You have to provide a key
        Em.assert('You have to provide a name for the property', !!key);

        // Available strategies are:
        // - promise
        // - default
        strategy = strategy || 'default';

        Em.assert('Getter strategy must be either `promise` or `default`', ['default', 'promise'].contains(strategy));

        // Default strategy uses classic Ember.get
        if (strategy === 'default') return Ember.get(this, key);

        var segments = key.split('.');
        var context = this;

        // Proxy all properties to content if not found on fragment
        if (Ember.get(this, segments[0]) === undefined) segments.unshift('content');

        do {
            context = Em.get(context, segments.shift());
        } while (segments.length && !isPromise(context));

        if (segments.length) {
            // We encountered a promise and got out of the do/shile loop
            // before we reached the end. This means that `context` is a promise,
            // hence we can chain and return it.
            do {
                context = context.then(function(resolved) {
                    return Em.get(resolved, segments.shift());
                });
            } while (segments.length);

            return context;        
        } else {
            // We shifted all the segments without encountering a promise
            // We have to wrap the result in a promise and resolve immediately
            // in case it is not a promise already
            return isPromise(context) ? context : new Ember.RSVP.Promise(function (resolve) { resolve(context); });
        }
    },

    $: function(selector, type) {
        var content = this.get('content');

        return selector ? content.find(selector, type) : content;
    }
});

var by = function(clazz, selector, type) {
    var property = function() {
        var content = this.get('content');

        Ember.assert('Object must have content property', content);

        return clazz.create({ content: $(selector, content, type) });
    }.property().volatile().readOnly();

    return property;
};

Fragment.reopenClass({
    byCSS: function(clazz, selector) {
        if (arguments.length === 1) {
            selector = clazz;
            clazz = this;
        }

        return by(clazz, selector, 'css selector');
    },

    byXPath: function(clazz, selector) {
        if (arguments.length === 1) {
            selector = clazz;
            clazz = this;
        }

        return by(clazz, selector, 'xpath');
    }
});

module.exports = Fragment;
