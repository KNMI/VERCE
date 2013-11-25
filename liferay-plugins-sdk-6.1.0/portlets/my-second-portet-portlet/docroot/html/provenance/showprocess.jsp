<%@ include file="/html/init.jsp" %>
<%
	String sCur = request.getParameter("cur");
	//String sDelta = request.getParameter("delta");
	int cur;
	int delta = 20;	
	try
	{
		cur = new Integer(sCur);
//		delta = new Integer(sDelta);
	}
	catch(NumberFormatException e)
	{
		cur = 1;
//		delta = 15;
	}
	String id = request.getParameter("id");
	session.setAttribute("runid", id);
%>
<script>
	function loadTable() 
	{
		var url = "<%=showprocessajaxURL.toString() + "&id="+id+"&cur="+cur %>";
		$('#portlet_dispelclient_WAR_dispelclientportlet #ajax_div').load(url);
	}
	setTimeout("loadTable();", 1);
</script>

<div id="ajax_div"><!-- Here the table is shown, see showprocess_ajax.jsp --></div>

<br>
<input type=button value='Back' onClick='javascript:history.back();'>
<input type=button value='Home' onClick='goto2("<%= homeURL.toString() %>");'>