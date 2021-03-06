describe('test angular module', function () {
    const EVENT_NAME = 'ev1';
    const EVENT_NAME_2 = 'ev2';
    const user = { id: 1, name: 'John' };

    var $eventHandler;
    var $controller;

    beforeEach(module('test-app'));
    beforeEach(module('simple-event-handler'));
    beforeEach(inject(function(_$eventHandler_, _$controller_){
        $eventHandler = _$eventHandler_;
        $controller = _$controller_;
    }));

    describe('$eventHandler', function () {
        it('smoke test', function () {
            //given:
            var result = false;
            var handler = function () { result = true; };

            //when:
            $eventHandler.subscribe(EVENT_NAME, handler);
            $eventHandler.fire(EVENT_NAME);

            //then:
            expect(result).toEqual(true);

            //when:
            $eventHandler.unsubscribe(EVENT_NAME, handler);
            result = false;
            $eventHandler.fire(EVENT_NAME);

            //then:
            expect(result).toEqual(false);
        });

        it('smoke test .on .off .emit', function () {
            //given:
            var result = false;
            var handler = function () { result = true; };

            //when:
            $eventHandler.on(EVENT_NAME, handler);
            $eventHandler.emit(EVENT_NAME);

            //then:
            expect(result).toEqual(true);

            //when:
            $eventHandler.off(EVENT_NAME, handler);
            result = false;
            $eventHandler.emit(EVENT_NAME);

            //then:
            expect(result).toEqual(false);
        });

        it('two handlers: same event', function () {
            //given:
            var result = 0;

            $eventHandler.subscribe(EVENT_NAME, function () {
                result++;
            });

            $eventHandler.subscribe(EVENT_NAME, function () {
                result+=2;
            });

            //when:
            $eventHandler.fire(EVENT_NAME);

            //then:
            expect(result).toEqual(3);
        });

        it('two handlers: queue', function () {
            //given:
            var result;

            $eventHandler.subscribe(EVENT_NAME, function () {
                result = 10;
            });

            $eventHandler.subscribe(EVENT_NAME, function () {
                result = 20;
            });

            //when:
            $eventHandler.fire(EVENT_NAME);

            //then:
            expect(result).toEqual(20);
        });

        it('two different events', function () {
            //given:
            var ev1Called = false;
            var ev2Called = false;

            $eventHandler.subscribe(EVENT_NAME, function () {
                ev1Called = true;
            });

            $eventHandler.subscribe(EVENT_NAME_2, function () {
                ev2Called = true;
            });

            //when:
            $eventHandler.fire(EVENT_NAME);
            $eventHandler.fire(EVENT_NAME_2);

            //then:
            expect(ev1Called).toEqual(true);
            expect(ev2Called).toEqual(true);
        });
    });

    describe('$eventHandler#subscribe', function () {

        it('without parameters', function () {
            expect(function () {
                $eventHandler.subscribe();
            }).toThrow();
        });

        it('without event name', function () {
            expect(function () {
                $eventHandler.subscribe(null, function () {});
            }).toThrow();
        });

        it('object instead of event name', function () {
            expect(function () {
                $eventHandler.subscribe(user, function () {});
            }).toThrow();
        });

        it('without callback function', function () {
            expect(function () {
                $eventHandler.subscribe(EVENT_NAME)
            }).toThrow();
        });

        it('object instead of callback function', function () {
            expect(function () {
                $eventHandler.subscribe(EVENT_NAME, user)
            }).toThrow();
        });

        it('multi-subscribe: success', function () {
            //given:
            var result = false;
            var handler = function () { result = true; };

            //when:
            $eventHandler.subscribe([EVENT_NAME, EVENT_NAME_2], handler);

            //then: default state
            expect(result).toEqual(false);

            //when:
            $eventHandler.fire(EVENT_NAME);

            //then:
            expect(result).toEqual(true);

            //when: reset result and fire second event
            result = false;
            $eventHandler.fire(EVENT_NAME_2);

            //then:
            expect(result).toEqual(true);

            //when:
            result = false;
            $eventHandler.unsubscribe(EVENT_NAME, handler);
            $eventHandler.unsubscribe(EVENT_NAME_2, handler);
            //and:
            $eventHandler.fire(EVENT_NAME);
            $eventHandler.fire(EVENT_NAME_2);

            //then:
            expect(result).toEqual(false);
        });

        it('multi-subscribe: fail', function () {
            //given:
            var result = false;
            var handler = function () { result = true; };

            //when: incorrect name
            expect(function () {
                $eventHandler.subscribe([EVENT_NAME, null], handler);
            }).toThrow();

            expect(function () {
                $eventHandler.subscribe([EVENT_NAME, ''], handler);
            }).toThrow();

            expect(function () {
                $eventHandler.subscribe([EVENT_NAME, 1], handler);
            }).toThrow();

            expect(function () {
                $eventHandler.subscribe([EVENT_NAME, 0], handler);
            }).toThrow();

            //when: empty array
            expect(function () {
                $eventHandler.subscribe([], handler);
            }).toThrow();
        });
    });

    describe('$eventHandler#once', function () {
        it('should be executed only one time', function () {
            //given:
            var result = 0;

            $eventHandler.once(EVENT_NAME, function () {
                result++;
            });

            //when:
            $eventHandler.fire(EVENT_NAME);

            //then:
            expect(result).toEqual(1);

            //when:
            $eventHandler.fire(EVENT_NAME);

            //then:
            expect(result).toEqual(1);
        });

        it('should unsubscribe even on fail', function () {
            //given:
            $eventHandler.once(EVENT_NAME, function () {
                throw new Error('error')
            });

            //when:
            expect(function () {
                $eventHandler.fire(EVENT_NAME);
            }).toThrow();

            expect(function () {
                $eventHandler.fire(EVENT_NAME);
            }).not.toThrow();
        });

        it('without parameters', function () {
            expect(function () {
                $eventHandler.once();
            }).toThrow();
        });

        it('without event name', function () {
            expect(function () {
                $eventHandler.once(null, function () {});
            }).toThrow();
        });

        it('object instead of event name', function () {
            expect(function () {
                $eventHandler.once(user, function () {});
            }).toThrow();
        });

        it('without callback function', function () {
            expect(function () {
                $eventHandler.once(EVENT_NAME)
            }).toThrow();
        });

        it('object instead of callback function', function () {
            expect(function () {
                $eventHandler.once(EVENT_NAME, user)
            }).toThrow();
        });

        it('multi-subscribe: success', function () {
            //given:
            var result = false;
            var handler = function () { result = true; };

            //when:
            $eventHandler.once([EVENT_NAME, EVENT_NAME_2], handler);

            //then: default state
            expect(result).toEqual(false);

            //when:
            $eventHandler.fire(EVENT_NAME);

            //then:
            expect(result).toEqual(true);

            //when: reset result and fire second event
            result = false;
            $eventHandler.fire(EVENT_NAME_2);

            //then:
            expect(result).toEqual(true);

            //when:
            result = false;
            $eventHandler.fire(EVENT_NAME);
            $eventHandler.fire(EVENT_NAME_2);

            //then:
            expect(result).toEqual(false);
        });

        it('multi-subscribe: fail', function () {
            //given:
            var handler = function () {
                throw new Error('error');
            };

            //when: incorrect name
            expect(function () {
                $eventHandler.once([EVENT_NAME, null], handler);
            }).toThrow();

            expect(function () {
                $eventHandler.once([EVENT_NAME, ''], handler);
            }).toThrow();

            expect(function () {
                $eventHandler.once([EVENT_NAME, 1], handler);
            }).toThrow();

            expect(function () {
                $eventHandler.once([EVENT_NAME, 0], handler);
            }).toThrow();

            //when: empty array
            expect(function () {
                $eventHandler.once([], handler);
            }).toThrow();

            $eventHandler.once([EVENT_NAME, EVENT_NAME_2], handler);
            expect(function () {
                $eventHandler.fire(EVENT_NAME);
            }).toThrow();

            expect(function () {
                $eventHandler.fire(EVENT_NAME);
            }).not.toThrow();

            expect(function () {
                $eventHandler.fire(EVENT_NAME_2);
            }).toThrow();

            expect(function () {
                $eventHandler.fire(EVENT_NAME_2);
            }).not.toThrow();
        });
    });

    describe('$eventHandler: controller with $scope', function () {

        it('auto subscribe and auto unsubscribe', function () {
            //given:
            var savedDestroyCallback = null;
            var $scope = {
                $on: function (eventName, callback) {
                    if(eventName == '$destroy') {
                        savedDestroyCallback = callback;
                    }
                }
            };

            expect(savedDestroyCallback).toEqual(null);

            //when: init controller
            var controller = $controller('EventController', { $scope: $scope });

            //then:
            expect(controller.getResult()).toEqual(false);
            expect(savedDestroyCallback).not.toEqual(null);

            //when:
            $eventHandler.fire('test-event');

            //then:
            expect(controller.getResult()).toEqual(true);

            //when:
            var newResult = 'test';
            controller.setResult(newResult);

            //then:
            expect(controller.getResult()).toEqual(newResult);

            //when: emulating $destroy action of angular $scope
            savedDestroyCallback();
            $eventHandler.fire('test-event');

            //then: nothing happens
            expect(controller.getResult()).toEqual(newResult);
        });
    });

    describe('$eventHandler#unsubscribe', function () {
        it('unsubscribe from event without subscriptions', function () {
            expect(function () {
                $eventHandler.unsubscribe(EVENT_NAME, function () {});
            }).not.toThrow();

            expect(function () {
                $eventHandler.off(EVENT_NAME, function () {});
            }).not.toThrow();
        })
    });

    describe('$eventHandler#unsubscribeAll/#offAll', function () {
        it('unsubscribe from event without subscriptions', function () {
            expect(function () {
                $eventHandler.unsubscribeAll(EVENT_NAME);
            }).not.toThrow();

            expect(function () {
                $eventHandler.offAll(EVENT_NAME);
            }).not.toThrow();
        });

        it('multi-subscribe and unsubscribe all', function () {
            //given:
            var result = 0;
            var handler = function () { result = 1; };
            var handler2 = function () { result = 2; };

            //when:
            $eventHandler.subscribe([EVENT_NAME, EVENT_NAME_2], handler);
            $eventHandler.subscribe([EVENT_NAME, EVENT_NAME_2], handler2);

            //then: default state
            expect(result).toEqual(0);

            //when:
            $eventHandler.fire(EVENT_NAME);

            //then:
            expect(result).toEqual(2);

            //when: reset result and fire second event
            result = 0;
            $eventHandler.fire(EVENT_NAME_2);

            //then:
            expect(result).toEqual(2);

            //when:
            result = 0;
            $eventHandler.unsubscribeAll(EVENT_NAME);
            $eventHandler.offAll(EVENT_NAME_2);
            //and:
            $eventHandler.fire(EVENT_NAME);
            $eventHandler.fire(EVENT_NAME_2);

            //then:
            expect(result).toEqual(0);
        });
    });

    describe('$eventHandler#fire', function () {
        it('5 times', function () {
            //given:
            var result = 0;

            $eventHandler.subscribe(EVENT_NAME, function () {
                result++;
            });

            //when:
            $eventHandler.fire(EVENT_NAME);
            $eventHandler.fire(EVENT_NAME);
            $eventHandler.fire(EVENT_NAME);
            $eventHandler.fire(EVENT_NAME);
            $eventHandler.fire(EVENT_NAME);

            //then:
            expect(result).toEqual(5);
        });

        it('with data: number', function () {
            //given:
            var result = null;

            $eventHandler.subscribe(EVENT_NAME, function (data) {
                result = data;
            });

            //when:
            $eventHandler.fire(EVENT_NAME, 22);

            //then:
            expect(result).toEqual(22);
        });

        it('with data: 0 number', function () {
            //given:
            var result = null;

            $eventHandler.subscribe(EVENT_NAME, function (data) {
                result = data;
            });

            //when:
            $eventHandler.fire(EVENT_NAME, 0);

            //then:
            expect(result).toEqual(0);
        });

        it('with data: empty string', function () {
            //given:
            var result = null;

            $eventHandler.subscribe(EVENT_NAME, function (data) {
                result = data;
            });

            //when:
            $eventHandler.fire(EVENT_NAME, '');

            //then:
            expect(result).toEqual('');
        });

        it('with data: object', function () {
            //given:
            var result = null;

            $eventHandler.subscribe(EVENT_NAME, function (data) {
                result = data;
            });

            //when:
            $eventHandler.fire(EVENT_NAME, user);

            //then:
            expect(result).toEqual(user);
            expect(result.id).toEqual(1);
            expect(result.name).toEqual('John');
        });

        it('with data: shared between subscribers', function () {
            //given:
            var data = {
                counter: 0
            };

            $eventHandler.subscribe(EVENT_NAME, function (data) {
                data.counter++
            });

            //when:
            $eventHandler.fire(EVENT_NAME, data);
            $eventHandler.fire(EVENT_NAME, data);
            $eventHandler.fire(EVENT_NAME, data);

            //then:
            expect(data.counter).toEqual(3);
        });

        it('if one of the callbacks throws the exception', function () {
            //given:
            var data = {
                counter: 0
            };

            //when:
            $eventHandler.subscribe(EVENT_NAME, function (data) {
                data.counter++
            });

            $eventHandler.subscribe(EVENT_NAME, function (data) {
                throw new Error('something went wrong inside one of the subscribers')
            });

            //when:
            expect(function () {
                $eventHandler.fire(EVENT_NAME, data)
            }).toThrow();

            //then:
            expect(data.counter).toEqual(1);
        });

        it('if nothing to fire', function () {
            expect(function () {
                $eventHandler.fire(EVENT_NAME)
            }).not.toThrow();
        });
    });

    describe('$eventHandler: method chaining', function () {
        it('should be executed only one time', function () {
            //given:
            var result = 0;
            var handler = function (data) {
                result = result + data;
            };

            //when:
            expect(function () {
                $eventHandler
                    .once(EVENT_NAME, function () {
                        result++;
                    })
                    .fire(EVENT_NAME) // result = 1
                    .fire(EVENT_NAME) // result = 1
                    .subscribe(EVENT_NAME, handler)
                    .emit(EVENT_NAME, 10) // result = 11
                    .on(EVENT_NAME, function (data) {
                        result = result * 2 - data;
                    })
                    .fire(EVENT_NAME, 5) // result = ((11 + 5) * 2) - 5 = 27
                    .offAll(EVENT_NAME) // removes everything
                    .emit(EVENT_NAME) // no handlers to execute
                    .fire(EVENT_NAME) // no handlers to execute
                    .on(EVENT_NAME_2, handler)
                    .fire(EVENT_NAME_2, 3) // result = 27 + 3 = 30
                    .unsubscribe(EVENT_NAME_2, handler)
                    .fire(EVENT_NAME_2, 20); // no handlers to execute

            }).not.toThrow();

            //then:
            expect(result).toEqual(30);
        });
    });
});