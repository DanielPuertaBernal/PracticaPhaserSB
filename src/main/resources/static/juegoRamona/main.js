const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-container",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 300 },
            debug: true, // Activa el debug para ver colisiones
        },
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

let game = new Phaser.Game(config);
let player, platforms, cursors;
let isObserver = false;
let socket;

function preload() {
    this.load.image("background", "https://i.imgur.com/HRhd2RH.png");
}

function create() {
    console.log("Iniciando WebSocket...");
    socket = new WebSocket("ws://localhost:8080/game");

    socket.onopen = () => {
        console.log("WebSocket conectado");
        socket.send(JSON.stringify({ type: "JOIN" }));
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Mensaje WebSocket recibido:", data);

        if (data.type === "ASSIGN_ROLE") {
            isObserver = data.isObserver;
            console.log(isObserver ? "Modo observador" : "Modo jugador");
            initializeGame(this);
        } else if (data.type === "MOVE" && isObserver) {
            updateObserverView(data);
        }
    };

    socket.onerror = (error) => console.error("WebSocket Error:", error);
    socket.onclose = () => console.warn("WebSocket cerrado");
}

function initializeGame(scene) {
    console.log("Inicializando juego...");

    scene.add.image(400, 300, "background");

    platforms = scene.physics.add.staticGroup();
    const ground = scene.add.rectangle(400, 590, 800, 20, 0x0000ff);
    scene.physics.add.existing(ground, true);
    platforms.add(ground);

    player = scene.add.rectangle(100, 550, 40, 40, 0x00ff00);
    scene.physics.add.existing(player);

    if (!isObserver) {
        console.log("Modo jugador activado.");
        player.body.setCollideWorldBounds(true);
        scene.physics.add.collider(player, platforms);
        cursors = scene.input.keyboard.createCursorKeys();
    } else {
        console.log("Modo observador activado.");
        scene.cameras.main.setBackgroundColor("#444");
        scene.cameras.main.startFollow(player, true, 0.1, 0.1);
        scene.physics.add.collider(player, platforms); // ⚠️ Se agrega colisión en el observador
    }
}

function update() {
    if (!player || isObserver) return;

    let velocityX = 0;

    if (cursors.left.isDown) velocityX = -160;
    else if (cursors.right.isDown) velocityX = 160;

    player.body.setVelocityX(velocityX);

    if (cursors.up.isDown && player.body.touching.down) {
        player.body.setVelocityY(-360);
    }

    sendPlayerState();
}

function sendPlayerState() {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: "MOVE",
            x: player.x,
            y: player.y,
            velocityX: player.body.velocity.x,
            velocityY: player.body.velocity.y
        }));
    }
}

function updateObserverView(data) {
    console.log("🔄 Actualizando vista del observador:", data);

    // Suavizar la transición del personaje sin romper colisiones
    player.x = Phaser.Math.Linear(player.x, data.x, 0.2);
    player.y = Phaser.Math.Linear(player.y, data.y, 0.2);

    // Aplicamos velocidad para simular mejor el movimiento
    player.body.setVelocity(data.velocityX, data.velocityY);
}