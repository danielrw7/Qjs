//WM Speech Recognition Module.
//Written by Brook
// - 5/26/2015

/*

Currently it only listens upon request
and for one "sentence" (until it gets quiet again)

TODO: Public and Private Variables/Functions
Passable Parameters
Eventually streaming speech

*/
(function (Q) {
	var module = new Q.module('recog');
	//Variables go here?
	//Turn these into passable options...eventually...
	//Declaring as a string and turning into jQuery inside ready function.
	module.activatorTarget = 'div.web_app_customer_name';

	module.jQueryRequired = true;

	//Probably not the best way to see if it exists...
	try {
		module.sr = new webkitSpeechRecognition();
	} catch(error) {
		console.log("Error : "+error);
	}

	//Funtions somewhere down here.
	//Main Init Function on
	module.on('init', function() {
		//Empty
	});

	module.on('ready', function() {
		//Declare String as jQuery obect.
		module.activator = $(module.activatorTarget);
		module.activator.css({"cursor":"pointer"});
		//console.log("Speech Ready");
		module.activator.on('click', module.startSpeech);
	});

	//General method for getting the *last* message.
	//Not good for Synchronous things because it might be empty.
	module.getSpeech = function() {
		return module.message || false;
	};

	module.startSpeech = function() {
		//The .start() begins the listening.
		//module.listenerDiv.css({"border-color":"RED"});
		//console.log("Beginning Speech Recognition...");
		module.sr.start();
	};

	//This event fires once the speech is recognized.
	//I think this function needs to be returned in the getSpeech Function.
	module.sr.onresult = function(event) {
		module.messageobj = event;
		module.message = event.results[0][0]['transcript'];
		//event contains a lot more than one sentence..
		//console.log(module.messageobj);
		console.log(module.message);

		if(module.message == 'main menu') window.location = Q.siteRoot+"/mainmenu.html";

		//console.log("Ending Speech Recognition...");
		//module.listenerDiv.text(module.message);
		//module.listenerDiv.css({"border-color":"BLACK"});
	};

	module.on('jQueryNotIncluded', function() {
		console.log("No jQuery, No Recog for you!");
	});


	module.listen = function(callback) {
		var self = this;
		var obj = new webkitSpeechRecognition();
		obj.start();
		obj.onresult = function(e) {
			alert('result');
			var result = e.result[0][0];
			if (result.confidence > .5) {
				callback.call(self, result.transcript);
			} else {
				alert('callback fail')
			}
		}
		return obj;
	}
})(Q);
