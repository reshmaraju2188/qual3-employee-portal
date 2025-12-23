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

    const date = new Date(year, month);
    const today = new Date();

    const daysInMonth = new Date(year, parseInt(month) + 1, 0).getDate();
    const startDay = date.getDay();

    const months = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    monthYear.innerText = `${months[month]} ${year}`;

    let table = "<table><tr>";
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    days.forEach(d => table += `<th>${d}</th>`);
    table += "</tr><tr>";

    for (let i = 0; i < startDay; i++) {
        table += "<td></td>";
    }

    const yearHolidays = holidayData[year] || {};
    const monthKey = String(parseInt(month) + 1).padStart(2, "0");

    for (let day = 1; day <= daysInMonth; day++) {
        let dateKey = `${monthKey}-${String(day).padStart(2, "0")}`;
        let className = "";
        let titleText = "";

        if (yearHolidays[dateKey]) {
            className = "holiday";
            titleText = yearHolidays[dateKey];
        }

        if (
            day === today.getDate() &&
            year == today.getFullYear() &&
            month == today.getMonth()
        ) {
            className += " today";
        }

        table += `<td class="${className}" title="${titleText}">${day}</td>`;

        if ((day + startDay) % 7 === 0) {
            table += "</tr><tr>";
        }
    }

    table += "</tr></table>";
    calendar.innerHTML = table;
}

function updateCalendar() {
    const year = document.getElementById("yearSelect").value;
    const month = document.getElementById("monthSelect").value;
    generateCalendar(year, month);
}

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

    // Clear fields
    document.getElementById("tsDate").value = "";
    document.getElementById("tsHours").value = "";
    document.getElementById("tsTask").value = "";
}

