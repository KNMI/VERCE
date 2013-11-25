
<%@ include file="init.jsp" %> 
<%
	try 
	{
		String reqUrl = "http://localhost:9090/DispelGateway/services";
		Enumeration keys = request.getParameterNames();  
		
		while (keys.hasMoreElements())  
		{  
			String key = (String)keys.nextElement();  
			String value = request.getParameter(key);  
			if("action".equals(key))  
				reqUrl += "/"+value;
		}
		//System.out.println("[showresponse] Call service: "+reqUrl);
		
		URL url = new URL(reqUrl);
		HttpURLConnection con = (HttpURLConnection)url.openConnection();
		String charset = "UTF-8";
		//con.setDoOutput(true);
		//con.setRequestMethod(request.getMethod());
		//OutputStream output = con.getOutputStream();
		//output.write(query.getBytes(charset));
		response.setContentType(con.getContentType());
		BufferedReader rd = new BufferedReader(new InputStreamReader(con.getInputStream()));
		String line;
		boolean isXml = false;
		while ((line = rd.readLine()) != null)
		{
			//System.out.println("[showresponse] line: "+line);
			//if(line.contains("href=") || line.contains("goto") || line.contains("document.location") || line.contains("viewResults"))
			//{
				line = line.replace("href=\"", "href=\""+showresponseURL+"&action=");
				line = line.replace("href='", "href='"+showresponseURL+"&action=");
				line = line.replace("onClick='goto(\"http://localhost:9090/DispelGateway/services/", "onClick='goto2(\""+showresponseURL+"&action=");
				line = line.replace("onClick=\"goto('http://localhost:9090/DispelGateway/services/", "onClick=\"goto2('"+showresponseURL+"&action=");
				line = line.replace("document.location = 'http://localhost:9090/DispelGateway/services/'", "document.location = '"+showresponseURL+"'");
				line = line.replace("display-results.jsp", displayresultsURL);
				line = line.replace("http://nas-3-0:8080", "http://localhost:9090");
			//}
			if(line.startsWith("<?xml "))
			{
				isXml = true;
				line = "<textarea style='width:100%;background:none;'>" + line;
			}
			out.println(line);
			//System.out.println("[showresponse] Print line: "+line);
		}
		if(isXml) out.println("</textarea>");
		rd.close();
	} 
	catch(Exception e)
	{
		System.out.println("####### CRAAAAAAAASH!");
		e.printStackTrace();
		response.setStatus(500);
	}
%>
<br><br>
<input type=button value='Back' onClick='javascript:history.back();'>
<input type=button value='Home' onClick='goto2("<%= homeURL.toString() %>");'>