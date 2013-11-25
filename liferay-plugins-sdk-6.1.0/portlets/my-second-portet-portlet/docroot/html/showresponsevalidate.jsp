
<%@ include file="init.jsp" %> 
<%
	try 
	{
		String reqUrl = "http://localhost:9090/DispelGateway/services/validate";
		URL url = new URL(reqUrl);
		HttpURLConnection con = (HttpURLConnection)url.openConnection();
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
		while ((line = rd.readLine()) != null)	out.println(line);
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