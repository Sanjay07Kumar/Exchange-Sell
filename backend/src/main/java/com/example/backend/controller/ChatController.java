package com.example.backend.controller;

import com.example.backend.dto.ChatRoomDTO;
import com.example.backend.dto.NegotiationMessage;
import com.example.backend.model.ChatRoom;
import com.example.backend.model.User;
import com.example.backend.security.JwtUtil;
import com.example.backend.service.ChatService;
import com.example.backend.service.ItemService;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ItemService itemService;

    @Autowired
    private UserService userService;

    private User getAuthenticatedUser(String authHeader) throws Exception {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new Exception("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        User currentUser = userService.findByEmail(email);
        if (currentUser == null) throw new Exception("Invalid Token User");
        return currentUser;
    }

    @PostMapping("/rooms/item/{itemId}")
    public ResponseEntity<?> getOrCreateRoom(@PathVariable Long itemId, @RequestHeader("Authorization") String authHeader) {
        try {
            User currentUser = getAuthenticatedUser(authHeader);
            ChatRoom room = chatService.getOrCreateRoom(itemId, currentUser.getId());
            return ResponseEntity.ok(Map.of("roomId", room.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/rooms")
    public ResponseEntity<?> getUserRooms(@RequestHeader("Authorization") String authHeader) {
        try {
            User currentUser = getAuthenticatedUser(authHeader);
            List<ChatRoomDTO> rooms = chatService.getUserChatRooms(currentUser.getId());
            return ResponseEntity.ok(rooms);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<?> getRoomMessages(@PathVariable Long roomId, @RequestHeader("Authorization") String authHeader) {
        try {
            User currentUser = getAuthenticatedUser(authHeader);
            List<NegotiationMessage> messages = chatService.getRoomMessages(roomId, currentUser.getId());
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<?> getRoom(@PathVariable Long roomId, @RequestHeader("Authorization") String authHeader) {
        try {
            User currentUser = getAuthenticatedUser(authHeader);
            ChatRoom room = chatService.getRoom(roomId, currentUser.getId());
            return ResponseEntity.ok(Map.of("itemId", room.getItem().getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/rooms/{roomId}/upload-image")
    public ResponseEntity<?> uploadRoomImage(
            @PathVariable Long roomId,
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("image") MultipartFile image
    ) {
        try {
            User currentUser = getAuthenticatedUser(authHeader);
            chatService.getRoom(roomId, currentUser.getId());
            if (image == null || image.isEmpty()) {
                return ResponseEntity.badRequest().body("No image file uploaded");
            }
            List<String> urls = itemService.saveUploadedFiles(List.of(image));
            if (urls.isEmpty()) {
                return ResponseEntity.status(500).body("Failed to upload image to Cloudinary");
            }
            return ResponseEntity.ok(Map.of("imageUrl", urls.get(0)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
