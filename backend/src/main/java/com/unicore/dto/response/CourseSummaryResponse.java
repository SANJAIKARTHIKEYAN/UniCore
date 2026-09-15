package com.unicore.dto.response;

import java.util.List;

public class CourseSummaryResponse {

    private Long courseId;
    private String courseCode;
    private String courseName;
    private List<StudentGradeSummary> students;

    public CourseSummaryResponse() {
    }

    public CourseSummaryResponse(Long courseId, String courseCode, String courseName,
                                 List<StudentGradeSummary> students) {
        this.courseId = courseId;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.students = students;
    }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public List<StudentGradeSummary> getStudents() { return students; }
    public void setStudents(List<StudentGradeSummary> students) { this.students = students; }

    // --------------------------------------------------------
    // Nested DTO: per-student grade summary
    // --------------------------------------------------------
    public static class StudentGradeSummary {

        private Long studentUserId;
        private String studentId;
        private String studentName;
        private Double weightedPercentage;
        private String computedGrade;
        private Double computedGradePoints;
        private List<AssessmentScore> assessmentScores;

        public StudentGradeSummary() {
        }

        public StudentGradeSummary(Long studentUserId, String studentId, String studentName,
                                   Double weightedPercentage, String computedGrade,
                                   Double computedGradePoints, List<AssessmentScore> assessmentScores) {
            this.studentUserId = studentUserId;
            this.studentId = studentId;
            this.studentName = studentName;
            this.weightedPercentage = weightedPercentage;
            this.computedGrade = computedGrade;
            this.computedGradePoints = computedGradePoints;
            this.assessmentScores = assessmentScores;
        }

        public Long getStudentUserId() { return studentUserId; }
        public void setStudentUserId(Long studentUserId) { this.studentUserId = studentUserId; }

        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }

        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }

        public Double getWeightedPercentage() { return weightedPercentage; }
        public void setWeightedPercentage(Double weightedPercentage) { this.weightedPercentage = weightedPercentage; }

        public String getComputedGrade() { return computedGrade; }
        public void setComputedGrade(String computedGrade) { this.computedGrade = computedGrade; }

        public Double getComputedGradePoints() { return computedGradePoints; }
        public void setComputedGradePoints(Double computedGradePoints) { this.computedGradePoints = computedGradePoints; }

        public List<AssessmentScore> getAssessmentScores() { return assessmentScores; }
        public void setAssessmentScores(List<AssessmentScore> assessmentScores) { this.assessmentScores = assessmentScores; }
    }

    // --------------------------------------------------------
    // Nested DTO: score for a single assessment
    // --------------------------------------------------------
    public static class AssessmentScore {
        private Long assessmentId;
        private String assessmentTitle;
        private Double marksObtained;
        private Double maxMarks;
        private Double weightage;

        public AssessmentScore() {
        }

        public AssessmentScore(Long assessmentId, String assessmentTitle,
                               Double marksObtained, Double maxMarks, Double weightage) {
            this.assessmentId = assessmentId;
            this.assessmentTitle = assessmentTitle;
            this.marksObtained = marksObtained;
            this.maxMarks = maxMarks;
            this.weightage = weightage;
        }

        public Long getAssessmentId() { return assessmentId; }
        public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; }

        public String getAssessmentTitle() { return assessmentTitle; }
        public void setAssessmentTitle(String assessmentTitle) { this.assessmentTitle = assessmentTitle; }

        public Double getMarksObtained() { return marksObtained; }
        public void setMarksObtained(Double marksObtained) { this.marksObtained = marksObtained; }

        public Double getMaxMarks() { return maxMarks; }
        public void setMaxMarks(Double maxMarks) { this.maxMarks = maxMarks; }

        public Double getWeightage() { return weightage; }
        public void setWeightage(Double weightage) { this.weightage = weightage; }
    }
}
