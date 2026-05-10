package com.example.backend.service;

import com.example.backend.dto.ChatRoomDTO;
import com.example.backend.dto.NegotiationMessage;
import com.example.backend.model.ChatMessage;
import com.example.backend.model.ChatRoom;
import com.example.backend.model.Item;
import com.example.backend.model.User;
import com.example.backend.repository.ChatMessageRepo;
import com.example.backend.repository.ChatRoomRepo;
import com.example.backend.repository.ItemRepo;
import com.example.backend.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ChatService {

    @Autowired
    private ChatRoomRepo chatRoomRepo;

    @Autowired
    private ChatMessageRepo chatMessageRepo;

    @Autowired
    private ItemRepo itemRepo;

    @Autowired
    private UserRepo userRepo;

    public ChatRoom getOrCreateRoom(Long itemId, Long buyerId) throws Exception {
        Item item = itemRepo.findById(itemId).orElseThrow(() -> new Exception("Item not found"));
        User buyer = userRepo.findById(buyerId).orElseThrow(() -> new Exception("Buyer not found"));
        
        if (item.getOwner().getId() == buyerId) {
            throw new Exception("Owner cannot negotiate with themselves");
        }

        Optional<ChatRoom> existing = chatRoomRepo.findByItemAndBuyer(item, buyer);
        if (existing.isPresent()) {
            return existing.get();
        }

        ChatRoom room = new ChatRoom();
        room.setItem(item);
        room.setBuyer(buyer);
        room.setSeller(item.getOwner());
        room.setLastUpdated(System.currentTimeMillis());
        return chatRoomRepo.save(room);
    }

    public List<ChatRoomDTO> getUserChatRooms(Long userId) {
        List<ChatRoom> rooms = chatRoomRepo.findByUserId(userId);
        List<ChatRoomDTO> dtos = new ArrayList<>();

        for (ChatRoom room : rooms) {
            ChatRoomDTO dto = new ChatRoomDTO();
            dto.setId(room.getId());
            dto.setItemId(room.getItem().getId());
            dto.setItemName(room.getItem().getName());
            
            if (room.getItem().getImageUrls() != null && !room.getItem().getImageUrls().isEmpty()) {
                dto.setItemImageUrl(room.getItem().getImageUrls().get(0));
            }

            User otherUser = room.getBuyer().getId() == userId ? room.getSeller() : room.getBuyer();
            dto.setOtherUserName(otherUser.getUsername());
            dto.setOtherUserEmail(otherUser.getEmail());
            dto.setOtherUserPhoto(otherUser.getProfilePhotoUrl());
            
            ChatMessage lastMsg = chatMessageRepo.findFirstByChatRoomAndTypeNotOrderByTimestampDesc(room, "system");
            if (lastMsg != null) {
                dto.setLastMessage(lastMsg.getText());
            } else {
                dto.setLastMessage("No messages yet");
            }
            dto.setLastUpdated(room.getLastUpdated());
            dtos.add(dto);
        }
        return dtos;
    }

    public ChatRoom getRoom(Long roomId, Long userId) throws Exception {
        ChatRoom room = chatRoomRepo.findById(roomId).orElseThrow(() -> new Exception("Room not found"));
        if (room.getBuyer().getId() != userId && room.getSeller().getId() != userId) {
            throw new Exception("Not authorized to view this room");
        }
        return room;
    }

    public List<NegotiationMessage> getRoomMessages(Long roomId, Long userId) throws Exception {
        ChatRoom room = chatRoomRepo.findById(roomId).orElseThrow(() -> new Exception("Room not found"));
        if (room.getBuyer().getId() != userId && room.getSeller().getId() != userId) {
            throw new Exception("Not authorized to view these messages");
        }

        List<ChatMessage> messages = chatMessageRepo.findByChatRoomOrderByTimestampAsc(room);
        List<NegotiationMessage> dtos = new ArrayList<>();
        for (ChatMessage msg : messages) {
            if ("system".equals(msg.getType())) continue;

            NegotiationMessage dto = new NegotiationMessage();
            dto.setItemId(room.getItem().getId());
            dto.setSenderEmail(msg.getSender().getEmail());
            dto.setSenderRole(msg.getSender().getId() == room.getSeller().getId() ? "owner" : "buyer");
            dto.setText(msg.getText());
            dto.setImageUrl(msg.getImageUrl());
            dto.setTimestamp(msg.getTimestamp());
            dto.setType(msg.getType());
            dtos.add(dto);
        }
        return dtos;
    }

    public ChatMessage saveMessage(Long roomId, String senderEmail, String text, String type, String imageUrl) {
        Optional<ChatRoom> roomOpt = chatRoomRepo.findById(roomId);
        Optional<User> senderOpt = userRepo.findByEmail(senderEmail);

        if (roomOpt.isPresent() && senderOpt.isPresent()) {
            ChatRoom room = roomOpt.get();
            User sender = senderOpt.get();

            ChatMessage msg = new ChatMessage();
            msg.setChatRoom(room);
            msg.setSender(sender);
            msg.setText(text);
            msg.setImageUrl(imageUrl);
            msg.setTimestamp(System.currentTimeMillis());
            msg.setType(type);
            
            room.setLastUpdated(System.currentTimeMillis());
            chatRoomRepo.save(room);

            return chatMessageRepo.save(msg);
        }
        return null;
    }
}
