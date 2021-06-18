# Audio Sentiment Analysis

Repository of Multilingual Audio Emotion Recognition Project with Speaker Diarization.

Features of the Project:

- 78.8 percent accuracy score on Audio Sentiment Classification into categories of Happy, Sad, Disgusted, Fearful, Surprised, Angry and Neutral.
- Language Independent Classifier.
- High accuracy even for noisy environments (Call centre Noise tested)
- Time taken : Approx 10 seconds on a 10 minute Audio Sample
- Speaker diarization and speaker wise emotions predicted with same accuracy ( upto 2 speakers)

Working

- Long audio samples are split into Smaller audio samples (len < 1 min)
- 80 MFCC Features are extracted from each audio clip
- These are fed to a 1D CNN with 3 Convolutional Layers.

Testing Accuracy : 78.2%
Final Accuracy : 78.8 %

![Solution Architecture](solution_arch.png)
