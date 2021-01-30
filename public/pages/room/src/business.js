class Business {
  constructor({ room, media, view, socketBuilder, peerBuilder }) {
    this.room = room;
    this.media = media;
    this.view = view;

    this.socketBuilder = socketBuilder;
    this.peerBuilder = peerBuilder;

    this.socket = {};
    this.currentStream = {};
    this.currentPeer = {};

    this.peers = new Map();
    this.usersRecording = new Map();
  }

  static initialize(deps) {
    const instance = new Business(deps);
    return instance._init();
  }

  async _init() {
    this.currentStream = await this.media.getCamera();

    this.view.configureRecordButton(this.onRecordPress.bind(this));
    this.view.configureLeaveButton(this.onLeavePress.bind(this));

    this.socket = this.socketBuilder
      .setOnUserConnected(this.onUserConnected())
      .setOnUserDisconnected(this.onUserDisconnected())
      .build();

    this.currentPeer = await this.peerBuilder
      .setOnError(this.onPeerError())
      .setOnConnectionOpened(this.onPeerConnectionOpened())
      .setOnCallReceived(this.onPeerCallReceived())
      .setOnPeerStreamReceived(this.onPeerStreamReceived())
      .setOnCallError(this.onPeerCallError())
      .setOnCallClose(this.onPeerCallClose())
      .build();

    this.addVideoStream(this.currentPeer.id);
  }

  addVideoStream(userId, stream = this.currentStream) {
    const recorderInstance = new Recorder(userId, stream);
    this.usersRecording.set(recorderInstance.filename, recorderInstance);

    if (this.recordingEnabled) {
      recorderInstance.startRecording();
    }

    const isCurrentId = userId === this.currentPeer.id;
    this.view.renderVideo({
      userId,
      muted: true,
      stream,
      isCurrentId,
    });
  }

  onUserConnected() {
    return (userId) => {
      console.log("user connected!", userId);
      this.currentPeer.call(userId, this.currentStream);
    };
  }

  onUserDisconnected() {
    return (userId) => {
      console.log("user disconnected!", userId);

      if (this.peers.has(userId)) {
        this.peers.get(userId).call.close();
        this.peers.delete(userId);
      }

      this.view.setParticipants(this.peers.size);
      this.stopRecording(userId);
      this.view.removeVideoElement(userId);
    };
  }

  onPeerError() {
    return (error) => {
      console.error("error on peer!", error);
    };
  }

  onPeerConnectionOpened() {
    return (peer) => {
      const id = peer.id;
      console.log("peer!!", peer);
      this.socket.emit("join-room", this.room, id);
    };
  }

  onPeerCallReceived() {
    return (call) => {
      console.log("answering call", call);
      call.answer(this.currentStream);
    };
  }

  onPeerStreamReceived() {
    return (call, stream) => {
      const callerId = call.peer;

      if(this.peers.has(callerId)) {
        console.log('calling twice, ignoring second call...', callerId)
        return;
      }

      this.addVideoStream(callerId, stream);

      this.peers.set(callerId, { call });

      this.view.setParticipants(this.peers.size);
    };
  }

  onPeerCallError() {
    return (call, error) => {
      console.log("an call error ocurred", error);
      call.answer(this.currentStream);
      this.view.removeVideoElement(call.peer);
    };
  }

  onPeerCallClose() {
    return (call) => {
      console.log("an call closed", call.peer);
    };
  }

  onRecordPress(recordingEnabled) {
    this.recordingEnabled = recordingEnabled;
    console.log("botão pressionado", recordingEnabled);

    for (const [key, value] of this.usersRecording) {
      if (this.recordingEnabled) {
        value.startRecording();
        continue;
      }

      this.stopRecording(key);
    }
  }

  // se um cliente precisa parar e sair da call
  //precisamos parar as gravações anteriores
  async stopRecording(userId) {
    const usersRecordings = this.usersRecording;

    for (const [key, value] of usersRecordings) {
      const isContextUser = key.includes(userId);

      if (!isContextUser) continue;

      const rec = value;
      const isRecordingActive = rec.recordingActive;

      if (!isRecordingActive) continue;

      await rec.stopRecording();
      this.playRecording(key);
    }
  }

  playRecording(userId) {
    const user = this.usersRecording.get(userId);
    const videoURLs = user.getAllVideosURLs();

    videoURLs.map((url) => this.view.renderVideo({ url, userId }));
  }

  onLeavePress() {
    this.usersRecording.forEach((value, key) => value.download())
  }
}
