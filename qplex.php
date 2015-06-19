<?php
error_reporting(E_ALL);

function maj_get_fields_from_array($array, $fields) {
    if ($fields == '*') {
        return $array;
    }

    $new_array = array();
    foreach($fields as $key) {
        $new_array[$key] = $array[$key];
    }
    return $new_array;
}

function maj_get_fields_from_arrays($arrays, $fields) {
    $new_array = array();
    foreach($arrays as $array) {
        $new_array[] = maj_get_fields_from_array($array, $fields);
    }
    return $new_array;
}

function maj_calculate_javascript_version($name, $mysql_type) {
    // this function takes output from a mysql data type and tries to figure out the js type
    // first, get what's in the parenthesese
    $matched = preg_match('/\(.*\)/',$mysql_type,$matches);

    $inner_paren = $matches[0];
    $inner_paren = substr(substr($inner_paren,1),0,-1);

    // if there were no parenthesese
    if(!$matched) {
        // an odd type, switch to see if we can handle it
        switch($mysql_type) {
            case "text":
            return '{"name":"'.$name.'","type":"String","length":64000}';
            break;
            case "timestamp":
            case "datetime":
            return '{"name":"'.$name.'","type":"Date"}';
            break;
            default:
            // not parseable
            return '{"name":"'.$name.'","type":"Unparseable","value":"'.$mysql_type.'"}';
            break;
        }
    }

    // now, see if what we got out was a number
    if(is_numeric($inner_paren)){
        // it's a number, we now have a length value
        $length = intval($inner_paren);

        // get the type of the field without the length
        $matched2 = preg_match('/(.*)\(/',$mysql_type,$matches2);

        if($matched2 == true) {
            //first capture group
            $field_type = $matches2[1];

            switch($field_type) {
                case 'varchar':
                $field_type = 'String';
                break;
                case 'int':
                $field_type = 'Number';
                break;
                default:
                $field_type = 'Unparseable",value:"'.$field_type;
                break;
            }

            return '{"name":"'.$name.'","type":"'.$field_type.'","length":'.$length.'}';
        } else {
            // not matched for some reason
            return '{"name":"'.$name.'","type":"Unparseable","value":"'.$mysql_type.'"}';
        }


    } else {
        // not a number, it must be an enum
        // make sure if it's bool, we send bool
        if(false && $inner_paren == "'y','n'" || $inner_paren == "'n','y'") {
            return '{"name":"'.$name.'","type":"Boolean"}';
        } else {
            //this is an enum, let's parse it
            $parts = explode(',',$inner_paren);
            // trim the quotes
            foreach($parts as $key=>$val) {
                $parts[$key] = substr(substr($val,1),0,-1);
            }

            return '{"name":"'.$name.'","type":"Enum","value":'.json_encode($parts).'}';
        }
    }
}

include_once("../includes/maj_all_includes.php");
include_once("$MAJ_include_path/code/check_session.php");

//config options
$verbose = true;

//50 per list page
$count_per_list_page = (is_numeric($MAJ_number_of_things_to_display_on_a_page) ? $MAJ_number_of_things_to_display_on_a_page : 100);

$method_name = $_SERVER['REQUEST_METHOD'];

//Get the method object like $_POST or $_GET depending on the method used.
$method_object = ${"_".$method_name};

if($method_object['name'] == '' || $method_object['type'] == '') {
    die('{"error":true,"errorData":{"type":"internal","message":"Please supply a Thing Name and Type."}}');
}

//set default page
if($method_object['page'] == '') {
    $method_object['page'] = 0;
}

if(empty($method_object['thingObject'])) {
    $method_object['thingObject'] == "{}";
}

$escaped_name = preg_replace('/[^A-Za-z0-9_\-]/', '_', $method_object['name']);
$escaped_page = intval($method_object['page']);
$escaped_id   = intval($method_object['id']);
$thing_id     = maj_clean(strtolower($escaped_name),255);
$escaped_type = preg_replace('/[^A-Za-z0-9_\-]/', '_', $method_object['type']);

$fields       = preg_replace('/ /', '', $method_object['fields']);
$fields       = explode(',', $fields);

$thing_object = json_decode($method_object['thingObject']);

// die(print_r($thing_object,true));

if (!count($fields) || $fields[0] == '*' || $fields[0] == '') {
    $fields = '*';
}

// die(print_r($fields,true));

// die(print_r(get_defined_vars(),true));

// die(":".$MAJ_userid);

$read_access = maj_check_user_has_read_access_to_thing($MAJ_userid,$thing_id);
$write_access = maj_check_user_has_write_access_to_thing($MAJ_userid,$thing_id);

// die(":".maj_check_user_has_write_access_to_thing($MAJ_userid,$thing_id));

try{
    //ensure that user has perms
    //thing_id is set above ^
    // include_once("$MAJ_include_path/code/check_thing_user_permissions.php");
    if(!$read_access) {
        die('{"error":true,"errorData":{"type":"internal","message":"You do not have read access to this thing."}}');
    }

    include_once("$MAJ_include_path/maj_".$thing_id."_functions.php");

    switch($escaped_type) {
        case "schema":
        // explain how the thing is set up
        $thing_schema_arr = maj_get_array_of_assoc("DESCRIBE ".$thing_id);

        // set up the object
        $out_arr = array();

        foreach($thing_schema_arr as $val) {
            //this is a field
            $out_arr[$val['Field']] = $val['Type'];
        }

        $out_json = '[';

        // loop through each field
        foreach($out_arr as $key=>$type) {
            $out_json .= maj_calculate_javascript_version($key,$type) . ',';
        }

        //chop off the last character and add a ']'
        $out_json = substr($out_json,0,-1) . ']';

        echo($out_json);

        break;
        case "list":

        // die("herro");

        $list_ids = call_user_func("maj_get_all_".$thing_id."_ids");
        $pages = array_chunk($list_ids,$count_per_list_page);
        if($escaped_page > count($pages)-1){
            $page = array();
        } else {
            $page = $pages[$escaped_page];
        }


        //we now have X records of that thing's ids in an array called $page
        //let's populate it with the values
        $populated_page = array();

        foreach($page as $page_thing_id) {
            $page_thing_info = call_user_func("maj_get_".$thing_id."_info",$page_thing_id);
            array_push($populated_page,$page_thing_info);
        }

        // die(print_r($populated_page,true));

        $populated_page = maj_get_fields_from_arrays($populated_page, $fields);

        $populated_page["page"] = $escaped_page;

        $populated_page["additionalPages"] = (count($pages)-1 <= $escaped_page ? false : true);

        echo(json_encode($populated_page));

        break;
        case "read":

        $thing_info = call_user_func("maj_get_".$thing_id."_info",$escaped_id);

        $thing_info = maj_get_fields_from_array($thing_info, $fields);
        echo(json_encode($thing_info));

        break;
        case "add":

        if(!$write_access) {
            die('{"error":true,"errorData":{"type":"internal","message":"You do not have write access to this thing."}}');
        }

        // add a new thing with the data in the $thing_object variable

        $q = "INSERT IGNORE INTO $thing_id (";
        $q2 = ") VALUES (";


        foreach($thing_object as $key=>$val) {
            $type = gettype($val);
            $q .= $key . ", ";
            if($type == 'string') {
                $q2 .= "'" . $val . "'" . ", ";
            } else if($type == 'boolean') {
                if($val) {
                    $q2 .= "'y', ";
                } else {
                    $q2 .= "'n', ";
                }
            } else {
                $q2 .= $val . ", ";
            }
        }

        $q = substr($q,0,-2);
        $q2 = substr($q2,0,-2) . ");";

        // echo($q . $q2);
        $query = $q . $q2;

        // die("\nDONE");

        // insert
        maj_db_do($query);
        echo("true");

        break;
        default:

        break;
    }

} catch(Exception $e) {
    if($verbose) {
        die('{"error":true,"errorData":{"type":"php","message":"'.addslashes($e->getMessage()).'"}}');
    } else {
        die('{"error":true,"errorData":{"type":"php","message":"PHP error message supressed by server-side settings."}}');
    }
}
