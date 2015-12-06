$( "#dialog" ).dialog({
	width: 400,
	buttons: [
		{
			text: "Ok",
			click: function() {
				$( this ).dialog( "close" );
			}
		},
		{
			text: "Cancel",
			click: function() {
				$( this ).dialog( "close" );
			}
		}
	]
});

$( "#accordion" ).accordion({
    collapsible: true,
    active: false,
});

$( "#Popout" ).accordion({
    collapsible: true,
    active: false,
});
