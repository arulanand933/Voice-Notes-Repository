package com.vnr.web.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Reminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String dateTime;
    private String voicePath;
    
	
	}

