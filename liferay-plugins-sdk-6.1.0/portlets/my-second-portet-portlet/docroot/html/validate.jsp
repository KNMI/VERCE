<%@ include file="init.jsp" %>
<script src="<%=request.getContextPath()%>/js/codemirror.js" type="text/javascript"></script>

<liferay-portlet:renderURL var="showresponseURL">
	<portlet:param name="jspPage" value="/html/showresponse.jsp"/>
</liferay-portlet:renderURL> 

<h2 align="center">DISPEL Editor</h2>
Type in your DISPEL request below:
<FORM ACTION="<%= showresponsevalidateURL.toString()+"&action=validate" %>" METHOD="POST">
  <div style="border-top: 1px solid black; border-bottom: 1px solid black;">
	<textarea name="dispel" id="code">
		use uk.org.ogsadai.SQLQuery;
		use uk.org.ogsadai.TupleToWebRowSetCharArrays;
		use eu.admire.Results;
		
		SQLQuery query = new SQLQuery;
		String expression = "SELECT * FROM weather";
		|- expression -| => query.expression;
		|- "MySQLResource" -| => query.resource;
		TupleToWebRowSetCharArrays toWRS = new TupleToWebRowSetCharArrays;
		query.data => toWRS.data;
		
		Results result = new Results;
		|- "results" -| => result.name;
		toWRS.result => result.input;
		
		submit toWRS;
	</textarea>
  </div>
  <INPUT TYPE=submit VALUE="Validate"><br><br>
  <input type=button value='Back' onClick='javascript:history.back();'>
  <input type=button value='Home' onClick='goto2("<%= homeURL.toString() %>");'>
</FORM>
<script type="text/javascript">
  var editor = CodeMirror.fromTextArea('code', {
    height: "500px",
    parserfile: ["tokenizejava.js","parsejava.js"],
    stylesheet: "<%=request.getContextPath()%>/css/javacolors.css",
    path: "<%=request.getContextPath()%>/js/",
	tabMode : "shift"
  });
</script>
