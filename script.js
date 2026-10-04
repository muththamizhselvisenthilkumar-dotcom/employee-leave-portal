```javascript
// ===============================
// EMPLOYEE LEAVE PORTAL
// ===============================

// Default leave balances
let balances = {
    "Casual Leave": 12,
    "Sick Leave": 10,
    "Earned Leave": 15
};


// Load previously saved leave requests
let leaves = JSON.parse(
    localStorage.getItem("employeeLeaves")
) || [];


// ===============================
// LOGIN
// ===============================

document.getElementById("loginForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const employeeId =
            document.getElementById("employeeId").value;

        const password =
            document.getElementById("password").value;


        if (
            employeeId === "EMP001" &&
            password === "1234"
        ) {

            document
                .getElementById("loginPage")
                .classList.add("hidden");

            document
                .getElementById("app")
                .classList.remove("hidden");

            initializeDashboard();

        } else {

            alert(
                "Invalid Login!\n\nUse:\nEmployee ID: EMP001\nPassword: 1234"
            );

        }

    }
);


// ===============================
// NAVIGATION
// ===============================

function showSection(sectionId, button = null) {

    document
        .querySelectorAll(".section")
        .forEach(section => {
            section.classList.remove("active-section");
        });


    document
        .getElementById(sectionId)
        .classList.add("active-section");


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {
            item.classList.remove("active");
        });


    if (button) {
        button.classList.add("active");
    } else {

        document
            .querySelectorAll(".nav-item")
            .forEach(item => {

                if (
                    item.innerText
                        .toLowerCase()
                        .includes(sectionId)
                ) {
                    item.classList.add("active");
                }

            });

    }


    const titles = {

        dashboard: "Dashboard",
        apply: "Apply for Leave",
        history: "Leave History",
        profile: "My Profile"

    };

    document.getElementById("pageTitle").innerText =
        titles[sectionId];


    if (sectionId === "history") {
        renderHistory();
    }

}


// ===============================
// OPEN APPLY PAGE
// ===============================

function openApply() {

    showSection("apply");

}


// ===============================
// DATE
// ===============================

function updateDate() {

    const today = new Date();

    document.getElementById("dateDisplay").innerText =
        today.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

}


// ===============================
// LEAVE TYPE BALANCE
// ===============================

document
    .getElementById("leaveType")
    .addEventListener(
        "change",
        function() {

            const type = this.value;

            const balanceElement =
                document.getElementById(
                    "availableBalance"
                );


            if (type) {

                balanceElement.innerText =
                    balances[type] + " days available";

            } else {

                balanceElement.innerText =
                    "Select leave type";

            }

        }
    );


// ===============================
// AUTOMATIC DAY CALCULATION
// ===============================

document
    .getElementById("fromDate")
    .addEventListener("change", calculateDays);

document
    .getElementById("toDate")
    .addEventListener("change", calculateDays);


function calculateDays() {

    const from =
        document.getElementById("fromDate").value;

    const to =
        document.getElementById("toDate").value;


    if (!from || !to) {
        return;
    }


    const start =
        new Date(from);

    const end =
        new Date(to);


    if (end < start) {

        alert(
            "To Date cannot be before From Date."
        );

        document.getElementById("toDate").value = "";

        return;
    }


    const difference =
        end - start;


    const days =
        Math.floor(
            difference / (1000 * 60 * 60 * 24)
        ) + 1;


    document.getElementById("leaveDays").value =
        days;

}


// ===============================
// APPLY LEAVE
// ===============================

document
    .getElementById("leaveForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const type =
                document.getElementById(
                    "leaveType"
                ).value;


            const days =
                Number(
                    document.getElementById(
                        "leaveDays"
                    ).value
                );


            const from =
                document.getElementById(
                    "fromDate"
                ).value;


            const to =
                document.getElementById(
                    "toDate"
                ).value;


            const reason =
                document.getElementById(
                    "reason"
                ).value.trim();


            // Validation

            if (!type || !days || !from || !to || !reason) {

                showToast(
                    "Please fill all fields."
                );

                return;
            }


            if (days > balances[type]) {

                showToast(
                    "Insufficient leave balance."
                );

                return;
            }


            // Create leave request

            const newLeave = {

                id: Date.now(),

                type: type,

                from: from,

                to: to,

                days: days,

                reason: reason,

                status: "Pending",

                appliedDate:
                    new Date().toLocaleDateString(
                        "en-IN"
                    )

            };


            leaves.unshift(newLeave);


            // Save to browser

            localStorage.setItem(
                "employeeLeaves",
                JSON.stringify(leaves)
            );


            // Reset form

            document
                .getElementById("leaveForm")
                .reset();


            document.getElementById(
                "availableBalance"
            ).innerText =
                "Select leave type";


            showToast(
                "Leave request submitted successfully!"
            );


            updateDashboard();


            setTimeout(
                () => showSection("history"),
                1200
            );

        }
    );


// ===============================
// HISTORY
// ===============================

function renderHistory() {

    const table =
        document.getElementById(
            "historyTable"
        );


    const filter =
        document.getElementById(
            "filterStatus"
        ).value;


    table.innerHTML = "";


    let filteredLeaves = leaves;


    if (filter !== "All") {

        filteredLeaves =
            leaves.filter(
                leave =>
                    leave.status === filter
            );

    }


    if (filteredLeaves.length === 0) {

        table.innerHTML = `

            <tr>

                <td colspan="6"
                    style="text-align:center;padding:30px">

                    No leave requests found.

                </td>

            </tr>

        `;

        return;
    }


    filteredLeaves.forEach(leave => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <b>${leave.type}</b>
            </td>

            <td>
                ${formatDate(leave.from)}
            </td>

            <td>
                ${formatDate(leave.to)}
            </td>

            <td>
                ${leave.days}
            </td>

            <td>
                ${leave.reason}
            </td>

            <td>
                <span class="status ${leave.status}">
                    ${leave.status}
                </span>
            </td>

        `;


        table.appendChild(row);

    });

}


// ===============================
// RECENT LEAVES
// ===============================

function renderRecentLeaves() {

    const container =
        document.getElementById(
            "recentLeaves"
        );


    if (leaves.length === 0) {

        container.innerHTML = `

            <div style="padding:25px;text-align:center;color:#888">

                No leave requests yet.

            </div>

        `;

        return;
    }


    container.innerHTML = "";


    leaves
        .slice(0, 4)
        .forEach(leave => {

            const div =
                document.createElement("div");

            div.className = "leave-row";


            div.innerHTML = `

                <div>

                    <div class="leave-name">
                        ${leave.type}
                    </div>

                    <div class="leave-date">
                        ${formatDate(leave.from)}
                        -
                        ${formatDate(leave.to)}
                    </div>

                </div>

                <span class="status ${leave.status}">
                    ${leave.status}
                </span>

            `;


            container.appendChild(div);

        });

}


// ===============================
// DASHBOARD
// ===============================

function updateDashboard() {

    const pending =
        leaves.filter(
            leave =>
                leave.status === "Pending"
        ).length;


    document.getElementById(
        "pendingCount"
    ).innerText = pending;


    document.getElementById(
        "notificationCount"
    ).innerText = pending;


    document.getElementById(
        "casualBalance"
    ).innerText =
        balances["Casual Leave"];


    document.getElementById(
        "sickBalance"
    ).innerText =
        balances["Sick Leave"];


    document.getElementById(
        "earnedBalance"
    ).innerText =
        balances["Earned Leave"];


    document.getElementById(
        "casualPercent"
    ).innerText =
        balances["Casual Leave"] + " / 12";


    document.getElementById(
        "sickPercent"
    ).innerText =
        balances["Sick Leave"] + " / 10";


    document.getElementById(
        "earnedPercent"
    ).innerText =
        balances["Earned Leave"] + " / 15";


    const casual =
        12 - balances["Casual Leave"];

    const sick =
        10 - balances["Sick Leave"];

    const earned =
        15 - balances["Earned Leave"];


    document.getElementById(
        "casualProgress"
    ).style.width =
        (casual / 12 * 100) + "%";


    document.getElementById(
        "sickProgress"
    ).style.width =
        (sick / 10 * 100) + "%";


    document.getElementById(
        "earnedProgress"
    ).style.width =
        (earned / 15 * 100) + "%";


    renderRecentLeaves();

}


// ===============================
// INITIALIZE
// ===============================

function initializeDashboard() {

    updateDate();

    updateDashboard();

}


// ===============================
// FORMAT DATE
// ===============================

function formatDate(dateString) {

    const date =
        new Date(dateString);


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ===============================
// TOAST
// ===============================

function showToast(message) {

    const toast =
        document.getElementById("toast");


    toast.innerText = message;

    toast.style.display = "block";


    setTimeout(
        () => {
            toast.style.display = "none";
        },
        3000
    );

}


// ===============================
// LOGOUT
// ===============================

function logout() {

    document
        .getElementById("app")
        .classList.add("hidden");


    document
        .getElementById("loginPage")
        .classList.remove("hidden");


    document
        .getElementById("loginForm")
        .reset();

}
```
