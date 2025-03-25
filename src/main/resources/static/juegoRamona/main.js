// Variables principales
let role = null;         // 'admin' o 'player'
let game = null;         // Referencia al objeto Phaser.Game
let isObserver = false;  // Indica si está en modo observador (admin)
let socket = null;

// Variables de Phaser
let player, platforms, cursors;
let tiempo = 0, monedasObtenidas = 0;
let isPaused = false;
let timeText, scoreText;

// Manejo de monedas
let coinIdCounter = 0; // ID incremental para cada moneda
const coins = {};      // Almacena las monedas: { [coinId]: <PhaserGameObject> }

// Referencias DOM
const menuDiv= document.getElementById("menu");
const gameContainer= document.getElementById("game-container");
const pauseBtn= document.getElementById("pause-btn");
const finalizarBtn= document.getElementById("finalizar-btn");
const repetirBtn= document.getElementById("repetir-btn");
const resultadosDiv= document.getElementById("resultados");
const detalleResultado= document.getElementById("detalle-resultado");
const pauseOverlay = document.getElementById("pause-overlay");
const resumeBtn = document.getElementById("resume-btn");

// Listeners del menú
document.getElementById("admin-option").addEventListener("click", () => startGame("admin"));
document.getElementById("player-option").addEventListener("click", () => startGame("player"));

// Botones de control (solo admin ve Pausa/Finalizar)
pauseBtn.addEventListener("click", togglePause);
finalizarBtn.addEventListener("click", finalizarPartida);
repetirBtn.addEventListener("click", () => window.location.reload());
resumeBtn.addEventListener("click", () => { reanudarPartida(); });

/* --------------------------------------------------------------------------
   1) INICIO DE JUEGO
   -------------------------------------------------------------------------- */
function startGame(selectedRole) {
    role = selectedRole; // 'admin' o 'player'
    menuDiv.style.display = "none";
    gameContainer.style.display = "block";

    if (role === "admin") {
        // Mostrar botones solo para el admin
        pauseBtn.style.display = "inline-block";
        finalizarBtn.style.display = "inline-block";
        resumeBtn.style.display = "inline-block";
        isObserver = true;
    } else {
        // Ocultar botones para el jugador
        pauseBtn.style.display = "none";
        finalizarBtn.style.display = "none";
        resumeBtn.style.display = "none";
        isObserver = false;
    }


    // Configuración de Phaser
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        backgroundColor: "#87CEEB",
        parent: "game-container",
        physics: {
            default: "arcade",
            arcade: { gravity: { y: 300 }, debug: true },
        },
        scene: { preload, create, update },
    };

    game = new Phaser.Game(config);
}

/* --------------------------------------------------------------------------
   2) ESCENA PHASER
   -------------------------------------------------------------------------- */
function preload() {
    // Cargar imágenes si fuera necesario
}

function create() {
    initWebSocket(); // Conexión WebSocket

    // Crear plataformas
    platforms = this.physics.add.staticGroup();
    addStaticPlatform(this, 400, 590, 800, 20); // Suelo
    addStaticPlatform(this, 300, 400, 200, 20);
    addStaticPlatform(this, 600, 300, 200, 20);
    addStaticPlatform(this, 150, 200, 200, 20);

    // Crear jugador
    player = this.add.rectangle(100, 550, 40, 40, 0x00ff00);
    this.physics.add.existing(player);

    // Textos de tiempo y monedas
    timeText  = this.add.text(20, 20, "Tiempo: 0", { fontSize: "20px", fill: "#fff" });
    scoreText = this.add.text(20, 50, "Monedas: 0", { fontSize: "20px", fill: "#fff" });

    if (!isObserver) {
        player.body.setCollideWorldBounds(true);
        this.physics.add.collider(player, platforms);
        cursors = this.input.keyboard.createCursorKeys();

        // Generar primera moneda
        spawnCoin();
    } else {
        // Observador: cámara estática
        this.physics.add.collider(player, platforms);
    }
}

function update(_, delta) {
    if (isPaused) return;

    if (!isObserver && player) {
        // Actualizar tiempo
        tiempo += delta / 1000;
        timeText.setText(`Tiempo: ${Math.floor(tiempo)}`);

        // Si pasa 1 min => terminar
        if (tiempo >= 60) {
            finalizarPartidaAuto();
            return;
        }

        // Movimiento jugador
        handlePlayerMovement();

        // Enviar estado al servidor
        sendTimeUpdate();
        sendPlayerState();
    }
}

/* Utilidad para crear plataformas */
function addStaticPlatform(scene, x, y, width, height) {
    const rect = scene.add.rectangle(x, y, width, height, 0x0000ff);
    scene.physics.add.existing(rect, true);
    platforms.add(rect);
}

/* --------------------------------------------------------------------------
   3) MONEDAS Y TIEMPO
   -------------------------------------------------------------------------- */
function spawnCoin() {
    const coinId = coinIdCounter++;
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);

    sendWSMessage("SPAWN_COIN", { coinId, x, y });
    createCoinLocal(coinId, x, y);
}

function createCoinLocal(coinId, x, y) {
    const scene = game.scene.scenes[0];
    const coin  = scene.add.rectangle(x, y, 20, 20, 0xffff00);
    scene.physics.add.existing(coin);
    coin.body.setAllowGravity(false);

    coins[coinId] = coin;

    // Solo el jugador detecta colisión
    if (!isObserver) {
        scene.physics.add.overlap(player, coin, () => {
            collectCoin(coinId);
        });
    }
}

function collectCoin(coinId) {
    const coin = coins[coinId];
    if (!coin) return;

    console.log("✅ Desactivando moneda en el jugador:", coinId);

    coin.setActive(false); // Desactivar física
    coin.setVisible(false); // Ocultar
    delete coins[coinId];   // Eliminar del objeto local

    monedasObtenidas++;
    scoreText.setText(`Monedas: ${monedasObtenidas}`);

    if (monedasObtenidas >= 5) {
        finalizarPartidaAuto();
        return;
    }

    sendWSMessage("COIN_COLLECTED", { coinId });
    spawnCoin();
}

function removeCoinLocal(coinId) {
    const coin = coins[coinId];
    if (!coin) return;
    coin.destroy();
    delete coins[coinId];
}

/* Envía tiempo y monedas al observador */
function sendTimeUpdate() {
    sendWSMessage("TIME_UPDATE", {
        tiempo: Math.floor(tiempo),
        monedas: monedasObtenidas
    });
}

/* Actualiza tiempo/monedas en el observador */
function updateTimeAndCoins(t, m) {
    tiempo = t;
    monedasObtenidas = m;
    timeText.setText(`Tiempo: ${tiempo}`);
    scoreText.setText(`Monedas: ${monedasObtenidas}`);
}

/* --------------------------------------------------------------------------
   4) COMUNICACIÓN WEBSOCKET
   -------------------------------------------------------------------------- */
function initWebSocket() {
    console.log("Iniciando WebSocket...");
    socket = new WebSocket("ws://localhost:8080/game");

    socket.onopen = () => {
        console.log("WebSocket conectado");
        sendWSMessage("JOIN", { role });
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("WS mensaje:", data);

        switch (data.type) {
            case "ASSIGN_ROLE":
                // Si deseas que el servidor decida 100%: isObserver = data.isObserver;
                break;
            case "MOVE":
                if (isObserver) updateObserverView(data);
                break;
            case "SPAWN_COIN":
                createCoinLocal(data.coinId, data.x, data.y);
                break;
            case "COIN_COLLECTED":
                removeCoinLocal(data.coinId);
                break;
            case "TIME_UPDATE":
                if (isObserver) updateTimeAndCoins(data.tiempo, data.monedas);
                break;
            case "PAUSE_GAME":
                if (!isObserver) pauseLocal();
                break;
            case "RESUME_GAME":
                if (!isObserver) {
                    // Jugador quita pausa
                    resumeLocal();
                }
                break;
            case "END_GAME":
                if (isObserver) {
                    // El jugador terminó la partida
                    alert("El estudiante terminó la actividad correctamente.");
                } else {
                    // Jugador finaliza localmente
                    finalizarPartida();
                }
                break;
        }
    };

    socket.onerror = (err) => console.error("WebSocket Error:", err);
    socket.onclose  = () => console.warn("WebSocket cerrado");
}

/* Helper para enviar mensajes al servidor */
function sendWSMessage(type, payload = {}) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type, ...payload }));
    }
}

/* --------------------------------------------------------------------------
   5) MOVIMIENTO JUGADOR
   -------------------------------------------------------------------------- */
function handlePlayerMovement() {
    let velocityX = 0;
    if (cursors.left.isDown)  velocityX = -160;
    else if (cursors.right.isDown) velocityX = 160;

    player.body.setVelocityX(velocityX);

    if (cursors.up.isDown && player.body.touching.down) {
        player.body.setVelocityY(-360);
    }
}

function sendPlayerState() {
    sendWSMessage("MOVE", {
        x: player.x,
        y: player.y,
        velocityX: player.body.velocity.x,
        velocityY: player.body.velocity.y
    });
}

function updateObserverView(data) {
    player.x = Phaser.Math.Linear(player.x, data.x, 0.2);
    player.y = Phaser.Math.Linear(player.y, data.y, 0.2);
    player.body.setVelocity(data.velocityX, data.velocityY);
}

/* --------------------------------------------------------------------------
   6) PAUSA Y FINALIZACIÓN
   -------------------------------------------------------------------------- */
function togglePause() {
    if (!isPaused) {
        sendWSMessage("PAUSE_GAME");
    } else {
        sendWSMessage("RESUME_GAME");
    }
}

function pauseLocal() {
    isPaused = true;
    game.scene.pause();
    pauseOverlay.style.display = "flex";

    // Solo si es admin alternamos la visibilidad de los botones
    if (role === "admin") {
        pauseBtn.style.display = "none";
        resumeBtn.style.display = "inline-block";
    }
}

function resumeLocal() {
    isPaused = false;
    game.scene.resume();
    pauseOverlay.style.display = "none";

    // Solo si es admin alternamos la visibilidad de los botones
    if (role === "admin") {
        resumeBtn.style.display = "none";
        pauseBtn.style.display = "inline-block";
    }
}

/**
 * Finaliza la partida manualmente (ADMIN)
 */
function finalizarPartida() {
    // Si es admin, envía END_GAME para forzar al jugador
    if (role === "admin") {
        sendWSMessage("END_GAME");
    }
    isPaused = true;
    game.scene.pause();
    pauseOverlay.style.display = "none";

    // Título normal: "Resultados"
    mostrarResultados("Resultados");
}

/**
 * Finaliza la partida automáticamente (JUGADOR)
 * - Por tiempo (60s) o por 5 monedas
 */
function finalizarPartidaAuto() {
    isPaused = true;
    game.scene.pause();
    pauseOverlay.style.display = "none";

    // Título especial: "El estudiante terminó la actividad correctamente"
    mostrarResultados("El estudiante terminó la actividad correctamente");

    // Avisar al servidor que el jugador terminó
    sendWSMessage("END_GAME");
}

/**
 * Muestra la pantalla de resultados con un título personalizable
 */
function mostrarResultados(titulo) {
    resultadosDiv.style.display = "flex";

    // Cambiamos el texto del <h2>
    const tituloElem = resultadosDiv.querySelector("h2");
    tituloElem.textContent = titulo;

    detalleResultado.innerText = `
        Tiempo: ${Math.floor(tiempo)} segundos
        Monedas: ${monedasObtenidas}
    `;
}
function reanudarPartida() {
    // Enviar mensaje al servidor para que el jugador reanude
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "RESUME_GAME" }));
    }
}