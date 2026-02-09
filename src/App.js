import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { AppConfig, UserSession, showConnect } from "@stacks/connect";

// --- CONFIGURATION ---
const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

function App() {
  const [userData, setUserData] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // --- SAFETY FIX: Auto-clear corrupted sessions ---
    try {
      if (userSession.isSignInPending()) {
        userSession.handlePendingSignIn().then((userData) => {
          setUserData(userData);
        });
      } else if (userSession.isUserSignedIn()) {
        setUserData(userSession.loadUserData());
      }
    } catch (e) {
      console.error("Session corrupted, resetting...", e);
      localStorage.clear();
      window.location.reload();
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const connectWallet = () => {
    showConnect({
      appDetails: { name: "Stacks Nexus", icon: window.location.origin + "/logo192.png" },
      redirectTo: "/",
      onFinish: () => setUserData(userSession.loadUserData()),
      userSession,
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut("/");
    setUserData(null);
  };

  // --- NAVBAR ---
  const Navbar = () => {
    const location = useLocation();
    const isHome = location.pathname === "/";
    
    const navStyle = {
      ...styles.navbar,
      backgroundColor: isHome && !isScrolled ? "transparent" : "rgba(5, 5, 5, 0.95)",
      borderBottom: isHome && !isScrolled ? "none" : "1px solid #333",
      backdropFilter: "blur(10px)",
    };

    return (
      <nav style={navStyle}>
        <div style={styles.logoGroup}>
          <div style={styles.logoIcon}>⚡</div>
          <Link to="/" style={styles.navLinkLogo}>Stacks Nexus</Link>
        </div>
        <div style={styles.navLinks}>
          <Link to="/" style={styles.link}>Mission</Link>
          <Link to="/earn" style={styles.link}>Bounties</Link>
          {userData ? (
            <div style={styles.walletBadge}>
              <span style={styles.statusDot}></span>
              {userData.profile.stxAddress.mainnet.slice(0, 4)}...
              <button style={styles.btnDisconnect} onClick={disconnectWallet}>×</button>
            </div>
          ) : (
            <button style={styles.btnPrimary} onClick={connectWallet}>Connect Wallet</button>
          )}
        </div>
      </nav>
    );
  };

  // --- HOME PAGE ---
  const Home = () => (
    <div style={styles.pageContainer}>
      <div style={styles.heroContainer}>
        <div style={styles.videoOverlay}></div>
        {/* VIDEO TAG with FIXED PATH */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          style={styles.videoBg}
        >
           <source src={process.env.PUBLIC_URL + "/assets/background.mp4"} type="video/mp4" />
        </video>
        
        <div style={styles.heroContent}>
          <span style={styles.heroTag}>THE BITCOIN LAYER FOR SMART CONTRACTS</span>
          <h1 style={styles.heroTitle}>Build on the <br/> World's Most Secure Blockchain.</h1>
          <p style={styles.heroSub}>
            Activate the Bitcoin economy. Write Clarity smart contracts, launch sBTC apps, and earn Bitcoin yield via Proof of Transfer (PoX).
          </p>
          <div style={styles.heroButtons}>
            <Link to="/earn"><button style={styles.btnHeroPrimary}>View Bounties</button></Link>
          </div>
        </div>
      </div>
    </div>
  );

  // --- EARN PAGE ---
  const Earn = () => {
    const bounties = [
      { id: 1, title: "Create sBTC Swap UI", reward: "1,500 STX", diff: "Hard", desc: "Build a frontend for swapping sBTC to STX." },
      { id: 2, title: "Clarinet Test Suite", reward: "500 STX", diff: "Medium", desc: "Write unit tests for the 'Stacking' pool contract." },
      { id: 3, title: "Discord Verification Bot", reward: "800 STX", diff: "Medium", desc: "Build a bot that verifies STX holdership." },
    ];

    return (
      <div style={styles.pageContent}>
        <div style={styles.headerGroup}>
          <h1 style={styles.pageTitle}>Developer Bounties</h1>
          <p style={styles.pageSub}>Contribute to open source Stacks projects and get funded.</p>
        </div>
        <div style={styles.grid}>
          {bounties.map((b) => (
            <div key={b.id} style={styles.card}>
              <div style={styles.cardHeader}><span style={styles.tag}>{b.diff}</span></div>
              <h3 style={styles.cardTitle}>{b.title}</h3>
              <p style={styles.cardDesc}>{b.desc}</p>
              <div style={styles.cardFooter}>
                <span style={styles.reward}>{b.reward}</span>
                <button 
                  style={userData ? styles.btnClaim : styles.btnDisabled} 
                  onClick={() => userData ? alert("Application Submitted!") : connectWallet()}
                >
                  {userData ? "Apply Now" : "Connect Wallet"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Router>
      <div style={styles.appContainer}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/earn" element={<Earn />} />
        </Routes>
      </div>
    </Router>
  );
}

// --- STYLES ---
const styles = {
  appContainer: { fontFamily: 'sans-serif', backgroundColor: "#050505", minHeight: "100vh", color: "#fff" },
  navbar: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.3s ease" },
  logoGroup: { display: "flex", alignItems: "center", gap: "12px" },
  logoIcon: { color: "#F05537", fontSize: "24px" },
  navLinkLogo: { textDecoration: "none", color: "white", fontWeight: "700", fontSize: "20px" },
  navLinks: { display: "flex", alignItems: "center", gap: "32px" },
  link: { textDecoration: "none", color: "#ccc", fontSize: "14px", fontWeight: "500" },
  btnPrimary: { background: "#F05537", color: "white", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
  btnDisconnect: { background: "transparent", border: "none", color: "#666", fontSize: "18px", cursor: "pointer", marginLeft: "10px" },
  walletBadge: { display: "flex", alignItems: "center", background: "#1A1A1A", padding: "8px 16px", borderRadius: "20px", border: "1px solid #333", fontSize: "14px", color: "#fff" },
  statusDot: { width: "8px", height: "8px", background: "#4CAF50", borderRadius: "50%", marginRight: "8px" },
  heroContainer: { position: "relative", height: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", overflow: "hidden" },
  videoBg: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 },
  videoOverlay: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", zIndex: 1 },
  heroContent: { position: "relative", zIndex: 2, maxWidth: "800px", padding: "20px" },
  heroTag: { color: "#F05537", fontWeight: "bold", letterSpacing: "2px", fontSize: "12px", marginBottom: "16px", display: "block" },
  heroTitle: { fontSize: "64px", fontWeight: "800", lineHeight: "1.1", marginBottom: "24px" },
  heroSub: { fontSize: "20px", color: "#ddd", marginBottom: "40px", lineHeight: "1.6" },
  btnHeroPrimary: { background: "#fff", color: "#000", border: "none", padding: "16px 36px", borderRadius: "50px", fontWeight: "700", fontSize: "16px", cursor: "pointer" },
  pageContent: { paddingTop: "120px", maxWidth: "1100px", margin: "0 auto", paddingBottom: "100px", paddingLeft: "20px", paddingRight: "20px" },
  headerGroup: { marginBottom: "60px", textAlign: "center" },
  pageTitle: { fontSize: "48px", fontWeight: "800", marginBottom: "16px" },
  pageSub: { fontSize: "18px", color: "#888" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" },
  card: { background: "#121216", border: "1px solid #222", borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column" },
  cardHeader: { marginBottom: "16px" },
  tag: { background: "rgba(240, 85, 55, 0.1)", color: "#F05537", padding: "4px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: "600" },
  cardTitle: { fontSize: "20px", fontWeight: "bold", marginBottom: "12px" },
  cardDesc: { color: "#888", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px", flexGrow: 1 },
  cardFooter: { marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #222", paddingTop: "20px" },
  reward: { fontSize: "20px", fontWeight: "700", color: "#fff" },
  btnClaim: { background: "#fff", color: "#000", border: "none", padding: "8px 20px", borderRadius: "6px", fontWeight: "600", cursor: "pointer" },
  btnDisabled: { background: "#222", color: "#555", border: "none", padding: "8px 20px", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }
};

export default App;