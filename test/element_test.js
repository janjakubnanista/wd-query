// Copyright (C) 2013, GoodData(R) Corporation. All rights reserved.
var expect = require('expect.js');
var sinon = require('sinon');
expect = require('sinon-expect').enhance(expect, sinon, 'was');

var Q = require('Q');
var wd = require('wd');
var WDElement = wd.Element;

var AaaitElement = require('../lib/wd-element');

var e = function(value) {
    return new WDElement(value, {});
};

describe('AaaitElement', function() {
    before(function() {
        sinon.stub(WDElement.prototype, 'equals', function(other) {
            return new Q(other.value === this.value);
        });
    });

    beforeEach(function() {
        this.elements = [2, 3, 3].map(e);
        this.element = new AaaitElement(this.elements, this.context);
    });

    after(function() {
        WDElement.prototype.equals.restore();
    });

    it('should be ok', function() {
        expect(AaaitElement).to.be.a('function');
    });

    describe('elements method', function() {
        it('should return promise', function() {
            expect(this.element.elements().then).to.be.a('function');
        });

        it('should be synonymous with promise method', function() {
            expect(this.element.elements).to.be(this.element.promise);
        });

        it('should resolve with found elements', function(done) {
            this.element.elements().then(function(elements) {
                expect(elements).to.be(this.elements);
            }.bind(this)).then(done);
        });
    });

    describe('get method', function() {
        it('should return promise', function() {
            expect(this.element.get().then).to.be.a('function');
        });

        it('should resolve with element on nth index', function(done) {
            this.element.get(0).then(function(element) {
                expect(element).to.be(this.elements[0]);
            }.bind(this)).then(done);
        });
    });

    describe('first method', function() {
        it('should return promise', function() {
            expect(this.element.first().then).to.be.a('function');
        });

        it('should resolve with element on zeroth index', function(done) {
            this.element.first().then(function(element) {
                expect(element).to.be(this.elements[0]);
            }.bind(this)).then(done);
        });
    });

    describe('last method', function() {
        it('should return promise', function() {
            expect(this.element.last().then).to.be.a('function');
        });

        it('should resolve with element on zeroth index', function(done) {
            this.element.last().then(function(element) {
                expect(element).to.be(this.elements[this.elements.length - 1]);
            }.bind(this)).then(done);
        });
    });

    describe('unique method', function() {
        it('should return AaaitElement', function() {
            expect(this.element.unique()).to.be.an(AaaitElement);
        });

        it('should resolve with array of unique elements', function(done) {
            this.element.unique().elements().then(function(elements) {
                expect(elements).to.eql([2, 3].map(e));
            }.bind(this)).then(done, done);
        });
    });

    describe('filter method', function() {
        it('should return AaaitElement', function() {
            expect(this.element.filter()).to.be.an(AaaitElement);
        });

        it('should resolve with filtered elements', function(done) {
            var parent = e(100);

            sinon.stub(parent, 'elements').returns(new Q([1, 2, 3, 4].map(e)));
            sinon.stub(this.element, 'parent').returns(new AaaitElement([parent]));

            this.element.filter().elements().then(function(elements) {
                expect(elements).to.eql([2, 3].map(e));
            }.bind(this)).then(done, done);
        });
    });

    describe('find method', function() {
        it('should return promise', function() {
            expect(this.element.find().then).to.be.a('function');
        });

        it('should resolve with array of unique found elements', function(done) {
            sinon.stub(this.elements[0], 'elements').returns(new Q([4, 5].map(e)));
            sinon.stub(this.elements[1], 'elements').returns(new Q([4, 5, 6].map(e)));
            sinon.stub(this.elements[2], 'elements').returns(new Q([7].map(e)));

            this.element.find(1).then(function(elements) {
                expect(elements).to.eql([4, 5, 6, 7].map(e));
            }.bind(this)).then(done, done);
        });
    });

    describe('parent method', function() {
        it('should return AaaitElement', function() {
            expect(this.element.parent()).to.be.an(AaaitElement);
        });

        it('should invoke elements method all WDElements in collection', function(done) {
            sinon.stub(this.elements[0], 'elements').returns(new Q([4].map(e)));
            sinon.stub(this.elements[1], 'elements').returns(new Q([5].map(e)));
            sinon.stub(this.elements[2], 'elements').returns(new Q([6].map(e)));

            this.element.parent().then(function() {
                expect(this.elements[0].elements).was.calledOnce();
                expect(this.elements[0].elements).was.calledWithExactly('xpath', '..');
                expect(this.elements[1].elements).was.calledOnce();
                expect(this.elements[1].elements).was.calledWithExactly('xpath', '..');
                expect(this.elements[2].elements).was.calledOnce();
                expect(this.elements[2].elements).was.calledWithExactly('xpath', '..');
            }.bind(this)).then(done, done);
        });
    });

    describe('length method', function() {
        it('should return promise', function() {
            expect(this.element.length().then).to.be.a('function');
        });

        it('should resolve with number of elements', function(done) {
            this.element.length().then(function(length) {
                expect(length).to.be(this.elements.length);
            }.bind(this)).then(done, done);
        });
    });

    describe('attr method', function() {
        it('should return promise', function() {
            expect(this.element.attr().then).to.be.a('function');
        });

        it('should resolve with element attribute', function(done) {
            sinon.stub(this.elements[0], 'getAttribute').returns(new Q('element-id'));

            this.element.attr('id').then(function(id) {
                expect(id).to.be('element-id');
            }.bind(this)).then(done, done);
        });
    });

    describe('offset method', function() {
        it('should return promise', function() {
            expect(this.element.offset().then).to.be.a('function');
        });

        it('should resolve with element location', function(done) {
            sinon.stub(this.elements[0], 'getLocation').returns(new Q({x: 10, y: 10}));

            this.element.offset().then(function(offset) {
                expect(offset).to.eql({x: 10, y: 10});
            }.bind(this)).then(done, done);
        });
    });

    describe('offsetInView method', function() {
        it('should return promise', function() {
            expect(this.element.offsetInView().then).to.be.a('function');
        });

        it('should resolve with element location', function(done) {
            sinon.stub(this.elements[0], 'getLocationInView').returns(new Q({x: 10, y: 30}));

            this.element.offsetInView().then(function(offset) {
                expect(offset).to.eql({x: 10, y: 30});
            }.bind(this)).then(done, done);
        });
    });

    describe('size method', function() {
        it('should return promise', function() {
            expect(this.element.size().then).to.be.a('function');
        });

        it('should resolve with element size', function(done) {
            sinon.stub(this.elements[0], 'getSize').returns(new Q({width: 5, height: 10}));

            this.element.size().then(function(size) {
                expect(size).to.eql({width: 5, height: 10});
            }.bind(this)).then(done, done);
        });
    });

    describe('css method', function() {
        beforeEach(function() {
            var map = {
                background: 'transparent',
                color: 'black'
            };

            sinon.stub(this.elements[0], 'getComputedCss', function(property) {
                return new Q(map[property]);
            });
        });

        it('should return promise', function() {
            expect(this.element.css().then).to.be.a('function');
        });

        it('should resolve with property value of string was passed in', function(done) {
            this.element.css('background').then(function(value) {
                expect(value).to.be('transparent');
            }.bind(this)).then(done, done);
        });

        it('should resolve with properties hash if an array of properties was passed in', function(done) {
            this.element.css(['background', 'color']).then(function(value) {
                expect(value).to.eql({
                    background: 'transparent',
                    color: 'black'
                });
            }.bind(this)).then(done, done);
        });

        it('should resolve with properties hash if multiple arguments were passed in', function(done) {
            this.element.css('background', 'color').then(function(value) {
                expect(value).to.eql({
                    background: 'transparent',
                    color: 'black'
                });
            }.bind(this)).then(done, done);
        });
    });

    describe('text method', function() {
        it('should return promise', function() {
            expect(this.element.text().then).to.be.a('function');
        });

        it('should resolve with element size', function(done) {
            sinon.stub(this.elements[0], 'text').returns(new Q('some text value'));

            this.element.text().then(function(value) {
                expect(value).to.be('some text value');
            }.bind(this)).then(done, done);
        });
    });

    describe('tagName method', function() {
        it('should return promise', function() {
            expect(this.element.tagName().then).to.be.a('function');
        });

        it('should resolve with tag name', function(done) {
            sinon.stub(this.elements[0], 'getTagName').returns(new Q('canvas'));

            this.element.tagName().then(function(value) {
                expect(value).to.be('canvas');
            }.bind(this)).then(done, done);
        });
    });

    describe('type method', function() {
        it('should return the original element', function() {
            expect(this.element.type('string')).to.be(this.element);
        });

        it('should invoke type method on first WDElement in collection', function(done) {
            sinon.stub(this.elements[0], 'type').returns(new Q());

            this.element.type('string').then(function(value) {
                expect(this.elements[0].type).was.calledWith('string');
            }.bind(this)).then(done, done);
        });

        it('should delay other calls', function(done) {
            var deferred = Q.defer();
            var element = this.elements[0];

            sinon.stub(element, 'text').returns(new Q('some text'));
            sinon.stub(element, 'type').returns(deferred.promise);

            this.element.type('string').text().then(function(value) {
                expect(element.type.calledBefore(element.text)).to.be(true);
            }.bind(this)).then(done, done);

            expect(element.text).was.notCalled();

            deferred.resolve();
        });
    });

    describe('clear method', function() {
        it('should return the original element', function() {
            expect(this.element.clear()).to.be(this.element);
        });

        it('should invoke type method on first WDElement in collection', function(done) {
            sinon.stub(this.elements[0], 'clear').returns(new Q());

            this.element.clear().then(function(value) {
                expect(this.elements[0].clear).was.calledOnce();
            }.bind(this)).then(done, done);
        });

        it('should delay other calls', function(done) {
            var deferred = Q.defer();
            var element = this.elements[0];

            sinon.stub(element, 'text').returns(new Q('some text'));
            sinon.stub(element, 'clear').returns(deferred.promise);

            this.element.clear().text().then(function(value) {
                expect(element.clear.calledBefore(element.text)).to.be(true);
            }.bind(this)).then(done, done);

            expect(element.text).was.notCalled();

            deferred.resolve();
        });
    });

    describe('click method', function() {
        it('should return the original element', function() {
            expect(this.element.click()).to.be(this.element);
        });

        it('should invoke click method on first WDElement in collection', function(done) {
            sinon.stub(this.elements[0], 'click').returns(new Q());

            this.element.click().then(function(value) {
                expect(this.elements[0].click).was.calledOnce();
            }.bind(this)).then(done, done);
        });

        it('should delay other calls', function(done) {
            var deferred = Q.defer();
            var element = this.elements[0];

            sinon.stub(element, 'text').returns(new Q('some text'));
            sinon.stub(element, 'click').returns(deferred.promise);

            this.element.click().text().then(function(value) {
                expect(element.click.calledBefore(element.text)).to.be(true);
            }.bind(this)).then(done, done);

            expect(element.text).was.notCalled();

            deferred.resolve();
        });
    });

    describe('doubleClick method', function() {
        it('should return the original element', function() {
            expect(this.element.doubleClick()).to.be(this.element);
        });

        it('should invoke doubleClick method on first WDElement in collection', function(done) {
            sinon.stub(this.elements[0], 'doubleClick').returns(new Q());

            this.element.doubleClick().then(function(value) {
                expect(this.elements[0].doubleClick).was.calledOnce();
            }.bind(this)).then(done, done);
        });

        it('should delay other calls', function(done) {
            var deferred = Q.defer();
            var element = this.elements[0];

            sinon.stub(element, 'text').returns(new Q('some text'));
            sinon.stub(element, 'doubleClick').returns(deferred.promise);

            this.element.doubleClick().text().then(function(value) {
                expect(element.doubleClick.calledBefore(element.text)).to.be(true);
            }.bind(this)).then(done, done);

            expect(element.text).was.notCalled();

            deferred.resolve();
        });
    });

    describe('tap method', function() {
        it('should return the original element', function() {
            expect(this.element.tap()).to.be(this.element);
        });

        it('should invoke tap method on first WDElement in collection', function(done) {
            sinon.stub(this.elements[0], 'tap').returns(new Q());

            this.element.tap().then(function(value) {
                expect(this.elements[0].tap).was.calledOnce();
            }.bind(this)).then(done, done);
        });

        it('should delay other calls', function(done) {
            var deferred = Q.defer();
            var element = this.elements[0];

            sinon.stub(element, 'text').returns(new Q('some text'));
            sinon.stub(element, 'tap').returns(deferred.promise);

            this.element.tap().text().then(function(value) {
                expect(element.tap.calledBefore(element.text)).to.be(true);
            }.bind(this)).then(done, done);

            expect(element.text).was.notCalled();

            deferred.resolve();
        });
    });
});
