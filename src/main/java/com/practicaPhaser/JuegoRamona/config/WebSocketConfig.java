package com.practicaPhaser.JuegoRamona.config;

import com.practicaPhaser.JuegoRamona.controller.SocketRamona.GameWebSocketHandler;
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

    public WebSocketConfig(JuegoRamonaRepository repository) {
        this.juegoRamonaRepository = repository;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(gameWebSocketHandler(), "/game").setAllowedOrigins("*");
    }

    @Bean
    public GameWebSocketHandler gameWebSocketHandler() {
        return new GameWebSocketHandler(juegoRamonaRepository);
    }
}