module.export = function (RED) {

  "use strict";

  // Setup TransmissionAPI Node
  function transmissionAPINode (n) {
    RED.nodes.createNode(this, n);

    // Check input and create TransmissionAPI node
    if (n && n.host && n.port) {
      this.Transmission = require("transmission");
      this.TransmissionAPI = new this.Transmission({
        host: n.host,
        port: n.port,
        username: n.user,
        password: n.pass
      });
    }
  }

  RED.nodes.registerType("transmission-config", transmissionAPINode);

  // Start all torrents
  function startAllTorrents (n) {
    RED.nodes.createNode(this, n);
    this.config = RED.node.getNode(n.config);
    var node = this;

    var TransmissionAPI = node.config ? node.config.TransmissionAPI : null;

    //  Check for Transmission API Config
    if (!TransmissionAPI) {
      node.warn("Missing Transmission credentials");
      node.status({fill:"red", shape:"ring", text:"Missing Transmission credentials"});
      return;
    }

    node.on('input', function (msg) {
      TransmissionAPI.get(function (err, result) {
        if (err) {
          msg.payload = err;
        } else {
          result.torrents.forEach(function (torrent) {
            TransmissionAPI.start(torrent.id, function (err, result) {});
          });
          msg.payload = "All Torrents Started";
        }
      });
      node.send(msg);
    });
  }

  RED.nodes.registerType("Start all Torrents", startAllTorrents);

}
