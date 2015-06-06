// qJS core tests

var T = QUnit;

T.test("Q object defined",function(assert){
    assert.ok(Q,"Q object exists");
});

T.test("require function referential to Q function",function(assert) {
    assert.equal(window.require,window.Q,"require is referential to Q");
});

T.test("module loading from file",function(assert) {
    (function(Q) {
        var module = new Q.module('test-module-1');

        module.jQueryRequired = false;
    })(Q);

    assert.ok(Q.getModule('test-module-1'),"module exists");
});

T.test("accessing a module method",function(assert){
    (function(Q){
        var module = new Q.module('test-module-2');

        module.jQueryRequired = false;

        module.doubleInput = function(input){
            return input*2;
        };
    })(Q);

    assert.equal(Q.getModule('test-module-2').doubleInput(4),8,"module method was called and returned correctly");
});

T.test("event binding and triggering",function(assert){
    var done = assert.async();

    (function(Q){
        var module = new Q.module('test-module-3');

        module.jQueryRequired = false;

        module.on('test-event',function(){
            assert.ok(true,"test-event fired.");
            done();
        });
    })(Q);

    Q.getModule('test-module-3').trigger('test-event');
});
