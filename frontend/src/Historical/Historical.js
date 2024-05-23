import React, { useState, useEffect } from "react";
import Graph from '../Graph/Graph'; // Importa el componente de la gráfica
import './Historical.css'; // Asegúrate de crear este archivo CSS para los estilos

function Historical() {
    const [calibration, setCalibration] = useState([]);
    const [selectedMachine, setSelectedMachine] = useState("");
    const [option, setOption] = useState("");
    const [error, setError] = useState(null);
    const [showCalibrationGraphs, setShowCalibrationGraphs] = useState(false);

    const machines = ["ibm Brisbane", "ibm Kyoto", "ibm Osaka"];

    const handleButtonCalibration = () => {
        setError(null);
        if (!selectedMachine) {
            setError("You must select a machine");
            return;
        } else if (!option) {
            setError("You must select an option");
            return;
        }else if(showCalibrationGraphs){
            setShowCalibrationGraphs(false);
        }else{
            setShowCalibrationGraphs(true);
        }
    };

    const handleChangeOption = (event) => {
        setOption(event.target.value);
    };

    const handleTabChange = async (machine) => {
        console.log(machine)
        setSelectedMachine(machine);
        setError(null);

        try {
            const response = await fetch('http://localhost:8000/historical', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    machine: machine
                  })
              })
            const data = await response.json();
            setCalibration(data.historical);
            console.log(data.historical);

        } catch (error) {
            console.error("Error fetching calibration data:", error);
        }
    };

    return (
        <div className="container">
            <div className="bar">
                <h1 className="title">Historical</h1>
            </div>

            <div className="tabs">
                {machines.map((machine) => (
                    <button 
                        key={machine}
                        className={`tab ${selectedMachine === machine ? "active" : ""}`} 
                        onClick={() => handleTabChange(machine)}
                    >
                        {machine}
                    </button>
                ))}
            </div>

            {selectedMachine && (
                <div>
                    <div className="option-selector">
                        <select value={option} onChange={handleChangeOption} className="selector-option-select">
                            <option value="">Choose an option</option>
                            <option value="Qubits">Qubits</option>
                            <option value="Gates">Gates</option>
                            <option value="Error">Error</option>
                        </select>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div className="container-button">
                        <button onClick={handleButtonCalibration} className="button">
                            {showCalibrationGraphs ? "Hide Calibration Charts" : "Show Calibration Charts"}
                        </button>
                    </div>

                    {option === "Qubits" && calibration && showCalibrationGraphs && (
                        <div>
                            <div style={{ marginBottom: '40px' }}>
                                <h2>Historical T1:</h2>
                                <Graph predictions={calibration[0].qubits} type={'T1'} historical={true} />
                            </div>
                            <div style={{ marginBottom: '40px' }}>
                                <h2>Historical T2:</h2>
                                <Graph predictions={calibration[0].qubits} type={'T2'} historical={true} />
                            </div>
                            <div style={{ marginBottom: '40px' }}>
                                <h2>Historical Prob0:</h2>
                                <Graph predictions={calibration[0].qubits} type={'probMeas0Prep1'} historical={true} />
                            </div>
                            <div style={{ marginBottom: '40px' }}>
                                <h2>Historical Prob1:</h2>
                                <Graph predictions={calibration[0].qubits} type={'probMeas1Prep0'} historical={true} />
                            </div>
                            <div style={{ marginBottom: '40px' }}>
                                <h2>Historical readout_error:</h2>
                                <Graph predictions={calibration[0].qubits} type={'readout_error'} historical={true} />
                            </div>
                        </div>
                    )}

                    {option === "Gates" && calibration && showCalibrationGraphs &&(
                        <div>
                            <div style={{ marginBottom: '40px' }}>
                                <h2>Historical Gate error of one-qubit input:</h2>
                                <Graph predictions={calibration[1].gates} type={'gate_error_1'} historical={true} />
                            </div>
                            <div style={{ marginBottom: '40px' }}>
                                <h2>Historical Gate error of two-qubit input:</h2>
                                <Graph predictions={calibration[1].gates} type={'gate_error_2'} historical={true} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Historical;

