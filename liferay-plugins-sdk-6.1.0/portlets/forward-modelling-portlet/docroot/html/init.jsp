<%@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet" %>
<%@ taglib uri="http://liferay.com/tld/portlet" prefix="liferay-portlet" %>
<%@ taglib uri="http://liferay.com/tld/theme" prefix="liferay-theme" %>

<%@ page import="java.util.Vector" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.Arrays" %>
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
<%@ page import="com.verce.forwardmodelling.Workflow"%>
<%@ page import="com.verce.forwardmodelling.WorkflowList"%>
<%@ page import="org.json.*"%>

<portlet:defineObjects />
<liferay-theme:defineObjects />

<liferay-portlet:resourceURL id="getWorkflowList" var="getWorkflowListURL"/>

<liferay-portlet:resourceURL id="deleteWorkflow" var="deleteWorkflowURL"/>

<liferay-portlet:resourceURL id="downloadOutput" var="downloadWorkflowOutputURL" />

<liferay-portlet:resourceURL id="downloadMeshDetails" var="downloadMeshDetailsURL" />

<liferay-portlet:resourceURL id="downloadVelocityModelDetails" var="downloadVelocityModelDetailsURL" />

<liferay-portlet:resourceURL id="submitDownloadWorkflow" var="submitDownloadWorkflowURL" />

<liferay-portlet:resourceURL id="submitProcessingWorkflow" var="submitProcessingWorkflowURL" />

<liferay-portlet:resourceURL id="submitMisfitWorkflow" var="submitMisfitWorkflowURL" />

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
String[] simulationWorkflowIds = preferences.getValue("simulationWorkflowIds", "").split("[^\\d]");
String[] downloadWorkflowIds = preferences.getValue("downloadWorkflowIds", "").split("[^\\d]");
String[] processingWorkflowIds = preferences.getValue("processingWorkflowIds", "").split("[^\\d]");
String[] misfitWorkflowIds = preferences.getValue("misfitWorkflowIds", "").split("[^\\d]");

WorkflowList simulationWorkflows = new WorkflowList();
WorkflowList downloadWorkflows = new WorkflowList();
WorkflowList processingWorkflows = new WorkflowList();
WorkflowList misfitWorkflows = new WorkflowList();

ASMService asm_service = null;
try {
	asm_service = ASMService.getInstance();
	
	Vector<String> developers = asm_service.getWorkflowDevelopers(RepositoryItemTypeConstants.Application);
	for(String developer : developers) {
		Vector<ASMRepositoryItemBean> wfs = asm_service.getWorkflowsFromRepository(developer, RepositoryItemTypeConstants.Application);
		for(ASMRepositoryItemBean i : wfs) {
			String wfId = i.getId()+"";
			if(Arrays.asList(simulationWorkflowIds).contains(wfId)) {
                simulationWorkflows.add(new Workflow(i.getItemID(), wfId, developer));
			}
            if (Arrays.asList(downloadWorkflowIds).contains(wfId)) {
                downloadWorkflows.add(new Workflow(i.getItemID(), wfId, developer));
            }
            if (Arrays.asList(processingWorkflowIds).contains(wfId)) {
                processingWorkflows.add(new Workflow(i.getItemID(), wfId, developer));
            }
            if (Arrays.asList(misfitWorkflowIds).contains(wfId)) {
                misfitWorkflows.add(new Workflow(i.getItemID(), wfId, developer));
            }
		}
	}

%>
<script>
	var EVENT_TYPE = '<%=Constants.EVENT_TYPE %>';
	var STXML_TYPE = '<%=Constants.STXML_TYPE %>';
	var STPOINTS_TYPE = '<%=Constants.STPOINTS_TYPE %>';
	var SOLVER_TYPE = '<%=Constants.SOLVER_TYPE %>';
	
	var updateWorkflowDescriptionURL='<%=updateWorkflowDescriptionURL.toString() %>';
	var deleteWorkflowURL='<%=deleteWorkflowURL.toString() %>';
	var downloadWorkflowOutputURL='<%=downloadWorkflowOutputURL.toString() %>';
	var downloadMeshDetailsURL='<%=downloadMeshDetailsURL.toString() %>';
	var downloadVelocityModelDetailsURL='<%=downloadVelocityModelDetailsURL.toString() %>';
	var meshVelocityModelUploadURL='<%=meshVelocityModelUploadURL.toString() %>';
	var uploadFileURL='<%=uploadFileURL.toString() %>';
	var getFileListURL='<%=getFileListURL.toString() %>';
	var getWorkflowListURL='<%=getWorkflowListURL.toString() %>';
	var submitSolverURL='<%=submitSolverURL.toString() %>';
    var submitDownloadWorkflowURL='<%=submitDownloadWorkflowURL.toString() %>';
    var submitProcessingWorkflowURL='<%=submitProcessingWorkflowURL.toString() %>';
    var submitMisfitWorkflowURL='<%=submitMisfitWorkflowURL.toString() %>';
	var localResourcesPath = '<%=request.getContextPath() %>';
	var userSN = '<%=themeDisplay.getUser().getScreenName() %>';
	var userId = '<%=themeDisplay.getUser().getUserId() %>';
	var portalUrl = '<%=PortalUtil.getPortalURL(request) %>';
    var simulationWorkflows = <%= simulationWorkflows.toJSONArray().toString() %>;
    var downloadWorkflows = <%= downloadWorkflows.toJSONArray().toString() %>;
    var processingWorkflows = <%= processingWorkflows.toJSONArray().toString() %>;
    var misfitWorkflows = <%= misfitWorkflows.toJSONArray().toString() %>;
   	var PROV_SERVICE_BASEURL = "/j2ep-1.0/prov/";
	var IRODS_URL = "/irods-cloud-backend/download?path=/verce/home/"+userSN+"/verce";
    var IRODS_URL_GSI = "gsiftp://verce-irods.scai.fraunhofer.de/";
    var RADIAL= "/forward-modelling-portlet/html/d3js.jsp?minidx=0&maxidx=10&level=prospective&groupby=actedOnBehalfOf";
</script>
<%
}
catch(Exception e) {
  // TODO add error
  System.out.println("ASM Service failed, WSPGRADE not yet connected to gUSE?");
  e.printStackTrace();
}
%>

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


