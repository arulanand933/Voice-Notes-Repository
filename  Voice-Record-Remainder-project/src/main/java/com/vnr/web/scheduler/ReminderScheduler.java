package com.vnr.web.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.vnr.web.model.Reminder;
import com.vnr.web.service.ReminderService;

@Component
public class ReminderScheduler {

    @Autowired
    private ReminderService service;

    @Scheduled(cron = "0 * * * * *")
    public void checkReminders() {
        System.out.println("Checking reminders...");

        for (Reminder r : service.getAll()) {
            System.out.println("Reminder due: " + r.getTitle()
                    + " at " + r.getDateTime()
                    + " | Voice: " + r.getVoicePath());
        }
    }
}
