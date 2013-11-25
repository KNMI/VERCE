<%@ include file="/html/init.jsp" %>
<%
//useful if at some point we want to recover from user errors.
String username = LanguageUtil.get(pageContext,"username");
String host = LanguageUtil.get(pageContext,"host");
String port = LanguageUtil.get(pageContext,"port");
if(request.getParameter("username")!=null && !request.getParameter("username").equals("")) username = request.getParameter("username");
if(request.getParameter("host")!=null && !request.getParameter("host").equals("")) host = request.getParameter("host");
if(request.getParameter("port")!=null && !request.getParameter("port").equals("")) port = request.getParameter("port");

%>
<liferay-portlet:renderURL var="gatewayredirectURL">
	<portlet:param name="jspPage" value="/html/gatewayredirect.jsp"/>
</liferay-portlet:renderURL> 
<div id="formulari">
	<form method="post" action="<%= gatewayredirectURL.toString() %>" name="form_participa"> 
		<%
			if(!SessionErrors.isEmpty(renderRequest))
			{
				%>
				<div class="portlet-msg-error">
					<span>
						<label class="miss-error"><liferay-ui:message key="participa.form.errors" /></label><br/>
						<%
						Iterator<String> misItr = SessionErrors.iterator(renderRequest);
				
						while (misItr.hasNext()) {
							String missError=misItr.next();						
						%>
						&nbsp;&nbsp;-&nbsp;<label class="miss-error"><liferay-ui:message key="<%=missError %>" /></label><br/>
						<%}%>
					</span>
					<div class="miss-error"><liferay-ui:message key="participa.form.contact" /></div>
				</div>
			<%}
			else if(false)
			{
			%>
			<div class="portlet-msg-success">
			</div>
			<%}%>
		<div class="camps" >
			<input type="text" value="<%= username %>" name="username" maxlength="75"></input>&nbsp;&nbsp;Username<br/> 
			<input type="password" size="20"></input>&nbsp;&nbsp;Passphrase<br/>
			<input type="text" value="<%= host %>" name="host" maxlength="75"></input>&nbsp;&nbsp;Host<br/>
			<input type="text" value="<%= port %>" name="port" maxlength="75"></input>&nbsp;&nbsp;Port<br/>
		</div>
		<span>
			<input class="submit botoform" type="submit" value="Send"></input>
		</span>
	</form>
</div>



