<?php
//Takes in a string called sql that is the sql query.
//It returns a two dimensional array of strings. it is an array of queries, returned as an array
//it seems like the best way to deal with this.
//thus, if it is select FNAME, LNAME ... and it returns 3 elements, it'd appear as such:
/*

[
    ['FNAME' => 'Bob', 'LNAME' => 'Sagit']
    ['FNAME' => 'Ryu', 'LNAME' => 'Hyabusa']
    ['FNAME' => 'Samus', 'LNAME' => 'Aran']
]
*/

$serverName = "(local)"; //needs to be changed for different computers.
$connectionInfo = array( "Database"=>"NoshRoulette");
//if using a username, password combination, then replace userName and password and use this line.
//$connectionInfo = array( 'Database'=>'NoshRoulette', 'UID' =>'userName', 'PWD' =>'password');

$conn = sqlsrv_connect( $serverName, $connectionInfo);

if ($conn === false)
{
	die( print_r(sqlsrv_errors(), true));
}

//This is supremely prone to sql injection. I'd care, but...
//Fixing that would be a pain in the ass.
//we could pass a flag and set sql conditionally based on a switch
//but that involves knowing every case that we could run and setting up
//a switch for it. i suppose it is possible, it'd just be a nightmare.
//it'd be easier to set up the query on the web-app and then pass it here
//to run. 
$sql = htmlspecialchars_decode ($_GET['sql']);
$stmt = sqlsrv_query($conn, $sql);
if( $stmt === false ) {
     die( print_r( sqlsrv_errors(), true));
}
sqlsrv_close ($conn);
?>