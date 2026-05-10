package com.example.backend.dto;

import lombok.Data;

@Data
public class ChatRoomDTO {
    private Long id;
    private Long itemId;
    private String itemName;
    private String itemImageUrl;
    private String otherUserName;
    private String otherUserEmail;
    private String otherUserPhoto;
    private String lastMessage;
    private long lastUpdated;
}
