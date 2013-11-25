
<%@ include file="init.jsp" %> 
<%
	try 
	{
		String id = request.getParameter("id");
		String reqUrl = id + "/status";  
		URL url = new URL(reqUrl);
		HttpURLConnection con = (HttpURLConnection)url.openConnection();
		String charset = "UTF-8";
		response.setContentType(con.getContentType());
		BufferedReader rd = new BufferedReader(new InputStreamReader(con.getInputStream()));
		String line;
		while ((line = rd.readLine()) != null)	out.println(line);
		rd.close();
	} 
	catch(java.io.FileNotFoundException fnfe)
	{
		out.println("EXPIRED");
	}
	catch(Exception e)
	{
		System.out.println("####### CRAAAAAAAASH!");
		e.printStackTrace();
		response.setStatus(500);
	}
%>