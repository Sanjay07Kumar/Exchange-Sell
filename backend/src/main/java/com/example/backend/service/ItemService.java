package com.example.backend.service;

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
// import com.example.backend.repository.UserRepo;

@Service
public class ItemService {

    @Autowired
    private ItemRepo itemRepo;

    // @Autowired
    // private UserRepo userRepo;

    @Autowired
    private CategoryService categoryService;

    // Get all items
    public List<Item> getAllItems() {
        return itemRepo.findAll();
    }
    
    
   public List<ItemResponseDTO> getMyItems(Long ownerId) {
    List<Item> items = itemRepo.findByOwnerId(ownerId);
    return items.stream()
        .map(ItemResponseDTO::new) // SIMPLIFIED/FIXED to use the updated constructor
        .collect(Collectors.toList());
    }
    public List<ItemResponseDTO> getItemsByCategoryName(String categoryName) {
        // Calls the repository method to find items where the linked Category's name matches
        List<Item> items = itemRepo.findByCategoryName(categoryName); 
        
        // Maps the list of Item entities to a list of ItemResponseDTOs
        return items.stream()
            .map(ItemResponseDTO::new)
            .collect(Collectors.toList());
    }
   


    // Add Item
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
        item.setImageUrl(dto.getImageUrl());
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


    // Update Item (Owner Validation)
    public String updateItem(Long itemId, Long ownerId, Item newItemData) {

        Optional<Item> optionalItem = itemRepo.findById(itemId);
        if (optionalItem.isEmpty()) return "Error: Item not found.";

        Item existingItem = optionalItem.get();

        // Ownership Check
        if (existingItem.getOwner().getId() != ownerId) {
            return "Error: You are NOT the owner of this item.";
    }


        // Update only non-null fields
        if (newItemData.getName() != null) existingItem.setName(newItemData.getName());
        if (newItemData.getCategory() != null) existingItem.setCategory(newItemData.getCategory());
        if (newItemData.getPrice() != null) existingItem.setPrice(newItemData.getPrice());
        if (newItemData.getIsNegotiable() != null) existingItem.setIsNegotiable(newItemData.getIsNegotiable());
        if (newItemData.getIsAvailable() != null) existingItem.setIsAvailable(newItemData.getIsAvailable());
        if (newItemData.getImageUrl() != null) existingItem.setImageUrl(newItemData.getImageUrl());
        if (newItemData.getCondition() != null) existingItem.setCondition(newItemData.getCondition());
        if (newItemData.getItemAge() != null) existingItem.setItemAge(newItemData.getItemAge());
        if (newItemData.getDescription() != null) existingItem.setDescription(newItemData.getDescription());

        try {
            itemRepo.save(existingItem);
            return "Success: Item Updated Successfully";
        } catch (Exception err) {
            return "Error: Failed to Update Item. Reason: " + err.getMessage();
        }
    }


    // Delete Item (Owner Only)
    public String removeItem(Long itemId, Long ownerId) {

        Optional<Item> optionalItem = itemRepo.findById(itemId);
        if (optionalItem.isEmpty()) return "Error: Item not found.";

        Item item = optionalItem.get();

        if (item.getOwner().getId() != ownerId) {
    return "Error: You are NOT allowed to delete this item.";
}


        try {
            itemRepo.delete(item);
            return "Success: Item Deleted Successfully";
        } catch (Exception e) {
            return "Error: Failed to delete item. Reason: " + e.getMessage();
        }
    }
}
