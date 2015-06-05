(function(Q) {
   var module = new Q.module('ux');

   module.jQueryRequired = true;

   if (!Q.getModule('speech')) {
      module.on('init', function() {
         Q.import('speech');
      });
   }

   module.selectListFromObj = function(data) {
      if (!(data.length > 0)) {
         return;
      }

      data = data.map(function(row) {
         row.html = (row.html || row.display_name || row.name || '');
         row.value = (row.value || row.id || '');
         row = {
            id: row.id,
            html: row.html,
            value: row.value
         }
         return row;
      });

      var $container = $('<div/>');

      data.forEach(function(option) {
         $container.append($('<option/>', option))
      });

      return $container.children();
   }

   module.hierarchicalSelect = function(parentElement, childElement, parentTable, childTable, forceParent) {
      var $parent = $(parentElement),
          $child = $(childElement),
          plex = Q.getModule('plex'),
          forceParent = forceParent || false;

      if (parentTable === undefined) {
         parentTable = ($parent.attr('name') || $parent.attr('id')).replace(/_id/, '');
         module.log.info('Parent table wasn\'t given. Using the id from the parent element: "'+parentTable+'"')
      }
      if (childTable === undefined) {
         childTable = ($child.attr('name') || $child.attr('id')).replace(/_id/, '');
         module.log.info('Child table wasn\'t given. Using the id from the child element: "'+childTable+'"')
      }

      if (!plex) {
         module.log.error('The plex library is required');
         return;
      }
      if (!$parent.length || !$child.length) {
         module.log.error('You must pass two valid jQuery elements');
         return;
      }
      if (!parentTable || !childTable) {
         module.log.error('You must pass two table names');
         return;
      }

      var childData;
      plex.list(childTable, ['id', parentTable+'_id', 'name'], function(data) {
         childData = data;
         console.log(data);
      });

      var initalOptions = [
         {
            name: 'Please select...',
            value: ''
         }
      ];

      $parent.change(function() {
         var id = (parseInt($(this).val()) || 0);
         if (id > 0) {
            var data = initalOptions.concat(childData.filter(function(row) {
               return (parseInt(row[parentTable+'_id']) || 0) == id;
            }));
            $child.html(module.selectListFromObj(data));
            if (data.length == 1) {
               $child.attr('disabled', 'disabled');
            } else {
               $child.removeAttr('disabled');
            }
         } else {
            $child.html(module.selectListFromObj(initalOptions.concat(childData)));
            $child.removeAttr('disabled');
         }
      });

      if (forceParent) {
         $child.change(function() {
            var val = parseInt($(this).val()) || 0;
            if (val > 0) {
               var parentVal = (childData.filter(function(row) {
                  return (parseInt(row['id']) || 0) == val;
               })[0] || [])[parentTable+'_id'];
               if (val && parentVal) {
                  $parent.val(parentVal);
               }
            }
         });
      }
   }

   $.fn.hierarchicalSelect = function(childElement, parentTable, childTable, forceParent) {
      var parentElement = $(this);
      Q.getModule('ux').hierarchicalSelect(parentElement, childElement, parentTable, childTable, forceParent);
      return this;
   }


   window.mousePos = {
      x: 0,
      y: 0
   };

   module.tooltipAttr = 'ux-tooltip';
   module.tooltipElemId = module.tooltipAttr+'-box';

   (function() {
      if (!module.tooltipElem) {
         module.on('ready', function() {
            module.tooltipElem = $('<div id="'+module.tooltipElemId+'" style="overflow: auto; padding: 7px; border: 1px solid #BBB; color: grey; background-color: white; position: fixed; z-index: 10000000001; pointer-events: none; margin-top: -40px; -webkit-box-shadow: 6px 6px 16px -4px rgba(0,0,0,0.45); -moz-box-shadow: 6px 6px 16px -4px rgba(0,0,0,0.45); box-shadow: 6px 6px 16px -4px rgba(0,0,0,0.45); max-width: '+($(window).width()/3)+'; display: none;"></div>');
            $('body').append(module.tooltipElem);
         });
      }

      $tooltip = ($tooltip || module.tooltipElem);

      module.displayTooltip = function(visible, x, y, text) {
         if (visible && text) {
            console.log('what?')
            x = x || 0;
            y = y || 0;
            text = text || '';
            module.setTooltipPos(x, y);
            $tooltip
               .html(text)
               .show();
         } else {
            $tooltip.hide();
         }
      }

      module.setTooltipPos = function(x, y) {
         $tooltip
            .css('top', y-module.tooltipElem.height()+23)
            .css('left', x);
      }

      var $tooltip = module.tooltipElem;

      module.resetTooltip = function() {
         var selector = '['+module.tooltipAttr+']';
         $tooltip = ($tooltip || module.tooltipElem);

         $(document)
            .off('mouseenter')
            .on('mouseenter', selector, 0, function() {
               module.displayTooltip(true, mousePos.x, mousePos.y, $(this).attr(module.tooltipAttr));
            })

            .off('mouseleave')
            .on('mouseleave', selector, 0, function() {
               module.displayTooltip(false);
            });

         $(window)
            .off('mousemove')
            .on('mousemove', function(event) {
               var mousePos;
               var dot, eventDoc, doc, body, pageX, pageY;

               event = event || window.event;

               window.mousePos = {
                  x: event.pageX - $(window).scrollLeft(),
                  y: event.pageY - $(window).scrollTop()
               };

               if ($tooltip.filter(':visible').length) {
                  module.setTooltipPos(window.mousePos.x, window.mousePos.y);
               }
            });

         $('[href="#"]').click(function() { // This has bothered me for centuries
            return false;
         });

         return this;
      }

      module.on('ready', module.resetTooltip);
      module.on('ready', function() {
         $('.list_table tr').mousedown(function(e) {
            if ($(e.target).prop('tagName') == 'TD' && $(e.target).text().trim()) {
               return true;
            }
            e.preventDefault();
            return false;
         });
      });

      Q('actions')
         .on('ready', function() {
            this
               .register(['ux.fadeOut'], function() {
                  $(this).fadeOut();
               })
               .register(['ux.fadeIn'], function() {
                  $(this).fadeIn();
               })
               .register(['ux.toggleInfo'], function() {
                  var $popup = $('#uxInfoContainer');
                  if ($popup.length) {
                     if ($popup.filter(':visible').length) {
                        // Reset html
                        $popup.find('#uxInfo').html('');
                        module.trigger('displayAllInfo', $popup.find('#uxInfo'));
                     }
                     $popup.toggle();
                  } else {
                     $popup = $('<div>', {
                        id: 'uxInfoContainer',
                        style: 'position: fixed; left: 30%; right: 30%; top: 20%; bottom: 20%; background-color: white; padding: 1em; border: 3px solid #800000; border-top-left-radius: 10px; border-bottom-left-radius: 10px; overflow-y: scroll; display: none;',
                     });
                     var close = '<a href="#" action-click="keybind.toggleInfo">close</a>';
                     $popup.append(close);
                     $popup.append('<div id="uxInfo">');
                     $popup.append(close);
                     module.trigger('displayAllInfo', $popup.find('#uxInfo'));
                     $popup.appendTo('body').show();
                  }
               })
         });
   })();


})(Q);
