<?php

$serverName = "MICHAEL-PC\MSSQLSERVER"; //needs to be changed for different computers.
$connectionInformation = array( "Database"=>"noshRoulette");
//if using a username, password combination, then replace userName and password and use this line.
//$connectionInformation = array( "Database"=>"noshRoulette", "UID" =>"userName", "PWD" =>"password");

$conn = sqlsrv_connect( $serverName, $connectionInformation);

if ($conn === false)
{
	die( print_r(sqlsrv_errors(), true));
}

echo "Connection established".<br /> //debugging, remove when done.

if (sqlsrv_begin_transaction( $conn) === false)
{
	die( print_r(sqlsrv_errors(), true));
}

echo "Transaction Began"; //more debugging

// please god don't use them. they make my life hell
//also, json accepts ' (single quote), so we should be fine if some dick puts an apostrophe in their
//restaurant name. Regardless, that's not on my end.
$sql = htmlspecialchars_decode ( $_GET['sql'] ); 

$stmt = sqlsrv_execute($conn, $sql);
if( $stmt )
{
	sqlsrv_commit ( $conn );
}
else 
{
	sqlsrv_rollback ( $conn );
	echo "Transaction failed, rolling back);
}

sqlsrv_close ($conn);
return true;
//