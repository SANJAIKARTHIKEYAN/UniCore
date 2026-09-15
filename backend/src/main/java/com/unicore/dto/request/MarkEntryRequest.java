package com.unicore.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class MarkEntryRequest {

    @NotEmpty(message = "Mark entries cannot be empty.")
    private List<MarkEntry> entries;

    public MarkEntryRequest() {
    }

    public MarkEntryRequest(List<MarkEntry> entries) {
        this.entries = entries;
    }

    public List<MarkEntry> getEntries() { return entries; }
    public void setEntries(List<MarkEntry> entries) { this.entries = entries; }

    public static class MarkEntry {

        @NotNull(message = "Student user ID is required.")
        private Long studentId;

        /**
         * Nullable — null means "not yet graded" (clears the mark).
         */
        private Double marksObtained;

        public MarkEntry() {
        }

        public MarkEntry(Long studentId, Double marksObtained) {
            this.studentId = studentId;
            this.marksObtained = marksObtained;
        }

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }

        public Double getMarksObtained() { return marksObtained; }
        public void setMarksObtained(Double marksObtained) { this.marksObtained = marksObtained; }
    }
}
