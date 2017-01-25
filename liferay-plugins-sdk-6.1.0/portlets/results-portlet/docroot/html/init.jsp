<%@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet" %>
<%@ taglib uri="http://liferay.com/tld/portlet" prefix="liferay-portlet" %>
<%@ page import="com.liferay.portal.kernel.portlet.LiferayWindowState"%>
<%@ page import="com.liferay.portal.theme.ThemeDisplay"%>
<%@ page import="com.liferay.portal.util.PortalUtil"%>
<%@ page import="com.liferay.portal.model.User" %> 

<portlet:defineObjects />

<%User user = PortalUtil.getUser(request);%> 

<liferay-portlet:renderURL windowState="<%= LiferayWindowState.EXCLUSIVE.toString()%>" var="iframeResultsURL">
	<portlet:param name="jspPage" value="/html/results.jsp"/>
</liferay-portlet:renderURL> 

<script>
	 
	 
	var localResourcesPath = '<%=request.getContextPath()%>';
	var userSN = '<%=user.getScreenName() %>';
	var userId = '<%=user.getUserId() %>';
	var deleteWorkflowURL = "/j2ep-1.0/prov/workflow/delete/"
	var IRODS_URL = "/irods-cloud-backend/download?path=/verce/home/"+userSN+"/verce"
    var IRODS_URL_GSI = "gsiftp://verce-irods.scai.fraunhofer.de/"
    var RADIAL= "/results-portlet/html/d3js.jsp?minidx=0&maxidx=10&level=prospective&groupby=actedOnBehalfOf"	      	                    
	var iDROP='http://iren-web.renci.org/idrop-release/idrop.jnlp'   
	var RADIAL='/forward-modelling-portlet/html/d3js.jsp?minidx=0&maxidx=10&level=prospective&groupby=actedOnBehalfOf'	      	                    
	var PROV_SERVICE_BASEURL="/j2ep-1.0/prov/"
	var deleteWorkflowDataURL = "/j2ep-1.0/irods/irodsweb/services/delete.php"
	
	  
</script>    
