package hu.sztaki.lpds.pgportal.services.credential;

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
        ASMCredentialProvider asmcred = new ASMCredentialProvider();
        return asmcred.get(pUser, pVo);

    }

}

