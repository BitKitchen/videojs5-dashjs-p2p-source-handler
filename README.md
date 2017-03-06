# video.js MPEG-DASH Source Handler with integrated Streamroot dashjs p2p module

A video.js source handler for supporting MPEG-DASH playback over P2P or CDN through a video.js player on browsers with support for Media Source Extensions.

## Getting started

Run `npm install` to install necessary dependencies such as [streamroot-dashjs-p2p-bundle](https://github.com/streamroot/dashjs-p2p-wrapper).

After installation is complete, run `npm run build` to build the source handler.

The built files will be placed into `dist` directory.

In addition to built files, you'll need to include [video.js 5.0+](http://videojs.com/getting-started/) in your web page(see [Known limitations](#known-limitations) section for more info).

To enable a graphic visualization of P2P traffic (as a debug tool), you can add following lines to your page. Note that in this case, `p2pConfig` must include `debug: true` as described [here](https://streamroot.readme.io/docs/p2p-config) :

```html
<div id="streamroot-graphs"></div>
<script src="https://tools.streamroot.io/usage-graphs/latest/graphs.js"></script>
```

Putting it all together:
```html
<html>
<head>

  <!-- video.js -->
  <link href="//vjs.zencdn.net/5.8/video-js.min.css" rel="stylesheet">
  <script src="//vjs.zencdn.net/5.8/video.min.js"></script>

  <!-- videojs-contrib-dash script -->
  <script src="dist/videojs5-dashjs-p2p-source-handler.js"></script>
</head>
<body>
  <div>
      <video id="video_element" width="480" height="360" controls muted class="video-js vjs-default-skin" />
  </div>

  <script>

    var options = {
        html5: {
            dash: {
              limitBitrateByPortal: true
            },
            streamroot: {
                p2pConfig: {
                    streamrootKey: "YOUR_STREAMROOTKEY_HERE",
                    debug: true
                }
            }
        }
    };

    var player = videojs('video_element', options);
    player.ready(function() {
      player.src({
        src: 'http://dash.edgesuite.net/envivio/EnvivioDash3/manifest.mpd',
        type: 'application/dash+xml'
      });
    });
  </script>

  <div id="streamroot-graphs"></div>
  <script src="https://tools.streamroot.io/usage-graphs/latest/graphs.js"></script>
</body>
</html>
```

## Example

Checkout [live example here](http://streamroot.github.io/videojs5-dashjs-p2p-source-handler/).

You can select a sample MPD using combox above the video. You can also pass an arbitary manifest url to the test page as a get param like this: `http://streamroot.github.io/videojs5-dashjs-p2p-source-handler/?mpd=encodeURIComponent_manifest_url_here`. Don't forget to `encodeURIComponent` it first.

Below the video you can see p2p statistics & graphs.
For a quick p2p test you can open several tabs with the same manifest and start playback. After a while you should see p2p traffic on the graphs.

## How it works

[streamroot-dashjs-p2p-bundle](https://github.com/streamroot/dashjs-p2p-wrapper) is added as a dependency into `package.json`

```json
  ...
  "dependencies": {
    "global": "^4.3.0",
    "video.js": "^5.0.0",
    "streamroot-dashjs-p2p-bundle": "^1.5.0"
  }
  ...
```

and is imported in [dash.js source handler](https://github.com/streamroot/videojs5-dashjs-p2p-source-handler/blob/master/src/js/videojs-dash.js):

```javascript
import DashjsP2PBundle from 'streamroot-dashjs-p2p-bundle';
```

and instantiated if `p2pConfig` is defined:

```javascript
if (!options || !options.streamroot || !options.streamroot.p2pConfig) {
  throw new Error('p2pConfig is not defined!');
}

// initializing streamroot-p2p-bundle
this.mediaPlayer_ = DashjsP2PBundle.MediaPlayer(Html5DashJS.context_).create(options.streamroot.p2pConfig);
```

p2pConfig is described [here](https://streamroot.readme.io/docs/p2p-config). Check it to get better understanding on what can be configured.
You can get your `streamrootKey` by signing up into [Streamroot's dashboard](http://dashboard.streamroot.io/signup).

## Developing, Testing, Contributing

Contrubtions are very welcome.

1. Please make sure your code is ok with our linting rules by running `npm run lint`.
1. Make sure that it passes integration test by running `npm run karma`. And feel free to add more tests.
1. You can run webpack dev server by `npm run dev` and enjoy automatic rebuild on source files change.
1. Or if you prefer to just have an auot rebuild feature without server use `npm run build:dev`.

## Protected Content

If the browser supports Encrypted Media Extensions and includes a Content Decryption Module for one of the protection schemes in the dash manifest, video.js will be able to playback protected content.

For most protection schemes, the license server information (URL &amp; init data) is included inside the manifest. The notable exception to this is Widevine-Modular (WV). To playback WV content, you must provide the URL to a Widevine license server proxy.

For this purpose, videojs-contrib-dash adds support for a "keySystemOptions" array to the object when using the `player.src()` function:

```javascript
player.src({
  src: 'http://example.com/my/manifest.mpd',
  type: 'application/dash+xml',
  keySystemOptions: [
    {
      name: 'com.widevine.alpha',
      options: {
        licenseUrl: 'http://m.widevine.com/proxy'
      }
    }
  ]
});
```

## Known limitations

Due to [known issue in video.js 5.10+](https://github.com/videojs/video.js/issues/3428), definining media source inside video tag is **NOT** supported for video.js 5.10+.
So, if you want to set video source like this:

```javascript
<video class="video-js" id="video_element" width="600" height="300" controls>
  <source src="http://dash.edgesuite.net/envivio/EnvivioDash3/manifest.mpd">
</video>
```

You should use video.js version < 5.10:

```html
<html>
<head>
  <!-- video.js -->
  <link href="//vjs.zencdn.net/5.9/video-js.min.css" rel="stylesheet">
  <script src="//vjs.zencdn.net/5.9/video.min.js"></script>

  <!-- videojs-contrib-dash script -->
  <script src="dist/videojs5-dashjs-p2p-source-handler.js"></script>
</head>
```

Or consider setting media source programmatically instead(works with any version of video.js starting 5.0+):

```javascript
var player = videojs('video_element', options);
  player.ready(function() {
    player.src({
      src: 'http://dash.edgesuite.net/envivio/EnvivioDash3/manifest.mpd',
      type: 'application/dash+xml'
    });
  });
```

You can check available video.js releases here https://github.com/videojs/video.js/releases.
