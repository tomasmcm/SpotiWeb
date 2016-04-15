# SpotiWeb

**Electron wrapper of play.spotify.com**

Why would you want to use this instead of the Spotify Desktop App? Because Ads...

Why would you use this app instead of [these](https://github.com/search?utf8=✓&q=spotify+electron&type=Repositories&ref=searchresults)? Because:
* Works with Mac, Windows and Linux
* Control your music with Media Keys (Play/Pause, Next, Previous)
* Notification of current music with Author & Title


### Download

Check [releases](https://github.com/tomasmcm/spotiweb/releases) for the latest version.


### Thanks to:
* [Electron](http://electron.atom.io)
* [Spotify](https://www.spotify.com)
* [beaufortfrancois - Spotify Hotkeys](https://github.com/beaufortfrancois/spotify-hotkeys-chrome-extension)
* [hokein - Electron Notifications](https://github.com/hokein/electron-sample-apps/tree/master/notifications)


### Rights:
* Pepper Flash Plugin, All Rights Reserved © Adobe & Google
* Spotify, All Rights Reserved © Spotify AB


### Future Improvments:
* Display Album Cover in notification
*


### _I'm old school and I want to compile it myself_

From your command line:

```bash
# Install dependencies
$ npm install
# Run the app
$ npm start

# To compile Win app on Mac
$ brew install wine makensis
# REBOOT BEFORE CONTINUING


# To create App binaries
$ npm run package

# Export Mac app only
$ npm run package:mac

# Export Win apps only
$ npm run package:win

# Export Linux apps only
$ npm run package:linux


# PS: if when running build commands you get permission errors run this:
$ chmod u+x mac.sh
$ chmod u+x win.sh
$ chmod u+x linux.sh

# To create App zip's
$ npm run zip
# OR Mac only
$ npm run zip:mac
# OR Win only
$ npm run zip:win
# OR Linux only
$ npm run zip:linux

# To create App binaries and zip's
$ npm run build
# OR Mac only
$ npm run build:mac
# OR Win only
$ npm run build:win
# OR Linux only
$ npm run build:linux

```
