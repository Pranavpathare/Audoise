from typing import List               # Python Type Checking

from fastapi import FastAPI, WebSocket
from fastapi import File, UploadFile
# from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

from utils import write_to_file_wav

from prediction.predict import predict_one, predict_many

from pydub import AudioSegment        # Bytes to Wave

import os

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins
)


        
@app.websocket("/ws/audio_stream")
async def websocket_endpoint(websocket: WebSocket):
    """AudioStream Websocket Sentiment Analyzer.
    Recieves 1 second chunks of audio Data and concatenates 
    them to 5-6 second long wav files and returns prediction in real time.

    Args:
        websocket (WebSocket): Mediastream / AudioStream ByteArray
        
    Returns: (Json) Prediction String
    """
    
    await websocket.accept()
    
    temp_segment = None
    file_counter = 0
    
    while True:
        
        file_counter += 1
        
        data = await websocket.receive()
        
        if 'bytes' in data:
            
            bytearr = data['bytes']
            filename = f"_temp_files_many/file{file_counter}.wav"
            
            write_to_file_wav(bytearr, filename)

            if temp_segment is None:
                segment_counter = 1
                # Convert to pydub audiosegment
                temp_segment = AudioSegment.from_wav(filename)
            else:
                segment_counter += 1
                # concatenate to existing audioSegment
                temp_segment += AudioSegment.from_wav(filename)
                
            os.remove(filename)

            # Threshold for AudioSegment ~ 7 seconds in length
            
            if segment_counter == 10:
                
                full_file_path = f"_temp_files_many/file{file_counter}c{file_counter}.wav"
                
                temp_segment.export(full_file_path, format="wav")
                temp_segment = None
                segment_counter = 0
                
                res = {"Result" : predict_one(full_file_path)}
                await websocket.send_json(res)
                
                os.remove(full_file_path)

        elif data['type'] == 'websocket.disconnect':
            await websocket.close()
            print("Connection Closed")
            return
        
@app.post("/api/wav_files/")
async def create_upload_files(files: List[UploadFile] = File(...)):
    """Evaluate Sentiments in Multipart Form Files (wav)

    Args:
        files (List[UploadFile], optional): [description]. Defaults to File(...).
        Wav File Objects

    Returns:
        Json: File wise Predictions separated by 4 seconds.
    """

    if len(files) > 3:
        return {" ": {"mode": "File Limit Exceeded"}}
        
    filename = "_temp_files_one/myfilem.wav"
    res_json = {}
    file_counter = 0
    for upload_file in files:
        
        with open(filename, "wb") as file_object:
            
            file_object.write(upload_file.file.read())
        
        res_json[upload_file.filename + str(file_counter)] = predict_many(filename)
        
        os.remove(filename)
    
    return res_json