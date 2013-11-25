<%@ include file="/html/init.jsp" %>

<script>	
	setTimeout("loadTable();", 15000);
</script>
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
%>

	<h3>Process Activity </br><%=id%></h3>
	<br/>
	Current Status :
	<br/>
	<iframe src="<%=statusURL.toString()+"&id="+id %>" height="60" frameborder="0"></iframe>
	<br/>
	Click on a IterationID to see the produced datasets
	<br/>
	This table automatically refreshes. Last updated at: <%=(new java.util.Date()).toString()%>
	<br/>

	<%
		String sql = "select IterationID,ProcessInstanceID,Parameters,CreationDate,ErrorMessage,Stateful,IterationIndex from `processiteration` where `processiteration`.RunID='"+id+"' ORDER BY CreationDate DESC";
		String sqlCount = "select count(*) from `processiteration` where `processiteration`.RunID='"+id+"'";
		List mapList = getTrace(id, sql, delta*(cur-1), delta*cur);
		int total = getCount(id, sqlCount);
		//out.write("TOTAL: "+total+"<br/>");
		//out.write("Mostrant: "+mapList.size()+"<br/>");
		//out.write("start: "+delta*(cur-1)+", end: "+delta*cur+"<br/>");
		
		/* //Ull!! Per desenvolupament unicament!!
		if(mapList==null || mapList.size()==0)
		{
			for(int i = 0; i < 21; i++)
			{
				Map m = new HashMap();
				m.put("IterationID", "test");
				m.put("ProcessInstanceID", "testProcessInstanceIDtestProcessInstanceIDtestProcessInstanceIDtestProcessInstanceIDtestProcessInstanceID");
				m.put("Parameters", "test");
				m.put("CreationDate", (new java.util.Date()).toString());
				m.put("ErrorMessage", "test");
				m.put("IterationIndex", new Integer(i));
				m.put("Stateful", "test");
				mapList.add(m);
			}			
		}*/
		
		PortletURL portletURL = renderResponse.createRenderURL();
		portletURL.setParameter("jspPage", "/html/provenance/showprocess.jsp");
		portletURL.setParameter("id", id);
		
		portletURL.setWindowState(LiferayWindowState.NORMAL);
		SearchContainer searchContainer = new SearchContainer(renderRequest, null, null, SearchContainer.DEFAULT_CUR_PARAM, delta, portletURL, null, null);
	    searchContainer.setTotal(total);
	    //List mapList2 = mapList.subList(delta*(cur-1), Math.min((delta*cur), mapList.size()));
	    List mapList2 = mapList;
	    searchContainer.setResults(mapList2);
	    List<String> headerNames = new ArrayList<String>();
	    headerNames.add("Iteration ID");
	    headerNames.add("Instance ID");
	    headerNames.add("Parameters");
	    headerNames.add("Creation Date");
	    headerNames.add("Error Message");
	    headerNames.add("Iteration Index");
	    headerNames.add("Stateful");
	    searchContainer.setHeaderNames(headerNames);
	    List resultRows = searchContainer.getResultRows();
	    for(int i=0; i<mapList2.size(); i++){
	    	Map map = (Map) mapList2.get(i);
	        ResultRow row = new ResultRow(map, (String)map.get("IterationID"), i);
	        row.addText(((String)map.get("IterationID")), (datasetdetailURL+"&id="+(String)map.get("IterationID")));
	        row.addText(((String)map.get("ProcessInstanceID")).substring(0,20)+"...");
	        row.addText((String)map.get("Parameters"));
	        row.addText(((Object)map.get("CreationDate")).toString());
	        row.addText((String)map.get("ErrorMessage"));
	        row.addText(String.valueOf(((Integer)map.get("IterationIndex")).intValue()));
	        row.addText((String)map.get("Stateful"));
	        resultRows.add(row);
	    }    
	%>
	<liferay-ui:search-iterator searchContainer="<%= searchContainer %>" paginate="true"  />