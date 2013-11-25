<%@ include file="init.jsp" %>

<script src="<%=request.getContextPath()%>/js/codemirror.js" type="text/javascript"></script>

<h2 align="center">DISPEL Editor</h2>
Type in your DISPEL request below:
<form action="<%= gatewayredirectURL.toString() %>" method="POST" >
	<div style="border-top: 1px solid black; border-bottom: 1px solid black;">
		<textarea name="dispel" id="code" rows="35" cols="80">
		use uk.org.ogsadai.Echo;
		use eu.admire.Results;
		Echo echo = new Echo;
		|- "Hello World!" -| => echo.input;
		Results result = new Results;
		|- "results" -| => result.name;
		result@executionEngine="localEngine";
		echo.output => result.input;
		submit result;
		</textarea>
       </div>
	<input type=submit value="Submit" ><br><br>
	<input type=button value='Back' onClick='javascript:history.back();'>
	<input type=button value='Home' onClick="goto2('<%= homeURL.toString() %>');">
</form>
	
<script type="text/javascript">
  var editor = CodeMirror.fromTextArea('code', {
    height: "500px",
    parserfile: ["tokenizejava.js","parsejava.js"],
    stylesheet: "<%=request.getContextPath()%>/css/javacolors.css",
    path: "<%=request.getContextPath()%>/js/",
	tabMode : "shift"
  });
</script>
	
