package com.vnr.web.controller;

import java.io.File;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.vnr.web.model.Reminder;
import com.vnr.web.service.ReminderService;

@RestController
@RequestMapping("/api")
@CrossOrigin("*")
public class ReminderController {

    @Autowired
    private ReminderService service;

    @PostMapping("/reminder")
    public String saveReminder(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String dateTime,
            @RequestParam("voiceNote") MultipartFile voiceNote
    ) {

        try {
            String folder = "uploads/";
            File f = new File(folder);
            if (!f.exists()) f.mkdirs();

            String filePath = folder + System.currentTimeMillis() + "-" + voiceNote.getOriginalFilename();
            voiceNote.transferTo(new File(filePath));

            Reminder r = new Reminder();
            r.setTitle(title);
            r.setDescription(description);
            r.setDateTime(dateTime);
            r.setVoicePath(filePath);

            service.save(r);

            return "Reminder Saved Successfully!";

        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}

