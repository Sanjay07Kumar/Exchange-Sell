package com.example.backend.dto;
import com.example.backend.model.Category;

import lombok.Data;

@Data
public class CategoryDTO {
    private Long id;
    private String name;
    private int productCount;

    public CategoryDTO(Category category) {
        this.id = category.getId();
        this.name = category.getName();
        this.productCount = 
            category.getItems() == null ? 0 : category.getItems().size();
    }

}
