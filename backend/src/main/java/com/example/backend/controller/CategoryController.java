package com.example.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.CategoryDTO;
import com.example.backend.model.Category;
import com.example.backend.service.CategoryService;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // Add new category
    
    @PostMapping("/add")
    public ResponseEntity<?> addCategory(@RequestBody CategoryDTO categoryDTO) {
        try {
            return ResponseEntity.ok(categoryService.addCategory(categoryDTO.getName(), categoryDTO.getCategoryImg()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }


    // List all categories
    @GetMapping("/all")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }
    
}
