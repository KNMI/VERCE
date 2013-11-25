/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package hu.sztaki.lpds.pgportal.net.webservices;

import javax.jws.WebService;

import hu.sztaki.lpds.information.com.ServiceType;
import hu.sztaki.lpds.information.local.InformationBase;
import hu.sztaki.lpds.pgportal.service.base.PortalCacheService;
import hu.sztaki.lpds.pgportal.service.base.data.WorkflowRunTime;
import hu.sztaki.lpds.wfs.com.ComDataBean;
import hu.sztaki.lpds.wfs.inf.PortalWfsClient;
import java.util.Hashtable;
import java.util.Vector;
import javax.jws.Oneway;
import javax.jws.WebMethod;
import javax.jws.WebParam;
import javax.jws.WebService;
/**
 *
 *
 */
@WebService()
public class WorkflowStatusHandlerService {


    /**
     * Web service operation
     */
    @WebMethod(operationName = "modify")
    @Oneway
    public void modify(@WebParam(name = "portalid")
    String portalid, @WebParam(name = "userid")
    String userid, @WebParam(name = "workflowname")
    String workflowname, @WebParam(name = "workflowruntimeid")
    String workflowruntimeid, @WebParam(name = "status")
    Integer status) {
        System.out.println(workflowname+"/"+workflowruntimeid+":"+status);
        WorkflowRunTime tmp=PortalCacheService.getInstance().getUser(userid).getWorkflow(workflowname).getRuntime(workflowruntimeid);
        System.out.println(tmp);
        if(tmp==null){
            try{
                Hashtable hsh=new Hashtable();
                ServiceType st=InformationBase.getI().getService("wfs", "portal", hsh, new Vector());
                PortalWfsClient pc=(PortalWfsClient)Class.forName(st.getClientObject()).newInstance();
                pc.setServiceURL(st.getServiceUrl());
                pc.setServiceID(st.getServiceID());
                ComDataBean cmd=pc.getWorkflowInstanceDesc(workflowruntimeid);
                PortalCacheService.getInstance().getUser(userid).getWorkflow(workflowname).addRuntimeID(workflowruntimeid, new WorkflowRunTime(cmd.getWfiURL(),"",cmd.getTxt(), status.toString()));
            }
            catch(Exception e)
            {
            	System.out.println("[WorkflowStatusHandlerService] Exception! This is an ignored Exception");
            }
        }
        else
        {
        	tmp.setStatus(status);
        	//System.out.println("[WorkflowStatusHandlerService] Alert!!!! This should update the status");
        }
    }


}
