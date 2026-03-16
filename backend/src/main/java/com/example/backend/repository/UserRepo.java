package com.example.backend.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.backend.model.User;

@Repository
public interface UserRepo extends JpaRepository<User,Long>{
    
    @Query("select a from User a where a.email=?1")
    public Optional<User> findByEmail(String email);


    Optional<User> findById(Long id);
    
}
