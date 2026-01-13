async function getLoggedInUserEmail() {
    const response = await fetch("/.auth/me");
    const data = await response.json();
    return data.clientPrincipal.userDetails;
}
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
async function submitRequest() {

    const managerEmail = document.getElementById("mgrEmail").value;
    const approvalType = document.getElementById("reqType").value;
    const reason = document.getElementById("reqMsg").value;
    const status = document.getElementById("reqStatus");

    if (!managerEmail || !approvalType || !reason) {
        status.innerText = "❌ Please fill all fields";
        return;
    }

    let employeeEmail;

    try {
        employeeEmail = await getLoggedInUserEmail();
    } catch (e) {
        status.innerText = "❌ Unable to get logged-in user";
        return;
    }

    fetch("PASTE_LOGIC_APP_HTTP_URL_HERE", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            managerEmail: managerEmail,
            employeeEmail: "test@qual3.com",
            approvalType: approvalType,
            reason: reason
        })
    })
    .then(response => {
        if (response.ok) {
            status.innerText = "✅ Approval request sent to manager";
        } else {
            status.innerText = "❌ Failed to send request";
        }
    })
    .catch(() => {
        status.innerText = "❌ Error sending request";
    });
}


