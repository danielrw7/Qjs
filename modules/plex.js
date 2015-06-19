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

    module.list = function(thingName, argumentFields, callback, errorCallback, page) {
        if (typeof thingName == 'string') {
            console.info('Calling QPlex this way is deprecated. Please pass an object with the appropriate keys for use in the future.');


            var callback = (callback || argumentFields || function(a) {
                console.log(a);
            });

            if (typeof argumentFields == 'function') {
                // it's a callback

                // make it null so that var fields populates correctly
                argumentFields = null;

            } else {
                callback = function(a) {
                    console.log(a);
                };
            }

            fields = argumentFields || '*';
            if (typeof fields == 'object') {
                fields = fields.join(',');
            }

            if (typeof errorCallback == 'number') {
                // errorCallback is actually page
                page = errorCallback;

                // set it to null so that the next function triggers
                errorCallback = null;
            }

            if (!errorCallback) {
                var errorCallback = function(error) {
                    throw error;
                };
            }

        } else {
            //now, we are treating thingName as an object
            var callback = (thingName.callback || function(a) {
                console.log(a);
            });

            var fields = thingName.fields || '*';
            if (typeof fields == 'object') {
                fields = fields.join(',');
            }

            var errorCallback = (thingName.errorCallback || thingName.error || function(error) {
                throw error;
            });

            var page = thingName.page || 0;

            // must be last
            var thingName = thingName.name || thingName.thingName || null;
        }
        //end if string

        var successCallback = function(data) {
            if (data.error) {
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

    module.read = function(thingName, id, argumentFields, callback, errorCallback) {
        if (typeof thingName == 'string') {
            console.info('Calling QPlex this way is deprecated. Please pass an object with the appropriate keys for use in the future.');
            var callback = (callback || argumentFields || function(a) {
                console.log(a);
            });

            if (typeof argumentFields == 'function') {
                // it's a callback

                // make it null so that var fields populates correctly
                argumentFields = null;

            } else {
                callback = function(a) {
                    console.log(a);
                };
            }

            var fields = argumentFields || '*';
            if (typeof fields == 'object') {
                fields = fields.join(',');
            }



            if (!errorCallback) {
                var errorCallback = function(error) {
                    throw error;
                };
            }

        } else {
            //now, we are treating thingName as an object
            var callback = (thingName.callback || function(a) {
                console.log(a);
            });

            var fields = thingName.fields || '*';
            if (typeof fields == 'object') {
                fields = fields.join(',');
            }

            var errorCallback = (thingName.errorCallback || thingName.error || function(error) {
                throw error;
            });

            var id = thingName.id || null;

            // must be last
            var thingName = thingName.name || thingName.thingName || null;
        }

        var successCallback = function(data) {
            if (data.error) {
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
            dataType: 'json',
            success: successCallback,
            error: errorCallback
        });
    };

    module.add = function(thingName, values, callback, errorCallback) {
        if (typeof thingName == 'string') {
            console.info('Calling QPlex this way is deprecated. Please pass an object with the appropriate keys for use in the future.');
            var callback = (callback || function() {});

            if (!errorCallback) {
                var errorCallback = function(error) {
                    throw error;
                };
            }

        } else {
            //now, we are treating thingName as an object
            var callback = (thingName.callback || function(a) {
                console.log(a);
            });

            var values = thingName.values || null;

            var errorCallback = (thingName.errorCallback || thingName.error || function(error) {
                throw error;
            });

            // must be last
            var thingName = thingName.name || thingName.thingName || null;
        }

        var successCallback = function(data) {
            if (data.error) {
                errorCallback(data.errorData);
            } else {
                callback(data);
            }
        };

        return $.ajax({
            url: this.serverAddress + '/' + this.serverPath,
            data: {
                type: 'add',
                name: thingName,
                thingObject: JSON.stringify(values),
            },
            method: 'POST',
            dataType: 'json',
            success: successCallback,
            error: errorCallback
        });

    };

    module.schema = function(thingName, callback, errorCallback) {
        if (typeof thingName == 'string') {
            console.info('Calling QPlex this way is deprecated. Please pass an object with the appropriate keys for use in the future.');

            var callback = (callback || function() {});

            if (!errorCallback) {
                var errorCallback = function(error) {
                    throw error;
                }
            }

        } else {
            //now, we are treating thingName as an object
            var callback = (thingName.callback || function(a) {
                console.log(a);
            });

            var errorCallback = (thingName.errorCallback || thingName.error || function(error) {
                throw error;
            });

            // must be last
            var thingName = thingName.name || thingName.thingName || null;
        }

        var successCallback = function(data) {
            if (data.error) {
                errorCallback(data.errorData);
            } else {
                callback(data);
            }
        };


        return $.ajax({
            url: this.serverAddress + '/' + this.serverPath,
            data: {
                type: 'schema',
                name: thingName
            },
            method: 'GET',
            dataType: 'json',
            success: successCallback,
            error: errorCallback
        });
    };

    module.watch = function(checkChange, onChangeCallback, startDelay, iterateMultiplier, maxDelay) {
        console.info("The watch function is deprecated.");
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
