import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import successSound from "../assets/success.mp3";
import errorSound from "../assets/error.mp3";

function DragDropGame() {
    // Rol: "admin" o "player"
    const [role, setRole] = useState(null);
    // isObserver = true => admin/observador, false => jugador
    const [isObserver, setIsObserver] = useState(false);

    // Estado del jugador (solo se usa si isObserver=false)
    const [answers, setAnswers] = useState([]);
    const [availableWords, setAvailableWords] = useState([]);
    const [isPaused, setIsPaused] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // Estado para el admin (lo que ve el admin sobre el jugador)
    const [remoteAnswers, setRemoteAnswers] = useState([]);

    // Datos del texto
    const [data, setData] = useState(null);

    const [socket, setSocket] = useState(null);

    // 1) Al elegir rol, conectamos al WS
    useEffect(() => {
        if (role) {
            const ws = new WebSocket("ws://localhost:8080/dragdrop");
            setSocket(ws);

            ws.onopen = () => {
                console.log("WS DragDrop conectado");
                // Enviar "JOIN" con el rol
                sendWSMessage(ws, "JOIN", { role });
            };

            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                console.log("WS mensaje:", msg);

                switch (msg.type) {
                    case "ASSIGN_ROLE":
                        setIsObserver(msg.isObserver);
                        // Si es observer, no cargamos localmente las answers (o sí, pero no las usamos).
                        break;

                    case "UPDATE_ANSWERS":
                        // Llega desde el jugador principal => admin las recibe
                        if (role === "admin") {
                            // msg.answers => array con las respuestas
                            setRemoteAnswers(msg.answers);
                        }
                        break;

                    case "PAUSE_GAME":
                        // Solo el jugador principal se pausa
                        if (!msg.isObserver && role === "player") {
                            setIsPaused(true);
                            Swal.fire('Pausado', 'El juego ha sido pausado por el administrador.', 'info');
                        }
                        break;

                    case "RESUME_GAME":
                        // Solo el jugador principal se reanuda
                        if (!msg.isObserver && role === "player") {
                            setIsPaused(false);
                            Swal.fire('Reanudado', 'El juego ha sido reanudado por el administrador.', 'success');
                        }
                        break;

                    case "END_GAME":
                        // Solo el jugador principal finaliza
                        if (!msg.isObserver && role === "player") {
                            setIsFinished(true);
                            setIsPaused(true);
                            Swal.fire('Finalizado', 'El juego ha finalizado.', 'warning');
                        }
                        break;
                }
            };

            ws.onerror = (err) => console.error("WebSocket Error:", err);
            ws.onclose = () => console.warn("WebSocket cerrado (DragDrop)");
        }
    }, [role]);

    // 2) Cargar el texto base desde el backend
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
                    // Si soy player, inicializo answers
                    setAnswers(Array(correctWords.length).fill(''));
                    setAvailableWords(correctWords);
                    // El admin (observer) usará remoteAnswers (por defecto array vacío)
                }
            })
            .catch((err) => {
                console.error(err);
                Swal.fire('Error', 'No se pudo cargar el texto', 'error');
            });
    }, []);

    // Helper para enviar mensajes WS
    const sendWSMessage = (ws, type, payload = {}) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type, ...payload }));
        }
    };

    // --- ADMIN: Pausa, Reanuda, Finaliza ---
    const handlePause = () => {
        if (!socket) return;
        sendWSMessage(socket, "PAUSE_GAME");
    };
    const handleResume = () => {
        if (!socket) return;
        sendWSMessage(socket, "RESUME_GAME");
    };
    const handleEnd = () => {
        if (!socket) return;
        sendWSMessage(socket, "END_GAME");
    };

    // --- PLAYER: Drag & Drop ---
    const handleDragStart = (e, word) => {
        if (isObserver || isPaused || isFinished) return;
        e.dataTransfer.setData('text/plain', word);
    };

    const handleDragOver = (e) => {
        if (isObserver || isPaused || isFinished) return;
        e.preventDefault();
    };

    const handleDrop = (e, idx) => {
        if (isObserver || isPaused || isFinished) return;
        e.preventDefault();
        const droppedWord = e.dataTransfer.getData('text/plain');
        const newAnswers = [...answers];
        newAnswers[idx] = droppedWord;
        setAnswers(newAnswers);

        // Remover la palabra del banco
        setAvailableWords((prev) => prev.filter((w) => w !== droppedWord));

        // *** ENVIAR AL SERVIDOR la nueva lista de answers ***
        if (socket) {
            sendWSMessage(socket, "UPDATE_ANSWERS", { answers: newAnswers });
        }
    };

    const handleReturnToBank = (holeIndex) => {
        if (isObserver || isPaused || isFinished) return;
        const word = answers[holeIndex];
        if (!word) return;
        const newAnswers = [...answers];
        newAnswers[holeIndex] = '';
        setAnswers(newAnswers);
        setAvailableWords((prev) => [...prev, word]);

        // *** ENVIAR AL SERVIDOR la nueva lista de answers ***
        if (socket) {
            sendWSMessage(socket, "UPDATE_ANSWERS", { answers: newAnswers });
        }
    };

    // Validar
    const playSuccessSound = () => { new Audio(successSound).play(); };
    const playErrorSound = () => { new Audio(errorSound).play(); };

    const handleValidate = () => {
        if (isObserver || isPaused || isFinished) return;
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

    // --- RENDER ---

    // Si no se ha seleccionado rol, mostramos el menú
    if (!role) {
        return (
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <h2>Selecciona un rol para Drag&Drop</h2>
                <button onClick={() => setRole('admin')}>Administrador/Observador</button>
                <button onClick={() => setRole('player')} style={{ marginLeft: '10px' }}>
                    Jugador
                </button>
            </div>
        );
    }

    // Si no hay data, cargando...
    if (!data) {
        return (
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <h2>Cargando texto de Drag&Drop...</h2>
            </div>
        );
    }

    // Dividimos el texto base
    const segments = data.textoBase.split('__');
    const holesCount = segments.length - 1; // o answers.length, dependiendo

    // Lógica para renderizar la vista
    // 1) Jugador: usa `answers` para mostrar sus huecos
    // 2) Admin: usa `remoteAnswers` para mostrar en qué huecos el jugador ha puesto las palabras
    const holesArray = isObserver ? remoteAnswers : answers;

    return (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <h2>Juego: Drag &amp; Drop (Completar Texto)</h2>

            {/* BOTONES ADMIN */}
            {isObserver && (
                <div style={{ marginBottom: '20px' }}>
                    <button onClick={handlePause}>Pausar</button>
                    <button onClick={handleResume} style={{ marginLeft: '10px' }}>
                        Reanudar
                    </button>
                    <button onClick={handleEnd} style={{ marginLeft: '10px' }}>
                        Finalizar
                    </button>
                </div>
            )}

            {/* BANCO DE PALABRAS (solo jugador, si no finalizado) */}
            {!isObserver && !isFinished && (
                <div style={{ marginBottom: '20px' }}>
                    <h3>Banco de Palabras</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {availableWords.map((word, i) => (
                            <div
                                key={i}
                                draggable={!isPaused && !isFinished}
                                onDragStart={(e) => handleDragStart(e, word)}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #666',
                                    borderRadius: '4px',
                                    backgroundColor: '#eee',
                                    cursor: isPaused ? 'not-allowed' : 'grab',
                                    opacity: isPaused ? 0.5 : 1,
                                }}
                            >
                                {word}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TEXTO CON HUECOS */}
            <div
                style={{
                    border: '1px solid #ccc',
                    padding: '15px',
                    width: '60%',
                    margin: '0 auto',
                    textAlign: 'left',
                    minHeight: '100px',
                    position: 'relative'
                }}
            >
                {segments.map((seg, i) => {
                    // Muestra el segmento
                    const segmentEl = <span key={`seg-${i}`}>{seg}</span>;

                    // Si no es el último, va un hueco
                    if (i < holesArray.length) {
                        return (
                            <React.Fragment key={`frag-${i}`}>
                                {segmentEl}
                                <span
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, i)}
                                    style={{
                                        display: 'inline-block',
                                        margin: '0 4px',
                                        cursor: 'default',
                                    }}
                                >
                  {/* Si no hay palabra, "__" */}
                                    {!holesArray[i] && <span style={{ color: '#888' }}>__</span>}

                                    {/* Si ya hay palabra */}
                                    {holesArray[i] && (
                                        <span
                                            onClick={() => handleReturnToBank(i)}
                                            style={{
                                                backgroundColor: '#dfe',
                                                padding: '2px 6px',
                                                border: '1px solid #666',
                                                borderRadius: '4px',
                                                cursor: (isPaused || isFinished || isObserver) ? 'not-allowed' : 'pointer',
                                                opacity: isPaused ? 0.5 : 1,
                                            }}
                                            title="Haz clic para devolver al banco"
                                        >
                      {holesArray[i]}
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

            {/* Botón VALIDAR (solo jugador y no finalizado) */}
            {!isObserver && !isFinished && (
                <button
                    onClick={handleValidate}
                    style={{ marginTop: '20px' }}
                    disabled={isPaused}
                >
                    Validar
                </button>
            )}

            {/* Overlay de pausa (solo jugador) */}
            {!isObserver && isPaused && !isFinished && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#fff',
                    fontSize: '30px'
                }}>
                    <p>Juego en Pausa</p>
                </div>
            )}

            {/* Overlay de finalizado (solo jugador) */}
            {!isObserver && isFinished && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#fff',
                    flexDirection: 'column'
                }}>
                    <h2>Juego Finalizado</h2>
                    <button onClick={() => window.location.reload()}>
                        Reiniciar
                    </button>
                </div>
            )}
        </div>
    );
}

export default DragDropGame;
