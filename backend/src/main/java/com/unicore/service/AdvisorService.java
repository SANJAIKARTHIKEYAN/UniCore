package com.unicore.service;

import com.unicore.dto.response.*;
import com.unicore.entity.*;
import com.unicore.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AdvisorService {

    private static final Logger logger = LoggerFactory.getLogger(AdvisorService.class);

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentMarkRepository assessmentMarkRepository;
    private final MlPredictionService mlPredictionService;

    public AdvisorService(UserRepository userRepository,
                          StudentProfileRepository studentProfileRepository,
                          CourseRepository courseRepository,
                          EnrollmentRepository enrollmentRepository,
                          AttendanceRecordRepository attendanceRecordRepository,
                          AssessmentRepository assessmentRepository,
                          AssessmentMarkRepository assessmentMarkRepository,
                          MlPredictionService mlPredictionService) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.assessmentRepository = assessmentRepository;
        this.assessmentMarkRepository = assessmentMarkRepository;
        this.mlPredictionService = mlPredictionService;
    }

    /**
     * Generates a personalized academic advisor overview for a student.
     */
    @Transactional(readOnly = true)
    public AdvisorOverviewDTO generateStudentOverview(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + studentId));

        if (student.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException("User " + studentId + " is not a student.");
        }

        StudentProfile profile = studentProfileRepository.findByUserId(studentId).orElse(null);
        String studentRoll = profile != null ? profile.getStudentId() : "STD-" + student.getId();
        Integer semester = profile != null ? profile.getCurrentSemester() : null;

        // 1. Calculate Cumulative Attendance
        long totalAtt = attendanceRecordRepository.countByStudentId(studentId);
        long presentAtt = attendanceRecordRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.PRESENT);
        double overallAttendancePct = totalAtt > 0 ? ((double) presentAtt / totalAtt) * 100.0 : 85.0;

        // 2. Fetch Enrollments & Courses
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        List<AssessmentMark> studentMarks = assessmentMarkRepository.findAll().stream()
                .filter(m -> m.getStudent().getId().equals(studentId))
                .toList();

        // 3. Calculate Overall Marks Average
        Double overallMarksAvg = null;
        List<Double> validMarksPercentages = studentMarks.stream()
                .filter(m -> m.getMarksObtained() != null && m.getAssessment() != null && m.getAssessment().getMaxMarks() > 0)
                .map(m -> (m.getMarksObtained() / m.getAssessment().getMaxMarks()) * 100.0)
                .toList();
        if (!validMarksPercentages.isEmpty()) {
            double sum = 0;
            for (Double p : validMarksPercentages) sum += p;
            overallMarksAvg = Math.round((sum / validMarksPercentages.size()) * 10.0) / 10.0;
        }

        // 4. Query ML Risk Prediction
        String riskCategory = "Low Risk";
        Double riskConfidence = 0.75;
        try {
            StudentRiskPredictionResponse mlRes = mlPredictionService.predictStudentRisk(studentId, null);
            if (mlRes != null) {
                riskCategory = mlRes.getRiskCategory();
                riskConfidence = mlRes.getConfidence();
            }
        } catch (Exception ex) {
            logger.warn("ML risk evaluation fallback for student {}: {}", studentId, ex.getMessage());
        }

        // 5. Build Explainable Recommendations
        List<AdvisorRecommendationDTO> recs = new ArrayList<>();
        int recIndex = 1;

        // Rule A: Attendance Below 75% in Enrolled Courses (HIGH Priority)
        for (Enrollment e : enrollments) {
            Course c = e.getCourse();
            long cTotal = attendanceRecordRepository.countByStudentIdAndCourseId(studentId, c.getId());
            if (cTotal > 0) {
                long cPresent = attendanceRecordRepository.countByStudentIdAndCourseIdAndStatus(studentId, c.getId(), AttendanceStatus.PRESENT);
                double cPct = ((double) cPresent / cTotal) * 100.0;
                if (cPct < 75.0) {
                    String instructor = c.getInstructor() != null ? c.getInstructor().getName() : "Course Faculty";
                    recs.add(new AdvisorRecommendationDTO(
                            "REC-" + (recIndex++),
                            "Attendance Below 75% Threshold: " + c.getCourseCode(),
                            "Current course attendance is " + String.format("%.1f", cPct) + "%, which falls below the mandatory 75% exam eligibility threshold.",
                            "HIGH",
                            c.getCourseCode() + " - " + c.getCourseName(),
                            String.format("%.1f%% Course Attendance (%d/%d sessions)", cPct, cPresent, cTotal),
                            "Attend all upcoming lecture hours and contact " + instructor + " for potential make-up coursework."
                    ));
                } else if (cPct < 80.0) {
                    recs.add(new AdvisorRecommendationDTO(
                            "REC-" + (recIndex++),
                            "Attendance Borderline Caution: " + c.getCourseCode(),
                            "Course attendance is at " + String.format("%.1f", cPct) + "%. One or two missed sessions could drop eligibility below 75%.",
                            "MEDIUM",
                            c.getCourseCode() + " - " + c.getCourseName(),
                            String.format("%.1f%% Attendance", cPct),
                            "Prioritize attendance consistency across the remaining scheduled classes."
                    ));
                }
            }
        }

        // Rule B: Assessment Marks Evaluation per Course (HIGH / MEDIUM Priority)
        for (Enrollment e : enrollments) {
            Course c = e.getCourse();
            List<AssessmentMark> cMarks = studentMarks.stream()
                    .filter(m -> m.getAssessment() != null && m.getAssessment().getCourse().getId().equals(c.getId()))
                    .toList();

            List<Double> cPcts = cMarks.stream()
                    .filter(m -> m.getMarksObtained() != null && m.getAssessment().getMaxMarks() > 0)
                    .map(m -> (m.getMarksObtained() / m.getAssessment().getMaxMarks()) * 100.0)
                    .toList();

            if (!cPcts.isEmpty()) {
                double cSum = 0;
                for (Double p : cPcts) cSum += p;
                double cAvg = cSum / cPcts.size();

                if (cAvg < 60.0) {
                    String instructor = c.getInstructor() != null ? c.getInstructor().getName() : "Course Instructor";
                    recs.add(new AdvisorRecommendationDTO(
                            "REC-" + (recIndex++),
                            "Academic Support Recommended: " + c.getCourseCode(),
                            "Average assessment score is " + String.format("%.1f", cAvg) + "%. Additional concept reinforcement will help ensure course mastery.",
                            "HIGH",
                            c.getCourseCode() + " - " + c.getCourseName(),
                            String.format("%.1f%% Assessment Average", cAvg),
                            "Schedule office hours with " + instructor + " or request peer tutoring support."
                    ));
                } else if (cAvg < 75.0) {
                    recs.add(new AdvisorRecommendationDTO(
                            "REC-" + (recIndex++),
                            "Targeted Revision: " + c.getCourseCode(),
                            "Assessment performance is moderate (" + String.format("%.1f", cAvg) + "%). Reviewing feedback on past assignments can elevate your score.",
                            "MEDIUM",
                            c.getCourseCode() + " - " + c.getCourseName(),
                            String.format("%.1f%% Assessment Average", cAvg),
                            "Focus revision on key syllabus modules ahead of the next evaluation."
                    ));
                }
            }

            // Rule C: Pending or Unattempted Assessments
            List<Assessment> publishedAssessments = assessmentRepository.findByCourseId(c.getId());
            for (Assessment a : publishedAssessments) {
                boolean hasMark = cMarks.stream().anyMatch(m -> m.getAssessment().getId().equals(a.getId()) && m.getMarksObtained() != null);
                if (!hasMark) {
                    recs.add(new AdvisorRecommendationDTO(
                            "REC-" + (recIndex++),
                            "Pending Evaluation: " + a.getTitle(),
                            "You have a published " + a.getType() + " evaluation in " + c.getCourseCode() + " with no grade recorded yet.",
                            "MEDIUM",
                            c.getCourseCode() + " - " + c.getCourseName(),
                            a.getType() + " (" + a.getMaxMarks() + " Marks)",
                            "Verify submission status with your instructor or prepare for the upcoming test date."
                    ));
                }
            }
        }

        // Rule D: ML Early Warning Alert (HIGH / MEDIUM Priority)
        if ("High Risk".equalsIgnoreCase(riskCategory)) {
            recs.add(new AdvisorRecommendationDTO(
                    "REC-" + (recIndex++),
                    "ML Early-Warning Risk Alert",
                    "The machine learning risk model flagged an elevated cumulative risk score based on attendance and test performance patterns.",
                    "HIGH",
                    "All Enrolled Courses",
                    "High Risk Category (Confidence: " + Math.round(riskConfidence * 100) + "%)",
                    "Book an academic advising session with your department advisor to build an intervention plan."
            ));
        } else if ("Medium Risk".equalsIgnoreCase(riskCategory)) {
            recs.add(new AdvisorRecommendationDTO(
                    "REC-" + (recIndex++),
                    "Proactive Pacing Advisory",
                    "The predictive model identified moderate pacing risks. Strengthening attendance and weekly quiz consistency will protect your standing.",
                    "MEDIUM",
                    "All Enrolled Courses",
                    "Medium Risk Category (Confidence: " + Math.round(riskConfidence * 100) + "%)",
                    "Set weekly study milestones and resolve conceptual doubts promptly."
            ));
        }

        // Rule E: Strong Performance Momentum (LOW Priority)
        boolean hasHighRecs = recs.stream().anyMatch(r -> "HIGH".equals(r.getPriority()));
        if (!hasHighRecs && overallAttendancePct >= 80.0 && (overallMarksAvg == null || overallMarksAvg >= 75.0)) {
            recs.add(new AdvisorRecommendationDTO(
                    "REC-" + (recIndex++),
                    "Strong Academic Momentum",
                    "You are maintaining excellent attendance (" + String.format("%.1f", overallAttendancePct) + "%) and solid evaluation pacing. Keep up the active participation!",
                    "LOW",
                    "General Standing",
                    String.format("%.1f%% Attendance", overallAttendancePct),
                    "Consider exploring honors projects, department clubs, or peer mentoring opportunities."
            ));
        }

        // Sort: HIGH first, then MEDIUM, then LOW
        recs.sort(Comparator.comparingInt(r -> {
            if ("HIGH".equals(r.getPriority())) return 0;
            if ("MEDIUM".equals(r.getPriority())) return 1;
            return 2;
        }));

        // 6. Build Headline Summary
        long highCount = recs.stream().filter(r -> "HIGH".equals(r.getPriority())).count();
        long medCount = recs.stream().filter(r -> "MEDIUM".equals(r.getPriority())).count();
        String summary;
        if (highCount > 0) {
            summary = highCount + " High Priority Action" + (highCount > 1 ? "s" : "") + " Require Attention";
        } else if (medCount > 0) {
            summary = medCount + " Pacing Suggestion" + (medCount > 1 ? "s" : "") + " Available";
        } else {
            summary = "Academic Indicators on Track — Keep Up the Great Work!";
        }

        AdvisorOverviewDTO dto = new AdvisorOverviewDTO();
        dto.setStudentId(student.getId());
        dto.setStudentName(student.getName());
        dto.setStudentRoll(studentRoll);
        dto.setDepartment(student.getDepartment());
        dto.setSemester(semester);
        dto.setOverallAttendancePercent(Math.round(overallAttendancePct * 10.0) / 10.0);
        dto.setAverageMarksPercent(overallMarksAvg);
        dto.setRiskCategory(riskCategory);
        dto.setRiskConfidence(riskConfidence);
        dto.setCourseCount(enrollments.size());
        dto.setRecommendations(recs);
        dto.setSummaryHeadline(summary);
        dto.setGeneratedAt(LocalDateTime.now());
        return dto;
    }

    /**
     * Answers student academic questions using a deterministic rule and data engine.
     */
    @Transactional(readOnly = true)
    public AdvisorQuestionResponse answerStudentQuestion(Long studentId, String rawQuestion) {
        if (rawQuestion == null || rawQuestion.trim().isEmpty()) {
            throw new IllegalArgumentException("Question cannot be empty.");
        }

        String q = rawQuestion.toLowerCase().trim();
        AdvisorOverviewDTO overview = generateStudentOverview(studentId);

        String answer;
        String intent;
        Double confidence = 0.95;
        List<String> suggestions = new ArrayList<>();

        if (q.contains("attendance") || q.contains("absent") || q.contains("classes") || q.contains("sessions") || q.contains("present")) {
            intent = "ATTENDANCE_INQUIRY";
            double att = overview.getOverallAttendancePercent();
            if (att >= 75.0) {
                answer = "Your overall attendance is " + att + "%, which is in good standing and meets the institutional 75% examination eligibility requirement.";
            } else {
                answer = "Your overall attendance is currently " + att + "%, which is below the mandatory 75% threshold! Please prioritize attending upcoming lectures to avoid being debarred from final examinations.";
            }
            suggestions.add("Which course needs improvement?");
            suggestions.add("What are my top recommendations?");
            suggestions.add("What is my risk level?");

        } else if (q.contains("course") || q.contains("subject") || q.contains("improve") || q.contains("weak") || q.contains("focus") || q.contains("study")) {
            intent = "COURSE_IMPROVEMENT_INQUIRY";
            Optional<AdvisorRecommendationDTO> highCourseRec = overview.getRecommendations().stream()
                    .filter(r -> r.getRelatedCourse() != null && !"General Standing".equalsIgnoreCase(r.getRelatedCourse()) && !"All Enrolled Courses".equalsIgnoreCase(r.getRelatedCourse()))
                    .findFirst();

            if (highCourseRec.isPresent()) {
                AdvisorRecommendationDTO rec = highCourseRec.get();
                answer = "Based on current evaluations, you should focus on " + rec.getRelatedCourse() + ". " + rec.getExplanation() + " Suggested action: " + rec.getSuggestedAction();
            } else {
                answer = "All your currently enrolled courses show satisfactory pacing! Continue maintaining consistent attendance and turning in weekly assignments on time.";
            }
            suggestions.add("How is my attendance?");
            suggestions.add("Why was this risk level predicted?");
            suggestions.add("What should I do next?");

        } else if (q.contains("risk") || q.contains("level") || q.contains("why") || q.contains("standing") || q.contains("warning") || q.contains("safe")) {
            intent = "RISK_RATIONALE_INQUIRY";
            String category = overview.getRiskCategory();
            int conf = (int) Math.round(overview.getRiskConfidence() * 100);

            if ("High Risk".equalsIgnoreCase(category)) {
                answer = "Your ML Risk Standing is currently High Risk (" + conf + "% model confidence). This status is driven by attendance falling near or below thresholds and test scores requiring improvement. Check your high-priority recommendations for immediate next steps.";
            } else if ("Medium Risk".equalsIgnoreCase(category)) {
                answer = "Your ML Risk Standing is currently Medium Risk (" + conf + "% model confidence). You are generally in good shape, but certain courses require consistent quiz submission and regular attendance to avoid sliding backward.";
            } else {
                answer = "Your ML Risk Standing is Low Risk (" + conf + "% model confidence). Your attendance and evaluation metrics are strong and within healthy institutional expectations.";
            }
            suggestions.add("How is my attendance?");
            suggestions.add("Which course needs improvement?");
            suggestions.add("What are my top recommendations?");

        } else {
            intent = "GENERAL_ACADEMIC_GUIDANCE";
            if (!overview.getRecommendations().isEmpty()) {
                AdvisorRecommendationDTO top = overview.getRecommendations().get(0);
                answer = "Here is your primary academic focus: \"" + top.getTitle() + "\". " + top.getExplanation() + " Suggested action: " + top.getSuggestedAction();
            } else {
                answer = "Your academic records are in good standing across all enrolled courses with " + overview.getOverallAttendancePercent() + "% overall attendance. Keep up the disciplined effort!";
            }
            suggestions.add("How is my attendance?");
            suggestions.add("Which course needs improvement?");
            suggestions.add("What is my current risk level?");
        }

        return new AdvisorQuestionResponse(rawQuestion, answer, confidence, intent, suggestions);
    }

    /**
     * Institutional aggregate overview for Administrators.
     */
    @Transactional(readOnly = true)
    public AdminAdvisorOverviewDTO generateAdminOverview() {
        List<User> students = userRepository.findByRole(Role.STUDENT);
        long highPriCount = 0;
        long medPriCount = 0;
        long lowPriCount = 0;
        long lowAttCount = 0;
        long lowMarksCount = 0;
        Map<String, Long> deptPriorityMap = new TreeMap<>();

        for (User s : students) {
            try {
                AdvisorOverviewDTO ov = generateStudentOverview(s.getId());
                boolean hasHigh = ov.getRecommendations().stream().anyMatch(r -> "HIGH".equals(r.getPriority()));
                boolean hasMed = ov.getRecommendations().stream().anyMatch(r -> "MEDIUM".equals(r.getPriority()));

                if (hasHigh) {
                    highPriCount++;
                    if (s.getDepartment() != null) {
                        deptPriorityMap.put(s.getDepartment(), deptPriorityMap.getOrDefault(s.getDepartment(), 0L) + 1);
                    }
                } else if (hasMed) {
                    medPriCount++;
                } else {
                    lowPriCount++;
                }

                if (ov.getOverallAttendancePercent() < 75.0) {
                    lowAttCount++;
                }
                if (ov.getAverageMarksPercent() != null && ov.getAverageMarksPercent() < 60.0) {
                    lowMarksCount++;
                }
            } catch (Exception ex) {
                logger.warn("Could not generate advisor stats for student {}: {}", s.getId(), ex.getMessage());
            }
        }

        AdminAdvisorOverviewDTO dto = new AdminAdvisorOverviewDTO();
        dto.setTotalStudentsAnalyzed(students.size());
        dto.setHighPriorityCount(highPriCount);
        dto.setMediumPriorityCount(medPriCount);
        dto.setLowPriorityCount(lowPriCount);
        dto.setLowAttendanceStudentsCount(lowAttCount);
        dto.setLowMarksStudentsCount(lowMarksCount);
        dto.setPriorityDistributionByDepartment(deptPriorityMap);
        dto.setGeneratedAt(LocalDateTime.now());
        return dto;
    }
}
