package com.expense.service;

import java.util.List;

import org.springframework.stereotype.Service;
import com.expense.dto.ExpenseResponseDTO;
import com.expense.dto.UserResponseDTO;
import com.expense.repository.UserRepository;

import com.expense.entity.Expense;
import com.expense.repository.ExpenseRepository;
import com.expense.entity.User;

@Service
public class ExpenseService {

	private final ExpenseRepository expenseRepository;
	private final UserRepository userRepository;

	public ExpenseService(ExpenseRepository expenseRepository,
	                      UserRepository userRepository) {
	    this.expenseRepository = expenseRepository;
	    this.userRepository = userRepository;
	}

    // CREATE
	public Expense createExpense(Expense expense, String email) {

	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() -> new RuntimeException("User not found"));

	    expense.setUser(user);

	    return expenseRepository.save(expense);
	}

    // READ ALL
	public List<Expense> getAllExpenses(String email) {

	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() -> new RuntimeException("User not found"));

	    return expenseRepository.findByUser(user);
	}

    // READ ONE
	public Expense getExpenseById(Long id, String email) {

	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() -> new RuntimeException("User not found"));

	    Expense expense = expenseRepository.findById(id)
	            .orElseThrow(() -> new RuntimeException("Expense not found"));

	    if (!expense.getUser().getId().equals(user.getId())) {
	        throw new RuntimeException("You are not allowed to access this expense");
	    }

	    return expense;
	}

    // UPDATE
	public Expense updateExpense(Long id, Expense expenseDetails, String email) {

	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() -> new RuntimeException("User not found"));

	    Expense expense = expenseRepository.findById(id)
	            .orElseThrow(() -> new RuntimeException("Expense not found"));

	    if (!expense.getUser().getId().equals(user.getId())) {
	        throw new RuntimeException("You are not allowed to update this expense");
	    }

	    expense.setTitle(expenseDetails.getTitle());
	    expense.setAmount(expenseDetails.getAmount());
	    expense.setCategory(expenseDetails.getCategory());
	    expense.setDescription(expenseDetails.getDescription());
	    expense.setDate(expenseDetails.getDate());
	    expense.setPaymentMethod(expenseDetails.getPaymentMethod());

	    return expenseRepository.save(expense);
	}
	
	
    // DELETE
	public void deleteExpense(Long id, String email) {

	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() -> new RuntimeException("User not found"));

	    Expense expense = expenseRepository.findById(id)
	            .orElseThrow(() -> new RuntimeException("Expense not found"));

	    if (!expense.getUser().getId().equals(user.getId())) {
	        throw new RuntimeException("You are not allowed to delete this expense");
	    }

	    expenseRepository.delete(expense);
	}
    
    
    public ExpenseResponseDTO convertToDTO(Expense expense) {

        UserResponseDTO userDTO = null;

        if (expense.getUser() != null) {
            userDTO = new UserResponseDTO(
                    expense.getUser().getId(),
                    expense.getUser().getName(),
                    expense.getUser().getEmail()
            );
        }

        return new ExpenseResponseDTO(
                expense.getId(),
                expense.getAmount(),
                expense.getCategory(),
                expense.getDate(),
                expense.getDescription(),
                expense.getPaymentMethod(),
                expense.getTitle(),
                userDTO
        );
    }
}