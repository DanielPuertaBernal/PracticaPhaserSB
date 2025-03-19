package com.practicaPhaser.JuegoRamona.domain.quizgame;


import jakarta.persistence.*;


@Entity
@Table(name = "quiz_user_response")
public class QuizUserResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "user_document", nullable = false)
    private String userDocument;

    @Column(name = "chosen_option", nullable = false)
    private String chosenOption;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    // Constructores
    public QuizUserResponse() {
    }

    public QuizUserResponse(String userName, String userEmail, String userDocument,
                            String chosenOption, Boolean isCorrect, Long questionId) {
        this.userName = userName;
        this.userEmail = userEmail;
        this.userDocument = userDocument;
        this.chosenOption = chosenOption;
        this.isCorrect = isCorrect;
        this.questionId = questionId;
    }

    // Getters y Setters

    public Long getId() {
        return id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserDocument() {
        return userDocument;
    }

    public void setUserDocument(String userDocument) {
        this.userDocument = userDocument;
    }

    public String getChosenOption() {
        return chosenOption;
    }

    public void setChosenOption(String chosenOption) {
        this.chosenOption = chosenOption;
    }

    public Boolean getIsCorrect() {
        return isCorrect;
    }

    public void setIsCorrect(Boolean correct) {
        isCorrect = correct;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }
}