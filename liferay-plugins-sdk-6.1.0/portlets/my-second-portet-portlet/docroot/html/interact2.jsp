<%@ include file="init.jsp" %>

<% 


%>

<form action="<%= gatewayredirectURL.toString() %>" method="POST" name="submitdispel">
	
	<div style="width:100%; height: 460px;">
		<div style="float:left; width:50%; height: 460px;">
			Select the station(s)<br>
			<select multiple onChange="changeTextBySelector(1, 'stations');" id="stations" class="dispelinput">
			  <option value="AQU">AQU</option>
			  <option value="TERO">TERO</option>
			  <option value="CAMP">CAMP</option>
			</select><br>			
			Change results name<br>
			<input type="text" value='results' onChange="changeText(2, this.value);"><br>
        </div>
		<div style="float:left; width:50%; height: 460px;">
        	<div id="interact">
				package eu.admire.seismo.di<br>  
				{<br>  
				<span class="hiddencode">
					<%@ include file="hiddencode.jsp" %>
				</span><br>
				<span class="changeablecodecode">
					<%@ include file="changeablecode.jsp" %>
				</span><br>
				}
			</div>
       </div>
    </div>
    
	<input type="hidden" id="dispel" name="dispel"/>
	<input onClick="prepareAndSubmit();" type="button" value="Submit" >	
</form>
<br><br>
<input type=button value='Back' onClick='javascript:history.back();'>
<input type=button value='Home' onClick="goto2('<%= homeURL.toString() %>');">

<style>
.hiddencode
{
	display:none;
}
.dispelinput
{
	width: 200px;
}
</style>

<script>
function changeTextBySelector(pos, selectorId)
{
	var newtext = $("#"+selectorId+" :selected").map(function(){ return this.value }).get().join("\", \"");
	$('#changeable'+pos).text(newtext);
}
function changeText(pos, newtext)
{
	$('#changeable'+pos).text(newtext);
}
function prepareAndSubmit(){
	$('#dispel').text($('#interact').text());
	document.submitdispel.submit();
}

</script>