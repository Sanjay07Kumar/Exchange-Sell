package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NegotiationMessage {
    private Long itemId;
    private String senderEmail;
    private String senderRole;
    private String text;
    private String imageUrl;
    private long timestamp;
    private String type;
}
