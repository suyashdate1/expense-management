
package com.expense.dto;

public class ReceiptResponseDTO {

    private Long id;

    private String fileName;

    private String fileType;

    private Long expenseId;

    public ReceiptResponseDTO() {
    }

    public ReceiptResponseDTO(
            Long id,
            String fileName,
            String fileType,
            Long expenseId) {

        this.id = id;
        this.fileName = fileName;
        this.fileType = fileType;
        this.expenseId = expenseId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getExpenseId() {
        return expenseId;
    }

    public void setExpenseId(Long expenseId) {
        this.expenseId = expenseId;
    }
}

