<%@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet" %>

<portlet:defineObjects />
<div class="workflowbuilder">
	<span>Workflow Builder</span>
	<div id="wf-trash" class="out">			
	</div>
	<div id="wf-items">
			<div class="item" tool="waveform"><span>Waveform</span><center><img src="<%=request.getContextPath()%>/images/waveform.png"/></center></div>
			<div class="item" tool="filter"><span>Filter</span><center><img src="<%=request.getContextPath()%>/images/filter.png"/></center></div>			
			<div class="item" tool="merge"><span>Merge</span><center><img src="<%=request.getContextPath()%>/images/merge.png"/></center></div>			
			<div class="item" tool="process"><span>Process</span><center><img src="<%=request.getContextPath()%>/images/process.png"/></center></div>
			<div class="item" tool="plot"><span>Plot</span><center><img src="<%=request.getContextPath()%>/images/plot.png"/></center></div>
			<div style="float:right"><img src="<%=request.getContextPath()%>/images/emsc.png"/></div>
	</div>
</div>