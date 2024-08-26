document.addEventListener('DOMContentLoaded', loadTasks);

document.getElementById('new-task').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

function addTask() {
    const taskInput = document.getElementById('new-task');
    const taskText = taskInput.value.trim();

    if (taskText !== '') {
        const taskList = document.getElementById('task-list');
        const listItem = createTaskElement(taskText);

        taskList.appendChild(listItem);
        saveTask(taskText, false);  // Save task with 'completed' status as false
        taskInput.value = '';
    }
}

function createTaskElement(taskText, completed = false) {
    const listItem = document.createElement('li');
    const taskContent = document.createElement('span');
    taskContent.className = 'task-content';
    taskContent.textContent = taskText;

    listItem.setAttribute('draggable', true);
    listItem.addEventListener('dragstart', handleDragStart);
    listItem.addEventListener('dragover', handleDragOver);
    listItem.addEventListener('drop', handleDrop);

    const completeButton = document.createElement('button');
    completeButton.innerHTML = '✔';
    completeButton.addEventListener('click', function() {
        if (listItem.classList.contains('completed')) {
            listItem.classList.remove('completed');
            saveTask(taskText, false);
        } else {
            listItem.classList.add('completed');
            saveTask(taskText, true);
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
    listItem.appendChild(completeButton);
    listItem.appendChild(deleteButton);

    return listItem;
}

function saveTask(taskText, completed) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = tasks.filter(task => task.text !== taskText);
    updatedTasks.push({ text: taskText, completed: completed });
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
}

function updateTaskStatus(taskText, completed) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = tasks.map(task => {
        if (task.text === taskText) {
            return { text: task.text, completed: completed };
        }
        return task;
    });
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
        const listItem = createTaskElement(task.text, task.completed);
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
        tasks.push({ text: taskText, completed: completed });
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
