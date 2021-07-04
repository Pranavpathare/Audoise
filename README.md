# Audoise: Audio Sentiment Analysis

==============================

Repository of Multilingual Audio Emotion Recognition Project.

Description:

- 74% accuracy score on Audio Sentiment Classification into categories of Happy, Sad, Disgusted, Fearful, Surprised, Angry and Neutral.
- Speech-Language Independent Classifier.
- High accuracy even for noisy environments.
- Processing Time taken : Approx one-tenth of audio file duration in seconds
- Only supports wav files for now

---

## Getting Started

Clone this whole repo: `git clone https://github.com/Pranavpathare/Audoise.git`

Start the Backend Server

- `cd audoise/Backend/app`
- Install the required Packages: `pip install -r requirements.txt`
- Start server: `uvicorn main:app`

Start Frontend

- `cd frontend`
- open `index.html` in your browser

---

## Working

### Backend

Backend is developed using FASTAPI: FastAPI is a modern, fast (high-performance), web framework for building APIs with Python 3.6+ based on standard Python type hints.

WebSocket for Audio Streaming from Microphone

- Realtime WebSocket converts Microphone data into binary stream.
- Stream is converted back into wav at server into .wav chunks of length 6-7 seconds.
- Prediction by Model is Returned in Real Time.

Deep Learning Model

- Long audio samples are split into Smaller audio samples (len < 1 min)
- 80 MFCC Features are extracted from each audio clip.
- These are fed to a 1D CNN with 3 Convolutional Layers which predicts emotion.
- Final Accuracy : 78.8 %

Tech Stack

- Backend Server: FastAPI (Async) for both Sockets and REST File Transfer.
- Backend Model: Tensorflow, Librosa for Audio Feature Extraction
- Deployment : AWS EC2, nginx, uvicorn (ASGI)

---

### Frontend

- Developed in plain HTML, CSS, VanillaJS.
- WebRTC Stream used with MediaStream

---
