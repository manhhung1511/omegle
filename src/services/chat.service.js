class SocketServices {
  async connection(socket) {
      __sockets.push(socket);
      const allSockets = await __io.allSockets();
      __io.emit("numberOfOnline", allSockets.size);

      socket.on("start", (id) => {
        // console.log(id);
        __sockets.filter((s) => {
          if (s.id === id) {
            __searching.push(s);
            return;
          } else {
            return s;
          }
        });

        let i = 0;
        while (i < __searching.length) {
          const peer = __searching[i];
          if (peer.id !== id) {
            __searching = __searching.filter((s) => s.id !== peer.id);
            __searching = __searching.filter((s) => s.id !== id);
            __notAvailable.push(socket, peer);

            const socketRoomToLeave = [...socket.rooms][1];
            const peerRoomToLeave = [...peer.rooms][1];

            socket.leave(socketRoomToLeave);
            peer.leave(peerRoomToLeave);

            const roomName = `${id}#${peer.id}`;
            socket.join(roomName);
            peer.join(roomName);
            __io
              .of("/")
              .to(roomName)
              .emit("chatStart", "You are now chatting with a random stranger");

            break;
          }

          socket.emit("searching", "Searching . . . ");
          i++;
        }
        });

      socket.on("newMessageToServer", (msg) => {
        // get room
        const roomName = [...socket.rooms][1];
         __io.of("/").to(roomName).emit("newMessageToClient", { id: socket.id, msg });
      });

      socket.on("typing",(msg) => {
        const roomName = [...socket.rooms][1];
        const ids = roomName.split("#");
        const peerId = ids[0] === socket.id ? ids[1] : ids[0];
        const peer = __notAvailable.find((user) => user.id === peerId);
        peer.emit("strangerIsTyping", msg);
      });

      socket.on("doneTyping",() => {
        const roomName = [...socket.rooms][1];
        const ids = roomName.split("#");
        const peerId = ids[0] === socket.id ? ids[1] : ids[0];
        const peer = __notAvailable.find((user) => user.id === peerId);

        peer.emit("strangerIsDoneTyping");
      }); 

      socket.on("stop", () => {
        const roomName = [...socket.rooms][1];

        const ids = roomName.split("#");

        const peerId = ids[0] === socket.id ? ids[1] : ids[0];

        const peer = __notAvailable.find((user) => user.id === peerId);

        peer.leave(roomName);
        socket.leave(roomName);

        peer.emit("strangerDisconnected", "Stranger has disconnected");

        socket.emit("endChat", "You have disconnected");

        __notAvailable = __notAvailable.filter((user) => user.id !== socket.id);
        __notAvailable = __notAvailable.filter((user) => user.id !== peer.id);

        __sockets.push(socket, peer);
      });

      socket.on("disconnecting", () => {
        const roomName = [...socket.rooms][1];

        if(roomName) {
          __io.of("/").to(roomName).emit("goodBye", "Stranger has disconnected");
          const ids = roomName.split("#");
          const peerId = ids[0] === socket.id ? ids[1] : ids[0];
          const peer = __notAvailable.find((user) => user.id === peerId);
          peer.leave(roomName);
          __notAvailable = __notAvailable.filter((user) => user.id === peerId);
          __sockets.push(peer);
        }
        __sockets = __sockets.filter((user) => user.id !== socket.id);
        __searching = __searching.filter((user) => user.id !== socket.id);
        __notAvailable = __notAvailable.filter((user) => user.id !== socket.id);
      });

      socket.on("disconnect", async () => {
        const allSockets = await __io.allSockets();
    
        __io.emit("numberOfOnline", allSockets.size);
      });
  }
}

module.exports = new SocketServices();


