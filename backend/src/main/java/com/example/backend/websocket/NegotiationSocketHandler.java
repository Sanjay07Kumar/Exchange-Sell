package com.example.backend.websocket;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import com.example.backend.dto.NegotiationMessage;
import com.example.backend.model.ChatRoom;
import com.example.backend.model.User;
import com.example.backend.service.ChatService;
import com.example.backend.service.UserService;
import com.example.backend.security.JwtUtil;
import com.example.backend.repository.ChatRoomRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class NegotiationSocketHandler extends TextWebSocketHandler {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ChatService chatService;

    @Autowired
    private UserService userService;
    
    @Autowired
    private ChatRoomRepo chatRoomRepo;

    private final Map<String, Set<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();
    private final Map<String, String> sessionRoom = new ConcurrentHashMap<>();
    private final Map<String, String> sessionSenderEmail = new ConcurrentHashMap<>();
    private final Map<String, String> sessionSenderRole = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Map<String, String> params = parseQueryParams(session);
        String token = params.get("token");
        String roomIdValue = params.get("roomId");

        if (token == null || roomIdValue == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Missing token or roomId"));
            return;
        }

        String senderEmail;
        try {
            senderEmail = jwtUtil.extractUsername(token);
        } catch (Exception e) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Invalid token"));
            return;
        }

        Long roomId;
        try {
            roomId = Long.parseLong(roomIdValue);
        } catch (NumberFormatException e) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Invalid roomId"));
            return;
        }

        ChatRoom chatRoom = chatRoomRepo.findById(roomId).orElse(null);
        if (chatRoom == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Room not found"));
            return;
        }

        String room = "chat-room-" + roomId;
        roomSessions.computeIfAbsent(room, key -> Collections.newSetFromMap(new ConcurrentHashMap<>())).add(session);
        sessionRoom.put(session.getId(), room);
        sessionSenderEmail.put(session.getId(), senderEmail);

        var user = userService.findByEmail(senderEmail);
        String senderRole = "buyer";
        if (user != null && chatRoom.getSeller().getId() == user.getId()) {
            senderRole = "owner";
        }
        sessionSenderRole.put(session.getId(), senderRole);

        // No longer broadcasting 'joined' system message
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String room = sessionRoom.get(session.getId());
        if (room == null) {
            return;
        }

        String raw = message.getPayload();
        Map<String, Object> payload = objectMapper.readValue(raw, Map.class);
        String text = payload.getOrDefault("text", "").toString().trim();
        String imageUrl = payload.getOrDefault("imageUrl", "").toString().trim();
        if (text.isEmpty() && imageUrl.isEmpty()) {
            return;
        }

        String senderEmail = sessionSenderEmail.get(session.getId());
        String senderRole = sessionSenderRole.get(session.getId());
        if (senderEmail == null) {
            senderEmail = "unknown";
        }
        if (senderRole == null) {
            senderRole = "buyer";
        }

        String messageType = payload.getOrDefault("type", "message").toString();
        Long roomId = parseRoomId(room);
        ChatRoom chatRoom = chatRoomRepo.findById(roomId).orElse(null);
        Long itemId = chatRoom != null ? chatRoom.getItem().getId() : 0L;

        chatService.saveMessage(roomId, senderEmail, text, messageType, imageUrl.isEmpty() ? null : imageUrl);

        NegotiationMessage chatMessage = new NegotiationMessage(itemId, senderEmail, senderRole, text, imageUrl.isEmpty() ? null : imageUrl,
                System.currentTimeMillis(), messageType);
        broadcastToRoom(room, chatMessage);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String room = sessionRoom.remove(session.getId());
        String senderEmail = sessionSenderEmail.remove(session.getId());
        String senderRole = sessionSenderRole.remove(session.getId());

        if (room != null) {
            Set<WebSocketSession> sessions = roomSessions.get(room);
            if (sessions != null) {
                sessions.remove(session);
                // No longer broadcasting 'left' system message
            }
        }
    }

    private void broadcastToRoom(String room, NegotiationMessage message) {
        Set<WebSocketSession> sessions = roomSessions.get(room);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }
        try {
            TextMessage payload = new TextMessage(objectMapper.writeValueAsString(message));
            for (WebSocketSession session : new HashSet<>(sessions)) {
                if (session.isOpen()) {
                    try {
                        session.sendMessage(payload);
                    } catch (Exception ignored) {
                    }
                }
            }
        } catch (Exception ignored) {
        }
    }

    private static Map<String, String> parseQueryParams(WebSocketSession session) {
        Map<String, String> params = new HashMap<>();
        if (session.getUri() == null || session.getUri().getQuery() == null) {
            return params;
        }
        String query = session.getUri().getQuery();
        for (String part : query.split("&")) {
            int index = part.indexOf('=');
            if (index > 0) {
                String key = URLDecoder.decode(part.substring(0, index), StandardCharsets.UTF_8);
                String value = URLDecoder.decode(part.substring(index + 1), StandardCharsets.UTF_8);
                params.put(key, value);
            }
        }
        return params;
    }

    private static Long parseRoomId(String room) {
        try {
            return Long.parseLong(room.replace("chat-room-", ""));
        } catch (Exception e) {
            return null;
        }
    }
}
