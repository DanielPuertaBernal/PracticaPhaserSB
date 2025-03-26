package com.practicaPhaser.JuegoRamona.config;

import com.practicaPhaser.JuegoRamona.controller.SocketRamona.GameWebSocketHandler;
import com.practicaPhaser.JuegoRamona.controller.SoketDragDrop.DragDropWebSocketHandler;
import com.practicaPhaser.JuegoRamona.repositories.JuegoRamona.JuegoRamonaRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final JuegoRamonaRepository juegoRamonaRepository;

    // Inyecta tu repositorio si lo necesitas en el handler de Ramona
    public WebSocketConfig(JuegoRamonaRepository juegoRamonaRepository) {
        this.juegoRamonaRepository = juegoRamonaRepository;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Handler para el juego Ramona (Phaser)
        registry.addHandler(gameWebSocketHandler(), "/game")
                .setAllowedOrigins("*");

        // Handler para el Drag & Drop
        registry.addHandler(dragDropWebSocketHandler(), "/dragdrop")
                .setAllowedOrigins("*");
    }

    @Bean
    public GameWebSocketHandler gameWebSocketHandler() {
        // Pasas el repositorio si lo requieres en el constructor
        return new GameWebSocketHandler(juegoRamonaRepository);
    }

    @Bean
    public DragDropWebSocketHandler dragDropWebSocketHandler() {
        return new DragDropWebSocketHandler();
    }
}
