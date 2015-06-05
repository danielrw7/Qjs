(function(Q) {
   var module = new Q.module('actions');

   module.registeredActions = {};

   module.register = function(keys, callback, event, selector) {
      if (typeof keys == 'string') keys = [keys];
      keys.forEach(function(key) {
         if (!module.registeredActions[key]) {
            module.registeredActions[key] = [];
         }
         module.registeredActions[key].push(callback);
         if (event && selector && $(selector).length) {
            $(selector).each(function() {
               $(this).attr('action-'+event, key);
            });
         }
      });


      return this;
   }

   module.createEventListener = function(key) {
      var selector = '[action-'+key+']'
      $(document).on(key, selector, 0, function(e) {
         var action = $(this).attr('action-'+key);
         if (action.indexOf(',')) {
            action.split(',').forEach(function(a) {
               module.triggerAction(action, this, [e]);
            });
            return false;
         }
         return module.triggerAction(action, this, [e]);
      });
      return this;
   }

   module.triggerAction = function(key, target, args) {
      if (typeof args != 'object' && typeof args != 'undefined') args = [args];
      if (!module.registeredActions[key]) {
         module.log.error('Tried to execute the action "'+key+'", but it doesn\'t exist.');
      }
      var i;
      for(i = 0; i < (module.registeredActions[key] || []).length; i++) {
         var fun = module.registeredActions[key][i];
         if (!fun.apply(target, args)) {
            break;
         }
      }
      if (i != (module.registeredActions[key] || []).length) return false;
      return this;
   }

   var defaultEvents = [
      'click',
      'hover',
      'mouseover',
      'mouseleave'
   ];


   module.on('ready', function() {
      defaultEvents.forEach(function(key) {
         module.createEventListener(key);
      });
   });

   $.fn.triggerAction = function(key) {
      $(this).each(function() {
         module.triggerAction(key, this);
      });
   }

   Q.initModule(module.key); // Just to be safe
})(Q);
