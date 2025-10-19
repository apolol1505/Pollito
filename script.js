document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const timerDisplay = document.getElementById('timerDisplay');
    const currentWeekSpan = document.getElementById('currentWeek');
    const chickenImageEl = document.getElementById('chickenImage');
    const chickenBody = chickenImageEl.querySelector('.chicken-body');
    const chickenName = document.getElementById('chickenName');
    const chickenStage = document.querySelector('.chicken-stage');

    const feedBtn = document.getElementById('feedBtn');
    const waterBtn = document.getElementById('waterBtn');
    const medicineBtn = document.getElementById('medicineBtn');

    const feedCounterSpan = document.getElementById('feedCounter');
    const waterCounterSpan = document.getElementById('waterCounter');
    const medicineCounterSpan = document.getElementById('medicineCounter');

    const currentDaySpan = document.getElementById('currentDay');
    const dayProgressBar = document.getElementById('dayProgress');
    const dayProgressText = document.getElementById('dayProgressText');

    const neglectWarningMessage = document.getElementById('neglectWarningMessage');

    const weekCompleteModal = document.getElementById('weekCompleteModal');
    const warningModal = document.getElementById('warningModal');
    const successModal = document.getElementById('successModal');
    const deathModal = document.getElementById('deathModal');

    const continueBtn = document.getElementById('continueBtn');
    const continueWarningBtn = document.getElementById('continueWarningBtn');
    const restartBtn = document.getElementById('restartBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const backToMenuBtn = document.getElementById('backToMenuBtn');

    // Confirmation modal for exiting to menu
    const confirmExitModal = document.getElementById('confirmExitModal');
    const confirmExitBtn = document.getElementById('confirmExitBtn');
    const cancelExitBtn = document.getElementById('cancelExitBtn');

    // --- Game State ---
    let currentWeek = 1;
    const maxWeeks = 4;
    const weekDuration = 35;
    let timeRemaining = weekDuration;
    let timerInterval = null;

    let dayInWeek = 1;
    const maxDaysInWeek = 7;
    const dayDurationInSeconds = weekDuration / maxDaysInWeek;
    let timeElapsedInDay = 0;

    let tasks = {
        feed: { count: 0, required: 4 },
        water: { count: 0, required: 4 },
        medicine: { count: 0, required: 1 }
    };
    
    const chickenImages = { 1: "🐣", 2: "🐥", 3: "🐓", 4: "🐔" };
    const chickenNames = { 1: "Pollito Bebé", 2: "Pollito Creciendo", 3: "Gallo Joven", 4: "Gallo Adulto" };
    let neglectConsecutiveWeeks = 0;

    let holdTimer = null;
    const holdDuration = 2000; // 2 seconds

    // --- Functions ---

    function generateRandomTasks() {
        tasks.feed.required = Math.floor(Math.random() * 3) + 3; // 3-5
        tasks.water.required = Math.floor(Math.random() * 2) + 3; // 3-4
        tasks.medicine.required = Math.floor(Math.random() * 2) + 1; // 1-2
    }

    function updateDisplay() {
        timerDisplay.textContent = timeRemaining;
        currentWeekSpan.textContent = currentWeek;
        const weekProgressVal = (timeRemaining / weekDuration) * 314;
        document.getElementById('timerProgress').style.strokeDashoffset = 314 - weekProgressVal;

        const timeElapsed = weekDuration - timeRemaining;
        const weekProgressPercentage = (timeElapsed / weekDuration) * 100;
        document.getElementById('weekProgress').style.width = `${weekProgressPercentage}%`;

        currentDaySpan.textContent = dayInWeek;
        const dayProgressPercent = (timeElapsedInDay / dayDurationInSeconds) * 100;
        dayProgressBar.style.width = `${dayProgressPercent}%`;
        dayProgressText.textContent = `Progreso del día actual`;

        feedCounterSpan.textContent = `${tasks.feed.count}/${tasks.feed.required}`;
        waterCounterSpan.textContent = `${tasks.water.count}/${tasks.water.required}`;
        medicineCounterSpan.textContent = `${tasks.medicine.count}/${tasks.medicine.required}`;

        chickenBody.textContent = chickenImages[currentWeek];
        chickenName.textContent = chickenNames[currentWeek];
    }

    function startTimer() {
        // Show or hide the persistent warning message
        if (neglectConsecutiveWeeks === 1) {
            neglectWarningMessage.textContent = '¡CUIDADO! No completaste las tareas la semana pasada. Si fallas de nuevo, tu pollito morirá.';
            neglectWarningMessage.style.display = 'block';
        } else {
            neglectWarningMessage.style.display = 'none';
        }

        // Clear any previous 10-second warning
        if (neglectWarningMessage.textContent.startsWith('¡ADVERTENCIA!')) {
            neglectWarningMessage.style.display = 'none';
            neglectWarningMessage.textContent = '';
        }

        timeRemaining = weekDuration;
        timeElapsedInDay = 0;
        dayInWeek = 1;
        generateRandomTasks();
        updateDisplay();

        if (timerInterval) {
            clearInterval(timerInterval);
        }

        timerInterval = setInterval(() => {
            timeRemaining--;
            timeElapsedInDay++;
            
            if (timeElapsedInDay >= dayDurationInSeconds) {
                timeElapsedInDay = 0;
                if (dayInWeek < maxDaysInWeek) {
                    dayInWeek++;
                }
            }

            updateDisplay();

            const allTasksDone = tasks.feed.count >= tasks.feed.required &&
                                 tasks.water.count >= tasks.water.required &&
                                 tasks.medicine.count >= tasks.medicine.required;

            // Logic for 10-second warning
            if (timeRemaining <= 10 && timeRemaining > 0) {
                if (!allTasksDone) {
                    neglectWarningMessage.textContent = '¡ADVERTENCIA! Faltan ' + timeRemaining + ' segundos y no has completado todas las tareas.';
                    neglectWarningMessage.style.display = 'block';
                } else if (neglectWarningMessage.textContent.startsWith('¡ADVERTENCIA!')) {
                    // If tasks are completed within the last 10 seconds, hide the warning
                    neglectWarningMessage.style.display = 'none';
                    neglectWarningMessage.textContent = '';
                }
            } else if (neglectWarningMessage.textContent.startsWith('¡ADVERTENCIA!')) {
                // Hide the warning if time goes below 0 or if it's not in the last 10 seconds
                neglectWarningMessage.style.display = 'none';
                neglectWarningMessage.textContent = '';
            }

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                endOfWeek();
            }
        }, 1000);
    }

    function endOfWeek() {
        const allTasksDone = tasks.feed.count >= tasks.feed.required &&
                             tasks.water.count >= tasks.water.required &&
                             tasks.medicine.count >= tasks.medicine.required;

        if (allTasksDone) {
            neglectConsecutiveWeeks = 0; // Reset on success
            document.getElementById('completedWeek').textContent = currentWeek;
            showModal(weekCompleteModal);
        } else {
            neglectConsecutiveWeeks++;
            if (neglectConsecutiveWeeks >= 2) {
                 showModal(deathModal);
            } else {
                document.getElementById('pendingTasksList').textContent = "No completaste todas las tareas. ¡Tu pollito podría enfermar! Si lo descuidas por 2 semanas seguidas, el juego terminará.";
                showModal(warningModal);
            }
        }
    }
    
    function startNextWeek() {
        currentWeek++;
        if (currentWeek > maxWeeks) {
            showModal(successModal);
            return;
        }

        tasks.feed.count = 0;
        tasks.water.count = 0;
        tasks.medicine.count = 0;
        
        feedBtn.disabled = false;
        waterBtn.disabled = false;
        medicineBtn.disabled = false;

        closeAllModals();
        startTimer();
    }
    
    function restartGame() {
        currentWeek = 1;
        neglectConsecutiveWeeks = 0;
        tasks.feed.count = 0;
        tasks.water.count = 0;
        tasks.medicine.count = 0;
        
        feedBtn.disabled = false;
        waterBtn.disabled = false;
        medicineBtn.disabled = false;
        
        closeAllModals();
        startTimer();
    }

    function handleAction(type) {
        if (tasks[type].count < tasks[type].required) {
            tasks[type].count++;
            updateDisplay();

            chickenImageEl.classList.add('happy-animation');
            setTimeout(() => {
                chickenImageEl.classList.remove('happy-animation');
            }, 500);
        }
        if (tasks[type].count >= tasks[type].required) {
            document.getElementById(`${type}Btn`).disabled = true;
        }
    }

    function startHoldTimer(actionType) {
        if (holdTimer) return;

        const progressBar = document.createElement('div');
        progressBar.className = 'hold-progress-bar';
        const progressFill = document.createElement('div');
        progressFill.className = 'hold-progress-fill';
        progressBar.appendChild(progressFill);
        chickenStage.appendChild(progressBar);

        progressFill.style.animation = `holdProgress ${holdDuration}ms linear forwards`;

        holdTimer = setTimeout(() => {
            handleAction(actionType);
            cancelHoldTimer();
        }, holdDuration);
    }

    function cancelHoldTimer() {
        clearTimeout(holdTimer);
        holdTimer = null;
        const progressBar = chickenStage.querySelector('.hold-progress-bar');
        if (progressBar) {
            progressBar.remove();
        }
    }

    function setupDragAndDrop() {
        const draggables = document.querySelectorAll('.action-icon.draggable');
        let currentDragType = null;

        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', (e) => {
                currentDragType = draggable.dataset.type;
                e.dataTransfer.setData('text/plain', currentDragType);
                setTimeout(() => {
                    draggable.closest('.action-card').classList.add('dragging');
                }, 0);
            });

            draggable.addEventListener('dragend', () => {
                draggable.closest('.action-card').classList.remove('dragging');
                if (holdTimer) {
                    cancelHoldTimer();
                    chickenStage.classList.remove('drag-over');
                }
            });
        });

        chickenStage.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        chickenStage.addEventListener('dragenter', (e) => {
            e.preventDefault();
            chickenStage.classList.add('drag-over');
            if (currentDragType === 'feed' || currentDragType === 'water') {
                startHoldTimer(currentDragType);
            }
        });

        chickenStage.addEventListener('dragleave', (e) => {
            if (!chickenStage.contains(e.relatedTarget)) {
                chickenStage.classList.remove('drag-over');
                cancelHoldTimer();
            }
        });

        chickenStage.addEventListener('drop', (e) => {
            e.preventDefault();
            chickenStage.classList.remove('drag-over');
            cancelHoldTimer();
        });
    }

    function showModal(modal) {
        modal.classList.add('show');
    }

    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('show'));
    }

    // --- Event Listeners ---
    medicineBtn.addEventListener('click', () => handleAction('medicine'));

    continueBtn.addEventListener('click', startNextWeek);
    continueWarningBtn.addEventListener('click', startNextWeek);
    restartBtn.addEventListener('click', restartGame);
    playAgainBtn.addEventListener('click', restartGame);

    backToMenuBtn.addEventListener('click', () => {
        showModal(confirmExitModal);
    });

    confirmExitBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    cancelExitBtn.addEventListener('click', () => {
        closeAllModals();
    });

    // --- Initial Start ---
    setupDragAndDrop();
    startTimer();
});

function showModal(modal) {
    modal.classList.add('show');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('show'));
}