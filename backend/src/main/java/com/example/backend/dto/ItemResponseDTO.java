package com.example.backend.dto;

import java.util.List;

import com.example.backend.model.Item;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItemResponseDTO {
    private Long id;
    private Long userId;
    private String name;
    private String category;
    private Double price;
    private Boolean isNegotiable;
    private String description;
    private List<String> imageUrls;
    private Boolean isAvailable;
    private Boolean forExchange;
    private String itemAge;
    private String condition;
    private String status;



    public ItemResponseDTO(Item item) {
    this.id = item.getId();
    this.userId = item.getOwner() != null ? item.getOwner().getId() : null;
    this.name = item.getName();
    this.category = item.getCategory()!=null ? item.getCategory().getName() : "unknown";
    this.price = item.getPrice();
    this.isNegotiable = item.getIsNegotiable();
    this.description = item.getDescription();
    this.imageUrls = item.getImageUrls();
    this.isAvailable = item.getIsAvailable();
    this.forExchange = item.getForExchange();
    this.itemAge = item.getItemAge();
    this.condition = item.getCondition();
    this.status = item.getStatus() != null ? item.getStatus().toString() : "ACTIVE";
}

   
}