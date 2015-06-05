(function(Q) {
   var module = new Q.module('docs');

   module.on('ready', function() {

   });

   if (!Q.initCalled) Q.initModule(module.key); // If loaded asynchronously
})(Q);
