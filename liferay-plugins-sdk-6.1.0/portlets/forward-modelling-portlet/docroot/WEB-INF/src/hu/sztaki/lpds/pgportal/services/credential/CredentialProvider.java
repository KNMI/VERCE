package hu.sztaki.lpds.pgportal.services.credential;

import java.text.Format;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.io.*;

import hu.sztaki.lpds.pgportal.services.asm.ASMCredentialProvider;
import javax.jws.WebMethod;
import javax.jws.WebParam;
import javax.jws.WebService;

/**
 * @author krisztian karoczkai
 */
@WebService()
public class CredentialProvider {

    /**
     * Web service operation. Getting proxy as a byte array
     * @param pGroup user group
     * @param pUser user id
     * @param pMiddleware middleware name
     * @param pVo grid/vo/group name
     * @return user proxy
     * @throws Proxy does not exsists, file i/o error
     */
    @WebMethod(operationName = "get")
    public byte[] get(@WebParam(name = "pGroup")
    String pGroup, @WebParam(name = "pUser")
    String pUser, @WebParam(name = "pMiddleware")
    String pMiddleware, @WebParam(name = "pVo")
    String pVo) throws Exception {
    	try{
	        ASMCredentialProvider asmcred = new ASMCredentialProvider();
	        byte[] result = asmcred.get(pUser, pVo);
	        return result;
    	}
    	catch (Exception e)
    	{
    		/*Format formatter = new SimpleDateFormat("yyyyMMddHHmm");
    		String text = "Exception caught in CredentialProvider.java\n";
    		text += pUser+" "+pVo+" "+formatter.format(new Date())+"\n";
    		text += e.getMessage()+"\n";
    		text += e.getStackTrace()+"\n";
    		String fileName = "logs/credentialprovider/cp_errorfile_"+pUser+"_"+formatter.format(new Date())+".txt";
            
            Writer writer = null;
            try {
                writer = new BufferedWriter(new OutputStreamWriter(
                      new FileOutputStream(fileName), "utf-8"));
                writer.write(text);
            } catch (IOException ex) {
              // report
            } finally {
               try {writer.close();} catch (Exception ex) {}
            }
    		System.out.println("[CredentialProvider] He pillat l'excepci—!! "+pVo);*/
    		throw e;
    	}

    }

}

