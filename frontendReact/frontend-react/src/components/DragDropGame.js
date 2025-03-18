import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

function DragDropGame() {
    const [data, setData] = useState(null);

    // 'answers' guardará la palabra que se soltó en cada hueco
    // Ej: si hay 2 huecos, answers = ["mundo", "dragdrop"]
    const [answers, setAnswers] = useState([]);

    // Palabras que el usuario aún no ha colocado (banco de fichas)
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
                    // answers con el mismo número de huecos, inicialmente vacíos
                    setAnswers(Array(correctWords.length).fill(''));
                    // El “banco” tendrá todas las palabras disponibles
                    setAvailableWords(correctWords);
                }
            })
            .catch((err) => {
                console.error(err);
                Swal.fire('Error', 'No se pudo cargar el texto', 'error');
            });
    }, []);

    // Manejadores de Drag & Drop para las “fichas”
    const handleDragStart = (e, word) => {
        // guardamos la palabra que estamos arrastrando
        e.dataTransfer.setData('text/plain', word);
    };

    // Permite soltar en el hueco
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // Cuando sueltas la palabra en un hueco
    const handleDrop = (e, idx) => {
        e.preventDefault();
        const droppedWord = e.dataTransfer.getData('text/plain');

        // Actualizamos answers: la palabra suelta va al hueco idx
        const newAnswers = [...answers];
        newAnswers[idx] = droppedWord;
        setAnswers(newAnswers);

        // Removemos la palabra del “banco” de disponibles
        setAvailableWords((prev) => prev.filter((w) => w !== droppedWord));
    };

    // Permite hacer clic en una palabra que ya está en el hueco
    // para devolverla al banco
    const handleReturnToBank = (holeIndex) => {
        const word = answers[holeIndex];
        if (!word) return; // si no hay palabra, no hace nada

        // Quitamos la palabra del hueco
        const newAnswers = [...answers];
        newAnswers[holeIndex] = '';
        setAnswers(newAnswers);

        // Devolvemos la palabra al banco
        setAvailableWords((prev) => [...prev, word]);
    };

    // Validar las respuestas contra el backend
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
                } else {
                    Swal.fire('Incorrecto', 'Algunas palabras no coinciden.', 'error');
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

    // Partimos el texto en segmentos para renderizar huecos
    const segments = data.textoBase.split('__'); // Ej: ["Hola ", ", este es un ejemplo de ", "."]
    const holesCount = answers.length; // número de huecos

    return (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <h2>Juego: Drag &amp; Drop (Completar Texto)</h2>

            {/* Banco de fichas (palabras disponibles) */}
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

            {/* Texto con huecos droppables */}
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
                    // Renderizamos el segmento de texto
                    const segmentEl = <span key={`seg-${i}`}>{seg}</span>;

                    // Si NO es el último segmento, después va un hueco droppable
                    if (i < holesCount) {
                        const holeIndex = i; // para la respuesta
                        return (
                            <React.Fragment key={`frag-${i}`}>
                                {segmentEl}
                                {/* HUECO */}
                                <span
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, holeIndex)}
                                    style={{
                                        display: 'inline-block',
                                        minWidth: '50px',
                                        minHeight: '25px',
                                        borderBottom: '2px dashed #666',
                                        margin: '0 4px',
                                        cursor: 'default',
                                    }}
                                >
                  {/* Si ya hay una palabra en este hueco, la mostramos */}
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
                        // Último segmento, no lleva hueco
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
