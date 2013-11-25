<%@ include file="init.jsp" %>
<h2>Result dataset</h2>

<p>
Note that the result data stream can only be read once and the data source
is destroyed after reading the results.
</p>

<hr/>
<%
DataSourceResource dataSource = null;
try
{
    dataSource = getDataSource(request.getParameter("results"));
    //System.out.println("[display-results.jsp] " + request.getParameter("results"));
    DataStreamData dataStream;
    do
    {
        dataStream = dataSource.getDataValues(100);
        out.print("<pre>");
        out.print(printData(dataStream.getDataValues()));
        out.print("</pre>");
    }
    while (dataStream.getStreamStatus().equals(DataStreamStatus.OPEN));
    if (dataStream.getStreamStatus().equals(DataStreamStatus.CLOSED_DUE_TO_ERROR))
    {
        out.print("<p>Data stream closed due to error</p>");
    }
    out.print("\n<hr/>");
}
catch (Exception e)
{
   //System.out.println("[display-results.jsp] Ha petat");
   out.print("<p>There was an error reading the results.</p>");
   out.print(e.getClass().getName() + ": " + e.getMessage());
}
finally
{
    try
    {
        if (dataSource != null)
        {
            dataSource.destroy();
        }
    }
    catch (Throwable e)
    {
        // we're ignoring this one
    }
}
%>
<br><br>
<input type=button value='Back' onClick='javascript:history.back();'>
<input type=button value='Home' onClick='goto2("<%= homeURL.toString() %>");'>

<%!
public DataSourceResource getDataSource(String url) throws Exception
{
    JerseyServer server = new JerseyServer();
   // System.out.println("[display-results.jsp] getDataSource");
    return server.getDataSourceResource(new URL(url));
}

public String printData(DataValue[] data)
{
    StringBuilder result = new StringBuilder();
    for (int i = 0; i < data.length; i++)
    {
        DataValue value = data[i];
        result.append(value);
        if (!(value instanceof StringData) && !(value instanceof CharData))
        {
            result.append("\n");
        }
    }
    //System.out.println("[display-results.jsp] printData");
    return XML.replaceSpecialCharacters(result.toString());
}
%>

