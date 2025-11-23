package com.example.backend.dto;

import lombok.Data;

@Data
public class ItemRequestDTO {
    private String name;
    private Long categoryId;
    private Double price;
    private Boolean isNegotiable;
    private String description;
    private String imageUrl;
    private Boolean isAvailable;
    private Boolean forExchange;
    private String itemAge;
    private String condition;
}
