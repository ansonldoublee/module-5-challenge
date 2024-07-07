// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Save tasks and nextId to localStorage
function saveToLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));
}

// Create a task card
function createTaskCard(task) {
    const taskCard = $('<div>')
      .addClass('card project-card draggable my-3')
      .attr('data-task-id', task.id);
    const cardHeader = $('<div>').addClass('card-header h4').text(task.title);
    const cardBody = $('<div>').addClass('card-body');
    const cardDescription = $('<p>').addClass('card-text').text(task.description);
    const cardDueDate = $('<p>').addClass('card-text').text(`Due: ${task.dueDate}`);
    const cardDeleteBtn = $('<button>')
      .addClass('btn btn-danger delete')
      .text('Delete')
      .attr('data-task-id', task.id);
    cardDeleteBtn.on('click', handleDeleteTask);
  
    // Sets the card background color based on due date
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate);
    
    // Calculate difference in days
    const daysDifference = taskDueDate.diff(now, 'day');
  
    if (daysDifference >= 0 && daysDifference <= 3) {
      taskCard.addClass('bg-warning text-white'); // Yellow within 3 days
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white'); // Red if overdue
      cardDeleteBtn.addClass('border-light');
    }
  
    // Append elements to the card
    cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
    taskCard.append(cardHeader, cardBody);
  
    return taskCard;
  }

// Render the task list and make cards draggable
function renderTaskList() {
  // Empty existing task cards from the lanes
  $('#todo-cards').empty();
  $('#in-progress-cards').empty();
  $('#done-cards').empty();

  // Loop through tasks and create task cards for each status
  taskList.forEach(task => {
    if (task.status === 'to-do') {
      $('#todo-cards').append(createTaskCard(task));
    } else if (task.status === 'in-progress') {
      $('#in-progress-cards').append(createTaskCard(task));
    } else if (task.status === 'done') {
      $('#done-cards').append(createTaskCard(task));
    }
  });

  // Make task cards draggable
  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
    helper: function (e) {
      const original = $(e.target).hasClass('ui-draggable')
        ? $(e.target)
        : $(e.target).closest('.ui-draggable');
      return original.clone().css({ width: original.outerWidth() });
    },
  });
}

// Handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const title = $('#task-title').val().trim();
  const description = $('#task-description').val().trim();
  const dueDate = $('#task-due-date').val();

  if (title && description && dueDate) {
    const newTask = {
      id: generateTaskId(),
      title,
      description,
      dueDate,
      status: 'to-do',
    };

    taskList.push(newTask);
    saveToLocalStorage();
    renderTaskList();

    // Clear form inputs
    $('#task-title').val('');
    $('#task-description').val('');
    $('#task-due-date').val('');
    $('#formModal').modal('hide');
  }
}

// Handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(this).attr('data-task-id');
  taskList = taskList.filter(task => task.id != taskId);
  saveToLocalStorage();
  renderTaskList();
}

// Handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.data('task-id');
  const newStatus = $(this).attr('id').replace('-cards', '');

  const task = taskList.find(task => task.id == taskId);
  task.status = newStatus;

  saveToLocalStorage();
  renderTaskList();
}

// Initialize the page
$(document).ready(function () {
  // Render task list on page load
  renderTaskList();

  // Add event listener to the form element
  $('#task-form').on('submit', handleAddTask);

  // Make lanes droppable
  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });

  // Initialize the date picker
  $('#task-due-date').datepicker({
    changeMonth: true,
    changeYear: true,
  });
});
