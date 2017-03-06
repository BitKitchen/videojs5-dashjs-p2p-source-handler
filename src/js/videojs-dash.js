import window from 'global/window';
import DashjsP2PBundle from 'streamroot-dashjs-p2p-bundle';

let
  isArray = function(a) {
    return Object.prototype.toString.call(a) === '[object Array]';
  };

/**
 * videojs-contrib-dash
 *
 * Use Dash.js to playback DASH content inside of Video.js via a SourceHandler
 */
class Html5DashJS {
  constructor(source, tech, options) {
    // Get options from tech if not provided for backwards compatibility
    options = options || tech.options_;

    let player = videojs(options.playerId);

    this.tech_ = tech;
    this.el_ = tech.el();
    this.elParent_ = this.el_.parentNode;

    // Do nothing if the src is falsey
    if (!source.src) {
      return;
    }

    // While the manifest is loading and Dash.js has not finished initializing
    // we must defer events and functions calls with isReady_ and then `triggerReady`
    // again later once everything is setup
    tech.isReady_ = false;

    if (Html5DashJS.updateSourceData) {
      source = Html5DashJS.updateSourceData(source);
    }

    let manifestSource = source.src;
    let keySystemOptions = Html5DashJS.buildDashJSProtData(source.keySystemOptions);

    let onVideoPlay = (event) => {
      event.currentTarget.removeEventListener(event.type, onVideoPlay);

      // this fixes an exception in Chrome -- VideoModel.js:88 Uncaught (in promise)
      // DOMException: The play() request was interrupted by a new load request.
      event.currentTarget.pause();
      event.currentTarget.load();

      // Attach the source with any protection data
      this.mediaPlayer_.setProtectionData(keySystemOptions);
      this.mediaPlayer_.attachSource(manifestSource);
    };
    this.el_.addEventListener('play', onVideoPlay);

    // Save the context after the first initialization for subsequent instances
    Html5DashJS.context_ = Html5DashJS.context_ || {};

    // reuse MediaPlayer if it already exists
    if (!this.mediaPlayer_) {
      if (!options || !options.streamroot || !options.streamroot.p2pConfig) {
        throw new Error('p2pConfig is not defined!');
      }

      // initializing streamroot-p2p-bundle
      this.mediaPlayer_ = DashjsP2PBundle.MediaPlayer(Html5DashJS.context_).create(options.streamroot.p2pConfig);
    }

    this.mediaPlayer_.on('manifestloaded', ({data}) => {
      this._duration = data.type === 'static' ? data.mediaPresentationDuration : Infinity;
    });

    // Log MedaPlayer messages through video.js
    if (Html5DashJS.useVideoJSDebug) {
      videojs.log.warn('useVideoJSDebug has been deprecated.' +
        ' Please switch to using beforeInitialize.');
      Html5DashJS.useVideoJSDebug(this.mediaPlayer_);
    }

    if (Html5DashJS.beforeInitialize) {
      Html5DashJS.beforeInitialize(player, this.mediaPlayer_);
    }

    // Must run controller before these two lines or else there is no
    // element to bind to.
    this.mediaPlayer_.initialize();

    // Apply any options that are set
    if (options.dash && options.dash.limitBitrateByPortal) {
      this.mediaPlayer_.setLimitBitrateByPortal(true);
    } else {
      this.mediaPlayer_.setLimitBitrateByPortal(false);
    }

    this.mediaPlayer_.attachView(this.el_);

    this.tech_.triggerReady();
  }

  duration() {
    return this._duration || this.el_.duration || 0;
  }

  /*
   * Iterate over the `keySystemOptions` array and convert each object into
   * the type of object Dash.js expects in the `protData` argument.
   *
   * Also rename 'licenseUrl' property in the options to an 'serverURL' property
   */
  static buildDashJSProtData(keySystemOptions) {
    let output = {};

    if (!keySystemOptions || !isArray(keySystemOptions)) {
      return output;
    }

    for (let i = 0; i < keySystemOptions.length; i++) {
      let keySystem = keySystemOptions[i];
      let options = videojs.mergeOptions({}, keySystem.options);

      if (options.licenseUrl) {
        options.serverURL = options.licenseUrl;
        delete options.licenseUrl;
      }

      output[keySystem.name] = options;
    }

    return output;
  }

  dispose() {
    if (this.mediaPlayer_) {
      this.mediaPlayer_.reset();
    }
  }
}

videojs.DashSourceHandler = function() {
  return {
    canHandleSource: function(source) {
      let dashExtRE = /\.mpd/i;

      if (videojs.DashSourceHandler.canPlayType(source.type)) {
        return 'probably';
      } else if (dashExtRE.test(source.src)) {
        return 'maybe';
      } else {
        return '';
      }
    },

    handleSource: function(source, tech, options) {
      return new Html5DashJS(source, tech, options);
    },

    canPlayType: function(type) {
      return videojs.DashSourceHandler.canPlayType(type);
    }
  };
};

videojs.DashSourceHandler.canPlayType = function(type) {
  let dashTypeRE = /^application\/dash\+xml/i;
  if (dashTypeRE.test(type)) {
    return 'probably';
  }

  return '';
};

// Only add the SourceHandler if the browser supports MediaSourceExtensions
if (!!window.MediaSource) {
  videojs.getComponent('Html5').registerSourceHandler(videojs.DashSourceHandler(), 0);
}

videojs.Html5DashJS = Html5DashJS;
export default Html5DashJS;
