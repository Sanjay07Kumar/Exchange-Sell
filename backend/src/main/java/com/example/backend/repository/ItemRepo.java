package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Item;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepo extends JpaRepository<Item,Long>{

    public Optional<Item> findById(Long id);

    public List<Item> findByOwnerId(Long ownerId);

    public List<Item> findByCategoryName(String name);
}
