package com.example.backend.controller;

import com.example.backend.model.Wishlist;
import com.example.backend.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

import com.example.backend.security.JwtUtil;
import com.example.backend.service.UserService;
import com.example.backend.model.User;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    // Add to wishlist
    @PostMapping
    public ResponseEntity<?> addToWishlist(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, Long> payload) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Error: Missing or invalid Authorization header");
            }
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            User currentUser = userService.findByEmail(email);
            if (currentUser == null) return ResponseEntity.status(400).body("Error: Invalid Token User");

            Long itemId = payload.get("itemId");
            Wishlist wishlist = wishlistService.addToWishlist(currentUser.getId(), itemId);
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
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long wishlistId, @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Error: Missing or invalid Authorization header");
            }
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            User currentUser = userService.findByEmail(email);
            if (currentUser == null) return ResponseEntity.status(400).body("Error: Invalid Token User");

            wishlistService.removeFromWishlist(wishlistId, currentUser.getId());
            return ResponseEntity.ok("Removed from wishlist");
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
}