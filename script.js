// --- Firebase SDK Imports ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, limit, increment, serverTimestamp, orderBy, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyAEJ9_eiVk5oQP9mhBZ-hBc90jeyIu4GKY", // Replace with your actual API key if needed
  authDomain: "watch-and-earn-dc015.firebaseapp.com",
  projectId: "watch-and-earn-dc015",
  storageBucket: "watch-and-earn-dc015.appspot.com",
  messagingSenderId: "848008267595",
  appId: "1:848008267595:web:89ff8460361c9f9759cace",
  measurementId: "G-QTGZ9TDEQG"
};

// --- Initialize Firebase ---
let app;
let auth;
let db;
let storage;
let analytics;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    analytics = getAnalytics(app);
    console.log("Firebase Initialized Successfully.");
} catch (error) {
    console.error("!!! Firebase Initialization Failed:", error);
    alert("Error initializing the application. Please check the console.");
}

// --- Ad Network IDs ---
const ADMOB_APP_ID = "ca-app-pub-6727877283623739~4474796583";
const ADMOB_BANNER_UNIT_ID = "ca-app-pub-6727877283623739/6194339842";
const ADMOB_INTERSTITIAL_UNIT_ID = "ca-app-pub-6727877283623739/1722141168";
const ADMOB_REWARDED_UNIT_ID = "ca-app-pub-6727877283623739/7563261839";
const UNITY_GAME_ID = '5038079';
const UNITY_REWARDED_PLACEMENT_ID = 'Rewarded_Android_52f1c129_5c7b_4dbd_b5e5_36ed0b235143';
const UNITY_INTERSTITIAL_PLACEMENT_ID = 'Interstitial_Android_9d8000d1_d42d_4476_ac23_cd08b0338549';

// --- Constants ---
const NEW_USER_REFERRAL_BONUS = 50;
const REFERRER_BONUS = 500;
const WATCH_AD_REWARD = 20; // UPDATED: Reward changed to 20
const MAX_DAILY_AD_WATCHES = 20; // NEW: Daily ad watch limit
const DAILY_LOGIN_REWARD = 20;
const TTT_WIN_REWARD_PER_LEVEL = 10;
const GK_QUIZ_COMPLETION_BONUS = 30;
const GAME_COMPLETION_AD_REWARD = 20; // Unity Ad after game
const tttMaxLevel = 10;
const GK_QUESTIONS_PER_SESSION = 5;
const LEADERBOARD_LIMIT = 10;
const MIN_WITHDRAWAL_AMOUNT = 1000;
const DEFAULT_AVATAR_URL = 'placeholder-avatar.png';

// --- Global State ---
let currentUserData = null;
let currentUserId = null;
let activeBannerContainers = [];
let isAdMobInitialized = false;
let isUnityAdsInitialized = false;
let isAdMobInterstitialReady = false;
let isAdMobRewardedReady = false;
let isUnityRewardedReady = false;
let tttBoard = Array(9).fill('');
let tttCurrentPlayer = 'X';
let tttIsGameOver = false;
let tttCurrentLevel = 1;
let gkQuestionsPool = [];
let currentGkQuizQuestions = [];
let currentGkQuestionIndex = 0;
let currentGkQuizCorrectAnswers = 0;

// --- DOM Element References ---
const authSection = document.getElementById('authSection');
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const mainContent = document.getElementById('mainContent');
const gamesHubSection = document.getElementById('gamesHubSection'); // <-- ADDED
const tttSection = document.getElementById('tttSection');
const gkQuizSection = document.getElementById('gkQuizSection');
const profileSection = document.getElementById('profileSection');
const referralSection = document.getElementById('referralSection');
const leaderboardSection = document.getElementById('leaderboardSection');
const historySection = document.getElementById('historySection');
const bottomNav = document.getElementById('bottomNav');
const userInfoHeader = document.getElementById('user-info-header');
const userTokenDisplayHeader = document.getElementById('user-token-display-header');
const userReferralCodeDisplay = document.getElementById('user-referral-code-display');
const signupEmailInput = document.getElementById('signup-email');
const signupPasswordInput = document.getElementById('signup-password');
const signupReferralCodeInput = document.getElementById('signup-referral-code');
const signupButton = document.getElementById('signup-button');
const signupFeedback = document.getElementById('signup-feedback');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginButton = document.getElementById('login-button');
const loginFeedback = document.getElementById('login-feedback');
const showLoginButton = document.getElementById('show-login-button');
const showSignupButton = document.getElementById('show-signup-button');
const playTttBtn = document.getElementById('playTttBtn'); // Reference still needed
const playGkQuizBtn = document.getElementById('playGkQuizBtn'); // Reference still needed
const watchAdMainButton = document.getElementById('watchAdMainButton');
const claimDailyRewardButton = document.getElementById('claim-daily-reward-button');
const dailyRewardFeedback = document.getElementById('daily-reward-feedback');
const tttStatusDisplay = document.getElementById('tttStatus');
const tttGameBoard = document.getElementById('tttGameBoard');
const tttCells = tttGameBoard?.querySelectorAll('.cell');
const tttRestartButton = document.getElementById('tttRestartButton');
const tttBackToMenuBtn = document.getElementById('tttBackToMenuBtn');
const tttAdStatus = document.getElementById('ttt-ad-status');
const tttCurrentLevelDisplay = document.getElementById('tttCurrentLevel');
const tttMaxLevelDisplay = document.getElementById('tttMaxLevel');
const gkQuizTokensDisplay = document.getElementById('gkQuizTokens');
const gkQuestionNumberDisplay = document.getElementById('gkQuestionNumber');
const gkTotalQuestionsDisplay = document.getElementById('gkTotalQuestions');
const gkQuestionText = document.getElementById('gkQuestionText');
const gkOptionsContainer = document.getElementById('gkOptionsContainer');
const gkFeedback = document.getElementById('gkFeedback');
const gkAdStatus = document.getElementById('gk-ad-status');
const gkNextButton = document.getElementById('gkNextButton');
const gkQuizBackToMenuBtn = document.getElementById('gkQuizBackToMenuBtn');
const navHomeBtn = document.getElementById('nav-home');
const navPlayGameBtn = document.getElementById('nav-play-game');
const navReferBtn = document.getElementById('nav-refer');
const navLeaderboardBtn = document.getElementById('nav-leaderboard');
const navProfileBottomBtn = document.getElementById('nav-profile-bottom');
const navProfileHeaderBtn = document.getElementById('nav-profile-header');
const logoutButtonProfile = document.getElementById('logout-button-profile');
const profileAvatarImg = document.getElementById('profile-avatar-img');
const avatarUploadInput = document.getElementById('avatar-upload-input');
const avatarUploadStatus = document.getElementById('avatar-upload-status');
const profileEmailDisplay = document.getElementById('profile-email-display');
const profileNameDisplay = document.getElementById('profile-name-display');
const editNameButton = document.getElementById('edit-name-button');
const editNameForm = document.getElementById('edit-name-form');
const editNameInput = document.getElementById('edit-name-input');
const saveNameButton = document.getElementById('save-name-button');
const cancelEditNameButton = document.getElementById('cancel-edit-name-button');
const changePasswordButton = document.getElementById('change-password-button');
const profileReferralCodeDisplay = document.getElementById('profile-referral-code-display');
const profileTokenDisplay = document.getElementById('profile-token-display');
const profileReferralCountDisplay = document.getElementById('profile-referral-count-display');
const withdrawalAmountInput = document.getElementById('withdrawal-amount');
const withdrawalMethodSelect = document.getElementById('withdrawal-method');
const withdrawalDetailsInput = document.getElementById('withdrawal-details');
const submitWithdrawalButton = document.getElementById('submit-withdrawal-button');
const withdrawalFeedback = document.getElementById('withdrawal-feedback');
const referCodeDisplay = document.getElementById('refer-code-display');
const referLinkDisplay = document.getElementById('refer-link-display');
const copyReferralButton = document.getElementById('copy-referral-button');
const referralCountDisplay = document.getElementById('referral-count-display');
const leaderboardListContainer = document.getElementById('leaderboard-list');
const historyListContainer = document.getElementById('history-list');

// --- Utility Functions ---
function getTodayDateString() { const today = new Date(); const year = today.getFullYear(); const month = String(today.getMonth() + 1).padStart(2, '0'); const day = String(today.getDate()).padStart(2, '0'); return `${year}-${month}-${day}`; }

function showSection(sectionElement) {
    activeBannerContainers.forEach(containerId => {
        hideAdMobBanner_hopweb(ADMOB_BANNER_UNIT_ID, containerId);
    });
    activeBannerContainers = [];
    // Add gamesHubSection to the list of manageable sections
    const sections = [authSection, mainContent, gamesHubSection, tttSection, gkQuizSection, profileSection, referralSection, leaderboardSection, historySection];
    sections.forEach(sec => sec?.classList.add('hidden'));
    bottomNav.classList.add('hidden'); // Hide nav by default

    if (sectionElement) {
        sectionElement.classList.remove('hidden');
        // Show nav only if it's not the auth section
        if (sectionElement !== authSection) {
            bottomNav.classList.remove('hidden');
        }
        // Handle banner ads in the shown section
        const bannerPlaceholders = sectionElement.querySelectorAll('.ad-container.banner-ad');
        bannerPlaceholders.forEach(placeholder => {
            if (placeholder.id) {
                showAdMobBanner_hopweb(ADMOB_BANNER_UNIT_ID, placeholder.id);
                activeBannerContainers.push(placeholder.id);
            } else {
                console.warn("Banner container without ID in section:", sectionElement.id);
            }
        });
    }
}
function updateFeedback(element, message, isError = true) { if (!element) return; element.textContent = message; element.style.color = isError ? '#ff5050' : '#00ff88'; }
function clearFeedback(...elements) { elements.forEach(el => { if (el) el.textContent = ''; }); }
function updateTokenDisplay(tokens) { const displayTokens = tokens ?? 0; if (userTokenDisplayHeader) userTokenDisplayHeader.textContent = displayTokens; if (gkQuizTokensDisplay) gkQuizTokensDisplay.textContent = displayTokens; if (profileTokenDisplay) profileTokenDisplay.textContent = displayTokens; }
function updateReferralCountDisplay(count) { const displayCount = count ?? 0; if (profileReferralCountDisplay) profileReferralCountDisplay.textContent = displayCount; if (referralCountDisplay) referralCountDisplay.textContent = displayCount; }
async function addTokens(userId, amount, reason = "general_reward") { if (!userId || !amount || !db) return; const userRef = doc(db, "users", userId); const transactionRef = collection(db, "transactions"); try { await updateDoc(userRef, { tokens: increment(amount), lastTokenUpdateReason: reason, lastTokenUpdateTime: serverTimestamp() }); console.log(`${amount > 0 ? '+' : ''}${amount} tokens for ${userId}: ${reason}`); await addDoc(transactionRef, { userId: userId, amount: amount, reason: reason, timestamp: serverTimestamp() }); console.log("Transaction logged successfully."); if (currentUserData && currentUserData.uid === userId) { currentUserData.tokens = (currentUserData.tokens || 0) + amount; updateTokenDisplay(currentUserData.tokens); } else if (userId === currentUserId) { await fetchUserData(userId); } } catch (error) { console.error(`Token update or transaction log error for ${userId}:`, error); } }
function generateReferralCode(userId) { if (!userId) return 'ERRORCODE'; const uidPart = userId.substring(userId.length - 6).toUpperCase(); const randomPart = Math.random().toString(36).substring(2, 4).toUpperCase(); return `${uidPart}${randomPart}`; }
function showLoginForm() { if (!loginForm || !signupForm) { console.error("Login/Signup form missing!"); return; } loginForm.classList.remove('hidden'); signupForm.classList.add('hidden'); clearFeedback(signupFeedback, loginFeedback); if(loginEmailInput) loginEmailInput.value = ''; if(loginPasswordInput) loginPasswordInput.value = ''; }
function showSignupForm() { if (!loginForm || !signupForm) { console.error("Login/Signup form missing!"); return; } signupForm.classList.remove('hidden'); loginForm.classList.add('hidden'); clearFeedback(signupFeedback, loginFeedback); if(signupEmailInput) signupEmailInput.value = ''; if(signupPasswordInput) signupPasswordInput.value = ''; if(signupReferralCodeInput) signupReferralCodeInput.value = ''; }
function formatFirestoreTimestamp(timestamp) { if (!timestamp) return 'N/A'; const date = timestamp.toDate(); return date.toLocaleString(); }


// --- Authentication Logic ---
if (auth) {
    onAuthStateChanged(auth, async (user) => {
        console.log("onAuthStateChanged triggered. User:", user ? user.uid : 'null');
        clearFeedback(signupFeedback, loginFeedback);
        if (user) {
            console.log("User is logged in:", user.uid);
            currentUserId = user.uid;
            await fetchUserData(user.uid); // This will call updateWatchAdButtonUI internally
            checkDailyRewardStatus();
            showSection(mainContent); // Show home screen by default after login
            if (userInfoHeader) userInfoHeader.classList.remove('hidden');
        } else {
            console.log("User is logged out.");
            currentUserId = null;
            currentUserData = null;
            showSection(authSection); // Show auth screen on logout
            showLoginForm();
            if (userInfoHeader) userInfoHeader.classList.add('hidden');
            updateTokenDisplay(0);
            updateReferralCountDisplay(0);
            // Reset other UI elements related to user data
            if(userReferralCodeDisplay) userReferralCodeDisplay.textContent = 'N/A';
            if(profileEmailDisplay) profileEmailDisplay.textContent = '...';
            if(profileNameDisplay) profileNameDisplay.textContent = '...';
            if(profileAvatarImg) profileAvatarImg.src = DEFAULT_AVATAR_URL;
            if(profileReferralCodeDisplay) profileReferralCodeDisplay.textContent = '...';
            if(profileReferralCountDisplay) profileReferralCountDisplay.textContent = '...';
            if(referCodeDisplay) referCodeDisplay.textContent = '...';
            if(referLinkDisplay) referLinkDisplay.textContent = 'Login to see';
            if(copyReferralButton) copyReferralButton.disabled = true;
            if(claimDailyRewardButton) { claimDailyRewardButton.disabled = true; claimDailyRewardButton.textContent = 'Claim Daily Reward'; claimDailyRewardButton.classList.remove('claimed'); }
            if(dailyRewardFeedback) dailyRewardFeedback.textContent = '';
            // Reset watch ad button on logout
            if(watchAdMainButton) {
                watchAdMainButton.disabled = true;
                watchAdMainButton.textContent = 'Watch Ad & Get Reward';
                watchAdMainButton.style.opacity = '0.6';
                watchAdMainButton.style.cursor = 'not-allowed';
            }
        }
    });
} else {
    console.error("Firebase Auth object is not available. Auth listener not set.");
    alert("Authentication service failed to load. Please refresh.");
}

// --- Fetch User Data ---
async function fetchUserData(userId) {
    console.log(`Fetching user data for: ${userId}`);
    if (!userId || !db) {
        console.error("Cannot fetch user data: No userId or db connection.");
        return;
    }
    const userRef = doc(db, "users", userId);
    try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            currentUserData = { uid: docSnap.id, ...docSnap.data() };
            console.log("User data fetched:", currentUserData);

            // Handle ad watch fields
            currentUserData.adWatchCount = docSnap.data().adWatchCount || 0;
            currentUserData.lastAdWatchDate = docSnap.data().lastAdWatchDate || null; // Expecting 'YYYY-MM-DD' string or null

            updateTokenDisplay(currentUserData.tokens || 0);
            updateReferralCountDisplay(currentUserData.referrals || 0);
            if(userReferralCodeDisplay) userReferralCodeDisplay.textContent = currentUserData.referralCode || 'Generating...';
            if(profileNameDisplay) profileNameDisplay.textContent = currentUserData.name || 'Guest';
            if(profileAvatarImg) profileAvatarImg.src = currentUserData.avatarUrl || DEFAULT_AVATAR_URL;

            if (!currentUserData.referralCode) {
                const newCode = generateReferralCode(userId);
                await updateDoc(userRef, { referralCode: newCode });
                currentUserData.referralCode = newCode;
                if(userReferralCodeDisplay) userReferralCodeDisplay.textContent = newCode;
                console.log("Generated missing referral code.");
            }
            tttCurrentLevel = currentUserData.tttLevel || 1;

            // Update ad button UI after fetching data
            updateWatchAdButtonUI();

        } else {
            console.warn(`No user document found for ${userId}! Creating...`);
            const newCode = generateReferralCode(userId);
            await setDoc(userRef, {
                email: auth?.currentUser?.email || 'unknown',
                name: 'Guest',
                avatarUrl: null,
                uid: userId,
                createdAt: serverTimestamp(),
                tokens: 0,
                referralCode: newCode,
                referrals: 0,
                referredBy: null,
                lastLogin: serverTimestamp(),
                lastDailyClaimDate: null, // Store as 'YYYY-MM-DD'
                tttLevel: 1,
                adWatchCount: 0,       // Add field
                lastAdWatchDate: null  // Add field
            });
            console.log("New user document created.");
            await fetchUserData(userId); // Refetch to load the new data
        }
    } catch (error) {
        console.error("Fetch User Data Error:", error);
        // Reset UI elements in case of error
        updateTokenDisplay(0);
        updateReferralCountDisplay(0);
        if(userReferralCodeDisplay) userReferralCodeDisplay.textContent = 'Error';
        if(profileEmailDisplay) profileEmailDisplay.textContent = 'Error';
        if(profileNameDisplay) profileNameDisplay.textContent = 'Error';
        if(profileAvatarImg) profileAvatarImg.src = DEFAULT_AVATAR_URL;
        if(profileReferralCodeDisplay) profileReferralCodeDisplay.textContent = 'Error';
        if(profileReferralCountDisplay) profileReferralCountDisplay.textContent = 'Error';
        if(referCodeDisplay) referCodeDisplay.textContent = 'Error';
        if(referLinkDisplay) referLinkDisplay.textContent = 'Error';
        if(copyReferralButton) copyReferralButton.disabled = true;
        currentUserData = null;
        // Update ad button UI in error case
        if(watchAdMainButton) {
            watchAdMainButton.disabled = true;
            watchAdMainButton.textContent = 'Watch Ad (Error)';
            watchAdMainButton.style.opacity = '0.6';
            watchAdMainButton.style.cursor = 
