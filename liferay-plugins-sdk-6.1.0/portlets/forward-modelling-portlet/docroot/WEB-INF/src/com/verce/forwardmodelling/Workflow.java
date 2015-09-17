package com.verce.forwardmodelling;

import org.json.*;

public class Workflow {
    String workflowName;
    String workflowId;
    String ownerId;

    public Workflow(String workflowName, String workflowId, String ownerId) {
        this.workflowName = workflowName;
        this.workflowId = workflowId;
        this.ownerId = ownerId;
    }

    public JSONObject toJSONObject() {
        return new JSONObject().put("workflowName", workflowName).put("workflowId", workflowId).put("ownerId", ownerId);
    }
}