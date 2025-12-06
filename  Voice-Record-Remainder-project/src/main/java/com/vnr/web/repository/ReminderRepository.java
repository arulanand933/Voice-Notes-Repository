package com.vnr.web.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.vnr.web.model.Reminder;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {}
