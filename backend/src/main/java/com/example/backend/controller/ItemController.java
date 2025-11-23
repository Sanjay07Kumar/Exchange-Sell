package com.example.backend.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.ItemRequestDTO;
import com.example.backend.model.Item;
import com.example.backend.model.User;
import com.example.backend.security.JwtUtil;
import com.example.backend.service.ItemService;
import com.example.backend.service.UserService;

// import io.minio.credentials.Jwt;


@RestController
@RequestMapping("/items")
public class ItemController {

    @Autowired
    public ItemService itemService;

    @Autowired
    public UserService userService;

    @Autowired
    public JwtUtil jwtUtil;

    @GetMapping("/all")
    public ResponseEntity<?> getAllItems() {
        try {
            return ResponseEntity.ok(itemService.getAllItems());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/my-items")
    public ResponseEntity<?> getAllMyItems(Principal principal) {
        try {
            String ownerEmail = principal.getName();


            User owner=userService.findByEmail(ownerEmail);
            if (owner == null) {
                // This shouldn't happen with a valid token, but good practice to check
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Authenticated user not found.");
            }
            
            // // Fetch items posted by this user
            // List<Item> myItems = itemService.getMyItems(owner.getId());

            // 3. Pass the secure owner ID to the service
            return ResponseEntity.ok(itemService.getMyItems(owner.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching items: " + e.getMessage());
        }
    }
    
    @PostMapping("/add-items")
    public ResponseEntity<?> addItem(@RequestBody ItemRequestDTO dto,@RequestHeader("Authorization") String authHeader) {

        try {
        // Get token
        String token = authHeader.replace("Bearer ", "");

        // Extract email (username) from JWT
        String email = jwtUtil.extractUsername(token);

        // Get the logged-in user
        User owner = userService.findByEmail(email);
        if (owner == null) {
            return ResponseEntity.status(400).body("Error: Invalid Token User");
        }

        // Pass DTO + owner to service
        String response = itemService.addItem(dto, owner);

        if (response.startsWith("Success")) {
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(400).body(response);

    } catch (Exception e) {
        return ResponseEntity.status(500).body("Error: " + e.getMessage());
    }
}


    @PutMapping("/update-item/{id}/owner/{ownerId}")
    public ResponseEntity<String> updateItem(@PathVariable("id") Long id,@PathVariable("ownerId") Long ownerId,@RequestBody Item item) {

        String result = itemService.updateItem(id, ownerId, item);

        if (result.startsWith("Success")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
    }

    
    @DeleteMapping("/delete-item/{id}/owner/{ownerId}")
    public ResponseEntity<String> deleteItem(@PathVariable Long id,@PathVariable Long ownerId) {

        String result = itemService.removeItem(id, ownerId);

        if (result.startsWith("Success")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
    }



    @GetMapping("/category/{categoryName}")
    public ResponseEntity<?> getItemsByCategory(@PathVariable String categoryName) {
        try {
            return ResponseEntity.ok(itemService.getItemsByCategoryName(categoryName));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching items by category: " + e.getMessage());
        }
    }


    
}
