package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.CartItem;
import java.util.Optional;
import java.util.List;

@Repository
public interface CartItemRepo extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByUserIdAndItemId(Long userId, Long itemId);
    List<CartItem> findByUserId(Long userId);
}
