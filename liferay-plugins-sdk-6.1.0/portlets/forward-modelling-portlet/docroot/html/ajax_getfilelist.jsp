<%@ page import="java.util.List"%>
<%@ page import="com.liferay.portal.kernel.repository.model.FileEntry"%>
<%@ page import="com.liferay.portlet.documentlibrary.service.DLAppServiceUtil"%>
<%@ page import="com.liferay.portlet.documentlibrary.model.DLFolderConstants"%>
<%@ page import="com.liferay.portal.util.PortalUtil"%>
<%@ page import="com.liferay.portal.service.ServiceContext"%>
<%@ page import="com.liferay.portal.kernel.repository.model.Folder"%>
<%@ page import="com.liferay.portal.kernel.exception.PortalException"%>
<%@ page import="com.liferay.portal.kernel.exception.SystemException"%>
<%@ page import="com.liferay.portal.kernel.util.HttpUtil"%>
<%@ page import="com.liferay.portal.kernel.util.HtmlUtil"%>
<%@ page import="com.verce.forwardmodelling.Constants"%>



<style>
ul.fmportlet-filelist
{
	list-style-type: none;
	padding: 0;
	background-color: white;
	margin: 0;
	height: 100%;
}
ul.fmportlet-filelist li
{
	color: #416DA3;
	font-family: tahoma,arial,verdana,sans-serif;
	font-size: 11px;
	font-weight: bold;
	line-height: 13px;
	padding: 5px;
	cursor: pointer;
	border-radius: 5px;
	background-color: white;
}
div.fmportlet-filelist
{
	color: #416DA3;
	font-family: tahoma,arial,verdana,sans-serif;
	line-height: 13px;
	padding: 5px;
}
</style>

<%

// Get all the information to access the files
String userSN = request.getParameter("userSN");
String filetype = request.getParameter("filetype");
long groupId =  PortalUtil.getScopeGroupId(request);
long repositoryId = DLFolderConstants.getDataRepositoryId(groupId, DLFolderConstants.DEFAULT_PARENT_FOLDER_ID);
ServiceContext serviceContext = new ServiceContext();
serviceContext.setScopeGroupId(groupId);
long folderId = getFolderId(repositoryId, userSN, filetype, serviceContext);
String serverUrl = PortalUtil.getPortalURL(request);	//http://localhost:8080
String currentURL = PortalUtil.getCurrentURL(request);	//liferay-portal-6.1.0/web/guest/hpc-use-case?....
String portal = currentURL.substring(0, currentURL.substring(1).indexOf("/")+1);// /liferay-portal-6.1.0/
String publicPath = "/documents/" + groupId + "/" + folderId + "/";
publicPath = serverUrl + portal + publicPath;
System.out.println("[ajax_getfilelist.jsp] publicPath:"+publicPath);

// Get the list
List<FileEntry> fileList = DLAppServiceUtil.getFileEntries(repositoryId, folderId, -1, -1);

// Write
if(fileList.size() > 0)
{
%>
	<ul class="fmportlet-filelist">
	<%for(FileEntry f : fileList){
		String completePath = publicPath + HttpUtil.encodeURL(HtmlUtil.unescape(f.getTitle()));
	%>
		<li onClick="selectFile(this);" filePath="<%=completePath %>">
			<%= f.getTitle() %>
		</li>
	<%}%>
	</ul> 
<%}else{%>
	<div class="fmportlet-filelist">
		<br><br>Sorry, you don't have any files at the moment.<br><br>
		Please, upload one file to start.
	</div>
<%}%>
<%!
/*
 * get the folderId for the specific user following the directory structure:
 * root/uploaded_files/userSN/kindOfFile
 * if it doesn't exist it is created
 */
private long getFolderId(long repositoryId, String userSN, String filetype, ServiceContext serviceContext) throws SystemException, PortalException
{
	   Folder folder = null;
	   String baseFolderName = "Forward Modelling";
	   String lastFolderName = "";	   
	   if(filetype.equals(Constants.EVENT_TYPE))	lastFolderName = Constants.EVENT_FOLDER_NAME;
	   if(filetype.equals(Constants.STXML_TYPE))	lastFolderName = Constants.STXML_FOLDER_NAME;
	   if(filetype.equals(Constants.STPOINTS_TYPE))	lastFolderName = Constants.STPOINTS_FOLDER_NAME;
	   
	   try{
		   folder = DLAppServiceUtil.getFolder(repositoryId, DLFolderConstants.DEFAULT_PARENT_FOLDER_ID, baseFolderName);
	   } catch (PortalException pe) {
			System.out.println("[ajax_getfilelist.jsp] Portal exception retrieving base folder "+baseFolderName);
		  	return -1;
	   }
	   try{
		   folder = DLAppServiceUtil.getFolder(repositoryId, folder.getFolderId(), userSN);
	   } catch (PortalException pe) {
			System.out.println("[ajax_getfilelist.jsp] Portal exception retrieving user folder "+userSN);
		  	return -1;
	   }
	   try{
		   folder = DLAppServiceUtil.getFolder(repositoryId, folder.getFolderId(), lastFolderName);
	   } catch (PortalException pe) {
			System.out.println("[ajax_getfilelist.jsp] Portal exception retrieving "+lastFolderName+" folder");
		  	return -1;
	   }
	   return folder.getFolderId();
}

%>