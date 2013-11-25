<%@ taglib uri="http://liferay.com/tld/portlet" prefix="liferay-portlet" %>
<%@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet" %>
<%@ taglib uri="http://liferay.com/tld/ui" prefix="liferay-ui" %>

<%@ page import="java.net.*,java.io.*,java.util.*" %>
<%@ page import="javax.sql.*,java.sql.*" %>
<%@ page import="java.sql.DriverManager" %>
<%@ page import="javax.portlet.PortletURL"%>
<%@ page import="javax.servlet.ServletException"%>
<%@ page import="java.lang.StringBuilder"%>

<%@ page import="org.apache.commons.dbutils.DbUtils" %>
<%@ page import="org.apache.commons.dbutils.handlers.MapListHandler" %>
<%@ page import="org.apache.commons.dbutils.handlers.ScalarHandler" %>
<%@ page import="org.apache.commons.dbutils.QueryRunner" %>
<%@ page import="com.liferay.portal.kernel.portlet.LiferayWindowState"%>
<%@ page import="com.liferay.portal.theme.ThemeDisplay"%>
<%@ page import="com.liferay.portal.kernel.dao.search.SearchContainer"%>
<%@ page import="com.liferay.portal.kernel.dao.search.ResultRow"%>

<%@ page import="uk.org.ogsadai.client.toolkit.DataSourceResource"%>
<%@ page import="uk.org.ogsadai.client.toolkit.DataStreamData"%>
<%@ page import="uk.org.ogsadai.client.toolkit.DataStreamStatus"%>
<%@ page import="uk.org.ogsadai.client.toolkit.presentation.jersey.JerseyServer"%>
<%@ page import="uk.org.ogsadai.data.DataValue"%>
<%@ page import="uk.org.ogsadai.data.CharData"%>
<%@ page import="uk.org.ogsadai.data.StringData"%>
<%@ page import="uk.org.ogsadai.util.xml.XML"%>


<script src="http://code.jquery.com/jquery-1.6.3.min.js"></script>

<portlet:defineObjects />

<liferay-portlet:actionURL name="provant" var="provantURL"/>
 
<liferay-portlet:renderURL var="submitURL">
	<portlet:param name="jspPage" value="/html/submit.jsp"/>
</liferay-portlet:renderURL>
 
<liferay-portlet:renderURL var="validateURL">
	<portlet:param name="jspPage" value="/html/validate.jsp"/>
</liferay-portlet:renderURL> 

<liferay-portlet:renderURL var="showresponseURL">
	<portlet:param name="jspPage" value="/html/showresponse.jsp"/>
</liferay-portlet:renderURL> 

<liferay-portlet:renderURL var="showresponsevalidateURL">
	<portlet:param name="jspPage" value="/html/showresponsevalidate.jsp"/>
</liferay-portlet:renderURL> 

<liferay-portlet:renderURL var="showprocessURL">
	<portlet:param name="jspPage" value="/html/provenance/showprocess.jsp"/>
</liferay-portlet:renderURL> 

<liferay-portlet:renderURL var="displayresultsURL">
	<portlet:param name="jspPage" value="/html/display-results.jsp"/>
</liferay-portlet:renderURL> 

<liferay-portlet:renderURL windowState="<%= LiferayWindowState.EXCLUSIVE.toString()%>" var="showprocessajaxURL">
	<portlet:param name="jspPage" value="/html/provenance/showprocess_ajax.jsp"/>
</liferay-portlet:renderURL> 

<liferay-portlet:renderURL var="homeURL">
	<portlet:param name="jspPage" value="/html/view.jsp"/>
</liferay-portlet:renderURL> 

<liferay-portlet:renderURL var="showtraceURL">
	<portlet:param name="jspPage" value="/html/provenance/showtrace.jsp"/>
</liferay-portlet:renderURL> 

<liferay-portlet:renderURL var="datasetdetailURL" windowState="<%= LiferayWindowState.NORMAL.toString()%>" >
	<portlet:param name="jspPage" value="/html/provenance/datasetdetail.jsp"/>
</liferay-portlet:renderURL>

<liferay-portlet:renderURL var="interactURL">
	<portlet:param name="jspPage" value="/html/interact2.jsp"/>
</liferay-portlet:renderURL> 

<liferay-portlet:renderURL var="gatewayredirectURL">
	<portlet:param name="jspPage" value="/html/gatewayredirect.jsp"/>
</liferay-portlet:renderURL> 

<liferay-portlet:renderURL var="insertprocessURL">
	<portlet:param name="jspPage" value="/html/insertprocess.jsp"/>
</liferay-portlet:renderURL> 

<liferay-portlet:renderURL var="mapguiURL">
	<portlet:param name="jspPage" value="/html/mapgui.jsp"/>
</liferay-portlet:renderURL> 

<liferay-portlet:renderURL windowState="<%= LiferayWindowState.EXCLUSIVE.toString()%>" var="statusURL">
	<portlet:param name="jspPage" value="/html/showstatus.jsp"/>
</liferay-portlet:renderURL> 

<%

ThemeDisplay themeDisplay = (ThemeDisplay)request.getAttribute("THEME_DISPLAY");
%>

<%!
List getTrace(String id, String sql)
{
	Statement s = null;
	ResultSet rs = null;
	Connection con = null;

	// Remember to change the next line with your own environment
	String url = "jdbc:mysql://localhost:3307/verce";
	String user = "root";
	String pass = "root";
	String driver = "com.mysql.jdbc.Driver";

	List mapList=new ArrayList();

	try
	{		
		DbUtils.loadDriver(driver);
		con = DriverManager.getConnection(url, user, pass);
		QueryRunner qRunner = new QueryRunner();
		mapList = (List) qRunner.query(con, sql, new MapListHandler());
	}
	catch(java.sql.SQLException e)
	{
		System.out.println("[ERROR] getTrace("+id+", "+sql+")");
		e.printStackTrace();
	}
	finally
	{
		DbUtils.closeQuietly(con);
	}
	return mapList;
}
List getTrace(String id, String sql, int start, int end)
{
	if(start >= 0 && end>0)
		sql += " LIMIT "+start+", "+(end-start); 
	return getTrace(id, sql);
}
int getCount(String id, String sql)
{
	Statement s = null;
	ResultSet rs = null;
	Connection con = null;

	// Remember to change the next line with your own environment
	String url = "jdbc:mysql://localhost:3307/verce";
	String user = "root";
	String pass = "root";
	String driver = "com.mysql.jdbc.Driver";

	int count = -1;

	try
	{		
		DbUtils.loadDriver(driver);
		con = DriverManager.getConnection(url, user, pass);
		QueryRunner qRunner = new QueryRunner();
		Long result = (Long)qRunner.query(con, sql, new ScalarHandler());
		if (result != null) 
			count = (int) Math.min(Integer.MAX_VALUE, result.intValue());
	}
	catch(java.sql.SQLException e)
	{
		System.out.println("[ERROR] getCount("+id+", "+sql+")");
		e.printStackTrace();
	}
	finally
	{
		DbUtils.closeQuietly(con);
	}
	return count;
}
%>