# Imports 
import numpy as np                 # Numerical python
import tensorflow as tf            # Deep Learning Library                       # Audio Processing
import keras                       # Tensorflow API
import matplotlib.pyplot as plt    # Mathematical plotting library
import os
from keras.utils import to_categorical
from keras.models import Sequential
from keras.layers import *
from keras.optimizers import rmsprop

class Models:
    class CNN_Improved:
        def __init__(self,num_features):
            model = Sequential()
            model.add(Conv1D(32, 5,padding='same', input_shape=(num_features, 1)))
            model.add(Activation('relu'))
            model.add(MaxPooling1D(pool_size=(8)))
            model.add(Conv1D(32, 5,padding='same',))
            model.add(Activation('relu'))
            model.add(Conv1D(32, 5,padding='same',))
            model.add(Activation('relu'))
            model.add(Dropout(0.3))
            model.add(Conv1D(8, 5,padding='same',))
            model.add(Activation('relu'))
            model.add(Conv1D(16, 5,padding='same',))
            model.add(Activation('relu'))
            model.add(MaxPooling1D(pool_size=(8)))
            model.add(Conv1D(16, 5,padding='same',))
            model.add(Activation('relu'))
            model.add(Flatten())
            model.add(Dense(7))
            model.add(Activation('softmax'))
            opt = rmsprop(lr=0.00001, decay=1e-6)
            model.compile(loss='categorical_crossentropy', optimizer='Adam',metrics=['accuracy'])
            
            self.model = model
            print(self.model.summary())
            
        def fit(self,X_train,y_train, X_test, y_test,num_epochs = 100):
            """Fit Function trains the model on the Training data and evaluates it on the testing data"""
            self.history = self.model.fit(np.expand_dims(X_train,-1), y_train, validation_data=(np.expand_dims(X_test, -1), y_test), epochs=num_epochs, shuffle=True,batch_size = 64)
            
        def plot(self,Accuracy = True, Loss = True):
            """Plots Losses and Accuracy scores of model on training and validation data"""
            if Loss:
                loss = self.history.history['loss']
                val_loss = self.history.history['val_loss']

                epochs = range(1, len(loss) + 1)

                plt.plot(epochs, loss, 'go', label='Training loss')
                plt.plot(epochs, val_loss, 'b', label='Validation loss')
                plt.title('Training and validation loss')
                plt.xlabel('Epochs')
                plt.ylabel('Loss')
                plt.legend()
                plt.show()
            if Accuracy:
                plt.clf()                                                
                acc = self.history.history['accuracy']
                val_acc = self.history.history['val_accuracy']

                plt.plot(epochs, acc, 'ro', label='Training acc')
                plt.plot(epochs, val_acc, 'b', label='Validation acc')
                plt.title('Training and validation accuracy')
                plt.xlabel('Epochs')
                plt.ylabel('Loss')
                plt.legend()

                plt.show()


        def save(self):
            self.model.save("Final_Model_new.h5")
                
        def evaluate(self,X_test,y_test):
            """Returns Accuracy Score on the test Data"""
            print("Modes Accuracy is: ",self.model.evaluate(np.expand_dims(X_test, -1), y_test)[1])
        
        def predict(self,X):
            '''returns predictions on Future data'''
            return self.model.predict(np.expand_dims(X,-1))
            
       