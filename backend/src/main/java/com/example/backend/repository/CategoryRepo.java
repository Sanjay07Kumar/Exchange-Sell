package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.backend.model.Category;
@Repository
public interface CategoryRepo extends JpaRepository<Category, Long> {
    Category findByNameIgnoreCase(String name);

}
