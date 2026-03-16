package com.example.backend.dto;

import java.util.List;

import lombok.Data;

@Data
public class ItemRequestDTO {
    private String name;
    private Long categoryId;
    private Double price;
    private Boolean isNegotiable;
    private String description;
    private List<String> imageUrls;
    private Boolean isAvailable;
    private Boolean forExchange;
    private String itemAge;
    private String condition;
}
