package com.expense.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.expense.entity.Expense;
import com.expense.entity.User;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUser(User user);
}