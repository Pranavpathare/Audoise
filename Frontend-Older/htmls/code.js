const symblEndpoint = "ws://127.0.0.1:8000/ws/continuous";

const ws = new WebSocket(symblEndpoint);

// Fired when a message is received from the WebSocket server
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};

// Fired when the WebSocket closes unexpectedly due to an error or lost connetion
ws.onerror = (err) => {
  console.error(err);
};

// Fired when the WebSocket connection has been closed
ws.onclose = (event) => {
  console.info("Connection to websocket closed");
};

// Fired when the connection succeeds.
ws.onopen = (event) => {
  ws.send(
    JSON.stringify({
      type: "start_request",
      meetingTitle: "Websockets How-to", // Conversation name
      insightTypes: ["question", "action_item"], // Will enable insight generation
      config: {
        confidenceThreshold: 0.5,
        languageCode: "en-US",
        speechRecognition: {
          encoding: "LINEAR16",
          sampleRateHertz: 44100,
        },
      },
      speaker: {
        userId: "example@symbl.ai",
        name: "Example Sample",
      },
    })
  );
};

const stream = await navigator.mediaDevices.getUserMedia({
  audio: true,
  video: false,
});

/**
 * The callback function which fires after a user gives the browser permission to use
 * the computer's microphone. Starts a recording session which sends the audio stream to
 * the WebSocket endpoint for processing.
 */
const handleSuccess = (stream) => {
  const AudioContext = window.AudioContext;
  const context = new AudioContext();
  const source = context.createMediaStreamSource(stream);
  const processor = context.createScriptProcessor(16384, 1, 1);
  const gainNode = context.createGain();
  source.connect(gainNode);
  gainNode.connect(processor);
  processor.connect(context.destination);
  processor.onaudioprocess = (e) => {
    // convert to 16-bit payload
    const inputData =
      e.inputBuffer.getChannelData(0) || new Float32Array(this.bufferSize);
    const targetBuffer = new Int16Array(inputData.length);
    for (let index = inputData.length; index > 0; index--) {
      targetBuffer[index] = 32767 * Math.min(1, inputData[index]);
    }
    // Send audio stream to websocket.
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(targetBuffer.buffer);
    }
  };
};

handleSuccess(stream);
