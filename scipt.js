
document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const entryForm = document.getElementById("entryForm");
    const nameInput = document.getElementById("name");
    const kelasInput = document.getElementById("kelas");
    const descTextarea = document.getElementById("desc");
    const fileInput = document.getElementById("fileInput");
    const filePreview = document.getElementById("filePreview");
    const cardPreview = document.getElementById("cardPreview");
    const previewInitial = document.getElementById("previewInitial");
    const previewName = document.getElementById("previewName");
    const previewKelas = document.getElementById("kelas"); // This was a bug, fixed it to refer to the element with the ID `kelas`
    const previewDesc = document.getElementById("previewDesc");
    const galleryContainer = document.getElementById("galleryContainer");
    const entryCountSpan = document.getElementById("entryCount");
    const downloadBtn = document.getElementById("downloadBtn");
    const emptyMessage = document.getElementById("emptyMessage");
    const tabButtons = document.querySelectorAll(".tab-btn");
    const formTab = document.getElementById("form-tab");
    const galleryTab = document.getElementById("gallery-tab");
    const contentContainer = document.getElementById("content-container");

    // State
    let entries = JSON.parse(localStorage.getItem('pameran-entries')) || [];
    let selectedFiles = [];

    // Utility Functions
    function saveEntries() {
        localStorage.setItem('pameran-entries', JSON.stringify(entries));
    }
    
    function updateContentHeight() {
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            contentContainer.style.height = `${activeTab.scrollHeight}px`;
        }
    }

    function updateCardPreview() {
        previewInitial.textContent = nameInput.value.trim() ? nameInput.value.trim().charAt(0).toUpperCase() : "A";
        previewName.textContent = nameInput.value.trim() || "Nama";
        previewKelas.textContent = kelasInput.value.trim() || "Kelas";
        previewDesc.textContent = descTextarea.value.trim() || "Deskripsi singkat akan muncul di sini...";
        updateContentHeight();
    }

    function renderFilePreview() {
        filePreview.innerHTML = '';
        selectedFiles.forEach(fileObj => {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'relative border rounded overflow-hidden bg-gray-50 p-1';

            let mediaHtml = '';
            if (fileObj.type.startsWith('image/')) {
                mediaHtml = `<img src="${fileObj.url}" alt="${fileObj.file.name}" class="w-full h-28 object-cover">`;
            } else if (fileObj.type.startsWith('video/')) {
                mediaHtml = `<video src="${fileObj.url}" controls class="w-full h-28 object-cover"></video>`;
            } else {
                mediaHtml = `<div class="w-full h-28 flex items-center justify-center text-gray-500 text-center">File Type: ${fileObj.type}</div>`;
            }
            previewDiv.innerHTML = mediaHtml;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center';
            removeBtn.textContent = 'x';
            removeBtn.type = 'button';
            removeBtn.onclick = () => removeFileFromSelected(fileObj.id);

            previewDiv.appendChild(removeBtn);
            filePreview.appendChild(previewDiv);
        });
        updateContentHeight();
    }

    function renderGallery() {
        galleryContainer.innerHTML = '';
        entryCountSpan.textContent = entries.length;

        if (entries.length === 0) {
            emptyMessage.style.display = 'block';
            galleryContainer.appendChild(emptyMessage);
        } else {
            emptyMessage.style.display = 'none';
            const galleryGrid = document.createElement('div');
            galleryGrid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';

            entries.forEach(entry => {
                const article = document.createElement('article');
                article.className = 'bg-white rounded-2xl shadow p-4 overflow-hidden';
                let mediaHTML = entry.media.map(m => {
                    const isVideo = m.type.startsWith('video/');
                    return `
                        <div class="rounded overflow-hidden border bg-gray-50">
                            ${isVideo ?
                                `<video src="${m.url}" controls class="w-full h-40 object-cover"></video>` :
                                `<img src="${m.url}" alt="${m.name}" class="w-full h-40 object-cover">`
                            }
                        </div>
                    `;
                }).join('');

                article.innerHTML = `
                    <div class="flex items-start justify-between">
                        <div>
                            <h4 class="font-bold text-red-700">${entry.name}</h4>
                            <div class="text-xs text-gray-600">${entry.kelas} · ${new Date(entry.createdAt).toLocaleString()}</div>
                        </div>
                        <div class="flex gap-2">
                            <button class="text-xs px-2 py-1 rounded bg-red-100 text-red-700 delete-btn" data-id="${entry.id}">Hapus</button>
                        </div>
                    </div>
                    ${entry.desc ? `<p class="mt-3 text-sm text-gray-700">${entry.desc}</p>` : ''}
                    <div class="mt-3 grid grid-cols-2 gap-2">${mediaHTML}</div>
                `;
                galleryGrid.appendChild(article);
            });
            galleryContainer.appendChild(galleryGrid);
        }
        updateContentHeight();
    }

    // Event Handlers
    function handleFileChange(e) {
        const files = Array.from(e.target.files || []);
        const newFiles = files.map(f => ({
            id: Math.random().toString(36).slice(2, 9),
            file: f,
            url: URL.createObjectURL(f),
            type: f.type,
        }));
        selectedFiles = selectedFiles.concat(newFiles);
        renderFilePreview();
    }

    function removeFileFromSelected(id) {
        selectedFiles = selectedFiles.filter(f => f.id !== id);
        renderFilePreview();
    }

    function handleAddEntry(e) {
        e.preventDefault();
        const name = nameInput.value.trim();
        const kelas = kelasInput.value.trim();
        const desc = descTextarea.value.trim();

        if (!name || !kelas || selectedFiles.length === 0) {
            alert("Mohon isi nama, kelas, dan unggah setidaknya 1 foto/video.");
            return;
        }

        const newEntry = {
            id: Math.random().toString(36).slice(2, 9),
            name,
            kelas,
            desc,
            media: selectedFiles.map(f => ({ id: f.id, name: f.file.name, type: f.type, url: f.url })),
            createdAt: new Date().toISOString(),
        };

        entries.unshift(newEntry);
        saveEntries();

        // Reset form
        nameInput.value = "";
        kelasInput.value = "";
        descTextarea.value = "";
        fileInput.value = null;
        selectedFiles = [];
        updateCardPreview();
        renderFilePreview();

        showTab('gallery');
        alert("Karya berhasil diunggah dan disimpan!");
    }

    function removeEntry(id) {
        entries = entries.filter(entry => entry.id !== id);
        saveEntries();
        renderGallery();
    }

    function downloadJSON() {
    if (!entries || entries.length === 0) {
        alert("Tidak ada data untuk ditampilkan.");
        return;
    }

    const payload = entries.map(e => ({
        id: e.id,
        name: e.name,
        kelas: e.kelas,
        desc: e.desc,
        createdAt: e.createdAt,
        media: e.media.map(m => ({ name: m.name, type: m.type }))
    }));

    const jsonString = JSON.stringify(payload, null, 2);
    const newWindow = window.open();
    newWindow.document.write('<pre>' + jsonString.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>');
    newWindow.document.title = "Data JSON Pameran";
    newWindow.document.close();
}

    function showTab(tabName) {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
        const activeTabContent = document.getElementById(`${tabName}-tab`);
        activeTabContent.classList.add('active');

        if (tabName === 'gallery') {
            renderGallery();
        } else {
            updateContentHeight();
        }
    }

    // Event Listeners
    nameInput.addEventListener("input", updateCardPreview);
    kelasInput.addEventListener("input", updateCardPreview);
    descTextarea.addEventListener("input", updateCardPreview);
    fileInput.addEventListener("change", handleFileChange);
    entryForm.addEventListener("submit", handleAddEntry);
    downloadBtn.addEventListener("click", downloadJSON);

    galleryContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const entryId = e.target.dataset.id;
            if (confirm("Apakah Anda yakin ingin menghapus karya ini?")) {
                removeEntry(entryId);
            }
        }
    });

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            showTab(btn.dataset.tab);
        });
    });
    
    // Initial load
    updateCardPreview();
    showTab('form');
    
    // Update tinggi kontainer saat resize
    window.addEventListener('resize', updateContentHeight);
});
