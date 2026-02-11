// Get DOM elements
const contactForm = document.getElementById('contactForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');
const contactsList = document.getElementById('contactsList');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');

// Email modal elements
const emailModal = document.getElementById('emailModal');
const emailForm = document.getElementById('emailForm');
const emailTo = document.getElementById('emailTo');
const emailSubject = document.getElementById('emailSubject');
const emailBody = document.getElementById('emailBody');
// Fallback UI elements for blocked popups
const gmailFallback = document.getElementById('gmailFallback');
const gmailFallbackContainer = document.getElementById('gmailFallbackContainer');

// State variables
let contacts = [];
let editingIndex = -1;
let draggedElement = null;
let draggedIndex = -1;
let currentView = 'grid'; // 'grid' or 'list'
let currentEmailContact = null;

// Initialize app
function init() {
    loadContacts();
    renderContacts();
    attachEventListeners();
}

// Load contacts from localStorage
function loadContacts() {
    const storedContacts = localStorage.getItem('contacts');
    if (storedContacts) {
        contacts = JSON.parse(storedContacts);
    }
}

// Save contacts to localStorage
function saveContacts() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

// Attach event listeners
function attachEventListeners() {
    contactForm.addEventListener('submit', handleSubmit);
    cancelBtn.addEventListener('click', handleCancel);
    searchInput.addEventListener('input', handleSearch);
    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', () => switchView('grid'));
    }
    if (listViewBtn) {
        listViewBtn.addEventListener('click', () => switchView('list'));
    }
    emailForm.addEventListener('submit', handleEmailSubmit);

    // Close modal when clicking outside
    emailModal.addEventListener('click', (e) => {
        if (e.target === emailModal) {
            closeEmailModal();
        }
    });
}

// Handle form submission
function handleSubmit(e) {
    e.preventDefault();

    // Get input values
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    // Validate inputs
    if (!name || !email || !phone) {
        alert('Please fill in all fields!');
        return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address!');
        return;
    }

    // Create contact object
    const contact = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone
    };

    if (editingIndex === -1) {
        // Add new contact
        contacts.push(contact);
    } else {
        // Update existing contact
        contacts[editingIndex] = contact;
        editingIndex = -1;
        updateFormUI(false);
    }

    // Save and render
    saveContacts();
    renderContacts();
    resetForm();
}

// Handle cancel button
function handleCancel() {
    editingIndex = -1;
    updateFormUI(false);
    resetForm();
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Reset form
function resetForm() {
    contactForm.reset();
    nameInput.focus();
}

// Update form UI for editing mode
function updateFormUI(isEditing) {
    if (isEditing) {
        formTitle.textContent = 'Edit Contact';
        submitBtn.textContent = 'Update Contact';
        cancelBtn.style.display = 'block';
    } else {
        formTitle.textContent = 'Add New Contact';
        submitBtn.textContent = 'Add Contact';
        cancelBtn.style.display = 'none';
    }
}

// Switch between grid and list view
function switchView(view) {
    currentView = view;

    if (view === 'grid') {
        contactsList.classList.add('grid-view');
        contactsList.classList.remove('list-view');
        if (gridViewBtn) gridViewBtn.classList.add('active');
        if (listViewBtn) listViewBtn.classList.remove('active');
    } else {
        contactsList.classList.remove('grid-view');
        contactsList.classList.add('list-view');
        if (gridViewBtn) gridViewBtn.classList.remove('active');
        if (listViewBtn) listViewBtn.classList.add('active');
    }
}

// Render contacts list
function renderContacts(filteredContacts = null) {
    const contactsToRender = filteredContacts || contacts;

    // Show/hide empty state
    if (contactsToRender.length === 0) {
        contactsList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    } else {
        contactsList.style.display = 'flex';
        emptyState.style.display = 'none';
    }

    // Clear the list
    contactsList.innerHTML = '';

    // Render each contact
    contactsToRender.forEach((contact, index) => {
        const contactCard = createContactCard(contact, index);
        contactsList.appendChild(contactCard);
    });
}

// Create contact card element
function createContactCard(contact, index) {
    const card = document.createElement('div');
    card.className = 'contact-card new-contact';
    card.draggable = true;
    card.dataset.index = index;

    // Get initials for avatar
    const initials = getInitials(contact.name);

    // Condensed view
    const condensedView = `
        <div class="contact-condensed" onclick="toggleCard(${index})">
            <div class="contact-avatar">${initials}</div>
            <div class="contact-name">${escapeHtml(contact.name)}</div>
            <div class="contact-preview">${escapeHtml(contact.email)}</div>
        </div>
    `;

    // Expanded view
    const expandedView = `
        <div class="contact-expanded">
            <div class="contact-header">
                <div class="contact-avatar">${initials}</div>
                <div class="contact-header-info">
                    <div class="contact-name">${escapeHtml(contact.name)}</div>
                    <span class="contact-status">Active</span>
                </div>
            </div>
            
            <div class="contact-info">
                <div class="contact-info-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1976D2" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <span>${escapeHtml(contact.email)}</span>
                </div>
                <div class="contact-info-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1976D2" stroke-width="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>${escapeHtml(contact.phone)}</span>
                </div>
            </div>
            
            <div class="contact-actions">
                <button class="btn-email" onclick="sendEmail(${index})">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Send Email
                </button>
                <button class="btn-edit" onclick="editContact(${index})">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit
                </button>
                <button class="btn-delete" onclick="deleteContact(${index})">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete
                </button>
                <button class="btn-close" onclick="toggleCard(${index})">Close</button>
            </div>
        </div>
    `;

    card.innerHTML = condensedView + expandedView;

    // Add drag and drop event listeners
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragover', handleDragOver);
    card.addEventListener('drop', handleDrop);
    card.addEventListener('dragend', handleDragEnd);
    card.addEventListener('dragenter', handleDragEnter);
    card.addEventListener('dragleave', handleDragLeave);

    // Remove animation class after animation completes
    setTimeout(() => {
        card.classList.remove('new-contact');
    }, 400);

    return card;
}

// Get initials from name
function getInitials(name) {
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Toggle card expanded/condensed state
function toggleCard(index) {
    const cards = document.querySelectorAll('.contact-card');
    const card = cards[index];

    if (card) {
        // Close all other cards first
        cards.forEach((c, i) => {
            if (i !== index) {
                c.classList.remove('expanded');
            }
        });

        // Toggle current card
        card.classList.toggle('expanded');
    }
}

// Send email via Gmail
function sendEmail(index) {
    const contact = contacts[index];
    currentEmailContact = contact;

    // Pre-fill the email form
    emailTo.value = contact.email;
    emailSubject.value = `Hello ${contact.name}`;
    emailBody.value = `Hi ${contact.name},\n\nI hope this email finds you well.\n\nBest regards`;

    // Show the modal
    emailModal.classList.add('active');
    // Hide any previous fallback link
    if (gmailFallbackContainer) {
        gmailFallbackContainer.style.display = 'none';
        gmailFallback.href = '#';
    }
    emailSubject.focus();
}

// Handle email form submission
function handleEmailSubmit(e) {
    e.preventDefault();

    const recipient = encodeURIComponent(emailTo.value);
    const subject = encodeURIComponent(emailSubject.value.trim());
    const body = encodeURIComponent(emailBody.value.trim());

    // Validate inputs
    if (!subject || !body) {
        alert('Please fill in both subject and message!');
        return;
    }

    // Construct Gmail URL with user's custom content
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${body}`;

    // Try opening Gmail in a new tab. Some browsers/extensions may block popups.
    let opened = false;

    try {
        const newWin = window.open(gmailUrl, '_blank');
        if (newWin) {
            opened = true;
        }
    } catch (err) {
        opened = false;
    }

    // Fallback: try a programmatic anchor click (sometimes works when window.open is blocked)
    if (!opened) {
        try {
            const a = document.createElement('a');
            a.href = gmailUrl;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            opened = true;
        } catch (err) {
            opened = false;
        }
    }

    // If still blocked, try opening the user's default mail client via mailto
    if (!opened) {
        const recipientPlain = emailTo.value.trim();
        const mailtoUrl = `mailto:${recipientPlain}?subject=${subject}&body=${body}`;

        let mailtoAttempted = false;
        try {
            // Create an anchor with target to avoid navigating the current page
            const a2 = document.createElement('a');
            a2.href = mailtoUrl;
            a2.target = '_blank';
            a2.rel = 'noopener noreferrer';
            a2.style.display = 'none';
            document.body.appendChild(a2);
            a2.click();
            document.body.removeChild(a2);
            mailtoAttempted = true;
        } catch (err) {
            mailtoAttempted = false;
        }

        // If mailto attempt likely worked, close modal and exit
        if (mailtoAttempted) {
            closeEmailModal();
            return;
        }

        // Otherwise show persistent fallback link (mailto) and copy to clipboard
        if (gmailFallback && gmailFallbackContainer) {
            gmailFallback.href = mailtoUrl;
            gmailFallback.textContent = 'Open default mail client';
            gmailFallbackContainer.style.display = 'block';
            try { gmailFallback.focus(); } catch (e) { }
        }

        const fallbackMessage = 'Automatic opening failed. Click the "Open default mail client" button or paste the copied mailto URL into a new tab.';

        console.debug('Fallback mailto URL:', mailtoUrl);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(mailtoUrl).then(() => {
                alert(fallbackMessage + ' The mailto URL was copied to your clipboard.');
            }).catch(() => {
                alert(fallbackMessage + ' If copying failed, paste this URL into a new tab: ' + mailtoUrl);
            });
        } else {
            alert(fallbackMessage + ' Paste this URL into a new tab: ' + mailtoUrl);
        }

        // Keep modal open so user can use the visible fallback
        return;
    }

    // If opened successfully, close the modal
    closeEmailModal();
}

// Close email modal
function closeEmailModal() {
    emailModal.classList.remove('active');
    emailForm.reset();
    currentEmailContact = null;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Edit contact
function editContact(index) {
    const contact = contacts[index];

    // Populate form with contact data
    nameInput.value = contact.name;
    emailInput.value = contact.email;
    phoneInput.value = contact.phone;

    // Set editing state
    editingIndex = index;
    updateFormUI(true);

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    nameInput.focus();
}

// Delete contact
function deleteContact(index) {
    if (confirm('Are you sure you want to delete this contact?')) {
        contacts.splice(index, 1);
        saveContacts();
        renderContacts();

        // Reset form if editing the deleted contact
        if (editingIndex === index) {
            editingIndex = -1;
            updateFormUI(false);
            resetForm();
        }
    }
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();

    if (searchTerm === '') {
        renderContacts();
        return;
    }

    const filtered = contacts.filter(contact => {
        return contact.name.toLowerCase().includes(searchTerm) ||
            contact.email.toLowerCase().includes(searchTerm);
    });

    renderContacts(filtered);
}

// Drag and Drop handlers
function handleDragStart(e) {
    draggedElement = e.currentTarget;
    draggedIndex = parseInt(draggedElement.dataset.index);
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (e.currentTarget !== draggedElement) {
        e.currentTarget.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    e.currentTarget.classList.remove('drag-over');

    const dropIndex = parseInt(e.currentTarget.dataset.index);

    if (draggedIndex !== dropIndex && draggedIndex !== -1) {
        // Reorder array
        const draggedContact = contacts[draggedIndex];
        contacts.splice(draggedIndex, 1);
        contacts.splice(dropIndex, 0, draggedContact);

        // Save and render
        saveContacts();
        renderContacts();
    }

    return false;
}

function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');

    // Remove drag-over class from all cards
    const cards = document.querySelectorAll('.contact-card');
    cards.forEach(card => card.classList.remove('drag-over'));

    draggedElement = null;
    draggedIndex = -1;
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);