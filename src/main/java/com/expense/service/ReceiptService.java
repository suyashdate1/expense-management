package com.expense.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.expense.entity.Expense;
import com.expense.entity.Receipt;
import com.expense.entity.User;
import com.expense.repository.ExpenseRepository;
import com.expense.repository.ReceiptRepository;
import com.expense.repository.UserRepository;
import com.expense.dto.ReceiptResponseDTO;

@Service
public class ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    private final String uploadDirectory = "uploads/receipts/";

    public ReceiptService(ReceiptRepository receiptRepository,
                          ExpenseRepository expenseRepository,
                          UserRepository userRepository) {

        this.receiptRepository = receiptRepository;
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    public Receipt uploadReceipt(Long expenseId,
                                 MultipartFile file,
                                 String email) throws IOException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() ->
                        new RuntimeException("Expense not found"));

        // Check expense ownership
        if (!expense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "You are not allowed to access this expense");
        }

        // Check file
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Receipt file is required");
        }

        // Allow only image files
        String contentType = file.getContentType();

        if (contentType == null ||
                !(contentType.equals("image/jpeg") ||
                  contentType.equals("image/png") ||
                  contentType.equals("image/webp"))) {

            throw new RuntimeException(
                    "Only JPG, PNG and WEBP images are allowed");
        }

        // Check if receipt already exists
        Receipt receipt = receiptRepository
                .findByExpense(expense)
                .orElse(null);

        // Delete old file if replacing receipt
        if (receipt != null) {

            try {
                Files.deleteIfExists(
                        Paths.get(receipt.getFilePath())
                );
            } catch (IOException ignored) {
            }

        } else {
            receipt = new Receipt();
        }

        // Create upload folder
        Path uploadPath = Paths.get(uploadDirectory);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique file name
        String originalFileName = file.getOriginalFilename();

        String extension = "";

        if (originalFileName != null &&
                originalFileName.contains(".")) {

            extension = originalFileName.substring(
                    originalFileName.lastIndexOf(".")
            );
        }

        String uniqueFileName =
                UUID.randomUUID().toString() + extension;

        Path filePath =
                uploadPath.resolve(uniqueFileName);

        // Save file
        Files.copy(
                file.getInputStream(),
                filePath
        );

        // Save metadata
        receipt.setFileName(originalFileName);
        receipt.setFileType(contentType);
        receipt.setFilePath(filePath.toString());
        receipt.setExpense(expense);

        return receiptRepository.save(receipt);
    }

    public Receipt getReceipt(Long expenseId,
                              String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() ->
                        new RuntimeException("Expense not found"));

        // Check expense ownership
        if (!expense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "You are not allowed to access this expense");
        }

        return receiptRepository.findByExpense(expense)
                .orElseThrow(() ->
                        new RuntimeException("Receipt not found"));
    }

    public void deleteReceipt(Long expenseId,
                              String email) throws IOException {

        Receipt receipt = getReceipt(expenseId, email);

        // Delete physical file
        Files.deleteIfExists(
                Paths.get(receipt.getFilePath())
        );

        // Delete database record
        receiptRepository.delete(receipt);
    }
    
    
    public ReceiptResponseDTO convertToDTO(Receipt receipt) {

        return new ReceiptResponseDTO(
                receipt.getId(),
                receipt.getFileName(),
                receipt.getFileType(),
                receipt.getExpense().getId()
        );
    }
}