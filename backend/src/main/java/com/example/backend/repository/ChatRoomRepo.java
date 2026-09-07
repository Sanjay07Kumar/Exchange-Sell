package com.example.backend.repository;

import com.example.backend.model.ChatRoom;
import com.example.backend.model.Item;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepo extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByItemAndBuyer(Item item, User buyer);

    @Query("SELECT c FROM ChatRoom c WHERE c.buyer.id = :userId OR c.seller.id = :userId ORDER BY c.lastUpdated DESC")
    List<ChatRoom> findByUserId(@Param("userId") Long userId);
}