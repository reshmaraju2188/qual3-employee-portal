/* Live Time */
function updateTime() {
    const now = new Date();
    document.getElementById("time").innerHTML =
        now.toLocaleDateString() + " | " + now.toLocaleTimeString();
}
setInterval(updateTime, 1000);
updateTime();

/* Year-wise Indian Holidays */
/* Year-wise US Federal Holidays */
const holidayData = {
    "2024": {
        "01-01": "New Year's Day",
        "01-15": "Martin Luther King Jr. Day",
        "02-19": "Presidents' Day",
        "05-27": "Memorial Day",
        "06-19": "Juneteenth",
        "07-04": "Independence Day 🇺🇸",
        "09-02": "Labor Day",
        "10-14": "Columbus Day",
        "11-11": "Veterans Day",
        "11-28": "Thanksgiving Day",
        "12-25": "Christmas Day"
    },

    "2025": {
        "01-01": "New Year's Day",
        "01-20": "Martin Luther King Jr. Day",
        "02-17": "Presidents' Day",
        "05-26": "Memorial Day",
        "06-19": "Juneteenth",
        "07-04": "Independence Day 🇺🇸",
        "09-01": "Labor Day",
        "10-13": "Columbus Day",
        "11-11": "Veterans Day",
        "11-27": "Thanksgiving Day",
        "12-25": "Christmas Day"
    },

    "2026": {
        "01-01": "New Year's Day",
        "01-19": "Martin Luther King Jr. Day",
        "02-16": "Presidents' Day",
        "05-25": "Memorial Day",
        "06-19": "Juneteenth",
        "07-04": "Independence Day 🇺🇸",
        "09-07": "Labor Day",
        "10-12": "Columbus Day",
        "11-11": "Veterans Day",
        "11-26": "Thanksgiving Day",
        "12-25": "Christmas Day"
    }
};



/* Generate Calendar */
function generateCalendar(year, month) {
    if (!year || month === "") return;

    const calendar = document.getElementById("calendar");
    const monthYear = document.getElementById("monthYear");

    const monthNum = parseInt(month);
    const today = new Date();

    const daysInMonth = new Date(year, monthNum + 1, 0).getDate();
    const startDay = new Date(year, monthNum, 1).getDay();

    const months = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    monthYear.innerText = `${months[monthNum]} ${year}`;

    let table = "<table><tr>";
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    days.forEach(d => table += `<th>${d}</th>`);
    table += "</tr><tr>";

    for (let i = 0; i < startDay; i++) {
        table += "<td></td>";
    }

    const yearHolidays = holidayData[year] || {};
    const monthKey = String(monthNum + 1).padStart(2, "0");

    for (let day = 1; day <= daysInMonth; day++) {

        const dateKey = `${monthKey}-${String(day).padStart(2, "0")}`;
        let className = "";

        // highlight today
        if (
            day === today.getDate() &&
            year == today.getFullYear() &&
            monthNum === today.getMonth()
        ) {
            className = "today";
        }

        // holiday day cell
        if (yearHolidays[dateKey]) {
            table += `
                <td class="holiday ${className}">
                    <strong>${day}</strong>
                    <span class="holiday-name">${yearHolidays[dateKey]}</span>
                </td>
            `;
        } else {
            table += `<td class="${className}">${day}</td>`;
        }

        if ((day + startDay) % 7 === 0) {
            table += "</tr><tr>";
        }
    }

    // close last row if incomplete
    if ((daysInMonth + startDay) % 7 !== 0) {
        table += "</tr>";
    }

    table += "</table>";
    calendar.innerHTML = table;
}


function updateCalendar() {
    const year = document.getElementById("yearSelect").value;
    const month = document.getElementById("monthSelect").value;
    generateCalendar(year, month);
}


/* Timesheet Submit */
function submitTimesheet() {
    const date = document.getElementById("tsDate").value;
    const hours = document.getElementById("tsHours").value;
    const task = document.getElementById("tsTask").value;

    if (!date || !hours || !task) {
        document.getElementById("tsMessage").innerText =
            "Please fill all fields";
        document.getElementById("tsMessage").style.color = "red";
        return;
    }

    document.getElementById("tsMessage").innerText =
        "Timesheet submitted successfully!";
    document.getElementById("tsMessage").style.color = "green";

    document.getElementById("tsDate").value = "";
    document.getElementById("tsHours").value = "";
    document.getElementById("tsTask").value = "";
}


/* Logout */
function logoutUser() {
    // Use this for Azure Static Web Apps + Entra ID
    window.location.href = "/.auth/logout?post_logout_redirect_uri=/login.html";

    // If NOT using Entra ID, use:
    // window.location.href = "login.html";
}

/* ----- Approval Requests Storage (Temporary) ----- */
let approvals = JSON.parse(localStorage.getItem("approvals") || "[]");

/* Submit Request */
async function submitRequest() {

    const managerEmail = document.getElementById("mgrEmail").value;
    const approvalType = document.getElementById("reqType").value;
    const reason = document.getElementById("reqMsg").value;
    const status = document.getElementById("reqStatus");

    if (!managerEmail || !approvalType || !reason) {
        status.innerText = "Please fill all fields";
        return;
    }

    let employeeEmail = "";

    try {
        const authResponse = await fetch("/.auth/me");
        const authData = await authResponse.json();

        // ✅ THIS is the logged-in email
        employeeEmail = authData.clientPrincipal.userDetails;

        console.log("EMPLOYEE EMAIL BEING SENT:", employeeEmail);
    } catch (err) {
        console.error("Auth error:", err);
        status.innerText = "Unable to read logged-in user";
        return;
    }

    fetch("https://prod-26.centralus.logic.azure.com:443/workflows/397fa07361cc425ea8046d8327ddb70a/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=JmJjYRlnoyeXwbNob7nPrcrIvzbQCT3ZLpWSyWsukkA", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            managerEmail: managerEmail,
            employeeEmail: employeeEmail,   // ✅ NO hardcoded value
            approvalType: approvalType,
            reason: reason
        })
    })
    .then(res => {
        if (res.ok) {
            status.innerText = "Approval request sent to manager";
            // Show the approval replies section after request is sent
            document.getElementById("approvalRepliesSection").style.display = "block";
            // Auto-fetch replies after a short delay
            setTimeout(() => fetchApprovalReplies(), 2000);
        } else {
            status.innerText = "Failed to send request";
        }
    })
    .catch(err => {
        console.error(err);
        status.innerText = "Network error";
    });
}

/* Fetch Approval Replies from Manager */
async function fetchApprovalReplies() {
    const managerEmail = document.getElementById("mgrEmail").value;
    const repliesList = document.getElementById("approvalRepliesList");
    const statusEl = document.getElementById("reqStatus");

    if (!managerEmail) {
        statusEl.innerText = "Please enter manager email first";
        return;
    }

    repliesList.innerHTML = '<p style="color: #666;">Fetching replies...</p>';

    try {
        // Call Azure Function to fetch emails from manager
        const response = await fetch("/api/getApprovalReplies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                managerEmail: managerEmail
            })
        });

        if (!response.ok) {
            repliesList.innerHTML = '<p style="color: #666;">No replies yet. Check back later.</p>';
            return;
        }

        const data = await response.json();

        if (data.replies && data.replies.length > 0) {
            let repliesHTML = '';
            data.replies.forEach(reply => {
                const status = reply.status || 'PENDING';
                const statusColor = status === 'APPROVED' ? '#4CAF50' : status === 'REJECTED' ? '#F44336' : '#FF9800';
                
                repliesHTML += `
                    <div style="border-left: 4px solid ${statusColor}; padding: 10px; margin: 10px 0; background: #f9f9f9;">
                        <strong>Status: <span style="color: ${statusColor};">${status}</span></strong><br>
                        <small style="color: #666;">From: ${managerEmail}</small><br>
                        <small style="color: #666;">Date: ${new Date(reply.receivedDateTime).toLocaleString()}</small><br>
                        <p>${reply.bodyPreview || reply.body || ''}</p>
                    </div>
                `;
            });
            repliesList.innerHTML = repliesHTML;
        } else {
            repliesList.innerHTML = '<p style="color: #666;">No replies yet. Check back later.</p>';
        }
    } catch (err) {
        console.error("Error fetching replies:", err);
        repliesList.innerHTML = '<p style="color: red;">Error fetching replies. Make sure your Azure Function is configured.</p>';
    }
}

const techData = {
    soa: {
        title: "Oracle SOA Suite",
        desc: "A middleware platform for building, deploying, and managing service-oriented architecture (SOA) integrations.",
        news: "https://www.oracle.com/news/"
    },
    oracleDb: {
        title: "Oracle Database Systems",
        desc: "Enterprise-grade relational database providing high performance, security, and scalability.",
        news: "https://www.oracle.com/database/"
    },
    oci: {
        title: "Oracle Cloud Infrastructure (OCI)",
        desc: "Oracle’s cloud platform providing compute, storage, networking, and enterprise services.",
        news: "https://www.oracle.com/cloud/"
    },
    github: {
        title: "GitHub",
        desc: "A platform for source code management and collaboration using Git.",
        news: "https://github.blog/"
    },
    jenkins: {
        title: "Jenkins",
        desc: "Open-source automation server for CI/CD pipelines.",
        news: "https://www.jenkins.io/blog/"
    },
    docker: {
        title: "Docker",
        desc: "Platform for developing and running applications in containers.",
        news: "https://www.docker.com/blog/"
    },
    kubernetes: {
        title: "Kubernetes",
        desc: "Container orchestration platform for automated deployment and scaling.",
        news: "https://kubernetes.io/blog/"
    },
    terraform: {
        title: "Terraform",
        desc: "Infrastructure as Code tool for provisioning cloud resources.",
        news: "https://www.hashicorp.com/blog"
    },
    ansible: {
        title: "Ansible",
        desc: "Automation tool for configuration management and deployment.",
        news: "https://www.ansible.com/blog"
    },
    prometheus: {
        title: "Prometheus",
        desc: "Monitoring and alerting toolkit for cloud-native systems.",
        news: "https://prometheus.io/blog/"
    },
    grafana: {
        title: "Grafana",
        desc: "Visualization and analytics platform for monitoring data.",
        news: "https://grafana.com/blog/"
    }
};

function showTech(key) {
    document.getElementById("techTitle").innerText = techData[key].title;
    document.getElementById("techDesc").innerText = techData[key].desc;
    document.getElementById("techNews").href = techData[key].news;

    document.getElementById("overlay").classList.remove("hidden");
    document.getElementById("techDetails").classList.remove("hidden");
}

function closeTech() {
    document.getElementById("overlay").classList.add("hidden");
    document.getElementById("techDetails").classList.add("hidden");
}
/* Open external tools */
function openTool(tool) {
    let url = "";
    switch(tool) {
        case "googleSheets":
            url = "https://docs.google.com/spreadsheets/";
            break;
        case "googleDrive":
            url = "https://drive.google.com/";
            break;
        case "oneDrive":
            url = "https://onedrive.live.com/";
            break;
    }
    window.open(url, "_blank"); // opens in a new tab
}

function openAzureReport(type) {

    const azureLinks = {
        cost: "https://portal.azure.com/#view/Microsoft_Azure_CostManagement/Menu/costanalysis",
        usage: "https://portal.azure.com/#view/Microsoft_Azure_CostManagement/Menu/usage",
        billing: "https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBlade",
        advisor: "https://portal.azure.com/#view/Microsoft_Azure_Advisor/AdvisorMenuBlade",
        monitor: "https://portal.azure.com/#view/Microsoft_Azure_Monitoring/AzureMonitoringBrowseBlade",
        loganalytics: "https://portal.azure.com/#view/Microsoft_Azure_Monitoring/AzureMonitoringBrowseBlade/logAnalytics"
    };

    window.open(azureLinks[type], "_blank");
}

function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const messages = document.getElementById('chat-messages');
    if (input.value.trim() !== '') {
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'message user';
        userMessage.textContent = input.value;
        messages.appendChild(userMessage);

        // Simulate bot response (replace with actual bot logic)
        setTimeout(() => {
            const botMessage = document.createElement('div');
            botMessage.className = 'message bot';
            botMessage.textContent = 'Thanks for your message! This is a demo response.';
            messages.appendChild(botMessage);
            messages.scrollTop = messages.scrollHeight;
        }, 1000);

        input.value = '';
        messages.scrollTop = messages.scrollHeight;
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}
