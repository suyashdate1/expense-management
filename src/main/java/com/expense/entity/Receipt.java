package com.expense.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "receipt")
public class Receipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;

    private String fileType;

    private String filePath;

    @OneToOne
    @JoinColumn(name = "expense_id", unique = true)
    private Expense expense;

    public Receipt() {
    }

    public Receipt(String fileName, String fileType, String filePath, Expense expense) {
        this.fileName = fileName;
        this.fileType = fileType;
        this.filePath = filePath;
        this.expense = expense;
    }

    public Long getId() {
        return id;
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

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public Expense getExpense() {
        return expense;
    }

    public void setExpense(Expense expense) {
        this.expense = expense;
    }
}