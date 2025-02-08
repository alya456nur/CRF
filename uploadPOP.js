function popFunctions(chargeData) {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    const uploadBtn = document.getElementById('upload-files');
    const closeBtn = document.getElementById('cancel-POP');
    const modal = document.getElementById('modal-pop');

    modal.classList.remove('hide'); // Remove fade-out class
    modal.classList.add('show');

    // Ensure event listeners are not stacked for other elements
    closeBtn.removeEventListener('click', closeModalPOP);
    dropArea.removeEventListener('dragover', handleDragOver);
    dropArea.removeEventListener('dragleave', handleDragLeave);
    dropArea.removeEventListener('drop', handleDrop);
    dropArea.removeEventListener('click', triggerFileInput);
    fileInput.removeEventListener('change', handleFileInput);

    // Set file input to accept only PDF files
    fileInput.accept = 'application/pdf'; // Only accept PDF files

    // Add event listeners
    closeBtn.addEventListener('click', closeModalPOP);
    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);
    dropArea.addEventListener('click', triggerFileInput);
    fileInput.addEventListener('change', handleFileInput);

    function popSave(chargeData) {
        uploadBtn.onclick = function () {
            uploadPop(chargeData);
        };
    }

    popSave(chargeData);
}

// Event handler functions
function closeModalPOP(e) {
    e.preventDefault();

    const modal = document.getElementById('modal-pop');
    modal.classList.remove('show');
    modal.classList.add('hide');

    // Clear the files array
    filePOP = [];

    // Clear the file list in the UI
    renderFileList();
}

// Event handler functions
function closeModalPOP2() {

    const modal = document.getElementById('modal-pop');
    modal.classList.remove('show');
    modal.classList.add('hide');

    // Clear the files array
    filePOP = [];

    // Clear the file list in the UI
    renderFileList();
}

function handleDragOver(e) {
    e.preventDefault();
    document.getElementById('drop-area').classList.add('highlight');
}

function handleDragLeave() {
    document.getElementById('drop-area').classList.remove('highlight');
}

function handleDrop(e) {
    e.preventDefault();
    document.getElementById('drop-area').classList.remove('highlight');
    addFiles(e.dataTransfer.files);
}

function triggerFileInput() {
    document.getElementById('file-input').click();
}

function handleFileInput(e) {
    addFiles(e.target.files);
}

function addFiles(selectedFiles) {
    const fileList = document.getElementById('file-list');
    const uploadBtn = document.getElementById('upload-files');

    for (let file of selectedFiles) {
        if (file.type !== "application/pdf") {
            AlertMe(`"${file.name}" is not a PDF file. Only pdf files are accepted.`);
            continue; // Skip non-PDF files
        }

        filePOP.push(file);
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');
        fileItem.innerHTML = `<span>${file.name}</span> 
            <button onclick="removeFile('${file.name}')" 
            style="background: transparent; color: red; border: none; cursor: pointer;">X</button>`;
        fileList.appendChild(fileItem);
    }
    uploadBtn.disabled = filePOP.length === 0;
}

function removeFile(fileName) {
    filePOP = filePOP.filter(file => file.name !== fileName);
    renderFileList();
}

function renderFileList() {
    const fileList = document.getElementById('file-list');
    const uploadBtn = document.getElementById('upload-files');

    fileList.innerHTML = '';
    filePOP.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');
        fileItem.innerHTML = `<span>${file.name}</span> 
            <button onclick="removeFile('${file.name}')" 
            style="background: transparent; color: red; border: none; cursor: pointer;">X</button>`;
        fileList.appendChild(fileItem);
    });
    uploadBtn.disabled = filePOP.length === 0;
}
