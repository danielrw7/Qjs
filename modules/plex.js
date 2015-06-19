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

    module.find = function(argumentObject, deprecationTrigger, testReturnEvaluateFunction) {
        if (deprecationTrigger) {
            console.info('You cannot call module.find with more than one argument. It is deprecated in all other functions, and nontolerable here.');
            return false;
        }

        var thingName = argumentObject.name || argumentObject.thingName || null;

        var queryObject = argumentObject.query || argumentObject.queryObject || {};

        var callback = (argumentObject.callback || function(a) {
            console.log(a);
        });

        var limit = argumentObject.limit || Infinity;

        var evaluateFunction = function(query, doc) {
            // this function is where we evaluate if documents match a MongoDB query

            var internalEvaluateFunction = function(val, docVal) {
                if (!Array.isArray(val)) {
                    // not an array
                    switch (typeof val) {
                        case 'object':
                            // this is an object, so it needs to be parsed based on a key
                            var prevResult = true;

                            for (var key in val) {
                                switch (key) {
                                    case "$eq":
                                        prevResult = prevResult && (docVal == val[key]);
                                        break;
                                    case "$gt":
                                        prevResult = prevResult && (docVal > val[key]);
                                        break;
                                    case "$gte":
                                        prevResult = prevResult && (docVal >= val[key]);
                                        break;
                                    case "$lt":
                                        prevResult = prevResult && (docVal < val[key]);
                                        break;
                                    case "$lte":
                                        prevResult = prevResult && (docVal <= val[key]);
                                        break;
                                    case "$ne":
                                        prevResult = prevResult && (docVal != val[key]);
                                        break;
                                }
                            }

                            return prevResult;
                            break;
                        default:
                            // didn't match any case, do a simple equality test
                            return (val == docVal);
                            break;
                    }
                } else {
                    // query[key] is an array
                    // arrays are treated like logical ORs, if any object in it is true, we return true
                    for (var index = 0; index < val.length; index++) {
                        // each array key is evaluated here
                        if (internalEvaluateFunction(val[index], docVal)) {
                            return true;
                        }
                    }

                    // didn't find any in the array
                    return false;
                }
            };

            // loop though the fields in the document
            for (var key in doc) {
                // see if the field exists in query
                if (key in query) {
                    // it does, evaluate the query
                    var returnValue = internalEvaluateFunction(query[key], doc[key]);

                    // if false, return false
                    if (!returnValue) {
                        return false;
                    }
                }
            }

            // we didn't return false, now we can return true
            return true;

        }.bind(this);

        if (testReturnEvaluateFunction) return evaluateFunction;

        var loopFunction = function(thingName, query, limit, page, outputArray, callback) {
            this.list({
                name: thingName,
                page: page,
                callback: function(result) {
                    var amountFound = 0;
                    for (var key in result) {
                        // only look at documents here
                        if (key == 'page' || key == 'additionalPages') continue;
                        var found = this.evaluateFunction(this.query, result[key]);
                        if (found) {
                            this.outputArray.push(result[key]);
                            amountFound++;
                            if (amountFound >= limit) {
                                // we're done
                                this.returnCallback(outputArray);

                                // break out of the loop
                                break;
                            }
                        }
                    }

                    // we're done loopin
                    // if there are additional pages and we haven't hit out limit, look at them
                    if (amountFound < limit) {
                        if (result.additionalPages) {
                            // we decrement the limit by the amount found
                            this.loopFunction(this.thingName, this.query, (this.limit - amountFound), (this.page + 1), this.outputArray, this.callback);
                        } else {
                            // we're done looking, let's send the output array
                            this.returnCallback(outputArray);
                        }
                    }
                }.bind({
                    thingName: thingName,
                    page: page,
                    evaluateFunction: evaluateFunction,
                    query: query,
                    returnCallback: callback,
                    loopFunction: loopFunction,
                    outputArray: outputArray
                })
            });
        }.bind(this);

        loopFunction(thingName, queryObject, limit, 0, [], callback);
    };

    module.findOne = function(obj) {
        obj.limit = 1;
        return this.find(obj);
    };

    // DEPRECATED
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
