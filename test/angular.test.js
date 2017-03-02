describe('test angular module', function () {
    const EVENT_NAME = 'ev1';
    const EVENT_NAME_2 = 'ev2';
    var $eventHandler;
    var $controller;
    var obj = {name: 'test'};

    beforeEach(module('test-app'));
    beforeEach(module('angular-event-handler'));
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
                $eventHandler.subscribe(obj, function () {});
            }).toThrow();
        });

        it('without callback function', function () {
            expect(function () {
                $eventHandler.subscribe(EVENT_NAME)
            }).toThrow();
        });

        it('object instead of callback function', function () {
            expect(function () {
                $eventHandler.subscribe(EVENT_NAME, obj)
            }).toThrow();
        });
    });

    describe('$eventHandler#unsubscribe', function () {
        it('without parameters', function () {
            expect(function () {
                $eventHandler.unsubscribe();
            }).toThrow();
        });

        it('without event name', function () {
            expect(function () {
                $eventHandler.unsubscribe(null, function () {});
            }).toThrow();
        });

        it('object instead of event name', function () {
            expect(function () {
                $eventHandler.unsubscribe(obj, function () {});
            }).toThrow();
        });

        it('without callback function', function () {
            expect(function () {
                $eventHandler.unsubscribe(EVENT_NAME)
            }).toThrow();
        });

        it('object instead of callback function', function () {
            expect(function () {
                $eventHandler.unsubscribe(EVENT_NAME, obj)
            }).toThrow();
        });

        it('if nothing to unsubscribe', function () {
            expect(function () {
                $eventHandler.unsubscribe(EVENT_NAME, function () {})
            }).not.toThrow();
        });

        it('if everything is fine', function () {
            expect(function () {
                $eventHandler.unsubscribe(EVENT_NAME, function () {})
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
            var controller = $controller('EventController', { $scope: $scope, $eventHandler: $eventHandler });

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

            //then: nothing happens
            expect(controller.getResult()).toEqual(newResult);
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

        it('if nothing to fire', function () {
            expect(function () {
                $eventHandler.fire(EVENT_NAME)
            }).not.toThrow();
        });
    });
});