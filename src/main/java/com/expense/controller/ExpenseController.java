package com.expense.controller;

import java.util.List;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.expense.dto.ExpenseResponseDTO;
import org.springframework.security.core.Authentication;

import com.expense.entity.Expense;
import com.expense.service.ExpenseService;


@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    // CREATE
    @PostMapping
    public ExpenseResponseDTO createExpense( @Valid @RequestBody Expense expense,
                                            Authentication authentication) {

        String email = authentication.getName();

        Expense savedExpense = expenseService.createExpense(expense, email);

        return expenseService.convertToDTO(savedExpense);
    }
    
    
    // READ ALL
    @GetMapping
    public List<ExpenseResponseDTO> getAllExpenses(Authentication authentication) {

        String email = authentication.getName();

        return expenseService.getAllExpenses(email)
                .stream()
                .map(expenseService::convertToDTO)
                .toList();
    }

    // READ ONE
    @GetMapping("/{id}")
    public ExpenseResponseDTO getExpenseById(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        Expense expense = expenseService.getExpenseById(id, email);

        return expenseService.convertToDTO(expense);
    }
    
    
 // UPDATE
    @PutMapping("/{id}")
    public ExpenseResponseDTO updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody Expense expense,
            Authentication authentication) {

        String email = authentication.getName();

        Expense updatedExpense =
                expenseService.updateExpense(id, expense, email);

        return expenseService.convertToDTO(updatedExpense);
    }
    

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteExpense(@PathVariable Long id,
                                Authentication authentication) {

        String email = authentication.getName();

        expenseService.deleteExpense(id, email);

        return "Expense deleted successfully";
    }
}