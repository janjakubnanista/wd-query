// Copyright (C) 2013, GoodData(R) Corporation. All rights reserved.
var expect = require('expect.js');
var sinon = require('sinon');
expect = require('sinon-expect').enhance(expect, sinon, 'was');

var Q = require('Q');
var wd = require('wd');
var WDElement = wd.Element;

// var Element = require('../lib/wd-element');
var WDQuery = require('../lib/wd-query');
var $ = WDQuery;

describe('WDQuery', function() {
    it('should be ok', function() {
        expect(WDQuery).to.be.a('function');
    });

    describe('when invoked', function() {
        describe('with WDElement as first argument', function() {
            it('should not throw exception if context is not passed', function() {
                expect(function() {
                    // WDElement constructor takes value and browser as parameters
                    $(new WDElement('element', {}));
                }).to.not.throwException();
            });

            it('should return Element', function() {
                expect($(new WDElement('element', {}))).to.be.an(Element);
            });
        });

        describe('with AaaitElement as first argument', function() {
            it('should not throw exception if context is not passed', function() {
                expect(function() {
                    $(new Element(['element']));
                }).to.not.throwException();
            });

            it('should return the same Element', function() {
                var element = new Element(['element']);

                expect($(element)).to.be(element);
            });
        });

        describe('with string as first argument', function() {
            beforeEach(function() {
                this.promise = Q.defer();
                this.stub = sinon.stub().returns(this.promise);
                this.context = {
                    elements: this.stub
                };
            });

            it('should throw exception if context is not passed', function() {
                expect(function() {
                    $('body');
                }).to.throwException('Invalid context');
            });

            describe('and WDElement as context', function() {
                it('should not throw exception', function() {
                    expect(function() {
                        $('body', this.context);
                    }.bind(this)).to.not.throwException();
                });

                it('should throw exception if context does not have `elements` method', function() {
                    expect(function() {
                        $('body', {});
                    }).to.throwException('Invalid context');
                });
            });

            describe('and AaaitElement as context', function() {
                it('should not throw exception', function() {
                    expect(function() {
                        $('body', new Element(['element']));
                    }.bind(this)).to.not.throwException();
                });

                it('should call `find` method and return result', function() {
                    var element = new Element(['element']);
                    var children = new Element(['children']);

                    sinon.stub(element, 'find').returns(children);

                    expect($('body', element)).to.be(children);
                    expect(element.find).was.calledOnce();
                });
            });
        });

        describe('with some arbitrary arguments', function() {
            it('should throw exception', function() {
                expect(function() {
                    $({});
                }).to.throwException();

                expect(function() {
                    $(function() {});
                }).to.throwException();
            });
        });
    });
});
