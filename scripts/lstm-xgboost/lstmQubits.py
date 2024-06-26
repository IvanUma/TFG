import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from keras import Sequential
from keras.layers import LSTM, Dense
from keras.models import load_model
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from datetime import datetime
import matplotlib.dates as mdates
import joblib

def preprocess_data(scaler_path, file_path, window_size):
    df = pd.read_csv(file_path)

    df = df.rename(columns={'y': 'T1', 'ds': 'date'})

    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values(by='date')

    dates = df['date']
    df_without_dates = df.drop(columns=['date'])
    scaler = joblib.load(scaler_path)
    df_normalized = scaler.fit_transform(df_without_dates)

    df_normalized = pd.DataFrame(df_normalized, columns=df_without_dates.columns)
    df_normalized['date'] = dates

    print(df_normalized)

    def create_sequences(data, window_size):
        X, y = [], []
        for i in range(len(data) - window_size):
            X.append(data[i:i + window_size])
            y.append(data[i + window_size])
        return np.array(X), np.array(y)

    X, y = create_sequences(df_normalized[['T1', 'T2', 'probMeas0Prep1', 'probMeas1Prep0', 'readout_error']].values, window_size)

    return X, y, scaler


def create_model(X_train, y_train, X_test, y_test, model_path):
    model = Sequential([
        LSTM(100, input_shape=(X_train.shape[1], X_train.shape[2])),
        Dense(5)  
    ])
    model.compile(loss='mse', optimizer='adam')
    model.fit(X_train, y_train, epochs=50, batch_size=32, validation_data=(X_test, y_test))
    model.save(model_path)


def get_sequence_for_date(df, df_normalized, date, window_size):
    index_of_date = df.index[df['date'] == date].tolist()

    if not index_of_date:
        sequence = df_normalized.iloc[-window_size:, :].values
    else:
        index_of_date = index_of_date[0]
        start_index = max(0, index_of_date - window_size + 1)
        sequence = df_normalized.iloc[start_index:index_of_date + 1, :].values

    return sequence


def predict_future(scaler_path, model_path, data_file, window_size, future_date):
    model = load_model(model_path)

    df = pd.read_csv(data_file)

    df = df.rename(columns={'y': 'T1', 'ds': 'date'})

    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values(by='date')

    df_without_dates = df.drop(columns=['date'])
    scaler = joblib.load(scaler_path)
    normalized_dataframe = pd.DataFrame(scaler.fit_transform(df_without_dates), columns=df_without_dates.columns)

    current_date = datetime.now()

    future_date = pd.to_datetime(future_date)

    num_steps = int((future_date - current_date).total_seconds() / (2 * 3600))

    current_input_sequence = get_sequence_for_date(df, normalized_dataframe, current_date, window_size)
    predictions = []
    for _ in range(num_steps):
        prediction = model.predict(np.expand_dims(current_input_sequence, axis=0))
        print(prediction)
        predictions.append(prediction)

        current_input_sequence = np.concatenate([current_input_sequence[1:], prediction], axis=0)

    if len(predictions) == 0:
        raise ValueError("No predictions were generated.")
    predictions = np.array(predictions)

    predictions_flat = predictions.reshape(-1, predictions.shape[-1])

    predictions_inverted = scaler.inverse_transform(predictions_flat)

    predictions_reshaped = predictions_inverted.reshape(predictions.shape)

    qubits_errors_predictions = predictions_reshaped[:, :, :5]

    return qubits_errors_predictions


machines = ["Brisbane", "Kyoto", "Osaka"]
window_size = 10
future_date = '2024-05-30'

for machine in machines:
    print(machine)
    data_file = "../../backend/dataframes_neuralProphet/dataframeT1" + machine + ".csv"
    model_path = "../../backend/models_lstm_qubits/model_" + machine + ".keras"
    scaler_path = '../../backend/dataframes_neuralProphet/scalerT1' + machine + '.pkl'

    X, y, scaler = preprocess_data(scaler_path, data_file, window_size)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

    create_model(X_train, y_train, X_test, y_test, model_path)
