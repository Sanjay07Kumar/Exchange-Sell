package com.example.backend.dto;

import lombok.Data;

@Data
public class ItemUpdateDTO {
    private String name;
    private String category;
    private Double price;
    private Boolean isNegotiable;
    private String description;
    private String imageUrl;
    private Boolean isAvailable;
    private String itemAge;
    private String condition;
    private Boolean forExchange;
}
