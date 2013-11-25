<%@ include file="/html/init.jsp" %>
	
<% 
	String id = request.getParameter("id"); 
	String sql = "select DatasetID,Metadata,DatasetURI,Annotations from `dataproduct` left join `processiteration` on `dataproduct`.processiterationID='"+id+"' where `processiteration`.IterationID='"+id+"';";
	List mapList = getTrace(id, sql);
%>

	<h2>Iteration Datests<br/>
	<%=id %></h2>
	<br/><br/>
	Click on the DatasetID to view its lineage trace
	
	<table class="bordered" >
		<tr>
			<th>DatasetID</th>
			<th>metadata</th>
			<th>annotations</th>
			<th>DatasetURI</th>
		</tr>

	<%	
	for (int i = 0; i < mapList.size(); i++) 
	{
		Map map = (Map) mapList.get(i);
		String dsu = (String) map.get("DatasetURI");
		boolean existsDatasetURI = (dsu!=null && !dsu.equals("") && !dsu.equals("null") && !dsu.equals("None"));
		String metadata = (String) map.get("Metadata");
	%>
		<tr>
			<td><a href="<%=(showtraceURL+"&id="+(String)map.get("DatasetID")) %>"><%= map.get("DatasetID") %></a></td>
			<td class="long">
			<%	if(metadata.length()<120){ %>
				<%= metadata %>
			<%	} else { %>
				<div class="popup" id="metadata">
					<a class="close" onclick="hidepopup('metadata')"><div>X</div></a><br>
					<textarea class="longmetadata" readonly><%= metadata %></textarea><br><br>
					<a onclick="copyToClipboard('<%= metadata.replace("'", "\\'") %>')" title="Copy all text to clipboard">Copy to clipboard</a> <br>
					<br>
				</div>
				<a onclick="showpopup('metadata')" title="Click to view complete data">
					<%= metadata.substring(0,100) %>...
				</a>
			<%	} %>
			</td>
			<td class="short"><%= map.get("Annotations") %> - </td>
			<td>
			<% 
			if(existsDatasetURI)
			{
				String basePath =  request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + "/intermediate";
				//dsu = dsu.replace("file://admire-compute-2-13.local/mnt/verce/pub", basePath);
				dsu = basePath + dsu.substring(dsu.indexOf("/intermediate-"));
			%> 
				<a href='<%= dsu %>' target="_blank" >Download</a>
			<% } else { %>
				-
			<%}%>
			</td>
		</tr>
	
	<%}%>
	
	</table>
<input type=button value='Back' onClick='javascript:history.back();'>
<input type=button value='Home' onClick='goto2("<%= homeURL.toString() %>");'>