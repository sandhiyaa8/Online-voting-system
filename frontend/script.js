


function calculateAge() {
    let dob = document.getElementById("dob").value;
    if (!dob) return;

    let birth = new Date(dob);
    let today = new Date();
    let age = today.getFullYear() - birth.getFullYear();

    document.getElementById("age").value = age;

    enableRegisterIfValid();
}




function loadStates() {
    let state = document.getElementById("state");
    if (state) {
        state.innerHTML = `
            <option value="">Select State</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
        `;
    }
}




function loadTaluks() {
    let taluk = document.getElementById("taluk");
    if (!taluk) return;
    
    const majorTaluks = [
        "Chennai North", "Chennai South", "Chennai Central",
        "Coimbatore North", "Coimbatore South",
        "Madurai North", "Madurai South", "Madurai East", "Madurai West",
        "Salem", "Tiruchirappalli", "Tirunelveli", "Erode",
        "Vellore", "Thanjavur", "Dindigul", "Tiruppur",
        "Cuddalore", "Karur", "Kanyakumari"
    ];
    
    taluk.innerHTML = '<option value="">Select Taluk</option>';
    majorTaluks.sort().forEach(t => {
        taluk.innerHTML += `<option value="${t}">${t}</option>`;
    });
}




function enableRegisterIfValid() {
    let age = document.getElementById("age").value;
    let photo = document.getElementById("photo").value;
    let adhar = document.getElementById("adhar").value;
    let voterid = document.getElementById("voterid").value;

    let btn = document.getElementById("regBtn");

    if (age >= 18 && photo && adhar && voterid) {
        btn.disabled = false;
        btn.classList.remove("disabled");
    } else {
        btn.disabled = true;
        btn.classList.add("disabled");
    }
}




document.getElementById("regForm")?.addEventListener("submit", async function(e) {
    e.preventDefault();

    let data = {
        name: document.getElementById("name").value,
        dob: document.getElementById("dob").value,
        age: document.getElementById("age").value,
        mobile: document.getElementById("mobile").value,
        address: document.getElementById("address").value,
        country: document.getElementById("country").value,
        state: document.getElementById("state").value,
        taluk: document.getElementById("taluk").value,
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    };

    try {
        let res = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        let result = await res.json();
        
        if (res.ok) {
            alert(result.message || "Registration successful!");
            document.getElementById("regForm").reset();
        } else {
            alert(result.error || "Registration failed!");
        }

    } catch (err) {
        alert("Error connecting to backend server!");
        console.log(err);
    }
});




const API_BASE_URL = "http://localhost:5000";




document.getElementById("loginForm")?.addEventListener("submit", async function(e) {
    e.preventDefault();

    let username = document.getElementById("loginUsername").value;
    let password = document.getElementById("loginPassword").value;

    try {
        let res = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        let result = await res.json();

        if (res.ok) {
            // Store temp token and user ID for OTP verification
            localStorage.setItem("tempToken", result.tempToken);
            localStorage.setItem("userId", result.userId);
            localStorage.setItem("userMobile", result.mobile);
            
            // Redirect to OTP verification page
            window.location.href = "otp.html";
        } else {
            alert(result.error || "Login failed");
        }
    } catch (err) {
        alert("Error connecting to backend server!");
        console.error(err);
    }
});


// OTP Page Handler
document.getElementById("otpForm")?.addEventListener("submit", async function(e) {
    e.preventDefault();

    // Get all OTP input fields and combine them
    const otpInputs = document.querySelectorAll(".otp-input");
    const otp = Array.from(otpInputs).map(input => input.value).join("");

    if (otp.length !== 6) {
        alert("Please enter all 6 digits of the OTP");
        return;
    }

    const userId = localStorage.getItem("userId");
    const verifyBtn = document.getElementById("verifyBtn");
    verifyBtn.disabled = true;
    verifyBtn.textContent = "Verifying...";

    try {
        let res = await fetch(`${API_BASE_URL}/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, otp })
        });

        let result = await res.json();

        if (res.ok) {
            // Clear temporary data and store actual token
            localStorage.removeItem("tempToken");
            localStorage.removeItem("userId");
            localStorage.removeItem("userMobile");
            
            localStorage.setItem("token", result.token);
            localStorage.setItem("userId", result.user.id);
            localStorage.setItem("oneTimeKey", result.oneTimeKey);
            localStorage.setItem("user", JSON.stringify(result.user));
            
            alert(result.message);
            window.location.href = "home.html";
        } else {
            alert(result.error || "OTP verification failed");
            verifyBtn.disabled = false;
            verifyBtn.textContent = "Verify OTP";
        }
    } catch (err) {
        alert("Error connecting to backend server!");
        console.error(err);
        verifyBtn.disabled = false;
        verifyBtn.textContent = "Verify OTP";
    }
});

// OTP Input Auto-Focus Handler
document.addEventListener("DOMContentLoaded", function() {
    const otpInputs = document.querySelectorAll(".otp-input");
    const messageDiv = document.getElementById("otpMessage");
    
    // Display mobile number if available
    const userMobile = localStorage.getItem("userMobile");
    if (messageDiv && userMobile) {
        messageDiv.textContent = `OTP has been sent to ****${userMobile}`;
    }

    otpInputs.forEach((input, index) => {
        input.addEventListener("keyup", function(e) {
            // Only allow numbers
            if (!/[0-9]/.test(e.key) && e.key !== "Backspace") {
                this.value = "";
                return;
            }

            // Move to next input when a digit is entered
            if (this.value && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }

            // Remove filled class if empty
            if (this.value) {
                this.classList.add("filled");
            } else {
                this.classList.remove("filled");
            }

            // Auto-submit when all 6 digits are entered
            if (Array.from(otpInputs).every(input => input.value)) {
                document.getElementById("otpForm").dispatchEvent(new Event("submit"));
            }
        });

        input.addEventListener("keydown", function(e) {
            // Handle backspace to move to previous input
            if (e.key === "Backspace" && !this.value && index > 0) {
                otpInputs[index - 1].focus();
                otpInputs[index - 1].value = "";
                otpInputs[index - 1].classList.remove("filled");
            }
        });

        input.addEventListener("paste", function(e) {
            e.preventDefault();
            const pastedData = (e.clipboardData || window.clipboardData).getData("text");
            const digits = pastedData.replace(/\D/g, "").slice(0, 6);
            
            if (digits.length === 6) {
                digits.split("").forEach((digit, i) => {
                    otpInputs[i].value = digit;
                    otpInputs[i].classList.add("filled");
                });
                document.getElementById("otpForm").dispatchEvent(new Event("submit"));
            }
        });
    });

    // Resend OTP Button
    const resendBtn = document.getElementById("resendBtn");
    const timerDisplay = document.getElementById("timerDisplay");
    let resendTimer = 30; // 30 seconds cooldown

    if (resendBtn) {
        resendBtn.addEventListener("click", async function(e) {
            e.preventDefault();

            if (resendBtn.classList.contains("disabled")) {
                return;
            }

            const userId = localStorage.getItem("userId");

            try {
                let res = await fetch(`${API_BASE_URL}/resend-otp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId })
                });

                let result = await res.json();

                if (res.ok) {
                    alert("OTP resent successfully!");
                    
                    // Clear previous OTP inputs
                    otpInputs.forEach(input => {
                        input.value = "";
                        input.classList.remove("filled");
                    });
                    otpInputs[0].focus();

                    // Start cooldown timer
                    resendBtn.classList.add("disabled");
                    resendTimer = 30;
                    startResendTimer();
                } else {
                    alert(result.error || "Failed to resend OTP");
                }
            } catch (err) {
                alert("Error connecting to backend server!");
                console.error(err);
            }
        });
    }

    function startResendTimer() {
        const interval = setInterval(() => {
            resendTimer--;
            if (timerDisplay) {
                timerDisplay.textContent = `Resend available in ${resendTimer}s`;
            }

            if (resendTimer <= 0) {
                clearInterval(interval);
                resendBtn.classList.remove("disabled");
                if (timerDisplay) {
                    timerDisplay.textContent = "";
                }
            }
        }, 1000);
    }
});


function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
}




function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login first");
        window.location.href = "login.html";
        return false;
    }
    return true;
}




async function loadCandidates() {
    if (!checkAuth()) return;

    const token = localStorage.getItem("token");
    const candidateList = document.getElementById("candidateList");

    try {
        
        let statusRes = await fetch(`${API_BASE_URL}/voting-status`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        let statusData = await statusRes.json();

        const votingStatusDiv = document.getElementById("votingStatus");
        
        if (statusData.hasVoted) {
            votingStatusDiv.innerHTML = `
                <div class="alert alert-danger">
                    <strong>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                            <circle cx="12" cy="12" r="10" fill="#28a745"/>
                            <path d="M8 12l2 2 4-4" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Vote Already Cast
                    </strong><br>
                    You have already cast your vote. Thank you for participating in this election!
                </div>
            `;
            candidateList.innerHTML = `
                <div class="text-center" style="padding: 3rem;">
                    <div style="display: flex; justify-content: center; margin-bottom: 1rem;">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" fill="#28a745"/>
                            <path d="M8 12l2 2 4-4" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <h3>Thank You for Voting!</h3>
                    <p class="text-muted">Your vote has been recorded successfully.</p>
                    <button onclick="window.location.href='home.html'" class="btn btn-primary mt-3">Back to Dashboard</button>
                </div>
            `;
            return;
        } else {
            votingStatusDiv.innerHTML = `
                <div class="alert alert-success">
                    <strong>Ready to Vote</strong><br>
                    Please select your preferred candidate below. You can only vote once.
                </div>
            `;
        }

        
        let res = await fetch(`${API_BASE_URL}/candidates`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        let data = await res.json();

        if (res.ok && data.candidates.length > 0) {
            candidateList.innerHTML = "";
            
            data.candidates.forEach(candidate => {
                let card = document.createElement("div");
                card.className = "candidate-card";
                
                
                const initials = candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2);
                const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                const bgColor = colors[Math.floor(Math.random() * colors.length)];
                
                card.innerHTML = `
                    <div style="width: 120px; height: 120px; border-radius: 50%; background: ${bgColor}; color: white; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 700; margin: 0 auto 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        ${initials}
                    </div>
                    <h3>${candidate.name}</h3>
                    <p class="party">${candidate.party || 'Independent'}</p>
                    <p style="margin: 0.5rem 0;"><strong>Position:</strong> ${candidate.position || 'MLA'}</p>
                    <div class="votes">📊 ${candidate.votes || 0} votes</div>
                    <button class="btn btn-primary" onclick="confirmVote('${candidate._id}', '${candidate.name}')">
                        Vote for ${candidate.name.split(' ')[0]}
                    </button>
                `;
                candidateList.appendChild(card);
            });
        } else if (data.candidates.length === 0) {
            candidateList.innerHTML = `
                <div class="text-center" style="padding: 3rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                    <h3>No Candidates Available</h3>
                    <p class="text-muted">No candidates are registered in your taluk yet.</p>
                </div>
            `;
        } else {
            candidateList.innerHTML = `
                <div class="alert alert-danger">
                    <strong>Error:</strong> Unable to load candidates. Please try again.
                </div>
            `;
        }
    } catch (err) {
        console.error(err);
        candidateList.innerHTML = "<p>Error connecting to server.</p>";
    }
}




async function confirmVote(candidateId, candidateName) {
    let ok = confirm("Do you confirm voting for " + candidateName + "?");
    if (!ok) return;

    // Verify one-time key before allowing vote
    const keyStatus = await checkOneTimeKeyStatus();
    
    if (!keyStatus) {
        alert("Unable to verify your session. Please login again.");
        return;
    }

    if (keyStatus.isUsed) {
        alert("Your one-time key has already been used. You cannot vote multiple times.");
        return;
    }

    if (keyStatus.isExpired) {
        alert("Your one-time key has expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("oneTimeKey");
        localStorage.removeItem("userId");
        window.location.href = "login.html";
        return;
    }

    if (!keyStatus.hasKey) {
        alert("Session not properly initialized. Please login again.");
        window.location.href = "login.html";
        return;
    }

    const token = localStorage.getItem("token");
    const oneTimeKey = localStorage.getItem("oneTimeKey");

    try {
        let res = await fetch(`${API_BASE_URL}/vote`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ candidateId, oneTimeKey })
        });

        let result = await res.json();

        if (res.ok) {
            // Remove one-time key after successful vote (already used)
            localStorage.removeItem("oneTimeKey");
            alert("Thank you! Your vote for " + candidateName + " has been recorded.");
            window.location.reload(); 
        } else {
            alert(result.error || "Failed to cast vote");
        }
    } catch (err) {
        console.error(err);
        alert("Error connecting to server!");
    }
}

// One-Time Key Helper Functions

// Validate and use the one-time key
async function validateOneTimeKey() {
    const userId = localStorage.getItem("userId");
    const oneTimeKey = localStorage.getItem("oneTimeKey");
    
    if (!userId || !oneTimeKey) {
        console.warn("User ID or one-time key not found");
        return false;
    }

    try {
        let res = await fetch(`${API_BASE_URL}/validate-one-time-key`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, oneTimeKey })
        });

        let result = await res.json();

        if (res.ok) {
            // Remove one-time key from localStorage after successful validation
            localStorage.removeItem("oneTimeKey");
            return true;
        } else {
            console.error(result.error || "One-time key validation failed");
            return false;
        }
    } catch (err) {
        console.error("One-Time Key Validation Error:", err);
        return false;
    }
}

// Check one-time key status without using it
async function checkOneTimeKeyStatus() {
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
        console.warn("User ID not found");
        return null;
    }

    try {
        let res = await fetch(`${API_BASE_URL}/check-one-time-key`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId })
        });

        let result = await res.json();

        if (res.ok) {
            return {
                hasKey: result.hasKey,
                isUsed: result.isUsed,
                isExpired: result.isExpired,
                expiresAt: result.expiresAt
            };
        } else {
            console.error(result.error || "Failed to check one-time key status");
            return null;
        }
    } catch (err) {
        console.error("Check One-Time Key Status Error:", err);
        return null;
    }
}

// Verify one-time key before performing critical operations
async function verifyOneTimeKeyBeforeAction(actionCallback) {
    const keyStatus = await checkOneTimeKeyStatus();
    
    if (!keyStatus) {
        alert("Unable to verify your session");
        return false;
    }

    if (keyStatus.isUsed) {
        alert("Your one-time key has already been used");
        return false;
    }

    if (keyStatus.isExpired) {
        alert("Your one-time key has expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("oneTimeKey");
        localStorage.removeItem("userId");
        window.location.href = "login.html";
        return false;
    }

    if (!keyStatus.hasKey) {
        alert("Session not properly initialized");
        return false;
    }

    // Validate and use the key
    const isValid = await validateOneTimeKey();
    if (isValid && actionCallback) {
        await actionCallback();
    }

    return isValid;
}
