(function(Q) {
   var module = new Q.module('speech');

   module.speak = function(phrase, options) {
      var settings = $.extend({
         voice: 0,
         voiceURI: 'native',
         volume: 1,
         rate: 1,
         pitch: 1,
         lang: 'en-US'
      }, options);

      var speechMessage = new SpeechSynthesisUtterance(phrase);
      if (typeof settings.voice == 'number') {
         var voices = window.speechSynthesis.getVoices();
         settings.voice = voices[settings.voice];
      }
      speechMessage.voice = settings.voice;
      for(var key in settings) {
         speechMessage[key] = settings[key];
      }
      window.speechSynthesis.speak(speechMessage);
   };

   module.interpret = function(phrase) {
      var words = phrase.match(/\w{1,}/g);
   }

   module.speakSelection = function() {
      var str = String(window.getSelection().toLocaleString());
      if (str.length > 0) {
         str.speak();
      }
   }

   String.prototype.speak = function() {
      module.speak(this.valueOf(), {
         voice: 1
      });
   }
})(Q);
