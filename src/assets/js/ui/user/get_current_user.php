<?php
// $user = $modx->getUser();
// $name =  $user->get('username');
// $id =  $user->get('id');
// return '{"username": "'.$name.'", "id":'.$id.'}';


if($usr){
  
  $user = $usr->toArray();
  $modx->user = $usr;
} else {
  $user = $modx->user->toArray();
}

$arr = [];
$user = $modx->user->toArray();

if($user['id'] == 0){ return '{"username": null}';}

$profile = $modx->user->getOne('Profile')->toArray();




$arr['id'] = $profile['id'];
$user['id'] > 1 ? $arr['role'] = "user" : $arr["role"] = "admin";
$arr['fullname'] = $profile['fullname'];
$arr['phone'] = $user['phone'];
$arr['email'] = $profile['email'];
$arr['username'] = $profile['email'];
$arr["success"] = true;

$result = $modx->getObject('modUserProfile', array('id' => $user['id']));
$fields = $result->get('extended');

$fields['approved'] ? $arr['approved'] = true : $arr['approved'] = false;
$fields['files'] && $arr['files'] = $fields['files'];




if($user['id'] == 1){
  $u = [];
  $c = $modx->newQuery('modUser');
  $users = $modx->getCollection("modUser",$c);
  foreach($users as $user){
    $userArray = $user->toArray();
    if($userArray['id'] == $arr['id']) continue;
    $profile = $user->getOne('Profile')->toArray();
    $u['id'] = $profile['id'];
    $u['email'] = $profile['email'];
    $u['blocked'] = $profile['blocked'];
    
    $arr['users'][] = [$u];
  }
}

print_r(json_encode($arr));