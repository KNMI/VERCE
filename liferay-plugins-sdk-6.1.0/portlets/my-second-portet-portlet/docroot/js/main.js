function goto2(url)
{
	document.location = url;
}
function showpopup(popupid)
{
	$('#'+popupid).show();
}
function hidepopup(popupid)
{
	$('#'+popupid).hide();
}
function copyToClipboard (text) {
  window.prompt ("Copy to clipboard: Ctrl+C, Enter", text);
}