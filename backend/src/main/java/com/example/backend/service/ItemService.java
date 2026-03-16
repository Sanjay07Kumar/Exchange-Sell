package com.example.backend.service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dto.ItemRequestDTO;
import com.example.backend.dto.ItemResponseDTO;
import com.example.backend.model.Category;
import com.example.backend.model.Item;
import com.example.backend.model.User;
import com.example.backend.repository.ItemRepo;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.UUID;

@Service
public class ItemService {

    @Autowired
    private ItemRepo itemRepo;

    @Autowired
    private CategoryService categoryService;

    // Get all items
    public List<Item> getAllItems() {
        return itemRepo.findAll();
    }

    // Get my items
    public List<ItemResponseDTO> getMyItems(Long ownerId) {
        List<Item> items = itemRepo.findByOwnerId(ownerId);
        if (items == null) return Collections.emptyList();
        return items.stream()
                .map(ItemResponseDTO::new)
                .collect(Collectors.toList());
    }

    // Get all items except those posted by a specific user (Java stream version)
    public List<ItemResponseDTO> getAllItemsExceptMine(Long userId) {
        List<Item> allItems = itemRepo.findAll();
        if (allItems == null || allItems.isEmpty()) {
            return Collections.emptyList();
        }
        
        // Filter out items where owner ID matches the given userId
        return allItems.stream()
                .filter(item -> item.getOwner().getId() != userId)
                .map(ItemResponseDTO::new)
                .collect(Collectors.toList());
    }

    // Get all items except owner (using repository query - more efficient)
    public List<ItemResponseDTO> getAllItemsExceptOwner(Long ownerId) {
        List<Item> items = itemRepo.findByOwnerIdNot(ownerId);
        if (items == null || items.isEmpty()) {
            return Collections.emptyList();
        }
        return items.stream()
                .map(ItemResponseDTO::new)
                .collect(Collectors.toList());
    }

    public ItemResponseDTO getItemById(Long id) {
        Item item = itemRepo.findById(id) 
                .orElseThrow(() -> new RuntimeException("Item not found"));
        return new ItemResponseDTO(item);
    }

    // Get items by category name
    public List<ItemResponseDTO> getItemsByCategoryName(String categoryName) {
        List<Item> items = itemRepo.findByCategoryName(categoryName);
        if (items == null) return Collections.emptyList();
        return items.stream()
                .map(ItemResponseDTO::new)
                .collect(Collectors.toList());
    }

    // Get items by category ID
    public List<ItemResponseDTO> getItemsByCategoryId(Long id) {
        try {
            List<Item> items = itemRepo.findByCategoryId(id);
            if (items == null || items.isEmpty()) return Collections.emptyList();
            return items.stream()
                    .map(ItemResponseDTO::new)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    // Add item
    public String addItem(ItemRequestDTO dto, User owner) {
        Optional<Category> categoryOpt = categoryService.categoryRepo.findById(dto.getCategoryId());
        if (categoryOpt.isEmpty()) return "Error: Invalid Category ID";

        Category category = categoryOpt.get();

        Item item = new Item();
        item.setName(dto.getName());
        item.setCategory(category);
        item.setPrice(dto.getPrice());
        item.setIsNegotiable(dto.getIsNegotiable());
        item.setDescription(dto.getDescription());
        item.setImageUrls(dto.getImageUrls());
        item.setIsAvailable(dto.getIsAvailable());
        item.setForExchange(dto.getForExchange());
        item.setItemAge(dto.getItemAge());
        item.setCondition(dto.getCondition());
        item.setOwner(owner);

        try {
            itemRepo.save(item);
            return "Success: Item Added Successfully";
        } catch (Exception e) {
            return "Error: Failed to Add Item. Reason: " + e.getMessage();
        }
    }

    // Save uploaded files to local 'uploads' folder and return accessible URLs
    public List<String> saveUploadedFiles(List<MultipartFile> files) {
        List<String> urls = new ArrayList<>();
        if (files == null || files.isEmpty()) return urls;

        try {
            Path uploadDir = getUploadDirectory();

            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) continue;
                String original = file.getOriginalFilename();
                String ext = "";
                if (original != null && original.contains(".")) {
                    ext = original.substring(original.lastIndexOf('.'));
                }
                String filename = UUID.randomUUID().toString() + ext;
                Path target = uploadDir.resolve(filename);
                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
                // URL path served by resource handler
                urls.add("/uploads/" + filename);
            }
        } catch (IOException e) {
            System.err.println("Error saving uploaded files: " + e.getMessage());
            e.printStackTrace();
        }

        return urls;
    }

    // Get absolute uploads directory path, creating if needed
    private Path getUploadDirectory() throws IOException {
        Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads").toAbsolutePath();
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }
        return uploadDir;
    }

    // Update item - FIXED LINE 175
    public String updateItem(Long itemId, Long ownerId, Item newItemData) {
        Optional<Item> optionalItem = itemRepo.findById(itemId);
        if (optionalItem.isEmpty()) return "Error: Item not found.";

        Item existingItem = optionalItem.get();
        // FIX: Convert to long for comparison or use !=
        if (existingItem.getOwner().getId() != ownerId)
            return "Error: You are NOT the owner of this item.";

        if (newItemData.getName() != null) existingItem.setName(newItemData.getName());
        if (newItemData.getCategory() != null) existingItem.setCategory(newItemData.getCategory());
        if (newItemData.getPrice() != null) existingItem.setPrice(newItemData.getPrice());
        if (newItemData.getIsNegotiable() != null) existingItem.setIsNegotiable(newItemData.getIsNegotiable());
        if (newItemData.getIsAvailable() != null) existingItem.setIsAvailable(newItemData.getIsAvailable());
        if (newItemData.getImageUrls() != null) existingItem.setImageUrls(newItemData.getImageUrls());
        if (newItemData.getCondition() != null) existingItem.setCondition(newItemData.getCondition());
        if (newItemData.getItemAge() != null) existingItem.setItemAge(newItemData.getItemAge());
        if (newItemData.getDescription() != null) existingItem.setDescription(newItemData.getDescription());

        try {
            itemRepo.save(existingItem);
            return "Success: Item Updated Successfully";
        } catch (Exception e) {
            return "Error: Failed to Update Item. Reason: " + e.getMessage();
        }
    }

    // Delete item - FIXED LINE 202
    public String removeItem(Long itemId, Long ownerId) {
        Optional<Item> optionalItem = itemRepo.findById(itemId);
        if (optionalItem.isEmpty()) return "Error: Item not found.";

        Item item = optionalItem.get();
        // FIX: Convert to long for comparison or use !=
        if (item.getOwner().getId() != ownerId)
            return "Error: You are NOT allowed to delete this item.";
        try {
            itemRepo.delete(item);
            return "Success: Item Deleted Successfully";
        } catch (Exception e) {
            return "Error: Failed to delete item. Reason: " + e.getMessage();
        }
    }
}