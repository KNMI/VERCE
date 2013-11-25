<%@ include file="init.jsp" %>
<br><br>
<form action="<%= showprocessURL.toString() %>" method="POST" >
	<div style="width:570px;">
		<strong>Process id:</strong> <input type="text" name="id" class="processid"><br>
		A process id looks like: http://localhost:9090/DispelGateway/services/process-....<br>
		<input type=submit value="Submit" style="float:right;"><br><br>
	</div>
</form>
<input type=button value='Back' onClick='javascript:history.back();'>
<input type=button value='Home' onClick="goto2('<%= homeURL.toString() %>');">