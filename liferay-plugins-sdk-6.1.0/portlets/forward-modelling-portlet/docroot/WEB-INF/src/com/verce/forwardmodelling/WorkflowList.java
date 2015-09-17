package com.verce.forwardmodelling;

import org.json.*;
import java.util.ArrayList;
import com.verce.forwardmodelling.Workflow;

public class WorkflowList extends ArrayList<Workflow> {
    public JSONArray toJSONArray() {
        JSONArray array = new JSONArray();
        for (Workflow workflow : this.toArray(new Workflow[10])) {
            if (workflow == null) {
                break;
            }
            array.put(workflow.toJSONObject());
        }
        return array;
    }
}