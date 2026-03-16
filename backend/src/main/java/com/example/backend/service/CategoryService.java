package com.example.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.backend.dto.CategoryDTO;
import com.example.backend.model.Category;
import com.example.backend.repository.CategoryRepo;

@Service
public class CategoryService {
    
    @Autowired
    public CategoryRepo categoryRepo;


    public Category addCategory(String name ,String categoryImg) {

        if(categoryRepo.findByNameIgnoreCase(name)!=null){
            throw new IllegalArgumentException("Category already exists");
        }   
        Category category=new Category();
        category.setName(name);
        category.setCategoryImg(categoryImg);
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

    public Category getCategoryById(Long id) {
    return categoryRepo.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
    }

}
