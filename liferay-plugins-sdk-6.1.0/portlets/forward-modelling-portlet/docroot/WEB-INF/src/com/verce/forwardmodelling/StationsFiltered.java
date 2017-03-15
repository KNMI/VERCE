package com.verce.forwardmodelling;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.StringWriter;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.json.*;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.liferay.portal.kernel.util.FileUtil;

import org.apache.xalan.xsltc.trax.TransformerFactoryImpl;

public class StationsFiltered {

	   /**
	    * This method takes as input a stationFile (which is an xml file containing all stations shown to the user on the station tab) and
	    * a solverFile (which is a json file containing a list of codes of stations selected by the user). 
	    * It returns as an output an xml file with selected stations only
	   **/
	   public static File filterSelectedStations(File stationsFile, File solverFile)
		{
		   
			try { 
				// a list of codes of selected stations. The code is a concatenation of network and station code  
				List<String> selectedStations =StationsFiltered.getSelectedStations(solverFile);
				// a list of dates of selected events. 
				List<String> selectedEventsDate =StationsFiltered.getSelectedEventsDate(solverFile);
				
				// parse the stationsFile as an XML document
				Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(stationsFile);
				// add selected network codes to the set selectedNetworks. This is used later to help with removing any network nodes not in this set 
				Set <String> selectedNetworks = new HashSet<String>(); 
				for(String code : selectedStations)
				{
					// each code in the selectedStations list is made up of a combination of network code and station code. The first part contains the network code
					String networkCode=code.split("\\.")[0];
					if(!networkCode.isEmpty())					
						selectedNetworks.add(networkCode);
				}
				// to count the number of stations not removed
				int stationsCount=0;
				// This contain a list of network nodes 
				NodeList networks = doc.getElementsByTagName("Network"); 
				// Stations node is a child of network node. So we iterate through each network first before we can get to stations node.
				for(int i = 0; i < networks.getLength(); i++) 
				{ 
					Element network = (Element)networks.item(i); 						
					String networkCode=networks.item(i).getAttributes().getNamedItem("code").getNodeValue();
					// only consider networks in the selectedNetwork list
					if(selectedNetworks.contains(networkCode)) 
					{
						NodeList stations= network.getElementsByTagName("Station");  
						// iterate through stations to remove those not in the selection list
						for (int j = 0; j < stations.getLength(); j++) {  
							NamedNodeMap station = stations.item(j).getAttributes();
							String stationCode=station.getNamedItem("code").getNodeValue();
							String startDate=station.getNamedItem("startDate").getNodeValue();
							String endDate=station.getNamedItem("endDate").getNodeValue();
							String code=networkCode+"."+stationCode;
							// remove station nodes not in the selectedStations list or if their start/end date do not correspond to the date of any of the selected events
							if (!selectedStations.contains(code) || !isStationDateRelateToEventDates(startDate, endDate, selectedEventsDate)){
								stations.item(j).getParentNode().removeChild(stations.item(j)); 
								j--; // re-position the pointer  
							}
							else
							{
								stationsCount++;
							}
						} 
					}
					// remove network nodes not in the selectedNetwork list and update the pointer
					else
					{
						networks.item(i).getParentNode().removeChild(networks.item(i)); 
						i--;
					}
				}
				// if no stations added then no need to progress further 
				if(stationsCount==0) return null; 
				//  convert the output into a string and save it into the temp file stationsFiltered				
				File stationsFiltered = FileUtil.createTempFile(); 
				return writeToFile(xmlDocToString(doc), stationsFiltered);
				
			} catch (Exception e) {
				System.out.println("[StationsFiltered.filterSelectedStations] Error: " + e.getStackTrace());
				return null;
			} 
		}
		// returns a list codes corresponding to the selected stations retrieved from the solverconf json file
	   private static List<String> getSelectedStations(File solverConf) {
			 ArrayList<String> data = new ArrayList<String>();  
			 String contents = getFileContents(solverConf);
			 JSONObject jsnobject = new JSONObject(contents);
			 JSONArray jsonArray = jsnobject.getJSONArray("stations");
			 if (jsonArray != null) {  
				 for (int i=0;i<jsonArray.length();i++){ 
					 data.add(jsonArray.get(i).toString());
				 } 
			 }
		  
			 return data;
		 }
	   // returns a list of dates for all selected events retrieved from the solverconf json file
	   private static List<String> getSelectedEventsDate(File solverconf) {
			 ArrayList<String> eventsDate = new ArrayList<String>(); 
			 String contents = getFileContents(solverconf);
			JSONObject jsnobject = new JSONObject(contents);
			JSONArray jsonArray = jsnobject.getJSONArray("eventsDate");
			if (jsonArray != null) {  
			    for (int i=0;i<jsonArray.length();i++){ 
			    	eventsDate.add(jsonArray.get(i).toString());
			    } 
			 }
			 return eventsDate;
		 }
	   // returns true if the date of any of the selected events is within the range of station start and end dates
	   private static boolean isStationDateRelateToEventDates(String stationStartDate, String stationEndDate, List<String> eventsDate) 
		{ 
			DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
			for(String date : eventsDate)
			{
				
				try {
					Date eventDate = dateFormat.parse(date.toString().split("T")[0]);
					Date startDate = dateFormat.parse(stationStartDate.toString().split("T")[0]);
					Date endDate = dateFormat.parse(stationEndDate.toString().split("T")[0]); 
					if((startDate.before(eventDate) || startDate.compareTo(eventDate)==0) && (endDate.after(eventDate)|| startDate.compareTo(eventDate)==0)) 
					{ 
						return true;
					
					}
				} catch (ParseException e) {
					System.out.println("[StationsFiltered.isStationDateRelateToEventDates] Error: " + e.getStackTrace());
				}
			}
			return false;
		}
		 // takes a file as input and returns its contents as string
	   private static String getFileContents(File file)
			{ 
				String contents="";
				FileInputStream fis = null;
				try {
					fis = new FileInputStream(file);
					int oneByte;
				 
					while ((oneByte = fis.read()) != -1) {
						contents+=(char) oneByte;
					}
				} catch (Exception e) {
					System.out.println("[StationsFiltered.getFileContents] Error: " + e.getStackTrace());
				}
				return contents;
				
			}
		// converts an xml document into a string output 
		private static String xmlDocToString(Document xmlDoc)
		{
			String output="";
			try {
				TransformerFactory tfactory = new TransformerFactoryImpl();
				Transformer transformer = tfactory.newTransformer();
				transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
				StringWriter writer = new StringWriter();
				transformer.transform(new DOMSource(xmlDoc), new StreamResult(writer));
				output = writer.getBuffer().toString().replaceAll("\n", "");  
			 
			} catch (Exception e) {
				System.out.println("[StationsFiltered.xmlDocToString] Error: " + e.getStackTrace());
	       }
			return output;
		}
		// writes the string output into a file 
		private static File writeToFile(String output, File file) 
		{
			try
			{
				FileWriter fileWriter = new FileWriter(file);
				fileWriter.write(output); 
				fileWriter.flush();
				fileWriter.close();
			}
			catch (IOException e) {
				System.out.println("[StationsFiltered.writeToFile] Error: " + e.getStackTrace());
			}
			return file;
			
		} 

}
