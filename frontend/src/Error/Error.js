import React, { useState } from 'react';
import './Error.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import Graph from '../Graph/Graph';

const CustomDateTimePickerInput = React.forwardRef(({ value, onClick }, ref) => (
  <div className="custom-datepicker-input" onClick={onClick} ref={ref} aria-label='selected date'>
    <span>{value}</span>
    <FontAwesomeIcon icon={faCalendar} className="icono-calendario" />
  </div>
));

const DateTimePicker = ({ selectedDateTime, onChange }) => (
  <DatePicker
    selected={selectedDateTime}
    onChange={onChange}
    showTimeSelect
    timeFormat="HH:mm"
    timeIntervals={60}
    dateFormat="dd/MM/yyyy HH:mm"
    customInput={<CustomDateTimePickerInput />}
  />
);

function Error() {
  const [machine, setMachine] = useState("");
  const [date, setDate] = useState(new Date());
  const [selection, setSelection] = useState("");
  const [depth, setDepth] = useState("");
  const [prediction, setPrediction] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCalibrationGraphs, setShowCalibrationGraphs] = useState(false);

  const [nQubits, setNQubits] = useState(null); 
  const [tGates, setTGates] = useState(null); 
  const [phaseGates, setPhaseGates] = useState(null); 
  const [hGates, setHGates] = useState(null); 
  const [cnotGates, setCnotGates] = useState(null); 
  const [model, setModel] = useState("");

  const handleChangeModel = (event) => {
    setModel(event.target.value);
  };

  const handleChangeNQubits = (event) => {
    const value = event.target.value;
    if(value < 0){
      return;
    }
    setNQubits(event.target.value);
  };

  const handleChangeTGates = (event) => {
    const value = event.target.value;
    if(value < 0){
      return;
    }
    setTGates(event.target.value);
  };

  const handleChangePhaseGates = (event) => {
    const value = event.target.value;
    if(value < 0){
      return;
    }
    setPhaseGates(event.target.value);
  };

  const handleChangeHGates = (event) => {
    const value = event.target.value;
    if(value < 0){
      return;
    }
    setHGates(event.target.value);
  };

  const handleChangeCnotGates = (event) => {
    const value = event.target.value;
    if(value < 0){
      return;
    }
    setCnotGates(event.target.value);
  };


  const handleButtonCalibration = () => {
    setShowCalibrationGraphs(!showCalibrationGraphs);
  };

  const handleChangeMachine = (event) => {
    setMachine(event.target.value);
  };

  const handleChangeSelection = (event) => {
    setSelection(event.target.value);
    setShowCalibrationGraphs(false);
    setPrediction([]);
  };

  const handleChangeDepth = (event) => {
    setDepth(event.target.value);
  };

  const handleButtonClick = async () => {
    setError(null);
    setLoading(true);

    if (!machine) {
      setError("You must select a machine");
      setLoading(false);
      return;
    }

    if(!selection){
      setError("You must select an option")
      setLoading(false);
      return;
    }

    if(!model){
      setError("You must select a model")
      setLoading(false);
      return;
    }

    if (selection === 'Qubits' && depth === '') {
      setError("You must select a depth");
      setLoading(false);
      return;
    }

    if(!nQubits){
      setError("You must select the number of qubits")
      setLoading(false)
      return;
    }

    if(!tGates){
      setError("You must select the number of T gates")
      setLoading(false)
      return;
    }

    if(!phaseGates){
      setError("You must select the number of phase gates")
      setLoading(false)
      return;
    }

    if(!hGates){
      setError("You must select the number of Hadamard gates")
      setLoading(false)
      return;
    }

    if(!cnotGates){
      setError("You must select the number of C-Not gates")
      setLoading(false)
      return;
    }

    const currentDate = new Date();
    console.log(date < currentDate)

    if (date < currentDate) {
      setError("Selected date must be after the current date");
      setLoading(false);
      return;
    }

    const isoDate = date.toISOString();

    try {
      const response = await fetch('http://localhost:8000/predictError', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          machine: machine,
          date: isoDate,
          selection: selection,
          depth: depth,
          nQubits: nQubits,
          tGates: tGates,
          hGates: hGates,
          phaseGates: phaseGates,
          cnotGates: cnotGates,
          model: model
        })
      });
      const data = await response.json();
      const hasValidPredictions = Object.values(data).some(arr => Array.isArray(arr) && arr.length > 0);

      if (data) {
        console.log(data)
        setPrediction(data);
        setError(null);
        setShowCalibrationGraphs(true);
      } else {
        setError('No valid predictions found');
      }
    } catch (error) {
      console.error('Error fetching prediction:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
    <div className="container">
      <div className="bar">
        <h1 className="title">Prediction within a Date Range</h1>
      </div>
      
      <div className="selectors">
        <div className="machine-selector">
          <select value={machine} onChange={handleChangeMachine} aria-label="Select a machine">
            <option value="">Select a machine</option>
            <option value="ibm Brisbane">ibm Brisbane</option>
            <option value="ibm Kyoto">ibm Kyoto</option>
            <option value="ibm Osaka">ibm Osaka</option>
            <option value="All">All of the options</option>
          </select>
        </div>
        
        <div className="option-selector">
          <select value={selection} onChange={handleChangeSelection} className="option-selector-select" aria-label="Select an option">
            <option value="">Select an option</option>
            <option value="Qubits">Qubits</option>
            <option value="Gates">Gates</option>
          </select>
        </div>

        <div className="date-selector">
          <DateTimePicker selectedDateTime={date} onChange={setDate} />
        </div>
        <div className="model-selector">
          <select value={model} onChange={handleChangeModel} className="option-selector-select" aria-label='Select a model'>
            <option value="">Select a model</option>
            <option value="Perceptron">Multilayer Perceptron</option>
            <option value="XgBoost">XgBoost</option>
            <option value="Perceptron-XgBoost">Both</option>
          </select>
        </div>
        

      </div>

       {selection === 'Qubits' && 

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="depth-selector">
            <select value={depth} onChange={handleChangeDepth} className="option-selector-select" aria-label='Select a depth'>
              <option value="">Select a depth</option>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </div>
          </div>
        } 

        <table style={{borderCollapse: 'separate', borderSpacing: '10px', marginBottom: '10px', marginTop: '10px'}}>
          <tbody>
            <tr>
              <td><label>Number of qubits:</label></td>
              <td><input className='input-gates' type="number" value={nQubits || ""} onChange={handleChangeNQubits} min={0} aria-label='nQubitsInput'/></td>
            </tr>
            <tr>
              <td><label>Number of T gates:</label></td>
              <td><input className='input-gates' type="number" value={tGates || ""} onChange={handleChangeTGates} min={0} aria-label='tGatesInput'/></td>
            </tr>
            <tr>
              <td><label>Number of phase gates:</label></td>
              <td><input className='input-gates' type="number" value={phaseGates || ""} onChange={handleChangePhaseGates} min={0} aria-label='phaseGatesInput'/></td>
            </tr>
            <tr>
              <td><label>Number of Hadamard gates:</label></td>
              <td><input className='input-gates' type="number" value={hGates || ""} onChange={handleChangeHGates} min={0} aria-label='hGatesInput'/></td>
            </tr>
            <tr>
              <td><label>Number of C-Not gates:</label></td>
              <td><input className='input-gates' type="number" value={cnotGates || ""} onChange={handleChangeCnotGates} min={0} aria-label='cGatesInput'/></td>
            </tr>
          </tbody>
        </table>

      {error && <p className="error-message">{error}</p>}

      <div className="container-button">
        <button onClick={handleButtonClick} className="button">Submit</button>
      </div>

      {loading && (
        <div className="loading">
          <h2>Loading...</h2>
          <div>
            <div className="spinner"></div>
          </div>
        </div>
      )}
      
      {prediction.length !== 0 && !loading && (
        <>
        <div className="container-button">
          <button onClick={handleButtonCalibration} className="button">
            {showCalibrationGraphs ? "Hide Calibration Charts" : "Show Calibration Charts"}
          </button>
        </div>
          {showCalibrationGraphs && prediction && (
            <div className="graph-container" aria-label='graph-container'>
              <h2>Error Predictions:</h2>
              <Graph predictions={prediction} type={'divergence'} color={'#ff0000'} />

              {selection === "Qubits" && showCalibrationGraphs && (
                <div>
                  <div style={{ marginBottom: '40px' }}>
                    <h2>Historical T1:</h2>
                    <Graph predictions={prediction} type={'T1'} historical={true} color={'#1f77b4'}/>
                  </div>
                  <div style={{ marginBottom: '40px' }}>
                    <h2>Historical T2:</h2>
                    <Graph predictions={prediction} type={'T2'} historical={true} color={'#660066'}/>
                  </div>
                  <div style={{ marginBottom: '40px' }}>
                    <h2>Historical Prob_Meas0_Prep1:</h2>
                    <Graph predictions={prediction} type={'Prob0'} historical={true} color={'#006600'}/>
                  </div>
                  <div style={{ marginBottom: '40px' }}>
                    <h2>Historical Prob_Meas1_Prep0:</h2>
                    <Graph predictions={prediction} type={'Prob1'} historical={true} color={'#000099'}/>
                  </div>
                  <div style={{ marginBottom: '40px' }}>
                    <h2>Historical Readout_error:</h2>
                    <Graph predictions={prediction} type={'Error'} historical={true} color={'#ff6600'}/>
                  </div>
                </div>
              )}

              {selection === "Gates" && showCalibrationGraphs && (
                <div>
                  <div style={{ marginBottom: '40px' }}>
                    <h2>Historical Gate error of one-qubit input:</h2>
                    <Graph predictions={prediction} type={'gate_error_1'} historical={true} color={'#e6e600'}/>
                  </div>
                  <div style={{ marginBottom: '40px' }}>
                    <h2>Historical Gate error of two-qubit input:</h2>
                    <Graph predictions={prediction} type={'gate_error_2'} historical={true} color={'#2f4f4f'}/>
                  </div>
                  {/* Rest of historical graphs */}
                </div>
              )}

            </div>
          )}
        </>
      )}

      
    </div>
    </>
  );
}

export default Error;
