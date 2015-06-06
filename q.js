/*
Written by Daniel Wilson
Inspired by Sam Weaver's Q.plex

Yay for modularization!

Here is an example module.
As you can see it handles event listening, and you can even make custom events with .on and .trigger

If you are going to make your own module, please name the file
the same name as the module (e.g. the module 'plex' will have the filename of 'plex.js')

Please place your module files in *site root* /js/modules/

You can always import a module on the fly using

   Q.import(moduleName, function() {
      // Using Q.initModule will make sure that the module initialization functions are called and the module is ready to use.
      Q.initModule(moduleName);
   });

Here is the module:

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

Useful functions:

   Q.module(moduleName) // will create a module, or return an existing module if it has the same module key

   Q.getModule(moduleName) // will return a module with the same module key if it exists, but it won't add a new module if it doesn't exist


   var exampleModule = new Q.module('exampleModule');

   exampleModule.on(eventKey, callbackFunction) // will add an event listener to the module listening for the event.

   exampleModule.trigger(eventKey, data) // will trigger all event listeners for the given key, while passing the data into each of the callback functions


Whenever you are using/extending modules, it is useful to wrap everything in closures:

   (function(Q) {

      // Whatever you are doing here

   })(Q);


You can also chain functions:

   Q.getModule('exampleModule')
    .on('init', initCallback)
    .on('ready', readyCallback)
    .trigger('init', initData);

*/

function hasProperty(obj, prop) {
   return obj[prop] !== undefined;
};

Array.prototype.callFunction = function(target, key) {
   var args = [];
   for(var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
   }
   args = [args[2]];

   this.forEach(function(elem) {
      if (hasProperty(elem, key) && typeof elem[key] == 'function') {
         elem[key].apply(target, args);
      } else if (!key && typeof elem == 'function') {
         elem.apply(target, args);
      }
   });
};

Array.prototype.filterByPropExists = function(key) {
   return this.filter(function(elem) {
      return hasProperty(elem, key);
   });
};

Object.equals = function( x, y ) {
   if ( x === y ) return true;

   if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;

   if ( x.constructor !== y.constructor ) return false;

   for ( var p in x ) {
      if ( ! x.hasOwnProperty( p ) ) continue;

      if ( ! y.hasOwnProperty( p ) ) return false;

      if ( x[ p ] === y[ p ] ) continue;

      if ( typeof( x[ p ] ) !== "object" ) return false;

      if ( ! Object.equals( x[ p ],  y[ p ] ) ) return false;
   }

   for ( p in y ) {
      if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) return false;
   }
   return true;
};

var Q = (Q || function(key) {
   return (Q[key] || Q.getModule(key));
});

(function(Q) {
   Q.key = 'Q';
   Q.modules = (Q.modules || []);
   Q.initCalled = (Q.initCalled || false);

   Q.moduleExists = (Q.moduleExists || function(key) {
      return this.modules.filter(function(module) {
         return module.key == key;
      }).length > 0;
   });

   Q.eventListeners = (Q.eventListeners || {});

   Q.module = (Q.module || function(key, object) {
      if (!key) return;

      var self = (object || this);

      if (Q.moduleExists(key)) {
         // If the module exists already, return it;
         return Q.getModule(key);
      } else {
         if (self.modules) {
            // They didn't use "new Q.module". Return a new module.
            return new self.module(key);
         } else {
            // Register a new module with Q and return the result.
            return Q.addModule(key, self);
         }
      }
   });

   Q.addModule = (Q.addModule || function(key, self) {
      if (this.moduleExists(key)) {
         return this.getModule(key);
      } else {
         self.key = key;
         this.modules.push(self);
         return self;
      }
   });

   Q.getModule = (Q.getModule || function(key) {
      return (Q.modules.filter(function(module) {
         return module.key == key;
      })||[false])[0];
   });

   Q.import = (Q.import || function(url, callbackFunction) {
      var urls = (typeof url == 'string') ? url.replace(/ /g, '').split(',') : url;
      var filesLeft = urls.length;
      if (urls.length == 0) {
         callbackFunction();
         return;
      }
      for(var i = 0; i < urls.length; i++) {
         var url = urls[i];

         url += (url.indexOf('.js') == -1) ? '.js' : '';
         if (url.indexOf('//') == -1) {
            url = this.moduleLocation + url
         }
         var callback = function() {
            filesLeft--;
            if (!filesLeft) {
               (callbackFunction || function() {})();
            }
         }
         if (!Q.getModule(url)) {
            $.getScript(url, callback).fail(function() {
               console.error('Could not load the file "'+url+'"');
            });
         } else {
            callback();
         }
      }
      return this;
   });

   Q.init = (Q.init || function() {
      if (!Q.initCalled) {
         this.modules.forEach(function(module) {
            module.addLogFunctions();
         });

         Q.trigger('init');
         if (window.jQuery !== undefined && typeof window.jQuery == 'function') {
            window.jQuery(document).ready(function() {
               Q.modules.forEach(function(module) {
                  module.log.info('ready!')
               })
               Q.trigger('ready');
            });
         } else {
            var modules = this.modules.filterByPropExists('jQueryRequired').filter(function(module) {
               return module.jQueryRequired;
            });

            console.warn("You may want to include jQuery on the page.\n//code.jquery.com/jquery-2.1.4.min.js");

            if (modules.length) {
               var s = ((modules.length == 1) ? '' : 's');
               console.error(modules.length+" module"+s+" are jQuery dependent: ("+modules.map(function(module) {
                  return module.key;
               }).join(", ")+")");
            }

            Q.trigger('jQueryNotIncluded');
         }
      }
      this.initCalled = true;
      return this;
   });

   Q.initModule = function(key) {
      var module = this.getModule(key).addLogFunctions();
      if (this.initCalled) {
         module.trigger('init');
         if (window.jQuery !== undefined && typeof window.jQuery == 'function') {
            module.trigger('ready');
         } else {
            module.trigger('jQueryNotIncluded');
         }
      }

      return this;
   }
})(Q);

(function(Q) {
   // Event handling

   var module = Q.module.prototype;

   var on = function(key, handler) {
      this.eventListeners = (this.eventListeners || {});
      this.eventListeners[key] = (this.eventListeners[key]||[]);
      this.eventListeners[key].push(handler);
      return this;
   }

   module.on = (module.on || on);

   Q.on = (Q.on || on);

   Q.callOnce = (Q.callOnce || [
      'init',
      'ready',
   ]);
   module.callOnce = (module.callOnce || Q.callOnce);

   module.trigger = (module.trigger || function(key, data) {
      this.eventListeners = (this.eventListeners || {});
      var listeners = (this.eventListeners[key] || []);

      if (this.callOnce.indexOf(key) > -1) {
         listeners = listeners.filter(function(listener) {
            return !listener.called;
         });
         listeners.forEach(function(listener) {
            listener.called = true;
         });
      }


      listeners.callFunction(this, '', data);
      return this;
   });

   Q.trigger = (Q.trigger || function(key, data) {
      if (typeof this.eventListeners[key] == 'object') {
         var listeners = this.eventListeners[key];
         if (Q.callOnce.indexOf(key) > -1) {
            listeners = listeners.filter(function(listener) {
               return !listener.called;
            });
            listeners.forEach(function(listener) {
               listener.called = true;
            });
            listeners.callFunction(this, '', data);
         }
      }
      this.modules.forEach(function(module) {
         module.trigger(key, data);
      });
      return this;
   });

   var off = function(key) {
      this.eventListeners[key] = [];
      return this;
   };
   Q.off = module.off = off;
})(Q);

var time = function(toExecute) {
   var startTime = new Date().getTime();
   toExecute();
   var endTime = new Date().getTime();
   console.log(endTime - startTime)
   return endTime - startTime;
};

(function(Q) {
   // Logging

   var module = Q.module.prototype;

   module.addLogFunctions = function(self) {
      var self = (self || this);
      if (!this.log) {
         self.log = function() {
            console.log.apply(console, ['['+self.key.toUpperCase()+']'].concat([].splice.call(arguments, 0)));
         }
         var functions = ['info', 'error', 'debug', 'warn', 'log'];
         for(var i = 0; i < functions.length; i++) {
            (function(i) {
               var key = functions[i];

               self.log[key] = function() {
                  console[key].apply(console, ['['+self.key.toUpperCase()+']'].concat([].splice.call(arguments, 0)));
               }
            })(i);
         }
      }
      return this;
   }

   module.addLogFunctions(Q);
})(Q);


(function(Q) {
   var module = Q.module.prototype;

   module.requires = function(modules, callback) {
      if (typeof modules == 'string') {
         modules = modules.replace(/ /g, '').split(',');
      }
      // Q.import(modules, )
   }
})(Q);

// In order to fit CommonJS module spec 1.1, define a require object that fits it as such.
// This must be after Q is fully populated, and is referential.
window.require = Q;
