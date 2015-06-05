(function(String) {
   RegExp.escape = function(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
   };

   String.prototype.contains = function(query) {
      if (!query) return [this.valueOf()];
      if (parseInt(query) != query) {
         query = query.split(' ').join("(.{1,})?");
      }
      console.log(query)
      return (this.valueOf().match(new RegExp(query, 'gi'))||[]);
   }
})(String);


(function(Q) {
   var module = new Q.module('quick-filter');

   module.quickFilter = function($table, query) {
      if (!$table.data('qf')) module.prepQuickFilter($table);
      var rows = $table.data('rows'),
          $p = $table.data('p');
      var val = $p.children('input').val();

      $p.children('input').val(val).focus();
      // if (!query) $p.children('input').trigger('keydown');

      rows.forEach(function(row) {
         if (row.text.contains(query).length) {
            row.elem.show();
         } else {
            row.elem.hide();
         }
      });
      if (query) {
         $table.find('.list_table_totals_row:visible').hide();
      } else {
         $table.find('.list_table_totals_row:not(:visible)').show();
      }
   }

   module.prepQuickFilter = function($table) {
      $table.data('qf', true);
      var rows = [];
      $table.find('tr:not(.list_table_header_row):not(.list_table_totals_row)').map(function() {
         rows.push({
            elem: $(this),
            text: $(this).text().replace(/\n/g, ' ').replace(/\s{1,}/g, '').trim()
         });
      });
      $table.data('rows', rows);
      var rand = Math.round(Math.random()*100000);
      $p = $('#qf'+rand);
      if (!$p.length) {
         $p = $('<p id="qf'+rand+'" >Quick Filter: <input /> <a href="#" onclick="$(this).siblings(\'input\').val(\'\').focus().trigger(\'keyup\'); return false;">Clear</a>');
         $table.before($p);
         $p.find('input')/*.on('keydown', function(e) {

         })*/.on('keyup', function(e) {
            if (!$(this).val()) {
               module.quickFilter($table, '');
            } else {
               if (e.which == 13) {
                  e.preventDefault();
                  $table.find('tr:not(.list_table_header_row):not(.list_table_totals_row):visible:first').find('td a[href*="display_"]:first').focus();
                  return false;
               } else if (e.which == 27) {
                  e.preventDefault();
                  $(this).blur();
                  return false;
               }
               module.quickFilter($table, $(this).val());
            }
         });
      }
      $table.data('p', $p);
   }

   module.on('ready', function() {
      $('table.list_table').each(function() {
         $(this).keycombo('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split(''), function() {
            module.quickFilter($(this));
         }, false);
      });

      var actions = Q.module('actions');
      actions
         .register(
            'ux.tr-toggle-select',
            function(e) {
               if (e && $(e.target).filter('[href]').length) {
                  return true;
               }
               var $tr = $(this),
                   $table = $(this).closest('table'),
                   $all = $table.find('tr [name="ac[]"]').closest('tr');

               var select = function(last, $elem) {
                  if (last === undefined) last = true;
                  var $elem = ($elem || $tr);
                  $elem.css('background-color', '#C4E8E2').addClass('ux-selected');
                  if (last) {
                     $elem.addClass('ux-last-selected');
                  }
                  $elem.find('[name="ac[]"]').prop('checked', true);
               }
               var unselect = function($elem) {
                  var $elem = ($elem || $tr);
                  $elem.each(function() {
                     $elem.css('background-color', '').removeClass('ux-selected').removeClass('ux-last-selected');
                     $elem.find('[name="ac[]"]').prop('checked', false);
                  });
               }

               var $selectedSiblings = $(this).siblings().filter('.ux-selected'),
                   selected = $(this).hasClass('ux-selected'),
                   toggle = (selected ? unselect : select);

                  if (e && $(e.target).filter('[type="checkbox"]').length) {
                     if (!e.shiftKey) {
                        toggle();
                        return true;
                     }
                  }

               if ($selectedSiblings.length > 0) {
                  if (e) {
                     var $lastSelected = $tr.siblings('.ux-last-selected');
                     if (e.shiftKey && $lastSelected.length) {
                        var i1 = $all.index($lastSelected),
                            i2 = $all.index($tr),
                            start = (i1 > i2) ? i2 : i1,
                            end   = (i1 > i2) ? i1 : i2;

                        unselect($all.filter(':lt('+start+').ux-selected'));

                        for(var i = start; i <= end; i++) {
                           select((i==i1), $all.filter(':nth('+i+')'));
                        }

                        unselect($all.filter(':gt('+end+')'));

                        if (e && $(e.target).filter('[type="checkbox"]').length && e.shiftKey) {
                           $(e.target).prop('checked', true);
                        }

                        document.getSelection().removeAllRanges();
                     } else if (e.ctrlKey) {
                        toggle();
                     } else {
                        select();
                        $selectedSiblings.triggerAction('ux.tr-toggle-select');
                     }
                  } else {
                     toggle();
                  }
               } else {
                  select();
               }
               unselect($all.filter(':not(.ux-selected)').find('[name="ac[]"]').filter(':checked').closest('tr'));
            },
            'click',
            $('.list_table tr [name="ac[]"]').closest('tr').css('cursor', 'pointer'));
   });

   Q.initModule(module.key); // Just to be safe
})(Q);
