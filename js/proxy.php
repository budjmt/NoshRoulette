<?php
	require('OAuth-Helpers.php');

	if(array_key_exists('url',$_REQUEST)) {
		$url = $_GET['url'];
	}
	else {
		echo "<strong>Need a <em>url</em> to fetch!</strong>";
		exit();
	}
	
	$config = array(
		'access_token' => 'bdEkpVNQ4JZghLroR8AlY_YsRy04ioOp',
		'access_token_secret' => '6II4GCx51YCKENmt8BwBnsDSGDU',
		'consumer_key' => 'kP7zkeziNQdtSvYTezywjg',
		'consumer_secret' => 'cUSqCy2gLEa2Pl7Gm6H_c7q3MHg',
		'base_url' => 'https://api.yelp.com/'
	);

	$url_parts = parse_url($url);
	parse_str($url_parts['query'], $url_arguments);
	
	$full_url = $config['base_url'] . $url;
	$base_url = $config['base_url'] . $url_parts['path'];
	
	$oauth = array(
		'oauth_consumer_key' => $config['consumer_key'],
		'oauth_token' => $config['access_token'],
		'oauth_signature_method' => 'HMAC-SHA1',
		'oauth_timestamp' => time(),
		'oauth_nonce' => time()
	);
	
	$encoded_secret = rawurlencode($config['consumer_secret']);
	$encoded_access_token = rawurlencode($config['access_token_secret']);
	$composite_key = $encoded_secret . '&' . $encoded_access_token;
	
	$base_info = buildBaseString($base_url, 'GET', array_merge($oauth, $url_arguments));
	$oauth_signature = base64_encode(hash_hmac('sha1', $base_info, $composite_key, true));
	$oauth['oauth_signature'] = $oauth_signature;
	$header = array(buildAuthorizationHeader($oauth), 'Expect:');
	
	$options = array(
		CURLOPT_HTTPHEADER => $header,
		CURLOPT_HEADER => false,
		CURLOPT_URL => $full_url,
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
	
	echo($result);
?>