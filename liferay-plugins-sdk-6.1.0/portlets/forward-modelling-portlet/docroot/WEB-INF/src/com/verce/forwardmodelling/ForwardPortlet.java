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
import java.util.concurrent.ConcurrentHashMap;
import java.util.Properties;
import java.util.Collections;
import java.util.Comparator;
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

import javax.xml.bind.DatatypeConverter;

import java.security.PrivateKey;
import java.security.KeyFactory;

import javax.crypto.Cipher;
import javax.crypto.CipherInputStream;

import java.io.ByteArrayOutputStream;
import java.io.ByteArrayInputStream;

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
import hu.sztaki.lpds.pgportal.services.asm.beans.ASMResourceBean;
import hu.sztaki.lpds.pgportal.services.asm.constants.RepositoryItemTypeConstants;
import hu.sztaki.lpds.pgportal.services.asm.constants.DownloadTypeConstants;
import hu.sztaki.lpds.pgportal.service.base.data.WorkflowData;
import hu.sztaki.lpds.pgportal.service.base.PortalCacheService;
import hu.sztaki.lpds.dcibridge.client.ResourceConfigurationFace;
import hu.sztaki.lpds.information.local.InformationBase;
import hu.sztaki.lpds.pgportal.service.workflow.RealWorkflowUtils;
import hu.sztaki.lpds.wfs.com.WorkflowConfigErrorBean;
import hu.sztaki.lpds.pgportal.services.asm.constants.StatusConstants;

import hu.sztaki.lpds.information.com.ServiceType;
import hu.sztaki.lpds.wfs.com.RepositoryWorkflowBean;
import hu.sztaki.lpds.repository.service.veronica.commons.RepositoryFileUtils;
import hu.sztaki.lpds.wfs.inf.PortalWfsClient;
import hu.sztaki.lpds.storage.inf.PortalStorageClient;

import hu.sztaki.lpds.pgportal.services.asm.exceptions.upload.*;

import com.verce.forwardmodelling.Constants;

import org.json.*;

public class ForwardPortlet extends MVCPortlet{
	
	ASMService asm_service = null;
	
	public void serveResource(ResourceRequest resourceRequest, ResourceResponse resourceResponse) throws PortletException, IOException 
	{
	   System.out.println("###### " + resourceRequest.getResourceID());
	   if(resourceRequest.getResourceID().equals("uploadFile"))
		   uploadFile(resourceRequest, resourceResponse);
	   else if(resourceRequest.getResourceID().equals("submit"))
		   submitSimulationWorkflow(resourceRequest, resourceResponse);
       else if(resourceRequest.getResourceID().equals("submitDownloadWorkflow"))
           submitDownloadWorkflow(resourceRequest, resourceResponse);
	   else if (resourceRequest.getResourceID().equals("downloadOutput"))
		   downloadOutput(resourceRequest, resourceResponse);
	   else if (resourceRequest.getResourceID().equals("deleteWorkflow"))
		   deleteWorkflow(resourceRequest, resourceResponse);
	   else if (resourceRequest.getResourceID().equals("meshVelocityModelUpload"))
		   meshVelocityModelUpload(resourceRequest, resourceResponse);
	   else if (resourceRequest.getResourceID().equals("downloadMeshDetails"))
		   downloadMeshDetails(resourceRequest, resourceResponse);
	   else if (resourceRequest.getResourceID().equals("downloadVelocityModelDetails"))
		   downloadVelocityModelDetails(resourceRequest, resourceResponse);
       else if (resourceRequest.getResourceID().equals("getWorkflowList"))
           getWorkflowList(resourceRequest, resourceResponse);
	}

    public JSONObject getProvenanceWorkflows(ResourceRequest req, ResourceResponse res) {
        // int offset = Integer.parseInt(ParamUtil.getString(req, "start"));
        // int limit = Integer.parseInt(ParamUtil.getString(req, "limit"));
        int offset = 0;
        int limit = 1000;

        JSONObject jsonObject = new JSONObject();

        try {
            String username = PortalUtil.getUser(req).getScreenName();

            HttpServletRequest servletRequest = PortalUtil.getHttpServletRequest(req);

            String url = PortalUtil.getPortalURL(servletRequest) + "/j2ep-1.0/prov/workflow/user/"+username+"?start="+offset+"&limit="+limit;
            System.out.println("Fetching provenance workflows from " + url);

            HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();

            InputStream response = connection.getInputStream();

            String jsonString = inputStreamToString(response);

            jsonObject = new JSONObject(jsonString);
        } catch (Exception e) {
            System.out.println("ERROR: Failed to get provenance workflows - " + e.getMessage());
        }

        return jsonObject;
    }
	
	public void getWorkflowList(ResourceRequest req, ResourceResponse res) {
        int offset = Integer.parseInt(ParamUtil.getString(req, "start"));
        int limit = Integer.parseInt(ParamUtil.getString(req, "limit"));

        String filterString = ParamUtil.getString(req, "filter");
        HashMap<String, String> filters = new HashMap<String, String>();

        if (filterString != null && !"".equals(filterString)) {
            JSONArray filterList = new JSONArray(filterString);

            for (int ii = 0; ii < filterList.length(); ii++) {
                JSONObject filter = filterList.getJSONObject(ii);

                filters.put(filter.getString("property"), filter.getString("value"));
            }
        }

        System.out.println("Fetching runs " + offset + " - " + (offset + limit) + " with filters: " + filters);
		try{
			asm_service = ASMService.getInstance();
			ArrayList<ASMWorkflow> importedWfs = asm_service.getASMWorkflows(req.getRemoteUser());

            String type = filters.get("type");
            if (type != null) {
                java.util.Iterator<ASMWorkflow> iter = importedWfs.iterator();
                while (iter.hasNext()) {
                    ASMWorkflow workflow = iter.next();

                    // remove those workflows that begin with a prefix that doesn't match type
                    if (workflow.getWorkflowName().indexOf(type + "_") >= 0) {

                    } else if (
                            workflow.getWorkflowName().indexOf("simulation_") >= 0
                            || workflow.getWorkflowName().indexOf("download_") >= 0
                            || workflow.getWorkflowName().indexOf("processing_") >= 0
                            || workflow.getWorkflowName().indexOf("misfit_") >= 0
                    ) {
                        iter.remove();
                    }
                }
            }

            Collections.sort(importedWfs, new Comparator<ASMWorkflow>() {
                // sort by date from the workflow name in reverse order
                public int compare(ASMWorkflow wf1, ASMWorkflow wf2) {
                    SimpleDateFormat ft = new SimpleDateFormat("yyyy-MM-dd-hhmmss");

                    try {
                        Date wf2date = ft.parse(wf2.getWorkflowName().substring(wf2.getWorkflowName().lastIndexOf("_")+1));
                        Date wf1date = ft.parse(wf1.getWorkflowName().substring(wf1.getWorkflowName().lastIndexOf("_")+1));
                        return wf2date.compareTo(wf1date);
                    } catch (Exception e) {
                        System.out.println(e);
                        return 0;
                    }
                }
            });

            JSONObject provWorkflows = getProvenanceWorkflows(req, res);
            JSONArray list = provWorkflows.optJSONArray("runIds");

            JSONObject result = new JSONObject();
            JSONArray array = new JSONArray();
            result.put("list", array);
            result.put("totalCount", importedWfs.size());

			for(int ii = offset; ii < Math.min(offset + limit, importedWfs.size()); ii++) {
                ASMWorkflow wf = importedWfs.get(ii);

                if (wf == null) {
                    System.out.println("**** Workflow null");
                    break;
                }

				//wf.getWorkflowName() is formated: (submitedName+RandomID)_YYYY-MM-DD-TTTTTT
				//wfDate is YYYY-MM-DD
				//wfDate2 is YYYY-MM-DD-TTTTTT (used to sort the results)
				//wfName is submitedName+RandomID
	      		String wfDate = wf.getWorkflowName().substring(wf.getWorkflowName().lastIndexOf("_")+1, wf.getWorkflowName().lastIndexOf("-"));
	      		String wfDate2 = wf.getWorkflowName().substring(wf.getWorkflowName().lastIndexOf("_")+1);
	      		String wfName = wf.getWorkflowName().substring(0,wf.getWorkflowName().lastIndexOf("_"));

                String status = wf.getStatusbean().getStatus();

                // only fetch status for runs that are not already stopped
                if (!status.equals("ERROR") && !status.equals("FINISHED") && !status.equals("WORKFLOW_SUSPENDING")) {
	                WorkflowInstanceBean wfIB = asm_service.getDetails(req.getRemoteUser(), wf.getWorkflowName());

                    HashMap<String,String> statuses = new HashMap();

	                if (wfIB != null) {
    	                StatusConstants statusConstants = new StatusConstants();
    	                for (RunningJobDetailsBean job : wfIB.getJobs()) {
    	                 if (job.getInstances().size() <= 0) {
    	                 	statuses.put(job.getName(), "UNKNOWN");
    	                 	continue;
    	                 }
    	                 statuses.put(job.getName(), statusConstants.getStatus(job.getInstances().get(0).getStatus()));
    	                }
    					System.out.println(statuses);
                    }

					String computeStatus = statuses.containsKey("COMPUTE") ? statuses.get("COMPUTE") : statuses.containsKey("Job0") ? statuses.get("Job0") : null;
					String stageOutStatus = statuses.containsKey("STAGEOUT") ? statuses.get("STAGEOUT") : statuses.containsKey("Job1") ? statuses.get("Job1") : null;

					if (statuses.containsValue("ERROR")) {
						status = "ERROR";
					} else if (computeStatus == null || "UNKNOWN".equals(computeStatus)) {
						status = "INIT";
					} else if ("PENDING".equals(computeStatus) || "INIT".equals(computeStatus)) {
						status = "PENDING";
					} else if ("RUNNING".equals(stageOutStatus)) {
						status = "STAGE OUT";
					} else if ("FINISHED".equals(stageOutStatus)) {
						status = "FINISHED";
					} else if ("RUNNING".equals(computeStatus)) {
						status = "RUNNING";
					} else {
						// Fallback to overall workflow status
						System.out.println("FALLBACK to workflow status");
					}
                }

                JSONObject object = new JSONObject();
                object
                .put("name", wfName)
                .put("desc", wf.getSubmissionText())
                .put("status", status)
                .put("date", wfDate)
                .put("date2", wfDate2)
                .put("workflowId", wf.getWorkflowName());

                for (int jj = 0; jj < list.length(); ++jj) {
                    JSONObject provWorkflow = list.getJSONObject(jj);

                    if (!provWorkflow.getString("_id").equals(wfName)) {
                        continue;
                    }

                    object
                    .put("workflowName", provWorkflow.optString("workflowName"))
                    .put("grid", provWorkflow.optString("grid"))
                    .put("resourceType", provWorkflow.optString("resourceType"))
                    .put("resource", provWorkflow.optString("resource"))
                    .put("queue", provWorkflow.optString("queue"));
                }

                array.put(object);
			}

			HttpServletResponse response = PortalUtil.getHttpServletResponse(res);
			PrintWriter out = response.getWriter();
			out.print(result.toString());
			out.flush();
			out.close();
		}
		catch(Exception e)
		{
			System.out.println("[ForwardModellingPortlet.getWorkflowList] Could not update the workflow list");
            e.printStackTrace();
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
			String encryptedIrodsSession = ParamUtil.getString(resourceRequest, "encryptedIrodsSession");
			String irodsSession = decryptIrodsSession(encryptedIrodsSession);

			asm_service.abort(userId, wfId);	//TODO: fixme!
			asm_service.DeleteWorkflow(userId, wfId);
			System.out.println("[ForwardModellingPortlet.delete] workflow "+wfId+" has been deleted by user "+userId);

            deleteFromIrods(irodsSession);
		}
		catch(Exception e)
		{
			catchError(e, resourceResponse, "500", "[ForwardModellingPortlet.delete] Exception catched!! User :"+userId);
		}
    }

    private void deleteFromIrods(String irodsSession) {
        String url = "https://dir-irods.epcc.ed.ac.uk/irodsweb/services/delete.php";
        String charset = "UTF-8";  // Or in Java 7 and later, use the constant: java.nio.charset.StandardCharsets.UTF_8.name()
        String ruri = "jonas.UEDINZone@dir-irods.epcc.ed.ac.uk:1247/UEDINZone/home/jonas";
        String files = "Newfile.txt";
        // String dirs[] = "";

        try {
            String query = String.format("ruri=%s&files[]=%s", // or &dirs[]=%s
                 URLEncoder.encode(ruri, charset), 
                 URLEncoder.encode(files, charset));

            URLConnection connection = new URL(url).openConnection();
            connection.setDoOutput(true); // Triggers POST.
            connection.setRequestProperty("Accept-Charset", charset);
            connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded;charset=" + charset);
            connection.setRequestProperty("Cookie", "PHPSESSID="+irodsSession);

            OutputStream output = connection.getOutputStream();
            output.write(query.getBytes(charset));

            InputStream response = connection.getInputStream();
            System.out.println(inputStreamToString(response));
        } catch(Exception e) {
            System.out.println(e);
        }
    }

    private String decryptIrodsSession(String encryptedIrodsSession) {
        byte[] irodsSession = null;
        try {
            byte[] keyBytes = DatatypeConverter.parseBase64Binary("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\nb4O58E4g/r0nGSYFpU1lqdDFUBSSqg==");

            // decrypt the text using the private key
            PrivateKey privateKey =
                KeyFactory.getInstance("RSA").generatePrivate(new java.security.spec.PKCS8EncodedKeySpec(keyBytes));

            final Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");

            cipher.init(Cipher.DECRYPT_MODE, privateKey);

            byte[] input = DatatypeConverter.parseBase64Binary(encryptedIrodsSession);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

		    ByteArrayInputStream inStream = new ByteArrayInputStream(input);
		    CipherInputStream cipherInputStream = new CipherInputStream(inStream, cipher);
		    byte[] buf = new byte[1024];
		    int bytesRead;
		    while ((bytesRead = cipherInputStream.read(buf)) >= 0) {
		        outputStream.write(buf, 0, bytesRead);
		    }

            irodsSession = outputStream.toByteArray();
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return new String(irodsSession);
    }

    private void submitDownloadWorkflow(ResourceRequest resourceRequest, ResourceResponse resourceResponse) {
        try {
            User u = PortalUtil.getUser(resourceRequest);
            String userSN = u.getScreenName();
            String userId = u.getUserId()+"";
            
            String workflowId = ParamUtil.getString(resourceRequest, "workflowId");
            String ownerId = ParamUtil.getString(resourceRequest, "ownerId");

            System.out.println(workflowId + " / " + ownerId);

            JSONObject config = new JSONObject(resourceRequest.getParameterValues("config")[0]);

            config.put("user_name", userSN);
            config.put("user_id", userId);

            System.out.println(config);

            String runId = config.getString("runId");
            String submitMessage = "Download workflow for " + config.getString("simulationRunId");

            String importedWfId = importWorkflow(userId, ownerId, workflowId, runId);

            File solverFile = FileUtil.createTempFile();
            FileUtil.write(solverFile, config.toString());

            // TODO check port numbers
            asm_service.placeUploadedFile(userId, solverFile, importedWfId, "Job0", "2");
            // stagein => Sync for final workflow
            asm_service.placeUploadedFile(userId, solverFile, importedWfId, "sync", "0");

            Vector<WorkflowConfigErrorBean> errorVector = checkCredentialErrors(userId, importedWfId);
            if(errorVector!=null && !errorVector.isEmpty())
            {
                for (WorkflowConfigErrorBean err : errorVector) {
                    System.out.println("[ForwardModellingPortlet.submitSolver] Alert '"+err.getErrorID()+"'! JobName: " + err.getJobName() + " userSN: "+userSN+", runId: "+runId);
                    if(err.getErrorID().contains("noproxy") || err.getErrorID().contains("proxyexpired"))
                    {
                        catchError(null, resourceResponse, "401", "[ForwardModellingPortlet.submitSolver] Credential Error! Submission stoped");
                        return;
                    }
                }
            }

            asm_service.submit(userId, importedWfId, submitMessage, "Never");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private Vector<WorkflowConfigErrorBean> checkCredentialErrors(String userId, String importedWfId) throws Exception {
        WorkflowData wfData = PortalCacheService.getInstance().getUser(userId).getWorkflow(importedWfId);

        ResourceConfigurationFace rc=(ResourceConfigurationFace)InformationBase.getI().getServiceClient("resourceconfigure", "portal");
        List resources = rc.get();
        Vector<WorkflowConfigErrorBean> errorVector = (Vector<WorkflowConfigErrorBean>)RealWorkflowUtils.getInstance().getWorkflowConfigErrorVector(resources, userId, wfData);
        if(errorVector!=null && !errorVector.isEmpty()) {
            return errorVector;
        }

        return null;
    }
   
   private void submitSimulationWorkflow(ResourceRequest resourceRequest, ResourceResponse resourceResponse) throws PortletException, IOException 
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

		   if(portalUrl2.equals("http://localhost:8081")) {
                portalUrl2 = "http://localhost:8080";	//TODO: careful
            }

		   // System.out.println("Try to fetch workflow zip from repository for workflow with ID: " + workflowId);
		   String job0bin = "";
		   Date job0binModified = new Date(0L);

     //       Hashtable hsh = new Hashtable();
		   // ServiceType st = InformationBase.getI().getService("wfs", "portal", hsh, new Vector());
     //       PortalWfsClient wfsClient = (PortalWfsClient) Class.forName(st.getClientObject()).newInstance();
     //       wfsClient.setServiceURL(st.getServiceUrl());
     //       wfsClient.setServiceID(st.getServiceID());

     //       RepositoryWorkflowBean bean = new RepositoryWorkflowBean();
     //       bean.setId(Long.parseLong(workflowId));
     //       bean.setWorkflowType(RepositoryItemTypeConstants.Application);

     //       Vector wfList = wfsClient.getRepositoryItems(bean);
     //       if (wfList == null) {
     //           throw new Exception("Not valid wf list !");
     //       }

     //       for (Object wfBeanObject : wfList) {
     //          RepositoryWorkflowBean wfBean = (RepositoryWorkflowBean) wfBeanObject;

     //          String relativePath = wfBean.getZipRepositoryPath();
     //          String fullPath = new String(RepositoryFileUtils.getInstance().getRepositoryDir() + relativePath);
     //          ZipFile zipFile = new ZipFile(fullPath);

     //          Enumeration<? extends ZipEntry> entries = zipFile.entries();
     //          while (entries.hasMoreElements()) {
     //             ZipEntry entry = (ZipEntry) entries.nextElement();
     //             System.out.println(entry.getName());
     //             if (entry.getName().indexOf("Job0/execute.bin") >= 0) {
     //         		job0bin = inputStreamToString(zipFile.getInputStream(entry));
     //         		job0binModified = new Date(entry.getTime());
     //         		// System.out.println(job0bin);
     //             	break;
     //             }
     //          }
	    //       zipFile.close();
     //       }

		   if(!stationDLFile)	//1a. create StationFile and store it
		   {
			   stationFile = FileUtil.createTempFile();
			   URL wsUrl = new URL(portalUrl2+stationUrl);
			   FileUtil.write(stationFile, wsUrl.openStream());
			   String stFileName = "stations_"+runIds[0];
			   stPublicPath = addFileToDL(stationFile, stFileName, groupId, userSN, Constants.WS_TYPE);
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
			   evPublicPath = addFileToDL(eventFile, evFileName, groupId, userSN, Constants.WS_TYPE);
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
		   String zipPublicPath = addFileToDL(tempZipFile, zipName, groupId, userSN, Constants.ZIP_TYPE);
	       zipPublicPath = portalUrl + zipPublicPath;
		   System.out.println("[ForwardModellingPortlet.submitSolver] Zip file created in the document library by "+userSN+", accessible in: "+zipPublicPath);

		   for(int i=0;i<jsonContentArray.length;i++)
		   {
			   String jsonContent = jsonContentArray[i];
			   
			   //4. Import the workflow
			   String importedWfId = importWorkflow(userId, ownerId, workflowId, runIds[i]);

			   //5. Create the solver file and store it
			   File solverFile = FileUtil.createTempFile();
			   FileUtil.write(solverFile, jsonContent);
			   String fileName = solverType+"_"+runIds[i]+".json";
			   String publicPath = addFileToDL(solverFile, fileName, groupId, userSN, Constants.SOLVER_TYPE);
			   publicPath = portalUrl + publicPath;
			   System.out.println("[ForwardModellingPortlet.submitSolver] Solver file created in the document library by "+userSN+", accessible in: "+publicPath);
	
			   //6. Upload files
			   asm_service.placeUploadedFile(userId, stationFile, importedWfId,	jobName, "0");
			   asm_service.placeUploadedFile(userId, eventFile, importedWfId, jobName, "1");
			   asm_service.placeUploadedFile(userId, solverFile, importedWfId, jobName, "2");
			   asm_service.placeUploadedFile(userId, tempZipFile, importedWfId, jobName, "3");

               try {
                   asm_service.placeUploadedFile(userId, solverFile, importedWfId, "sync", "0");
               } catch (Upload_GeneralException exception) {
                   System.out.println("*** Port 0 on job Sync doesn't exist.");
               }
			   
			   //8. Change number of MPI nodes
			   if(solverType.toLowerCase().contains(Constants.SPECFEM_TYPE))
			   {
				   System.out.println("[ForwardModellingPortlet.submitSolver] Set number of processors to "+nProc+", by "+userSN);
				   asm_service.setJobAttribute(userId, importedWfId, jobName, "gt5.keycount", nProc);
			   }

               //TODO: we should check just once
               Vector<WorkflowConfigErrorBean> errorVector = checkCredentialErrors(userId, importedWfId);
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

               asm_service.submit(userId, importedWfId, submitMessage, "Never");

               // Log resource information
               ASMResourceBean resourceBean = asm_service.getResource(userId, importedWfId, jobName);
               System.out.println("RESOURCE type: " + resourceBean.getType() + ", grid: " + resourceBean.getGrid() + ", resource: " + resourceBean.getResource() + ", queue: " + resourceBean.getQueue());

			   
			   //10. Add run info in the Provenance Repository
			   updateProvenanceRepository(userSN, runIds[i], submitMessage, workflowName, workflowId, importedWfId, stPublicPath, evPublicPath, publicPath, zipPublicPath, stFileType, job0bin, job0binModified, resourceBean.getType(), resourceBean.getGrid(), resourceBean.getResource(), resourceBean.getQueue());
				   
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

	   String publicPath = addFileToDL(file, name, groupId, userSN, filetype);
	   String portalUrl = PortalUtil.getPortalURL(resourceRequest);
	   String currentURL = PortalUtil.getCurrentURL(resourceRequest);
	   String portal = currentURL.substring(0, currentURL.substring(1).indexOf("/")+1);
	   portalUrl += portal;
	   publicPath = portalUrl+publicPath;

	   System.out.println("[ForwardModellingPortlet.uploadFile] File created in the document library by user "+userSN+", accessible in: "+publicPath);

	   return publicPath;
   }

   private String inputStreamToString(InputStream inputStream) throws IOException {
		InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
		StringBuilder stringBuilder = new StringBuilder();
		char[] buffer = new char[1024];
		int charsRead = 0;
		while ((charsRead = inputStreamReader.read(buffer)) > 0) {
			stringBuilder.append(buffer, 0, charsRead);
		};
        inputStream.close();
		return stringBuilder.toString();
   }

   	private void downloadMeshDetails(ResourceRequest resourceRequest, ResourceResponse resourceResponse) {
   		try {
	   		String solverName = ParamUtil.getString(resourceRequest, "solver");
	   		String meshName = ParamUtil.getString(resourceRequest, "meshName");

			URL url = new URL("http://localhost:8080/j2ep-1.0/prov/solver/" + solverName);
			HttpURLConnection con = (HttpURLConnection) url.openConnection();
			con.setRequestMethod("GET");

			if(con.getResponseCode()!=200) {
				System.out.println("[ForwardModellingPortlet.downloadMeshDetails] Error: " + con.getResponseCode());
				return;
			}
			
			String input = inputStreamToString(con.getInputStream());

			JSONObject jsonObject = new JSONObject(input);
			JSONArray meshes = jsonObject.getJSONArray("meshes");
			JSONObject mesh = null;
			for (int ii = 0; ii < meshes.length(); ii++) {
				mesh = meshes.getJSONObject(ii);
				if (mesh.getString("name").equals(meshName)) {
					break;
				}
			}
			if (mesh == null) {
				System.out.println("[ForwardModellingPortlet.downloadMeshDetails] Error: Mesh " + meshName + " not found for solver " + solverName);
				return;
			}
			String details = mesh.getString("details");

			resourceResponse.setContentType("application/text");
		    resourceResponse.setProperty("Content-Disposition", "attachment; filename=\"mesh-details.txt\"");
			resourceResponse.getWriter().write(details);
		} catch (Exception e) {
			System.out.println("[ForwardModellingPortlet.downloadMeshDetails] Error: " + e.getStackTrace());
		}
   	}

	private void downloadVelocityModelDetails(ResourceRequest resourceRequest, ResourceResponse resourceResponse) {
		try {
	   		String solverName = ParamUtil.getString(resourceRequest, "solver");
	   		String meshName = ParamUtil.getString(resourceRequest, "meshName");
	   		String velocityModelName = ParamUtil.getString(resourceRequest, "velocityModelName");

			URL url = new URL("http://localhost:8080/j2ep-1.0/prov/solver/" + solverName);
			HttpURLConnection con = (HttpURLConnection) url.openConnection();
			con.setRequestMethod("GET");

			if(con.getResponseCode()!=200)
				System.out.println("[ForwardModellingPortlet.downloadVelocityModelDetails] Error: " + con.getResponseCode());
			
			InputStreamReader inputStreamReader = new InputStreamReader(con.getInputStream());
			StringBuilder stringBuilder = new StringBuilder();
			char[] buffer = new char[1024];
			int charsRead = 0;
			while ((charsRead = inputStreamReader.read(buffer)) > 0) {
				stringBuilder.append(buffer, 0, charsRead);
			};

			JSONObject jsonObject = new JSONObject(stringBuilder.toString());
			JSONArray meshes = jsonObject.getJSONArray("meshes");
			JSONObject mesh = null;
			for (int ii = 0; ii < meshes.length(); ii++) {
				mesh = meshes.getJSONObject(ii);
				if (mesh.getString("name").equals(meshName)) {
					break;
				}
			}
			if (mesh == null) {
				System.out.println("[ForwardModellingPortlet.downloadVelocityModelDetails] Error: Mesh " + meshName + " not found for solver " + solverName);
				return;
			}
			JSONArray velocityModels = mesh.getJSONArray("velmod");
			JSONObject velocityModel = null;
			for (int ii = 0; ii < velocityModels.length(); ii++) {
				velocityModel = velocityModels.getJSONObject(ii);
				if (velocityModel.getString("name").equals(velocityModelName)) {
					break;
				}
			}
			if (velocityModel == null) {
				System.out.println("[ForwardModellingPortlet.downloadVelocityModelDetails] Error: Velocity Model " + velocityModelName + " not found for Mesh " + meshName + " and solver " + solverName);
				return;
			}
			String details = velocityModel.getString("details");

			resourceResponse.setContentType("application/text");
		    resourceResponse.setProperty("Content-Disposition", "attachment; filename=\"velocitymodel-details.txt\"");
			resourceResponse.getWriter().write(details);
		} catch (Exception e) {
			System.out.println("[ForwardModellingPortlet.downloadVelocityModelDetails] Error: " + e.getStackTrace());
		}
	}
   
   private String addFileToDL(File file, String name, long groupId, String userSN, String filetype)
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
	   
	   // Search for unused file number
	   // Don't use recursion because of stack limit (although the algorithm shouldn't run that deep)

	   // Two step algorithm
	   // 1. Find the first n (2^m) that is not in use be an existing file
	   // 2. Do a binary search between 2^(m-1) and 2^m for the first non-existing filename

	   // Define lower and upper bounds for searching
   	   int lowerBound = 0;
   	   int upperBound = 0;
   	   
   	   // define midpoint for binary search part
   	   int mid = 0;

   	   // keep track of if we're search upwards or in binary search
   	   boolean up = true;
   	   String filename = name;
   	   do {
		   try {
		      if (up) {
		      	filename = name + (upperBound > 0 ? "_"+upperBound : "");
		      } else {
		         filename = name + (mid > 0 ? "_"+mid : "");
		      }
		      // try if file exists
 	          DLAppServiceUtil.getFileEntry(repositoryId, folderId, filename);
   		   } catch (PortalException e) {
   		      // File doesnt Exist
   		      if (up) {
   		         // lowest n = 2^m found that's not in use
   		         // start binary search
	   		     up = false;
	   		     continue;
   		      } else {
   		         // continue binary search in [lowerbound-mid]
   		         upperBound = mid;
   		         mid = lowerBound + (upperBound - lowerBound) / 2;
                 continue;
   		      }
   		   }

   		   // File exists
   		   if (up) {
   		      // look at next n = 2^m if it's in use
   		      lowerBound = Math.max(upperBound, 1);
   		      upperBound = lowerBound * 2;
   		   } else {
   		      // continue binary search in [mid+1-lowerbound]
              lowerBound = mid + 1;
              mid = lowerBound + (upperBound - lowerBound) / 2;
   		   }

   	   } while (lowerBound != upperBound);

   	   // set final filename
       filename = name + (lowerBound > 0 ? "_"+lowerBound : "");

	   DLAppServiceUtil.addFileEntry(repositoryId, folderId, sourceFileName, mimeType, filename, description, changeLog, file, serviceContext);
	   System.out.println("[ForwardModellingPortlet.addFileToDL] The file "+filename+" has been created.");

	   return "/documents/" + groupId + "/" + folderId + "/" + HttpUtil.encodeURL(HtmlUtil.unescape(filename));
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
			String stationUrl, String eventUrl, String solverUrl, String zipUrl, String stationFileType, String job0bin, Date job0binModified, String resourceType, String grid, String resource, String queue)
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

			JSONObject params = new JSONObject();
			params.put("username", userSN)
				  .put("_id", runId)
				  .put("type", runType)
				  .put("description", submitMessage)
				  .put("workflowName", wfName)
				  .put("workflowId", wfId)
				  .put("system_id", asmRunId)
				  .put("startTime", nowAsISO)
				  .put("job0bin", job0bin)
				  .put("job0binModified", new SimpleDateFormat("yyyy-MM-dd'T'HH:mmZ").format(job0binModified))
                  .put("resourceType", resourceType)
                  .put("grid", grid)
                  .put("resource", resource)
                  .put("queue", queue);

			JSONArray input = new JSONArray();
			input.put(new JSONObject().put("mime-type", stationFileType).put("name",Constants.ST_INPUT_NAME).put("url", stationUrl))
				 .put(new JSONObject().put("mime-type", Constants.MIMETYPE_XML).put("name",Constants.EVENT_INPUT_NAME).put("url", eventUrl))
				 .put(new JSONObject().put("mime-type", Constants.MIMETYPE_JSON).put("name",Constants.SOLVER_INPUT_NAME).put("url", solverUrl))
				 .put(new JSONObject().put("mime-type", Constants.MIMETYPE_ZIP).put("name",Constants.ZIP_INPUT_NAME).put("url", zipUrl));
			params.put("input", input);

			// System.out.println("[updateProvenanceRepository] Params: "+params.toString());
			String urlParameters = "prov="+URLEncoder.encode(params.toString(), "ISO-8859-1");
			
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

	   System.out.println(logMessage);
       
	   if(e!=null)		e.printStackTrace();
   }
}