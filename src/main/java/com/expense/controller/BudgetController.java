package com.expense.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.expense.entity.Budget;
import com.expense.service.BudgetService;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public Budget getBudget(Authentication authentication) {

        String email = authentication.getName();

        return budgetService.getBudget(email);
    }

    @PutMapping
    public Budget saveBudget(@RequestParam double amount,
                             Authentication authentication) {

        String email = authentication.getName();

        return budgetService.saveBudget(amount, email);
    }
}