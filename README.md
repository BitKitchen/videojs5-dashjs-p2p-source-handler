# video.js MPEG-DASH Source Handler with integrated Streamroot dashjs p2p module

A video.js source handler for supporting MPEG-DASH playback over P2P or CDN through a video.js player on browsers with support for Media Source Extensions.

## Getting started

Run `npm install` to install necessary dependencies such as [streamroot-dashjs-p2p-wrapper](https://github.com/streamroot/dashjs-p2p-wrapper) and build the source handler. Build is triggered automatically after `npm install`.

You can also use `grunt build` to build the files after a manual update.

The built files will be placed into `dist` directory.

In addition to built files, you'll need to include [video.js 5.0+](http://videojs.com/getting-started/) and `dash.js` v2.1.0+ in your web page. For `dash.js` you can use either its [minified](http://dashif.org/reference/players/javascript/v2.1.0/dash.js/dist/dash.all.min.js) or [debug](http://dashif.org/reference/players/javascript/v2.1.0/dash.js/dist/dash.all.debug.js) version.

To enable a graphic visualization of P2P traffic (as a debug tool), you can add following lines to your page. Note that in this case, `p2pConfig` must include `debug: true` as described [here](https://streamroot.readme.io/docs/p2p-config) :

```javascript
<script src="http://cdn.streamroot.io/2/scripts/p2pGraph.js"></script>
<script src="http://cdn.streamroot.io/2/scripts/peerStat.js"></script>

<script src="http://cdnjs.cloudflare.com/ajax/libs/rickshaw/1.4.6/rickshaw.min.js"> </script>
<link rel="stylesheet" href="http://cdnjs.cloudflare.com/ajax/libs/rickshaw/1.4.6/rickshaw.min.css">
<script src="http://cdnjs.cloudflare.com/ajax/libs/d3/3.4.9/d3.min.js"> </script>
```

Putting it all together:
```html
<html>
<head>
  <!-- dash.js -->
  <script src="http://dashif.org/reference/players/javascript/2.1.1/dash.js/dist/dash.all.debug.js"></script>

  <!-- video.js -->
  <link href="//vjs.zencdn.net/5.8/video-js.min.css" rel="stylesheet">
  <script src="//vjs.zencdn.net/5.8/video.min.js"></script>

  <!-- videojs-contrib-dash script -->
  <script src="dist/videojs-dash.js"></script>

  <!-- p2p graphics and peer stats -->
  <script src="http://cdn.streamroot.io/2/scripts/p2pGraph.js"></script>
  <script src="http://cdn.streamroot.io/2/scripts/peerStat.js"></script>
  <!-- graphics dependencies -->
  <script src="http://cdnjs.cloudflare.com/ajax/libs/rickshaw/1.4.6/rickshaw.min.js"> </script>
  <link rel="stylesheet" href="http://cdnjs.cloudflare.com/ajax/libs/rickshaw/1.4.6/rickshaw.min.css">
  <script src="http://cdnjs.cloudflare.com/ajax/libs/d3/3.4.9/d3.min.js"> </script>
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
</body>
</html>
```

## Example

Checkout [live example here](http://streamroot.github.io/videojs-contrib-dash/).

You can select a sample MPD using combox above the video. You can also pass an arbitary manifest url to the test page as a get param like this: `http://streamroot.github.io/videojs-contrib-dash/?mpd=encodeURIComponent_manifest_url_here`. Don't forget to `encodeURIComponent` it first.

Below the video you can see p2p statistics & graphs.
For a quick p2p test you can open several tabs with the same manifest and start playback. After a while you should see p2p traffic on the graphs.

## How it works

[streamroot-dashjs-p2p-wrapper](https://github.com/streamroot/dashjs-p2p-wrapper) is added as a dependency into `package.json`

```json
  ...
  "dependencies": {
    "dashjs": "Dash-Industry-Forum/dash.js#v2.1.1",
    "global": "^4.3.0",
    "video.js": "^5.0.0",
    "streamroot-dashjs-p2p-wrapper": "^1.2.0"
  }
  ...
```

Wrapper is imported in [dash.js source handler](https://github.com/streamroot/videojs-contrib-dash/blob/streamroot-p2p/src/js/videojs-dash.js):

```javascript
import DashjsWrapper from 'streamroot-dashjs-p2p-wrapper';
```

and instantiated after `dashjs.MediaPlayer` is created. `dashjs.MediaPlayer` instance, p2p config and live delay value are passed as parameters to wrapper constructor:

```javascript
if (options && options.streamroot && options.streamroot.p2pConfig) {
  var liveDelay = 30;
  this.dashjsWrapper_ = new DashjsWrapper(
    this.mediaPlayer_,
    options.streamroot.p2pConfig,
    liveDelay
  );
}
```

p2pConfig is described [here](https://streamroot.readme.io/docs/p2p-config). Check it to get better understanding on what can be configured.
You can get your `streamrootKey` by signing up into [Streamroot's dashboard](http://dashboard.streamroot.io/signup).

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
