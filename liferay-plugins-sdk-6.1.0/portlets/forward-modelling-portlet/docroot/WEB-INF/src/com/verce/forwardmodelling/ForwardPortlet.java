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
import java.util.HashMap;
import java.util.Date;
import java.util.Hashtable;
import java.util.Vector;
import java.util.List;
import java.util.Map;
import java.util.Properties;
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

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

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
import com.liferay.portal.kernel.servlet.ServletResponseUtil;
import com.liferay.portal.model.User;
import com.liferay.portal.service.ServiceContext;
import com.liferay.portal.util.PortalUtil;
import com.liferay.portlet.documentlibrary.model.DLFileEntry;
import com.liferay.portlet.documentlibrary.model.DLFolderConstants;
import com.liferay.portlet.documentlibrary.service.DLFileEntryLocalServiceUtil;
import com.liferay.portlet.documentlibrary.service.DLAppServiceUtil;
import com.liferay.portlet.documentlibrary.DuplicateFileException;
import com.liferay.util.bridges.mvc.MVCPortlet;

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
import hu.sztaki.lpds.pgportal.services.asm.constants.StatusConstants;

import com.verce.forwardmodelling.Constants;


public class ForwardPortlet extends MVCPortlet{
	
	ASMService asm_service = null;
	
	public void serveResource(ResourceRequest resourceRequest, ResourceResponse resourceResponse) throws PortletException, IOException 
	{
	   System.out.println("###### " + resourceRequest.getResourceID());
	   if(resourceRequest.getResourceID().equals("uploadFile"))
		   uploadFile(resourceRequest, resourceResponse);
	   else if(resourceRequest.getResourceID().equals("submit"))
		   submit(resourceRequest, resourceResponse);
	   else if (resourceRequest.getResourceID().equals("downloadOutput"))
		   downloadOutput(resourceRequest, resourceResponse);
	   else if (resourceRequest.getResourceID().equals("deleteWorkflow"))
		   deleteWorkflow(resourceRequest, resourceResponse);
	   else if (resourceRequest.getResourceID().equals("meshVelocityModelUpload"))
		   meshVelocityModelUpload(resourceRequest, resourceResponse);
	}
	
	public void getWorkflowList(ActionRequest req, ActionResponse res)
    {
		ArrayList<ASMWorkflow> importedWfs;
		try{
			asm_service = ASMService.getInstance();
			importedWfs = asm_service.getASMWorkflows(req.getRemoteUser());

			String jsWfArray = "{\"list\":[";
			for(ASMWorkflow wf : importedWfs)
			{ 
				//wf.getWorkflowName() is formated: (submitedName+RandomID)_YYYY-MM-DD-TTTTTT
				//wfDate is YYYY-MM-DD
				//wfDate2 is YYYY-MM-DD-TTTTTT (used to sort the results)
				//wfName is submitedName+RandomID
	      		String wfDate = wf.getWorkflowName().substring(wf.getWorkflowName().lastIndexOf("_")+1, wf.getWorkflowName().lastIndexOf("-"));
	      		String wfDate2 = wf.getWorkflowName().substring(wf.getWorkflowName().lastIndexOf("_")+1);
	      		String wfName = wf.getWorkflowName().substring(0,wf.getWorkflowName().lastIndexOf("_"));

                String status = wf.getStatusbean().getStatus();

                if (!status.equals("ERROR") && !status.equals("FINISHED")) {
	                WorkflowInstanceBean wfIB = asm_service.getDetails(req.getRemoteUser(), wf.getWorkflowName());
	                if (wfIB == null) {
	                	continue;
	                }

	                HashMap<String,String> statuses = new HashMap();

	                StatusConstants statusConstants = new StatusConstants();
	                for (RunningJobDetailsBean job : wfIB.getJobs()) {
	                 if (job.getInstances().size() <= 0) {
	                 	statuses.put(job.getName(), "UNKNOWN");
	                 	continue;
	                 }
	                 statuses.put(job.getName(), statusConstants.getStatus(job.getInstances().get(0).getStatus()));
	                }
					System.out.println(statuses);

					String computeStatus = statuses.containsKey("COMPUTE") ? statuses.get("COMPUTE") : statuses.containsKey("Job0") ? statuses.get("Job0") : null;
					String stageOutStatus = statuses.containsKey("STAGEOUT") ? statuses.get("STAGEOUT") : statuses.containsKey("Job1") ? statuses.get("Job1") : null;

					if (statuses.containsValue("ERROR")) {
						status = "ERROR";
					} else if (computeStatus == null) {
						status = "INIT";
					} else if ("PENDING".equals(computeStatus)) {
						status = "PENDING";
					} else if ("RUNNING".equals(computeStatus)) {
						status = "RUNNING";
					} else if ("RUNNING".equals(stageOutStatus)) {
						status = "STAGE OUT";
					} else if ("FINISHED".equals(stageOutStatus)) {
						status = "FINISHED";
					} else {
						// Fallback to overall workflow status
						System.out.println("FALLBACK to workflow status");
					}
                }

	      		jsWfArray +=  "{\"name\":\""+wfName+"\", \"desc\":\""+wf.getSubmissionText()+"\", \"status\":\""+status+
	      				"\", \"date\":\""+wfDate+"\", \"date2\":\""+wfDate2+"\", \"workflowId\":\""+wf.getWorkflowName()+"\"},";
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
            e.printStackTrace();
			System.out.println("[ForwardModellingPortlet.getWorkflowList] Could not update the workflow list");
		}
    }
	
	public void updateWorkflowDescription(ActionRequest req, ActionResponse res)
    {
		asm_service = ASMService.getInstance();
		String begName = ParamUtil.getString(req, "workflowId");
		String newText = ParamUtil.getString(req, "newText");
		
		ArrayList<ASMWorkflow> importedWfs;
		importedWfs = asm_service.getASMWorkflows(req.getRemoteUser());
		for(ASMWorkflow wf : importedWfs)
		{ 
			if(wf.getWorkflowName().startsWith(begName))
			{
				wf.setSubmissionText(newText);
				System.out.println("[ForwardModellingPortlet.updateWorkflowDescription] Description in workflow "+begName+" has been updated to "+newText+" by user "+req.getRemoteUser());
				return;
			}
		}
		System.out.println("[ForwardModellingPortlet.updateWorkflowDescription] Error! Workflow "+begName+" could not be found");
    }
	
	private void deleteWorkflow(ResourceRequest resourceRequest, ResourceResponse resourceResponse)
    {
		String userId = resourceRequest.getRemoteUser();
		try{
			asm_service = ASMService.getInstance();
			String wfId = ParamUtil.getString(resourceRequest, "workflowId");
			//String status = asm_service.getStatus(userId, wfId);
			//if(status.equals("RUNNING")||status.equals("INIT")||status.equals("INIT"))
			asm_service.abort(userId, wfId);	//TODO: fixme!
			asm_service.DeleteWorkflow(userId, wfId);
			System.out.println("[ForwardModellingPortlet.delete] workflow "+wfId+" has been deleted by user "+userId);
		}
		catch(Exception e)
		{
			catchError(e, resourceResponse, "500", "[ForwardModellingPortlet.delete] Exception catched!! User :"+userId);
		}
    }
   
   private void submit(ResourceRequest resourceRequest, ResourceResponse resourceResponse) throws PortletException, IOException 
   {
	   try {
		   asm_service = ASMService.getInstance();
		   User u = PortalUtil.getUser(resourceRequest);
		   String userSN = u.getScreenName();
		   String userId = u.getUserId()+"";
		   String solverType = ParamUtil.getString(resourceRequest, "solver");
		   String[] jsonContentArray = resourceRequest.getParameterValues("jsonObject");
		   String workflowId = ParamUtil.getString(resourceRequest, "workflowId");
		   String workflowName = ParamUtil.getString(resourceRequest, "workflowName");
		   String ownerId = ParamUtil.getString(resourceRequest, "ownerId");
		   String stationUrl = ParamUtil.getString(resourceRequest, "stationUrl");
		   String eventUrl = ParamUtil.getString(resourceRequest, "eventUrl");
		   String[] runIds = resourceRequest.getParameterValues("runId");
		   String stFileType = ParamUtil.getString(resourceRequest, "stationType");
		   String jobName = "Job0";
		   String submitMessage = ParamUtil.getString(resourceRequest, "submitMessage");
		   String nProc = ParamUtil.getString(resourceRequest, "nProc");
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
		   Format formatter = new SimpleDateFormat("yyyyMMddHHmm");
		   String portalUrl = PortalUtil.getPortalURL(resourceRequest);
		   String currentURL = PortalUtil.getCurrentURL(resourceRequest);
		   String portal = currentURL.substring(0, currentURL.substring(1).indexOf("/")+1);
		   portalUrl += portal;
		   
		   String portalUrl2 = PortalUtil.getPortalURL(resourceRequest);
		   //System.out.println("[ForwardModellingPortlet.submitSolver] Abans: "+portalUrl2);
		   if(portalUrl2.equals("http://localhost:8081"))	portalUrl2 = "http://localhost:8080";	//TODO: careful
		   //System.out.println("[ForwardModellingPortlet.submitSolver] Despres (sencer): "+portalUrl2+stationUrl);
		   
		   if(!stationDLFile)	//1a. create StationFile and store it
		   {
			   stationFile = FileUtil.createTempFile();
			   URL wsUrl = new URL(portalUrl2+stationUrl);
			   FileUtil.write(stationFile, wsUrl.openStream());
			   String stFileName = "stations_"+runIds[0];
			   stPublicPath = addFileToDL(stationFile, stFileName, groupId, userSN, Constants.WS_TYPE, null);
			   stPublicPath = portalUrl + stPublicPath;
			   System.out.println("[ForwardModellingPortlet.submitSolver] Stations file created in the document library by "+userSN+", accessible in: "+stPublicPath);
			   stFileType = Constants.STXML_TYPE;
		   }
		   else	 				//1b. Retrieve StationFile
		   {
			   String[] urlParts = stationUrl.split("/");
			   long folderId = Long.parseLong(urlParts[urlParts.length - 2]);
			   String stFileName = urlParts[urlParts.length - 1];
			   FileEntry fileEntry = DLAppServiceUtil.getFileEntry(groupId, folderId, stFileName);
			   stationFile = DLFileEntryLocalServiceUtil.getFile(fileEntry.getUserId(), fileEntry.getFileEntryId(), fileEntry.getVersion(), false);
			   stPublicPath = stationUrl;
		   }
		   
		   if(!eventDLFile)	 //2a. create EventFile and store it
		   {
			   eventFile = FileUtil.createTempFile();
			   URL wsUrl = new URL(portalUrl2+eventUrl);
			   FileUtil.write(eventFile, wsUrl.openStream());
			   String evFileName = "events_"+runIds[0];
			   evPublicPath = addFileToDL(eventFile, evFileName, groupId, userSN, Constants.WS_TYPE, null);
			   evPublicPath = portalUrl + evPublicPath;
			   System.out.println("[ForwardModellingPortlet.submitSolver] Events file created in the document library by "+userSN+", accessible in: "+evPublicPath);
		   }
		   else	 			//2b. Retrieve EventFile
		   {
			   String[] urlParts = eventUrl.split("/");
			   long folderId = Long.parseLong(urlParts[urlParts.length - 2]);
			   String evFileName = urlParts[urlParts.length - 1];
			   FileEntry fileEntry = DLAppServiceUtil.getFileEntry(groupId, folderId, evFileName);
			   eventFile = DLFileEntryLocalServiceUtil.getFile(fileEntry.getUserId(), fileEntry.getFileEntryId(), fileEntry.getVersion(), false);
			   evPublicPath = eventUrl;
		   }
		   
		   //3. Generate zip file
		   String zipName = runIds[0]+".zip";
		   createZipFile("temp/"+zipName);
		   File tempZipFile = new File("temp/"+zipName);
		   String zipPublicPath = addFileToDL(tempZipFile, zipName, groupId, userSN, Constants.ZIP_TYPE, null);
	       zipPublicPath = portalUrl + zipPublicPath;
		   System.out.println("[ForwardModellingPortlet.submitSolver] Zip file created in the document library by "+userSN+", accessible in: "+zipPublicPath);

           // //4. Generate Mesh/Model zip file
           // String meshModelZipFileName = runIds[0]+"_meshmodel.zip";
           // createMeshModelZipFile("temp/"+meshModelZipFileName, "data/mesh", "data/model");
           // File meshModelZipFile = new File("temp/"+meshModelZipFileName);

		   for(int i=0;i<jsonContentArray.length;i++)
		   {
			   String jsonContent = jsonContentArray[i];
			   
			   //4. Import the workflow
			   String importedWfId = importWorkflow(userId, ownerId, workflowId, runIds[i]);

			   //5. Create the solver file and store it
			   File solverFile = FileUtil.createTempFile();
			   FileUtil.write(solverFile, jsonContent);
			   String fileName = solverType+"_"+runIds[i]+".json";
			   String publicPath = addFileToDL(solverFile, fileName, groupId, userSN, Constants.SOLVER_TYPE, null);
			   publicPath = portalUrl + publicPath;
			   System.out.println("[ForwardModellingPortlet.submitSolver] Solver file created in the document library by "+userSN+", accessible in: "+publicPath);
	
			   //6. Upload files
			   asm_service.placeUploadedFile(userId, stationFile, importedWfId,	jobName, "0");
			   asm_service.placeUploadedFile(userId, eventFile, importedWfId, jobName, "1");
			   asm_service.placeUploadedFile(userId, solverFile, importedWfId, jobName, "2");
			   asm_service.placeUploadedFile(userId, tempZipFile, importedWfId, jobName, "3");
               // asm_service.placeUploadedFile(userId, meshModelZipFile, importedWfId, jobName, "4");
			   
			   //7. Check for credential errors
			   //TODO: we should check just once
			   WorkflowData wfData = PortalCacheService.getInstance().getUser(userId).getWorkflow(importedWfId);

			   ResourceConfigurationFace rc=(ResourceConfigurationFace)InformationBase.getI().getServiceClient("resourceconfigure", "portal");
			   List resources = rc.get();
			   Vector<WorkflowConfigErrorBean> errorVector = (Vector<WorkflowConfigErrorBean>)RealWorkflowUtils.getInstance().getWorkflowConfigErrorVector(resources, userId, wfData);
			   if(errorVector!=null && !errorVector.isEmpty())
			   {
				   for (WorkflowConfigErrorBean er : errorVector) {
					   System.out.println("[ForwardModellingPortlet.submitSolver] Alert '"+er.getErrorID()+"'! userSN: "+userSN+", runId: "+runIds[i]);
					   if(er.getErrorID().contains("noproxy") || er.getErrorID().contains("proxyexpired"))
					   {
						   catchError(null, resourceResponse, "401", "[ForwardModellingPortlet.submitSolver] Credential Error! Submission stoped");
						   return;
					   }
				   }
			   }
			   
			   //8. Change number of MPI nodes
			   if(solverType.toLowerCase().contains(Constants.SPECFEM_TYPE))
			   {
				   System.out.println("[ForwardModellingPortlet.submitSolver] Set number of processors to "+nProc+", by "+userSN);
				   asm_service.setJobAttribute(userId, importedWfId, jobName, "gt5.keycount", nProc);
			   }
			   
			   //9. Submit
			   asm_service.submit(userId, importedWfId, submitMessage, "Never");
			   
			   //10. Add run info in the Provenance Repository
			   updateProvenanceRepository(userSN, runIds[i], submitMessage, workflowName, workflowId, importedWfId, stPublicPath, evPublicPath, publicPath, zipPublicPath, stFileType);
				   
			   System.out.println("[ForwardModellingPortlet.submitSolver] Submission finished: "+userSN+", "+runIds[i]+", "+submitMessage+", "+workflowId+", "+importedWfId);
		   }
		   tempZipFile.delete();
	   }
	   catch (Exception e)
	   {
		   catchError(e, resourceResponse, "500", "[ForwardModellingPortlet.submitSolver] Exception catched!");
	   }
   }

   public void downloadOutput(ResourceRequest resourceRequest,
		   ResourceResponse resourceResponse)
		   {
	   asm_service = ASMService.getInstance();
	   String userId = resourceRequest.getRemoteUser();
	   String wfId = ParamUtil.getString(resourceRequest, "workflowId");
	   
	   resourceResponse.setContentType("application/zip");
	   resourceResponse.setProperty("Content-Disposition", "attachment; filename=\"logs.zip\"");

	   try{
		   asm_service.getWorkflowOutputs(userId, wfId, resourceResponse);
	   }
	   catch(Exception e)
	   {
		   System.out.println("[ForwardModellingPortlet.downloadOutput] Exception caught!!");
		   e.printStackTrace();
		   // TODO send error to client
	   }
   }

   private void meshVelocityModelUpload(ResourceRequest resourceRequest, ResourceResponse resourceResponse) {
       try {
   		   UploadPortletRequest uploadRequest = PortalUtil.getUploadPortletRequest(resourceRequest);

   		   String meshURL = uploadRequest.getParameter("mesh-link");
   		   if (uploadRequest.getFileName("mesh-file") != null && uploadRequest.getFileName("mesh-file").length() > 0) {

		       meshURL = saveFileUpload(resourceRequest, uploadRequest.getFileAsStream("mesh-file"), uploadRequest.getFileName("mesh-file"), "mesh");
   		   }
	       System.out.println(meshURL);

   		   if (meshURL == null || meshURL.equals("")) {
		       resourceResponse.getWriter().write("{ success: false, errors: { \"mesh-file\": \"No mesh file or URL included or included file too large.\" } }");
		       return;
   		   }

   		   String velocityModelURL = uploadRequest.getParameter("velocity-model-link");
   		   if (uploadRequest.getFileName("velocity-model-file") != null && uploadRequest.getFileName("velocity-model-file").length() > 0) {

	           velocityModelURL = saveFileUpload(resourceRequest, uploadRequest.getFileAsStream("velocity-model-file"), uploadRequest.getFileName("velocity-model-file"), "velocitymodel");
	       }
           System.out.println(velocityModelURL);

   		   if (velocityModelURL == null || velocityModelURL.equals("")) {
		       resourceResponse.getWriter().write("{ success: false, errors: { \"velocity-model-file\": \"No velocity model file or URL included or included file too large.\" } }");
		       return;
   		   }

   		   String minLat = uploadRequest.getParameter("min_lat");
   		   String maxLat = uploadRequest.getParameter("max_lat");
   		   String minLon = uploadRequest.getParameter("min_lon");
   		   String maxLon = uploadRequest.getParameter("max_lon");

		   Properties props = new Properties();
           props.put("mail.smtp.host", "localhost");
           props.put("mail.smtp.port", "25");
 
           Session session = Session.getInstance(props);

           try {
               Message message = new MimeMessage(session);
               message.setFrom(InternetAddress.parse("admin@verce.eu")[0]);
               // message.setReplyTo(InternetAddress.parse(PortalUtil.getUser(resourceRequest).getDisplayEmailAddress()));
               message.setRecipients(Message.RecipientType.TO,
                InternetAddress.parse("spinuso@knmi.nl, emanuele.casarotti@ingv.it, federica.magnoni@ingv.it, " + PortalUtil.getUser(resourceRequest).getDisplayEmailAddress()));
               message.setRecipients(Message.RecipientType.BCC,
                InternetAddress.parse("jonas.matser@knmi.nl"));
               message.setSubject("VERCE: Mesh and velocity model submitted");
               message.setText(
	               "User " + PortalUtil.getUser(resourceRequest).getScreenName() + " has submitted a new mesh and velocity model for review.\n" +
			       "\n" +
			       "The mesh and velocity model are available at the following links.\n" +
			       "Mesh: " + meshURL + "\n" +
			       "Velocity Model: " + velocityModelURL + "\n" +
			       "\n" +
			       "The bounds for the mesh are:\n" +
			       "Minimum latitude: " + minLat + "\n" +
			       "Maximum latitude: " + maxLat + "\n" +
			       "Minimum longitude: " + minLon + "\n" +
			       "Maximum longitude: " + maxLon + "\n" +
			       "\n" +
			       "The user also added the following note:\n" +
			       HtmlUtil.escape(uploadRequest.getParameter("note"))
		       );

               Transport.send(message);
            } catch (MessagingException e) {
               throw new RuntimeException(e);
            }

	       resourceResponse.getWriter().write("{ success: true }");
	   } catch (Exception e) {
	   	   System.out.println(e);
	       catchError(e, resourceResponse, "500", e.getMessage());
	   }
   }

   private void uploadFile(ResourceRequest resourceRequest, ResourceResponse resourceResponse)
   {
	   resourceResponse.setContentType("text/html");
	   try {
		   UploadPortletRequest uploadRequest = PortalUtil.getUploadPortletRequest(resourceRequest);
		   InputStream inputStream = uploadRequest.getFileAsStream("form-file");

		   if(inputStream == null){
		       throw new Exception("[ForwardModellingPortlet.uploadFile] ERROR: FileInput \"form-file\" not found in request.");
		   }

		   String name = ParamUtil.getString(uploadRequest, "name");
		   String filetype = ParamUtil.getString(uploadRequest, "filetype");
	       String publicPath = saveFileUpload(resourceRequest, inputStream, name, filetype);
		   String successString = " {'success':'true', 'path':'"+publicPath+"'}";
		   resourceResponse.getWriter().write(successString);
	   } catch (Exception e) {
	       catchError(e, resourceResponse, "500", e.getMessage());
	   }
   }

   private String saveFileUpload(ResourceRequest resourceRequest, InputStream inputStream, String name, String filetype)
   throws Exception
   {
	   if(PortalUtil.getUser(resourceRequest)==null)
		   throw new Exception("[ForwardModellingPortlet.uploadFile] No user logged in!");
	   
	   String userSN =  PortalUtil.getUser(resourceRequest).getScreenName();
	   long groupId =  PortalUtil.getScopeGroupId(resourceRequest);
	   
	   File file = FileUtil.createTempFile(inputStream);
	   if (file.length() < 1)
	   {
		   throw new Exception("[ForwardModellingPortlet.uploadFile] Failed!! The file is empty. User: "+userSN);
	   }

	   //try
	   //{
		   String publicPath = addFileToDL(file, name, groupId, userSN, filetype, null);
		   String portalUrl = PortalUtil.getPortalURL(resourceRequest);
		   String currentURL = PortalUtil.getCurrentURL(resourceRequest);
		   String portal = currentURL.substring(0, currentURL.substring(1).indexOf("/")+1);
		   portalUrl += portal;
		   publicPath = portalUrl+publicPath;

		   System.out.println("[ForwardModellingPortlet.uploadFile] File created in the document library by user "+userSN+", accessible in: "+publicPath);

		   return publicPath;
	   //}
	   //catch (Exception e) 
	   //{
	   //		System.out.println(e.getStackTrace());
	   //    throw new Exception("[ForwardModellingPortlet.uploadFile] ERROR: The file could not be saved in the DL. User: "+userSN, e);
	   //} 
   }
   
   private String addFileToDL(File file, String name, long groupId, String userSN, String filetype, Integer iteration)
		   	throws SystemException, PortalException, Exception
   {
	   long repositoryId = DLFolderConstants.getDataRepositoryId(groupId, DLFolderConstants.DEFAULT_PARENT_FOLDER_ID);
	   String sourceFileName = file.getName();
	   String mimeType = "text/plain";
	   String description = Constants.DOC_DESC + userSN;
	   String changeLog = "1.0";
	   ServiceContext serviceContext = new ServiceContext();
	   serviceContext.setScopeGroupId(groupId);
	   long folderId = getFolderId(repositoryId, userSN, filetype, serviceContext);
	   String finalName = name;
	   if (iteration!=null)	finalName = name + "_" + iteration;
	   //System.out.println("[ForwardModellingPortlet.addFileToDL] "+repositoryId+", "+ folderId+", "+ sourceFileName+", "+ mimeType+", "+description+", "+changeLog+", "+serviceContext.toString()+", "+userSN);
	   
	   try {
		   DLAppServiceUtil.addFileEntry(repositoryId, folderId, sourceFileName, mimeType, finalName, description, changeLog, file, serviceContext);
		   //System.out.println("[ForwardModellingPortlet.addFileToDL] The file "+finalName+" has been created.");
	   }
	   catch (DuplicateFileException dupException) {
		   System.out.println("[ForwardModellingPortlet.addFileToDL] WARN Duplicated file "+finalName);
		   if (iteration==null)	iteration = 1;
		   if(iteration>49)	throw new Exception("[ForwardModellingPortlet.addFileToDL] ERROR: The same file name cannot be used more than 50 times");
		   iteration++;
		   return addFileToDL(file, name, groupId, userSN, filetype, iteration);
	   }
	   return "/documents/" + groupId + "/" + folderId + "/" + HttpUtil.encodeURL(HtmlUtil.unescape(finalName));
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

    private void createMeshModelZipFile(String fileName, String meshFileName, String modelFileName) throws IOException
    {
         ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(fileName));

         zos.putNextEntry(new ZipEntry("meshfile"));
         copy(new FileInputStream(meshFileName), zos);
         zos.closeEntry();

         zos.putNextEntry(new ZipEntry("modelfile"));
         copy(new FileInputStream(modelFileName), zos);
         zos.closeEntry();

         zos.close();
    }
		
	private void updateProvenanceRepository(String userSN, String runId, String submitMessage, String wfName, String wfId, String asmRunId, 
			String stationUrl, String eventUrl, String solverUrl, String zipUrl, String stationFileType)
    {	
		String runType = "workflow_run";
		try{
			//TODO: put the url in a properties file
			URL url = new URL("http://localhost:8080/j2ep-1.0/prov/workflow/insert");
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
					+"\", \"workflowName\":\""+wfName+"\", \"workflowId\":\""+wfId+"\", \"system_id\":\""+asmRunId+"\", \"startTime\":\""+nowAsISO+"\", \"input\":[";
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
			
			System.out.println("[ForwardModellingPortlet.updateProvenanceRepository] User: "+userSN+", Response: "+response.toString());
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
	   res.setContentType("text/html");
	   System.out.println("[ForwardModellingPortlet.catchError] Preparing response...");
	   try{
		   res.getWriter().write("{success: false, msg:\""+logMessage+"\"}");	//Submit call expects json success parameter
	   }catch(Exception e2)
	   {
		   System.out.println("[ForwardModellingPortlet.catchError] Could not write in response...");
	   }
	   res.setProperty(res.HTTP_STATUS_CODE, errorCode); 						//Ajax call expects status code
	   //res.setProperty("success", "false"); 
	   //res.setProperty("msg", logMessage);
	   //PrintWriter out = res.getWriter();
	   //out.println(failedString);
	   //out.close();
	   System.out.println(logMessage);
	   if(e!=null)		e.printStackTrace();
   }
}