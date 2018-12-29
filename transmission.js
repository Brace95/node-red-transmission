module.export = function (RED) {

  "use strict";

  // Setup TransmissionAPI Node
  function TransmissionAPINode (n) {
    RED.nodes.createNode(this, n);
    var node = this;

    // Check input and create TransmissionAPI node
    if (this.cred && this.cred.hostname) {
      this.Transmission = require("transmission");
      this.TransmissionAPI = new this.Transmission({
        host: this.cred.hostname || "127.0.0.1",
        port: this.cred.port || 9091,
        username: this.cred.username || "",
        password: this.cred.password || ""
      });

      node.log( "Reauthenticating Transmission API with " + this.cred.hostname);
    }
  }

  RED.nodes.registerType("transmission-config", TransmissionAPINode, {
    cred: {
      hostname: { type:"text" },
      port: { type:"text" },
      username: { type:"text" },
      password: { type:"text" }
    }
  });

  function startAllTorrents (config) {
    RED.nodes.createNode(this, config);
    let node = this;
    var TransmissionAPI = this.config ? this.config.TransmissionAPI : null;

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

  RED.nodes.registerType("start-all-torrent", startAllTorrents);

}
