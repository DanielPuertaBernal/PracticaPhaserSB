package com.practicaPhaser.JuegoRamona.controller.SoketDragDrop;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.CloseStatus;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

public class DragDropWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Set<WebSocketSession> sessions = new HashSet<>();
    private WebSocketSession mainPlayerSession = null;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);

        // El primer cliente será el jugador principal
        if (mainPlayerSession == null) {
            mainPlayerSession = session;
            sendRoleAssignment(session, false); // isObserver=false
        } else {
            sendRoleAssignment(session, true); // isObserver=true
        }
    }

    private void sendRoleAssignment(WebSocketSession session, boolean isObserver) throws IOException {
        String msg = objectMapper.createObjectNode()
                .put("type", "ASSIGN_ROLE")
                .put("isObserver", isObserver)
                .toString();
        session.sendMessage(new TextMessage(msg));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JsonNode node = objectMapper.readTree(message.getPayload());
        String type = node.get("type").asText();

        switch (type) {
            case "JOIN":
                // Rol del usuario si quieres, e.g. node.get("role").asText()
                break;

            case "UPDATE_ANSWERS":
                // Viene del jugador principal => reenviarlo a todos los OBSERVADORES
                if (session == mainPlayerSession) {
                    broadcastToObservers(message);
                }
                break;

            case "PAUSE_GAME":
            case "RESUME_GAME":
            case "END_GAME":
                // Viene del admin => reenviarlo solo al jugador principal
                if (mainPlayerSession != null && mainPlayerSession.isOpen() && session != mainPlayerSession) {
                    mainPlayerSession.sendMessage(message);
                }
                break;

            default:
                break;
        }
    }

    /**
     * Envía un mensaje a todos los que NO sean el jugador principal (es decir, los observadores).
     */
    private void broadcastToObservers(TextMessage message) throws IOException {
        for (WebSocketSession s : sessions) {
            if (s.isOpen() && s != mainPlayerSession) {
                s.sendMessage(message);
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
        if (session == mainPlayerSession) {
            mainPlayerSession = null;
        }
    }
}
