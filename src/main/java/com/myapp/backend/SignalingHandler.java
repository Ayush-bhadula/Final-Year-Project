package com.myapp.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SignalingHandler extends TextWebSocketHandler {

    private final Map<String, List<WebSocketSession>> rooms = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        System.out.println("Connected: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        JsonNode json = objectMapper.readTree(payload);

        String type = json.get("type").asText();
        String roomCode = json.get("room").asText();

        if (type.equals("join")) {
            rooms.computeIfAbsent(roomCode, k -> new ArrayList<>()).add(session);
            session.getAttributes().put("room", roomCode);
            System.out.println("Joined room: " + roomCode);
        } else {
            List<WebSocketSession> roomUsers = rooms.get(roomCode);
            if (roomUsers != null) {
                for (WebSocketSession user : roomUsers) {
                    if (!user.getId().equals(session.getId()) && user.isOpen()) {
                        user.sendMessage(new TextMessage(payload));
                    }
                }
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String roomCode = (String) session.getAttributes().get("room");
        if (roomCode != null && rooms.containsKey(roomCode)) {
            rooms.get(roomCode).remove(session);
        }
        System.out.println("Disconnected: " + session.getId());
    }
}