const transporter = require('../config/mailer');

exports.sendStudentInvitationEmail = async (
    studentEmail,
    studentName,
    link
) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: studentEmail,
        subject: 'Student Invitation',
        html: `
            <p>Hi ${studentName},</p>
            <p>You have been invited to join our platform. Please click the link below to get started:</p>
            <a href="${link}" target="_blank">Accept Invitation</a>
        `,
    });
};
