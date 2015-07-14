<%@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet" %>
<%@ taglib uri="http://liferay.com/tld/portlet" prefix="liferay-portlet" %>

<%@ page import="java.util.Vector" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Hashtable" %>
<%@ page import="javax.portlet.PortletPreferences" %>
<%@ page import="com.liferay.portal.kernel.portlet.LiferayWindowState"%>
<%@ page import="com.liferay.portal.kernel.util.ParamUtil" %>
<%@ page import="com.liferay.portal.theme.ThemeDisplay"%>
<%@ page import="com.liferay.portal.util.PortalUtil"%>
<%@ page import="com.liferay.portlet.PortletPreferencesFactoryUtil" %>
<%@ page import="hu.sztaki.lpds.pgportal.services.asm.ASMService" %>
<%@ page import="hu.sztaki.lpds.pgportal.services.asm.ASMWorkflow" %>
<%@ page import="hu.sztaki.lpds.pgportal.services.asm.beans.ASMRepositoryItemBean" %>
<%@ page import="hu.sztaki.lpds.pgportal.services.asm.constants.RepositoryItemTypeConstants" %>
<%@ page import="hu.sztaki.lpds.pgportal.services.asm.ASMWorkflow" %>
<%@ page import="hu.sztaki.lpds.pgportal.services.asm.beans.ASMResourceBean" %>
<%@ page import="hu.sztaki.lpds.pgportal.services.asm.ASMJob" %>
<%@ page import="com.verce.forwardmodelling.Constants"%>

<portlet:defineObjects />

<%ThemeDisplay themeDisplay = (ThemeDisplay)request.getAttribute("THEME_DISPLAY");%>

<liferay-portlet:resourceURL id="getWorkflowList" var="getWorkflowListURL"/>

<liferay-portlet:resourceURL id="deleteWorkflow" var="deleteWorkflowURL"/>

<liferay-portlet:resourceURL id="downloadOutput" var="downloadWorkflowOutputURL" />

<liferay-portlet:resourceURL id="downloadMeshDetails" var="downloadMeshDetailsURL" />

<liferay-portlet:resourceURL id="downloadVelocityModelDetails" var="downloadVelocityModelDetailsURL" />

<liferay-portlet:resourceURL id="submitDownloadWorkflow" var="submitDownloadWorkflowURL" />

<portlet:resourceURL id="meshVelocityModelUpload" var="meshVelocityModelUploadURL" />

<portlet:resourceURL id="uploadFile" var="uploadFileURL" />

<portlet:resourceURL id="submit" var="submitSolverURL" />

<liferay-portlet:renderURL var="getFileListURL">
	<portlet:param name="jspPage" value="/html/ajax_getfilelist.jsp"/>
</liferay-portlet:renderURL>

<liferay-portlet:actionURL name="updateWorkflowDescription" var="updateWorkflowDescriptionURL"/>

<%

PortletPreferences preferences = renderRequest.getPreferences();
String portletResource = ParamUtil.getString(request, "portletResource");
if (portletResource!=null && !portletResource.equals(""))
	preferences = PortletPreferencesFactoryUtil.getPortletSetup(request, portletResource);
String visibleWorkflowIds = preferences.getValue("visibleWorkflowIds", "");
String downloadWorkflowId = preferences.getValue("downloadWorkflowId", "");
String downloadWorkflowName = "";
String downloadWorkflowOwner = "";

List<String> wfNames = new ArrayList();
List<String> wfIds = new ArrayList();
List<String> ownerIds = new ArrayList();
try {
	ASMService asm_service = null;
	asm_service = ASMService.getInstance();
	
	Vector<String> aut = asm_service.getWorkflowDevelopers(RepositoryItemTypeConstants.Application);
	for(String a : aut) {
		Vector<ASMRepositoryItemBean> wfs = asm_service.getWorkflowsFromRepository(a, RepositoryItemTypeConstants.Application);
		for(ASMRepositoryItemBean i : wfs) {
			String wfId = i.getId()+"";
			if(visibleWorkflowIds.contains(wfId)) {
				wfNames.add(i.getItemID());
				wfIds.add(wfId);
				ownerIds.add(a);
			}
            if (downloadWorkflowId.equals(wfId)) {
                downloadWorkflowName = i.getItemID();
                downloadWorkflowOwner = a;
            }
		}
	}
}
catch(Exception e) {
	wfNames.add("Error. Are you connected to guse?");
	wfIds.add("Error");
	ownerIds.add("Error");
}
%>

<script>
	var EVENT_TYPE = '<%=Constants.EVENT_TYPE %>';
	var STXML_TYPE = '<%=Constants.STXML_TYPE %>';
	var STPOINTS_TYPE = '<%=Constants.STPOINTS_TYPE %>';
	var SOLVER_TYPE = '<%=Constants.SOLVER_TYPE %>';
	
	var updateWorkflowDescriptionURL='<%=updateWorkflowDescriptionURL.toString()%>';
	var deleteWorkflowURL='<%=deleteWorkflowURL.toString()%>';
	var downloadWorkflowOutputURL='<%=downloadWorkflowOutputURL.toString()%>';
	var downloadMeshDetailsURL='<%=downloadMeshDetailsURL.toString()%>';
	var downloadVelocityModelDetailsURL='<%=downloadVelocityModelDetailsURL.toString()%>';
	var meshVelocityModelUploadURL='<%=meshVelocityModelUploadURL.toString()%>';
	var uploadFileURL='<%=uploadFileURL.toString()%>';
	var getFileListURL='<%=getFileListURL.toString()%>';
	var getWorkflowListURL='<%=getWorkflowListURL.toString()%>';
	var submitSolverURL='<%=submitSolverURL.toString()%>';
    var submitDownloadWorkflowURL='<%=submitDownloadWorkflowURL.toString()%>';
	var localResourcesPath = '<%=request.getContextPath()%>';
	var userSN = '<%=themeDisplay.getUser().getScreenName() %>';
	var userId = '<%=themeDisplay.getUser().getUserId() %>';
	var portalUrl = '<%=PortalUtil.getPortalURL(request) %>';
	var reposWorkflows = [
   	    <% for(int i=0; i< wfNames.size();i++){ %>
           	{"workflowName":"<%=wfNames.get(i) %>","workflowId":"<%=wfIds.get(i) %>","ownerId":"<%=ownerIds.get(i) %>"},
           <% } %>
       ];
    var downloadWorkflow = {"workflowName": "<%=downloadWorkflowName%>", "workflowId": "<%=downloadWorkflowId%>", "ownerId": "<%=downloadWorkflowOwner%>"};
   	var PROV_SERVICE_BASEURL = "/j2ep-1.0/prov/";
	var IRODS_URL = "http://dir-irods.epcc.ed.ac.uk/irodsweb/rodsproxy/" + userSN + ".UEDINZone@dir-irods.epcc.ed.ac.uk:1247/UEDINZone";
	var IRODS_URL_GSI = "gsiftp://dir-irods.epcc.ed.ac.uk/";
</script>

<%!
public String getResourcesString(String a, ASMWorkflow w, ASMService asm_service) {
	String sRes="";
	Hashtable<String, ASMJob> jobs = w.getJobs();
	for(String jobName : jobs.keySet()) {
		ASMResourceBean res = asm_service.getResource(a, w.getWorkflowName(), jobName);
		if(!sRes.contains(res.getGrid()))	sRes+=res.getGrid()+", ";
	}
	if(sRes.length()>1)	sRes = sRes.substring(0, sRes.length()-2);	//delete the last coma
	sRes = " <div style=\"color:grey\">("+sRes+")</div>";
	return sRes;
}
%>


