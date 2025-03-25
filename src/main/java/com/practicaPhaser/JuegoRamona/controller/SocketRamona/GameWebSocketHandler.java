package com.practicaPhaser.JuegoRamona.controller.SocketRamona;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.practicaPhaser.JuegoRamona.repositories.JuegoRamona.JuegoRamonaRepository;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

public class GameWebSocketHandler extends TextWebSocketHandler {
    private final JuegoRamonaRepository juegoRamonaRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Set<WebSocketSession> sessions = new HashSet<>();
    private WebSocketSession mainPlayerSession = null;

    public GameWebSocketHandler(JuegoRamonaRepository repository) {
        this.juegoRamonaRepository = repository;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        if (mainPlayerSession == null) {
            mainPlayerSession = session;
            sendRoleAssignment(session, false); // Primer jugador
        } else {
            sendRoleAssignment(session, true); // Observador
        }
    }

    private void sendRoleAssignment(WebSocketSession session, boolean isObserver) throws IOException {
        String message = objectMapper.writeValueAsString(
                objectMapper.createObjectNode()
                        .put("type", "ASSIGN_ROLE")
                        .put("isObserver", isObserver)
        );
        session.sendMessage(new TextMessage(message));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JsonNode node = objectMapper.readTree(message.getPayload());
        if ("MOVE".equals(node.get("type").asText()) && session == mainPlayerSession) {
            broadcast(message);
        }
    }

    private void broadcast(TextMessage message) throws IOException {
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                session.sendMessage(message);
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
        if (session == mainPlayerSession) {
            mainPlayerSession = null; // Liberar el jugador principal
        }
    }
}