/* Copyright 2007-2011 MTA SZTAKI LPDS, Budapest

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License. */
/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package hu.sztaki.lpds.pgportal.services.asm;

import dci.data.Middleware;
import hu.sztaki.lpds.dcibridge.client.ResourceConfigurationFace;
import hu.sztaki.lpds.pgportal.services.asm.beans.ASMSQLQueryBean;
import hu.sztaki.lpds.pgportal.services.asm.threads.ASMUploadThread;
import hu.sztaki.lpds.pgportal.services.asm.constants.StatusConstants;
import hu.sztaki.lpds.pgportal.services.asm.constants.StatusColorConstants;
import hu.sztaki.lpds.pgportal.services.asm.constants.DownloadTypeConstants;
import hu.sztaki.lpds.pgportal.services.asm.beans.ASMRepositoryItemBean;
import hu.sztaki.lpds.pgportal.services.asm.beans.WorkflowInstanceStatusBean;
import hu.sztaki.lpds.pgportal.services.asm.beans.WorkflowInstanceBean;
import hu.sztaki.lpds.pgportal.services.asm.beans.RunningJobDetailsBean;

import hu.sztaki.lpds.pgportal.services.asm.beans.JobStatisticsBean;
import hu.sztaki.lpds.pgportal.services.asm.beans.ASMJobInstanceBean;
import hu.sztaki.lpds.information.com.ServiceType;
import hu.sztaki.lpds.information.local.InformationBase;
import hu.sztaki.lpds.information.local.PropertyLoader;
import hu.sztaki.lpds.pgportal.com.WorkflowAbortThread;
import hu.sztaki.lpds.pgportal.com.WorkflowRescueThread;
import hu.sztaki.lpds.pgportal.com.WorkflowSubmitThread;
import hu.sztaki.lpds.pgportal.service.base.PortalCacheService;
import hu.sztaki.lpds.pgportal.service.base.data.WorkflowData;
import hu.sztaki.lpds.pgportal.service.base.data.WorkflowRunTime;
import hu.sztaki.lpds.pgportal.service.workflow.RealWorkflowUtils;
import hu.sztaki.lpds.pgportal.service.workflow.Sorter;
import hu.sztaki.lpds.pgportal.service.workflow.UserQuotaUtils;
import hu.sztaki.lpds.pgportal.service.workflow.WorkflowUpDownloadUtils;
import hu.sztaki.lpds.pgportal.services.asm.beans.ASMResourceBean;
import hu.sztaki.lpds.pgportal.services.asm.exceptions.ASMException;
import hu.sztaki.lpds.pgportal.services.asm.exceptions.download.*;
import hu.sztaki.lpds.pgportal.services.asm.exceptions.general.*;
import hu.sztaki.lpds.pgportal.services.asm.exceptions.importation.*;
import hu.sztaki.lpds.pgportal.services.asm.exceptions.upload.*;
import hu.sztaki.lpds.repository.inf.PortalRepositoryClient;
import hu.sztaki.lpds.storage.inf.PortalStorageClient;
import hu.sztaki.lpds.wfi.com.WorkflowInformationBean;
import hu.sztaki.lpds.wfi.com.WorkflowRuntimeBean;
import hu.sztaki.lpds.wfi.inf.PortalWfiClient;
import hu.sztaki.lpds.wfi.net.webservices.StatusInfoBean;
import hu.sztaki.lpds.wfi.net.webservices.StatusIntervalBean;
import hu.sztaki.lpds.wfs.com.ComDataBean;
import hu.sztaki.lpds.wfs.com.JobPropertyBean;
import hu.sztaki.lpds.wfs.com.PortDataBean;
import hu.sztaki.lpds.wfs.com.RepositoryWorkflowBean;
import hu.sztaki.lpds.wfs.com.WorkflowConfigErrorBean;
import hu.sztaki.lpds.wfs.inf.PortalWfsClient;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.Vector;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;

import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;
import javax.portlet.ResourceResponse;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Manages all instances for all users who has a workflow imported
 *
 * @author akosbalasko
 * @version 3.4
 *
 */
public class ASMService {

    //this key in hashMap workflow is the userID, and it contains all workflows(organized in an other hashmap,
    //where key is the name of the workflow, its value is the workflow object )
    //
    private HashMap<String, HashMap<String, ASMWorkflow>> workflows;
    //public String STORAGE = "";
    //public String WFS = "";
    private long uploadMaxSize = 10485760;
    //public String PORTAL = "";
    public String GEMLCA = "gemlca";
    private final Logger logger = LoggerFactory.getLogger(ASMService.class);
    private static ASMService instance = new ASMService();

    /**
     * Public function to provide Singleton technique
     *
     * @return the stored, or a new object of itself
     */
    public static ASMService getInstance() {

        return instance;
    }

    /**
     * Protected constructor function
     *
     */
    protected ASMService() {
        logger.info("ASM Service has been initialized");
        workflows = new HashMap<String, HashMap<String, ASMWorkflow>>();
    }

    /**
     *
     * Adding a workflow
     *
     * @param userId
     * @param workflow
     */
    private void putWorkflow(String userId, ASMWorkflow workflow) {

        if (workflows.get(userId) == null) {
            workflows.put(userId, new HashMap<String, ASMWorkflow>());
            loadASMWorkflows(userId);
        } else {
            workflows.get(userId).put(workflow.getWorkflowName(), workflow);
        }

    }

    private void removeWorkflow(String userID, String workflowName) {

        workflows.get(userID).remove(workflowName);

    }

    @Deprecated
    public void init() {
    }

    public String getPortalURL() {
        return PropertyLoader.getInstance().getProperty("service.url");
    }

    public String getWFSURL() {
        Hashtable hsh = new Hashtable();
        ServiceType st = InformationBase.getI().getService("wfs", "portal", hsh, new Vector());
        return st.getServiceUrl();

    }

    public String getStorageURL() {
        Hashtable hsh = new Hashtable();
        ServiceType st = InformationBase.getI().getService("storage", "portal", hsh, new Vector());
        return st.getServiceUrl();

    }
    /*
     * Gets the ASM workflow what is identified by workflowname, returns null if workflow does not exists with the specified name
     * @param userId ID of the user
     * @param workflowname name of the ASM workflow
     * @return ASMWorkflow object
     */

    public ASMWorkflow getASMWorkflow(String userId, String workflowname) {
        /*Hashtable hsh = new Hashtable();
         ServiceType st = InformationBase.getI().getService("wfs", "portal", hsh, new Vector());
        
         st = InformationBase.getI().getService("storage", "portal", hsh, new Vector());
         this.getStorageURL() = st.getServiceUrl();
         */

        if (workflows.get(userId) == null) {
            workflows.put(userId, new HashMap<String, ASMWorkflow>());
            loadASMWorkflows(userId);

        }
        /*for (int i=0;i<workflows.get(userId).size();++i){
         if (workflows.get(userId).get(i).getWorkflowName().equals(new String(workflowname)))
         return workflows.get(userId).get(i);
         }
         return null;*/
        return ((HashMap<String, ASMWorkflow>) workflows.get(userId)).get(workflowname);
    }

    private void loadASMWorkflows(String userId) {
        try {
            HashMap<String, ASMWorkflow> storedworkflows = getWorkflows(userId);
            Iterator it = storedworkflows.keySet().iterator();
            workflows.put(userId, storedworkflows);
            while (it.hasNext()) {
                String key = (String) it.next();
                updateASMWorkflowStatus(userId, storedworkflows.get(key).getWorkflowName());
            }

        } catch (ClassNotFoundException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
            throw new ASM_GeneralWebServiceException(ex.getCause(), userId);

        } catch (InstantiationException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
            throw new ASM_GeneralWebServiceException(ex.getCause(), userId);
        } catch (IllegalAccessException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
            throw new ASM_GeneralWebServiceException(ex.getCause(), userId);
        }
    }

    /**
     * Imports a workflow/application/project/graph stored in the local
     * Repository component of gUSE
     *
     * @param userId - Id of the user
     * @param userworkflowname - name of the workflow given by the user
     * @param ownerId - Id of the owner of the workflow that should be imported
     * @param impWfType - Type of the workflow (see ASMRepositoryItemType
     * object)
     * @param importworkflowName - Name of the workflow to be imported
     * @return String - name of the generated workflow
     */
    public String ImportWorkflow(String userId, String userworkflowname, String ownerId, String impWfType, String importworkflowName) {
        try {
            ArrayList<RepositoryWorkflowBean> wfList = getWorkflowsFromRepository2Array(ownerId, impWfType, new Long(importworkflowName));

            RepositoryWorkflowBean selectedBean = (RepositoryWorkflowBean) wfList.get(0);
            if (selectedBean == null) {
                throw new Import_NotValidWorkflowNameException(userId, importworkflowName);

            }

            String storageID = WorkflowUpDownloadUtils.getInstance().getStorageID();
            String wfsID = WorkflowUpDownloadUtils.getInstance().getWfsID();
            String portalUrl = this.getPortalURL();

            selectedBean.setPortalID(portalUrl);
            selectedBean.setStorageID(storageID);
            selectedBean.setWfsID(wfsID);
            selectedBean.setUserID(userId);
            //String generated_id = Long.toString(System.currentTimeMillis());
            String concrete_wf_name = userworkflowname;
            selectedBean.setNewGrafName("g_" + userworkflowname);
            selectedBean.setNewRealName(concrete_wf_name);

            selectedBean.setNewAbstName("t_" + userworkflowname);

            // //System.out.println("selBean zip path : " + selectedBean.getZipRepositoryPath());
            //
            // import item from repository...
            Hashtable hsh = new Hashtable();
            // hsh.put("url", bean.getWfsID());
            ServiceType st = InformationBase.getI().getService("repository", "portal", hsh, new Vector());
            PortalRepositoryClient repoClient = (PortalRepositoryClient) Class.forName(st.getClientObject()).newInstance();
            repoClient.setServiceURL(st.getServiceUrl());
            repoClient.setServiceID(st.getServiceID());
            String retStr = repoClient.importWorkflow(selectedBean);

            // updating ASMs in memory
            ASMWorkflow workflow = null;
            Enumeration workflow_enum = PortalCacheService.getInstance().getUser(userId).getWorkflows().keys();
            while (workflow_enum.hasMoreElements()) {
                WorkflowData act_data = ((WorkflowData) PortalCacheService.getInstance().getUser(userId).getWorkflows().get(workflow_enum.nextElement()));

                if (act_data.getWorkflowID().contains(new String(concrete_wf_name))) {

                    workflow = this.getRealASMWorkflow(userId, act_data.getWorkflowID());
                    concrete_wf_name = act_data.getWorkflowID();
                }
            }
            if (workflow == null) {
                throw new Import_FailedException(userId, userworkflowname);

            } else {

                putWorkflow(userId, workflow);
                updateASMWorkflowStatus(userId, concrete_wf_name);

            }

            return concrete_wf_name;

        } catch (InstantiationException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
            throw new ASM_GeneralWebServiceException(ex.getCause(), userId, userworkflowname);

        } catch (IllegalAccessException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
            throw new ASM_GeneralWebServiceException(ex.getCause(), userId, userworkflowname);
        } catch (Exception ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
            throw new ASM_GeneralWebServiceException(ex.getCause(), userId, userworkflowname);
        }

    }

    /**
     * Modifies remote input file's path in a specified port
     *
     * @param userID ID of the user
     * @param workflowName ID of the Workflow
     * @param jobName ID of the Job
     * @param portNumber ID of the port
     * @param newRemotePath Remote file path what's to be set on the specified
     * workflow/job/port
     */
    public void setRemoteInputPath(String userID, String workflowName, String jobName, String portNumber, String newRemotePath) {
        setRemotePath(userID, workflowName, jobName, portNumber, newRemotePath, "input");
    }

    /**
     * Returns the remote input's path that is adjusted for a specified port
     *
     * @param userID ID of the user
     * @param workflowName - Name of the Workflow
     * @param jobName - Name of the Job
     * @param portNumber number of the port
     * @return String remote path
     */
    public String getRemoteInputPath(String userID, String workflowName, String jobName, String portNumber) {
        return getRemotePath(userID, workflowName, jobName, portNumber, "input");
    }

    /**
     * Modifies remote file's path in a specified port
     *
     * @param userID ID of the user
     * @param workflowName - Name of the Workflow
     * @param jobName - Name of the Job
     * @param portNumber number of the port
     * @param newRemotePath Remote file path what's to be set on the specified
     * workflow/job/port
     */
    public void setRemoteOutputPath(String userID, String workflowName, String jobName, String portNumber, String newRemotePath) {
        setRemotePath(userID, workflowName, jobName, portNumber, newRemotePath, "output");
    }

    /**
     * Returns the remote output's path that is adjusted for a specified port
     *
     * @param userID ID of the user
     * @param workflowName - Name of the Workflow
     * @param jobName - Name of the Job
     * @param portNumber number of the port
     * @return String remote path
     */
    public String getRemoteOutputPath(String userID, String workflowName, String jobName, String portNumber) {
        return getRemotePath(userID, workflowName, jobName, portNumber, "output");
    }

    /**
     * Returns the remote path of a file associated to a particular port
     *
     * @param userID - userID
     * @param workflowName - Name of the Workflow
     * @param jobName - Name of the Job
     * @param portNumber number of the port
     * @param io - specifies if its input or output port
     * @return - the path set to the port
     */
    private String getRemotePath(String userID, String workflowName, String jobName, String portNumber, String io) {
        try {
            //Vector<JobPropertyBean> jobs = getWorkflowConfig(userID, workflowName);
            ASMWorkflowConfiguration config = getWorkflowConfig(userID, workflowName);
            String remotePath = config.getRemotePath(io, jobName, Integer.parseInt(portNumber));
            logger.info("Remote path received");
            return remotePath;

        } catch (Exception e) {
            String message = "Getting remote file path on " + workflowName + " " + jobName + " " + portNumber + " " + "failed.";
            logger.trace(message);
            logger.trace(e.getLocalizedMessage());
            throw new ASMException(message);

        }

    }

    /**
     * Returns the number of inputs stored in paramInputs.zip, if it has not
     * been set, the method returns null
     *
     * @param userID -ID of the user
     * @param workflowName - name of the workflow
     * @param jobName - name of the job
     * @param portNumber - port number (1..16)
     * @return - the number of the input files compressed as paramInputs.zip, if
     * it does not exists, it returns null
     */
    public Integer getNumberOfInputs(String userID, String workflowName, String jobName, Integer portNumber) {
        Integer numberOfInputs = null;
        try {
            ASMWorkflowConfiguration config = getWorkflowConfig(userID, workflowName);
            numberOfInputs = config.getNumberOfInputs(jobName, portNumber);

        } catch (ClassNotFoundException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (InstantiationException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (IllegalAccessException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        }
        logger.info("Number of Inputs received");
        return numberOfInputs;
    }

    /**
     * Sets the number of inputs stored within paramInputs.zip
     *
     * @param userID - ID of the given user
     * @param workflowName - name of the workflow
     * @param jobName - name of the job
     * @param portNumber - port number (0..16)
     * @param numberOfInputs - the number to be set
     */
    public void setNumberOfInputs(String userID, String workflowName, String jobName, Integer portNumber, Integer numberOfInputs) {

        try {
            ASMWorkflowConfiguration configuration = getWorkflowConfig(userID, workflowName);
            configuration.setNumberOfInputs(jobName, portNumber, numberOfInputs);
            this.saveWorkflowConfig(userID, workflowName, configuration);
            logger.info("Number of inputs saved");
        } catch (ClassNotFoundException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (InstantiationException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (IllegalAccessException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        }

    }

    private void setRemotePath(String userID, String workflowName, String jobName, String portNumber, String newRemotePath, String io) {
        try {
            ASMWorkflowConfiguration configuration = getWorkflowConfig(userID, workflowName);
            configuration.setRemotePath(io, jobName, Integer.parseInt(portNumber), newRemotePath);
            saveWorkflowConfig(userID, workflowName, configuration);
            logger.info("Remote Path saved");
        } catch (Exception ex) {
            String message = "Setting remote file path on " + workflowName + " " + jobName + " " + portNumber + " to " + newRemotePath + " failed.";
            logger.trace(message);
            logger.trace(ex.getLocalizedMessage(), ex);
            throw new ASMException();

        }
    }

    /**
     * Returns the name of the workflow embedded as a job(jobId) in the workflow
     * (workflowId) if the job has different type ( single job, web-service)
     * this method returns null
     *
     * @param userId
     * @param workflowName
     * @param jobName
     * @return the name of the workflow embedded
     * @throws java.lang.ClassNotFoundException
     * @throws java.lang.ClassNotFoundException
     * @throws java.lang.InstantiationException
     * @throws java.lang.IllegalAccessException
     */
    public String getEmbeddedWorkflowName(String userId, String workflowName, String jobName) throws ClassNotFoundException, ClassNotFoundException, InstantiationException, IllegalAccessException {

        ASMWorkflowConfiguration configuration = getWorkflowConfig(userId, workflowName);
        String emb = configuration.getEmbeddedWorkflowName(jobName);
        logger.info("Embedded Workflow received");
        return emb;
    }

    /**
     *
     * Getting ASM related workflows
     *
     * @param userId - id of the user
     * @return - ArrayList <ASMWorkflow> : String is the name of the workflow
     */
    public ArrayList<ASMWorkflow> getASMWorkflows(String userId) {
        if (workflows.get(userId) == null) {
            workflows.put(userId, new HashMap<String, ASMWorkflow>());
            loadASMWorkflows(userId);

        }
        Iterator inst_iter = workflows.get(userId).keySet().iterator();
        while (inst_iter.hasNext()) {
            ASMWorkflow current = (ASMWorkflow) workflows.get(userId).get(inst_iter.next());
            String concreteWfName = current.getWorkflowName();
            if (this.getASMWorkflow(userId, concreteWfName) != null) {
                
                updateASMWorkflowStatus(userId, concreteWfName);
                updateASMWorkflowStatistics(userId, concreteWfName);
            } else {
                workflows.get(userId).remove(current);
                //inst_iter.remove();
            }
        }
        ArrayList<ASMWorkflow> returnWFList = new ArrayList<ASMWorkflow>();
        returnWFList.addAll(workflows.get(userId).values());
        logger.debug("workflow list received");
        return returnWFList;
    }

    private void updateASMWorkflowStatus(String userId, String concrete_wf_name) {

        WorkflowInstanceStatusBean statusbean = this.getWorkflowStatus(userId, concrete_wf_name);
        this.getASMWorkflow(userId, concrete_wf_name).setStatusbean(statusbean);
    }

    private void updateASMWorkflowStatistics(String userId, String concreteWfName) {
        JobStatisticsBean statbean = getWorkflowStatistics(userId, concreteWfName);
        this.getASMWorkflow(userId, concreteWfName).setStatisticsBean(statbean);
    }

    private JobStatisticsBean getWorkflowStatistics(String userID, String workflowName) {
        JobStatisticsBean statBean = new JobStatisticsBean();
        int finishedjobs = 0;
        int errorjobs = 0;
        // getting jobs statuses
        String runtimeID = getRuntimeID(userID, workflowName);
        if (runtimeID != null) {
            // setting number of finished/error jobs!!!!
            ConcurrentHashMap<String, WorkflowData> workflows = PortalCacheService.getInstance().getUser(userID).getWorkflows();
            WorkflowData wrk_data = workflows.get(workflowName);

            long finishedJobNumber = wrk_data.getFinishedStatus();
            long submittedJobNumber = wrk_data.getSubmittedStatus();
            long errorJobNumber = wrk_data.getErrorStatus(); // errorstatus fails!!!!!
            long runningJobNumber = wrk_data.getRunningStatus();
            //long estimatedJobNumber = wrk_data.getErrorStatus()+wrk_data.getFinishedStatus()+wrk_data.getRunningStatus()+wrk_data.getSubmittedStatus()+wrk_data.getSuspendStatus();

            statBean.setNumberOfJobsInError(errorJobNumber);
            statBean.setNumberOfJobsInSubmitted(submittedJobNumber);
            statBean.setNumberOfJobsInRunning(runningJobNumber);
            statBean.setNumberOfJobsInFinished(finishedJobNumber);

        }
        return statBean;
    }

    /**
     *
     * Gets and returns detailed informations about a workflow (e.g. statuses of
     * the current workflow instance, overall statistics)
     *
     * @param userID - ID of the user
     * @param workflowName - Name of the workflow
     * @return WorkflowInstanceBean object that contains information
     * @throws ASM_NoValidRuntimeIDException -it's thrown if there is No valid
     * runtime ID
     */
    public WorkflowInstanceBean getDetails(String userID, String workflowName) throws ASM_NoValidRuntimeIDException {
        WorkflowInstanceBean workflowinstance = new WorkflowInstanceBean();
        String runtimeID = (String) PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName).getAllRuntimeInstance().keys().nextElement();

        if (runtimeID != null) {

            Vector<StatusInfoBean> retVector = new Vector<StatusInfoBean>();

            /*Hashtable prp = new Hashtable();
             prp.put("url", PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName).getWfsID());
             ServiceType st = InformationBase.getI().getService("wfs", "portal", prp, new Vector());
             */
            try {
                PortalWfsClient pc = (PortalWfsClient) InformationBase.getI().getServiceClient("wfs", "portal");
                //pc.setServiceURL(st.getServiceUrl());
                //pc.setServiceID(st.getServiceID());
                retVector = pc.getInfo(runtimeID);

                //Hashtable<String, Hashtable<String, String>> jobinstances = runtimedata.getCollectionJobsStatus();
                for (StatusInfoBean jobStatus : retVector) {

                    String jobName = (String) jobStatus.getJobname();

                    RunningJobDetailsBean jobinstance = new RunningJobDetailsBean();
                    jobinstance.setName(jobName);
                    // setting jobs in init
                    jobinstance.getStatisticsBean().setNumberOfJobsInInit(jobStatus.getInit());
                    jobinstance.getStatisticsBean().setNumberOfJobsInError(jobStatus.getError());
                    jobinstance.getStatisticsBean().setNumberOfJobsInRunning(jobStatus.getRunning());
                    jobinstance.getStatisticsBean().setNumberOfJobsInSubmitted(jobStatus.getSubmit());
                    jobinstance.getStatisticsBean().setNumberOfJobsInFinished(jobStatus.getFinish());

                    jobinstance.getInstances().addAll(getJobInstanceDetails(userID, workflowName, runtimeID, jobName).values());

                    workflowinstance.getJobs().add(jobinstance);
                }

            } catch (Exception e) {
                logger.trace(e.getLocalizedMessage());

            }

        } else {
            logger.info("Runtime details required, but the workflow has not been submitted yet.");
            throw new ASM_NoValidRuntimeIDException();
        }

        return workflowinstance;
    }
    /*
     * Returns the list of job instances ordered by pID
     *
     */

    private HashMap<String, ASMJobInstanceBean> getJobInstanceDetails(String userId, String workflowId, String runtimeId, String jobName) {

        Vector<StatusIntervalBean> details = new Vector<StatusIntervalBean>();
        HashMap<String, ASMJobInstanceBean> jobInstanceDetails = new HashMap();

        //Hashtable prp = new Hashtable();
        //prp.put("url", PortalCacheService.getInstance().getUser(userId).getWorkflow(workflowId).getWfsID());
        //ServiceType st = InformationBase.getI().getService("wfs", "portal", prp, new Vector());
        //ServiceType st = InformationBase.getI().getService("wfs", "portal");
        try {
            PortalWfsClient pc = (PortalWfsClient) InformationBase.getI().getServiceClient("wfs", "portal");
            //pc.setServiceURL(st.getServiceUrl());
            //pc.setServiceID(st.getServiceID());
            ArrayList<String> availableStats = new ArrayList();
            availableStats.add(StatusConstants.INIT);
            availableStats.add(StatusConstants.SUBMITTED);
            availableStats.add(StatusConstants.RUNNING);
            availableStats.add(StatusConstants.ERROR);
            availableStats.add(StatusConstants.FINISHED);
            for (String stat : availableStats) {
                try {
                    details = pc.getJobStatusInfo(runtimeId, jobName, stat, 0, 2147483647);
                    for (StatusIntervalBean bean : details) {
                        ASMJobInstanceBean instance = new ASMJobInstanceBean();
                        instance.setUsedResource(bean.getResource());
                        long pID = bean.getStart();
                        instance.setPid(Long.toString(pID));
                        instance.setStatus(stat);
                        instance.setJobId(jobName);
                        instance.setRuntimeID(runtimeId);
                        instance.setWorkflowId(workflowId);
                        instance.setUserId(userId);

                        instance.setStdOutputPath(getStdOutputFilePath(userId, workflowId, jobName, pID));
                        instance.setStdErrorPath(getStdErrorFilePath(userId, workflowId, jobName, pID));
                        instance.setLogBookPath(getLogBookFilePath(userId, workflowId, jobName, pID));

                        jobInstanceDetails.put(Long.toString(bean.getStart()), instance);
                    }
                } catch (NullPointerException ex) // 
                {
                    logger.info("Details selected, however no job instance available in the given state");
                }

            }

        } catch (Exception e) {
            logger.trace(e.getLocalizedMessage());
        }
        return jobInstanceDetails;
    }

    /**
     * Gets the command line arguments of a specified job in a specified
     * workflow
     *
     *
     * @param userID - Id of the user
     * @param selected_concrete - name of the workflow
     * @param selected_job - name of the job
     * @return - command line argument
     */
    public synchronized String getCommandLineArg(String userID, String selected_concrete, String selected_job) {
        String actual_param = "";
        try {
            ASMWorkflowConfiguration config = getWorkflowConfig(userID, selected_concrete);
            String arg = config.getCommandLineArg(selected_job);
            logger.info("Command line argument received");
            return arg;

        } catch (ClassNotFoundException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (InstantiationException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (IllegalAccessException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        }
        return null;
    }

    /**
     *
     * Sets the command line argument of a specified job
     *
     * @param userId - id of the user
     * @param selected_concrete - name of the workflow
     * @param selected_job - name of the job
     * @param commandline - string to be set as command line argument
     */
    public synchronized void setCommandLineArg(String userId, String selected_concrete, String selected_job, String commandline) {
        logger.debug("setting command line arg : workflow " + selected_concrete + "... job... : " + selected_job + " ... command line : " + commandline);
        try {
            ASMWorkflowConfiguration configuration = getWorkflowConfig(userId, selected_concrete);
            configuration.setCommandLineArg(selected_job, commandline);
            saveWorkflowConfig(userId, selected_concrete, configuration);
        } catch (ClassNotFoundException ex) {

            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (InstantiationException ex) {

            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (IllegalAccessException ex) {

            logger.trace(ex.getLocalizedMessage(), ex);
        }
        logger.info("Command line saved");

    }

    /**
     * Returns the number of the required nodes of a given job in a given
     * workflow.
     *
     * @param userID - user ID
     * @param workflowName - workflow Name
     * @param jobName - job Name
     * @return The number of the nodes as string
     * @throws
     * hu.sztaki.lpds.pgportal.services.asm.exceptions.general.NotMPIJobException
     */
    public synchronized String getNodeNumber(String userID, String workflowName, String jobName) throws NotMPIJobException {

        try {

            ASMWorkflowConfiguration config = getWorkflowConfig(userID, workflowName);
            String nn = config.getNodeNumber(jobName);
            logger.info("node number received");
            return nn;

        } catch (ClassNotFoundException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (InstantiationException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (IllegalAccessException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        }
        logger.info("node number required for a non-MPI job");
        return null;
    }

    /**
     * Set nodenumber property of a given MPI job. If the type of the job is not
     * MPI, "NotMPIException" will be thrown
     *
     * @param userId - user ID
     * @param workflowName - workflow Name
     * @param jobName - job name
     * @param nodenumber - nodenumber to be set to the job
     * @throws
     * hu.sztaki.lpds.pgportal.services.asm.exceptions.general.NotMPIJobException
     */
    public synchronized void setNodeNumber(String userId, String workflowName, String jobName, int nodenumber) throws NotMPIJobException {
        try {
            ASMWorkflowConfiguration config = getWorkflowConfig(userId, workflowName);
            config.setNodeNumber(jobName, nodenumber);
            saveWorkflowConfig(userId, workflowName, config);
        } catch (ClassNotFoundException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (InstantiationException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (IllegalAccessException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (NotMPIJobException e) {
            logger.info("NodeNumber required for a non-MPI job");
            throw new NotMPIJobException(userId, workflowName, jobName);
        }

    }

    /**
     * Sets an expression for a given attribute of a JDL/RSL set to a given job
     *
     * @param userId - user Id
     * @param workflowName - name of the workflow
     * @param jobName - name of the job
     * @param attribute - JDL/RSL attribute
     * @param expression - expression to be set
     */
    public synchronized void setJobAttribute(String userId, String workflowName, String jobName, String attribute, String expression) {
        try {
            ASMWorkflowConfiguration config = getWorkflowConfig(userId, workflowName);
            config.setJobAttribute(jobName, attribute, expression);
            saveWorkflowConfig(userId, workflowName, config);
        } catch (ClassNotFoundException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (InstantiationException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (IllegalAccessException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        }

    }

    /**
     * Returns the expression of the given JDL/RSL attribute set to the given
     * jobName
     *
     * @param userId - user Id
     * @param workflowName - name of the workflow
     * @param jobName - name of the job
     * @param attribute - attribute of JDL/RSL
     * @return - expression adjusted to this attribute
     */
    public synchronized String getJobAttribute(String userId, String workflowName, String jobName, String attribute) {
        try {
            ASMWorkflowConfiguration config = getWorkflowConfig(userId, workflowName);
            return config.getJobAttribute(jobName, attribute);

        } catch (ClassNotFoundException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (InstantiationException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (IllegalAccessException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        }
        return null;
    }

    /**
     * Checks that all required fields are filled, all binaries and local inputs
     * are added, all required credentials are associated/downloaded to be able
     * to submit the workflow
     *
     *
     * @param userId
     * @param workflowName
     */
    public void checkWorkflowConsistency(String userId, String workflowName) {
        try {
            WorkflowData wfData = PortalCacheService.getInstance().getUser(userId).getWorkflow(workflowName);
            ResourceConfigurationFace rc = (ResourceConfigurationFace) InformationBase.getI().getServiceClient("resourceconfigure", "portal");
            List<Middleware> resources = rc.get();
            Vector<WorkflowConfigErrorBean> errorVector = (Vector<WorkflowConfigErrorBean>) RealWorkflowUtils.getInstance().getWorkflowConfigErrorVector(resources, userId, wfData);

            for (int i = 0; i < errorVector.size(); ++i) {
                WorkflowConfigErrorBean error = errorVector.get(i);
                logger.debug("ID:" + error.getErrorID() + "; in " + error.getJobName() + " job's port called" + error.getPortID());
            }

        } catch (ClassNotFoundException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (InstantiationException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (IllegalAccessException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (Exception ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        }
    }

    /**
     * Deletes a workflow
     *
     * @param userID - id of the user which owns the workflow
     * @param workflowName - the name of the workflow
     */
    public void DeleteWorkflow(String userID, String workflowName) {

        // deleting from ASM
        String portalUrl = this.getPortalURL();
        ASMWorkflow inst = getASMWorkflow(userID, workflowName);
        removeWorkflow(userID, workflowName);

        WorkflowData wData = PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName);
        Hashtable hsh = new Hashtable();
        ServiceType st;
        PortalWfsClient pc = null;
        //storage
        try {
            hsh = new Hashtable();
            hsh.put("url", wData.getStorageID());
            st = InformationBase.getI().getService("storage", "portal", hsh, new Vector());
            PortalStorageClient ps = (PortalStorageClient) Class.forName(st.getClientObject()).newInstance();
            ps.setServiceURL(st.getServiceUrl());
            ps.setServiceID(st.getServiceID());

            ComDataBean tmp = new ComDataBean();

            tmp.setPortalID(portalUrl);
            tmp.setUserID(userID);
            tmp.setWorkflowID(wData.getWorkflowID());

            ps.deleteWorkflow(tmp);

            Enumeration wfenm = PortalCacheService.getInstance().getUser(userID).getTemplateWorkflows().keys();
            while (wfenm.hasMoreElements()) {
                String wfkey = "" + wfenm.nextElement();
                if (PortalCacheService.getInstance().getUser(userID).getTemplateWorkflow(wfkey).getGraf().equals(wData.getGraf())) {

                    //delete template workflow
                    ComDataBean template_tmp = new ComDataBean();

                    template_tmp.setPortalID(portalUrl);
                    template_tmp.setUserID(userID);
                    template_tmp.setWorkflowID(wfkey);
                    //System.out.println("Deleting " + wfkey + " from storage ");
                    ps.deleteWorkflow(template_tmp);

                }
            }

        } catch (Exception e) {

            logger.trace(e.getLocalizedMessage(), e);
        }

//wfs
        hsh = new Hashtable();
        hsh.put("url", wData.getWfsID());
        st = InformationBase.getI().getService("wfs", "portal", hsh, new Vector());

        try {
            pc = (PortalWfsClient) Class.forName(st.getClientObject()).newInstance();
            pc.setServiceURL(st.getServiceUrl());
            pc.setServiceID(st.getServiceID());
            ComDataBean tmp = new ComDataBean();

            tmp.setPortalID(portalUrl);
            tmp.setUserID(userID);
            tmp.setWorkflowID(wData.getWorkflowID());
            pc.deleteWorkflow(tmp);

//delete from timing workflow list
            PortalCacheService.getInstance().getUser(userID).deleteWorkflow(wData.getWorkflowID());

        } catch (Exception e) {
            logger.trace(e.getLocalizedMessage(), e);
        }

        // delete template
        //System.out.println("template is : " + wData.getTemplate());
        WorkflowData temp_data = PortalCacheService.getInstance().getUser(userID).getTemplateWorkflow(wData.getTemplate());
        try {
            ComDataBean template_tmp = new ComDataBean();

            template_tmp.setPortalID(portalUrl);
            template_tmp.setUserID(userID);
            template_tmp.setWorkflowID(wData.getTemplate());
            pc.deleteWorkflow(template_tmp);

//delete from timing workflow list
            PortalCacheService.getInstance().getUser(userID).deleteWorkflow(wData.getWorkflowID());

        } catch (Exception e) {
            logger.trace(e.getLocalizedMessage(), e);
        }

// delete template workflow from portal cache
        Enumeration wfenm = PortalCacheService.getInstance().getUser(userID).getTemplateWorkflows().keys();
        String key = "";
        while (wfenm.hasMoreElements()) {
            key = "" + wfenm.nextElement();
            if (PortalCacheService.getInstance().getUser(userID).getTemplateWorkflow(key).getGraf().equals(workflowName)) {
                // delete template workflow from wfs
                hsh = new Hashtable();

                st = InformationBase.getI().getService("wfs", "portal", hsh, new Vector());
                try {
                    pc = (PortalWfsClient) Class.forName(st.getClientObject()).newInstance();
                    pc.setServiceURL(st.getServiceUrl());
                    pc.setServiceID(st.getServiceID());
                    ComDataBean tmp = new ComDataBean();

                    tmp.setPortalID(portalUrl);
                    tmp.setUserID(userID);
                    tmp.setWorkflowID(key);
                    pc.deleteWorkflow(tmp);
                    // delete from timing workflow list
                    PortalCacheService.getInstance().getUser(userID).deleteWorkflow(key);

                } catch (Exception e) {
                    logger.trace(e.getLocalizedMessage(), e);
                }
                // delete template workflow from portal cache
                PortalCacheService.getInstance().getUser(userID).getTemplateWorkflows().remove(key);

                // delete graph from wfs
                ComDataBean cmd = new ComDataBean();
                cmd.setWorkflowID(workflowName);
                cmd.setUserID(userID);

                cmd.setPortalID(portalUrl);

                pc.deleteWorkflowGraf(cmd);

            }
        }

        // delete graf workflow from portal cache
        PortalCacheService.getInstance().getUser(userID).getAbstactWorkflows().remove(workflowName);
        //

        PortalCacheService.getInstance().getUser(userID).deleteWorkflow(wData.getWorkflowID());
        logger.info("Workflow deleted");
    }

    private String getPortID(String userID, String workflowName, String jobName, String port) throws ClassNotFoundException, InstantiationException, IllegalAccessException {
        try {

            Vector<JobPropertyBean> jobs = getWorkflowConfig(userID, workflowName).getConfiguration();

            for (JobPropertyBean j : jobs) {

                //System.out.println("jobname i get is : " +j.getName());
                if (j.getName().equals(new String(jobName))) {

                    for (PortDataBean p : (Vector<PortDataBean>) j.getInputs()) {
                        /*Iterator keys = p.getData().keySet().iterator();
                         while(keys.hasNext()){
                         String key = (String)keys.next();

                         }
                         */

                        if (Long.toString(p.getSeq()).equals(new String(port))) {

                            return Long.toString(p.getId());
                        }

                    }

                }
            }

        } catch (ClassNotFoundException ex) {
            throw ex;

        } catch (InstantiationException ex) {
            throw ex;
        } catch (IllegalAccessException ex) {
            throw ex;
        }

        throw new ASM_NoMatchingPortIDException(userID, workflowName);
    }

    /**
     *
     * Uploads a file from the user's local machine to the *portal* server only.
     * It won't store the file in the Storage component of gUSE, and won't
     * update database under WFS component
     *
     * @param file - file to upload (can be get from the ActionRequest)
     * @param userID - ID of the user
     * @param filename - the file should be placed using this name
     * @return the uploaded file stored on the portal server
     * @throws Exception
     */
    public File uploadFiletoPortalServer(FileItem file, String userID, String filename) throws Exception {
        //System.out.println("doUPLOADFiletoPortalServer called ...");

        File serverSideFile = null;
        try {
            String tempDir = System.getProperty("java.io.tmpdir") + "/uploads/" + userID;
            File f = new File(tempDir);
            if (!f.exists()) {
                f.mkdirs();
            }
            serverSideFile = new File(tempDir, filename);
            file.write(serverSideFile);
            file.delete();

        } catch (FileUploadException fue) {
            //response.setRenderParameter("full", "error.upload");
            logger.trace(fue.getLocalizedMessage(), fue);
            throw new Upload_ErrorDuringUploadException(fue.getCause(), userID);

            //context.log("[FileUploadPortlet] - failed to upload file - "+ fue.toString());
        } catch (Exception e) {
            logger.trace(e.getLocalizedMessage(), e);
            //response.setRenderParameter("full", "error.exception");
            throw new Upload_GeneralException(e.getCause(), userID);
            //context.log("[FileUploadPortlet] - failed to upload file - "+ e.toString());

        }
        return serverSideFile;
    }

    /**
     * Sets a resource for a job specified in arguments
     *
     * @param userID - id of the user
     * @param workflowName - name of the workflow
     * @param jobName - name of the job
     * @param grid - name of the DCI (glite, pbs etc)
     * @param resource - name of the resource
     * @param queue - name of the queue
     */
    public void setResource(String userID, String workflowName, String jobName, String type, String grid, String resource, String queue) {
        try {
            ASMWorkflowConfiguration configuration = this.getWorkflowConfig(userID, workflowName);
            configuration.setResource(jobName, type, grid, resource, queue);
            this.saveWorkflowConfig(userID, workflowName, configuration);
            logger.info("Resource has been set");
        } catch (ClassNotFoundException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (InstantiationException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (IllegalAccessException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        }

    }

    /**
     * Returns the resource where the job is going to be submitted to.
     *
     * @param userID - ID of the user
     * @param workflowName - Name of the workflow
     * @param jobName - name of the job
     * @return - an ASMResourceBean object or null in any case of errors
     */
    public ASMResourceBean getResource(String userID, String workflowName, String jobName) {

        try {
            ASMWorkflowConfiguration configuration = this.getWorkflowConfig(userID, workflowName);
            ASMResourceBean resource = configuration.getResource(jobName);
            logger.info("Resource received");
            return resource;

        } catch (ClassNotFoundException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (InstantiationException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (IllegalAccessException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        }
        return null;

    }

    /**
     *
     ** Gets an input value on a port, if and only if it has set to be "input"
     * type
     *
     * @param userID - id of the user
     * @param workflowName - name of the workflow
     * @param jobName - name of the job
     * @param portNumber - number of the port
     * @return input value
     * @throws java.lang.ClassNotFoundException
     * @throws java.lang.InstantiationException
     * @throws java.lang.IllegalAccessException
     */
    public String getInputValue(String userID, String workflowName, String jobName, String portNumber) throws ClassNotFoundException, InstantiationException, IllegalAccessException {

        logger.debug("InputValue method: userId(" + userID + ") workflowID(" + workflowName + ") jobID(" + jobName + ") portNumber(" + portNumber + ")");

        ASMWorkflowConfiguration workflowconfig = this.getWorkflowConfig(userID, workflowName);
        String inputVal = workflowconfig.getInputValue(jobName, Integer.parseInt(portNumber));
        logger.info("Input value received");
        return inputVal;
    }

    /**
     *
     * Sets an input value on a port, if and only if it has set to be "input"
     * type
     *
     * @param inputValue - value to be set to the input port
     * @param userID - id of the user
     * @param workflowName - name of the workflow
     * @param jobName - name of the job
     * @param portNumber - number of the port
     * @throws java.lang.ClassNotFoundException
     * @throws java.lang.InstantiationException
     * @throws java.lang.IllegalAccessException
     */
    public void setInputValue(String inputValue, String userID, String workflowName, String jobName, String portNumber) throws ClassNotFoundException, InstantiationException, IllegalAccessException {
        ASMWorkflowConfiguration workflowconfig = this.getWorkflowConfig(userID, workflowName);
        try {
            workflowconfig.setInputValue(jobName, Integer.parseInt(portNumber), inputValue);
        } catch (InconsistentInputPortException e) {
            throw new InconsistentInputPortException("", userID, workflowName, jobName, portNumber);
        }

        this.saveWorkflowConfig(userID, workflowName, workflowconfig);
        logger.info("Input value has been set");
    }

    /**
     * Sets an input text as local input file and associates it to a port Note:
     * it operates only on File Input ports!
     *
     * @param userID - id of the user
     * @param filecontent - input text content
     * @param workflowName - name of the workflow
     * @param jobName - name of the job, which contains the port
     * @param portNumber - number of the port
     * @throws IOException
     */
    public void setInputText(String userID, String filecontent, String workflowName, String jobName, String portNumber) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, Exception {
        ASMWorkflowConfiguration workflowConfig = this.getWorkflowConfig(userID, workflowName);
        if (workflowConfig.CheckPortType("file", jobName, Integer.parseInt(portNumber))) {
            // saving filecontent to a file;
            String tempdir = PropertyLoader.getInstance().getProperty("portal.prefix.dir") + "uploads/" + userID;
            File tempdirf = new File(tempdir);
            if (!tempdirf.exists()) {
                tempdirf.mkdirs();
            }
            File tempfile = new File(tempdir + "/input_" + portNumber + "_file");
            if (tempfile.exists()) {
                // file exists delete it!
                tempfile.delete();
            }
            //System.out.println("setinputtext filecontent: "+ tempfile);
            tempfile.createNewFile();
            FileUtils.writeStringToFile(tempfile, filecontent);
            try {
                this.placeUploadedFile(userID, tempfile, workflowName, jobName, portNumber);
            } catch (Exception e) {
                logger.trace("File upload failed", e);
                throw e;

            }

        } else {
            logger.trace("Inconsistent input port exception is thrown");
            throw new InconsistentInputPortException("", userID, workflowName, jobName, portNumber);
        }
    }

    /**
     * Returns SQL Query attributes from the given workflow's job's port.
     *
     * @param userID - ID of the user
     * @param workflowName - name of the workflow
     * @param jobName - name of the job
     * @param portNumber - number of the port
     * @return ASMSQLQueryBean bean filled with the attributes
     */
    public ASMSQLQueryBean getInputSQLQuery(String userID, String workflowName, String jobName, String portNumber) throws ClassNotFoundException, InstantiationException, IllegalAccessException {
        ASMSQLQueryBean queryBean = new ASMSQLQueryBean();

        ASMWorkflowConfiguration workflowConfig = this.getWorkflowConfig(userID, workflowName);
        try {
            ASMSQLQueryBean bean = workflowConfig.getInputSQLQuery(jobName, Integer.parseInt(portNumber));
            logger.info("Current SQL Query received");
            return bean;
        } catch (InconsistentInputPortException e) {
            logger.trace("Inconsistent input port exception is thrown", e);
            throw new InconsistentInputPortException("", userID, workflowName, jobName, portNumber);

        }

        //this.saveWorkflowConfig(userID, workflowName, workflowConfig);
        //return queryBean;
    }

    /**
     *
     * Sets SQL Query attributes (added as ASMSQLQueryBean argument) to the
     * given workflow's job's port.
     *
     * @param bean - Descriptor object of the SQL Query properties (SQL url,
     * username, etc)
     * @param userID - ID of the user
     * @param workflowName - name of the workflow
     * @param jobName - name of the job
     * @param portNumber - number of the port
     */
    public void setInputSQLQuery(ASMSQLQueryBean bean, String userID, String workflowName, String jobName, String portNumber) throws ClassNotFoundException, InstantiationException, IllegalAccessException {
        ASMWorkflowConfiguration workflowConfig = this.getWorkflowConfig(userID, workflowName);
        try {
            workflowConfig.setInputSQLQuery(bean, jobName, Integer.parseInt(portNumber));
        } catch (InconsistentInputPortException e) {
            logger.trace("Inconsistent input port exception is thrown");
            throw new InconsistentInputPortException("", userID, workflowName, jobName, portNumber);
        }

        this.saveWorkflowConfig(userID, workflowName, workflowConfig);
        logger.info("SQL Query has been set.");
    }

    /**
     *
     * Gets the uploaded file stored on the portal server's temporary folder and
     * uploads it to Storage component of gUSE then updates the database managed
     * by WFS component
     *
     * @param userID - ID of the user
     * @param fileOnPortalServer - file on the portal server
     * @param workflowName - Name of the workflow
     * @param jobName - name of the job
     * @param portNumber - number of the port (0..15)
     * @throws Exception
     */
    public void placeUploadedFile(String userID, File fileOnPortalServer, String workflowName, String jobName, String portNumber) throws Exception {
        String portalUrl = this.getPortalURL();
        //System.out.println("placeUploadedFile started...");
        try {
            String SID = this.getPortID(userID, workflowName, jobName, portNumber);
            Hashtable h = new Hashtable();

            h.put("portalID", portalUrl);
            h.put("userID", userID);
            h.put("workflowID", workflowName);
            h.put("jobID", jobName);
            String sfile = "input_" + portNumber;
            h.put("sfile", sfile);
            String confID = userID + String.valueOf(System.currentTimeMillis());
            h.put("confID", confID);
            h.put("sid", confID);
            String uploadField = "";
            String uploadingitem = fileOnPortalServer.getName();

            uploadField = "input_" + portNumber + "_file";

            Hashtable hsh = new Hashtable();
            ServiceType st = InformationBase.getI().getService("storage", "portal", hsh, new Vector());
            PortalStorageClient psc = (PortalStorageClient) Class.forName(st.getClientObject()).newInstance();
            psc.setServiceURL(st.getServiceUrl());
            psc.setServiceID("/upload");
            if (fileOnPortalServer != null) {
                //System.out.println("Upload to storage called : uploadField is : " + uploadField );
                Enumeration e = h.keys();
                while (e.hasMoreElements()) {
                    String elem = (String) e.nextElement();
                    //System.out.println("key in h : " + elem);
                    //System.out.println("value in h : " + h.get(elem));
                }

                psc.fileUpload(fileOnPortalServer, uploadField, h);

                // uploadThread
                if (uploadingitem != null) {
                    ASMUploadThread uploadthread = new ASMUploadThread(userID, workflowName, jobName, portNumber, confID, SID, uploadingitem);
                    uploadthread.start();
                    boolean isgo = false;
                    while (!isgo) {
                        for (int i = 0; i < 100; ++i) {
                            for (int j = 0; j < 100; ++j) {
                                String s = System.getProperty("user.dir");
                            }
                        }
                        isgo = uploadthread.isGo();

                    }

                }

            }
        } catch (Exception ex) {
            //response.setRenderParameter("full", "error.upload");
            logger.trace(ex.getLocalizedMessage(), ex);
            throw new Upload_GeneralException(ex.getCause(), userID);

        }

    }

    private String getRuntimeID(String userID, String workflowName) {

        ConcurrentHashMap runtimes = ((ConcurrentHashMap) PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName).getAllRuntimeInstance());

        if (runtimes.size() > 0) {

            Object firstID = runtimes.keySet().iterator().next();

            return firstID.toString();

        }

        return null;

    }

// downloadtype can be  : InstanceOutputs, InstanceAll, All, AllbutLogs,AllInputs,AllOutputs
    private InputStream getFileStreamFromStorage(String userID, String workflowName, String jobName, String pID, int downloadtype) {
        InputStream is = null;
        String portalUrl = getPortalURL();
        try {
            Hashtable hsh = new Hashtable();
            try {
                hsh.put("url", this.getStorageURL());
            } catch (Exception e) {
            }
            Hashtable<String, String> params = new Hashtable<String, String>();

            params.put("portalID", portalUrl);
            params.put("wfsID", this.getWFSURL());
            params.put("userID", userID);
            params.put("workflowID", workflowName);
            //params.put("jobID", jobID);

            //TODO : modify pidID to handle parametric output ports!!!
            //params.put("pidID", pID);
            String runtimeID = getRuntimeID(userID, workflowName);

            //if (runtimeID != null) {
            switch (downloadtype) {

                case DownloadTypeConstants.All:
                    params.put("downloadType", "all");
                    params.put("instanceType", "all");
                    params.put("outputLogType", "all");
                    break;
                case DownloadTypeConstants.AllInputs:
                    params.put("downloadType", "inputs");
                    break;
                case DownloadTypeConstants.AllOutputs:
                    params.put("downloadType", "outputs_all");
                    break;
                case DownloadTypeConstants.AllButLogs:
                    params.put("downloadType", "all");
                    params.put("instanceType", "all");
                    params.put("outputLogType", "none");
                    break;
                case DownloadTypeConstants.InstanceAll:
                    params.put("downloadType", "inputs_" + runtimeID);
                    params.put("instanceType", "one_" + runtimeID);

                    break;
                case DownloadTypeConstants.InstanceOutputs:
                    params.put("downloadType", "outputs_" + runtimeID);

                    break;
                case DownloadTypeConstants.JobOutputs:
                    if (jobName != null && pID != null) {
                        params.put("downloadType", "joboutputs_" + runtimeID);
                        params.put("jobID", jobName);
                        params.put("pidID", pID);
                        break;
                    } else {
                        return null;
                    }

            }

            ServiceType st = InformationBase.getI().getService("storage", "portal", hsh, new Vector());
            PortalStorageClient ps = (PortalStorageClient) Class.forName(st.getClientObject()).newInstance();
            ps.setServiceURL(st.getServiceUrl());
            ps.setServiceID("/download");
            is = ps.getStream(params);

            return is;
            //}
        } catch (ClassNotFoundException ex) {

            logger.trace(ex.getLocalizedMessage(), ex);

        } catch (InstantiationException ex) {

            logger.trace(ex.getLocalizedMessage(), ex);

        } catch (IOException ex) {

            logger.trace(ex.getLocalizedMessage(), ex);

        } catch (IllegalAccessException ex) {

            logger.trace(ex.getLocalizedMessage(), ex);

        }

        return null;
    }

    private void convertOutput(String userId, String workflowName, String jobName, String fileName, InputStream is, OutputStream os, boolean compress) throws IOException {

        ZipInputStream zis = new ZipInputStream(is);
        ZipEntry entry;
        String runtimeID = getRuntimeID(userId, workflowName);
        ZipOutputStream zos;

        zos = new ZipOutputStream(os);

        while ((entry = zis.getNextEntry()) != null) {

            if (jobName == null ||
                    
                (entry.getName().contains(jobName + "/outputs/" + runtimeID + "/") &&
                    (fileName == null || (fileName != null && entry.getName().endsWith(fileName))))) {
                int size;
                byte[] buffer = new byte[2048];
                String fileNameInZip;
                String parentDir;
                logger.debug(entry.getName());
                if (jobName == null){
                    fileNameInZip=entry.getName();
                }
                else{
                    parentDir = entry.getName().split("/")[entry.getName().split("/").length - 2];
                    fileNameInZip = parentDir + "/" + entry.getName().split("/")[entry.getName().split("/").length - 1];
                }
                ZipEntry newFile = new ZipEntry(fileNameInZip);

                if (compress) {
                    zos.putNextEntry(newFile);
                    while ((size = zis.read(buffer, 0, buffer.length)) != -1) {
                        zos.write(buffer, 0, size);
                    }
                    zos.closeEntry();
                } else {
                    while ((size = zis.read(buffer, 0, buffer.length)) != -1) {
                        os.write(buffer, 0, size);
                    }
                    os.flush();
                }
            }
        }
        zis.close();
        if (compress) {

            zos.close();
        }

    }

    public InputStream getSingleInputFileStream(String userID, String workflowName, String jobName, Integer portNumber) throws MalformedURLException, IOException {
        String portalUrl = getPortalURL();
        String replPortalID = portalUrl.replace("/", "_");
        String servletURL = this.getStorageURL() + "/getFile";
        String pathValue = replPortalID + "/" + userID + "/" + workflowName + "/" + jobName + "/inputs/" + portNumber.toString() + "/0";
        System.out.println("servlet called: " + servletURL + "?path=" + pathValue);
        URL oracle = new URL(servletURL + "?path=" + pathValue);

        URLConnection yc = oracle.openConnection();
        logger.debug("Input file stream received");
        return yc.getInputStream();

    }

    /**
     * Returns an Inputstream of a single output file using servlet interface of
     * Storage component (instead of using web-interface)
     *
     * @param userID - userID
     * @param workflowName - name of the workflow
     * @param jobName - name of the job
     * @param parametricID - instance number of the job (0, if it was submitted
     * as single job, >0 specifies one of parametric execution of the job)
     * @param fileName - name of the file
     * @return Stream of an output file
     * @throws java.net.MalformedURLException
     * @throws java.io.IOException
     */
    public InputStream getSingleOutputFileStream(String userID, String workflowName, String jobName, Integer parametricID, String fileName) throws MalformedURLException, IOException {

        String pID = "0";

        if (parametricID != null) {
            pID = Integer.toString(parametricID);
        }
        String portalUrl = getPortalURL();
        String replPortalID = portalUrl.replace("/", "_");
        String servletURL = this.getStorageURL() + "/getFile";
        String runtimeID = this.getRuntimeID(userID, workflowName);
        String pathValue = replPortalID + "/" + userID + "/" + workflowName + "/" + jobName + "/outputs/" + runtimeID + "/" + pID + "/" + fileName;
        logger.debug("servlet called: " + servletURL + "?path=" + pathValue);
        URL oracle = new URL(servletURL + "?path=" + pathValue);

        URLConnection yc = oracle.openConnection();
        logger.debug("Output file stream received");
        return yc.getInputStream();

    }

    /**
     * returns the stream of the specified output file to the given response if
     * there are more files associated to the port (by filename). Note: it works
     * on single files (pID = 0) all other pIDs will be ignored.
     *
     * @param userID - userID coming from Liferay
     * @param workflowName - name of the workflow
     * @param jobName - name of the job
     * @param fileName - filename
     * @param pID - parametric ID, orders the members of the output files with
     * the same name. Starts from zero. If it is a single output, just set it
     * null or zero.
     * @param outputStream - a stream object to where to output file is
     * transferred
     */
    public void getSingleOutputFileStream(String userID, String workflowName, String jobName, String fileName, Integer pID, OutputStream outputStream) throws IOException {
        InputStream is = null;
        // getting runtime ID + getting pid
        String parametricID = "0";

        if (pID != null) {
            parametricID = Integer.toString(pID);
        }

        is = getFileStreamFromStorage(userID, workflowName, jobName, parametricID, DownloadTypeConstants.JobOutputs);
        logger.debug("Input file stream received");
        this.convertOutput(userID, workflowName, jobName, fileName, is, outputStream, false);

    }

    /**
     * returns the stream of the specified output file to the given response if
     * there are more files associated to the port (by filename) note: it works
     * on single files (pID = 0) all other pIDs will be ignored.
     *
     * @param userID - userID coming from Liferay
     * @param workflowName - name of the workflow
     * @param jobName - name of the job
     * @param fileName - filename
     * @param pID - parametric ID, orders the members of the output files with
     * the same name. Starts from zero. If it is a single output, just set it
     * null or zero.
     */
    public void getSingleOutputFileStream(String userID, String workflowName, String jobName, String fileName, Integer pID, HttpServletResponse response) throws IOException {
        InputStream is = null;
        // getting runtime ID + getting pid
        String parametricID = "0";

        if (pID != null) {
            parametricID = Integer.toString(pID);
        }

        is = getFileStreamFromStorage(userID, workflowName, jobName, parametricID, DownloadTypeConstants.JobOutputs);
        logger.info("Input file stream received");
        this.convertOutput(userID, workflowName, jobName, fileName, is, response.getOutputStream(), false);

    }

    /**
     * returns the stream of the specified output file to the given response
     *
     * @param userID - ID of the user
     * @param workflowName - Name of the workflow
     * @param jobName - Name of the job
     * @param fileName - name of the file (it must be associated as a port on
     * jobName job)
     * @param pID - parametric ID, orders the members of the output files with
     * the same name. Starts from zero. If it is a single output, just set it
     * null.
     * @param response - response object
     * @throws java.io.IOException
     */
    public void getSingleOutputFileStream(String userID, String workflowName, String jobName, String fileName, Integer pID, ResourceResponse response) throws IOException {
        InputStream is = null;
        //try {
        String parametricID = "0";

        if (pID != null) {
            parametricID = Integer.toString(pID);
        }
        is = getFileStreamFromStorage(userID, workflowName, jobName, parametricID, DownloadTypeConstants.JobOutputs);
        logger.info("Input file stream received");
        this.convertOutput(userID, workflowName, jobName, fileName, is, response.getPortletOutputStream(), false);

        /*} catch (IOException ex) {
         throw new Download_GettingFileStreamException(ex.getCause(), userID, workflowID);
         }*/
    }

    /**
     * @deprecated use
     * {@link #getSingleOutputFileStream(String userID, String workflowName, String jobName, String fileName, Integer pID, HttpServletResponse response)}
     * instead It gets the file specified by the attributes
     * (userID/workflowID/jobID/portID) and passes it back to the outputstream
     * of the specified response
     *
     * @param userID - ID of the user
     * @param workflowName - Name of the workflow
     * @param jobName - Name of the job
     * @param fileName - Name of the file
     * @param response - response that should contain the file to download
     * @throws ASM_GeneralException
     */
    public void getFileStream(String userID, String workflowName, String jobName, String fileName, HttpServletResponse response) throws Upload_GeneralException {
        InputStream is = null;
        try {

            is = getFileStreamFromStorage(userID, workflowName, null, null, DownloadTypeConstants.JobOutputs);
            this.convertOutput(userID, workflowName, jobName, fileName, is, response.getOutputStream(), false);

        } catch (IOException ex) {
            throw new Download_GettingFileStreamException(ex.getCause(), userID, workflowName);
        }
    }

    /**
     * Returns the standard output's link of the specified job
     *
     * @param userID - userID
     * @param workflowName - name of the workflow
     * @param jobName - name of the job
     *
     * @param pID - parametric ID (relevant if multiple job instances were
     * submitted, in this case it means the number of the parametric job
     * submission, othervise it can be left null, or 0)
     * @return link
     */
    public String getStdOutputFilePath(String userID, String workflowName, String jobName, Long pID) {
        return getFilePath(userID, workflowName, jobName, null, pID, "stdout");
    }

    /**
     * Returns the standard error's link of the specified job
     *
     * @param userID - userID
     * @param workflowName - name of the workflow
     * @param jobName - name of the job
     *
     * @param pID - parametric ID (relevant if multiple job instances were
     * submitted, in this case it means the number of the parametric job
     * submission, othervise it can be left null, or 0)
     * @return link
     */
    public String getStdErrorFilePath(String userID, String workflowName, String jobName, Long pID) {
        return getFilePath(userID, workflowName, jobName, null, pID, "stderr");
    }

    /**
     * Returns the logbook's link of the specified job
     *
     * @param userID - userID
     * @param workflowName - name of the workflow
     * @param jobName - name of the job
     *
     * @param pID - parametric ID (relevant if multiple job instances were
     * submitted, in this case it means the number of the parametric job
     * submission, othervise it can be left null, or 0)
     * @return link
     */
    public String getLogBookFilePath(String userID, String workflowName, String jobName, Long pID) {
        return getFilePath(userID, workflowName, jobName, null, pID, "logbook");
    }

    private String getFilePath(String userID, String workflowName, String jobName, Integer portNumber, Long pID, String io) {
        long tpID = 0;
        if (pID != null) {
            tpID = pID;
        }
        String portalUrl = getPortalURL();
        String replPortalID = portalUrl.replace("/", "_");
        String runtimeID = this.getRuntimeID(userID, workflowName);
        ;
        String servletURL = this.getStorageURL() + "/getFile";
        String pathValue = replPortalID + "/" + userID + "/" + workflowName + "/" + jobName;
        if ("input".equals(io)) {
            pathValue += "/inputs/" + portNumber.toString() + "/0";
        } else {
            pathValue += "/outputs/" + runtimeID + "/" + Long.toString(tpID);
            if ("stdout".equals(io)) {
                pathValue += "/stdout.log";
            } else if ("stderr".equals(io)) {
                pathValue += "/stderr.log";
            } else if ("logbook".equals(io)) {
                pathValue += "/gridnfo.log";
            }
        }
        logger.debug("Http File path concatenated");
        return servletURL + "?path=" + pathValue;
    }

    /**
     *
     * It gets the file specified by the attributes
     * (userID/workflowID/jobID/filename) and places it on the portal server
     * under $CATALINA_HOME/tmp/users/" + userID + "/workflow_outputs" +
     * workflowID
     *
     * @param userID - ID of the user
     * @param workflowName - Name of the workflow
     * @param jobName - Name of the job
     * @param filename - name of the file
     * @param pID - parametric ID (in order to the parallel executions of a job)
     *
     * @throws ASM_GeneralException
     * @return String - Path of the file stored on the portal server
     */
    public String getFiletoPortalServer(String userID, String workflowName, String jobName, String fileName, Integer pID) throws Download_GettingFileToPortalServiceException {
        String downloadfolder = PropertyLoader.getInstance().getProperty("prefix.dir") + "tmp/users/" + userID + "/workflow_outputs/" + workflowName + "/" + jobName;
        String parametricID = "0";
        if (pID != null) {
            parametricID = Integer.toString(pID);
        }

        if (!new File(downloadfolder).exists()) {
            File down_folder = new File(downloadfolder);
            down_folder.mkdirs();
        }
        String outputfile = downloadfolder + "/" + fileName;
        File f = new File(outputfile);
        InputStream is = null;

        try {

            is = getFileStreamFromStorage(userID, workflowName, jobName, parametricID, DownloadTypeConstants.JobOutputs);
            java.io.OutputStream out = new FileOutputStream(f);
            this.convertOutput(userID, workflowName, jobName, fileName, is, out, false);
            logger.info("Output file arrived to the portal server");
            return outputfile;
        } catch (IOException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
            throw new Download_GettingFileToPortalServiceException(ex.getCause(), userID, workflowName);
        }
    }

    /**
     * @deprecated use
     * {@link #getSingleOutputFileStream(String userID, String workflowName, String jobName, String fileName, Integer pID,  ResourceResponse response)}
     * instead
     *
     * It gets the file specified by the attributes
     * (userID/workflowID/jobID/portID) and passes it back to the outputstream
     * of the specified ResourceResponse It can be used if file downloading
     * should work using Ajax technology
     *
     * @param userID - ID of the user
     * @param workflowName - Name of the workflow
     * @param jobName - Name of the job
     * @param fileName - name of the file
     * @param response - response that should contain the file to download
     * @throws ASM_GeneralException
     */
    public void getFileStream(String userID, String workflowName, String jobName, String fileName, ResourceResponse response) throws Download_GettingFileStreamException {

        InputStream is = null;
        try {

            is = getFileStreamFromStorage(userID, workflowName, null, null, DownloadTypeConstants.JobOutputs);
            this.convertOutput(userID, workflowName, jobName, fileName, is, response.getPortletOutputStream(), false);

        } catch (IOException ex) {
            throw new Download_GettingFileStreamException(ex.getCause(), userID, workflowName);
        }
    }

    /**
     *
     * Provides outputs through response object added as a parameter
     *
     * @param userId id of the user
     * @param workflowName name of the workflow
     * @param response object that will contain the output stream
     * @throws ASM_GeneralException
     */
    /*
    public void getWorkflowOutputs(String userId, String workflowName, ResourceResponse response) {
        try {
            InputStream is = null;
            is = getFileStreamFromStorage(userId, workflowName, null, null, DownloadTypeConstants.AllOutputs);
            this.convertOutput(userId, workflowName, null, null, is, response.getPortletOutputStream(), true);

        } catch (IOException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        }

    }*/
    // Replaced the code of above method with the following to fix the issue with downloading log files through the portal
    public void getWorkflowOutputs(String userId, String workflowName, ResourceResponse response) {
    	try {
            InputStream is = null;
            is = getFileStreamFromStorage(userId, workflowName, null, null, DownloadTypeConstants.AllOutputs);
            int size;
            byte[] buffer = new byte[2048];
            
            while ((size = is.read(buffer, 0, buffer.length)) != -1) {
                response.getPortletOutputStream().write(buffer, 0, size);
            }
            response.getPortletOutputStream().flush();
        } catch (IOException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        }

    }
    /**
     * Downloads a complete workflow imported via ASM
     * 
     * @param userId - user Id
     * @param workflowName - name of the workflow
     * @param response -response stream
     */
    public void downloadWorkflow(String userId, String workflowName, ResourceResponse response) {
        try {
            InputStream is = null;
            is = getFileStreamFromStorage(userId, workflowName, null, null, DownloadTypeConstants.All);
            int size;
            byte[] buffer = new byte[2048];
            
            while ((size = is.read(buffer, 0, buffer.length)) != -1) {
                response.getPortletOutputStream().write(buffer, 0, size);
            }
            response.getPortletOutputStream().flush();
        } catch (IOException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        }

    }

    /**
     *
     * Gets the workflows from the local repository exported by a specified user
     *
     * @param owner - user who exported the workflow
     * @param type - type of the exportation (application,project,graph)
     * @return - vector of the workflows
     * @throws Exception
     */
    public synchronized Vector<ASMRepositoryItemBean> getWorkflowsFromRepository(String owner, String type) throws Exception {
        try {
            Long id = new Long(0);
            return getWorkflowsFromRepository2Vector(owner, type, id);
        } catch (Exception e) {
            throw e;
        }
    }

    private synchronized ArrayList<RepositoryWorkflowBean> getWorkflowsFromRepository2Array(String owner, String type, Long id) throws ASM_UnknownErrorException {
        try {
            // get repository workflow item list from wfs...
            Hashtable hsh = new Hashtable();
            ServiceType st = InformationBase.getI().getService("wfs", "portal", hsh, new Vector());
            PortalWfsClient wfsClient = (PortalWfsClient) Class.forName(st.getClientObject()).newInstance();
            wfsClient.setServiceURL(st.getServiceUrl());
            wfsClient.setServiceID(st.getServiceID());
            RepositoryWorkflowBean bean = new RepositoryWorkflowBean();
            bean.setId(id);
            bean.setUserID(owner);
            bean.setWorkflowType(type);
            Vector<RepositoryWorkflowBean> wfList = (Vector<RepositoryWorkflowBean>) wfsClient.getRepositoryItems(bean);
            ArrayList<RepositoryWorkflowBean> ret_list = new ArrayList<RepositoryWorkflowBean>();
            if (wfList == null) {
                logger.trace("List of exported workflows is null");
                throw new ASM_UnknownErrorException();
            } else {

                for (RepositoryWorkflowBean repbean : wfList) {
                    if (repbean.getUserID().equals(owner)) {
                        ret_list.add(repbean);
                    }
                }

                return ret_list;
            }
        } catch (ClassNotFoundException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
            throw new ASM_GeneralWebServiceException(ex.getCause(), owner);
        } catch (InstantiationException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
            throw new ASM_GeneralWebServiceException(ex.getCause(), owner);
        } catch (IllegalAccessException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
            throw new ASM_GeneralWebServiceException(ex.getCause(), owner);
        }

    }

    private synchronized Vector<ASMRepositoryItemBean> getWorkflowsFromRepository2Vector(String owner, String type, Long id) throws Exception {
        // get repository workflow item list from wfs...
        Hashtable hsh = new Hashtable();
        // hsh.put("url", bean.getWfsID());
        ServiceType st = InformationBase.getI().getService("wfs", "portal", hsh, new Vector());
        PortalWfsClient wfsClient = (PortalWfsClient) Class.forName(st.getClientObject()).newInstance();
        wfsClient.setServiceURL(st.getServiceUrl());
        wfsClient.setServiceID(st.getServiceID());
        //
        RepositoryWorkflowBean bean = new RepositoryWorkflowBean();

        bean.setId(id);
        bean.setUserID(owner);
        bean.setWorkflowType(type);
        Vector<RepositoryWorkflowBean> wfList = (Vector<RepositoryWorkflowBean>) wfsClient.getRepositoryItems(bean);

        if (wfList == null) {
            throw new ASM_UnknownErrorException();

        }
        Vector<ASMRepositoryItemBean> repitemlist = new Vector<ASMRepositoryItemBean>();
        for (int i = 0; i < wfList.size(); ++i) {
            RepositoryWorkflowBean rwbean = wfList.get(i);
            if (rwbean.getUserID().equals(owner)) {
                ASMRepositoryItemBean itembean = new ASMRepositoryItemBean();
                itembean.setExportText(rwbean.getExportText());
                itembean.setExportType(rwbean.getExportType());
                itembean.setId(rwbean.getId());
                itembean.setUserID(rwbean.getUserID());
                itembean.setItemID(rwbean.getWorkflowID());
                repitemlist.add(itembean);
            }
        }

        return repitemlist;
    }

    /**
     *
     * Gets list of the users who have exported anything to the repository
     *
     * @param type - type of the exported workflow
     * @return - vector of userIds - Developers of Workflows that have already
     * exported to the local repository
     * @throws Exception
     */
    public synchronized Vector<String> getWorkflowDevelopers(String type) throws Exception {
        // get repository workflow item list from wfs...
        Hashtable hsh = new Hashtable();

        ServiceType st = InformationBase.getI().getService("wfs", "portal", hsh, new Vector());
        PortalWfsClient wfsClient = (PortalWfsClient) Class.forName(st.getClientObject()).newInstance();
        wfsClient.setServiceURL(st.getServiceUrl());
        wfsClient.setServiceID(st.getServiceID());

        RepositoryWorkflowBean bean = new RepositoryWorkflowBean();
        Long id = new Long(0);
        bean.setId(id);

        bean.setWorkflowType(type);
        //
        Vector<RepositoryWorkflowBean> wfList = wfsClient.getRepositoryItems(bean);
        if (wfList == null) {
            throw new ASM_UnknownErrorException();

        }

        Vector<String> owners = new Vector<String>();
        for (int i = 0; i < wfList.size(); ++i) {
            String userId = wfList.get(i).getUserID();

            if (!owners.contains(new String(userId))) {
                owners.add(userId);
            }
        }

        return owners;
    }

    /**
     *
     * Gets the workflows of a specified user (uses portalchache)
     *
     *
     * @param userID - Id of the user
     * @return - vector of workflowData objects (workflows)
     * @throws ClassNotFoundException
     * @throws InstantiationException
     * @throws IllegalAccessException
     */
    public synchronized HashMap<String, ASMWorkflow> getWorkflows(String userID) throws ClassNotFoundException, InstantiationException, IllegalAccessException {
        HashMap<String, ASMWorkflow> tmpworkflows = new HashMap<String, ASMWorkflow>();
        Vector<WorkflowData> workflows = (Vector<WorkflowData>) Sorter.getInstance().sortFromValues(PortalCacheService.getInstance().getUser(userID).getWorkflows());
        for (int i = 0; i < workflows.size(); ++i) {
            if (workflows.get(i).getWorkflowID() != null
                    && !workflows.get(i).getWorkflowID().equals("null")) {
                ASMWorkflow inst = getRealASMWorkflow(userID, workflows.get(i).getWorkflowID());
                tmpworkflows.put(inst.getWorkflowName(), inst);
            }
        }
        return tmpworkflows;
    }

    private ASMWorkflow getRealASMWorkflow(String userID, String workflowName) {

        Vector<JobPropertyBean> joblist = ((Vector<JobPropertyBean>) getWorkflow(userID, workflowName));
        ASMWorkflow inst = new ASMWorkflow();
        Hashtable<String, ASMJob> jobs = new Hashtable<String, ASMJob>();

        for (int j = 0; j < joblist.size(); ++j) {

            String jobname = joblist.get(j).getName();

            // getting input ports
            Vector<PortDataBean> input_portlist = joblist.get(j).getInputs();
            Hashtable<String, String> input_ports = new Hashtable<String, String>();
            for (int k = 0; k < input_portlist.size(); ++k) {
                String portseq = Long.toString(input_portlist.get(k).getSeq());
                //String portname = input_portlist.get(k).getName();
                // changing port name to internal file name generated to be able to download
                String portname = (String) input_portlist.get(k).getData().get("intname");
                if (portname == null) {
                    portname = input_portlist.get(k).getName();
                }

                input_ports.put(portseq, portname);
            }
            //getting outupt ports
            Vector<PortDataBean> output_portlist = joblist.get(j).getOutputs();
            Hashtable<String, String> output_ports = new Hashtable<String, String>();
            for (int k = 0; k < output_portlist.size(); ++k) {
                String portseq = Long.toString(output_portlist.get(k).getSeq());
                // changing port name to internal file name generated to be able to download
                //String portname = output_portlist.get(k).getName();
                String portname = (String) output_portlist.get(k).getData().get("intname");
                if (portname == null) {
                    portname = output_portlist.get(k).getName();
                }
                output_ports.put(portseq, portname);
            }

            ASMJob asm_job = new ASMJob(jobname, input_ports, output_ports);
            jobs.put(jobname, asm_job);
        }

        inst.setJobs(jobs);
        inst.setWorkflowName(workflowName);
        inst.setSubmissionText(getSubmissionText(userID, workflowName));
        return inst;

    }
    
    /**
 * 
 * Returns the optional description added right before the workflow submission
 * 
 * @param userID - id of the user
 * @param workflowName - name of the workflow
 * @return - the note 
 */
    private String getSubmissionText(String userID, String workflowName){
        ConcurrentHashMap<String,WorkflowRunTime> runtimes = ((ConcurrentHashMap) PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName).getAllRuntimeInstance());
        
        if (runtimes.size() > 0) {

            Object firstID = runtimes.keySet().iterator().next();

            return runtimes.get(firstID).getText();

        }

        return null;
    }
    
    

    private Vector getWorkflow(String userID, String workflowName) {
        Vector v = null;
        try {
            ServiceType st = InformationBase.getI().getService("wfs", "portal", new Hashtable(), new Vector());
            PortalWfsClient pc = (PortalWfsClient) Class.forName(st.getClientObject()).newInstance();
            pc.setServiceURL(st.getServiceUrl());
            pc.setServiceID(st.getServiceID());
            ComDataBean commdata = new ComDataBean();
            String portalUrl = this.getPortalURL();
            commdata.setPortalID(portalUrl);
            commdata.setUserID(userID);
            commdata.setWorkflowID(workflowName);
            //                Vector v=pc.getWorkflowJobs(new PortalUserWorkflowBean(pUser,PORTAL, workflowID));
            v = pc.getWorkflowConfigData(commdata);

        } catch (ClassNotFoundException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (InstantiationException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        } catch (IllegalAccessException ex) {
            logger.trace(ex.getLocalizedMessage(), ex);
        }
        return v;
    }

    /**
     *
     * Gets the status of a specified workflow
     *
     * @param userId - Id of the user
     * @param workflowName - Name of the workflow
     * @return - InstanceStatusbean object that contains status and the actual
     * statuscolor
     */
    public synchronized WorkflowInstanceStatusBean getWorkflowStatus(String userId, String workflowName) {

        String statuscolor = "";
        String status = "";
        StatusConstants cons = new StatusConstants();
        Set instances = PortalCacheService.getInstance().getUser(userId).getWorkflow(workflowName).getAllRuntimeInstance().keySet();
        if (instances.size() > 0) {
            Enumeration insten = PortalCacheService.getInstance().getUser(userId).getWorkflow(workflowName).getAllRuntimeInstance().keys();
            String inst = (String) insten.nextElement();
            WorkflowRunTime wfruntime = (WorkflowRunTime) PortalCacheService.getInstance().getUser(userId).getWorkflow(workflowName).getAllRuntimeInstance().get(inst);
            status = cons.getStatus(Integer.toString(wfruntime.getStatus()));

        } else {
            status = cons.getStatus(cons.INIT);
        }

        StatusColorConstants colors = new StatusColorConstants();
        if (!status.equals("")) {
            statuscolor = colors.getColor(status);
        }
        logger.debug("Workflow status returned");
        return new WorkflowInstanceStatusBean(status, statuscolor);

    }

    /**
     * Gets the configuration of a specified workflow
     *
     * @param userID - ID of the user
     * @param workflowID - name of the workflow
     * @return Vector of JobProperyBeans
     * @throws java.lang.ClassNotFoundException no communication class
     * @throws java.lang.InstantiationException com.class could not be
     * initialized.
     * @throws java.lang.IllegalAccessException could not have access to
     * com.class
     */
    public ASMWorkflowConfiguration getWorkflowConfig(String userID, String workflowName) throws ClassNotFoundException, InstantiationException, IllegalAccessException {

        String portalUrl = this.getPortalURL();
        ComDataBean tmp = new ComDataBean();
        tmp.setPortalID(portalUrl);
        tmp.setUserID(userID);
        tmp.setWorkflowID(workflowName);

        Hashtable hsh = new Hashtable();

        ServiceType st = InformationBase.getI().getService("wfs", "portal", hsh, new Vector());
        PortalWfsClient pc = (PortalWfsClient) Class.forName(st.getClientObject()).newInstance();
        pc.setServiceURL(st.getServiceUrl());
        pc.setServiceID(st.getServiceID());

        ASMWorkflowConfiguration config = new ASMWorkflowConfiguration(pc.getWorkflowConfigData(tmp));
        logger.info("Workflow Configuration returned from WFS");
        return config;
    }

    /**
     * Saves workflow configuration
     *
     * @param userID - Id of the user
     * @param workflowID - Id of the workflow
     * @param configuration object that contains the configuration to be set
     * @throws java.lang.ClassNotFoundException no communication class
     * @throws java.lang.InstantiationException com.class could not be
     * initialized.
     * @throws java.lang.IllegalAccessException could not have access to
     * com.class
     */
    public void saveWorkflowConfig(String userID, String workflowName, ASMWorkflowConfiguration configuration) throws ClassNotFoundException, InstantiationException, IllegalAccessException {

        Hashtable hsh = new Hashtable();
        hsh.put("url", PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName).getWfsID());
        ServiceType st = InformationBase.getI().getService("wfs", "portal", hsh, new Vector());
        PortalWfsClient pc = (PortalWfsClient) Class.forName(st.getClientObject()).newInstance();
        pc.setServiceURL(st.getServiceUrl());
        pc.setServiceID(st.getServiceID());

        ComDataBean cmd = new ComDataBean();
        String portalUrl = this.getPortalURL();
        cmd.setPortalID(portalUrl);
        cmd.setUserID(userID);
        cmd.setWorkflowID(workflowName);
        //cmd.setTyp(4);

        pc.setWorkflowConfigData(cmd, configuration.getConfiguration());
        logger.info("Workflow Configuration is sent to WFS");
        /*
         ComDataBean cmd_get = new ComDataBean();
         cmd_get.setPortalID(PORTAL);
         cmd_get.setUserID(userID);
         cmd_get.setWorkflowID(workflowID);

         Vector get_jobs = pc.getWorkflowConfigData(cmd_get);

         */
    }

    private void cleanAllWorkflowInstances(String userID, String workflowName) throws ClassNotFoundException, InstantiationException, IllegalAccessException {

        WorkflowData workflow = PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName);

        StatusConstants cons = new StatusConstants();

        Enumeration hashKeys = workflow.getAllRuntimeInstance().keys();
        while (hashKeys.hasMoreElements()) {
            String key = (String) hashKeys.nextElement();
            WorkflowRunTime runtimeobj = (WorkflowRunTime) workflow.getAllRuntimeInstance().get(key);
            RealWorkflowUtils.getInstance().deleteWorkflowInstance(userID, workflowName, key);
        }
        logger.info("All workflow instances has been removed");
    }

    /**
     * Submits a workflow Instance
     *
     * @param userID Id of the user
     * @param workflowName - Name of the workflow
     * @throws java.lang.ClassNotFoundException no communication class
     * @throws java.lang.InstantiationException com.class could not be
     * initialized.
     * @throws java.lang.IllegalAccessException could not have access to
     * com.class
     */
    public void submit(String userID, String workflowName) throws ClassNotFoundException, InstantiationException, IllegalAccessException {
        // deleting old workflow instance
        try {
            cleanAllWorkflowInstances(userID, workflowName);
        } catch (Exception e) {
            e.printStackTrace();
        }

        ServiceType st = InformationBase.getI().getService("wfi", "portal", new Hashtable(), new Vector());
        PortalWfiClient pc = (PortalWfiClient) Class.forName(st.getClientObject()).newInstance();
        pc.setServiceURL(st.getServiceUrl());
        pc.setServiceID(st.getServiceID());

        WorkflowRuntimeBean bean = new WorkflowRuntimeBean();
        WorkflowData data = PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName);
        
        new WorkflowSubmitThread(PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName), userID, "text", "Never");
        logger.info("Workflow has been submitted");
    }

    /**
     * Submits a given workflow with a text of submission and notifies according
     * to the given string (@see NotificationTypeConstants)
     *
     * @param userID - user ID
     * @param workflowName - Name of the workflow
     * @param text - Note for the submission
     * @param notify - type of notification (@see NotificationTypeConstants)
     * @throws java.lang.ClassNotFoundException no communication class
     * @throws java.lang.InstantiationException com.class could not be
     * initialized.
     * @throws java.lang.IllegalAccessException could not have access to
     * com.class
     */
    public void submit(String userID, String workflowName, String text, String notify) throws ClassNotFoundException, InstantiationException, IllegalAccessException {
        // deleting old workflow instance
        try {
            cleanAllWorkflowInstances(userID, workflowName);
        } catch (Exception e) {
            logger.trace(e.getLocalizedMessage(), e);
        }

        ServiceType st = InformationBase.getI().getService("wfi", "portal", new Hashtable(), new Vector());
        PortalWfiClient pc = (PortalWfiClient) Class.forName(st.getClientObject()).newInstance();
        pc.setServiceURL(st.getServiceUrl());
        pc.setServiceID(st.getServiceID());

        WorkflowRuntimeBean bean = new WorkflowRuntimeBean();
        WorkflowData data = PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName);
        this.getASMWorkflow(userID, workflowName).setSubmissionText(text);
        new WorkflowSubmitThread(PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName), userID, text, notify);
        logger.info("Workflow has been submitted with notification");
    }

    /**
     * Rescues a workflow instance
     *
     * @param userID - Id of the user
     * @param workflowName - Name of the workflow
     *
     * @throws java.lang.ClassNotFoundException no communication class
     * @throws java.lang.InstantiationException com.class could not be
     * initialized.
     * @throws java.lang.IllegalAccessException could not have access to
     * com.class
     */
    public void rescue(String userID, String workflowName) throws ClassNotFoundException, InstantiationException, IllegalAccessException {
        Vector errorJobPidList = new Vector();
        String portalID = this.getPortalURL();
        String runtimeID = this.getRuntimeID(userID, workflowName);
        String wfStatus = "" + PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName).getRuntime(runtimeID).getStatus();
        if (("7".equals(wfStatus)) || ("28".equals(wfStatus)) || ("23".equals(wfStatus))) {
            //
            // 23 = running/error
            if ("23".equals(wfStatus)) {
                // entering of running workflow status
                PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName).getRuntime(runtimeID).setStatus(5);
            } else {
                // entering of resuming workflow status
                PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName).getRuntime(runtimeID).setStatus(29);
            }
            //
                /*ConcurrentHashMap tmp=PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName).getRuntime(runtimeID).getJobsStatus();
             Enumeration enm0=tmp.keys();
             String ts;
             while (enm0.hasMoreElements())
             {
             Object key0=enm0.nextElement();
             Enumeration enm1=((ConcurrentHashMap)tmp.get(key0)).keys();
             while(enm1.hasMoreElements())
             {
             Object key1=enm1.nextElement();
             ts=""+((JobStatusData)((ConcurrentHashMap)tmp.get(key0)).get(key1)).getStatus();
             if (ts.equals("25")||ts.equals("22")||ts.equals("21")||ts.equals("7")||ts.equals("15")||ts.equals("13")||ts.equals("12")) {
             // entering init status
             // PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowID).getRuntime(runtimeID).addJobbStatus((String)key0,(String)key1,"1","",-1);
             // clearing job from registry
             PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName).getRuntime(runtimeID).removeJobStatus((String) key0, (String) key1);
             // collecting jobID/jobPID for storage cleanup
             ComDataBean comDataBean = new ComDataBean();
             comDataBean.setJobID((String) key0);
             comDataBean.setJobPID((String) key1);
             errorJobPidList.addElement(comDataBean);
             }
             }
             }*/
            if (UserQuotaUtils.getInstance().userQuotaIsFull(userID)) {
                logger.info("Quota limit is exceeded");
                throw new ASMException();
            } else {
                new WorkflowRescueThread(portalID, userID, workflowName, runtimeID, wfStatus, errorJobPidList);
                logger.info("Workflow is rescued");
            }
        }
    }

    /**
     * Aborts all runtime instance related to the specificated workflow
     *
     * @param userID Id of the user
     * @param workflowName - Name of the workflow
     * @throws java.lang.ClassNotFoundException no communication class
     * @throws java.lang.InstantiationException com.class could not be
     * initialized.
     * @throws java.lang.IllegalAccessException could not have access to
     * com.class
     */
    public void abort(String userID, String workflowName) throws ClassNotFoundException, InstantiationException, IllegalAccessException {

        String runtimeID = this.getRuntimeID(userID, workflowName);
        try {
            if (PortalCacheService.getInstance().getUser(userID) != null) {
                if (PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName) != null) {
                    if (PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName).getRuntime(runtimeID) != null) {
                        String wfStatus = "" + PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName).getRuntime(runtimeID).getStatus();
                        if (("5".equals(wfStatus)) || ("23".equals(wfStatus)) || ("2".equals(wfStatus))) {
                            // PortalCacheService.getInstance().getUser(userID).getWorkflow(request.getParameter("workflow")).getRuntime(request.getParameter("rtid")).setStatus("22", 0);
                            // suspending workflow status beallitasa...
                            PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName).getRuntime(runtimeID).setStatus(28);
                            /*ConcurrentHashMap tmp=PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName).getRuntime(runtimeID).getJobsStatus();
                             Enumeration enm0=tmp.keys();
                             while(enm0.hasMoreElements())
                             {
                             Object key0=enm0.nextElement();
                             Enumeration enm1=((ConcurrentHashMap)tmp.get(key0)).keys();
                             while(enm1.hasMoreElements())
                             {
                             Object key1=enm1.nextElement();
                             // System.out.println("--"+key0+"/"+key1+"="+((JobStatusData)((Hashtable)tmp.get(key0)).get(key1)).getStatus());
                             String ts =""+ ((JobStatusData)((ConcurrentHashMap)tmp.get(key0)).get(key1)).getStatus();
                             if (!(ts.equals("6")||ts.equals("7")||ts.equals("21")||ts.equals("1"))) {
                             PortalCacheService.getInstance().getUser(userID).getWorkflow(workflowName).getRuntime(runtimeID).addJobbStatus((String) key0, (String) key1, "22", "", -1);
                             }
                             }
                             }*/
                            new WorkflowAbortThread(userID, workflowName, runtimeID);
                            logger.info("Workflow is aborted");
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.trace(e.getLocalizedMessage(), e);
        }
    }

    /**
     * Gets the workflow status
     *
     * @param userID - id of the user
     * @param workflowName - Name of the workflow
     * @throws java.lang.ClassNotFoundException no communication class
     * @throws java.lang.InstantiationException com.class could not be
     * initialized.
     * @throws java.lang.IllegalAccessException could not have access to
     * com.class
     */
    public String getStatus(String userID, String workflowName) throws ClassNotFoundException, InstantiationException, IllegalAccessException {

        ServiceType st = InformationBase.getI().getService("wfi", "portal", new Hashtable(), new Vector());
        PortalWfiClient pc = (PortalWfiClient) Class.forName(st.getClientObject()).newInstance();
        pc.setServiceURL(st.getServiceUrl());
        pc.setServiceID(st.getServiceID());

        Vector<WorkflowInformationBean> workflows_info = pc.getInformation();

        StatusConstants cons = new StatusConstants();
        WorkflowInformationBean wf_info = null;
        for (int i = 0; i < workflows_info.size(); ++i) {

            if (workflows_info.get(i).getWorkflowid().equals(new String(workflowName))) {
                wf_info = workflows_info.get(i);
            }

        }

        if (wf_info == null) {
            logger.trace("Workflow object from WFI is null");
            return new String("unknown_error");
        } else {

            return cons.getStatus(Integer.toString(wf_info.getStatus()));
        }

    }

}
