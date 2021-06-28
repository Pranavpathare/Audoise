import base64
import wave

def write_to_file(base64_audio, filename="myfile.wav"):
    """Converts Base64 audio stream to wav file with filename

    Args:
        base64_audio ([type])
        filename (str, optional): Defaults to "myfile.wav".
    """
    decode_string = base64.b64decode(base64_audio)
    with open(filename, "wb") as wav_file:
        wav_file.write(decode_string)
        

def write_to_file_wav(bytearr, filename="myfile.wav"):
    """Converts Base64 audio stream to wav file with filename with wave library

    Args:
        bytearr: (Bytes)
        filename: (str) file_path
    """
    with wave.open(filename, "wb") as audiofile:
        audiofile.setsampwidth(2)
        audiofile.setnchannels(1)
        audiofile.setframerate(44100)
        audiofile.writeframes(bytearr)
        

# @app.get("/")
# async def main():
    
#     content = """
#             <body>
#             <form action="/api/wav_files/" enctype="multipart/form-data" method="post">
#             <input name="files" type="file" multiple>
#             <input type="submit">
#             </form>
#             </body>
#                 """
                
#     return HTMLResponse(content=content)

# @app.websocket("/ws/splitted")
# async def websocket_endpoint(websocket: WebSocket):
    
#     await websocket.accept()
    
#     while True:
#         data = await websocket.receive()
        
#         if "token" not in data["text"]:
#             bytearray = data["text"][22:]
#             print(bytearray)
            
#             write_to_file(bytearray)
                
#             res = {"Result" : predict_one("myfile.wav")}
    
#             await websocket.send_json(res)
                
#         res = {}
#         res["result"] = 19
#         await websocket.send_json(res)