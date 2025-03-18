import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

// Importa tus audios locales
import successSound from '../assets/success.mp3';
import errorSound from '../assets/error.mp3';

function QuizGame() {
    const [question, setQuestion] = useState(null); // La pregunta aleatoria
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userDocument, setUserDocument] = useState('');
    const [chosenOption, setChosenOption] = useState('');

    // 1. Cargar la pregunta al montar
    useEffect(() => {
        fetch('http://localhost:8080/api/question/random')
            .then((res) => res.json())
            .then((data) => {
                setQuestion(data);
            })
            .catch((err) => {
                console.error(err);
                toast.error('Error al cargar la pregunta');
            });
    }, []);

    // 2. Funciones para reproducir audio
    const playSuccessSound = () => {
        const audio = new Audio(successSound);
        audio.play();
    };

    const playErrorSound = () => {
        const audio = new Audio(errorSound);
        audio.play();
    };

    // 3. Manejo del submit
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!question) {
            toast.error('No hay pregunta cargada');
            return;
        }

        // Construir el objeto para el backend
        const userResponse = {
            userName,
            userEmail,
            userDocument,
            chosenOption,
            questionId: question.id
        };

        fetch('http://localhost:8080/api/user-response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userResponse),
        })
            .then((res) => res.json())
            .then((saved) => {
                if (!saved || saved.id == null) {
                    // Error al guardar
                    playErrorSound();
                    toast.error('Ocurrió un error al guardar la respuesta');
                    return;
                }

                // Si guardó bien, revisamos isCorrect
                if (saved.isCorrect) {
                    playSuccessSound();
                    toast.success('¡Respuesta correcta!');
                } else {
                    playErrorSound();
                    toast.warn('Respuesta incorrecta');
                }
            })
            .catch((err) => {
                console.error(err);
                playErrorSound();
                toast.error('Error de conexión');
            });
    };

    // Validar que el documento sea solo números
    const handleDocumentChange = (e) => {
        const val = e.target.value;
        if (/^\d*$/.test(val)) {
            setUserDocument(val);
        }
    };

    if (!question) {
        return <div>Cargando pregunta...</div>;
    }

    // Crear array de opciones
    const options = [];
    if (question.optionA) options.push({ label: 'A', text: question.optionA });
    if (question.optionB) options.push({ label: 'B', text: question.optionB });
    if (question.optionC) options.push({ label: 'C', text: question.optionC });
    if (question.optionD) options.push({ label: 'D', text: question.optionD });

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>Juego de Preguntas</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre: </label>
                    <input
                        type="text"
                        required
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                    />
                </div>
                <div>
                    <label>Correo: </label>
                    <input
                        type="email"
                        required
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label>Documento: </label>
                    <input
                        type="text"
                        required
                        value={userDocument}
                        onChange={handleDocumentChange}
                    />
                </div>

                <hr />

                <h3>{question.questionText}</h3>
                {options.map((opt) => (
                    <div key={opt.label}>
                        <label>
                            <input
                                type="radio"
                                name="chosenOption"
                                value={opt.label}
                                checked={chosenOption === opt.label}
                                onChange={(e) => setChosenOption(e.target.value)}
                                required
                            />
                            {opt.label}) {opt.text}
                        </label>
                    </div>
                ))}

                <button type="submit" style={{ marginTop: '10px' }}>
                    Enviar Respuesta
                </button>
            </form>

            <ToastContainer />
        </div>
    );
}

export default QuizGame;
