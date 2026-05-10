package com.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import com.example.backend.model.Item;
import com.example.backend.model.User;
import com.example.backend.model.Wishlist;
import com.example.backend.repository.ItemRepo;
import com.example.backend.repository.UserRepo;
import com.example.backend.repository.WishlistRepository;   
@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepo userRepository;
    private final ItemRepo itemRepository;

    public Wishlist addToWishlist(Long userId, Long itemId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new Exception("Item not found"));

        // Check if already exists
        boolean exists = wishlistRepository.existsByUserAndItemId(user, itemId);
        if (exists) throw new Exception("Item already in wishlist");

        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setItem(item);
        return wishlistRepository.save(wishlist);
    }

    public List<Wishlist> getUserWishlist(Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));
        return wishlistRepository.findByUser(user);
    }

    public void removeFromWishlist(Long wishlistId, Long userId) throws Exception {
        Wishlist wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new Exception("Wishlist item not found"));
        
        if (!wishlist.getUser().getId().equals(userId)) {
            throw new Exception("You are not authorized to remove this item");
        }
        
        wishlistRepository.deleteById(wishlistId);
    }
}