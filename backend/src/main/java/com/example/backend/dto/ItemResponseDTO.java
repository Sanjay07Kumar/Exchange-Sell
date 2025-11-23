package com.example.backend.dto;

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
    private String name;
    private String category;
    private Double price;
    private Boolean isNegotiable;
    private String description;
    private String imageUrl;
    private Boolean isAvailable;
    private Boolean forExchange;
    private String itemAge;
    private String condition;



    public ItemResponseDTO(Item item) {
    this.id = item.getId();
    this.name = item.getName();
    this.category = item.getCategory()!=null ? item.getCategory().getName() : null;;
    this.price = item.getPrice();
    this.isNegotiable = item.getIsNegotiable();
    this.description = item.getDescription();
    this.imageUrl = item.getImageUrl();
    this.isAvailable = item.getIsAvailable();
    this.forExchange = item.getForExchange();
    this.itemAge = item.getItemAge();
    this.condition = item.getCondition();
}

   
}