<%@ include file="init.jsp" %>
<%@ page session="false"%>
<%
	String processId="";

	try 
	{
		String reqUrl = "http://localhost:9090/DispelGateway/services";
		//String reqUrl = "https://localhost:8443/DispelGateway/services";
		//String reqUrl = "http://dir.epcc.ed.ac.uk:8080/DispelGateway/services";
		URL url = new URL(reqUrl);
		
		
		HttpURLConnection con = (HttpURLConnection)url.openConnection();
		//con.addRequestProperty("Content-Type", "text/plain");
		con.addRequestProperty("X-VERCE-UserDN", themeDisplay.getUser().getJobTitle());
		Enumeration keys = request.getParameterNames();  
		con.setDoOutput(true);
		con.setRequestMethod(request.getMethod());
		String query ="";
		String charset = "UTF-8";
		while (keys.hasMoreElements())  
		{  
			String key = (String)keys.nextElement();  
			String value = request.getParameter(key);  
			if("dispel".equals(key))  
				query += String.format(key+"=%s&", URLEncoder.encode(value, charset));
		}  
		//query+="X-VERCE-UserDN="+themeDisplay.getUser().getMiddleName();
		//con.setDoOutput(true);
		//con.setRequestMethod(request.getMethod());
		OutputStream output = con.getOutputStream();
		output.write(query.getBytes(charset));
		response.setContentType(con.getContentType());
		BufferedReader rd = new BufferedReader(new InputStreamReader(con.getInputStream()));
		String line;
		while ((line = rd.readLine()) != null)
		{
			int s = line.indexOf("<TD>process")+4;
			int e = line.indexOf("</TD>", s);
			if(s>0 && e>0)		processId = line.substring(s, e);
		}
		rd.close();
	} 
	catch(Exception e)
	{
		out.write(e.getMessage());
		System.out.println(e.getMessage());
		response.setStatus(500);
	}
%>

<FORM>
	<TABLE>
		<TR>
			<TD><%=processId %></TD>
			<TD>
				<INPUT TYPE=BUTTON VALUE='Properties' onClick='goto2("<%= showresponseURL.toString()+"&action="+processId %>");'>
			</TD>
			<TD>
				<INPUT TYPE=BUTTON VALUE='Delete' onClick='deleteProcess("http://localhost:9090/DispelGateway/services/<%=processId %>");'>
			</TD>
			
			<TD>
				<INPUT TYPE=BUTTON VALUE='View Results' onClick='goto2("<%= showresponseURL%>&action=../list-results.jsp?process=http://localhost:8080/DispelGateway/services/<%=processId %>");'>
			</TD>
			<TD>
				<INPUT TYPE=BUTTON VALUE='Process Activity' onClick='goto2("<%= showprocessURL.toString()+"&id=http://localhost:9090/DispelGateway/services/"+processId %>");'>
			</TD>
		</TR>
	</TABLE>
</FORM>
<br><br>
<input type=button value='Home' onClick='goto2("<%= homeURL.toString() %>");'>

<script type="text/javascript">
	function deleteProcess(url) {
		 var client; 
		 if (window.XMLHttpRequest)
		 { 
			 client = new XMLHttpRequest();
		 }
		 else if (window.ActiveXObject) 
		 {
		 	req = new ActiveXObject("Microsoft.XMLHTTP");
		 } 
		 client.open("DELETE", url);
		 client.setRequestHeader("Content-Type", "text/plain;charset=UTF-8"); 
		 client.send();
		 alert("Your process has been deleted!"); 
		 document.location = '<%= showresponseURL.toString()%>';
	}
</script>