


package com.verce.forwardmodelling;

import javax.portlet.ActionRequest;
import javax.portlet.ActionResponse;
import javax.portlet.ResourceRequest;
import javax.portlet.ResourceResponse;
import javax.portlet.PortletException;
import javax.servlet.http.HttpServletRequest;

import com.liferay.util.bridges.mvc.MVCPortlet;
import com.liferay.portal.kernel.upload.UploadPortletRequest;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portal.util.PortalUtil;
import com.liferay.portal.kernel.util.FileUtil;
import com.liferay.portlet.documentlibrary.service.DLFileEntryLocalServiceUtil;
import com.liferay.portlet.documentlibrary.service.DLAppServiceUtil;
import com.liferay.portlet.documentlibrary.model.DLFileEntry;
import com.liferay.portal.theme.ThemeDisplay;
import com.liferay.portal.service.ServiceContext;
import com.liferay.portal.kernel.repository.model.Folder;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.exception.SystemException;
import com.liferay.portlet.documentlibrary.model.DLFolderConstants;
import com.liferay.portal.kernel.util.HttpUtil;
import com.liferay.portal.kernel.util.HtmlUtil;

import java.io.*;



public class ForwardModellingPortlet extends MVCPortlet{

   public void provant(ActionRequest req, ActionResponse res)
   {		
		try
		{
			 System.out.println("####################### PROVANT");
			   //System.out.println("%%%%%%%%%% "+PortalUtil.getCDNHost(true));
			   System.out.println("%%%%%%%%%% currentURL: "+PortalUtil.getCurrentURL(req));
			   System.out.println("%%%%%%%%%% homeURL: "+PortalUtil.getHomeURL(PortalUtil.getHttpServletRequest(req)));
			   //System.out.println("%%%%%%%%%% "+PortalUtil.getHost(req));
			   //System.out.println("%%%%%%%%%% "+PortalUtil.getPortalPort(true));
			   System.out.println("%%%%%%%%%% portalURL: "+PortalUtil.getPortalURL(req));
			  // System.out.println("%%%%%%%%%% "+PortalUtil.getPortalWebDir());
			   
	   } catch (Exception e) {
		   System.out.println("[ForwardModellingPortlet.serveResource] Exception catched!!");
	   }
	  
   }    
   
   public void serveResource(ResourceRequest resourceRequest,
	ResourceResponse resourceResponse) throws PortletException, IOException 
	{
	   resourceResponse.setContentType("text/html");
	   try 
	   {
		   UploadPortletRequest uploadrequest = PortalUtil.getUploadPortletRequest(resourceRequest);
		   String name = ParamUtil.getString(uploadrequest, "name");
		   Boolean station = ParamUtil.getBoolean(uploadrequest, "is-station");
		   InputStream inputStream = uploadrequest.getFileAsStream("form-file");
		   long groupId =  PortalUtil.getScopeGroupId(resourceRequest);
		   long userId =  PortalUtil.getUserId(resourceRequest);

		   if(inputStream!=null){
			   File file = com.liferay.portal.kernel.util.FileUtil.createTempFile(inputStream);
			   String uploadString = getFileAsString(file);		//content

			   if (uploadString!=null)
			   {
				   try{
					   String publicPath = addFileToDL(file, name, groupId, userId, station);
					   String portalUrl = PortalUtil.getPortalURL(resourceRequest);
					   String currentURL = PortalUtil.getCurrentURL(resourceRequest);
					   String potal = currentURL.substring(0, currentURL.substring(1).indexOf("/")+1);
					   System.out.println("[ForwardModellingPortlet.serveResource] " +portalUrl+" "+currentURL+" "+potal);
					   if(portalUrl.startsWith("http://localhost"))	portalUrl += potal;
					   publicPath = portalUrl+publicPath;
					   
					   String successString = " {'success':'true', 'path':'"+publicPath+"'}";
					   resourceResponse.getWriter().write(successString);	
					   System.out.println("[ForwardModellingPortlet.serveResource] File created in the document library, accessible in: "+publicPath);
				   }catch (Exception spe) {
					   System.out.println("[ForwardModellingPortlet.serveResource] ERROR: The file could not be saved in the DL");
					   spe.printStackTrace();
				   } 
			   }
			   else
			   {
				   String failedString = " {'success':'false'}";
				   resourceResponse.getWriter().write(failedString);
				   System.out.println("[ForwardModellingPortlet.serveResource] Failed!! Could not read any content in the file");
			   }
		   }
	   } catch (Exception e) {
		   String failedString = " {'success':'false'}";
		   resourceResponse.getWriter().write(failedString);
		   System.out.println("[ForwardModellingPortlet.serveResource] Exception catched!!");
	   }
	}
   
   private String addFileToDL(File file, String name, long groupId, long userId, boolean station) throws SystemException, PortalException
   {
	   long repositoryId = DLFolderConstants.getDataRepositoryId(groupId, DLFolderConstants.DEFAULT_PARENT_FOLDER_ID);
	   String sourceFileName = file.getName();
	   String mimeType = "text/plain";
	   String description = "File uploaded by the mapgui by user "+userId;
	   String changeLog = "1.0";
	   ServiceContext serviceContext = new ServiceContext();
	   serviceContext.setScopeGroupId(groupId);
	   long folderId = getFolderId(repositoryId, userId, station, serviceContext);
	   System.out.println("[ForwardModellingPortlet.addFileToDL] "+repositoryId+", "+ folderId+", "+ sourceFileName+", "+ mimeType+", "+description+", "+changeLog+", "+serviceContext.toString()+", "+userId);
	   try {
		   DLAppServiceUtil.addFileEntry(repositoryId, folderId, sourceFileName, mimeType, name, description, changeLog, file, serviceContext);
	   } catch (Exception e) {
		   System.out.println("[ForwardModellingPortlet.addFileToDL] Exception catched!!!");
		   e.printStackTrace();
		   return null;
	   }	   
	   return "/documents/" + groupId + "/" + folderId + "/" + HttpUtil.encodeURL(HtmlUtil.unescape(name));
   }
   
   /*
    * get the folderId for the specific user following the directory structure:
    * root/uploaded_files/userId/station_files
    * if it doesn't exist it is created
    */
   private long getFolderId(long repositoryId, long userId, boolean station, ServiceContext serviceContext) throws SystemException, PortalException
   {
	   Folder folder = null;
	   String baseFolderName = "uploaded_files";
	   String baseFolderDesc = "Folder containing all the files uploaded through the mapgui";
	   String userFolderDesc = "UserFiles";
	   String lastFolderName;
	   if(station)		lastFolderName = "station_files";
	   else				lastFolderName = "quake_files";
	   
	   try{
		   folder = DLAppServiceUtil.getFolder(repositoryId, DLFolderConstants.DEFAULT_PARENT_FOLDER_ID, baseFolderName);
	   } catch (PortalException pe) {
		   folder = DLAppServiceUtil.addFolder(repositoryId, DLFolderConstants.DEFAULT_PARENT_FOLDER_ID, baseFolderName, baseFolderDesc, serviceContext);
	   }
	   try{
		   folder = DLAppServiceUtil.getFolder(repositoryId, folder.getFolderId(), userId+"");
	   } catch (PortalException pe) {
		   folder = DLAppServiceUtil.addFolder(repositoryId, folder.getFolderId(), userId+"", userFolderDesc, serviceContext);
	   }
	   try{
		   folder = DLAppServiceUtil.getFolder(repositoryId, folder.getFolderId(), lastFolderName);
	   } catch (PortalException pe) {
		   folder = DLAppServiceUtil.addFolder(repositoryId, folder.getFolderId(), lastFolderName, "", serviceContext);
	   }
	   return folder.getFolderId();
   }
   
	public String getFileAsString(File file) {
	   java.io.FileInputStream fis = null;
	   BufferedInputStream bis = null;
	   DataInputStream dis = null;
	   StringBuffer sb = new StringBuffer();
	   try {
		   fis = new FileInputStream(file);
		   bis = new BufferedInputStream(fis);
		   dis = new DataInputStream(bis);

		   while (dis.available() != 0) {
			   sb.append(dis.readLine() + "\n");
		   }
		   fis.close();
		   bis.close();
		   dis.close();

	   } catch (FileNotFoundException e) {
		   e.printStackTrace();
	   } catch (IOException e) {
		   e.printStackTrace();
	   }
	   return sb.toString();
	}	
}
