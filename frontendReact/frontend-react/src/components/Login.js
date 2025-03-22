// src/components/Login.jsx

import React, { useState } from 'react';
import Swal from 'sweetalert2';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch('http://localhost:8080/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                // Si no es 200 OK, forzamos un error para saltar al catch
                throw new Error('Credenciales inválidas');
            }

            // Asumiendo que el backend retorna un JSON con el token
            const data = await response.json();

            // data.token contendría el token devuelto por tu backend (por ejemplo "111")
            Swal.fire({
                title: 'Inicio de sesión exitoso',
                text: `Token: ${data.token}`,
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'Cerrar'
            });
        }
    };

    return (
        <div>
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Correo:</label>
                    <input
                        type="text"
                        placeholder="Ingresa tu correo"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ marginLeft: '5px' }}
                    />
                </div>
                <div style={{ marginTop: '10px' }}>
                    <label>Contraseña:</label>
                    <input
                        type="password"
                        placeholder="Ingresa tu contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ marginLeft: '5px' }}
                    />
                </div>
                <button type="submit" style={{ marginTop: '10px' }}>
                    Ingresar
                </button>
            </form>
        </div>
    );
}

export default Login;
