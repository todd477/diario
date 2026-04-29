const monthYearTitle = document.getElementById('month-year-title');
const calendar = document.getElementById('calendar');
const archiveList = document.getElementById('archive-list');
const archiveToggle = document.getElementById('archive-scroll-toggle');
const sidebar = document.querySelector('.sidebar');
const currentDateSpan = document.getElementById('current-date');
const addPhotoBtn = document.getElementById('add-photo-btn');
const photoInputWrapper = document.getElementById('photo-input-wrapper');
const photoInput = document.getElementById('photo-input');
const captionText = document.getElementById('caption-text');
const saveBtn = document.getElementById('save-btn');
const closeBtn = document.getElementById('close-btn');
const removePhotoBtn = document.getElementById('remove-photo-btn');
const editor = document.getElementById('editor');
const photoPreviewWrapper = document.getElementById('photo-preview-wrapper');
const photoPreview = document.getElementById('photo-preview');

if (saveBtn) saveBtn.disabled = true;

const mesi = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

const storageKey = 'diarioEntries';
let entries = JSON.parse(localStorage.getItem(storageKey) || '{}');
let selectedDate = null;
let editorOpen = false;

function initEditorState() {
    if (editor) editor.classList.add('hidden');
    if (photoInputWrapper) photoInputWrapper.classList.add('hidden');
    if (photoPreviewWrapper) photoPreviewWrapper.classList.add('hidden');
    if (photoInput) photoInput.value = '';
    if (addPhotoBtn) addPhotoBtn.textContent = 'Aggiungi foto';
    if (removePhotoBtn) removePhotoBtn.classList.add('hidden');
    if (saveBtn) saveBtn.disabled = true;
    selectedDate = null;
    editorOpen = false;
}

function formatMonthYear(date) {
    return `${mesi[date.getMonth()]} ${date.getFullYear()}`;
}

function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getEntryForDate(date) {
    return entries[formatDateKey(date)];
}

function renderCalendar(date) {
    if (!calendar) return;
    calendar.innerHTML = '';

    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDate = new Date(year, month, i);
        const entry = getEntryForDate(dayDate);
        const day = document.createElement('div');
        day.classList.add('day-card');
        if (entry?.photo) day.classList.add('has-entry');
        day.innerHTML = `<strong>${i}</strong>`;
        day.onclick = () => openEditor(dayDate);
        calendar.appendChild(day);
    }
}

function updateHeader(date) {
    if (!monthYearTitle) return;
    monthYearTitle.textContent = formatMonthYear(date);
    highlightArchiveItem(date);
}

function highlightArchiveItem(date) {
    if (!archiveList) return;
    const buttons = archiveList.querySelectorAll('button');
    buttons.forEach(button => {
        const year = Number(button.dataset.year);
        const month = Number(button.dataset.month);
        button.classList.toggle('active', year === date.getFullYear() && month === date.getMonth());
    });
}

function selectMonth(date) {
    selectedDate = new Date(date.getFullYear(), date.getMonth(), 1);
    updateHeader(selectedDate);
    renderCalendar(selectedDate);
}

function createArchiveItem(date) {
    const listItem = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = formatMonthYear(date);
    button.dataset.year = String(date.getFullYear());
    button.dataset.month = String(date.getMonth());
    button.onclick = () => selectMonth(date);
    listItem.appendChild(button);
    return listItem;
}

function buildArchiveMenu(monthsBack = 24) {
    if (!archiveList) return;
    archiveList.innerHTML = '';
    const now = new Date();

    for (let i = 0; i < monthsBack; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        archiveList.appendChild(createArchiveItem(date));
    }
}

function openEditor(date) {
    selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (currentDateSpan) {
        currentDateSpan.textContent = `${selectedDate.getDate()} ${mesi[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
    }

    const entry = getEntryForDate(selectedDate);
    captionText.value = entry?.caption || '';
    if (entry?.photo) {
        photoPreview.src = entry.photo;
        photoPreviewWrapper.classList.remove('hidden');
        if (removePhotoBtn) removePhotoBtn.classList.remove('hidden');
    } else {
        photoPreview.src = '';
        photoPreviewWrapper.classList.add('hidden');
        if (removePhotoBtn) removePhotoBtn.classList.add('hidden');
    }

    if (photoInputWrapper) photoInputWrapper.classList.add('hidden');
    if (photoInput) photoInput.value = '';
    if (addPhotoBtn) addPhotoBtn.textContent = 'Aggiungi foto';
    editor.classList.remove('hidden');
    editorOpen = true;
    if (saveBtn) saveBtn.disabled = false;
}

function toggleArchiveScroll() {
    if (!sidebar || !archiveToggle) return;
    sidebar.classList.toggle('scrollable');
    const isActive = sidebar.classList.contains('scrollable');
    archiveToggle.classList.toggle('active', isActive);
    archiveToggle.textContent = isActive ? 'Blocca scroll archivio' : 'Scorri archivio';
}

function closeEditor() {
    editor.classList.add('hidden');
    editorOpen = false;
    selectedDate = null;
    if (photoInput) photoInput.value = '';
    if (photoInputWrapper) photoInputWrapper.classList.add('hidden');
    if (photoPreview) photoPreview.src = '';
    if (photoPreviewWrapper) photoPreviewWrapper.classList.add('hidden');
    if (addPhotoBtn) addPhotoBtn.textContent = 'Aggiungi foto';
    if (saveBtn) saveBtn.disabled = true;
}

function saveEntry() {
    if (!editorOpen || !selectedDate) return;
    const dateKey = formatDateKey(selectedDate);
    const caption = captionText.value.trim();
    const existingEntry = getEntryForDate(selectedDate) || {};

    if (photoInput.files.length > 0) {
        const file = photoInput.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            entries[dateKey] = {
                caption,
                photo: reader.result,
            };
            localStorage.setItem(storageKey, JSON.stringify(entries));
            renderCalendar(selectedDate);
            closeEditor();
        };
        reader.readAsDataURL(file);
    } else if (caption !== '' || existingEntry.photo) {
        entries[dateKey] = {
            caption,
            photo: existingEntry.photo || '',
        };
        localStorage.setItem(storageKey, JSON.stringify(entries));
        renderCalendar(selectedDate);
        closeEditor();
    } else {
        delete entries[dateKey];
        localStorage.setItem(storageKey, JSON.stringify(entries));
        renderCalendar(selectedDate);
        closeEditor();
    }
}

function removePhoto() {
    if (!selectedDate) return;
    const dateKey = formatDateKey(selectedDate);
    const existingEntry = getEntryForDate(selectedDate);

    if (existingEntry) {
        delete entries[dateKey];
        localStorage.setItem(storageKey, JSON.stringify(entries));
        renderCalendar(selectedDate);
    }

    if (photoPreview) photoPreview.src = '';
    if (photoPreviewWrapper) photoPreviewWrapper.classList.add('hidden');
    if (photoInput) photoInput.value = '';
    if (removePhotoBtn) removePhotoBtn.classList.add('hidden');
}

function showPhotoInput() {
    if (!photoInputWrapper) return;
    photoInputWrapper.classList.remove('hidden');
    if (addPhotoBtn) addPhotoBtn.textContent = 'Scegli immagine';
}

function handlePhotoInputChange() {
    if (!photoInput.files.length) return;
    const file = photoInput.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        photoPreview.src = reader.result;
        photoPreviewWrapper.classList.remove('hidden');
        if (removePhotoBtn) removePhotoBtn.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

saveBtn?.addEventListener('click', saveEntry);
closeBtn?.addEventListener('click', closeEditor);
removePhotoBtn?.addEventListener('click', removePhoto);
addPhotoBtn?.addEventListener('click', showPhotoInput);
photoInput?.addEventListener('change', handlePhotoInputChange);
archiveToggle?.addEventListener('click', toggleArchiveScroll);
editor?.addEventListener('click', event => {
    if (event.target === editor) closeEditor();
});

initEditorState();
buildArchiveMenu(24);
selectMonth(new Date());


