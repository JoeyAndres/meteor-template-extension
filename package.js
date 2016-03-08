Package.describe({
  name: "jandres:template-extension",
  summary: "Adds template features currently missing from the templating and template-extension package",
  version: "4.0.5",
  git: "https://github.com/JoeyAndres/meteor-template-extension.git"
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.2');
  api.use([
    'ecmascript',
    'templating',
    'blaze',
    'jquery',
    'underscore',
    'tracker',
    'reactive-var'
  ], 'client');

  api.addFiles([
    'lib/hooks.js',
    'lib/template-for-each.js',
    'lib/template-hooks.js',
    'lib/template-global-hooks.js',
    'lib/template-for-each-instance.js',
    'lib/template-inherits-events-from.js',
    'lib/template-inherits-helpers-from.js',
    'lib/template-inherits-hooks-from.js',
    'lib/template-register-helpers.js',
    'lib/template-replaces.js',
    'lib/template-clear-event-maps.js',
    'lib/template-copy-as.js',
    'lib/template-instance-parent.js',
    'lib/template-instance-get.js',
    'lib/template-parent-data-function.js',
    'lib/template-children.js',
    'lib/template-scope.js',
    'lib/template-sibling.js'
  ], 'client');
});

Package.onTest(function(api) {
  api.use([
    'jandres:template-extension',
    'jquery',
    'templating',
    'tinytest',
    'tracker',
    'ejson',
    'underscore',

    'timdown:rangy@1.2.3',
    'jandres:mutation-summary@0.0.1',
    'reactive-var'
  ], 'client');

  api.imply('jandres:template-extension');

  api.addFiles([
    'tests.html',
    'tests.js'
  ], 'client');
});
