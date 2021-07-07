var wslink = 'ws://65.0.102.229:5000/ws/audio_stream';
var filelink = 'http://65.0.102.229:5000/api/wav_files/';

$(function () {
  // MENU
  $('.navbar-collapse a').on('click', function () {
    $('.navbar-collapse').collapse('hide');
  });

  // AOS ANIMATION
  AOS.init({
    disable: 'mobile',
    duration: 800,
    anchorPlacement: 'center-bottom',
  });

  // SMOOTHSCROLL NAVBAR
  $(function () {
    $('.navbar a, .hero-text a').on('click', function (event) {
      var $anchor = $(this);
      $('html, body')
        .stop()
        .animate(
          {
            scrollTop: $($anchor.attr('href')).offset().top - 49,
          },
          1000
        );
      event.preventDefault();
    });
  });
});

var ws = null;
var resultfile = document.getElementById('resultfile');
var result = document.getElementById('result');

var wesocket = async () => {
  const symblEndpoint = wslink;

  ws = new WebSocket(symblEndpoint);

  // Fired when a message is received from the WebSocket server
  ws.onmessage = (event) => {
    console.log('Connection to Websocket initialised');
    const data = JSON.parse(event.data);
    var emotion = data.Result;
    console.log(emotion);

    if (emotion != null) result.innerHTML = emotion;

    if (result.classList.length == 2) {
      result.classList.remove(result.classList[1]);
      result.classList.add(emotion);
    } else if (result.classList.length == 1) {
      result.classList.add(emotion);
    }
  };

  // Fired when the WebSocket closes unexpectedly due to an error or lost connetion
  ws.onerror = (err) => {
    console.error(err);
  };

  // Fired when the WebSocket connection has been closed
  ws.onclose = (event) => {
    console.info('Connection to websocket closed');
    if (result.classList.length == 2) {
      result.classList.remove(result.classList[1]);
    }
    result.innerHTML = 'Please Click Play';
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

  if (this.classList.contains('active')) {
    this.classList.remove('active');
    icon.classList.remove('fa-pause');
    icon.classList.add('fa-play');
    if (ws != null) {
      ws.close();
    }
    location.reload();
  } else {
    this.classList.add('active');
    icon.classList.remove('fa-play');
    icon.classList.add('fa-pause');
    wesocket();
  }
});

function doupload() {
  let acceptedFiles = document.getElementById('file').files;
  resultfile.innerText = 'Processing Files';
  const data = new FormData();
  for (const file of acceptedFiles) {
    data.append('files', file, file.name);
  }

  fetch(filelink, {
    method: 'POST',
    body: data,
  })
    .then((response) => response.json())
    .then((data) => {
      resultfile.innerText = 'Data Recieved';
      resultfile.classList.add('active');
      let text = '';
      for (const key in data) {
        text += key;
        text += ': ';
        text += data[key]['mode'];
        text += '\n\n';
      }
      resultfile.innerText = text;
    });
}
