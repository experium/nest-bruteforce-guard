export default () => ({
    loginAttemptCount: parseInt(process.env.BRUTEFORCE_GUARD_LOGIN_ATTEMPT_COUNT, 10) || 5,
    loginAttemptHours: parseInt(process.env.BRUTEFORCE_GUARD_LOGIN_ATTEMPT_HOURS, 10) || 24,
});
