import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import successSound from "../assets/success.mp3";
import errorSound from "../assets/error.mp3";

function DragDropGame() {
    const [data, setData] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [availableWords, setAvailableWords] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8080/api/dragdrop/random')
            .then((res) => {
                if (!res.ok) throw new Error('No se pudo obtener el texto');
                return res.json();
            })
            .then((d) => {
                setData(d);
                if (d && d.palabrasFaltantes) {
                    const correctWords = d.palabrasFaltantes.split(',');
                    setAnswers(Array(correctWords.length).fill(''));
                    setAvailableWords(correctWords);
                }
            })
            .catch((err) => {
                console.error(err);
                Swal.fire('Error', 'No se pudo cargar el texto', 'error');
            });
    }, []);

    // Al arrastrar una palabra desde el banco
    const handleDragStart = (e, word) => {
        e.dataTransfer.setData('text/plain', word);
    };

    // Permitir soltar
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // Funciones para reproducir audio
    const playSuccessSound = () => {
        const audio = new Audio(successSound);
        audio.play();
    };

    const playErrorSound = () => {
        const audio = new Audio(errorSound);
        audio.play();
    };
    // Al soltar la palabra en el hueco
    const handleDrop = (e, idx) => {
        e.preventDefault();
        const droppedWord = e.dataTransfer.getData('text/plain');
        const newAnswers = [...answers];
        newAnswers[idx] = droppedWord;
        setAnswers(newAnswers);
        // Remover la palabra del banco
        setAvailableWords((prev) => prev.filter((w) => w !== droppedWord));
    };

    // Al hacer clic en la palabra en el hueco, la regresamos al banco
    const handleReturnToBank = (holeIndex) => {
        const word = answers[holeIndex];
        if (!word) return;
        const newAnswers = [...answers];
        newAnswers[holeIndex] = '';
        setAnswers(newAnswers);
        setAvailableWords((prev) => [...prev, word]);
    };

    // Validar en el backend
    const handleValidate = () => {
        if (!data || !data.id) {
            Swal.fire('Error', 'No hay un texto cargado', 'error');
            return;
        }
        fetch(`http://localhost:8080/api/dragdrop/validate/${data.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(answers),
        })
            .then((res) => res.json())
            .then((isCorrect) => {
                if (isCorrect) {
                    Swal.fire('¡Correcto!', 'Has completado el texto exitosamente.', 'success');
                    playSuccessSound();

                } else {
                    Swal.fire('Incorrecto', 'Algunas palabras no coinciden.', 'error');
                    playErrorSound();
                }
            })
            .catch((err) => {
                console.error(err);
                Swal.fire('Error', 'Ocurrió un error al validar.', 'error');
            });
    };

    if (!data) {
        return (
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <h2>Cargando...</h2>
            </div>
        );
    }

    // Dividir el texto en segmentos por cada "__"
    // Asegúrate de que en la BD sea algo como: "María __, a todos en el __ de clase."
    const segments = data.textoBase.split('__');
    const holesCount = answers.length;

    return (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <h2>Juego: Drag &amp; Drop (Completar Texto)</h2>

            <div style={{ marginBottom: '20px' }}>
                <h3>Banco de Palabras</h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {availableWords.map((word, i) => (
                        <div
                            key={i}
                            draggable
                            onDragStart={(e) => handleDragStart(e, word)}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #666',
                                borderRadius: '4px',
                                backgroundColor: '#eee',
                                cursor: 'grab',
                            }}
                        >
                            {word}
                        </div>
                    ))}
                </div>
            </div>

            <div
                style={{
                    border: '1px solid #ccc',
                    padding: '15px',
                    width: '60%',
                    margin: '0 auto',
                    textAlign: 'left',
                    minHeight: '100px',
                }}
            >
                {segments.map((seg, i) => {
                    // Mostrar el segmento normal
                    const segmentEl = <span key={`seg-${i}`}>{seg}</span>;

                    // Si NO es el último segmento, va un hueco después
                    if (i < holesCount) {
                        const holeIndex = i;
                        return (
                            <React.Fragment key={`frag-${i}`}>
                                {segmentEl}
                                {/* HUECO donde soltar */}
                                <span
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, holeIndex)}
                                    style={{
                                        display: 'inline-block',
                                        margin: '0 4px',
                                        cursor: 'default',
                                    }}
                                >
                  {/* Si no hay palabra, mostramos "__" */}
                                    {!answers[holeIndex] && <span style={{ color: '#888' }}>__</span>}

                                    {/* Si ya hay una palabra, la pintamos */}
                                    {answers[holeIndex] && (
                                        <span
                                            onClick={() => handleReturnToBank(holeIndex)}
                                            style={{
                                                backgroundColor: '#dfe',
                                                padding: '2px 6px',
                                                border: '1px solid #666',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                            }}
                                            title="Haz clic para devolver al banco"
                                        >
                      {answers[holeIndex]}
                    </span>
                                    )}
                </span>
                            </React.Fragment>
                        );
                    } else {
                        return segmentEl;
                    }
                })}
            </div>

            <button onClick={handleValidate} style={{ marginTop: '20px' }}>
                Validar
            </button>
        </div>
    );
}

export default DragDropGame;
