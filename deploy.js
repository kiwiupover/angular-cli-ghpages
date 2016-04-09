'use strict';

var path = require('path');
var fs = require('fs');
var ghpages = require('gh-pages');
var RSVP = require('rsvp');

module.exports = {
  name: 'ghpages',
  aliases: ['gh-pages'],
  description: 'Publish to any gh-pages branch on GitHub (or any other branch on any other remote). Build the project before publishing!',
  works: 'insideProject',

  availableOptions: [{
    name:         'repo',
    type:         String,
    default:      undefined, // using gh-pages default -- see readme
    description:  'The commit message to include with the build, must be wrapped in quotes.'
  }, {
    name:         'message',
    type:         String,
    default:      'Auto-generated commit',
    description:  'The commit message, must be wrapped in quotes.'
  }, {
    name:         'branch',
    type:         String,
    default:      'gh-pages',
    description:  'The git branch to push your pages to'
  }, {
    name:         'name',
    type:         String,
    default:      undefined,  // using gh-pages default -- see readme
    description:  'The git user-name which is associated with this commit'
  }, {
    name:         'email',
    type:         String,
    default:      undefined,  // using gh-pages default -- see readme
    description:  'The git user-email which is associated with this commit'
  }],
  run: function(options, rawArgs) {

    var ui = this.ui;
    var root = this.project.root;
    var dir = path.join(root, 'dist');

    options = options || {};
    if (options['name'] && options['email']) {
      options.user = {
        name: options['name'],
        email: options['email']
      }
    };
    options.dotfiles = true;
    options.silent = true;  // hides credentials, if provided via repo URL

    if (process.env.TRAVIS) {
      options.message += '\n\n' +
        'Triggered by commit: https://github.com/' + process.env.TRAVIS_REPO_SLUG + '/commit/' + process.env.TRAVIS_COMMIT + '\n' +
        'Travis build: https://travis-ci.org/'     + process.env.TRAVIS_REPO_SLUG + '/builds/' + process.env.TRAVIS_BUILD_ID;
    }

    var access = publish = RSVP.denodeify(fs.access);
    var publish = RSVP.denodeify(ghpages.publish);

    return access(dir, fs.F_OK)
       .catch(function(error) {
          ui.writeError('Dist folder does not exist. Can \'t publish anything. Run `ng build` first!');
          return RSVP.reject(error) ;
        })
      .then(publish(dir, options))
      .then(function() {
        ui.write('Successfully published!');
      });
  }
};
