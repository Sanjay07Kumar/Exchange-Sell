package com.example.backend.controller;

import com.example.backend.model.Wishlist;
import com.example.backend.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    // Add to wishlist
    @PostMapping
    public ResponseEntity<?> addToWishlist(@RequestBody Map<String, Long> payload) {
        try {
            Long userId = payload.get("userId");
            Long itemId = payload.get("itemId");
            Wishlist wishlist = wishlistService.addToWishlist(userId, itemId);
            return ResponseEntity.ok(wishlist);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get wishlist for user
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserWishlist(@PathVariable Long userId) {
        try {
            List<Wishlist> wishlist = wishlistService.getUserWishlist(userId);
            return ResponseEntity.ok(wishlist);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Remove from wishlist
    @DeleteMapping("/{wishlistId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long wishlistId) {
        wishlistService.removeFromWishlist(wishlistId);
        return ResponseEntity.ok("Removed from wishlist");
    }
}