/*
 * Here is an example module.
 * As you can see it handles event listening, and you can even make custom events with .on and .trigger
 *
 * If you are going to make your own module, please name the file
 * the same name as the module (e.g. the module 'plex' will have the filename of 'plex.js')
 *
 * Please place your files in *site root* /js/modules/
 *
 * You can always import a module at on the fly using
   Q.import(moduleName, function() {
      // Using Q.initModule will make sure that the module initialization functions are called and the module is ready to use.
      Q.initModule(moduleName);
   });
 *
 */

(function(Q) {
   var module = new Q.module('example-module');

   // var module = new Q.module('moduleName');
   // and
   // var module = Q.module('moduleName');
   // do the same thing. It forces an instance of Q.module if you don't add the "new" to the beginning.

   module.jQueryRequired = true;

   module.on('init', function() {
      // This will be called in the <head>, before the document is loaded
      console.log('example-module initializing');
   });

   module.on('ready', function() {
      // This will be called on $(document).ready
      console.log('example-module jquery ready');
   });

   module.on('jQueryNotIncluded', function() {
      // This will be called only if jquery is NOT included on the page
      console.log('example-module jquery not included');
   });
})(Q);
