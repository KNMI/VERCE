<head><title>Enter to database</title></head>

<link rel="stylesheet" href="./css/style.css" type="text/css"></link>
<body>
<h3>Process Activity </br><%=request.getParameter("id") %> </h3>

<br/>
Current Status :
<br/>
<iframe src="<%= request.getParameter("id") %>/status" height="60" frameborder="0">
</iframe>
<br/>
Click on a IterationID to see the produced datasets
<br/>
<table class="bordered" width="65%" >
<tr>
<th>IterationID</th>
<th>InstanceID</th>
<th>Parameters</th>
<th>CreationDate</th>
<th>ErrorMessage</th>
<th>IterationIndex</th>
<th>Stateful</th>

</tr>
<%@ page import="java.util.*" %>
<%@ page import="javax.sql.*" %>
<%@ page import="java.sql.DriverManager" %>
<%@ page import="org.apache.commons.dbutils.DbUtils" %>
<%@ page import="org.apache.commons.dbutils.handlers.MapListHandler" %>
<%@ page import="org.apache.commons.dbutils.QueryRunner" %>
<%@ page import="org.apache.commons.dbutils.DbUtils" %>
<%

session.setAttribute("runid",request.getParameter("id"));


%>
<%!


java.sql.Statement s = null;
java.sql.ResultSet rs= null;
java.sql.Connection con =null;



java.util.List getTrace(String id)
{

con=null;

// Remember to change the next line with your own environment
String url=
"jdbc:mysql://localhost:3306/verce";
String user= "admire";
String pass = "admire";
String driver="com.mysql.jdbc.Driver";

List mapList=new ArrayList();

try{

DbUtils.loadDriver(driver);
con = DriverManager.getConnection(url, user, pass);
 
QueryRunner qRunner = new QueryRunner();


String sql = null;

sql = "select IterationID,ProcessInstanceID,Parameters,CreationDate,ErrorMessage,Stateful,IterationIndex from `processiteration` where `processiteration`.RunID='"+id+"' ORDER BY CreationDate DESC;";

mapList = (List) qRunner.query(con, sql, new MapListHandler());

return mapList;
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
 for (int i = 0; i < fulltrace.size(); i++) 
 {Map map = (Map) fulltrace.get(i);
%>
<tr>
<td><a href="datasetdetail.jsp?id=<%=((String)map.get("IterationID")) %>" ><%=((String)map.get("IterationID")) %>..</a></td>
<td><%= ((String)map.get("ProcessInstanceID")).substring(0,20) %>..</td>
<td><%= map.get("Parameters") %></td>
 

<td><%= map.get("CreationDate") %></td>
<td><%= map.get("ErrorMessage") %> - </td>
<td><%= map.get("IterationIndex") %>  </td>
<td><%= map.get("Stateful") %>  </td>
</tr>
<%
}

%>

</table>
<%
DbUtils.closeQuietly(con);

}
catch(Exception e) {e.printStackTrace();}

%>

<script src="http://code.jquery.com/jquery-1.6.3.min.js"></script>
<script>
function timedRefresh(timeoutPeriod) {
	setTimeout("location.reload(true);",timeoutPeriod);
}

timedRefresh(15000);
</script>
</body>
</html>


