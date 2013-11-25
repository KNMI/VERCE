<%@ include file="init.jsp" %>

<h2 align="center">Hello! Welcome to the Dispel Gateway.</h2>

What do you want to do today?

<ul>
  <li>
    <a href="<%= showresponseURL.toString()+"&action=version" %>">View version</a> - View the version of the Gateway. 
  </li>
  <li>
    <a href="<%= submitURL.toString() %>">Submit DISPEL</a> - Submit your DISPEL request to the Gateway.
  </li>  
  <li>
    <a href="<%= validateURL.toString() %>">Validate DISPEL</a> - Validate your DISPEL request and see the graphical representation.
  </li>
  <li>
    <a href="<%= showresponseURL.toString()%>">List DISPEL processes</a> - List all current Gateway processes.
  </li>  
  <li>
    <a href="<%= insertprocessURL.toString() %>">Show process by id</a> - Get single process information by its identificator. 
  </li>
  <li>
    <a href="<%= showresponseURL.toString()+"&action=localResources" %>">List local resources</a> - List local resources of the Gateway. 
  </li> 
   <li>
    <a href="<%= showresponseURL.toString()+"&action=allResources" %>">List all resources</a> - List all resources known to the the Gateway. Some might be on remote gateways. 
  </li> 
  <li style="display:none;">
    <a href="doc">Documentation</a> - View the documentation.
  </li>
  <li style="display:none;">
    <a href="<%= interactURL.toString() %>">Interactive Dispel</a> - Select and configure your workflow.
  </li>
  <li>
    <a target="_blank"href="http://www.admire-project.eu/">Visit</a> - Visit the ADMIRE Home Page.
  </li>
  <li style="display:none;">
    <a href="<%= provantURL.toString() %>">PROVANT</a> - View the version of the Gateway. 
  </li>
</ul>