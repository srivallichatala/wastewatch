let reports = JSON.parse(localStorage.getItem('reports')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = null;
let isAdmin = false;
let currentReportId = null;

function showTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (tabId === 'adminDashboard' && isAdmin) {
        displayReports();
    } else if (tabId === 'solvedProblems') {
        displaySolvedProblems();
    }
}

document.getElementById('signup').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[type="password"]').value;
    if (users.some(user => user.email === email)) {
        alert('User with this email already exists');
        return;
    }
    users.push({ username, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Sign up successful! Please sign in.');
    showTab('signin');
});

document.getElementById('signin').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[type="password"]').value;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        document.getElementById('userActions').style.display = 'flex';
        showTab('report');
    } else {
        alert('Invalid credentials');
    }
});

document.getElementById('report').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!currentUser) {
        alert('Please sign in to submit a report');
        return;
    }
    const photo = this.querySelector('input[type="file"]').files[0];
    const villageName = this.querySelector('input[placeholder="Village Name"]').value;
    const district = this.querySelector('input[placeholder="District"]').value;
    const area = this.querySelector('input[placeholder="Area"]').value;
    const pincode = this.querySelector('input[placeholder="Pincode"]').value;
    const description = this.querySelector('textarea').value;

    const reader = new FileReader();
    reader.onloadend = function() {
        const newReport = {
            id: Date.now(),
            photo: reader.result,
            villageName,
            district,
            area,
            pincode,
            description,
            timestamp: new Date().toISOString(),
            solved: false,
            reportedBy: currentUser.email
        };
        reports.push(newReport);
        localStorage.setItem('reports', JSON.stringify(reports));
        alert('Report submitted successfully!');
        e.target.reset();
    }
    reader.readAsDataURL(photo);
});

document.getElementById('admin').addEventListener('submit', function(e) {
    e.preventDefault();
    const password = this.querySelector('input[type="password"]').value;
    if (password === 'admin123') {
        isAdmin = true;
        document.getElementById('userActions').style.display = 'flex';
        showTab('adminDashboard');
    } else {
        alert('Invalid admin password');
    }
});

function displayReports() {
    const reportsContainer = document.getElementById('reportsList');
    reportsContainer.innerHTML = '';
    reports.forEach((report) => {
        if (!report.solved) {
            const reportElement = document.createElement('div');
            reportElement.className = 'report';
            reportElement.innerHTML = `
                <img src="${report.photo}" alt="Waste Report">
                <h3>${report.villageName}</h3>
                <p><strong>District:</strong> ${report.district}</p>
                <p><strong>Area:</strong> ${report.area}</p>
                <p><strong>Pincode:</strong> ${report.pincode}</p>
                <p><strong>Description:</strong> ${report.description}</p>
                <p><strong>Reported by:</strong> ${report.reportedBy}</p>
                <p><strong>Reported on:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
                <button onclick="openSolutionModal(${report.id})">Mark as Solved</button>
            `;
            reportsContainer.appendChild(reportElement);
        }
    });
}

function displaySolvedProblems() {
    const solvedContainer = document.getElementById('solvedList');
    solvedContainer.innerHTML = '';
    reports.forEach((report) => {
        if (report.solved) {
            const solvedElement = document.createElement('div');
            solvedElement.className = 'solved-problem';
            solvedElement.innerHTML = `
                <h3>${report.villageName}</h3>
                <p><strong>District:</strong> ${report.district}</p>
                <p><strong>Area:</strong> ${report.area}</p>
                <p><strong>Pincode:</strong> ${report.pincode}</p>
                <p><strong>Original Problem:</strong> ${report.description}</p>
                <p><strong>Reported on:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
                <img src="${report.solutionPhoto}" alt="Solution Photo">
                <p><strong>Solution:</strong> ${report.solutionDescription}</p>
                <p><strong>Solved on:</strong> ${new Date(report.solvedTimestamp).toLocaleString()}</p>
            `;
            solvedContainer.appendChild(solvedElement);
        }
    });
}

function openSolutionModal(reportId) {
    currentReportId = reportId;
    document.getElementById('solutionModal').style.display = 'block';
}

function submitSolution() {
    const solutionPhoto = document.getElementById('solutionPhoto').files[0];
    const solutionDescription = document.getElementById('solutionDescription').value;

    if (!solutionPhoto || !solutionDescription) {
        alert('Please provide both a photo and description for the solution.');
        return;
    }

    const reader = new FileReader();
    reader.onloadend = function() {
        reports = reports.map(report => {
            if (report.id === currentReportId) {
                return { 
                    ...report, 
                    solved: true, 
                    solutionPhoto: reader.result, 
                    solutionDescription: solutionDescription,
                    solvedTimestamp: new Date().toISOString()
                };
            }
            return report;
        });
        localStorage.setItem('reports', JSON.stringify(reports));
        document.getElementById('solutionModal').style.display = 'none';
        displayReports();
        alert('Solution submitted successfully!');
    }
    reader.readAsDataURL(solutionPhoto);
}

function logout() {
    currentUser = null;
    isAdmin = false;
    document.getElementById('userActions').style.display = 'none';
    showTab('home');
}

document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('solutionModal').style.display = 'none';
});

window.onclick = function(event) {
    if (event.target == document.getElementById('solutionModal')) {
        document.getElementById('solutionModal').style.display = 'none';
    }
}