<?php
// Create connection
$con = mysqli_connect("localhost","neardrop","neardrop!!@@##$$","neardrop");

// Check connection
if (mysqli_connect_errno()) {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
}

// 60초가 지난 것들은 삭제 
mysqli_query($con,"DELETE FROM user WHERE timestamp < DATE_SUB(NOW(), INTERVAL 10 SECOND)");

$cmd = $_POST['cmd'];
$id = $_POST['id'];

//echo $cmd;
if($cmd == "getNeighbors") {
	$longitude = $_POST['longitude'];
	$latitude = $_POST['latitude'];
	
	// 접속한 사용자 정보를 DB에 업데이트한다.
	$result = mysqli_query($con,"SELECT count(*) AS countUsers FROM user WHERE id=\"".$id."\"");
	$row = mysqli_fetch_array($result);

	if($row['countUsers'] != 0) { // 존재
		mysqli_query($con,"UPDATE user SET longitude=".$longitude.", latitude=".$latitude .", timestamp=NOW() WHERE id=\"".$id."\"");
	}
	else { // 존재안하면 추가 
		mysqli_query($con,"INSERT INTO user VALUES (\"".$id."\", ".$longitude.", ". $latitude .",NOW())");
	}
	

	
	// 가까운 사람들을 응답으로 반환한다.
	$response = array();
	$result = mysqli_query($con,"SELECT * FROM user WHERE sqrt(pow(abs(longitude-".$longitude."),2)+pow(abs(latitude-".$latitude."),2))<0.003 LIMIT 6");
	while($row = mysqli_fetch_array($result)) {
		if($id!="\"".$row["id"]."\"") {
			$user = array();
			$user["id"]=$row["id"];
			array_push($response,$user);
		}
	}
	
	header('Content-type: application/json');
	echo json_encode($response);

}
else if($cmd == "deleteMe") {
	mysqli_query($con,"DELETE FROM user WHERE id=\"".$id."\"");
}

mysqli_close($con);
 

?>
