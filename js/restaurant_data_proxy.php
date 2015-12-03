<?
	if(array_key_exists('url',$_REQUEST)) {
		$url = $_GET['url'];
	}
	else {
		echo "<strong>Need a <em>url</em> to fetch!</strong>";
		exit();
	}
	
	$options = array(
		CURLOPT_HEADER => false,
		CURLOPT_URL => $url,
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_SSL_VERIFYPEER => false
	);
	
	$feed = curl_init();
	curl_setopt_array($feed, $options);
	$result = curl_exec($feed);
	$info = curl_getinfo($feed);
	curl_close($feed);
	
	if(isset($info['content-type']) && isset($info['size_download'])) {
		header('Content-Type: ' . $info['content-type']);
		header('Content-Length: ' . $info['size_download']);
	}
	
	$result = preg_replace('/(\s)+/', ' ', $result);
	echo($result);
?>