import React, { useState } from 'react';
import { Page, ClassificationResult, UserSettings } from './types';
import { identifyTrashItem } from './services/geminiService';
import { Logo } from './components/Logo';
import { Button } from './components/Button';
import { Nav } from './components/Nav';

// Icons
const CameraIcon = () => <i className="fa-solid fa-camera"></i>;
const UploadIcon = () => <i className="fa-solid fa-upload"></i>;

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

  // Accessibilty classes
  const textClass = settings.largeText ? 'text-lg' : 'text-base';
  const contrastClass = settings.highContrast ? 'contrast-125' : '';

  const handleCapture = async (file: File) => {
    setIsLoading(true);
    setCurrentPage(Page.RESULTS);
    
    // Convert to base64 for preview and API
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImage(base64);
      
      try {
        const data = await identifyTrashItem(base64);
        setResult(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (base64: string) => {
    setImage(base64);
    setIsLoading(true);
    setCurrentPage(Page.RESULTS);
    
    // Artificial delay to show loading animation (UX)
    setTimeout(async () => {
        const data = await identifyTrashItem(base64);
        setResult(data);
        setIsLoading(false);
    }, 1000);
  }

  return (
    <div className={`min-h-screen w-full flex flex-col bg-white relative overflow-hidden ${contrastClass}`}>
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-green-50 to-white z-0 pointer-events-none"></div>

      <Nav setPage={setCurrentPage} currentPage={currentPage} />

      <div className="relative z-10 flex-1 flex flex-col w-full max-w-md mx-auto h-full">
        
        {/* Header Section (Logo) - only on certain pages */}
        {[Page.LOGIN, Page.SIGNUP, Page.HOME, Page.CAMERA, Page.UPLOAD].includes(currentPage) && (
            <div className="bg-transparent pb-12">
                <Logo />
            </div>
        )}

        {/* Torn Paper Edge Content Container */}
        <div className={`flex-1 bg-white tear-edge p-6 flex flex-col ${currentPage === Page.RESULTS ? 'bg-green-50' : ''}`}>
            
          {/* --- LOGIN PAGE --- */}
          {currentPage === Page.LOGIN && (
            <div className="flex flex-col gap-4 animate-fade-in text-center mt-4">
              <h2 className={`text-3xl font-bold text-darkGreen mb-2 ${textClass}`}>Login</h2>
              <p className="text-gray-500 mb-8">Sign in to continue</p>
              
              <input type="text" placeholder="Name" className="w-full p-4 rounded-full bg-mint/30 border-none focus:ring-2 ring-teal outline-none text-darkGreen placeholder-green-700/50" />
              <input type="password" placeholder="Password" className="w-full p-4 rounded-full bg-mint/30 border-none focus:ring-2 ring-teal outline-none text-darkGreen placeholder-green-700/50" />
              
              <Button onClick={() => setCurrentPage(Page.HOME)} className="bg-darkGreen text-white mt-4">Log In</Button>
              
              <p className="text-sm text-gray-500 mt-4 cursor-pointer hover:underline">Forgot Password</p>
              <p className="text-sm text-teal font-bold mt-8 cursor-pointer" onClick={() => setCurrentPage(Page.SIGNUP)}>Create an Account</p>
            </div>
          )}

          {/* --- SIGNUP PAGE --- */}
          {currentPage === Page.SIGNUP && (
            <div className="flex flex-col gap-4 animate-fade-in text-center mt-4">
              <h2 className={`text-3xl font-bold text-darkGreen mb-2 ${textClass}`}>Create New Account</h2>
              
              <input type="text" placeholder="Name" className="w-full p-4 rounded-full bg-mint/30 border-none focus:ring-2 ring-teal outline-none text-darkGreen placeholder-green-700/50" />
              <input type="email" placeholder="Email" className="w-full p-4 rounded-full bg-mint/30 border-none focus:ring-2 ring-teal outline-none text-darkGreen placeholder-green-700/50" />
              <input type="password" placeholder="Password" className="w-full p-4 rounded-full bg-mint/30 border-none focus:ring-2 ring-teal outline-none text-darkGreen placeholder-green-700/50" />
              
              <Button onClick={() => setCurrentPage(Page.HOME)} className="bg-darkGreen text-white mt-4">Sign Up</Button>
              <p className="text-sm text-teal font-bold mt-8 cursor-pointer" onClick={() => setCurrentPage(Page.LOGIN)}>Have an account? Log In</p>
            </div>
          )}

          {/* --- HOME PAGE --- */}
          {currentPage === Page.HOME && (
            <div className="flex flex-col gap-6 animate-fade-in text-center mt-8">
               <h3 className={`text-xl font-semibold text-darkGreen mb-4 ${textClass}`}>What would you like to do?</h3>
               
               <Button onClick={() => setCurrentPage(Page.CAMERA)} className="h-20 text-lg">
                 <span className="bg-white/20 p-2 rounded-full mr-2"><CameraIcon /></span> Take a Photo
               </Button>
               
               <Button variant="secondary" onClick={() => setCurrentPage(Page.UPLOAD)} className="h-20 text-lg">
                 <span className="bg-white/20 p-2 rounded-full mr-2"><UploadIcon /></span> Upload Photo
               </Button>

               <div className="mt-8 bg-sky-50 p-4 rounded-xl border border-sky-100">
                  <div className="flex items-start gap-3">
                    <span className="text-teal text-xl">🌱</span>
                    <p className="text-xs text-left text-gray-600 leading-relaxed">
                        <span className="font-bold text-teal">Privacy First:</span> Your photos are analyzed securely and never stored on our servers.
                    </p>
                  </div>
               </div>
            </div>
          )}

          {/* --- UPLOAD PAGE --- */}
          {currentPage === Page.UPLOAD && (
            <div className="flex flex-col gap-6 animate-fade-in text-center mt-8">
               <h3 className={`text-2xl font-bold text-darkGreen mb-2 ${textClass}`}>Upload a Photo</h3>
               <p className="text-gray-500 text-sm mb-4">Capture or upload an image of the item you want to recycle</p>
               
               <label className="w-full cursor-pointer">
                   <div className="bg-teal text-white py-4 px-6 rounded-full font-medium shadow-md flex items-center justify-center gap-2 hover:bg-sky-600 transition-colors">
                       <UploadIcon /> Choose File
                   </div>
                   <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                          if(e.target.files && e.target.files[0]) handleCapture(e.target.files[0]);
                      }}
                   />
               </label>

               <div className="mt-8 bg-sky-50 p-4 rounded-xl border border-sky-100">
                  <h4 className="text-teal font-bold text-left text-sm mb-1">Privacy Notice:</h4>
                  <p className="text-xs text-left text-gray-600 leading-relaxed">
                      Photos are processed securely locally or via secure ephemeral API calls and never stored. By using this feature, you consent to one-time analysis.
                  </p>
               </div>
            </div>
          )}

          {/* --- CAMERA PAGE --- */}
          {currentPage === Page.CAMERA && (
              <CameraCapture onCapture={handleCameraCapture} />
          )}

          {/* --- RESULTS PAGE --- */}
          {currentPage === Page.RESULTS && (
             <div className="flex flex-col animate-fade-in pb-8">
                 
                 {/* Image Preview */}
                 <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-lg mb-6 bg-gray-100 relative mt-4">
                     {image && <img src={image} alt="Captured trash" className="w-full h-full object-cover" />}
                     {isLoading && (
                         <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                             <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin mb-4"></div>
                             <p className="font-bold">Analyzing Trash...</p>
                         </div>
                     )}
                 </div>

                 {!isLoading && result && (
                     <div className="flex flex-col gap-4">
                         {/* Classification Card */}
                         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                             <p className="text-sm text-gray-400 uppercase tracking-wide font-bold mb-1">Detected Item</p>
                             <h3 className="text-2xl font-bold text-darkGreen mb-4 leading-tight">{result.itemType}</h3>
                             
                             <p className="text-sm text-gray-400 uppercase tracking-wide font-bold mb-1">Recommended Bin</p>
                             <div className={`inline-block px-4 py-2 rounded-lg font-bold text-white mb-6 ${
                                 result.binCategory.toLowerCase().includes('recycle') ? 'bg-blue-500' :
                                 result.binCategory.toLowerCase().includes('compost') ? 'bg-green-600' :
                                 result.binCategory.toLowerCase().includes('e-waste') ? 'bg-purple-500' :
                                 'bg-gray-600'
                             }`}>
                                 {result.binCategory}
                             </div>

                             <div className="flex justify-between items-end mb-2">
                                <span className="text-gray-500 font-medium">Model Confidence</span>
                                <span className="text-teal font-bold text-xl">{result.confidence}%</span>
                             </div>
                             <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                 <div 
                                    className="bg-mint h-full rounded-full transition-all duration-1000" 
                                    style={{ width: `${result.confidence}%`}}
                                 ></div>
                             </div>
                         </div>

                         {/* Tip Card */}
                         <div className="bg-sky-50 p-5 rounded-2xl border border-sky-100 flex gap-3">
                             <div className="text-teal text-xl mt-1"><i className="fa-solid fa-circle-info"></i></div>
                             <div>
                                 <h4 className="font-bold text-teal mb-1">Recycling Tip</h4>
                                 <p className="text-gray-700 text-sm leading-relaxed">{result.tip}</p>
                             </div>
                         </div>

                         {/* Fun Fact Card */}
                         <div className="bg-green-50 p-5 rounded-2xl border border-green-100 flex gap-3">
                             <div className="text-2xl mt-1">🌍</div>
                             <div>
                                 <h4 className="font-bold text-darkGreen mb-1">Fun Fact</h4>
                                 <p className="text-gray-700 text-sm leading-relaxed">{result.funFact}</p>
                             </div>
                         </div>

                         <div className="mt-4 flex flex-col gap-3">
                             <Button variant="outline" onClick={() => window.open('https://teachablemachine.withgoogle.com/models/fBAXu231i/', '_blank')}>
                                Learn More About Bins
                             </Button>
                             <Button onClick={() => setCurrentPage(Page.HOME)} variant="secondary">
                                <span className="mr-2"><CameraIcon /></span> Scan Another Item
                             </Button>
                         </div>
                     </div>
                 )}
             </div>
          )}

           {/* --- ABOUT PAGE --- */}
           {currentPage === Page.ABOUT && (
            <div className="flex flex-col gap-6 animate-fade-in text-left mt-8">
               <h3 className="text-2xl font-bold text-darkGreen">About Us</h3>
               
               <div className="bg-mint/20 p-4 rounded-xl">
                   <h4 className="font-bold text-darkGreen mb-2">Our Mission</h4>
                   <p className="text-gray-700 text-sm">Helping young people learn to recycle correctly to build a sustainable future.</p>
               </div>

               <div>
                   <h4 className="font-bold text-teal mb-2 flex items-center gap-2">
                       <i className="fa-solid fa-people-group"></i> Why we exist
                   </h4>
                   <p className="text-gray-600 text-sm leading-relaxed">
                       We noticed that many recyclable items end up in landfills simply because people are unsure. Trash Sorter makes it fun and easy to know where your waste goes!
                   </p>
               </div>

               <div>
                    <h4 className="font-bold text-teal mb-2">Our Values</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li><i className="fa-solid fa-leaf text-mint mr-2"></i> Sustainability</li>
                        <li><i className="fa-solid fa-book-open text-mint mr-2"></i> Education</li>
                        <li><i className="fa-solid fa-shield-halved text-mint mr-2"></i> Privacy</li>
                    </ul>
               </div>
            </div>
          )}

          {/* --- PRIVACY PAGE --- */}
          {currentPage === Page.PRIVACY && (
            <div className="flex flex-col gap-6 animate-fade-in text-left mt-8">
               <h3 className="text-2xl font-bold text-darkGreen">Privacy & Security</h3>
               
               <div className="bg-sky-50 p-6 rounded-xl border border-sky-100">
                   <i className="fa-solid fa-lock text-3xl text-teal mb-4"></i>
                   <p className="text-gray-700 font-medium mb-4">We take your privacy seriously.</p>
                   
                   <ul className="text-sm text-gray-600 space-y-4">
                       <li className="flex items-start gap-3">
                           <i className="fa-solid fa-check text-green-500 mt-1"></i>
                           <span><strong>No Storage:</strong> Photos are processed in real-time and immediately discarded.</span>
                       </li>
                       <li className="flex items-start gap-3">
                           <i className="fa-solid fa-check text-green-500 mt-1"></i>
                           <span><strong>No Tracking:</strong> We do not use advertising cookies or track your location.</span>
                       </li>
                       <li className="flex items-start gap-3">
                           <i className="fa-solid fa-check text-green-500 mt-1"></i>
                           <span><strong>Secure:</strong> We use industry-standard encryption for analysis.</span>
                       </li>
                   </ul>
               </div>

               <p className="text-xs text-gray-400 mt-4 text-center">Data Queries: privacy@trashsorter.app</p>
            </div>
          )}

          {/* --- SETTINGS PAGE --- */}
          {currentPage === Page.SETTINGS && (
            <div className="flex flex-col gap-6 animate-fade-in mt-8">
               <h3 className="text-2xl font-bold text-darkGreen mb-4">Settings</h3>
               
               {/* Toggle 1 */}
               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                   <span className="text-gray-700 font-medium">Camera Flash</span>
                   <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer">
                       <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                   </div>
               </div>

               {/* Toggle 2 */}
               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                   <div className="flex flex-col">
                       <span className="text-gray-700 font-medium">Large Text</span>
                       <span className="text-xs text-gray-400">For better readability</span>
                   </div>
                   <button 
                    onClick={() => setUserSettings(s => ({...s, largeText: !s.largeText}))}
                    className={`w-12 h-6 rounded-full relative transition-colors ${settings.largeText ? 'bg-mint' : 'bg-gray-300'}`}
                   >
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.largeText ? 'left-7' : 'left-1'}`}></div>
                   </button>
               </div>

               {/* Toggle 3 */}
               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                   <div className="flex flex-col">
                        <span className="text-gray-700 font-medium">High Contrast</span>
                        <span className="text-xs text-gray-400">Improve visibility</span>
                   </div>
                   <button 
                    onClick={() => setUserSettings(s => ({...s, highContrast: !s.highContrast}))}
                    className={`w-12 h-6 rounded-full relative transition-colors ${settings.highContrast ? 'bg-mint' : 'bg-gray-300'}`}
                   >
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.highContrast ? 'left-7' : 'left-1'}`}></div>
                   </button>
               </div>

               <div className="mt-8">
                   <button onClick={() => setCurrentPage(Page.PRIVACY)} className="w-full text-teal font-bold py-3 hover:bg-sky-50 rounded-lg">
                       View Privacy & Security Policy
                   </button>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// Internal Camera Component
const CameraCapture: React.FC<{ onCapture: (base64: string) => void }> = ({ onCapture }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [hasPermission, setHasPermission] = React.useState<boolean | null>(null);

    React.useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment' } 
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setHasPermission(true);
                }
            } catch (err) {
                console.error("Camera access denied:", err);
                setHasPermission(false);
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(videoRef.current, 0, 0);
            const base64 = canvas.toDataURL('image/jpeg');
            onCapture(base64);
        }
    };

    if (hasPermission === false) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <i className="fa-solid fa-video-slash text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">Camera access was denied. Please allow camera access in your browser settings to scan trash.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full animate-fade-in relative mt-8">
            <h3 className="text-2xl font-bold text-darkGreen text-center mb-2">Take a Photo</h3>
            <p className="text-gray-500 text-center text-sm mb-6">Capture the item you want to recycle</p>
            
            <div className="relative rounded-2xl overflow-hidden shadow-lg bg-black aspect-[3/4] w-full max-w-sm mx-auto">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                
                {/* Overlay guides */}
                <div className="absolute inset-0 border-2 border-white/30 m-8 rounded-xl pointer-events-none"></div>
            </div>

            <div className="mt-8 w-full max-w-sm mx-auto">
                <Button onClick={capturePhoto} className="h-16 text-lg">
                    <i className="fa-solid fa-camera mr-2"></i> Capture
                </Button>
            </div>

            <div className="mt-6 bg-sky-50 p-3 rounded-lg border border-sky-100 mx-auto max-w-sm">
                 <p className="text-xs text-center text-gray-500">
                     Privacy: Photos are analyzed securely one-time and never stored.
                 </p>
            </div>
        </div>
    );
};

export default App;