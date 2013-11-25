<%@ include file="init.jsp" %>

<form action="<%= gatewayredirectURL.toString() %>" method="POST" name="submitdispel">
	
	<div style="width:100%; height: 460px;">
		<div style="float:left; width:70%; height: 460px;">
			<div id="interact">
use uk.org.ogsadai.Echo;<br>
use eu.admire.Results;<br>
Echo echo = new Echo;<br>
|- "<span id="changeable1" class="changeable">Hello World!</span>" -| => echo.input;<br>
Results result = new Results;<br>
|- "<span id="changeable2" class="changeable">results</span>" -| => result.name;<br>
echo.output => result.input;<br>
submit result;<br>
			</div>
			<input type="hidden" id="dispel" name="dispel"/>
       </div>
       <div style="float:left; width:30%; height: 460px;">
		Change text<br>
		<input type="text" value='Hello World!' onChange="changeText(1, this.value);"><br>
		Change results name<br>
		<input type="text" value='results' onChange="changeText(2, this.value);"><br>
       </div>
    </div>
	<input onClick="prepareAndSubmit();" type="button" value="Submit" >	
</form>
<br><br>
<input type=button value='Back' onClick='javascript:history.back();'>
<input type=button value='Home' onClick="goto2('<%= homeURL.toString() %>');">

<script>
function changeText(pos, newtext)
{
	$('#changeable'+pos).text(newtext);
}
function prepareAndSubmit(){
	$('#dispel').text($('#interact').text());
	document.submitdispel.submit();
}

</script>