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

        // El primer cliente que se conecta será el jugador principal
        if (mainPlayerSession == null) {
            mainPlayerSession = session;
            sendRoleAssignment(session, false); // isObserver = false
        } else {
            // Conexiones adicionales serán observadores
            sendRoleAssignment(session, true); // isObserver = true
        }
    }

    private void sendRoleAssignment(WebSocketSession session, boolean isObserver) throws IOException {
        String message = objectMapper.createObjectNode()
                .put("type", "ASSIGN_ROLE")
                .put("isObserver", isObserver)
                .toString();
        session.sendMessage(new TextMessage(message));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JsonNode node = objectMapper.readTree(message.getPayload());
        String type = node.get("type").asText();

        switch (type) {
            case "JOIN":
                // Si deseas usar 'role' (admin/player), puedes extraerlo aquí
                break;

            // Estos mensajes se retransmiten a todos solo si provienen del jugador principal
            case "MOVE":
            case "SPAWN_COIN":
            case "COIN_COLLECTED":
            case "TIME_UPDATE":
                if (session == mainPlayerSession) {
                    broadcast(message);
                }
                break;

            // Se raeenvían al jugador principal (admin -> jugador)
            case "PAUSE_GAME":
            case "RESUME_GAME":
                if (mainPlayerSession != null && mainPlayerSession.isOpen()) {
                    mainPlayerSession.sendMessage(message);
                }
                break;

            // END_GAME puede provenir del jugador o del admin
            case "END_GAME":
                if (session == mainPlayerSession) {
                    // Jugador terminó => avisar a todos
                    broadcast(message);
                } else {
                    // Admin fuerza final => solo al jugador
                    if (mainPlayerSession != null && mainPlayerSession.isOpen()) {
                        mainPlayerSession.sendMessage(message);
                    }
                }
                break;
        }
    }

    private void broadcast(TextMessage message) throws IOException {
        for (WebSocketSession s : sessions) {
            if (s.isOpen()) {
                s.sendMessage(message);
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
        if (session == mainPlayerSession) {
            mainPlayerSession = null; // Si se desconecta el jugador principal
        }
    }
}
