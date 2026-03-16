package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.service.CartService;
import com.example.backend.service.UserService;
import com.example.backend.security.JwtUtil;

import java.util.Map;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestHeader("Authorization") String authHeader,
                                       @RequestBody Map<String, Object> body) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            if (email == null) return ResponseEntity.status(401).body("Invalid token");

            var user = userService.findByEmail(email);
            if (user == null) return ResponseEntity.status(401).body("User not found for token");

            Long itemId = Long.valueOf(String.valueOf(body.getOrDefault("itemId", "0")));
            Integer qty = Integer.valueOf(String.valueOf(body.getOrDefault("quantity", "1")));

            String result = cartService.addToCart(user.getId(), itemId, qty);
            if (result.startsWith("Success")) return ResponseEntity.ok(result);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error adding to cart: " + e.getMessage());
        }
    }

    @GetMapping("")
    public ResponseEntity<?> getCart(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            if (email == null) return ResponseEntity.status(401).body("Invalid token");

            var user = userService.findByEmail(email);
            if (user == null) return ResponseEntity.status(401).body("User not found for token");

            var items = cartService.getCartForUser(user.getId());
            // Map to simple response
            var resp = new java.util.ArrayList<java.util.Map<String,Object>>();
            for (var ci : items) {
                var m = new java.util.HashMap<String,Object>();
                m.put("cartId", ci.getId());
                m.put("quantity", ci.getQuantity());
                var item = ci.getItem();
                var itemMap = new java.util.HashMap<String,Object>();
                itemMap.put("id", item.getId());
                itemMap.put("name", item.getName());
                itemMap.put("price", item.getPrice());
                itemMap.put("imageUrls", item.getImageUrls());
                m.put("item", itemMap);
                resp.add(m);
            }
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching cart: " + e.getMessage());
        }
    }

    @DeleteMapping("/{cartId}")
    public ResponseEntity<?> removeCartItem(@RequestHeader("Authorization") String authHeader, @PathVariable Long cartId) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            if (email == null) return ResponseEntity.status(401).body("Invalid token");

            var user = userService.findByEmail(email);
            if (user == null) return ResponseEntity.status(401).body("User not found for token");

            String result = cartService.removeCartItem(user.getId(), cartId);
            if (result.startsWith("Success")) return ResponseEntity.ok(result);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error removing cart item: " + e.getMessage());
        }
    }
}
