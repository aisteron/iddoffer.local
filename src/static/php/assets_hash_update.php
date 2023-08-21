<?php


define('MODX_API_MODE', true);
require '../../index.php';


$modx->getService('error','error.modError');
$modx->setLogLevel(modX::LOG_LEVEL_INFO);
$modx->setLogTarget(XPDO_CLI_MODE ? 'ECHO' : 'HTML');


$path = $modx->getOption('core_path') . 'components/clientconfig/processors/';
$props = array( 'processors_path' => $path);
$dir = $_SERVER["DOCUMENT_ROOT"]."/assets/css/";


if (is_dir($dir)){
  if ($dh = opendir($dir)){
    while (($file = readdir($dh)) !== false){
        if($file !== "." && $file !== ".."){
           $hash = explode(".",$file)[1];
           
           if(strlen($hash)){
               $_POST = array('values' => '{"hash":"'.$hash.'"}' );
               $modx->runProcessor('mgr/settings/save', $_POST, $props);
               echo 'Hash '.$hash.' is applied';
           } else {
               echo 'Can not update hash';
           }
        }
      
    }
    closedir($dh);
  }
}


