(function(Q) {
   var module = Q.module('demo');
   module.jQueryRequired = true;

   module.on('ready', function() {
      // alert('the demo module is ready')
   });

   var actions = Q.module('actions');
   actions.on('ready', function() {
      this.register('demo-action', function() {
         alert('this is an action')
      });
   });
})(Q);
