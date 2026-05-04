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

        // roomId ya room dono support karo
        String roomCode = null;
        if (json.has("roomId")) roomCode = json.get("roomId").asText();
        else if (json.has("room")) roomCode = json.get("room").asText();

        if (roomCode == null || roomCode.isEmpty()) {
            System.out.println("No roomCode found: " + payload);
            return;
        }

        if (type.equals("join") || type.equals("join-room")) {
            rooms.computeIfAbsent(roomCode, k -> new ArrayList<>()).add(session);
            session.getAttributes().put("room", roomCode);

            String joinedUserId = json.has("userId") ? json.get("userId").asText() : session.getId();
            session.getAttributes().put("userId", joinedUserId);

            System.out.println("User " + joinedUserId + " joined room: " + roomCode);

            // Baaki users ko notify karo
            List<WebSocketSession> roomUsers = rooms.get(roomCode);
            for (WebSocketSession user : roomUsers) {
                if (!user.getId().equals(session.getId()) && user.isOpen()) {
                    user.sendMessage(new TextMessage(
                            objectMapper.writeValueAsString(Map.of(
                                    "type", "user-joined",
                                    "userId", joinedUserId
                            ))
                    ));
                }
            }

        } else {
            // offer, answer, ice-candidate — targeted routing
            List<WebSocketSession> roomUsers = rooms.get(roomCode);
            if (roomUsers != null) {
                String toUserId = json.has("to") ? json.get("to").asText() : null;

                for (WebSocketSession user : roomUsers) {
                    if (!user.getId().equals(session.getId()) && user.isOpen()) {
                        if (toUserId != null) {
                            // Sirf us specific user ko bhejo
                            String uid = (String) user.getAttributes().get("userId");
                            if (toUserId.equals(uid)) {
                                user.sendMessage(new TextMessage(payload));
                                break;
                            }
                        } else {
                            // to field nahi hai to broadcast
                            user.sendMessage(new TextMessage(payload));
                        }
                    }
                }
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String roomCode = (String) session.getAttributes().get("room");
        String userId = (String) session.getAttributes().get("userId");

        if (roomCode != null && rooms.containsKey(roomCode)) {
            rooms.get(roomCode).remove(session);

            // Baaki users ko disconnect notify karo
            List<WebSocketSession> roomUsers = rooms.get(roomCode);
            if (roomUsers != null && userId != null) {
                for (WebSocketSession user : roomUsers) {
                    if (user.isOpen()) {
                        try {
                            user.sendMessage(new TextMessage(
                                    objectMapper.writeValueAsString(Map.of(
                                            "type", "user-left",
                                            "userId", userId
                                    ))
                            ));
                        } catch (Exception e) {
                            System.out.println("Error notifying user-left: " + e.getMessage());
                        }
                    }
                }
            }
        }

        System.out.println("Disconnected: " + session.getId() + " userId: " + userId);
    }
}