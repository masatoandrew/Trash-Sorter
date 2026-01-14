
import React, { useState, useEffect, useCallback } from 'react';
import { Page, ClassificationResult, UserSettings, UserData, Challenge, User } from './types';
import { identifyTrashItem } from './services/geminiService';
import { Logo } from './components/Logo';
import { Button } from './components/Button';
import { Nav } from './components/Nav';

// Firebase Imports from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  signOut as firebaseSignOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Initialize Firebase with the specific project configuration provided
const firebaseConfig = {
  apiKey: "AIzaSyDKm-QpdYJDwtmDfcAKbbb2kZzke7nvfbI",
  authDomain: "sort-it-dc355.firebaseapp.com",
  projectId: "sort-it-dc355",
  storageBucket: "sort-it-dc355.firebasestorage.app",
  messagingSenderId: "307726679820",
  appId: "1:307726679820:web:1f2327125379c0b3b19329",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Icons
const CameraIcon = () => <i className="fa-solid fa-camera"></i>;
const UploadIcon = () => <i className="fa-solid fa-upload"></i>;
const GoogleIcon = () => <i className="fa-brands fa-google text-red-500"></i>;

const CHALLENGES: Omit<Challenge, 'current'>[] = [
  { id: '1', description: "Sort 3 Plastic items today", target: 3, type: 'category', value: 'Plastic' },
  { id: '2', description: "Find a Paper item before lunch", target: 1, type: 'time', value: 'Paper' },
  { id: '3', description: "Get 2 correct predictions in a row", target: 2, type: 'prediction' },
  { id: '4', description: "Scan a Metal item", target: 1, type: 'category', value: 'Metal' },
  { id: '5', description: "Complete your first scan of the day", target: 1, type: 'count' },
  { id: '6', description: "Scan something for the Compost bin", target: 1, type: 'category', value: 'Compost' },
  { id: '7', description: "Correctly identify a Landfill item", target: 1, type: 'category', value: 'Landfill' },
  { id: '8', description: "Scan 5 items total", target: 5, type: 'count' },
  { id: '9', description: "Reach a 3-day streak", target: 3, type: 'streak' },
  { id: '10', description: "Scan an item with 90% confidence", target: 1, type: 'confidence' },
];

const TRANSLATIONS: Record<string, any> = {
  English: {
    loginTitle: "Login",
    loginSubtitle: "Sign in to continue",
    signupTitle: "Create New Account",
    namePlaceholder: "Name",
    passPlaceholder: "Password",
    emailPlaceholder: "Email",
    loginBtn: "Log In",
    signupBtn: "Sign Up",
    forgotPass: "Forgot Password?",
    createAccount: "Create an Account",
    haveAccount: "Have an account? Log In",
    homePrompt: "What would you like to do?",
    takePhoto: "Take a Photo",
    uploadPhoto: "Upload Photo",
    analyzing: "Analyzing Trash...",
    detectedItem: "Detected Item",
    recBin: "Recommended Bin",
    modelConf: "Model Confidence",
    learnMore: "Learn More About Bins",
    scanAnother: "Scan Another Item",
    aboutTitle: "About Us",
    settingsTitle: "Settings",
    language: "Language",
    cameraFlash: "Camera Flash",
    largeText: "Large Text",
    largeTextSub: "For better readability",
    highContrast: "High Contrast",
    highContrastSub: "Improve visibility",
    viewPrivacy: "Privacy & Security",
    viewPrivacySub: "How we protect your data",
    camCapture: "Capture",
    privacyPageTitle: "Privacy & Security",
    predictionTitle: "What's your guess?",
    predictionSubtitle: "Predict the bin to earn bonus XP!",
    xpGained: "XP Gained",
    levelLabel: "Level",
    streakLabel: "Day Streak",
    historyTitle: "Recent Sorts",
    badgesTitle: "Badges",
    itemsSorted: "Items Sorted",
    correctGuess: "Correct Guess Bonus!",
    challengeTitle: "Daily Challenge",
    binModalTitle: "Bin Categories",
    signOut: "Sign Out",
  },
};

const INITIAL_USER_DATA: UserData = {
  user: null,
  xp: 0,
  level: 1,
  streak: 0,
  lastScanDate: null,
  totalScans: 0,
  correctPredictions: 0,
  consecutiveCorrect: 0,
  badges: [],
  completedChallenges: [],
  currentChallenge: null,
  history: [],
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LOGIN);
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [settings, setUserSettings] = useState<UserSettings>({
    highContrast: false,
    largeText: false,
    language: 'English',
  });
  const [showBinInfo, setShowBinInfo] = useState(false);

  const [userData, setUserData] = useState<UserData>(() => {
    const saved = localStorage.getItem('sort_it_user_data_v2');
    return saved ? JSON.parse(saved) : INITIAL_USER_DATA;
  });

  const [userPrediction, setUserPrediction] = useState<string | null>(null);
  const [showPrediction, setShowPrediction] = useState(false);

  // Sync Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const mappedUser: User = {
          name: firebaseUser.displayName || "Explorer",
          email: firebaseUser.email || "",
          photo: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${firebaseUser.displayName}`,
        };
        setUserData(prev => ({ ...prev, user: mappedUser }));
        setCurrentPage(Page.HOME);
      } else {
        setUserData(prev => ({ ...prev, user: null }));
        // Only redirect to login if we were not already on login/signup
        setCurrentPage(prev => (prev === Page.SIGNUP ? Page.SIGNUP : Page.LOGIN));
      }
    });
    return unsubscribe;
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Firebase Auth Error:", error);
      
      if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        alert(
          `UNAUTHORIZED DOMAIN ERROR:\n\n` +
          `The domain "${currentDomain}" is not whitelisted in your Firebase project.\n\n` +
          `To fix this:\n` +
          `1. Go to Firebase Console > Authentication > Settings > Authorized Domains\n` +
          `2. Add "${currentDomain}" to the list.`
        );
      } else if (error.code === 'auth/popup-blocked') {
        alert("Please enable popups for this site to sign in with Google.");
      } else if (error.code !== 'auth/popup-closed-by-user') {
        alert(`Sign-in failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (window.confirm("Ready to sign out? Your local progress will be saved.")) {
      try {
        await firebaseSignOut(auth);
      } catch (error) {
        console.error("Sign out error:", error);
      }
    }
  };

  useEffect(() => {
    localStorage.setItem('sort_it_user_data_v2', JSON.stringify(userData));
  }, [userData]);

  useEffect(() => {
    const today = new Date().toDateString();
    if (userData.lastScanDate !== today && (!userData.currentChallenge || userData.completedChallenges.includes(today))) {
      const randomChallenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
      setUserData(prev => ({
        ...prev,
        currentChallenge: { ...randomChallenge, current: 0 }
      }));
    }
  }, [userData.lastScanDate, userData.completedChallenges, userData.currentChallenge]);

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS['English'];
  const calculateLevel = (xp: number) => Math.floor(xp / 250) + 1;

  const processScanReward = useCallback((finalResult: ClassificationResult, prediction: string | null) => {
    setUserData(prev => {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const isCorrect = prediction && finalResult.binCategory.toLowerCase().includes(prediction.toLowerCase());
      const xpGain = 10 + (isCorrect ? 20 : (prediction ? 5 : 0));
      let newStreak = prev.streak;
      if (prev.lastScanDate === yesterday) newStreak = prev.streak + 1;
      else if (prev.lastScanDate !== today) newStreak = 1;
      const totalXpGain = xpGain;
      const newXp = prev.xp + totalXpGain;
      const newLevel = calculateLevel(newXp);
      return { ...prev, xp: newXp, level: newLevel, streak: newStreak, lastScanDate: today, totalScans: prev.totalScans + 1 };
    });
  }, []);

  const handleImageInput = async (base64: string) => {
    setImage(base64);
    setIsLoading(true);
    setCurrentPage(Page.RESULTS);
    setShowPrediction(true);
    setResult(null);
    try {
        const data = await identifyTrashItem(base64, settings.language);
        setResult(data);
        setIsLoading(false);
    } catch (e) { setIsLoading(false); }
  }

  const handlePrediction = (category: string) => {
    setUserPrediction(category);
    setShowPrediction(false);
    if (result) processScanReward(result, category);
  };

  const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-teal' : 'bg-gray-300'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-7' : 'left-1'}`} />
    </button>
  );

  return (
    <div className={`min-h-screen w-full flex flex-col bg-white relative overflow-hidden ${settings.highContrast ? 'grayscale contrast-125' : ''} ${settings.largeText ? 'text-lg' : 'text-base'}`}>
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-green-50 to-white z-0 pointer-events-none"></div>
      <Nav setPage={setCurrentPage} currentPage={currentPage} />

      <div className="relative z-10 flex-1 flex flex-col w-full max-w-md mx-auto h-full overflow-y-auto pt-16">
        {[Page.LOGIN, Page.SIGNUP, Page.HOME].includes(currentPage) && <Logo />}

        <div className={`flex-1 bg-white tear-edge p-6 flex flex-col ${currentPage === Page.RESULTS ? 'bg-green-50' : ''}`}>
          {currentPage === Page.LOGIN && (
            <div className="flex flex-col gap-4 animate-fade-in text-center mt-4">
              <h2 className="text-3xl font-bold text-darkGreen mb-1">{t.loginTitle}</h2>
              <p className="text-gray-400 text-sm mb-4">{t.loginSubtitle}</p>
              
              <button 
                onClick={handleGoogleSignIn} 
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-full border-2 border-gray-100 bg-white text-gray-700 font-bold text-sm shadow-sm active:scale-95 transition-all disabled:opacity-50"
              >
                <GoogleIcon /> {isLoading ? "Connecting..." : "Continue with Google"}
              </button>

              <div className="flex items-center my-4"><div className="flex-1 h-px bg-gray-100"></div><span className="px-4 text-[10px] text-gray-300 font-bold uppercase">or email</span><div className="flex-1 h-px bg-gray-100"></div></div>
              <input type="text" placeholder={t.namePlaceholder} className="w-full p-4 rounded-full bg-mint/30 border-none outline-none text-darkGreen" />
              <input type="password" placeholder={t.passPlaceholder} className="w-full p-4 rounded-full bg-mint/30 border-none outline-none text-darkGreen" />
              <Button onClick={() => alert("Check your email!")} variant="outline" className="border-none text-teal text-xs mt-1">{t.forgotPass}</Button>
              <Button onClick={() => setCurrentPage(Page.HOME)} className="bg-darkGreen text-white mt-4">{t.loginBtn}</Button>
              <button className="text-teal font-bold text-sm mt-6 hover:underline" onClick={() => setCurrentPage(Page.SIGNUP)}>{t.createAccount}</button>
            </div>
          )}

          {currentPage === Page.SIGNUP && (
            <div className="flex flex-col gap-4 animate-fade-in text-center mt-4">
              <h2 className="text-3xl font-bold text-darkGreen mb-1">{t.signupTitle}</h2>
              <p className="text-gray-400 text-sm mb-6">Join the sorting fun!</p>
              <button 
                onClick={handleGoogleSignIn} 
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-full border-2 border-gray-100 bg-white text-gray-700 font-bold text-sm shadow-sm active:scale-95 transition-all disabled:opacity-50"
              >
                <GoogleIcon /> {isLoading ? "Connecting..." : "Continue with Google"}
              </button>
              <div className="flex items-center my-4"><div className="flex-1 h-px bg-gray-100"></div><span className="px-4 text-[10px] text-gray-300 font-bold uppercase">or email</span><div className="flex-1 h-px bg-gray-100"></div></div>
              <input type="email" placeholder={t.emailPlaceholder} className="w-full p-4 rounded-full bg-mint/30 border-none outline-none text-darkGreen" />
              <input type="password" placeholder={t.passPlaceholder} className="w-full p-4 rounded-full bg-mint/30 border-none outline-none text-darkGreen" />
              <Button onClick={() => setCurrentPage(Page.HOME)} className="bg-darkGreen text-white mt-4">{t.signupBtn}</Button>
              <p className="text-teal font-bold mt-6 cursor-pointer text-sm" onClick={() => setCurrentPage(Page.LOGIN)}>{t.haveAccount}</p>
            </div>
          )}

          {currentPage === Page.HOME && (
            <div className="flex flex-col gap-6 animate-fade-in text-center mt-8">
               {userData.user && (
                 <div className="text-left mb-2 flex items-center gap-4">
                    <img src={userData.user.photo} className="w-12 h-12 rounded-full border-2 border-mint" alt="user" />
                    <div>
                      <h2 className="text-xl font-bold text-darkGreen">Hi, {userData.user.name.split(' ')[0]}!</h2>
                      <p className="text-gray-400 text-[10px]">{userData.user.email}</p>
                    </div>
                 </div>
               )}
               <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-mint flex items-center justify-between">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 bg-mint rounded-full flex items-center justify-center font-bold text-darkGreen">{userData.level}</div><div className="text-left"><p className="text-[10px] text-gray-400 font-bold uppercase">Level</p></div></div>
                  <div className="text-right"><p className="text-[10px] text-gray-400 font-bold uppercase">Streak</p><p className="font-bold text-darkGreen text-lg">{userData.streak} 🔥</p></div>
               </div>
               <h3 className="text-xl font-semibold text-darkGreen">{t.homePrompt}</h3>
               <Button onClick={() => setCurrentPage(Page.CAMERA)} className="h-20"><CameraIcon /> {t.takePhoto}</Button>
               <Button variant="secondary" onClick={() => setCurrentPage(Page.UPLOAD)} className="h-20"><UploadIcon /> {t.uploadPhoto}</Button>
            </div>
          )}

          {currentPage === Page.CAMERA && <CameraCapture onCapture={handleImageInput} t={t} />}
          {currentPage === Page.UPLOAD && <ImageUpload onUpload={handleImageInput} t={t} />}

          {currentPage === Page.RESULTS && (
             <div className="flex flex-col animate-fade-in">
                 <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-xl mb-6 bg-gray-100 relative mt-4">
                     {image && <img src={image} className="w-full h-full object-cover" alt="item" />}
                     {isLoading && <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-md"><div className="w-12 h-12 border-4 border-mint border-t-transparent rounded-full animate-spin mb-4"></div><p className="font-bold">{t.analyzing}</p></div>}
                     {!isLoading && showPrediction && <div className="absolute inset-0 bg-darkGreen/90 flex flex-col items-center justify-center p-8 text-white text-center z-20 backdrop-blur-sm"><h4 className="text-2xl font-bold mb-8">{t.predictionTitle}</h4><div className="grid grid-cols-2 gap-4 w-full">{['Recycle', 'Compost', 'Landfill', 'E-Waste'].map(cat => <button key={cat} onClick={() => handlePrediction(cat)} className="bg-white/10 border border-white/20 py-4 rounded-2xl font-bold hover:bg-white/20">{cat}</button>)}</div></div>}
                 </div>
                 {!isLoading && result && !showPrediction && (
                     <div className="flex flex-col gap-4 animate-fade-in">
                         <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-mint flex justify-between items-center"><div><p className="text-[10px] text-gray-400 font-bold uppercase">Reward</p><p className="font-bold text-darkGreen">{userPrediction && result.binCategory.includes(userPrediction) ? "Correct Guess!" : "Nice Sort!"} <span className="text-teal">+10 XP</span></p></div></div>
                         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                           <p className="text-xs text-gray-400 font-bold uppercase mb-1">{t.detectedItem}</p>
                           <h3 className="text-2xl font-bold text-darkGreen mb-4">{result.itemType}</h3>
                           <p className="text-xs text-gray-400 font-bold uppercase mb-2">{t.recBin}</p>
                           <div className={`inline-block px-4 py-2 rounded-xl font-bold text-white mb-4 ${result.binCategory.includes('Recycle') ? 'bg-teal' : result.binCategory.includes('Compost') ? 'bg-green-600' : 'bg-orange-500'}`}>{result.binCategory}</div>
                           <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{t.modelConf}</span><span>{result.confidence}%</span></div>
                           <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden"><div className="bg-mint h-full" style={{ width: `${result.confidence}%`}}></div></div>
                         </div>
                         <Button variant="outline" onClick={() => setShowBinInfo(true)}>{t.learnMore}</Button>
                         <Button onClick={() => setCurrentPage(Page.HOME)} variant="secondary">{t.scanAnother}</Button>
                     </div>
                 )}
             </div>
          )}

          {currentPage === Page.SETTINGS && (
            <div className="flex flex-col gap-6 mt-4 pb-20">
               <h3 className="text-3xl font-bold text-darkGreen">{t.settingsTitle}</h3>
               <div className="bg-gray-50 p-4 rounded-2xl flex flex-col gap-2"><span className="text-gray-700 font-bold">{t.language}</span><div className="flex gap-2">{['English', '日本語'].map(l => <button key={l} onClick={() => setUserSettings({...settings, language: l})} className={`flex-1 py-3 rounded-xl font-bold ${settings.language === l ? 'bg-teal text-white' : 'bg-white text-gray-600 border'}`}>{l}</button>)}</div></div>
               <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center"><span className="font-bold">{t.largeText}</span><Toggle active={settings.largeText} onClick={() => setUserSettings({...settings, largeText: !settings.largeText})} /></div>
               <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center"><span className="font-bold">{t.highContrast}</span><Toggle active={settings.highContrast} onClick={() => setUserSettings({...settings, highContrast: !settings.highContrast})} /></div>
               <Button onClick={handleSignOut} variant="outline" className="mt-8">{t.signOut}</Button>
            </div>
          )}
        </div>
      </div>
      {showBinInfo && <BinInfoModal onClose={() => setShowBinInfo(false)} t={t} />}
    </div>
  );
};

// Simplified Sub-components
const CameraCapture: React.FC<{ onCapture: (base64: string) => void, t: any }> = ({ onCapture, t }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    useEffect(() => {
        let stream: MediaStream | null = null;
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
          .then(s => { stream = s; if (videoRef.current) videoRef.current.srcObject = s; })
          .catch(err => {
            console.error("Camera error:", err);
            alert("Could not access camera. Please check permissions.");
          });
        return () => stream?.getTracks().forEach(track => track.stop());
    }, []);
    return (
        <div className="flex flex-col animate-fade-in">
          <video ref={videoRef} autoPlay playsInline muted className="rounded-3xl bg-black aspect-[3/4] object-cover mb-4" />
          <Button onClick={() => { 
            const c = document.createElement('canvas'); 
            const v = videoRef.current!; 
            c.width = v.videoWidth; 
            c.height = v.videoHeight; 
            c.getContext('2d')!.drawImage(v, 0, 0); 
            onCapture(c.toDataURL('image/jpeg')); 
          }}>{t.camCapture}</Button>
        </div>
    );
};

const ImageUpload: React.FC<{ onUpload: (base64: string) => void, t: any }> = ({ onUpload, t }) => (
    <div className="flex flex-col items-center justify-center border-4 border-dashed border-mint rounded-3xl aspect-[3/4] p-8 text-center relative bg-mint/5">
        <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => onUpload(r.result as string); r.readAsDataURL(f); } }} className="absolute inset-0 opacity-0 cursor-pointer" />
        <i className="fa-solid fa-cloud-arrow-up text-5xl text-mint mb-4"></i>
        <p className="font-bold text-darkGreen text-lg">Tap to Upload Photo</p>
        <p className="text-gray-400 text-sm mt-2">Pick an image from your gallery</p>
    </div>
);

const BinInfoModal: React.FC<{ onClose: () => void, t: any }> = ({ onClose, t }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-scale-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-teal transition-colors">
          <i className="fa-solid fa-circle-xmark text-3xl"></i>
        </button>
        <h2 className="text-2xl font-bold text-darkGreen mb-6">{t.binModalTitle}</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-teal flex-shrink-0 flex items-center justify-center text-white"><i className="fa-solid fa-recycle"></i></div>
            <div>
              <p className="font-bold text-darkGreen">Recycle</p>
              <p className="text-sm text-gray-600">Paper, Plastic bottles, Glass jars, Metal cans.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-green-600 flex-shrink-0 flex items-center justify-center text-white"><i className="fa-solid fa-leaf"></i></div>
            <div>
              <p className="font-bold text-darkGreen">Compost</p>
              <p className="text-sm text-gray-600">Food scraps, eggshells, coffee grounds.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex-shrink-0 flex items-center justify-center text-white"><i className="fa-solid fa-trash"></i></div>
            <div>
              <p className="font-bold text-darkGreen">Landfill</p>
              <p className="text-sm text-gray-600">Soft plastics, diapers, broken ceramics.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
);

export default App;
