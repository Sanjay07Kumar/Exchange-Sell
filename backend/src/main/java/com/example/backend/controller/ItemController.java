package com.example.backend.controller;

import java.security.Principal;
import java.util.List;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.ItemRequestDTO;
import com.example.backend.dto.ItemResponseDTO;
import com.example.backend.model.Item;
import com.example.backend.model.User;
import com.example.backend.security.JwtUtil;
import com.example.backend.service.ItemService;
import com.example.backend.service.UserService;

@RestController
@RequestMapping("/items")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // Get all items
    @GetMapping("/all")
    public ResponseEntity<?> getAllItems() {
        try {
            return ResponseEntity.ok(itemService.getAllItems());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching all items: " + e.getMessage());
        }
    }

    // Get all items except those posted by the current user
    @GetMapping("/others-items")
    public ResponseEntity<?> getAllItemsExceptMine(@RequestHeader("Authorization") String authHeader) {
        try {
            // Extract and validate token
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Error: Missing or invalid Authorization header");
            }
            
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            
            User currentUser = userService.findByEmail(email);
            if (currentUser == null) {
                return ResponseEntity.status(400).body("Error: Invalid Token User");
            }
            
            // Use the repository query method
            List<ItemResponseDTO> otherItems = itemService.getAllItemsExceptOwner(currentUser.getId());
            
            return ResponseEntity.ok(otherItems);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching other items: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getItemById(@PathVariable long id) {
        try {
            ItemResponseDTO item = itemService.getItemById(id);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Item not Found");
        }
    }

    // Get my items
    @GetMapping("/my-items")
    public ResponseEntity<?> getAllMyItems(Principal principal) {
        try {
            User owner = userService.findByEmail(principal.getName());
            if (owner == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error: Authenticated user not found.");

            List<ItemResponseDTO> myItems = itemService.getMyItems(owner.getId());
            return ResponseEntity.ok(myItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching my items: " + e.getMessage());
        }
    }

    // Add new item - accept multipart/form-data (form fields + images)
    @PostMapping(value = "/add-items", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addItem(
            @RequestParam("name") String name,
            @RequestParam("categoryId") String categoryIdStr,
            @RequestParam(value = "price", required = false) String priceStr,
            @RequestParam(value = "isNegotiable", required = false) String isNegotiableStr,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "isAvailable", required = false) String isAvailableStr,
            @RequestParam(value = "forExchange", required = false) String forExchangeStr,
            @RequestParam(value = "itemAge", required = false) String itemAge,
            @RequestParam(value = "condition", required = false) String condition,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestHeader("Authorization") String authHeader) {
        try {
            System.out.println("[DEBUG] addItem called with name=" + name + ", categoryId=" + categoryIdStr);
            
            // Extract and validate token
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Error: Missing or invalid Authorization header");
            }
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            System.out.println("[DEBUG] Token email: " + email);

            User owner = userService.findByEmail(email);
            if (owner == null) return ResponseEntity.status(400).body("Error: Invalid Token User");
            System.out.println("[DEBUG] Owner found: " + owner.getId());

            // Build DTO with safe parsing
            ItemRequestDTO dto = new ItemRequestDTO();
            dto.setName(name != null ? name : "");
            
            // Parse categoryId - REQUIRED
            Long categoryId = null;
            if (categoryIdStr != null && !categoryIdStr.isEmpty()) {
                try {
                    categoryId = Long.valueOf(categoryIdStr);
                } catch (NumberFormatException e) {
                    System.err.println("[ERROR] Invalid categoryId: " + categoryIdStr);
                    return ResponseEntity.status(400).body("Error: Invalid categoryId format");
                }
            }
            if (categoryId == null) {
                return ResponseEntity.status(400).body("Error: categoryId is required");
            }
            dto.setCategoryId(categoryId);
            System.out.println("[DEBUG] Category ID parsed: " + categoryId);
            
            // Parse optional numeric fields
            Double price = null;
            if (priceStr != null && !priceStr.isEmpty()) {
                try {
                    price = Double.valueOf(priceStr);
                } catch (NumberFormatException e) {
                    System.err.println("[ERROR] Invalid price: " + priceStr);
                    return ResponseEntity.status(400).body("Error: Invalid price format");
                }
            }
            dto.setPrice(price);
            
            // Parse boolean fields
            dto.setIsNegotiable("true".equalsIgnoreCase(isNegotiableStr) || "on".equalsIgnoreCase(isNegotiableStr));
            dto.setDescription(description != null ? description : "");
            dto.setIsAvailable(isAvailableStr == null ? Boolean.TRUE : ("true".equalsIgnoreCase(isAvailableStr) || "on".equalsIgnoreCase(isAvailableStr)));
            dto.setForExchange(forExchangeStr == null ? Boolean.FALSE : ("true".equalsIgnoreCase(forExchangeStr) || "on".equalsIgnoreCase(forExchangeStr)));
            dto.setItemAge(itemAge != null ? itemAge : "");
            dto.setCondition(condition != null ? condition : "");

            // Save files and set image URLs
            List<String> imageUrls = new ArrayList<>();
            if (images != null && !images.isEmpty()) {
                System.out.println("[DEBUG] Saving " + images.size() + " images");
                imageUrls = itemService.saveUploadedFiles(images);
            }
            dto.setImageUrls(imageUrls);
            System.out.println("[DEBUG] Image URLs: " + imageUrls);

            // Add item via service
            String response = itemService.addItem(dto, owner);
            System.out.println("[DEBUG] Service response: " + response);
            if (response.startsWith("Success")) return ResponseEntity.ok(response);

            return ResponseEntity.status(400).body(response);

        } catch (Exception e) {
            System.err.println("[ERROR] Exception in addItem: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error adding item: " + e.getMessage() + " | " + e.getClass().getSimpleName());
        }
    }

    // Update item
    @PutMapping("/update-item/{id}/owner/{ownerId}")
    public ResponseEntity<?> updateItem(@PathVariable Long id,
                                        @PathVariable Long ownerId,
                                        @RequestHeader("Authorization") String authHeader,
                                        @RequestBody Item item) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Error: Missing or invalid Authorization header");
            }
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            User currentUser = userService.findByEmail(email);
            if (currentUser == null) return ResponseEntity.status(400).body("Error: Invalid Token User");

            String result = itemService.updateItem(id, currentUser.getId(), item);
            if (result.startsWith("Success")) return ResponseEntity.ok(result);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating item: " + e.getMessage());
        }
    }

    // Delete item
    @DeleteMapping("/delete-item/{id}/owner/{ownerId}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id, 
                                        @PathVariable Long ownerId,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Error: Missing or invalid Authorization header");
            }
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            User currentUser = userService.findByEmail(email);
            if (currentUser == null) return ResponseEntity.status(400).body("Error: Invalid Token User");

            String result = itemService.removeItem(id, currentUser.getId());
            if (result.startsWith("Success")) return ResponseEntity.ok(result);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting item: " + e.getMessage());
        }
    }

    // Get items by category name
    @GetMapping("/category/name/{categoryName}")
    public ResponseEntity<?> getItemsByCategory(@PathVariable String categoryName) {
        try {
            List<ItemResponseDTO> items = itemService.getItemsByCategoryName(categoryName);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching items by category: " + e.getMessage());
        }
    }

    // Get items by category ID
    @GetMapping("/category/{id}")
    public ResponseEntity<?> getItemsByCategoryId(@PathVariable Long id) {
        try {
            List<ItemResponseDTO> items = itemService.getItemsByCategoryId(id);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching items for category ID " + id + ": " + e.getMessage());
        }
    }

    // Mark item as sold out
    @PutMapping("/mark-sold/{id}")
    public ResponseEntity<?> markItemAsSoldOut(@PathVariable Long id,
                                               @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Error: Missing or invalid Authorization header");
            }
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            User currentUser = userService.findByEmail(email);
            if (currentUser == null) return ResponseEntity.status(400).body("Error: Invalid Token User");

            String result = itemService.markItemAsSoldOut(id, currentUser.getId());
            if (result.startsWith("Success")) return ResponseEntity.ok(result);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error marking item as sold: " + e.getMessage());
        }
    }

    // Mark item as active (undo sold out)
    @PutMapping("/mark-active/{id}")
    public ResponseEntity<?> markItemAsActive(@PathVariable Long id,
                                              @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Error: Missing or invalid Authorization header");
            }
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            User currentUser = userService.findByEmail(email);
            if (currentUser == null) return ResponseEntity.status(400).body("Error: Invalid Token User");

            String result = itemService.markItemAsActive(id, currentUser.getId());
            if (result.startsWith("Success")) return ResponseEntity.ok(result);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error marking item as active: " + e.getMessage());
        }
    }

    // Get my sold items
    @GetMapping("/my-sold-items")
    public ResponseEntity<?> getMySoldItems(Principal principal) {
        try {
            User owner = userService.findByEmail(principal.getName());
            if (owner == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error: Authenticated user not found.");

            List<ItemResponseDTO> soldItems = itemService.getMySoldItems(owner.getId());
            return ResponseEntity.ok(soldItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching sold items: " + e.getMessage());
        }
    }
}