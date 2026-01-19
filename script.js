/* Live Time */
function updateTime() {
    const now = new Date();
    document.getElementById("time").innerHTML =
        now.toLocaleDateString() + " | " + now.toLocaleTimeString();
}
setInterval(updateTime, 1000);
updateTime();

/* Year-wise Indian Holidays */
const holidayData = {
    "2024": {
        "01-01": "New Year",
        "01-26": "Republic Day 🇮🇳",
        "03-25": "Holi",
        "04-09": "Ugadi",
        "08-15": "Independence Day 🇮🇳",
        "10-02": "Gandhi Jayanti 🇮🇳",
        "11-01": "Kannada Rajyotsava",
        "12-25": "Christmas"
    },
    "2025": {
        "01-01": "New Year",
        "01-14": "Makar Sankranti",
        "01-26": "Republic Day 🇮🇳",
        "03-14": "Holi",
        "03-31": "Ugadi",
        "04-18": "Good Friday",
        "05-01": "Labour Day",
        "08-15": "Independence Day 🇮🇳",
        "08-27": "Ganesh Chaturthi",
        "10-02": "Gandhi Jayanti 🇮🇳",
        "10-21": "Diwali",
        "11-01": "Kannada Rajyotsava",
        "12-25": "Christmas"
    },
    "2026": {
        "01-01": "New Year",
        "01-26": "Republic Day 🇮🇳",
        "03-04": "Holi",
        "03-20": "Ugadi",
        "08-15": "Independence Day 🇮🇳",
        "10-02": "Gandhi Jayanti 🇮🇳",
        "10-08": "Diwali",
        "12-25": "Christmas"
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
            "❌ Please fill all fields";
        document.getElementById("tsMessage").style.color = "red";
        return;
    }

    document.getElementById("tsMessage").innerText =
        "✅ Timesheet submitted successfully!";
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
        status.innerText = "❌ Please fill all fields";
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
        status.innerText = "❌ Unable to read logged-in user";
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
            status.innerText = "✅ Approval request sent to manager";
        } else {
            status.innerText = "❌ Failed to send request";
        }
    })
    .catch(err => {
        console.error(err);
        status.innerText = "❌ Network error";
    });
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
