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

public class FileHelper {


	// takes a json file and a key as input and then returns as a list the values of the given key
	public static List<String> getKeyValues(File file, String key) {
		ArrayList<String> data = new ArrayList<String>();  
		String contents = getFileContents(file);
		JSONObject jsnobject = new JSONObject(contents);
		JSONArray jsonArray = jsnobject.getJSONArray(key);
		if (jsonArray != null) {  
			for (int i=0;i<jsonArray.length();i++){ 
				data.add(jsonArray.get(i).toString());
			} 
		}

		return data;
	} 
	// takes a file as input and returns its contents as string
	public static String getFileContents(File file)
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
			System.out.println("[FileHelper.getFileContents] Error: " + e.getStackTrace());
		}
		return contents;

	}
	// converts an xml document into a string output 
	public static String xmlDocToString(Document xmlDoc)
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
			System.out.println("[FileHelper.xmlDocToString] Error: " + e.getStackTrace());
		}
		return output;
	}
	// writes the string output into a file 
	public static File writeToFile(String output, File file) 
	{
		try
		{
			FileWriter fileWriter = new FileWriter(file);
			fileWriter.write(output); 
			fileWriter.flush();
			fileWriter.close();
		}
		catch (IOException e) {
			System.out.println("[FileHelper.writeToFile] Error: " + e.getStackTrace());
		}
		return file;

	} 


}
