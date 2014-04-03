var level = 1;

var colour = {
  orange: "#EEB211",
  darkblue: "#21526a",
  purple: "#941e5e",
  limegreen: "#c1d72e",
  darkgreen: "#619b45",
  lightblue: "#009fc3",
  pink: "#d11b67"
};

function dephtree(data, graph) {
  var node = graph.addNode(data["streams"][0]["id"], {
    label: data["_id"].substring(0, 5),
    'color': colour.orange,
    'shape': 'dot',
    'radius': 19,
    'alpha': 1
  });

  if (data["derivationIds"].length > 0 && typeof data["derivationIds"] != "undefined") {
    for (var i = 0; i < data["derivationIds"].length; i++) {
      if (data["derivationIds"][i]["wasDerivedFrom"]) {
        graph.addEdge(data["streams"][0]["id"], data["derivationIds"][i]["DerivedFromDatasetID"], "wasDerivedFrom");
        dephtree(data["derivationIds"][i]["wasDerivedFrom"], graph);
      }
    }
  }
};

function getMetadata(data, graph) {
  var node = graph.addNode(data["streams"][0]["id"] + "meata", {
    label: data["streams"][0]["id"]
  });
  graph.addEdge(node.name, data["streams"][0]["id"], {
    label: "wasGeneratedBy"
  });
  var params = graph.addNode(data["streams"][0]["id"] + "params", {
    label: JSON.stringify(data["parameters"])
  });
  graph.addEdge(params.name, data["streams"][0]["id"], {
    label: "wasGeneratedBy"
  });
};

function addBranch(url) {
  $.getJSON(url, function(data) {
    dephtree(data, sys);
  });
};

function addMeta(url) {
  $.getJSON(url, function(data) {
    getMetadata(data, sys)
  });
};

var sys = arbor.ParticleSystem(40, 10, 1.0);
sys.parameters({
  stiffness: 100,
  gravity: true,
  dt: 0.015
})
sys.renderer = Renderer("#viewport");

$(viewport).bind('contextmenu', function(e) {
  var pos = $(this).offset();
  var p = {
    x: e.pageX - pos.left,
    y: e.pageY - pos.top
  }
  selected = nearest = dragged = sys.nearest(p);

  if (selected.node !== null) {
    // dragged.node.tempMass = 10000
    dragged.node.fixed = true;
    addMeta('/j2ep-1.0/prov/streamchunk/?runid=http%3A%2F%2Flocalhost%3A8080%2FDispelGateway%2Fservices%2Fprocess-6bd8e593-0847-443e-a842-e69635c2c2c6&id=' + selected.node.name)
  }
  return false;
});

$(viewport).bind('dblclick', function(e) {
  var pos = $(this).offset();
  var p = {
    x: e.pageX - pos.left,
    y: e.pageY - pos.top
  }
  selected = nearest = dragged = sys.nearest(p);

  if (selected.node !== null) {
    // dragged.node.tempMass = 10000
    dragged.node.fixed = true;
    addBranch('/j2ep-1.0/prov/trace/' + selected.node.name + "?level=" + level, sys)
  }
  return false;
});

addBranch('/j2ep-1.0/prov/trace/orfeus-wifi.local-bb7d22f0-e0d5-11e2-ab15-34159e074480?level=' + level);