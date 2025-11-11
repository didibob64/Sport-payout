const initialBalance = 000060; // Initial 6-figure balance

function generateUserId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generateReferralLink(userId) {
  return `https://didibob64.github.io/Sport-payout/#/referral?id=${userId}`; // Replace with your actual domain link
}

function signup() {
  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  // Basic validation
  if (!fullName || !email || !password) {
    document.getElementById('signupMessage').textContent = "Please fill in all fields.";
    return;
  }
  
  if (localStorage.getItem(email)) {
    document.getElementById('signupMessage').textContent = "Email already registered.";
    return;
  }
  
  const userId = generateUserId();
  const referralLink = generateReferralLink(userId);
  
  const user = {
    id: userId,
    fullName: fullName,
    email: email,
    password: password, // In real-world, HASH the password!
    balance: initialBalance,
    referralLink: referralLink,
    profilePicture: 'default-profile.png' // Default profile picture
  };
  
  localStorage.setItem(email, JSON.stringify(user));
  document.getElementById('signupMessage').textContent = "Sign up successful! Redirecting to login...";
  setTimeout(() => {
    window.location.href = "login.html";
  }, 2000);
}

function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  const storedUser = localStorage.getItem(email);
  
  if (!storedUser) {
    document.getElementById('loginMessage').textContent = "Invalid email or password.";
    return;
  }
  
  const user = JSON.parse(storedUser);
  
  if (user.password !== password) { //In real world compare HASHED passwords
    document.getElementById('loginMessage').textContent = "Invalid email or password.";
    return;
  }
  
  localStorage.setItem('loggedInUser', email); // Store email to indicate logged-in user
  document.getElementById('loginMessage').textContent = "Login successful! Redirecting...";
  setTimeout(() => {
    window.location.href = "home.html";
  }, 2000);
}

function displayUserInfo() {
  const loggedInUserEmail = localStorage.getItem('loggedInUser');
  
  if (!loggedInUserEmail) {
    window.location.href = "login.html"; // Redirect if not logged in
    return;
  }
  
  const storedUser = localStorage.getItem(loggedInUserEmail);
  
  if (!storedUser) {
    window.location.href = "login.html"; // Redirect if user data is missing
    return;
  }
  
  const user = JSON.parse(storedUser);
  
  document.getElementById('userIdDisplay').textContent = user.id;
  document.getElementById('fullNameDisplay').textContent = user.fullName;
  document.getElementById('emailDisplay').textContent = user.email;
  document.getElementById('balanceDisplay').textContent = user.balance.toLocaleString(); // Format with commas
  document.getElementById('referralLinkDisplay').textContent = user.referralLink;
}

function displayProfileInfo() {
  const loggedInUserEmail = localStorage.getItem('loggedInUser');
  
  if (!loggedInUserEmail) {
    window.location.href = "login.html";
    return;
  }
  
  const storedUser = localStorage.getItem(loggedInUserEmail);
  
  if (!storedUser) {
    window.location.href = "login.html";
    return;
  }
  
  const user = JSON.parse(storedUser);
  
  document.getElementById('profileUserIdDisplay').textContent = user.id;
  document.getElementById('profileFullNameDisplay').textContent = user.fullName;
  document.getElementById('profileEmailDisplay').textContent = user.email;
  document.getElementById('profilePicture').src = user.profilePicture;
}

function handleProfilePictureUpload(event) {
  const file = event.target.files[0];
  
  if (file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const loggedInUserEmail = localStorage.getItem('loggedInUser');
      const storedUser = localStorage.getItem(loggedInUserEmail);
      const user = JSON.parse(storedUser);
      
      user.profilePicture = e.target.result; // Store the image as a data URL
      localStorage.setItem(loggedInUserEmail, JSON.stringify(user));
      document.getElementById('profilePicture').src = e.target.result; // Update the image on the page
    }
    
    reader.readAsDataURL(file); // Convert the image to a data URL
  }
}

function transferFunds() {
  const senderEmail = localStorage.getItem('loggedInUser');
  const recipientId = document.getElementById('transferUserId').value;
  const amount = parseFloat(document.getElementById('transferAmount').value);
  const transferMessageElement = document.getElementById('transferMessage');
  
  if (!senderEmail) {
    transferMessageElement.textContent = "You must be logged in to transfer funds.";
    return;
  }
  
  if (!recipientId || isNaN(amount) || amount <= 0) {
    transferMessageElement.textContent = "Please enter a valid User ID and amount.";
    return;
  }
  
  const senderData = JSON.parse(localStorage.getItem(senderEmail));
  
  if (senderData.balance < amount) {
    transferMessageElement.textContent = "Insufficient funds.";
    return;
  }
  
  let recipientEmail = null;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key !== 'loggedInUser') { // Skip the loggedInUser key
      try {
        const user = JSON.parse(localStorage.getItem(key));
        if (user && user.id === recipientId) {
          recipientEmail = key;
          break;
        }
      } catch (e) {
        // Ignore errors parsing non-JSON data in localStorage
      }
    }
  }
  
  if (!recipientEmail) {
    transferMessageElement.textContent = "Recipient User ID not found.";
    return;
  }
  
  const recipientData = JSON.parse(localStorage.getItem(recipientEmail));
  
  // Perform the transfer
  senderData.balance -= amount;
  recipientData.balance += amount;
  
  localStorage.setItem(senderEmail, JSON.stringify(senderData));
  localStorage.setItem(recipientEmail, JSON.stringify(recipientData));
  
  transferMessageElement.textContent = `Successfully transferred $${amount.toLocaleString()} to User ID ${recipientId}.`;
  displayUserInfo(); // Update sender's balance on the home page
}

function logout() {
  localStorage.removeItem('loggedInUser');
  window.location.href = "login.html";
}

// Attach event listeners (if forms exist on the page)
document.addEventListener("DOMContentLoaded", function() {
  if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent default form submission
      signup();
    });
  }
  
  if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent default form submission
      login();
    });
  }
  
  if (document.getElementById('transferBtn')) {
    document.getElementById('transferBtn').addEventListener('click', transferFunds);
  }
  
  if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', logout);
  }
  
  
});
