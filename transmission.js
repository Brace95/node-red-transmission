module.export = function (RED) {

  "use strict";

  // Setup TransmissionAPI Node
  function TransmissionAPINode (n) {
    RED.nodes.createNode(this, n);
    var node = this;

    // Check input and create TransmissionAPI node
    if (this.credentials && this.credentials.hostname) {
      this.Transmission = require("transmission");
      this.TransmissionAPI = new this.Transmission({
        host: this.credentials.host,
        port: this.credentials.port,
        username: this.credentials.username,
        password: this.credentials.password
      });

      node.log( "Reauthenticating Transmission API with " + this.credentials.hostname);
    }
  }

  RED.nodes.registerType("transmission-config", TransmissionAPINode, {
    credentials: {
      host: {type:"text"},
      port: {type:"text"},
      username: {type:"text"},
      password: {type:"text"}
    }
  });

  // Start all torrents
  function startAllTorrents (n) {
    RED.nodes.createNode(this, n);
    this.config = RED.node.getNode(n.config);
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
