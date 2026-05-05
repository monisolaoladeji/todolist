let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let calcExpression = "";

document.addEventListener("DOMContentLoaded", function() {
    renderTasks();
    renderCalendar();
    setupTabs();
});

function setupTabs() {
    const tabBtns = document.querySelectorAll(".tab-btn");
    tabBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            const tabId = this.getAttribute("data-tab");
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
    
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add("active");
    document.getElementById(tabId).classList.add("active");
}

function renderTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";
    tasks.forEach((task, index) => {
        list.appendChild(createTaskElement(task, [index], [index + 1]));
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function createTaskElement(task, indices, numbering, isChild = false) {
    const li = document.createElement("li");
    if (task.completed) {
        li.classList.add("completed");
    }

    const numberStr = numbering.join(".");
    const indicesStr = JSON.stringify(indices);
    
    let numberDisplay = isChild 
        ? '<span class="task-bullet child">.</span>' 
        : '<span class="task-bullet parent">○</span>';
    
    let addChildBtn = isChild 
        ? '' 
        : '<button class="add-child-btn" onclick="addChildTask(' + indicesStr + ')">+</button>';
    
    li.innerHTML = `
        <div style="display: flex; align-items: flex-start; flex: 1;">
            ${numberDisplay}
            <span class="task-text" onclick="toggleTask(${indicesStr})">${escapeHtml(task.text)}</span>
        </div>
        <div class="actions">
            <button class="toggle-btn" onclick="toggleTask(${indicesStr})">✔</button>
            ${addChildBtn}
            <button class="delete-btn" onclick="deleteTask(${indicesStr})">✖</button>
        </div>
    `;

    if (task.children && task.children.length > 0) {
        const childrenContainer = document.createElement("div");
        childrenContainer.className = "task-children";
        const childrenList = document.createElement("ul");
        task.children.forEach((child, childIndex) => {
            childrenList.appendChild(createTaskElement(child, [...indices, childIndex], [...numbering, childIndex + 1], true));
        });
        childrenContainer.appendChild(childrenList);
        li.appendChild(childrenContainer);
    }

    return li;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function addTask() {
    const input = document.getElementById("taskInput");
    const text = input.value.trim();
    if (text === "") return;
    tasks.push({ text: text, completed: false, children: [] });
    input.value = "";
    renderTasks();
}

function addChildTask(indices) {
    const text = prompt("Enter child task:");
    if (text && text.trim() !== "") {
        let target = tasks;
        for (let i = 0; i < indices.length - 1; i++) {
            target = target[indices[i]].children;
        }
        const parentIndex = indices[indices.length - 1];
        if (!target[parentIndex].children) {
            target[parentIndex].children = [];
        }
        target[parentIndex].children.push({ text: text.trim(), completed: false, children: [] });
        renderTasks();
    }
}

function toggleTask(indices) {
    let target = tasks;
    for (let i = 0; i < indices.length - 1; i++) {
        target = target[indices[i]].children;
    }
    const taskIndex = indices[indices.length - 1];
    target[taskIndex].completed = !target[taskIndex].completed;
    renderTasks();
}

function deleteTask(indices) {
    let target = tasks;
    for (let i = 0; i < indices.length - 1; i++) {
        target = target[indices[i]].children;
    }
    const taskIndex = indices[indices.length - 1];
    target.splice(taskIndex, 1);
    renderTasks();
}

function appendToCalc(value) {
    if (calcExpression === "0" && value !== ".") {
        calcExpression = "";
    }
    calcExpression += value;
    updateCalcDisplay();
}

function clearCalc() {
    calcExpression = "";
    updateCalcDisplay();
}

function calculate() {
    try {
        const result = Function('"use strict"; return (' + calcExpression + ')')();
        calcExpression = String(result);
    } catch (e) {
        calcExpression = "Error";
    }
    updateCalcDisplay();
}

function updateCalcDisplay() {
    const display = document.getElementById("calcDisplay");
    display.textContent = calcExpression === "" ? "0" : calcExpression;
}

function renderCalendar() {
    const monthYearEl = document.getElementById("monthYear");
    const daysEl = document.getElementById("calendarDays");
    
    const months = ["January", "February", "March", "April", "May", "June",
                   "July", "August", "September", "October", "November", "December"];
    
    monthYearEl.textContent = `${months[currentMonth]} ${currentYear}`;
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    let html = "";
    
    for (let i = firstDay - 1; i >= 0; i--) {
        html += `<div class="other-month">${daysInPrevMonth - i}</div>`;
    }
    
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        let classes = "day";
        if (day === today.getDate() && 
            currentMonth === today.getMonth() && 
            currentYear === today.getFullYear()) {
            classes += " today";
        }
        html += `<div class="${classes}">${day}</div>`;
    }
    
    const totalCells = firstDay + daysInMonth;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let day = 1; day <= remainingCells; day++) {
        html += `<div class="other-month">${day}</div>`;
    }
    
    daysEl.innerHTML = html;
}

function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

document.getElementById("taskInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        addTask();
    }
});
