import { transporter, sender } from "./mailtrapconfig.js"
import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from "./emailTemplates.js"

export const sendVerificationEmail = async(email, verificationToken) => {
    try {
        const mailOptions = {
            from: `"${sender.name}" <${sender.email}>`,
            to: email,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
        };

        const response = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully", response);
    } catch (error) {
        console.error(`Error sending verification`, error);
        throw new Error(`Error sending verification email: ${error}`)
    }
}

export const sendWelcomeEmail = async (email, userName) => {
    try {
        const mailOptions = {
            from: `"${sender.name}" <${sender.email}>`,
            to: email,
            subject: "Welcome to kjeyPleng!",
            html: WELCOME_EMAIL_TEMPLATE.replace("{userName}", userName),
        };

        const response = await transporter.sendMail(mailOptions);
        console.log("Welcome email sent successfully!", response);
    } catch (error) {
        console.error(`Error sending welcome email`, error);
        throw new Error(`Error sending welcome email: ${error}`);
    }
}

export const sendPasswordResetEmail = async (email, resetURL) => {
    try {
        const mailOptions = {
            from: `"${sender.name}" <${sender.email}>`,
            to: email,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
        };

        const response = await transporter.sendMail(mailOptions);
        console.log("Password reset email sent successfully", response);
    } catch (error) {
        console.log(`Error sending password reset email`, error);
        throw new Error(`Error sending password reset email ${error}`);
    }
}

export const sendResetSuccessEmail = async (email) => {
    try {
        const mailOptions = {
            from: `"${sender.name}" <${sender.email}>`,
            to: email,
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        };

        const response = await transporter.sendMail(mailOptions);
        console.log("Password reset email sent successfully", response);
    } catch (error) {
        console.error(`Error sending password reset success email`, error);
        throw new Error(`Error sending password reset success email: ${error}`);       
    }
}