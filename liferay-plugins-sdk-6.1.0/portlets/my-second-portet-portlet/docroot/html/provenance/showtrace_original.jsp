<head><title>Enter to database</title></head>

<link rel="stylesheet" href="./css/style.css" type="text/css"></link>
<body>


<h3>Provenance trace for Dataset <br/><%=request.getParameter("id") %></h3>

<h3><a href="javascript:history.back()"><- Back </a></h3>

<br/>
Click on the DatasetID to view its lineage trace
<br/>

 
<%@ page import="java.util.*" %>
<%@ page import="javax.sql.*" %>
<%@ page import="java.sql.DriverManager" %>
<%@ page import="org.apache.commons.dbutils.DbUtils" %>
<%@ page import="org.apache.commons.dbutils.handlers.MapListHandler" %>
<%@ page import="org.apache.commons.dbutils.QueryRunner" %>
<%@ page import="org.apache.commons.dbutils.DbUtils" %>

<%!


java.sql.Statement s = null;
java.sql.ResultSet rs= null;
java.sql.Connection con =null;

java.util.List getTrace(String id)
{

con=null;

// Remember to change the next line with your own environment
String url=
"jdbc:mysql://localhost:3307/verce";
String user= "root";
String pass = "root";
String driver="com.mysql.jdbc.Driver";
List mapList=new ArrayList();

List lineageList=new ArrayList();

try{

DbUtils.loadDriver(driver);
con = DriverManager.getConnection(url, user, pass);
List multipletraces = new ArrayList();
QueryRunner qRunner = new QueryRunner();


String visql ="select DatasetID,IterationID,Metadata,DatasetURI,Annotations from `dataproduct` left join `processiteration` on `dataproduct`.processiterationID=`processiteration`.IterationID where ";
String sql = null;

sql = "select * from `innerstreamlineage` where DatasetID='"+id+"';";

mapList = (List) qRunner.query(con, sql, new MapListHandler());
//System.out.println("ID: "+id);
//System.out.println("FFFF"+mapList.size()+" "+ (String)((Map)mapList.get(0)).get("DerivedFromDatasetID"));
for(Object x: mapList)
{
if ( ((String)(((Map)x).get("DerivedFromDatasetID"))).equals("null"))
{String innersql=visql+"`dataproduct`.DatasetID='"+(String)(((Map)x).get("DatasetID"))+"' ORDER BY CreationDate DESC;"; 
 mapList = (List) qRunner.query(con, innersql, new MapListHandler());
 //System.out.println("INSTOP"+mapList.size()+" "+ (String)(((Map)x).get("IterationID")));
 multipletraces.addAll(mapList);
 multipletraces.add("end");
 
 }
 else
  {String stepback= (String)(((Map)x).get("DerivedFromDatasetID"));
   String innersql=visql+"`dataproduct`.DatasetID='"+(String)(((Map)x).get("DatasetID"))+"' ORDER BY CreationDate DESC;"; 
   mapList = (List) qRunner.query(con, innersql, new MapListHandler());
  
   sql = "select * from `innerstreamlineage` where DatasetID='"+stepback+"';";
   lineageList = (List) qRunner.query(con, sql, new MapListHandler());
  // System.out.println("INREC "+sql+" "+lineageList.size());
   for(Object y: lineageList)
	   { mapList.addAll(getTrace((String)((Map)y).get("DatasetID")));

	    multipletraces.addAll(mapList);
         
       }
  }
  }
  return multipletraces;
}


catch(java.sql.SQLException e) {
				e.printStackTrace();
				return null;
				}
}
%>
<%


try{

java.util.List  fulltrace = getTrace(request.getParameter("id"));

%>
Branch: <strong><%=(String)((Map)fulltrace.get(0)).get("DatasetID") %></strong>

<table class="bordered">
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
%>

<% if ((fulltrace.get(i) instanceof String && i+1<fulltrace.size())) {

%>


</table>
<br/>
Branch: <strong><%=(String)((Map)fulltrace.get(i+1)).get("DatasetID") %></strong>
<table class="bordered">
<tr>
<th>DatasetID</th>
<th>IterationID</th>
<th>metadata</th>
<th>annotations</th>
<th>DatasetURI</th>
</tr>

<% 
} 
 else {

Map map=(Map)fulltrace.get(i);

%>
 


<tr>
<td><a href="showtrace.jsp?id=<%=((String)map.get("DatasetID")) %>" ><%= map.get("DatasetID") %></a></td>
<td><a href="showiteartion.jsp?id=<%=((String)map.get("IterationID")) %>" ><%= map.get("IterationID") %></a></td>
<td style="width: 100px;"><%= map.get("Metadata") %></td>
<td style="width: 100px;"><%= map.get("Annotations") %> - </td>
<td><% if (!(((String)map.get("DatasetURI")).equals("") || ((String)map.get("DatasetURI")).equals("null") || ((String)map.get("DatasetURI")).equals("None"))) { 

%> 
<a href="<%= ((String)map.get("DatasetURI")).replace("file://","http://").replace(".local/Users/aspinuso/runtime/preprocessed/",":8080/intermediate/") %>" target="_blank" >Download</a></td>
<% } else { 

%>

-

<%
}
%></td>

 </tr>
<%
 
}
}

%>
</table>

<%
DbUtils.closeQuietly(con);

}
catch(Exception e) {e.printStackTrace();}

%>

<script src="http://code.jquery.com/jquery-1.6.3.min.js"></script>


</body>
</html>


