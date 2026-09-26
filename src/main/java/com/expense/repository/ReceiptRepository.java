package com.expense.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.expense.entity.Receipt;
import com.expense.entity.Expense;

public interface ReceiptRepository extends JpaRepository<Receipt, Long> {

    Optional<Receipt> findByExpense(Expense expense);

}