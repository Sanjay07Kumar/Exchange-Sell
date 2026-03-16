package com.example.backend.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name="items")
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne
@JoinColumn(name = "category_id")
@JsonIgnoreProperties("items")
private Category category;

    
    private Double price;
    private Boolean isNegotiable;
    private List<String> imageUrls;
    private Boolean isAvailable;
    private Boolean forExchange;
    private String description;
    private String itemAge;
    private String condition;


@ManyToOne
@JoinColumn(name = "owner_id", nullable = false)
@JsonIgnoreProperties("items")
private User owner;

}
