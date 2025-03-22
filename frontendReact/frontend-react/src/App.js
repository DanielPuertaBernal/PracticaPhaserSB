import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DragDropGame from './components/DragDropGame';
import QuizGame from './components/QuizGame';
import Login from './components/Login'; // <-- Importa el componente

function App() {
    return (
        <Router>
            <div>
                <h1>Mi Aplicación de Juegos</h1>

                {/* Menú principal */}
                <nav style={{ marginBottom: '20px' }}>
                    <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
                    <Link to="/dragdrop" style={{ marginRight: '10px' }}>Juego Drag & Drop</Link>
                    <Link to="/quizgame">Juego de Preguntas</Link>
                </nav>

                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/dragdrop" element={<DragDropGame />} />
                    <Route path="/quizgame" element={<QuizGame />} />
                    {/* Ruta por defecto (opcional) */}
                    <Route path="/" element={<Home />} />
                </Routes>
            </div>
        </Router>
    );
}

// Componente de bienvenida (opcional)
function Home() {
    return <h2>Selecciona un juego en el menú</h2>;
}

export default App;
