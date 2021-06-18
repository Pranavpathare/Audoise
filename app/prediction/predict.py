# Prediction module for samples with Size <= 3 secs.
# 18-06-2021

import numpy as np   
from scipy.stats import mode

import librosa                             # Audio Analysis Package   
                  
from pydub import AudioSegment             # Processing Audio
                  
from keras.models import load_model

import os

model = load_model("app/model/sentiment_model.h5")
emotion_classes = ['Anger','Fear','Surprised','Sad','Happy','Disgust','Neutral']

def get_mfcc_features(path : str, num_features : int = 100):
    
    """Extracts MFCC features (Mel Freq Ceptral Coefficients) of the Audio Sample
    
    Params:
    path: str
    num_features: int
    
    returns 1D vector of MFCC features
    """
    
    y, sr = librosa.load(path)
    mfcc_vector = librosa.feature.mfcc(y = y, sr = sr, n_mfcc = num_features).T
    mfcc_vector = np.mean(mfcc_vector, axis = 0) # Flatten to 1D
    return mfcc_vector

def predict_one(path: str):
    
    """Emotion Prediction on small wav file (<=3 sec)

    Args:
        path (str): path of wav file

    Returns:
        str: Emotion Class
    """
    
    global emotion_classes, model
    
    X = np.array([get_mfcc_features(path)])
    X = np.expand_dims(X, -1) # Reshape to 2D
    
    prediction = model.predict(X)
    prediction = np.argmax(prediction, axis = 1)[0]
    prediction = emotion_classes[prediction]
    
    return prediction

def predict_many(path: str):
    
    """Returns time wise predictions on a large wav file (>3 secs)
    Args:
        filepath (str): Path of wav file
        split_time (int, optional): Sample Split Duration in Seconds. Defaults to 3.
        
    Returns:
    Dictionary of split time separated sentiments and mode of sentiments
    """

    wav_sound = AudioSegment.from_wav(path)
    
    split_time = max(3, int(wav_sound.duration_seconds) // 15)
    audio_chunks = wav_sound[::split_time * 1000]
    
    predictions = list()
    
    for i, chunk in enumerate(audio_chunks):
        
        # Convert to wav file for librosa processing
        file_path = "app/prediction/_temp_audio_files_/chunk{}.wav".format(i + 1)
        chunk.export(file_path, bitrate = "192k", format = "wav")
    
        predictions.append(predict_one(file_path))
        
        # Delete temp file
        os.remove(file_path)
    
    # Most frequent Prediction
    prediction_mode = mode(predictions)
    
    return {"predictions": predictions, 
            "split_time": split_time, 
            "mode": prediction_mode[0][0]}
    
