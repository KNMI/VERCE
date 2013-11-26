<%@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet" %>
<%@ taglib uri="http://liferay.com/tld/portlet" prefix="liferay-portlet" %>
<%@ taglib uri="http://liferay.com/tld/aui" prefix="aui" %>
<%@ page import="com.liferay.portal.kernel.util.ParamUtil" %>
<%@ page import="com.liferay.portlet.PortletPreferencesFactoryUtil" %>
<%@ page import="javax.portlet.PortletPreferences" %>
<%@ page import="hu.sztaki.lpds.pgportal.services.asm.ASMService" %>
<%@ page import="hu.sztaki.lpds.pgportal.services.asm.ASMWorkflow" %>
<%@ page import="hu.sztaki.lpds.pgportal.services.asm.beans.ASMRepositoryItemBean" %>
<%@ page import="hu.sztaki.lpds.pgportal.services.asm.constants.RepositoryItemTypeConstants" %>
<%@ page import="java.util.Vector" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="hu.sztaki.lpds.pgportal.services.asm.ASMWorkflow" %>


<portlet:defineObjects />

<style>
.forward-modelling-portlet .aui-field-label
{
	font-weight: normal;
}
</style>

<%
String redirect = ParamUtil.getString(request, "redirect");
PortletPreferences preferences = renderRequest.getPreferences();
String portletResource = ParamUtil.getString(request, "portletResource");
if (portletResource!=null && !portletResource.equals(""))
	preferences = PortletPreferencesFactoryUtil.getPortletSetup(request, portletResource);

String visibleWorkflowIds = preferences.getValue("visibleWorkflowIds", "");

try{
	ASMService asm_service = null;
	asm_service = ASMService.getInstance();
	Vector<String> aut = asm_service.getWorkflowDevelopers(RepositoryItemTypeConstants.Application);
	for(String a : aut)
	{
		out.write("<br><strong>Owner "+a+"</strong>");
		Vector<ASMRepositoryItemBean> wfs = asm_service.getWorkflowsFromRepository(a, RepositoryItemTypeConstants.Application);
		for(ASMRepositoryItemBean i : wfs)
			out.write("<br>- "+i.getItemID()+" - "+i.getId());
	}
}
catch(Exception e){
	out.write("<strong>Error</strong>: The list could not be retrieved. Are you connected to guse?<br>");
	out.write("You can continue working but if you are not connected to guse you are not going to be able to do the import<br>");
}
%>

<br>
<liferay-portlet:actionURL portletConfiguration="true" var="configurationURL" />
<aui:fieldset>
	<aui:form action="<%= configurationURL %>" method="post" name="fm">
		<aui:input name="cmd" type="hidden" value="update" />
		<aui:input name="redirect" type="hidden" value="<%= redirect %>" />
		
		<aui:input name="preferences--visibleWorkflowIds--" type="input" label="Visible workflows" value="<%=visibleWorkflowIds %>"
		 	helpMessage="List of workflows ids (numbers) that will be shown to the users, separated by ';'"/>
		 	
		<aui:button-row>
			<aui:button type="submit"/>
		</aui:button-row>
	</aui:form>
</aui:fieldset>
<br/>
