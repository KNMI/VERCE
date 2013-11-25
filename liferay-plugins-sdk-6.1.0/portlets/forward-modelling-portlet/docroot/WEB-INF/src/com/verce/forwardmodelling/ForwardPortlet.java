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
import com.liferay.portal.kernel.repository.model.FileEntry;
import com.liferay.portal.model.User;
import com.verce.forwardmodelling.Constants;

import java.io.*;
import java.net.*;
import javax.net.ssl.HttpsURLConnection;
import java.util.zip.*;
import java.util.Enumeration;
import java.util.ArrayList;
import java.util.Date;
import java.util.Hashtable;
import java.util.Vector;
import java.text.SimpleDateFormat;
import java.text.Format;

import hu.sztaki.lpds.pgportal.services.asm.ASMService;
import hu.sztaki.lpds.pgportal.services.asm.ASMWorkflow;
import hu.sztaki.lpds.pgportal.services.asm.beans.ASMRepositoryItemBean;
import hu.sztaki.lpds.pgportal.services.asm.constants.RepositoryItemTypeConstants;
import com.liferay.portal.theme.ThemeDisplay;
import com.liferay.portal.service.CompanyServiceUtil;
import com.liferay.portal.kernel.util.UnicodeProperties;
import com.liferay.portal.kernel.util.PropertiesParamUtil;
import com.liferay.portal.kernel.util.ParamUtil;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.disk.DiskFileItem;



public class ForwardPortlet extends MVCPortlet{
	
	ASMService asm_service = null;
	
	public void provant(ActionRequest req, ActionResponse res)
    {	
		asm_service = ASMService.getInstance();
		String userId = req.getRemoteUser();
		try{
			System.out.println("Provant. Workflows usuari "+userId);
			//195213074420841zentest
			ArrayList<ASMWorkflow> ws = asm_service.getASMWorkflows(userId);
			for(ASMWorkflow w : ws)
			{
				String p1 = asm_service.getStatus(userId, w.getWorkflowName());
				System.out.println(w.getWorkflowName());
				System.out.println("- Id:  "+w.getWorkflowID());
				System.out.println("- iId: "+w.getWorkflow_instanceId());
				Hashtable<String, String> ai = w.getAdditionalInfo();
				System.out.println("- info: "+ai.toString());
				System.out.println("- jobs: "+w.getJobs().toString());
				System.out.println("- status: "+p1);
				if(p1.equals("RUNNING"))
				{
					try{
						hu.sztaki.lpds.pgportal.services.asm.beans.WorkflowInstanceBean p2 = asm_service.getDetails(userId, w.getWorkflowName());
						for(hu.sztaki.lpds.pgportal.services.asm.beans.RunningJobDetailsBean j: p2.getJobs())
							System.out.println("- details: "+j.getName()+", "+j.getInstanceNumber());
					}
					catch(Exception e)
					{
						System.out.println("- details error: "+e.getMessage());
						e.printStackTrace();
					}
				}
			}		
			for(ASMWorkflow w : ws)
			{
				System.out.println("-------------- "+w.getWorkflowName());
				try{
					hu.sztaki.lpds.pgportal.services.asm.beans.WorkflowInstanceBean p2 = asm_service.getDetails(userId, w.getWorkflowName());
					for(hu.sztaki.lpds.pgportal.services.asm.beans.RunningJobDetailsBean j: p2.getJobs())
						System.out.println("- details: "+j.getName()+", "+j.getInstanceNumber());
				}
				catch(Exception e)
				{
					System.out.println("- details error: "+e.getMessage());
					e.printStackTrace();
				}
			}
		}
		catch(Exception e)
		{
			System.out.println("[ForwardModellingPortlet.provant] Exception catched!!");
			e.printStackTrace();
		}
    }

   public void submitSolver(ActionRequest req, ActionResponse res)	
   {   
	   try {
		   asm_service = ASMService.getInstance();
		   String userId = req.getRemoteUser();
		   String solverType = ParamUtil.getString(req, "solver");
		   String jsonContent = ParamUtil.getString(req, "jsonObject");
		   String workflowId = ParamUtil.getString(req, "workflowId");
		   String ownerId = ParamUtil.getString(req, "ownerId");
		   String stationUrl = ParamUtil.getString(req, "stationUrl");
		   String eventUrl = ParamUtil.getString(req, "eventUrl");
		   String verceRunId = ParamUtil.getString(req, "runId");
		   String jobName = "Job0";
		   String submitMessage = ParamUtil.getString(req, "submitMessage");
		   String submitName = ParamUtil.getString(req, "submitName");
		   boolean eventDLFile = eventUrl.contains("documents");
		   boolean stationDLFile = stationUrl.contains("documents");
		   File stationFile = null;
		   File eventFile = null;
		   long groupId = PortalUtil.getScopeGroupId(req);
		   long repositoryId = DLFolderConstants.getDataRepositoryId(groupId, DLFolderConstants.DEFAULT_PARENT_FOLDER_ID);
		   ServiceContext serviceContext = new ServiceContext();
		   serviceContext.setScopeGroupId(groupId);
		   User u = PortalUtil.getUser(req);
		   String userSN = u.getScreenName();
		   Format formatter = new SimpleDateFormat("yyyyMMddHHmm");
		   String portalUrl = PortalUtil.getPortalURL(req);
		   String currentURL = PortalUtil.getCurrentURL(req);
		   String portal = currentURL.substring(0, currentURL.substring(1).indexOf("/")+1);
		   portalUrl += portal;
		   
		   //0. Import the workflow
		   String importedWfId = importWorkflow(userId, ownerId, workflowId, submitName);
		   
		   //1. Create the solver file and store it
		   File solverFile = com.liferay.portal.kernel.util.FileUtil.createTempFile();
		   com.liferay.portal.kernel.util.FileUtil.write(solverFile, jsonContent);
		   String fileName = solverType+"_"+formatter.format(new Date()).toString()+".json";
		   String publicPath = addFileToDL(solverFile, fileName, groupId, userSN, Constants.SOLVER_TYPE);
		   System.out.println("[ForwardModellingPortlet.submitSolver] File created in the document library, accessible in: "+portalUrl+publicPath);

		   if(!stationDLFile)	//2a. create StationFile and store it
		   {
			   stationFile = com.liferay.portal.kernel.util.FileUtil.createTempFile();
			   URL wsUrl = new URL(PortalUtil.getPortalURL(req)+stationUrl);
			   com.liferay.portal.kernel.util.FileUtil.write(stationFile, wsUrl.openStream());
			   String stFileName = "stations_"+formatter.format(new Date()).toString();
			   String stPublicPath = addFileToDL(stationFile, stFileName, groupId, userSN, Constants.WS_TYPE);
			   System.out.println("[ForwardModellingPortlet.submitSolver] File created in the document library, accessible in: "+portalUrl+stPublicPath);
		   }
		   else					//2b. Retrieve StationFile
		   {
			   long folderId = getFolderId(repositoryId, userSN, Constants.STPOINTS_TYPE, serviceContext);
			   FileEntry fileEntry = DLAppServiceUtil.getFileEntry(groupId, folderId, "DefaultName");
			   stationFile = DLFileEntryLocalServiceUtil.getFile(fileEntry.getUserId(), fileEntry.getFileEntryId(), fileEntry.getVersion(), false);
		   }
		   
		   if(!eventDLFile)		//3a. create EventFile and store it
		   {
			   eventFile = com.liferay.portal.kernel.util.FileUtil.createTempFile();
			   URL wsUrl = new URL(PortalUtil.getPortalURL(req)+eventUrl);
			   com.liferay.portal.kernel.util.FileUtil.write(eventFile, wsUrl.openStream());
			   String evFileName = "events_"+formatter.format(new Date()).toString();
			   String evPublicPath = addFileToDL(eventFile, evFileName, groupId, userSN, Constants.WS_TYPE);
			   System.out.println("[ForwardModellingPortlet.submitSolver] File created in the document library, accessible in: "+portalUrl+evPublicPath);
		   }
		   else					//3b. Retrieve EventFile
		   {
			   long folderId = getFolderId(repositoryId, userSN, Constants.EVENT_TYPE, serviceContext);
			   FileEntry fileEntry = DLAppServiceUtil.getFileEntry(groupId, folderId, "DefaultName");
			   eventFile = DLFileEntryLocalServiceUtil.getFile(fileEntry.getUserId(), fileEntry.getFileEntryId(), fileEntry.getVersion(), false);
		   }
		   
		   //4. Generate zip file
		   String zipName = userSN+"_"+formatter.format(new Date()).toString()+".zip";
		   File zipFile = getZipFile(zipName);

		   //5. Upload files and submit
		   asm_service.placeUploadedFile(userId, stationFile, importedWfId,	jobName, "0");
		   asm_service.placeUploadedFile(userId, eventFile, importedWfId, jobName, "1");
		   asm_service.placeUploadedFile(userId, solverFile, importedWfId, jobName, "2");
		   asm_service.placeUploadedFile(userId, zipFile, importedWfId, jobName, "3");
		   asm_service.submit(userId, importedWfId, submitMessage, "Never");
		   
		   //6. Add run info in the Provenance Repository
		   //String asmRunId = getASMRunId(userId, workflowId);
		   updateProvenanceRepository(userSN, verceRunId, submitMessage, workflowId, importedWfId);
		   
		   System.out.println("[ForwardModellingPortlet.submitSolver] Submition finished: "+userSN+", "+verceRunId+", "+submitMessage+", "+workflowId+", "+importedWfId);
	   }
	   catch (Exception e)
	   {
		   System.out.println("[ForwardModellingPortlet.submitSolver] Exception catched!!");
		   e.printStackTrace();
	   }
   }    
   
   
   public void serveResource(ResourceRequest resourceRequest,
	ResourceResponse resourceResponse) throws PortletException, IOException 
	{
	   resourceResponse.setContentType("text/html");
	   String failedString = "{'ErrorMsg':'false'}";
	   String successString = "{'success':'true', 'path':''}";
	   try 
	   {
		   UploadPortletRequest uploadrequest = PortalUtil.getUploadPortletRequest(resourceRequest);
		   String name = ParamUtil.getString(uploadrequest, "name");
		   String filetype = ParamUtil.getString(uploadrequest, "filetype");
		   InputStream inputStream = uploadrequest.getFileAsStream("form-file");
		   long groupId =  PortalUtil.getScopeGroupId(resourceRequest);
		   User u = PortalUtil.getUser(resourceRequest);
		   String userSN =  u.getScreenName();
		   
		   //TODO: for station check that fileType matches the extension or the content of the file

		   if(inputStream!=null){
			   File file = com.liferay.portal.kernel.util.FileUtil.createTempFile(inputStream);
			   String uploadString = getFileAsString(file);		//content

			   if (uploadString!=null)
			   {
				   try
				   {
					   String publicPath = addFileToDL(file, name, groupId, userSN, filetype);
					   String portalUrl = PortalUtil.getPortalURL(resourceRequest);
					   String currentURL = PortalUtil.getCurrentURL(resourceRequest);
					   String portal = currentURL.substring(0, currentURL.substring(1).indexOf("/")+1);
					   //System.out.println("[ForwardModellingPortlet.serveResource] " +portalUrl+" "+currentURL+" "+portal);
					   //if(portalUrl.startsWith("http://localhost"))	
						   portalUrl += portal;
					   publicPath = portalUrl+publicPath;
					   successString = " {'success':'true', 'path':'"+publicPath+"'}";
					   resourceResponse.getWriter().write(successString);	
					   System.out.println("[ForwardModellingPortlet.serveResource] File created in the document library, accessible in: "+publicPath);
				   }
				   catch (Exception spe) 
				   {					   
					   resourceResponse.getWriter().write(failedString);
					   System.out.println("[ForwardModellingPortlet.serveResource] ERROR: The file could not be saved in the DL");
					   //spe.printStackTrace();
				   } 
			   }
			   else
			   {
				   resourceResponse.getWriter().write(failedString);
				   System.out.println("[ForwardModellingPortlet.serveResource] Failed!! The file is empty");
			   }
		   }
	   }
	   catch (Exception e)
	   {
		   resourceResponse.getWriter().write(failedString);
		   System.out.println("[ForwardModellingPortlet.serveResource] Exception catched!!");
	   }
	}
   
   private String addFileToDL(File file, String name, long groupId, String userSN, String filetype) throws SystemException, PortalException
   {
	   long repositoryId = DLFolderConstants.getDataRepositoryId(groupId, DLFolderConstants.DEFAULT_PARENT_FOLDER_ID);
	   String sourceFileName = file.getName();
	   String mimeType = "text/plain";
	   String description = Constants.DOC_DESC + userSN;
	   String changeLog = "1.0";
	   ServiceContext serviceContext = new ServiceContext();
	   serviceContext.setScopeGroupId(groupId);
	   long folderId = getFolderId(repositoryId, userSN, filetype, serviceContext);
	   //System.out.println("[ForwardModellingPortlet.addFileToDL] "+repositoryId+", "+ folderId+", "+ sourceFileName+", "+ mimeType+", "+description+", "+changeLog+", "+serviceContext.toString()+", "+userSN);
	   
	   try {
		   FileEntry check = DLAppServiceUtil.getFileEntry(groupId, folderId, name);
		   DLAppServiceUtil.updateFileEntry(check.getFileEntryId(), sourceFileName, mimeType, name,	description, changeLog, false, file, serviceContext);
		   System.out.println("[ForwardModellingPortlet.addFileToDL] WARN The file "+name+" has been overwritten.");
	   } catch (PortalException pe) {
		   try {
			   DLAppServiceUtil.addFileEntry(repositoryId, folderId, sourceFileName, mimeType, name, description, changeLog, file, serviceContext);
			   //System.out.println("[ForwardModellingPortlet.addFileToDL] The file "+name+" has been created.");
		   } catch (Exception e) {
			   System.out.println("[ForwardModellingPortlet.addFileToDL] Exception catched!!!");
			   e.printStackTrace();
			   return null;
		   }
	   } catch (Exception e) {
		   System.out.println("[ForwardModellingPortlet.addFileToDL] Exception catched!!!");
		   e.printStackTrace();
		   return null;
	   }
	   
	   return "/documents/" + groupId + "/" + folderId + "/" + HttpUtil.encodeURL(HtmlUtil.unescape(name));
   }
   
   /*
    * get the folderId for the specific user following the directory structure:
    * root/Forwar Modelling/userSN/station (XML)
    * if it doesn't exist it is created
    */
   private long getFolderId(long repositoryId, String userSN, String filetype, ServiceContext serviceContext) throws SystemException, PortalException
   {
	   Folder folder = null;
	   String lastFolderName = "";	   
	   if(filetype.equals(Constants.EVENT_TYPE))	lastFolderName = Constants.EVENT_FOLDER_NAME;
	   if(filetype.equals(Constants.STXML_TYPE))	lastFolderName = Constants.STXML_FOLDER_NAME;
	   if(filetype.equals(Constants.STPOINTS_TYPE))	lastFolderName = Constants.STPOINTS_FOLDER_NAME;
	   if(filetype.equals(Constants.SOLVER_TYPE))	lastFolderName = Constants.SOLVER_FOLDER_NAME;
	   if(filetype.equals(Constants.WS_TYPE))		lastFolderName = Constants.WS_FOLDER_NAME;
	   if(lastFolderName.equals(""))				lastFolderName = filetype;
	   
	   try{
		   folder = DLAppServiceUtil.getFolder(repositoryId, DLFolderConstants.DEFAULT_PARENT_FOLDER_ID, Constants.BASE_FOLDER_NAME);
	   } catch (PortalException pe) {
		   folder = DLAppServiceUtil.addFolder(repositoryId, DLFolderConstants.DEFAULT_PARENT_FOLDER_ID, Constants.BASE_FOLDER_NAME, Constants.BASE_FOLDER_DESC, serviceContext);
	   }
	   try{
		   folder = DLAppServiceUtil.getFolder(repositoryId, folder.getFolderId(), userSN);
	   } catch (PortalException pe) {
		   folder = DLAppServiceUtil.addFolder(repositoryId, folder.getFolderId(), userSN, Constants.USER_FOLDER_DESC, serviceContext);
	   }
	   try{
		   folder = DLAppServiceUtil.getFolder(repositoryId, folder.getFolderId(), lastFolderName);
	   } catch (PortalException pe) {
		   folder = DLAppServiceUtil.addFolder(repositoryId, folder.getFolderId(), lastFolderName, "", serviceContext);
	   }
	   return folder.getFolderId();
   }
   
	private String getFileAsString(File file) {
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
	
	private static final byte[] BUFFER = new byte[4096 * 1024];
	
	private static void copy(InputStream input, OutputStream output) throws IOException
	{
		int bytesRead;
		while ((bytesRead = input.read(BUFFER))!= -1) {
			output.write(BUFFER, 0, bytesRead);
		}
    }
	
	private File getZipFile(String fileName) throws IOException
	{		 	
		 ZipFile zipFile = new ZipFile("data/verce-hpc-pe.zip");
	     ZipOutputStream append = new ZipOutputStream(new FileOutputStream("data/"+fileName));
	     
	    //	copy contents from existing war
	   //TODO: see why input_file_generator.pyc fails to be copied (too big maybe?)
        Enumeration<? extends ZipEntry> entries = zipFile.entries();
        while (entries.hasMoreElements()) {
            ZipEntry e = entries.nextElement();
            append.putNextEntry(e);
            if (!e.isDirectory()) {
                copy(zipFile.getInputStream(e), append);
            }
            append.closeEntry();
        }
       
        // append new content
        //TODO: get new Files from iraklis WS
        ZipEntry e = new ZipEntry("newContent");
        append.putNextEntry(e);
        append.write("comencarem provant un contingut simple".getBytes());
        append.closeEntry();

        // close
        zipFile.close();
        append.close();
        System.out.println("[ForwardModellingPortlet.getZipFile] File created in the server file system: "+"data/"+fileName);
        
        //access it as a normal file
        return new File("data/"+fileName); 
	}
	
	
	private void updateProvenanceRepository(String userSN, String runId, String submitMessage, String wfName, String asmRunId)
    {	
		String runType = "workflow_run";
		try{
			URL url = new URL("http://escience7.inf.ed.ac.uk:8082/workflow/insert");
			//HttpsURLConnection con = (HttpsURLConnection) url.openConnection();
			HttpURLConnection con = (HttpURLConnection) url.openConnection();
			con.setRequestMethod("POST");
			con.setRequestProperty("Content-type", "application/x-www-form-urlencoded");
			con.setRequestProperty("Accept", "application/json");
			Format formatter = new SimpleDateFormat("yyyyMMddHHmm");
			
			String params = "{\"username\":\""+userSN+"\", \"_id\":\""+runId+"\", \"type\":\""+runType+"\", \"description\":\""+submitMessage+
					"\", \"name\":\""+wfName+"\", \"system_id\":\""+asmRunId+"\"}";
			String urlParameters = "prov="+URLEncoder.encode(params, "ISO-8859-1");
			//System.out.println("[ForwardModellingPortlet.provant] Post parameters: " + urlParameters);

			con.setDoOutput(true);
			DataOutputStream wr = new DataOutputStream(con.getOutputStream());
			wr.writeBytes(urlParameters);
			wr.flush();
			wr.close();

			if(con.getResponseCode()!=200)
				System.out.println("[ForwardModellingPortlet.updateProvenanceRepository] Error: " + con.getResponseCode());
				 
			BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
			String inputLine;
			StringBuffer response = new StringBuffer();
	 
			while ((inputLine = in.readLine()) != null) {
				response.append(inputLine);
			}
			in.close();
			
			System.out.println("[ForwardModellingPortlet.updateProvenanceRepository] Response: "+response.toString());
		}
		catch(IOException e)
		{
			System.out.println("[ForwardModellingPortlet.updateProvenanceRepository] Exception catched!!");
			e.printStackTrace();
		}
    }
	
/*	private String getASMRunId(String userId, String workflowId)
    {
		String runtimeID = "";
		boolean stop = false;
	   while(!stop)
	   {
		   try{
			   runtimeID = (String)PortalCacheService.getInstance().getUser(userId).getWorkflow(workflowId).getAllRuntimeInstance().keys().nextElement();
			   System.out.println("*******************************************************");
			   System.out.println("[ForwardModellingPortlet.submitSolver] RuntimeID: "+runtimeID);
			   String p1 = asm_service.getStatus(userId, workflowId);
			   System.out.println("[ForwardModellingPortlet.submitSolver] Status: "+p1);
			   System.out.println("*******************************************************");
			   stop = true;
		   }
		   catch(Exception e)
		   {
			   System.out.println("*******************************************************");
			   System.out.println("[ForwardModellingPortlet.submitSolver] Exception runtimeID");
			   System.out.println("*******************************************************");
		   }
		   //hu.sztaki.lpds.pgportal.services.asm.beans.WorkflowInstanceBean p2 = asm_service.getDetails(userId, workflowId);
		   //for(hu.sztaki.lpds.pgportal.services.asm.beans.RunningJobDetailsBean j: p2.getJobs())
			//   System.out.println("[ForwardModellingPortlet.submitSolver] getDetails: "+j.getName()+", "+j.getInstanceNumber());

		   try {
			    Thread.sleep(5000);
			} catch(InterruptedException ex) {
			    Thread.currentThread().interrupt();
			   System.out.println("*******************************************************");
			   System.out.println("[ForwardModellingPortlet.submitSolver] Exception sleep");
			   System.out.println("*******************************************************");
			}
	   }
	   return runtimeID;
    }*/
	
	private String importWorkflow(String userId, String ownerId, String repositoryEntryId, String importedWfName) throws Exception
	{	
		try
		{
			//asm_service = ASMService.getInstance();
			String wfName = asm_service.ImportWorkflow(userId, importedWfName, ownerId, RepositoryItemTypeConstants.Application, repositoryEntryId);
			System.out.println("[ForwardModellingPortlet.importWorkflow] Workflow "+repositoryEntryId+"("+ownerId+") with name "+importedWfName+" imported by user "+userId);
			return wfName;
		} 
		catch (Exception e) {
			System.out.println("[ForwardModellingPortlet.importWorkflow] Exception catched! Could not import workflow "+repositoryEntryId+" from "+ownerId+", with name "+importedWfName);
			throw e;
		}
	}   
}