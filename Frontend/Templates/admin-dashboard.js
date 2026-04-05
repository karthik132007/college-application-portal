const API_URL = 'http://localhost:4000/api';
let globalApplications = [];

document.addEventListener('DOMContentLoaded', () => {
    // Simple Project check: Are we logged in as Admin?
    const isAdmin = localStorage.getItem('adminLoggedIn');

    if (isAdmin !== 'true') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'admin-login.html';
        return;
    }

    // Set up logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'admin-login.html';
    });

    // Fetch initial data
    fetchApplications();
});

async function fetchApplications() {
    const tableBody = document.getElementById('applicationsTableBody');
    tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">Loading applications...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/applications/all`);
        const data = await response.json();

        if (response.ok) {
            globalApplications = data.applications || [];
            updateStats(globalApplications);
            filterApplications(); // Renders the table respecting current filters
        } else {
            console.error('Failed to fetch applications:', data.message);
            tableBody.innerHTML = `<tr><td colspan="5" class="empty-state" style="color: #ef4444;">Error: ${data.message}</td></tr>`;
        }
    } catch (error) {
        console.error('Error fetching applications:', error);
        tableBody.innerHTML = `<tr><td colspan="5" class="empty-state" style="color: #ef4444;">Network error. Could not reach server.</td></tr>`;
    }
}

function updateStats(apps) {
    let accepted = 0, pending = 0, rejected = 0;
    apps.forEach(app => {
        if (app.status === 'Accepted' || app.status === 'Student_Accepted') accepted++;
        if (app.status === 'Pending') pending++;
        if (app.status === 'Rejected') rejected++;
    });

    document.getElementById('totalCount').textContent = apps.length;
    document.getElementById('acceptedCount').textContent = accepted;
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('rejectedCount').textContent = rejected;
}

function filterApplications() {
    const searchVal = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const statusVal = document.getElementById('filterStatus')?.value || 'All';

    const filtered = globalApplications.filter(app => {
        const displayName = (app.user ? app.user.fullName : `${app.firstName} ${app.lastName}`).toLowerCase();
        const displayId = String(app._id).toLowerCase();
        
        const matchesSearch = displayName.includes(searchVal) || displayId.includes(searchVal);
        const matchesStatus = statusVal === 'All' || app.status === statusVal;

        return matchesSearch && matchesStatus;
    });

    renderApplications(filtered);
}

function renderApplications(applications) {
    const tableBody = document.getElementById('applicationsTableBody');
    
    if (!applications || applications.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No applications found matching criteria.</td></tr>';
        return;
    }

    const rowsHTML = applications.map(app => {
        
        const statusClass = `status-${app.status.toLowerCase()}`;
        const displayName = app.user ? app.user.fullName : `${app.firstName} ${app.lastName}`;
        const displayEmail = app.user ? app.user.email : app.email;
        const displayPhone = app.user ? app.user.phone : app.phone;
        
        // Disabled actions if student already accepted
        const actionsDisabled = (app.status === 'Student_Accepted');

        return `
            <tr>
                <td>
                    <div style="font-weight: 500; color: #0f172a;">${displayName}</div>
                    <div style="font-size: 0.8rem; color: #64748b; margin-top: 0.2rem;">ID: ${app._id.substring(0,8)}...</div>
                </td>
                <td>
                    <div style="font-weight: 500;">${app.program}</div>
                    <div style="font-size: 0.8rem; color: #64748b; margin-top: 0.2rem; text-transform: uppercase;">${app.stream}</div>
                </td>
                <td>
                    <div>${displayEmail}</div>
                    <div style="font-size: 0.85rem; color: #64748b; margin-top: 0.2rem;">${displayPhone}</div>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">${app.status.replace('_', ' ')}</span>
                </td>
                <td>
                    <div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start; min-width: 160px;">
                        <button style="padding: 0.35rem 0.6rem; font-size: 0.8rem; color: #2563eb; border: 1px solid #bfdbfe; background: #eff6ff; border-radius: 6px; width: 100%; text-align: center; cursor: pointer; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'" onclick="viewApplication('${app._id}')">View Details</button>
                        
                        <div style="display: flex; width: 100%; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border-radius: 6px;">
                            <select id="status-select-${app._id}" style="flex: 1; padding: 0.35rem 0.2rem; font-size: 0.8rem; border: 1px solid #cbd5e1; border-right: none; border-radius: 6px 0 0 6px; outline: none; background: white; cursor: pointer; color: #334155;" ${actionsDisabled ? 'disabled' : ''}>
                                <option value="Pending" ${app.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Hold" ${app.status === 'Hold' ? 'selected' : ''}>Hold</option>
                                <option value="Accepted" ${app.status === 'Accepted' ? 'selected' : ''}>Accept</option>
                                <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Reject</option>
                            </select>
                            <button onclick="updateStatus('${app._id}')" id="btn-update-${app._id}" style="padding: 0.35rem 0.6rem; font-size: 0.8rem; background: #0f172a; color: white; border: none; border-radius: 0 6px 6px 0; cursor: pointer; font-weight: 600; transition: background 0.2s;" onmouseover="this.style.background='#334155'" onmouseout="this.style.background='#0f172a'" ${actionsDisabled ? 'disabled' : ''}>Save</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    tableBody.innerHTML = rowsHTML;
}

async function updateStatus(applicationId) {
    const statusSelect = document.getElementById(`status-select-${applicationId}`);
    const newStatus = statusSelect.value;
    const updateBtn = document.getElementById(`btn-update-${applicationId}`);
    
    const originalText = updateBtn.textContent;
    updateBtn.textContent = '...';
    updateBtn.disabled = true;
    statusSelect.disabled = true;

    try {
        const response = await fetch(`${API_URL}/applications/${applicationId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        });

        const data = await response.json();

        if (response.ok) {
            // refresh data to show updated state and badging
            fetchApplications();
        } else {
            alert(data.message || 'Failed to update status');
            updateBtn.textContent = originalText;
            updateBtn.disabled = false;
            statusSelect.disabled = false;
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Network error. Failed to update status.');
        updateBtn.textContent = originalText;
        updateBtn.disabled = false;
        statusSelect.disabled = false;
    }
}

function viewApplication(appId) {
    const app = globalApplications.find(a => a._id === appId);
    if (!app) return;

    // Display the submitted drive link
    let docStatusHtml = `
        <div class="detail-item" style="margin-top: 0.5rem; padding: 10px; background: #eff6ff; border: 1px dashed #93c5fd; border-radius: 6px;">
            <strong style="color: #1e3a8a;">Provided Documents Link:</strong><br>
            ${app.driveLink 
                ? `<a href="${app.driveLink}" target="_blank" style="color: #2563eb; text-decoration: underline; display: inline-block; margin-top: 5px; word-break: break-all;">${app.driveLink}</a>` 
                : '<span style="color: #64748b; margin-top: 5px; display: inline-block;">No link provided</span>'}
        </div>
    `;

    const html = `
        <div class="detail-grid">
            <div class="detail-block">
                <div class="detail-title">Personal Information</div>
                <div class="detail-item"><strong>First Name:</strong> ${app.firstName}</div>
                <div class="detail-item"><strong>Last Name:</strong> ${app.lastName}</div>
                <div class="detail-item"><strong>Email:</strong> ${app.email}</div>
                <div class="detail-item"><strong>Phone:</strong> ${app.phone}</div>
                <div class="detail-item"><strong>Date of Birth:</strong> ${new Date(app.dob).toLocaleDateString()}</div>
                <div class="detail-item"><strong>Gender:</strong> ${app.gender || 'Not specified'}</div>
                <div class="detail-item"><strong>Nationality:</strong> ${app.nationality}</div>
            </div>
            
            <div class="detail-block">
                <div class="detail-title">Address</div>
                <div class="detail-item"><strong>Line 1:</strong> ${app.addressLine1}</div>
                <div class="detail-item"><strong>Line 2:</strong> ${app.addressLine2 || '-'}</div>
                <div class="detail-item"><strong>City:</strong> ${app.city}</div>
                <div class="detail-item"><strong>State:</strong> ${app.state}</div>
                <div class="detail-item"><strong>Postal Code:</strong> ${app.postalCode}</div>
            </div>

            <div class="detail-block">
                <div class="detail-title">Academic Details (Class 12)</div>
                <div class="detail-item"><strong>College Name:</strong> ${app.college || '-'}</div>
                <div class="detail-item"><strong>Board:</strong> ${app.board || '-'}</div>
                <div class="detail-item"><strong>Year:</strong> ${app.completionYear || '-'}</div>
                <div class="detail-item"><strong>Score:</strong> ${app.score ? app.score + '%' : '-'}</div>
            </div>

            <div class="detail-block">
                <div class="detail-title">Academic Details (Class 10)</div>
                <div class="detail-item"><strong>School Name:</strong> ${app.class10School || '-'}</div>
                <div class="detail-item"><strong>Board:</strong> ${app.class10Board || '-'}</div>
                <div class="detail-item"><strong>Year:</strong> ${app.class10Year || '-'}</div>
                <div class="detail-item"><strong>Score:</strong> ${app.class10Score ? app.class10Score + '%' : '-'}</div>
            </div>
            
            <div class="detail-block" style="background: #f0fdf4; border-color: #bbf7d0;">
                <div class="detail-title" style="color: #166534; border-bottom-color: #bbf7d0;">Entrance Exam</div>
                <div class="detail-item"><strong>Status:</strong> ${app.examSlot ? `<span style="font-weight:700; color:#15803d;">Booked</span>` : `<span style="color:#ef4444;">Pending Booking</span>`}</div>
                ${app.examSlot ? `<div class="detail-item"><strong>Time Slot:</strong> <span style="font-weight:600; color:#0f172a;">${app.examSlot}</span></div>` : ''}
            </div>
            
            <div class="detail-block">
                <div class="detail-title">Program & Facilities</div>
                <div class="detail-item"><strong>Stream:</strong> <span style="text-transform: uppercase">${app.stream}</span></div>
                <div class="detail-item"><strong>Program:</strong> ${app.program}</div>
                <div class="detail-item"><strong>Hostel Needed:</strong> ${app.hostelService === 'yes' ? 'Yes' : 'No'}</div>
                ${app.hostelService === 'yes' ? `<div class="detail-item"><strong>Hostel Type:</strong> ${app.hostelType}</div>` : ''}
            </div>

            <div class="detail-block">
                <div class="detail-title">Uploaded Documents (Verification)</div>
                ${docStatusHtml}
                <div class="detail-item" style="margin-top: 1rem;"><strong>Application Notes:</strong> ${app.notes || 'None'}</div>
            </div>
        </div>

        <div class="detail-block" style="margin-top: 1rem; background: #fffbeb; border: 1px solid #fde68a;">
            <div class="detail-title" style="color: #b45309; border-bottom-color: #fde68a;">Direct Message to Student (Action Required, Missing Links, etc)</div>
            <textarea id="adminFeedbackText" style="width: 100%; border: 1px solid #fcd34d; border-radius: 6px; padding: 0.75rem; min-height: 80px; font-family: inherit; font-size: 0.9rem; margin-bottom: 0.5rem; box-sizing: border-box;" placeholder="Type your message here...">${app.adminFeedback || ''}</textarea>
            <div style="text-align: right; display: flex; justify-content: flex-end; align-items: center; gap: 15px;">
                <span id="feedbackStatusMsg" style="font-size: 0.85rem; color: #166534; opacity: 0; transition: opacity 0.3s ease;">Feedback Saved ✓</span>
                <button class="button primary" onclick="sendFeedback('${app._id}')" id="btnSendFeedback" style="font-size: 0.85rem; background: #d97706;">Update Feedback</button>
            </div>
        </div>
    `;

    document.getElementById('modalTitle').textContent = `Application: ${app.firstName} ${app.lastName}`;
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('appModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('appModal').style.display = 'none';
}

async function sendFeedback(applicationId) {
    const feedbackText = document.getElementById('adminFeedbackText').value;
    const btn = document.getElementById('btnSendFeedback');
    const msg = document.getElementById('feedbackStatusMsg');

    const origTxt = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/applications/${applicationId}/feedback`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedback: feedbackText })
        });

        if (response.ok) {
            // Update local state so it persists if modal collapses/opens again
            const app = globalApplications.find(a => a._id === applicationId);
            if(app) app.adminFeedback = feedbackText;

            msg.style.opacity = '1';
            setTimeout(() => msg.style.opacity = '0', 3000);
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to send feedback');
        }
    } catch (error) {
        console.error('Feedback Error:', error);
        alert('Network error. Failed to send message.');
    }

    btn.textContent = origTxt;
    btn.disabled = false;
}

// ==========================
// NOTIFICATIONS MANAGEMENT
// ==========================

document.addEventListener('DOMContentLoaded', () => {
    fetchNotifications(); // Initial load
    
    const btnPost = document.getElementById('btnPostNotif');
    if (btnPost) {
        btnPost.addEventListener('click', postNotification);
    }

    fetchDates();
    const btnDates = document.getElementById('btnUpdateDates');
    if (btnDates) {
        btnDates.addEventListener('click', updateDates);
    }
});

async function fetchNotifications() {
    const listDiv = document.getElementById('adminNotifList');
    if(!listDiv) return;
    listDiv.innerHTML = '<div class="empty-state">Loading...</div>';
    
    try {
        const res = await fetch(`${API_URL}/notifications`);
        const data = await res.json();
        
        if (res.ok) {
            renderNotifications(data.notifications || []);
        } else {
            listDiv.innerHTML = `<div class="empty-state" style="color:red;">Failed: ${data.message}</div>`;
        }
    } catch (err) {
        listDiv.innerHTML = '<div class="empty-state" style="color:red;">Network Error</div>';
    }
}

function renderNotifications(notifs) {
    const listDiv = document.getElementById('adminNotifList');
    if (!notifs.length) {
        listDiv.innerHTML = '<div class="empty-state" style="padding: 2rem;">No active announcements.</div>';
        return;
    }

    const typeColors = {
        'info': { bg: '#eff6ff', border: '#bfdbfe', text: '#1e3a8a' },
        'success': { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
        'warning': { bg: '#fef3c7', border: '#fde68a', text: '#92400e' },
        'error': { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' }
    };

    listDiv.innerHTML = notifs.map(n => {
        const color = typeColors[n.type] || typeColors['info'];
        const d = new Date(n.createdAt).toLocaleString();
        return `
            <div style="position: relative; padding: 1rem 1.2rem; border-radius: 8px; background: ${color.bg}; border: 1px solid ${color.border};">
                <button onclick="deleteNotification('${n._id}')" style="position: absolute; top: 10px; right: 10px; background:transparent; border:none; cursor:pointer; color: ${color.text}; opacity: 0.6; font-size: 1.2rem; line-height: 1;">&times;</button>
                <h5 style="margin: 0 0 0.4rem 0; color: ${color.text}; font-size: 1rem;">${n.title}</h5>
                <p style="margin: 0 0 0.6rem 0; color: ${color.text}; font-size: 0.9rem; line-height: 1.4; opacity: 0.9; padding-right: 20px;">${n.message}</p>
                <div style="font-size: 0.75rem; color: ${color.text}; opacity: 0.7; margin-top: 0.5rem;">Posted: ${d}</div>
            </div>
        `;
    }).join('');
}

async function postNotification() {
    const title = document.getElementById('notifTitle').value.trim();
    const message = document.getElementById('notifMessage').value.trim();
    const type = document.getElementById('notifType').value;
    const btn = document.getElementById('btnPostNotif');

    if (!title || !message) {
        alert("Please provide both a title and message.");
        return;
    }

    const origTxt = btn.textContent;
    btn.textContent = "Posting...";
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, message, type })
        });
        
        if (res.ok) {
            document.getElementById('notifTitle').value = '';
            document.getElementById('notifMessage').value = '';
            fetchNotifications(); // Reload list
        } else {
            const data = await res.json();
            alert("Failed to post: " + data.message);
        }
    } catch(err) {
        alert("Network error. Could not post notification.");
    }

    btn.textContent = origTxt;
    btn.disabled = false;
}

window.deleteNotification = async function(id) {
    if (!confirm("Remove this announcement for everyone?")) return;
    
    try {
        const res = await fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchNotifications();
        } else {
            alert("Failed to delete notification.");
        }
    } catch(err) {
        alert("Network error.");
    }
};

// ==========================
// IMPORTANT DATES MANAGEMENT
// ==========================

async function fetchDates() {
    try {
        const res = await fetch(`${API_URL}/dates`);
        const data = await res.json();
        if (res.ok && data.dates) {
            document.getElementById('dateOpen').value = data.dates.openDate || '';
            document.getElementById('dateClose').value = data.dates.closeDate || '';
            document.getElementById('dateResults').value = data.dates.resultsDate || '';
            document.getElementById('dateAccept').value = data.dates.acceptDate || '';
            document.getElementById('dateCollege').value = data.dates.collegeDate || '';
        }
    } catch(err) {
        console.error('Fetch dates error:', err);
    }
}

async function updateDates() {
    const btn = document.getElementById('btnUpdateDates');
    const origTxt = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
        const payload = {
            openDate: document.getElementById('dateOpen').value.trim(),
            closeDate: document.getElementById('dateClose').value.trim(),
            resultsDate: document.getElementById('dateResults').value.trim(),
            acceptDate: document.getElementById('dateAccept').value.trim(),
            collegeDate: document.getElementById('dateCollege').value.trim()
        };

        const res = await fetch(`${API_URL}/dates`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('Important dates saved successfully!');
        } else {
            alert('Failed to save dates.');
        }
    } catch(err) {
        alert('Network error. Could not save dates.');
    }
    
    btn.textContent = origTxt;
    btn.disabled = false;
}

// ==========================
// EXAM SLOTS MANAGEMENT
// ==========================

document.addEventListener('DOMContentLoaded', () => {
    fetchExamSlots(); // Initial load
    const btnRelease = document.getElementById('btnReleaseSlot');
    if (btnRelease) {
        btnRelease.addEventListener('click', releaseExamSlot);
    }
});

async function fetchExamSlots() {
    const tableBody = document.getElementById('examSlotsTableBody');
    if(!tableBody) return;
    tableBody.innerHTML = '<tr><td colspan="3" class="empty-state">Loading slots...</td></tr>';
    
    try {
        const res = await fetch(`${API_URL}/exams`);
        const data = await res.json();
        
        if (res.ok) {
            renderExamSlots(data.slots || []);
        } else {
            tableBody.innerHTML = `<tr><td colspan="3" class="empty-state" style="color:red;">Failed: ${data.message}</td></tr>`;
        }
    } catch (err) {
        tableBody.innerHTML = '<tr><td colspan="3" class="empty-state" style="color:red;">Network Error</td></tr>';
    }
}

function renderExamSlots(slots) {
    const tableBody = document.getElementById('examSlotsTableBody');
    if (!slots.length) {
        tableBody.innerHTML = '<tr><td colspan="3" class="empty-state">No exam slots available.</td></tr>';
        return;
    }

    tableBody.innerHTML = slots.map(s => {
        let formattedDate = s.date;
        const d = new Date(s.date);
        if(!isNaN(d.getTime())) {
             formattedDate = d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric' });
        }
        
        // Compute Bookings
        const slotString = `${formattedDate} | ${s.time}`;
        const bookedApps = globalApplications.filter(a => a.examSlot === slotString);
        
        let bookingsHtml = '<div style="font-size: 0.8rem; color: #94a3b8; margin-top: 5px;">0 Bookings</div>';
        if (bookedApps.length > 0) {
            bookingsHtml = `
                <div style="font-size: 0.8rem; color: #166534; font-weight: 600; margin-top: 5px;">${bookedApps.length} Booking${bookedApps.length > 1 ? 's' : ''}</div>
                <div style="max-height: 80px; overflow-y: auto; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 6px; margin-top: 4px;">
                    ${bookedApps.map(a => `<div style="font-size: 0.75rem; color: #475569; padding: 2px 0;">• ${a.firstName} ${a.lastName} <span style="opacity: 0.7">(${a.program})</span></div>`).join('')}
                </div>
            `;
        }

        return `
            <tr>
                <td style="font-weight: 500; color: #0f172a; vertical-align: top;">${formattedDate}</td>
                <td style="color: #475569; vertical-align: top;">
                    ${s.time}
                    ${bookingsHtml}
                </td>
                <td style="vertical-align: top;">
                    <button class="button ghost" onclick="deleteExamSlot('${s._id}')" style="color:#ef4444; border: 1px solid #fca5a5; padding: 0.3rem 0.6rem; border-radius:4px; font-size: 0.8rem; cursor:pointer; background:#fff;">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

async function releaseExamSlot() {
    const date = document.getElementById('newExamDate').value;
    const time = document.getElementById('newExamTime').value.trim();
    const btn = document.getElementById('btnReleaseSlot');

    if (!date || !time) {
        alert("Please provide both an exam date and a time window.");
        return;
    }

    const origTxt = btn.textContent;
    btn.textContent = "Releasing...";
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/exams`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, time })
        });
        
        if (res.ok) {
            document.getElementById('newExamDate').value = '';
            document.getElementById('newExamTime').value = '';
            fetchExamSlots();
        } else {
            const data = await res.json();
            alert("Failed to release slot: " + data.message);
        }
    } catch(err) {
        alert("Network error. Could not release slot.");
    }

    btn.textContent = origTxt;
    btn.disabled = false;
}

window.deleteExamSlot = async function(id) {
    if (!confirm("Remove this exam slot? Students will not be able to book it anymore.")) return;
    
    try {
        const res = await fetch(`${API_URL}/exams/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchExamSlots();
        } else {
            alert("Failed to delete slot.");
        }
    } catch(err) {
        alert("Network error.");
    }
};
