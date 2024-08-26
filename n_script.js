document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    updateDateTime();
    setInterval(updateDateTime, 1000); // Update time every second
});

document.getElementById('new-task').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

function addTask() {
    const taskInput = document.getElementById('new-task');
    const taskText = taskInput.value.trim();
    const currentDateTime = getFormattedDateTime();

    if (taskText !== '') {
        const taskList = document.getElementById('task-list');
        const listItem = createTaskElement(taskText, currentDateTime);

        taskList.appendChild(listItem);
        saveTask(taskText, currentDateTime, false);  // Save task with 'completed' status as false
        taskInput.value = '';
    }
}

function createTaskElement(taskText, dateTime, completed = false) {
    const listItem = document.createElement('li');

    const taskContent = document.createElement('span');
    taskContent.className = 'task-content';
    taskContent.textContent = taskText;

    const taskDateTime = document.createElement('span');
    taskDateTime.className = 'task-datetime';
    taskDateTime.textContent = dateTime;

    listItem.setAttribute('draggable', true);
    listItem.addEventListener('dragstart', handleDragStart);
    listItem.addEventListener('dragover', handleDragOver);
    listItem.addEventListener('drop', handleDrop);

    const completeButton = document.createElement('button');
    completeButton.innerHTML = '✔';
    completeButton.addEventListener('click', function() {
        if (listItem.classList.contains('completed')) {
            listItem.classList.remove('completed');
            saveTask(taskText, dateTime, false);
        } else {
            listItem.classList.add('completed');
            saveTask(taskText, dateTime, true);
        }
        moveTaskToEnd(listItem);
    });

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '✖';
    deleteButton.addEventListener('click', function() {
        listItem.remove();
        deleteTask(taskText);
    });

    if (completed) {
        listItem.classList.add('completed');
    }

    listItem.appendChild(taskContent);
    listItem.appendChild(taskDateTime); // Add the dateTime after the task content
    listItem.appendChild(completeButton);
    listItem.appendChild(deleteButton);

    return listItem;
}

function saveTask(taskText, dateTime, completed) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = tasks.filter(task => task.text !== taskText);
    updatedTasks.push({ text: taskText, dateTime: dateTime, completed: completed });
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
}

function deleteTask(taskText) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = tasks.filter(task => task.text !== taskText);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskList = document.getElementById('task-list');

    tasks.forEach(task => {
        const listItem = createTaskElement(task.text, task.dateTime, task.completed);
        if (task.completed) {
            moveTaskToEnd(listItem);
        } else {
            taskList.appendChild(listItem);
        }
    });
}

function moveTaskToEnd(taskElement) {
    const taskList = document.getElementById('task-list');
    taskList.appendChild(taskElement);
    saveTaskOrder();
}

function saveTaskOrder() {
    const tasks = [];
    document.querySelectorAll('#task-list li').forEach(item => {
        const taskText = item.querySelector('.task-content').textContent;
        const completed = item.classList.contains('completed');
        const dateTime = item.querySelector('.task-datetime').textContent;
        tasks.push({ text: taskText, dateTime: dateTime, completed: completed });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

let draggedItem = null;

function handleDragStart(event) {
    draggedItem = event.target;
    setTimeout(() => {
        event.target.style.display = 'none';
    }, 0);
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    const taskList = document.getElementById('task-list');
    if (draggedItem) {
        taskList.insertBefore(draggedItem, event.target.nextSibling);
        draggedItem.style.display = 'flex';
        draggedItem = null;
        saveTaskOrder();
    }
}

function updateDateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateString = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const dateTimeDisplay = document.getElementById('date-time');
    if (!dateTimeDisplay) {
        const header = document.querySelector('.header');
        const newDateTimeDisplay = document.createElement('div');
        newDateTimeDisplay.id = 'date-time';
        newDateTimeDisplay.style.fontSize = '20px';
        newDateTimeDisplay.style.fontWeight = 'bold';
        newDateTimeDisplay.style.marginBottom = '10px';
        newDateTimeDisplay.textContent = `${dateString} ${timeString}`;
        header.insertBefore(newDateTimeDisplay, header.firstChild);
    } else {
        dateTimeDisplay.textContent = `${dateString} ${timeString}`;
    }
}

function getFormattedDateTime() {
    const now = new Date();
    return now.toLocaleString([], { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
