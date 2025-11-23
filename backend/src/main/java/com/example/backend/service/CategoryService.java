package com.example.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dto.CategoryDTO;
import com.example.backend.model.Category;
import com.example.backend.repository.CategoryRepo;

@Service
public class CategoryService {
    
    @Autowired
    public CategoryRepo categoryRepo;


    public Category addCategory(String name) {

        if(categoryRepo.findByNameIgnoreCase(name)!=null){
            throw new IllegalArgumentException("Category already exists");
        }   
        Category category=new Category();
        category.setName(name);
        return categoryRepo.save(category);
    } 


    public List<CategoryDTO> getAllCategories() {
        List<Category> categories=categoryRepo.findAll();
        
        return categories.stream()
            .map(CategoryDTO::new)
            .collect(Collectors.toList());
    }

    public Category getCategoryByName(String name) {
        return categoryRepo.findByNameIgnoreCase(name);
    }
}
