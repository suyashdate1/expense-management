package com.expense.service;

import org.springframework.stereotype.Service;

import com.expense.entity.Budget;
import com.expense.entity.User;
import com.expense.repository.BudgetRepository;
import com.expense.repository.UserRepository;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    public BudgetService(BudgetRepository budgetRepository,
                         UserRepository userRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
    }

    public Budget getBudget(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return budgetRepository.findByUser(user)
                .orElseGet(() -> {
                    Budget budget = new Budget();
                    budget.setAmount(10000);
                    budget.setUser(user);
                    return budgetRepository.save(budget);
                });
    }

    public Budget saveBudget(double amount, String email) {

        if (amount <= 0) {
            throw new RuntimeException("Budget must be greater than 0");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Budget budget = budgetRepository.findByUser(user)
                .orElseGet(Budget::new);

        budget.setAmount(amount);
        budget.setUser(user);

        return budgetRepository.save(budget);
    }
}