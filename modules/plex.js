(function(Q) {
   var module = new Q.module('plex');

   module.serverAddress = Q.siteRoot;

   module.setServerAddress = function(serverAddress) {
      this.serverAddress = serverAddress;
      return this;
   };

   module.serverPath = 'scripts/qplex.php';

   module.setServerPath = function(serverPath) {
      this.serverPath = serverPath;
      return this;
   };

   module.list = function(thingName, fields, callback, errorCallback) {
      var callback = (callback || function() {});

      fields = fields || '*';
      if (typeof fields == 'object') {
         fields = fields.join(',');
      }

      if(!errorCallback) {
         var errorCallback = function(error){
            throw error;
         };
      }

      var successCallback = function(data) {
         if(data.error) {
            errorCallback(data.errorData);
         } else {
            callback(data);
         }
      };


      return $.ajax({
         url: this.serverAddress + '/' + this.serverPath,
         data: {
            type: 'list',
            name: thingName,
            fields: fields,
         },
         method: 'GET',
         dataType: 'json',
         success: successCallback,
         error: errorCallback
      });
   };

   module.read = function(thingName, id, fields, callback, errorCallback) {
      var callback = (callback || function() {});

      fields = fields || '*';
      if (typeof fields == 'object') {
         fields = fields.join(',');
      }

      if(!errorCallback){
         var errorCallback = function(error) {
            throw error;
         }
      }

      var successCallback = function(data) {
         if(data.error) {
            errorCallback(data.errorData);
         } else {
            callback(data);
         }
      };


      return $.ajax({
         url: this.serverAddress + '/' + this.serverPath,
         data: {
            type: 'read',
            name: thingName,
            id: id,
            fields: fields,
         },
         method: 'GET',
         dataType:'json',
         success: successCallback,
         error: errorCallback
      });
   };

   module.watch = function(checkChange, onChangeCallback, startDelay, iterateMultiplier, maxDelay) {
      var self = this;
      if (self.modules) {
         self = {};
      }
      self.startDelay = (startDelay || 15);
      self.iterateMultiplier = (iterateMultiplier || 1.5);
      self.iterations = 1;
      self.maxDelay = (maxDelay || 120);
      self.delay = startDelay;
      (function timeout() {
         checkChange(function(change) {
            if (change) {
               self.iterations = 0;
               onChangeCallback();
            } else {
               self.iterations++;
            }
            self.delay = Math.min(self.maxDelay, self.startDelay * Math.pow(self.iterateMultiplier, self.iterations))
            setTimeout(timeout, self.delay * 1000)
         });
      })();
      return self;
   }
})(Q);
