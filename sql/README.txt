sqlncli is the SQL Server Native Client 2012. If SQL Server 2014 is installed, sqlncli.msi should already be installed. 
if you are not using SQL Server 2014, then you may need to install this.

Microsoft's Database Connector needs to be installed as well. it may already be installed, but if not, run and install msodbcsql.msi

Alter the php.ini file to include this line (TO-DO: Create a php.ini file with all the stuff as it should be plus this line)
extension=php_sqlsrv_56_ts.dll

The SQL Server PHP dll's are included in the DLL's folder. it is recommended you move the correct one to your php extensions folder,
but you could alternatively set the path to this extension in the php.ini file if you knew how to do so.
(TO-DO: determine which version of PHP we are using and thus which dll to move.)
(EDT: above line uses the thread safe version of PHP 5.6. might as well use that one.)
php_sqlsrv_56_ts.dll