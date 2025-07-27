// Task list management for real-time progress
let currentTaskList = null;

// Function to create task list UI
function createTaskList(tasks) {
  const taskListContainer = document.createElement('div');
  taskListContainer.className = 'task-list-container';
  taskListContainer.innerHTML = `
    <div class="task-list-header">🤖 Analysis Progress</div>
    <div class="task-list" id="current-task-list">
      ${tasks.map((task, index) => `
        <div class="task-item" data-task-id="${index}">
          <span class="task-status">⏳</span>
          <span class="task-text">${task}</span>
        </div>
      `).join('')}
    </div>
  `;
  return taskListContainer;
}

// Function to update task status with progress support
function updateTaskStatus(taskIndex, status, text = null, progressPercent = null) {
  if (!currentTaskList) return;

  const taskItem = currentTaskList.querySelector(`[data-task-id="${taskIndex}"]`);
  if (!taskItem) return;

  const statusElement = taskItem.querySelector('.task-status');
  const textElement = taskItem.querySelector('.task-text');
  let progressBar = taskItem.querySelector('.task-progress-bar');

  switch (status) {
    case 'in-progress':
      statusElement.textContent = '🔄';
      taskItem.classList.add('task-in-progress');
      taskItem.classList.remove('task-completed');

      // Create progress bar if it doesn't exist and we have progress
      if (progressPercent !== null && !progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'task-progress-bar';
        progressBar.innerHTML = '<div class="task-progress-fill"></div>';
        taskItem.appendChild(progressBar);
      }
      break;
    case 'completed':
      statusElement.textContent = '✅';
      taskItem.classList.add('task-completed');
      taskItem.classList.remove('task-in-progress');

      // Hide progress bar when completed
      if (progressBar) {
        progressBar.style.display = 'none';
      }
      break;
    case 'error':
      statusElement.textContent = '❌';
      taskItem.classList.add('task-error');
      break;
    default:
      // No action needed for unknown status
      break;
  }

  // Update progress bar if we have a percentage
  if (progressPercent !== null && progressBar) {
    const progressFill = progressBar.querySelector('.task-progress-fill');
    if (progressFill) {
      progressFill.style.width = `${Math.min(100, Math.max(0, progressPercent))}%`;
    }
  }

  if (text) {
    textElement.textContent = text;
  }

  // Scroll to current task
  taskItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Function to load CSS styles
function addTaskListStyles() {
  if (document.querySelector('#task-list-styles')) return;

  // Create link element to load external CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/blocks/rum-chat/task-progress.css';
  link.id = 'task-list-styles';
  document.head.appendChild(link);
}

// Function to initialize task progress tracking
function initializeTaskProgress(tasks, messagesDiv) {
  addTaskListStyles();

  const taskListElement = createTaskList(tasks);
  messagesDiv.appendChild(taskListElement);
  currentTaskList = taskListElement.querySelector('.task-list');
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  return updateTaskStatus;
}

// Function to complete all remaining tasks
function completeAllRemainingTasks() {
  if (!currentTaskList) return;

  const allTasks = currentTaskList.querySelectorAll('.task-item');
  if (allTasks) {
    allTasks.forEach((task, index) => {
      const status = task.querySelector('.task-status');
      if (status && status.textContent !== '✅') {
        updateTaskStatus(index, 'completed');
      }
    });
  }
}

// Function to reset task list
function resetTaskList() {
  currentTaskList = null;
}

// Export functions
export {
  createTaskList,
  updateTaskStatus,
  addTaskListStyles,
  initializeTaskProgress,
  completeAllRemainingTasks,
  resetTaskList,
};

export default initializeTaskProgress;
