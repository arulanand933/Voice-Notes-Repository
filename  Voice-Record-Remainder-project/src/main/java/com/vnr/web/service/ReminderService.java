package com.vnr.web.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.vnr.web.model.Reminder;
import com.vnr.web.repository.ReminderRepository;

@Service
public class ReminderService {

    @Autowired
    private ReminderRepository repo;

    public void save(Reminder reminder) {
        repo.save(reminder);
    }

    public java.util.List<Reminder> getAll() {
        return repo.findAll();
    }
}

