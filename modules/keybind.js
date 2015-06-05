(function(Q) {
   window.Mousetrap = (window.Mousetrap || 0);
   var callback = function() {
      var module = Q.module('keybind');
      var functions = ['bind', 'unbind', 'reset'];

      module.registeredCombos = (module.registeredCombos || []);

      for(var i = 0; i < functions.length; i++) {
         (function(i) {
            var key = functions[i];
            module[key] = function() {
               var args = [].splice.call(arguments, 0);

               if (key == 'bind' && args[2] != false) {
                  module.registeredCombos.push({
                     combo: args[0],
                     label: args[2]||'',
                  });
                  if (args[2]) {
                     args.splice(2, 1);
                  }
               }

               return window.Mousetrap[key].apply(window.Mousetrap, args);
            }
         })(i);
      }

      module.on('ready', function() {
         var linkClick = function() {
            $(this).each(function() {
               $(this).get(0).click();
            });
         }

         var thing = (location.href.match(/display_.{1,}.html/g)||[''])[0].replace(/display_/, '').replace(/\.html/, '');
         thing = thing || (location.href.match(/add_.{1,}.html/g)||[''])[0].replace(/add_/, '').replace(/\.html/, '');
         thing = thing || (location.href.match(/edit_.{1,}.html/g)||[''])[0].replace(/edit_/, '').replace(/\.html/, '');
         thing = thing || (location.href.match(/delete_.{1,}.html/g)||[''])[0].replace(/delete_/, '').replace(/\.html/, '');
         thing = thing || (location.href.match(/list.{1,}s.html/g)||[''])[0].replace(/list/, '').replace(/s\.html/, '');

         if (thing) {
            var n = ((thing.charAt(0).match(/[aeiouy]/) || []).length > 0) ? 'n' : '';

            var formatVar = function(key) {
               return key.charAt(0).toUpperCase() + key.slice(1).replace(/_\w/g, function(c) {
                  return ' '+c.slice(1).toUpperCase();
               });
            }

            var thingFormatted = formatVar(thing);
            var thingFormattedPlural = (thingFormatted+'s').replace(/ys\s/gi, 'ies ');

            module.bind('ctrl+shift+a', function() {
               window.location = Q.siteRoot+'/add_'+thing+'.html';
            }, 'Add a'+n+' '+thingFormatted);
            module.bind('ctrl+shift+l', function() {
               window.location = Q.siteRoot+'/list'+thing+'s.html';
            }, 'List all '+thingFormattedPlural);

            $('a:contains("Edit this "):first').keycombo('ctrl+shift+e', linkClick, 'Edit this '+thingFormatted);
            // $('a:contains("Delete this "):first').keycombo('ctrl+shift+d', linkClick, 'Delete this '+thing);
            // I need to find a keycombo that doesn't conflict
            $('a:contains("Clone this "):first').keycombo('ctrl+shift+c', linkClick, 'Clone this '+thingFormatted);
         }

         $('#top_paging_previous').keycombo('ctrl+shift+left', linkClick, 'Go to the previous '+thingFormatted);
         $('#top_paging_next').keycombo('ctrl+shift+right', linkClick, 'Go to the next '+thingFormatted);

         if ($('#filters').length) {
            module.bind('ctrl+shift+f', function() {
               $('a:contains("Show Filters"):first').click();
               if ($('#filters:visible').length) {
                  $(window).scrollTop($('#filters').offset().top-20);
               }
            }, 'Toggle filters');
         }

         if ($('table.list_table').length) {
            // Q.import('quick-filter');
         }

         var ux = Q('ux');
         if (ux) {
            ux.on('displayAllInfo', function($popup) {
               $table = $('<table>');

               (module.registeredCombos.concat([{
                  combo: '?',
                  label: 'Show all keycombos'
               }])).forEach(function(combo) {
                  var $tr = $('<tr>');
                  $tr.append('<td style="padding-right: 2em;">'+combo.combo+'</td><td>'+combo.label+'</td>');
                  $table.append($tr);
               });

               $popup.append('<h3 style="margin-top: .5em;">Keycombos for this page:</h3>');
               $popup.append($table);
               $popup.append('<br>');
               // $popup.append($("<pre>Q('keybind').bind('keycombo', function() {<br>   // Callback function<br>}, 'label');</pre>"));
            });

            module.bind('?', function() {
               var actions = Q('actions');
               if (actions) {
                  actions.triggerAction('ux.toggleInfo');
               }
            }, false);
         }
      });

      $.fn.keycombo = function(combo, action, label) {
         var $elems = $(this);
         label = (label || $elems.selector);
         if ($elems.length) {
            module.bind(combo, function(a,b) {
               action.call($elems, a, b);
            }, label);
         }
      };

      if (Q.initCalled) Q.initModule(module.key);
   };

   if (!window.Mousetrap) {
      Q.import('../mousetrap.js', function() {
         callback();
      });
   } else {
      callback();
   }
})(Q);
