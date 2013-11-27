/**
 * Copyright (c) 2000-2012 Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.verce.action;

import java.util.Map;

import hu.sztaki.lpds.pgportal.services.asm.ASMService;
import hu.sztaki.lpds.pgportal.services.asm.constants.RepositoryItemTypeConstants;

import com.liferay.portal.kernel.portlet.DefaultConfigurationAction;
import com.liferay.portal.kernel.portlet.LiferayPortletConfig;
import com.liferay.portal.kernel.servlet.SessionErrors;
import com.liferay.portal.kernel.servlet.SessionMessages;
import com.liferay.portal.kernel.util.Constants;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portal.kernel.util.PropertiesParamUtil;
import com.liferay.portal.kernel.util.UnicodeProperties;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.portal.security.permission.ActionKeys;
import com.liferay.portal.service.permission.PortletPermissionUtil;
import com.liferay.portal.theme.ThemeDisplay;
import com.liferay.portal.util.PortletKeys;
import com.liferay.portlet.PortletPreferencesFactoryUtil;
import com.liferay.portlet.documentlibrary.NoSuchFolderException;
import com.liferay.portlet.documentlibrary.model.DLFolderConstants;
import com.liferay.portlet.documentlibrary.service.DLAppLocalServiceUtil;
import com.liferay.portlet.PortletPreferencesFactoryUtil;

import javax.portlet.ActionRequest;
import javax.portlet.ActionResponse;
import javax.portlet.PortletConfig;
import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;
import javax.portlet.PortletPreferences;

public class ConfigurationActionImpl extends DefaultConfigurationAction {

	@Override
	public String render(
			PortletConfig portletConfig, RenderRequest renderRequest,
			RenderResponse renderResponse)
		throws Exception {

		PortletConfig selPortletConfig = getSelPortletConfig(renderRequest);

		String configTemplate = selPortletConfig.getInitParameter(
			"config-template");

		if (Validator.isNotNull(configTemplate)) {
			return configTemplate;
		}

		String configJSP = selPortletConfig.getInitParameter("config-jsp");

		if (Validator.isNotNull(configJSP)) {
			return configJSP;
		}

		return "/html/configuration.jsp";
	}
	
	@Override
	public void processAction(
			PortletConfig portletConfig, ActionRequest actionRequest,
			ActionResponse actionResponse)
		throws Exception {

		String cmd = ParamUtil.getString(actionRequest, "cmd");

		if (cmd.equals("update"))
		{
			ThemeDisplay themeDisplay = (ThemeDisplay)actionRequest.getAttribute(
				WebKeys.THEME_DISPLAY);
	
			UnicodeProperties properties = PropertiesParamUtil.getProperties(
				actionRequest, PREFERENCES_PREFIX);
	
			String portletResource = ParamUtil.getString(
				actionRequest, "portletResource");
	
			PortletPermissionUtil.check(
				themeDisplay.getPermissionChecker(), themeDisplay.getLayout(),
				portletResource, ActionKeys.CONFIGURATION);
	
			PortletPreferences portletPreferences =
				PortletPreferencesFactoryUtil.getPortletSetup(
					actionRequest, portletResource);
	
			for (Map.Entry<String, String> entry : properties.entrySet()) {
				String name = entry.getKey();
				String value = entry.getValue();
	
				portletPreferences.setValue(name, value);
			}
	
			Map<String, String[]> portletPreferencesMap =
				(Map<String, String[]>)actionRequest.getAttribute(
					WebKeys.PORTLET_PREFERENCES_MAP);
	
			if (portletPreferencesMap != null) {
				for (Map.Entry<String, String[]> entry :
						portletPreferencesMap.entrySet()) {
	
					String name = entry.getKey();
					String[] values = entry.getValue();
	
					portletPreferences.setValues(name, values);
				}
			}
	
			if (SessionErrors.isEmpty(actionRequest)) {
				portletPreferences.store();
	
				LiferayPortletConfig liferayPortletConfig =
					(LiferayPortletConfig)portletConfig;
	
				SessionMessages.add(
					actionRequest,
					liferayPortletConfig.getPortletId()+".refreshPortlet",
					portletResource);
	
				SessionMessages.add(
					actionRequest,
					liferayPortletConfig.getPortletId()+".updatedConfiguration");
			}
		}
	}	
}