VanillaTilt.init(document.querySelectorAll('.container'), {
  max: 6,
  speed: 10,
});

var ws = null;
var cont1 = document.getElementById('c1');
var ct3 = document.getElementById('ct3');
var sentres = document.getElementById('sentiment-result');
var wesocket = async () => {
  const symblEndpoint = 'ws://127.0.0.1:8000/ws/audio_stream';

  ws = new WebSocket(symblEndpoint);

  // Fired when a message is received from the WebSocket server
  ws.onmessage = (event) => {
    console.log('Connection to Websocket initialised');
    const data = JSON.parse(event.data);
    var emotion = data.Result;

    if (emotion != null) sentres.innerHTML = 'Sentiment Predicted: ' + emotion;

    if (cont1.classList.length == 3) {
      cont1.classList.remove(cont1.classList[2]);
      cont1.classList.add(emotion);
    } else if (cont1.classList.length == 2) {
      cont1.classList.add(emotion);
    }
  };

  // Fired when the WebSocket closes unexpectedly due to an error or lost connetion
  ws.onerror = (err) => {
    console.error(err);
  };

  // Fired when the WebSocket connection has been closed
  ws.onclose = (event) => {
    console.info('Connection to websocket closed');
    if (cont1.classList.length == 3) {
      cont1.classList.remove(cont1.classList[2]);
    }
    sentres.innerHTML = '';
    ws.send(
      JSON.stringify({
        close: true,
      })
    );
  };

  // Fired when the connection succeeds.
  ws.onopen = (event) => {
    ws.send(
      JSON.stringify({
        connection_open: true,
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
};

document.getElementById('ppbutton').addEventListener('click', function () {
  var icon = document.getElementById('ppicon');
  var animation = document.getElementById('animationloader');

  if (this.classList.contains('active')) {
    this.classList.remove('active');
    icon.classList.remove('fa-pause');
    icon.classList.add('fa-play');
    animation.classList.remove('loader');
    if (ws != null) {
      ws.close();
    }
  } else {
    this.classList.add('active');
    icon.classList.remove('fa-play');
    icon.classList.add('fa-pause');
    animation.classList.add('loader');
    wesocket();
  }
});

function doupload() {
  let acceptedFiles = document.getElementById('file').files;
  ct3.innerText = 'Processing Files';
  const data = new FormData();
  for (const file of acceptedFiles) {
    data.append('files', file, file.name);
  }

  fetch('http://localhost:8000/api/wav_files/', {
    method: 'POST',
    body: data,
  })
    .then((response) => response.json())
    .then((data) => {
      ct3.innerText = 'Data Recieved';

      let text = 'Analysis: \n';
      for (const key in data) {
        text += key;
        text += ':   ';
        text += data[key]['mode'];
        text += '\n\n';
      }
      ct3.innerText = text;
    });

  // alert('your file has been uploaded');
  // location.reload();
}
