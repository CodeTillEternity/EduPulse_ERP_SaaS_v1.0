package com.edupulse.core.domain.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamAnswerDTO {

    private Long questionId;
    private String selectedAnswer;
}
