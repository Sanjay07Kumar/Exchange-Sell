package com.example.backend.repository;

import com.example.backend.model.ChatMessage;
import com.example.backend.model.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepo extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatRoomOrderByTimestampAsc(ChatRoom chatRoom);
    
    ChatMessage findFirstByChatRoomAndTypeNotOrderByTimestampDesc(ChatRoom chatRoom, String type);
}
