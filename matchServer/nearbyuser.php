<?php
// Create connection

$con = mysqli_connect("localhost","root","########","airdropbox");

// Check connection
if (mysqli_connect_errno()) {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
}

// 1.5초가 지난 것들은 삭제 
mysqli_query($con,"DELETE FROM user WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1.5 SECOND)");

$id = $_POST['id'];
$longitude = $_POST['longitude'];
$latitude = $_POST['latitude'];

// 접속한 사용자 정보를 DB에 업데이트한다.
$result = mysqli_query($con,"SELECT count(*) AS countUsers FROM user WHERE id=".$id);
$row = mysqli_fetch_array($result);

if($row['countUsers'] != 0) { // 존재
	mysqli_query($con,"UPDATE user SET longitude=".$longitude.", latitude=".$latitude .", timestamp=NOW() WHERE id=".$id);
}
else { // 존재안하면 추가 
	mysqli_query($con,"INSERT INTO user VALUES (".$id.", ".$longitude.", ". $latitude .",NOW())");
}



// 가까운 사람들을 응답으로 반환한다.
$response = array();
$result = mysqli_query($con,"SELECT * FROM user WHERE sqrt(abs(longitude-".$longitude.") +abs(latitude-".$latitude."))<1 LIMIT 10");
while($row = mysqli_fetch_array($result)) {
	if($id!="\"".$row["id"]."\"") {
		$user = array();
		$user["id"]=$row["id"];
		array_push($response,$user);
	}
}

header('Content-type: application/json');
echo json_encode($response);

mysqli_close($con);
 
//echo " --end";
?>