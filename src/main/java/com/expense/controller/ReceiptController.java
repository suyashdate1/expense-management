package com.expense.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.expense.entity.Receipt;
import com.expense.service.ReceiptService;
import com.expense.dto.ReceiptResponseDTO;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {

    private final ReceiptService receiptService;

    public ReceiptController(ReceiptService receiptService) {
        this.receiptService = receiptService;
    }

    // UPLOAD / REPLACE RECEIPT
    @PostMapping("/expense/{expenseId}")
    public ReceiptResponseDTO uploadReceipt(
            @PathVariable Long expenseId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {

        String email = authentication.getName();

        Receipt receipt = receiptService.uploadReceipt(
                expenseId,
                file,
                email
        );

        return receiptService.convertToDTO(receipt);
    }

    // VIEW RECEIPT
    @GetMapping("/expense/{expenseId}")
    public ResponseEntity<Resource> viewReceipt(
            @PathVariable Long expenseId,
            Authentication authentication) throws IOException {

        String email = authentication.getName();

        Receipt receipt =
                receiptService.getReceipt(expenseId, email);

        Path path =
                Paths.get(receipt.getFilePath());

        Resource resource =
                new UrlResource(path.toUri());

        if (!resource.exists()) {
            throw new RuntimeException("Receipt file not found");
        }

        MediaType mediaType;

        try {
            mediaType =
                    MediaType.parseMediaType(
                            receipt.getFileType()
                    );
        } catch (Exception e) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" +
                                receipt.getFileName() +
                                "\""
                )
                .body(resource);
    }

    // DOWNLOAD RECEIPT
    @GetMapping("/expense/{expenseId}/download")
    public ResponseEntity<Resource> downloadReceipt(
            @PathVariable Long expenseId,
            Authentication authentication) throws IOException {

        String email = authentication.getName();

        Receipt receipt =
                receiptService.getReceipt(
                        expenseId,
                        email
                );

        Path path =
                Paths.get(receipt.getFilePath());

        Resource resource =
                new UrlResource(path.toUri());

        if (!resource.exists()) {
            throw new RuntimeException(
                    "Receipt file not found"
            );
        }

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(
                                receipt.getFileType()
                        )
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition
                                .attachment()
                                .filename(
                                        receipt.getFileName()
                                )
                                .build()
                                .toString()
                )
                .body(resource);
    }

    // DELETE RECEIPT
    @DeleteMapping("/expense/{expenseId}")
    public String deleteReceipt(
            @PathVariable Long expenseId,
            Authentication authentication)
            throws IOException {

        String email = authentication.getName();

        receiptService.deleteReceipt(
                expenseId,
                email
        );

        return "Receipt deleted successfully";
    }
}