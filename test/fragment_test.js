var Em = require('ember-runtime');
var Fragment = require('../lib/fragment');
var expect = require('expect.js');
var sinon = require('sinon');
expect = require('sinon-expect').enhance(expect, sinon, 'was');

describe('Fragment', function() {
    describe('get method', function() {
        beforeEach(function() {
            var nestedPromised = this.nestedPromised = { property: 'nested promised value' };
            var nestedPromise = new Em.RSVP.Promise(function (resolve) { resolve(nestedPromised); });

            var promised = this.promised = { property: 'promised value', promise: nestedPromise };
            var promise = this.promise = new Em.RSVP.Promise(function (resolve) { resolve(promised); });


            promise.property = 'static value';

            this.fragment = Fragment.create({
                content: this.browser,

                property: 'value',
                promise: promise,

                deeply: {
                    nested: {
                        property: 'value',
                        promise: promise
                    }
                }
            });
        });

        afterEach(function() {
            Em.run(this.fragment, 'destroy');
        });

        describe('with `default` strategy', function() {
            it('should return value of a direct property', function() {
                expect(this.fragment.get('property')).to.be('value');
            });

            it('should return value of a nested property', function() {
                expect(this.fragment.get('deeply.nested.property')).to.be('value');
            });

            it('should return promise if it is a leaf property', function() {
                expect(this.fragment.get('deeply.nested.promise')).to.be(this.promise);
            });

            it('should return property defined on promise object', function() {
                expect(this.fragment.get('deeply.nested.promise.property')).to.be('static value');
            });

            it('should assume strategy is `default if not specified`', function() {
                expect(this.fragment.get('deeply.nested.property')).to.be(this.fragment.get('deeply.nested.property', 'default'));
            });
        });

        describe('with `promise` strategy', function() {
            it('should return a promise of a direct property', function() {
                expect(this.fragment.get('property', 'promise').then).to.be.a('function');
            });

            it('should resolve a promise of a direct property with its value', function(done) {
                this.fragment.get('property', 'promise').then(function(value) {
                    expect(value).to.be('value');
                }).then(done);
            });

            it('should return a promise of a nested property', function() {
                expect(this.fragment.get('deeply.nested.property', 'promise').then).to.be.a('function');
            });

            it('should resolve a promise of a direct property with its value', function(done) {
                this.fragment.get('deeply.nested.property', 'promise').then(function(value) {
                    expect(value).to.be('value');
                }).then(done);
            });

            it('should return promise if it is a leaf property', function() {
                expect(this.fragment.get('deeply.nested.promise', 'promise')).to.be(this.promise);
            });

            it('should return promise if any promise is found in property chain', function() {
                expect(this.fragment.get('deeply.nested.promise.property', 'promise').then).to.be.a('function');
            });

            it('should return promise if promises are chained', function(done) {
                this.fragment.get('deeply.nested.promise.promise', 'promise').then(function(value) {
                    expect(value).to.eql({ property: 'nested promised value' });
                }).then(done);
            });

            it('should resolve returned promise with proper value', function(done) {
                this.fragment.get('deeply.nested.promise.property', 'promise').then(function(value) {
                    expect(value).to.be('promised value');
                }).then(done);
            });

            it('should resolve returned promise with proper value if promises are chained', function(done) {
                this.fragment.get('deeply.nested.promise.promise.property', 'promise').then(function(value) {
                    expect(value).to.be('nested promised value');
                }).then(done);
            });
        });
    });

    describe('byCSS static method', function() {
        it('should return read only property', function() {
            expect(Fragment.byCSS('a')._readOnly).to.be(true);
        });

        it('should return volatile property', function() {
            expect(Fragment.byCSS('a')._cacheable).to.be(false);
        });

        describe('when invoked', function() {
            beforeEach(function() {
                this.object = Ember.Object.createWithMixins({
                    fragment: Fragment.byCSS('a')
                });
            });

            describe('on object without content', function() {
                it('should throw exception', function() {
                    var object = this.object;

                    expect(function() {
                        object.get('fragment');
                    }).to.throwException();
                });
            });

            describe('on object with content', function() {
                beforeEach(function() {
                    this.object.set('content', this.browser);
                });

                it('should not throw exception', function() {
                    var object = this.object;

                    Ember.run(function() {
                        expect(function() {
                            object.get('fragment');
                        }).to.not.throwException();
                    });
                });

                it('should return instance of a fragment', function() {
                    Ember.run(this, function() {
                        expect(this.object.get('fragment')).to.be.a(Fragment);
                    });
                });

                it('should set content on returned fragment', function() {
                    return this.object.get('fragment.content').then(function(elements) {
                        expect(elements).to.be.an('array');
                    });
                });
            });
        });
    });
});
