"use strict";

var MetafileMatcher = require('./metafile-matcher');

// Not needed in Node 4.0+
if (!Object.assign) Object.assign = require('object-assign');

class MetalsmithMetafiles {
  constructor(options) {
    options = options || {};

    this._initMatcherOptions(options);
    this._initMatchers();
  }

  _initMatcherOptions(options) {
    this._matcherOptions = [];
    var parserOptions = Object.assign({'.json': true}, options.parsers);
    for (var extension in parserOptions) {
      var enabled = parserOptions[extension];
      if (enabled) {
        this._matcherOptions.push(
          Object.assign({}, options, {"extension": extension})
        );
      }
    }
  }

  _initMatchers() {
    this._matchers = this._matcherOptions.map((options) => new MetafileMatcher(options));
  }

  // Main interface
  parseMetafiles(files) {
    filesLoop:
    for (var path in files) {
      for (var matcher of this._matchers) {
        var metafile = matcher.metafile(path, files[path]);

        if (!metafile.isMetafile) continue;
        if (!files[metafile.mainFile]) continue;

        Object.assign(files[metafile.mainFile], metafile.metadata);
        if (matcher.deleteMetaFiles) delete files[metafile.path];
        continue filesLoop;
      }
    }
  }
}

module.exports = MetalsmithMetafiles;