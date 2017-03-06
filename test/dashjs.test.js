(function(window, videojs, dashjs, qunit) {
    'use strict';

    var
        // local QUnit aliases
        // http://api.qunitjs.com/

        // test(name, callback)
        test = qunit.test,

        sampleSrc = {
            src: 'movie.mpd',
            type: 'application/dash+xml',
            keySystemOptions: [
                {
                    name: 'com.widevine.alpha',
                    options: {
                        extra: 'data',
                        licenseUrl: 'https://example.com/license'
                    }
                }
            ]
        },
        sampleSrcNoDRM = {
            src: 'movie.mpd',
            type: 'application/dash+xml'
        },
        testHandleSource = function (assert, source, expectedKeySystemOptions, limitBitrateByPortal) {
            var
                startupCalled = false,
                attachViewCalled = false,
                setLimitBitrateByPortalCalled = false,
                setLimitBitrateByPortalValue = null,
                el = document.createElement('div'),
                parentEl = document.createElement('div'),
                Html5,
                tech,
                options,

                // stubs
                origMediaPlayer = dashjs.MediaPlayer,
                origVJSXHR = videojs.xhr,
                origResetSrc = videojs.Html5DashJS.prototype.resetSrc_;

            assert.expect(6);

            // Default limitBitrateByPortal to false
            limitBitrateByPortal = limitBitrateByPortal || false; // eslint-disable-line no-param-reassign

            el.setAttribute('id', 'test-vid');
            el.pause = el.load = function() {};
            parentEl.appendChild(el);
            document.body.appendChild(parentEl);

            Html5 = videojs.getComponent('Html5');
            tech = new Html5({
                playerId: el.getAttribute('id')
            });
            options = {
                playerId: el.getAttribute('id'),
                dash: {
                    limitBitrateByPortal: limitBitrateByPortal
                },
                streamroot: {
                    p2pConfig: {
                        streamrootKey: 'key',
                        debug: true
                    }
                }
            };
            tech.el = function() { return el; };
            tech.triggerReady = function() { };
            parentEl.appendChild(el);

            dashjs.MediaPlayer = function () {
                return {
                    create: function () {
                        return {
                            extend: function() {
                            },
                            initialize: function () {
                                startupCalled = true;
                            },
                            on: function() {
                            },

                            attachView: function () {
                                attachViewCalled = true;
                            },
                            setProtectionData: function (keySystemOptions) {
                                assert.deepEqual(keySystemOptions, expectedKeySystemOptions,
                                'src and manifest key system options are merged');
                            },
                            attachSource: function (manifest) {
                                assert.deepEqual(manifest, source.src, 'manifest url is sent to attachSource');

                                assert.strictEqual(setLimitBitrateByPortalCalled, true,
                                'MediaPlayer.setLimitBitrateByPortal was called');
                                assert.strictEqual(setLimitBitrateByPortalValue, limitBitrateByPortal,
                                'MediaPlayer.setLimitBitrateByPortal was called with the correct value');
                                assert.strictEqual(startupCalled, true, 'MediaPlayer.startup was called');
                                assert.strictEqual(attachViewCalled, true, 'MediaPlayer.attachView was called');

                                tech.dispose();

                                // Restore
                                dashjs.MediaPlayer = origMediaPlayer;
                                videojs.xhr = origVJSXHR;
                                videojs.Html5DashJS.prototype.resetSrc_ = origResetSrc;
                            },

                            setLimitBitrateByPortal: function (value) {
                                setLimitBitrateByPortalCalled = true;
                                setLimitBitrateByPortalValue = value;
                            },
                            setLiveDelay: function () {
                            }
                        };
                    }
                };
            };

            // We have to override this because PhantomJS does not have Encrypted Media Extensions
            videojs.Html5DashJS.prototype.resetSrc_ = function (fn) {
                return fn();
            };

            var dashSourceHandler = Html5.selectSourceHandler(source);
            dashSourceHandler.handleSource(source, tech, options);

            el.dispatchEvent(new Event('play'));
        };

    qunit.module('videojs-dash dash.js SourceHandler', {
        setup: function() {

        },
        teardown: function() {
            videojs.Html5DashJS.updateSourceData = undefined;
        }
    });

    test('validate the Dash.js SourceHandler in Html5', function(assert) {
        var dashSource = {
                src:'some.mpd',
                type:'application/dash+xml'
            },
            maybeDashSource = {
                src:'some.mpd'
            },
            nonDashSource = {
                src:'some.mp4',
                type:'video/mp4'
            };

        var dashSourceHandler = videojs.getComponent('Html5').selectSourceHandler(dashSource);

        assert.ok(dashSourceHandler, 'A DASH handler was found');

        assert.strictEqual(dashSourceHandler.canHandleSource(dashSource), 'probably',
            'canHandleSource with proper mime-type returns "probably"');
        assert.strictEqual(dashSourceHandler.canHandleSource(maybeDashSource), 'maybe',
            'canHandleSource with expected extension returns "maybe"');
        assert.strictEqual(dashSourceHandler.canHandleSource(nonDashSource), '',
            'canHandleSource with anything else returns ""');

        assert.strictEqual(dashSourceHandler.canPlayType(dashSource.type), 'probably',
            'canPlayType with proper mime-type returns "probably"');
        assert.strictEqual(dashSourceHandler.canPlayType(nonDashSource.type), '',
            'canPlayType with anything else returns ""');
    });

    test('validate buildDashJSProtData function', function(assert) {
        var output = videojs.Html5DashJS.buildDashJSProtData(sampleSrc.keySystemOptions);

        var empty = videojs.Html5DashJS.buildDashJSProtData(undefined);

        assert.strictEqual(output['com.widevine.alpha'].serverURL, 'https://example.com/license',
            'licenceUrl converted to serverURL');
        assert.deepEqual(empty, {}, 'undefined keySystemOptions returns empty object');
    });

    test('validate handleSource function with src-provided key options', function() {
        var mergedKeySystemOptions = {
            'com.widevine.alpha': {
                extra: 'data',
                serverURL:'https://example.com/license'
            }
        };

        testHandleSource(sampleSrc, mergedKeySystemOptions);
    });

    test('validate handleSource function with "limit bitrate by portal" option', function(assert) {
        var mergedKeySystemOptions = {
            'com.widevine.alpha': {
                extra: 'data',
                serverURL:'https://example.com/license'
            }
        };

        testHandleSource(assert, sampleSrc, mergedKeySystemOptions, true);
    });

    test('validate handleSource function with invalid manifest', function(assert) {
        var mergedKeySystemOptions = {};

        testHandleSource(assert, sampleSrcNoDRM, mergedKeySystemOptions);
    });

    test('update the source keySystemOptions', function(assert) {
        var mergedKeySystemOptions = {
            'com.widevine.alpha': {
                serverURL:'https://example.com/anotherlicense'
            }
        };

        videojs.Html5DashJS.updateSourceData = function(source) {
            source.keySystemOptions = [{
                name: 'com.widevine.alpha',
                options: {
                    serverURL:'https://example.com/anotherlicense'
                }
            }];
            return source;
        };

        testHandleSource(assert, sampleSrc, mergedKeySystemOptions);
    });

})(window, window.videojs, window.dashjs, window.QUnit);
