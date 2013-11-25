<%@ include file="init.jsp" %>
<%@ page session="false"%>
<%
	String processId="";

	try 
	{
		String reqUrl = "http://localhost:9090/DispelGateway/services";
		URL url = new URL(reqUrl);
		
		
		HttpURLConnection con = (HttpURLConnection)url.openConnection();
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
			query += String.format(key+"=%s&", URLEncoder.encode(value, charset));
		}  
		OutputStream output = con.getOutputStream();
		output.write(query.getBytes(charset));
		response.setContentType(con.getContentType());
		BufferedReader rd = new BufferedReader(new InputStreamReader(con.getInputStream()));
		String line;
		while ((line = rd.readLine()) != null)
		{
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