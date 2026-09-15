package com.unicore.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AdvisorQuestionRequest {

    @NotBlank(message = "Question cannot be blank")
    @Size(max = 255, message = "Question must not exceed 255 characters")
    private String question;

    public AdvisorQuestionRequest() {
    }

    public AdvisorQuestionRequest(String question) {
        this.question = question;
    }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
}
