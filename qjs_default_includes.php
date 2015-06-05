<?php

global $MAJ_js_modules;
$MAJ_js_default_modules = array(
   "plex",
   "actions",
   "ux",
   "speech",
   "keybind",
);
//Hi! - Brook
if($MAJ_userid == 28||52) {
$MAJ_js_modules[] = "recog";
$MAJ_js_modules[] = "hist";
}
if (!count($MAJ_js_modules)) $MAJ_js_modules = array();
$MAJ_js_modules = array_merge($MAJ_js_default_modules, $MAJ_js_modules);

if (count($MAJ_js_modules)) {
   $MAJ_js_modules = array_unique($MAJ_js_modules);
   $js_modules = json_encode($MAJ_js_modules);
} else {
   $js_modules = '[]';
}
$output .= "
<script type='text/javascript'>
   Q.siteRoot = '$MAJ_site_root';
   Q.moduleLocation = Q.siteRoot+'/js/modules/';
</script>";

foreach($MAJ_js_modules as $file) {
   $output .= "<script type='text/javascript' src='$MAJ_site_root/js/modules/$file.js'></script>";
}

$output .= "<script type='text/javascript'>
(function() {
   // Specify the modules to be included.
   // var modules = (modules || []).concat($js_modules);

   if (Q && Q.init && typeof Q.init == 'function') {

      // Q.import(modules, function() {
         // Once all of the modules are imported, initialize!
         Q.init();
      // });
   }
})();
</script>";
