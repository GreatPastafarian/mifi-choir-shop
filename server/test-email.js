require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing SMTP Connection...');
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);
console.log('Secure:', process.env.SMTP_SECURE);
console.log('User:', process.env.SMTP_USER);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000, // 10 seconds timeout
    debug: true, // Show debug output
    logger: true // Log to console
});

async function verifyConnection() {
    console.log('--- TEST 1: Configured Port ---');
    console.log(`Attempting connection to ${process.env.SMTP_HOST}:${process.env.SMTP_PORT} (secure: ${process.env.SMTP_SECURE})...`);

    try {
        await transporter.verify();
        console.log('✅ SMTP Connection Successful on configured port!');
        return;
    } catch (error) {
        console.error('❌ SMTP Connection Failed on configured port:', error.code);
    }

    console.log('\n--- TEST 2: Alternative Port (587) ---');
    console.log('Attempting connection to smtp.gmail.com:587 (secure: false)...');

    const transporter587 = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // STARTTLS
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000,
        debug: true,
        logger: true
    });

    try {
        await transporter587.verify();
        console.log('✅ SMTP Connection Successful on port 587!');
        console.log('💡 SUGGESTION: Change your .env file to use SMTP_PORT=587 and SMTP_SECURE=false');
    } catch (error) {
        console.error('❌ SMTP Connection Failed on port 587:', error.code);
        console.log('⚠️  CONCLUSION: Both ports 465 and 587 appear to be blocked by a firewall.');
    }
}

verifyConnection();
