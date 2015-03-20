'use strict';

angular.module('services.i18nConstants', []).constant('I18N.MESSAGES', {

    GROUP_CANNOT_BE_NULL: "Error: The between factor cannot be empty. Please enter the between factor in row {{row}} of the first column.",
    DUPLICATE_WITHIN_FACTOR: "Error: The name of the within factor (first row) cannot be duplicate ('{{factor}}')",
    WITHIN_FACTOR_CANNOT_BE_NULL: "Error: The within factor cannot be empty. Please enter the within factor in column {{col}} of the first row",
    EMPTY_DATA_POINT: "Error: The data point cannot be empty at row {{row}} and column '{{factor}}'.",
    CONTRAST_NOT_ZERO: "At least one contrast should be non-zero",
    ADD_CONTRAST: "Add contrast",
    REMOVE_CONTRAST: "Remove contrast",
    NO_BETWEEN_CONTRAST: "No between contrast available",
    NO_WITHIN_CONTRAST: "No within contrast available",
    NO_CONTRAST_AVAILABLE: "No contrast available",
    NO_FACTOR_AVAILABLE: "No factor available",
    "NO_DATA_AVAILABLE": "No data available",
    "MESSAGE_SENT_SUCCESSFULLY": "Message sent successfully",
    "ERROR_IN_MESSAGE_SENDING": "An error occurred in sending the message. Please try again later",
    "REGISTER_MAIL_SENT": "A registration email has been sent to you",
    "INTERNAL_ERROR": "Internal error",
    "REGISTRATION_SUCCESSFUL": "Registration has been processed successfully. Please log in",
    "REVIEW_PROBLEM" : "Please review the problems below",
    "PASSWORD_SENT_TO_EMAIL": "Your password has been sent to your email address",
    "INTERNAL_SERVER_ERROR": "An internal server error occurred. Please try again latter",
    "errors.route.changeError": "The path the you are looking for does not exist",
    "DATA_LOADED_SUCCESSFULLY": "Sample data loaded successfully",
    "EMAIL_IS_INVALID": 'Email address is invalid',
    "NAME_CANNOT_BE_NULL": 'Name is required',
    "MESSAGE_CANNOT_BE_NULL": 'Message is required'


});
