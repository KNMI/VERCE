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

public class EventsFiltered {

	/**
	 * This method takes as input a event File (which is an xml file containing all events shown to the user on the evetnts tab) and
	 * a solverFile (which is a json file containing a list of codes of events selected by the user). 
	 * It returns as an output an xml file with selected events only
	 **/
	public static File filterSelectedEvents(File eventsFile, File solverFile)
	{

		try { 
			// a list of codes of selected events
			List<String> selectedEvents =FileHelper.getKeyValues(solverFile,"events"); 

			// parse the eventsFile as an XML document
			Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(eventsFile);

			// a list of event nodes 
			NodeList events = doc.getElementsByTagName("event"); 
			int eventsCount=0;
			for(int i = 0; i < events.getLength(); i++) 
			{ 
				Element event = (Element)events.item(i); 						
				String eventId=events.item(i).getAttributes().getNamedItem("publicID").getNodeValue();
				// only consider networks in the selectedNetwork list
				if(selectedEvents.contains(eventId)) 
				{ 						
					eventsCount++;
				}
				// remove event nodes not in the selectedEvent list
				else
				{
					events.item(i).getParentNode().removeChild(events.item(i)); 
					i--; //update the pointer
				}
			}
			// if no events added then no need to progress further 
			if(eventsCount==0) return null; 
			//  convert the output into a string and save it into the temp file stationsFiltered				
			File eventsFiltered = FileUtil.createTempFile(); 
			return FileHelper.writeToFile(FileHelper.xmlDocToString(doc), eventsFiltered);

		} catch (Exception e) {
			System.out.println("[EventsFiltered.filterSelectedEvents] Error: " + e.getStackTrace());
			return null;
		} 
	}		

}
