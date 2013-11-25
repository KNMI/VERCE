<%@ include file="/html/init.jsp" %>

<% String id = request.getParameter("id"); %>

<h3>Provenance trace for Dataset <br/><%=id %></h3>

<br/>
Click on the DatasetID to view its lineage trace
<br/>

<%
	List  fulltrace = getTraceR(id, 0);
	if(fulltrace.size()>0)
	{
%>
Branch: <strong><%=(String)((Map)fulltrace.get(0)).get("DatasetID") %></strong></br>
Iteration: <strong><%=(String)((Map)fulltrace.get(0)).get("IterationID") %></strong>

	<table class="bordered showtrace">
		<tr>
			<th>DatasetID</th>
			<th>IterationID</th>
			<th>metadata</th>
			<th>annotations</th>
			<th>DatasetURI</th>
		</tr>
	<%
		for (int i = 0; i < fulltrace.size(); i++) 
		{
			if ((fulltrace.get(i) instanceof String && i+1<fulltrace.size())) 
			{
	%>
	</table>
	<br/>
	Branch: <strong><%=(String)((Map)fulltrace.get(i+1)).get("DatasetID") %></strong></br>
	Iteration: <strong><%=(String)((Map)fulltrace.get(i+1)).get("IterationID") %></strong>
	<table class="bordered showtrace">
		<tr>
			<th>DatasetID</th>
			<th>IterationID</th>
			<th>metadata</th>
			<th>annotations</th>
			<th>DatasetURI</th>
		</tr>
	<% 
			} 
			else if ((fulltrace.get(i) instanceof Map))
			{
				Map map = (Map) fulltrace.get(i);
				String dsu = (String) map.get("DatasetURI");
				boolean existsDatasetURI = (dsu!=null && !dsu.equals("") && !dsu.equals("null") && !dsu.equals("None"));
				String metadata = (String) map.get("Metadata");
	%>
		<tr>
			<td><a href="<%=(showtraceURL+"&id="+(String)map.get("DatasetID")) %>"><%= map.get("DatasetID") %></a></td>
			<td><%= map.get("IterationID") %></td>
			<td>
			<%	if(metadata.length()<55){ %>
				<%= metadata %>
			<%	} else { %>
				<div class="popup" id="metadata<%=i%>">
					<a class="close" onclick="hidepopup('metadata<%=i%>')"><div>X</div></a><br>
					<textarea class="longmetadata" readonly><%= metadata %></textarea><br><br>
					<a onclick="copyToClipboard('<%= metadata.replace("'", "\\'") %>')" title="Copy all text to clipboard">Copy to clipboard</a> <br>
					<br>
				</div>
				<a onclick="showpopup('metadata<%=i%>')" title="Click to view complete data">
					<%= metadata.substring(0,50) %>...
				</a>
			<%	} %>
			</td>
			<td><%= map.get("Annotations") %> - </td>
			<td>
			<% 
			if(existsDatasetURI)
			{
				String basePath =  request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + "/intermediate";
				dsu = basePath + dsu.substring(dsu.indexOf("/intermediate-"));
			%> 
				<a href='<%= dsu %>' target="_blank" >Download</a>
			<% } else { %>
				-
			<%}%>
			</td>
		</tr>
		<%	}
			else{
			System.out.println("[showtrace.jsp] Last entry in fulltrace was a string");
			%><br>
			<%}
		}%>
	</table>
	<%}%>
	<input type=button value='Back' onClick='javascript:history.back();'>
	<input type=button value='Home' onClick='goto2("<%= homeURL.toString() %>");'>

<%!
java.sql.Statement s = null;
java.sql.ResultSet rs= null;
int limit=5;

java.util.List getTraceR(String id,int reclevel)
{

java.sql.Connection con =null;

// Remember to change the next line with your own environment
String url=
"jdbc:mysql://localhost:3307/verce";
String user= "root";
String pass = "root";
String driver="com.mysql.jdbc.Driver";
List mapList=new ArrayList();
List mapList2=new ArrayList();

List lineageList=new ArrayList();

try{

DbUtils.loadDriver(driver);
List multipletraces = new ArrayList();
QueryRunner qRunner = new QueryRunner();


String visql ="select DatasetID,IterationID,Metadata,DatasetURI,Annotations from `dataproduct` left join `processiteration` on `dataproduct`.processiterationID=`processiteration`.IterationID where ";
String sql = null;

sql = "select * from `innerstreamlineage` where DatasetID='"+id+"';";

con = DriverManager.getConnection(url, user, pass);
mapList2 = (List) qRunner.query(con, sql, new MapListHandler());
con.close();
System.out.println("ID: "+id+"number of dependencies: "+mapList2.size());
reclevel++;
if(reclevel<limit)
{
for(Object x: mapList2)
{
if ( ((String)(((Map)x).get("DerivedFromDatasetID"))).equals("null"))
{String innersql=visql+"`dataproduct`.DatasetID='"+(String)(((Map)x).get("DatasetID"))+"' ORDER BY CreationDate DESC;"; 
 con = DriverManager.getConnection(url, user, pass);
 mapList = (List) qRunner.query(con, innersql, new MapListHandler());
 DbUtils.closeQuietly(con);
 System.out.println("INSTOP"+mapList.size()+" "+ (String)(((Map)x).get("IterationID")));
 multipletraces.addAll(mapList);
 multipletraces.add("end");
 
 }
 else
  {String stepback= (String)(((Map)x).get("DerivedFromDatasetID"));
   String innersql=visql+"`dataproduct`.DatasetID='"+(String)(((Map)x).get("DatasetID"))+"' ORDER BY CreationDate DESC;"; 
   con = DriverManager.getConnection(url, user, pass);
   mapList = (List) qRunner.query(con, innersql, new MapListHandler());
   DbUtils.closeQuietly(con);
   sql = "select * from `dataproduct` where DatasetID='"+stepback+"';";
   con = DriverManager.getConnection(url, user, pass);
   lineageList = (List) qRunner.query(con, sql, new MapListHandler());
   DbUtils.closeQuietly(con);
   System.out.println("INREC "+sql+" "+lineageList.size()+" reclevel="+reclevel);
   
	   for(Object y: lineageList)
		{ 
		   mapList.addAll(getTraceR((String)((Map)y).get("DatasetID"),reclevel));
		}
    multipletraces.addAll(mapList);
  }
  }
  }else{ multipletraces.add("end");}
  return multipletraces;
}


catch(java.sql.SQLException e) {
				e.printStackTrace();
				return null;
				}
}

%>