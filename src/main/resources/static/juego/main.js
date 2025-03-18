const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#2d2d2d",
    parent: "game-container",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 300 },
            debug: false,
        },
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

// Variable global de Phaser
let game = new Phaser.Game(config);

// Variables de juego
let player, platforms;
let isPaused = false; // Para saber si el juego está en pausa
let playerName = "";
let tiempo = 0;
let monedasObtenidas = 0;
let timeText, scoreText;

// Botones (referencias del DOM)
let pauseBtn, finalizarBtn, repetirBtn;

// Escena: Preload
function preload() {
    // No se cargan assets, usaremos figuras
}

// Escena: Create
function create() {
    // Solicitar nombre
    playerName = prompt("Ingresa tu nombre de jugador:") || "Jugador";

    // Crear plataformas (rectángulos azules)
    platforms = this.physics.add.staticGroup();
    const ground = this.add.rectangle(400, 590, 800, 20, 0x0000ff);
    this.physics.add.existing(ground, true);
    platforms.add(ground);

    const platform1 = this.add.rectangle(300, 400, 200, 20, 0x0000ff);
    this.physics.add.existing(platform1, true);
    platforms.add(platform1);

    const platform2 = this.add.rectangle(600, 300, 200, 20, 0x0000ff);
    this.physics.add.existing(platform2, true);
    platforms.add(platform2);

    const platform3 = this.add.rectangle(150, 200, 200, 20, 0x0000ff);
    this.physics.add.existing(platform3, true);
    platforms.add(platform3);

    // Jugador (cubo verde)
    player = this.add.rectangle(100, 550, 40, 40, 0x00ff00);
    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);
    this.physics.add.collider(player, platforms);

    // Crear la primera moneda
    createCoin(this);

    // Texto de tiempo y monedas
    timeText = this.add.text(20, 20, "Tiempo: 0", { fontSize: "20px", fill: "#fff" });
    scoreText = this.add.text(20, 50, "Monedas: 0", { fontSize: "20px", fill: "#fff" });

    // Referencias a los botones del DOM
    pauseBtn = document.getElementById("pause-btn");
    finalizarBtn = document.getElementById("finalizar-btn");
    repetirBtn = document.getElementById("repetir-btn");

    // Listeners
    pauseBtn.addEventListener("click", () => togglePause());
    finalizarBtn.addEventListener("click", () => finalizarPartida());
    repetirBtn.addEventListener("click", () => repetirPartida());

    // Controles de teclado (flechas)
    this.input.keyboard.createCursorKeys();
}

// Escena: Update
function update(_, delta) {
    // Si el juego NO está en pausa, incrementamos el tiempo y permitimos movimiento
    if (!isPaused) {
        tiempo += delta / 1000;
        timeText.setText("Tiempo: " + Math.floor(tiempo));

        // Movimiento del jugador
        const cursors = this.input.keyboard.createCursorKeys();
        if (cursors.left.isDown) {
            player.body.setVelocityX(-160);
        } else if (cursors.right.isDown) {
            player.body.setVelocityX(160);
        } else {
            player.body.setVelocityX(0);
        }

        // Salto
        if (cursors.up.isDown && player.body.touching.down) {
            player.body.setVelocityY(-360);
        }
    } else {
        // Si está en pausa, no movemos al jugador
        player.body.setVelocityX(0);
    }
}

// Crea una moneda en una posición aleatoria
function createCoin(scene) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const coinRect = scene.add.rectangle(x, y, 20, 20, 0xffff00);
    scene.physics.add.existing(coinRect);
    coinRect.body.setAllowGravity(false);

    // Detectar cuando el jugador solape la moneda
    scene.physics.add.overlap(player, coinRect, () => collectCoin(scene, coinRect));
}

// Al recoger la moneda
function collectCoin(scene, coinRect) {
    coinRect.destroy();
    monedasObtenidas++;
    scoreText.setText("Monedas: " + monedasObtenidas);

    // Crear otra moneda en posición aleatoria
    createCoin(scene);
}


// Pausar / Reanudar el juego
function togglePause() {
    if (!isPaused) {
        // Pausar
        isPaused = true;
        game.scene.pause();
        pauseBtn.textContent = "Reanudar";
    } else {
        // Reanudar
        isPaused = false;
        game.scene.resume();
        pauseBtn.textContent = "Pausar";
    }
}

// Finalizar partida
function finalizarPartida() {
    // Pausar el juego
    isPaused = true;
    game.scene.pause();

    // Enviar datos al backend
    fetch("/api/juego", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombreJugador: playerName,
            tiempo: Math.floor(tiempo),
            monedasObtenidas: monedasObtenidas,
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            console.log("Partida guardada:", data);
            // Mostrar pantalla de resultados
            mostrarResultados();
        })
        .catch((err) => console.error("Error:", err));
}

// Muestra la capa de resultados y detalla el tiempo y monedas
function mostrarResultados() {
    const resultadosDiv = document.getElementById("resultados");
    const detalleResultado = document.getElementById("detalle-resultado");
    resultadosDiv.style.display = "flex";

    detalleResultado.innerText = `
    Jugador: ${playerName}
    \nTiempo: ${Math.floor(tiempo)} segundos
    \nMonedas: ${monedasObtenidas}
  `;
}

// Repetir la partida (reiniciar)
function repetirPartida() {
    // Opción 1: recargar la página
    window.location.reload();
    // Restauramos texto de botón de pausa
    pauseBtn.textContent = "Pausar";
}
