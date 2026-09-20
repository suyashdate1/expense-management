package com.expense.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.expense.entity.Budget;
import com.expense.entity.User;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    Optional<Budget> findByUser(User user);
}