<%@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet" %>
<%@ taglib uri="http://liferay.com/tld/portlet" prefix="liferay-portlet" %>

<%@ page import="com.liferay.portal.kernel.portlet.LiferayWindowState"%>
<%@ page import="com.liferay.portal.theme.ThemeDisplay"%>

<portlet:defineObjects />

<%ThemeDisplay themeDisplay = (ThemeDisplay)request.getAttribute("THEME_DISPLAY");%>

<liferay-portlet:renderURL windowState="<%= LiferayWindowState.EXCLUSIVE.toString()%>" var="iframeResultsURL">
	<portlet:param name="jspPage" value="/html/results.jsp"/>
</liferay-portlet:renderURL> 

<script>
	 
	 
	var localResourcesPath = '<%=request.getContextPath()%>';
	var userSN = '<%=themeDisplay.getUser().getScreenName() %>';
	var userId = '<%=themeDisplay.getUser().getUserId() %>';
	var deleteWorkflowURL = "/j2ep-1.0/prov/workflow/delete/"
	 
	 
</script>
</script>