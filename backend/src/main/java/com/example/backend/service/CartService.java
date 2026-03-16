package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.model.CartItem;
import com.example.backend.model.Item;
import com.example.backend.model.User;
import com.example.backend.repository.CartItemRepo;
import com.example.backend.repository.ItemRepo;
import com.example.backend.repository.UserRepo;

import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartItemRepo cartItemRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ItemRepo itemRepo;

    public String addToCart(Long userId, Long itemId, Integer quantity) {
        if (quantity == null || quantity <= 0) quantity = 1;

        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) return "Error: User not found";
        Optional<Item> itemOpt = itemRepo.findById(itemId);
        if (itemOpt.isEmpty()) return "Error: Item not found";

        Item item = itemOpt.get();
        User user = userOpt.get();

        // Prevent adding own item to cart
        if (item.getOwner() != null && item.getOwner().getId() == user.getId()) {
            return "Error: Cannot add your own item to cart";
        }

        Optional<CartItem> existing = cartItemRepo.findByUserIdAndItemId(userId, itemId);
        if (existing.isPresent()) {
            CartItem ci = existing.get();
            ci.setQuantity(ci.getQuantity() + quantity);
            cartItemRepo.save(ci);
            return "Success: Quantity updated in cart";
        }

        CartItem ci = new CartItem();
        ci.setUser(user);
        ci.setItem(item);
        ci.setQuantity(quantity);

        try {
            cartItemRepo.save(ci);
            return "Success: Item added to cart";
        } catch (Exception e) {
            return "Error: Failed to add to cart: " + e.getMessage();
        }
    }

    public java.util.List<CartItem> getCartForUser(Long userId) {
        return cartItemRepo.findByUserId(userId);
    }

    public String removeCartItem(Long userId, Long cartItemId) {
        var opt = cartItemRepo.findById(cartItemId);
        if (opt.isEmpty()) return "Error: Cart item not found";
        var ci = opt.get();
        if (ci.getUser() == null || ci.getUser().getId() != userId) return "Error: Not authorized to remove this cart item";
        try {
            cartItemRepo.delete(ci);
            return "Success: Cart item removed";
        } catch (Exception e) {
            return "Error: Failed to remove cart item: " + e.getMessage();
        }
    }
}
