/**
 * BASED on electron-gh-releases
 * https://github.com/jenslind/electron-gh-releases
 */

'use strict';

const semver = require('semver')
const got = require('got')
const events = require('events')
const electron = require('electron');
const dialog = electron.dialog
const shell = electron.shell

const REGEX_ZIP_URL = /\/v(\d+\.\d+\.\d+)\/.*\.zip/

module.exports = class extends events.EventEmitter {

  constructor (gh) {
    super()

    let self = this

    self.repo = gh.repo
    self.name = gh.name
    self.repoUrl = 'https://github.com/' + gh.repo
    self.currentVersion = gh.currentVersion
  }

  /**
   * Get tags from this.repo
   */
  _getLatestTag () {
    let url = this.repoUrl + '/releases/latest'
    return got.head(url)
      .then(res => {
        let latestTag = res.socket._httpMessage.path.split('/').pop()
        return latestTag
      })
      .catch(err => {
        if (err) throw new Error('Unable to get latest release tag from Github.')
      })
  }

  /**
   * Get current version from app.
   */
  _getCurrentVersion () {
    return this.currentVersion
  }

  /**
   * Compare current with the latest version.
   */
  _newVersion (latest) {
    return semver.lt(this._getCurrentVersion(), latest)
  }

  /**
   * Get the feed URL from this.repo
   */
  _getFeedUrl (tag) {
    let feedUrl

    return new Promise((resolve, reject) => {
      feedUrl = this.repoUrl + '/releases/download/' + tag
      resolve(feedUrl)
    })

    // Make sure feedUrl exists
    return got.get(feedUrl)
      .then(res => {
        if (res.statusCode === 404) {
          throw new Error('auto_updater.json does not exist.')
        } else if (res.statusCode !== 200) {
          throw new Error('Unable to fetch auto_updater.json: ' + res.body)
        }

        let zipUrl
        try {
          zipUrl = JSON.parse(res.body).url
        } catch (err) {
          throw new Error('Unable to parse the auto_updater.json: ' + err.message + ', body: ' + res.body)
        }

        const matchReleaseUrl = zipUrl.match(REGEX_ZIP_URL)
        if (!matchReleaseUrl) {
          throw new Error('The zipUrl (' + zipUrl + ') is a invalid release URL')
        }

        const versionInZipUrl = matchReleaseUrl[1]
        const latestVersion = semver.clean(tag)
        if (versionInZipUrl !== latestVersion) {
          throw new Error('The feedUrl does not link to latest tag (zipUrl=' + versionInZipUrl + '; latestVersion=' + latestVersion + ')')
        }

        return tag;
      })
  }

  /**
   * Check for updates.
   */
  check (cb) {

    let self = this

    // Get latest released version from Github.
    this._getLatestTag()
      .then(tag => {
        // Check if tag is valid semver
        if (!tag || !semver.valid(semver.clean(tag))) {
          throw new Error('Could not find a valid release tag.')
        }

        // Compare with current version.
        if (!self._newVersion(tag)) {
          throw new Error('There is no newer version.')
        }

        // There is a new version!
        // Get feed url from gh repo.
        self.newVersion = tag
        return self._getFeedUrl(tag)
      })
      .then(tag  => {
        // Show popup message
        // Update Now: open browser with download page
        // Next Time: dismiss
        dialog.showMessageBox({
          type: "question",
          buttons: ["Update Now", "Next Time"],
          defaultId: 0,
          cancelId: 1,
          title: "New Update Available",
          message: self.name +" "+ self.newVersion+" is available now!\n\nClick 'Update Now' to open the download page.\n",
          icon: __dirname + '/assets/icon.png'
        }, function (buttonIndex) {
          if(buttonIndex==0){
            shell.openExternal(self.repoUrl + '/releases/');
          }
        });

        cb(null, true)
      })
      .catch(err => {
        cb(err || null, false)
      })
  }

}
