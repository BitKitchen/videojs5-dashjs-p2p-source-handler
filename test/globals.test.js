(function(window, videojs, qunit) {
    'use strict';

    var
        // local QUnit aliases
        // http://api.qunitjs.com/

        // module(name, {[setup][ ,teardown]})
        module = qunit.module,
        // test(name, callback)
        test = qunit.test;

    module('videojs-dash globals');

    test('has expected globals', function(assert) {
        assert.ok(videojs.Html5DashJS, 'videojs has "Html5Dash" property');
    });

})(window, window.videojs, window.QUnit);
