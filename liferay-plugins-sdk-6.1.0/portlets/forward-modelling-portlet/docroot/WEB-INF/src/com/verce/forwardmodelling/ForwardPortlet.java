package com.verce.forwardmodelling;

import java.io.PrintWriter;
import java.io.IOException;
import java.io.FileInputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.DataOutputStream;
import java.io.DataInputStream;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.FileNotFoundException;
import java.io.BufferedInputStream;
import java.io.File;
import java.net.*;
import javax.net.ssl.HttpsURLConnection;
import java.util.zip.*;
import java.util.TimeZone;
import java.util.Enumeration;
import java.util.ArrayList;
import java.util.Date;
import java.util.Hashtable;
import java.util.Vector;
import java.util.List;
import java.util.Map;
import java.text.SimpleDateFormat;
import java.text.DateFormat;
import java.text.Format;

import javax.portlet.ActionRequest;
import javax.portlet.ActionResponse;
import javax.portlet.PortletException;
import javax.portlet.ResourceRequest;
import javax.portlet.ResourceResponse;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.disk.DiskFileItem;

import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.exception.SystemException;
import com.liferay.portal.kernel.repository.model.Folder;
import com.liferay.portal.kernel.repository.model.FileEntry;
import com.liferay.portal.kernel.upload.UploadPortletRequest;
import com.liferay.portal.kernel.util.CharPool;
import com.liferay.portal.kernel.util.HttpUtil;
import com.liferay.portal.kernel.util.HtmlUtil;
import com.liferay.portal.kernel.util.FileUtil;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portal.model.User;
import com.liferay.portal.service.ServiceContext;
import com.liferay.portal.util.PortalUtil;
import com.liferay.portlet.documentlibrary.model.DLFileEntry;
import com.liferay.portlet.documentlibrary.model.DLFolderConstants;
import com.liferay.portlet.documentlibrary.service.DLFileEntryLocalServiceUtil;
import com.liferay.portlet.documentlibrary.service.DLAppServiceUtil;
import com.liferay.util.bridges.mvc.MVCPortlet;
import com.liferay.portal.kernel.servlet.ServletResponseUtil;

import hu.sztaki.lpds.pgportal.services.asm.ASMJob;
import hu.sztaki.lpds.pgportal.services.asm.ASMService;
import hu.sztaki.lpds.pgportal.services.asm.ASMWorkflow;
import hu.sztaki.lpds.pgportal.services.asm.beans.ASMRepositoryItemBean;
import hu.sztaki.lpds.pgportal.services.asm.beans.WorkflowInstanceBean;
import hu.sztaki.lpds.pgportal.services.asm.beans.RunningJobDetailsBean;
import hu.sztaki.lpds.pgportal.services.asm.constants.RepositoryItemTypeConstants;
import hu.sztaki.lpds.pgportal.services.asm.constants.DownloadTypeConstants;
import hu.sztaki.lpds.pgportal.service.base.data.WorkflowData;
import hu.sztaki.lpds.pgportal.service.base.PortalCacheService;
import hu.sztaki.lpds.dcibridge.client.ResourceConfigurationFace;
import hu.sztaki.lpds.information.local.InformationBase;
import hu.sztaki.lpds.pgportal.service.workflow.RealWorkflowUtils;
import hu.sztaki.lpds.wfs.com.WorkflowConfigErrorBean;

import com.verce.forwardmodelling.Constants;


public class ForwardPortlet extends MVCPortlet{
	
	ASMService asm_service = null;
	
	public void getWorkflowList(ActionRequest req, ActionResponse res)
    {
		ArrayList<ASMWorkflow> importedWfs;
		try{
			asm_service = ASMService.getInstance();
			importedWfs = asm_service.getASMWorkflows(req.getRemoteUser());

			String jsWfArray = "{\"list\":[";
			for(ASMWorkflow wf : importedWfs)
			{ 
	      		String wfDate = wf.getWorkflowName().substring(wf.getWorkflowName().lastIndexOf("_")+1, wf.getWorkflowName().lastIndexOf("-"));
	      		String wfDate2 = wf.getWorkflowName().substring(wf.getWorkflowName().lastIndexOf("_")+1);
	      		jsWfArray +=  "{\"name\":\""+wf.getWorkflowName()+"\", \"status\":\""+wf.getStatusbean().getStatus() +"\", \"date\":\""+wfDate+"\", \"date2\":\""+wfDate2+"\"},";
			}
			jsWfArray.substring(0, jsWfArray.length()-1);
			jsWfArray +="]}";

			HttpServletResponse response = PortalUtil.getHttpServletResponse(res);
			PrintWriter out = response.getWriter();
			out.print(jsWfArray);
			out.flush();
			out.close();
			//System.out.println("[ForwardModellingPortlet.getWorkflowList] "+jsWfArray);
		}
		catch(Exception e)
		{
			System.out.println("[ForwardModellingPortlet.getWorkflowList] Could not update the workflow list");
		}
    }
	
	private void deleteWorkflow(ResourceRequest resourceRequest, ResourceResponse resourceResponse)
    {
		try{
			asm_service = ASMService.getInstance();
			String userId = resourceRequest.getRemoteUser();
			String wfId = ParamUtil.getString(resourceRequest, "workflowId");
			asm_service.DeleteWorkflow(userId, wfId);
			//asm_service.abort(userId, wfId);	//TODO: fixme!
			System.out.println("[ForwardModellingPortlet.delete] workflow "+wfId+" has been deleted by user "+userId);
		}
		catch(Exception e)
		{
			catchError(e, resourceResponse, "500", "[ForwardModellingPortlet.delete] Exception catched!!");
		}
    }
   
   private void submit(ResourceRequest resourceRequest, ResourceResponse resourceResponse) throws PortletException, IOException 
   {
	   try {
		   asm_service = ASMService.getInstance();
		   User u = PortalUtil.getUser(resourceRequest);
		   String userId = u.getUserId()+"";
		   String solverType = ParamUtil.getString(resourceRequest, "solver");
		   String jsonContent = ParamUtil.getString(resourceRequest, "jsonObject");
		   String workflowId = ParamUtil.getString(resourceRequest, "workflowId");
		   String workflowName = ParamUtil.getString(resourceRequest, "workflowName");
		   String ownerId = ParamUtil.getString(resourceRequest, "ownerId");
		   String stationUrl = ParamUtil.getString(resourceRequest, "stationUrl");
		   String eventUrl = ParamUtil.getString(resourceRequest, "eventUrl");
		   String verceRunId = ParamUtil.getString(resourceRequest, "runId");
		   String stFileType = ParamUtil.getString(resourceRequest, "stationType");
		   String jobName = "Job0";
		   String submitMessage = ParamUtil.getString(resourceRequest, "submitMessage");
		   String submitName = ParamUtil.getString(resourceRequest, "submitName");
		   int nProc = ParamUtil.getInteger(resourceRequest, "nProc");
		   boolean eventDLFile = eventUrl.contains("documents");
		   boolean stationDLFile = stationUrl.contains("documents");
		   File stationFile = null;
		   File eventFile = null;
		   String stPublicPath;
		   String evPublicPath;
		   long groupId = PortalUtil.getScopeGroupId(resourceRequest);
		   long repositoryId = DLFolderConstants.getDataRepositoryId(groupId, DLFolderConstants.DEFAULT_PARENT_FOLDER_ID);
		   ServiceContext serviceContext = new ServiceContext();
		   serviceContext.setScopeGroupId(groupId);
		   String userSN = u.getScreenName();
		   Format formatter = new SimpleDateFormat("yyyyMMddHHmm");
		   String portalUrl = PortalUtil.getPortalURL(resourceRequest);
		   String currentURL = PortalUtil.getCurrentURL(resourceRequest);
		   String portal = currentURL.substring(0, currentURL.substring(1).indexOf("/")+1);
		   portalUrl += portal;
		   
		   //0. Import the workflow
		   String importedWfId = importWorkflow(userId, ownerId, workflowId, submitName);
		   
		   //1. Create the solver file and store it
		   File solverFile = FileUtil.createTempFile();
		   FileUtil.write(solverFile, jsonContent);
		   String fileName = solverType+"_"+formatter.format(new Date()).toString()+".json";
		   String publicPath = addFileToDL(solverFile, fileName, groupId, userSN, Constants.SOLVER_TYPE);
		   publicPath = portalUrl + publicPath;
		   System.out.println("[ForwardModellingPortlet.submitSolver] File created in the document library, accessible in: "+publicPath);

		   if(!stationDLFile)	//2a. create StationFile and store it
		   {
			   stationFile = FileUtil.createTempFile();
			   URL wsUrl = new URL(PortalUtil.getPortalURL(resourceRequest)+stationUrl);
			   FileUtil.write(stationFile, wsUrl.openStream());
			   String stFileName = "stations_"+formatter.format(new Date()).toString();
			   stPublicPath = addFileToDL(stationFile, stFileName, groupId, userSN, Constants.WS_TYPE);
			   stPublicPath = portalUrl + stPublicPath;
			   System.out.println("[ForwardModellingPortlet.submitSolver] File created in the document library, accessible in: "+stPublicPath);
			   stFileType = Constants.STXML_TYPE;
		   }
		   else     //2b. Retrieve StationFile
		   {
			   long folderId = getFolderId(repositoryId, userSN, stFileType, serviceContext);
			   String stFileName = stationUrl.substring(stationUrl.lastIndexOf(CharPool.SLASH)+1);
			   FileEntry fileEntry = DLAppServiceUtil.getFileEntry(groupId, folderId, stFileName);
			   stationFile = DLFileEntryLocalServiceUtil.getFile(fileEntry.getUserId(), fileEntry.getFileEntryId(), fileEntry.getVersion(), false);
			   stPublicPath = stationUrl;
		   }

		   if(!eventDLFile)     //3a. create EventFile and store it
		   {
			   eventFile = FileUtil.createTempFile();
			   URL wsUrl = new URL(PortalUtil.getPortalURL(resourceRequest)+eventUrl);
			   FileUtil.write(eventFile, wsUrl.openStream());
			   String evFileName = "events_"+formatter.format(new Date()).toString();
			   evPublicPath = addFileToDL(eventFile, evFileName, groupId, userSN, Constants.WS_TYPE);
			   evPublicPath = portalUrl + evPublicPath;
			   System.out.println("[ForwardModellingPortlet.submitSolver] File created in the document library, accessible in: "+evPublicPath);
		   }
		   else     //3b. Retrieve EventFile
		   {
			   long folderId = getFolderId(repositoryId, userSN, Constants.EVENT_TYPE, serviceContext);
			   String evFileName = eventUrl.substring(eventUrl.lastIndexOf(CharPool.SLASH)+1);
			   FileEntry fileEntry = DLAppServiceUtil.getFileEntry(groupId, folderId, evFileName);
			   eventFile = DLFileEntryLocalServiceUtil.getFile(fileEntry.getUserId(), fileEntry.getFileEntryId(), fileEntry.getVersion(), false);
			   evPublicPath = eventUrl;
		   }
		   
		   //4. Generate zip file
		   String zipName = userSN+"_"+formatter.format(new Date()).toString()+".zip";
		   createZipFile("temp/"+zipName);
		   File tempZipFile = new File("temp/"+zipName);
		   String zipPublicPath = addFileToDL(tempZipFile, zipName, groupId, userSN, Constants.ZIP_TYPE);
	       zipPublicPath = portalUrl + zipPublicPath;
		   System.out.println("[ForwardModellingPortlet.submitSolver] zipPublicPath: "+zipPublicPath);

		   //5. Upload files
		   asm_service.placeUploadedFile(userId, stationFile, importedWfId,	jobName, "0");
		   asm_service.placeUploadedFile(userId, eventFile, importedWfId, jobName, "1");
		   asm_service.placeUploadedFile(userId, solverFile, importedWfId, jobName, "2");
		   asm_service.placeUploadedFile(userId, tempZipFile, importedWfId, jobName, "3");
		   
		   //6. Check for credential errors
		   WorkflowData wfData = PortalCacheService.getInstance().getUser(userId).getWorkflow(importedWfId);
		   ResourceConfigurationFace rc=(ResourceConfigurationFace)InformationBase.getI().getServiceClient("resourceconfigure", "portal");
		   List resources = rc.get();
		   Vector<WorkflowConfigErrorBean> errorVector = (Vector<WorkflowConfigErrorBean>)RealWorkflowUtils.getInstance().getWorkflowConfigErrorVector(resources,userId, wfData);
		   if(errorVector==null)
		   {
			   System.out.println("[ForwardModellingPortlet.submitSolver] error vector is null");
		   }
		   else if(errorVector.isEmpty())
		   {
			   System.out.println("[ForwardModellingPortlet.submitSolver] error vector is empty");
		   }
		   else
		   {
			   for (WorkflowConfigErrorBean er : errorVector) {
				   System.out.println("[ForwardModellingPortlet.submitSolver] Alert! "+er.getErrorID());
				   if(er.getErrorID().contains("noproxy") || er.getErrorID().contains("proxyexpired"))
				   {
					   catchError(null, resourceResponse, "401", "[ForwardModellingPortlet.submitSolver] Credential Error! Submition stoped");
					   return;
				   }
			   }
		   }
		   
		   //7. Change number of MPI nodes
		   if(solverType.toLowerCase().contains(Constants.SPECFEM_TYPE))
		   {
			   System.out.println("[ForwardModellingPortlet.submitSolver] Set number of processors to "+nProc);
//			   asm_service.setNodeNumber(userId, importedWfId, jobName, nProc);
			   asm_service.setJobAttribute(userId, importedWfId, jobName, "gt5.keycount", String.valueOf(nProc));
		   }
		   
		   //8. Submit
		   asm_service.submit(userId, importedWfId, submitMessage, "Never");
		   tempZipFile.delete();
		   
		   //9. Add run info in the Provenance Repository
		   updateProvenanceRepository(userSN, verceRunId, submitMessage, workflowName, importedWfId, stPublicPath, evPublicPath, publicPath, zipPublicPath, stFileType);
			   
		   System.out.println("[ForwardModellingPortlet.submitSolver] Submition finished: "+userSN+", "+verceRunId+", "+submitMessage+", "+workflowId+", "+importedWfId);
	   }
	   catch (Exception e)
	   {
		   catchError(e, resourceResponse, "500", "[ForwardModellingPortlet.submitSolver] Exception catched!!");
	   }
   }
   
   public void serveResource(ResourceRequest resourceRequest,
	ResourceResponse resourceResponse) throws PortletException, IOException 
	{
	   if(resourceRequest.getResourceID().equals("uploadFile"))
	   {
		   uploadFile(resourceRequest, resourceResponse);
	   }
	   else if(resourceRequest.getResourceID().equals("submit"))
	   {
		   submit(resourceRequest, resourceResponse);
	   }
	   else if (resourceRequest.getResourceID().equals("downloadOutput")) {
		   downloadOutput(resourceRequest, resourceResponse);
	   }
	   else if (resourceRequest.getResourceID().equals("deleteWorkflow")) {
		   deleteWorkflow(resourceRequest, resourceResponse);
	   }
	}
   
   public void downloadOutput(ResourceRequest resourceRequest,
		   ResourceResponse resourceResponse) throws PortletException, IOException
		   {
	   asm_service = ASMService.getInstance();
	   String userId = resourceRequest.getRemoteUser();
	   String wfId = ParamUtil.getString(resourceRequest, "workflowId");
	   
	   resourceResponse.setContentType("application/zip");
	   resourceResponse.setProperty("Content-Disposition", "attachment; filename=\"logs.zip\"");

	   ASMWorkflow wf = asm_service.getASMWorkflow(userId, wfId);

	   InputStream inputStream = null;
	   String[] fileNames = { "stdout.log", "stderr.log" };

	   ZipOutputStream zos = new ZipOutputStream(resourceResponse.getPortletOutputStream());
	   
       int size;
       byte[] buffer = new byte[2048];

	   for (Map.Entry<String, ASMJob> job : wf.getJobs().entrySet()) {
		   for (String fileName : fileNames) {
			   try{
//				   asm_service.getWorkflowOutputs(userId, wfId, resourceResponse);

				   System.out.println("Fetching " + fileName + " from asm");
				   inputStream = asm_service.getSingleOutputFileStream(userId, wfId, job.getKey(), null, fileName);
				   
				   ZipEntry newEntry = new ZipEntry(job.getKey() + "/" + fileName);
				   zos.putNextEntry(newEntry);
                   while ((size = inputStream.read(buffer, 0, buffer.length)) != -1) {
                       zos.write(buffer, 0, size);
                   }
                   zos.closeEntry();
			   }
			   catch(Exception e)
			   {
				   System.out.println("[ForwardModellingPortlet.downloadOutput] Exception caught!!");
				   e.printStackTrace();
				   // TODO send error to client
			   }
			   finally
			   {
				   inputStream.close();
			   }
		   }
	   }
	   zos.close();
   }
 
   private void uploadFile(ResourceRequest resourceRequest, ResourceResponse resourceResponse)
   {
	   resourceResponse.setContentType("text/html");
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
			   File file = FileUtil.createTempFile(inputStream);
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
					   String successString = " {'success':'true', 'path':'"+publicPath+"'}";
					   resourceResponse.getWriter().write(successString);
					   System.out.println("[ForwardModellingPortlet.uploadFile] File created in the document library, accessible in: "+publicPath);
				   }
				   catch (Exception spe) 
				   {	
					   catchError(null, resourceResponse, "500", "[ForwardModellingPortlet.uploadFile] ERROR: The file could not be saved in the DL");
				   } 
			   }
			   else
			   {
				   catchError(null, resourceResponse, "500", "[ForwardModellingPortlet.uploadFile] Failed!! The file is empty");
			   }
		   }
	   }
	   catch (Exception e)
	   {
		   catchError(e, resourceResponse, "500", "[ForwardModellingPortlet.uploadFile] Exception catched!!");
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
   
	private String getFileAsString(File file) throws FileNotFoundException, IOException{
	   FileInputStream fis = null;
	   BufferedInputStream bis = null;
	   DataInputStream dis = null;
	   StringBuffer sb = new StringBuffer();
	   fis = new FileInputStream(file);
	   bis = new BufferedInputStream(fis);
	   dis = new DataInputStream(bis);
	   while (dis.available() != 0) {
		   sb.append(dis.readLine() + "\n");
	   }
	   fis.close();
	   bis.close();
	   dis.close();
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
	
	private void createZipFile(String fileName) throws IOException
	{		 	
		 ZipFile zipFile = new ZipFile("data/verce-hpc-pe.zip");
	     ZipOutputStream append = new ZipOutputStream(new FileOutputStream(fileName));
	     
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
        append.write("This a simple example".getBytes());
        append.closeEntry();

        // close
        zipFile.close();
        append.close();
        System.out.println("[ForwardModellingPortlet.createZipFile] File created in the server file system: "+fileName);
	}
		
	private void updateProvenanceRepository(String userSN, String runId, String submitMessage, String wfName, String asmRunId, 
			String stationUrl, String eventUrl, String solverUrl, String zipUrl, String stationFileType)
    {	
		String runType = "workflow_run";
		try{
			//TODO: put the url in a properties file
			URL url = new URL("http://129.215.213.249:8082/workflow/insert");
			//HttpsURLConnection con = (HttpsURLConnection) url.openConnection();
			HttpURLConnection con = (HttpURLConnection) url.openConnection();
			con.setRequestMethod("POST");
			con.setRequestProperty("Content-type", "application/x-www-form-urlencoded");
			con.setRequestProperty("Accept", "application/json");
			TimeZone tz = TimeZone.getTimeZone("UTC");
			DateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mmZ");
			df.setTimeZone(tz);
			String nowAsISO = df.format(new Date());
			if(stationFileType.equals(Constants.STPOINTS_TYPE))	stationFileType = Constants.MIMETYPE_PLAIN;
			if(stationFileType.equals(Constants.STXML_TYPE))	stationFileType = Constants.MIMETYPE_XML;
			
			String params = "{\"username\":\""+userSN+"\", \"_id\":\""+runId+"\", \"type\":\""+runType+"\", \"description\":\""+submitMessage
					+"\", \"name\":\""+wfName+"\", \"system_id\":\""+asmRunId+"\", \"startTime\":\""+nowAsISO+"\", \"input\":[";
			params += "{\"mime-type\":\""+stationFileType+"\", \"name\":\""+Constants.ST_INPUT_NAME+"\", \"url\":\""+stationUrl+"\"},";
			params += "{\"mime-type\":\""+Constants.MIMETYPE_XML+"\", \"name\":\""+Constants.EVENT_INPUT_NAME+"\", \"url\":\""+eventUrl+"\"},";
			params += "{\"mime-type\":\""+Constants.MIMETYPE_JSON+"\", \"name\":\""+Constants.SOLVER_INPUT_NAME+"\", \"url\":\""+solverUrl+"\"},";
			params += "{\"mime-type\":\""+Constants.MIMETYPE_ZIP+"\", \"name\":\""+Constants.ZIP_INPUT_NAME+"\", \"url\":\""+zipUrl+"\"}";
			params += "]}";
			//System.out.println("[updateProvenanceRepository] Params: "+params);
			String urlParameters = "prov="+URLEncoder.encode(params, "ISO-8859-1");
			
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
		catch(Exception e)
		{
			// We log the exception but continue the normal flow
			System.out.println("[ForwardModellingPortlet.updateProvenanceRepository] Exception catched!!");
			e.printStackTrace();
		}
    }
	
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
	
   /*
    * Sends the error through the response. Writes logMessage through the logs
    * if e is not null prints the stackTrace through the logs
    */
   private void catchError(Exception e, ResourceResponse res, String errorCode, String logMessage)
   {
	   res.setProperty(res.HTTP_STATUS_CODE, errorCode); 
	   //PrintWriter out = res.getWriter();
	   //out.println(failedString);
	   //out.close();
	   System.out.println(logMessage);
	   if(e!=null)		e.printStackTrace();
   }
	
}