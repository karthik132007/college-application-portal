const API_URL = 'http://localhost:4000/api';

document.addEventListener('DOMContentLoaded', async function() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    // Populate user name if available
    const userName = localStorage.getItem('userName');
    if (userName) {
        const titleEl = document.querySelector('.hero-title');
        if(titleEl) titleEl.textContent = `Welcome, ${userName.split(' ')[0]}`;
    }

    const logoutBtn = document.getElementById('logoutBtnSdash');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }

    // Initialization loaders
    document.getElementById('taskList').innerHTML = '<div class="empty-state"><p class="muted">Loading actions...</p></div>';
    document.getElementById('heroStatus').textContent = '...';
    document.getElementById('appId').textContent = '...';
    document.getElementById('programName').textContent = '...';

    try {
        const response = await fetch(`${API_URL}/applications/user/${userId}`);
        const result = await response.json();

        if (response.ok && result.application) {
            const app = result.application;
            
            // Populate Dashboard fields
            document.getElementById('heroStatus').textContent = app.status.replace('_', ' ');
            document.getElementById('statusBadge').textContent = app.status.replace('_', ' ');
            
            // Generate a fake Application ID based on the MongoDB _id
            const displayId = 'APP-' + app._id.substring(app._id.length - 6).toUpperCase();
            document.getElementById('appId').textContent = displayId;
            
            document.getElementById('programName').textContent = app.program;
            
            // Submission Date
            const date = new Date(app.createdAt);
            document.getElementById('submissionDate').textContent = date.toLocaleDateString('en-IN', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
            
            // Intake Year
            document.getElementById('intakeYear').textContent = date.getFullYear() || '2026';

            const aTag = document.getElementById('studentDriveLinkAnchor');
            if (aTag) {
                if (app.driveLink) {
                    aTag.href = app.driveLink;
                    aTag.textContent = app.driveLink;
                    document.getElementById('heroDocsCount').textContent = 'Link Added';
                } else {
                    aTag.textContent = 'Link not provided';
                    aTag.removeAttribute('href');
                    aTag.style.color = '#64748b';
                    aTag.style.textDecoration = 'none';
                    document.getElementById('heroDocsCount').textContent = 'Missing';
                }
            }

            const updateInput = document.getElementById('updateDriveLinkInput');
            const updateBtn = document.getElementById('btnUpdateDriveLink');
            if (updateBtn && updateInput) {
                updateBtn.addEventListener('click', async () => {
                    const newLink = updateInput.value.trim();
                    if (!newLink) {
                        alert('Please enter a valid URL.');
                        return;
                    }

                    const originalText = updateBtn.textContent;
                    updateBtn.textContent = 'Updating...';
                    updateBtn.disabled = true;

                    try {
                        const res = await fetch(`${API_URL}/applications/${app._id}/drive-link`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ driveLink: newLink })
                        });
                        
                        const data = await res.json();
                        if (res.ok) {
                            alert('Drive link updated successfully!');
                            window.location.reload();
                        } else {
                            alert(data.message || 'Failed to update link.');
                            updateBtn.textContent = originalText;
                            updateBtn.disabled = false;
                        }
                    } catch (err) {
                        console.error('Update link error:', err);
                        alert('Network error. Failed to update link.');
                        updateBtn.textContent = originalText;
                        updateBtn.disabled = false;
                    }
                });
            }

            // Empty state updates
            let taskHtml = '';
            
            if (app.status === 'Accepted' || app.status === 'Student_Accepted') {
                // Clear out unnecessary dashboard elements for a cleaner look
                const statusOverviewCard = document.getElementById('status');
                if (statusOverviewCard) statusOverviewCard.style.display = 'none'; 
                const examGrid = document.getElementById('exam-card')?.parentElement;
                if(examGrid) examGrid.style.display = 'none';
                const docsGrid = document.getElementById('documents')?.parentElement;
                if(docsGrid) docsGrid.style.display = 'none';

                const heroStats = document.querySelector('.hero-stats');
                if (heroStats) heroStats.style.display = 'none';
                const heroActions = document.querySelector('.hero-actions');
                if (heroActions) heroActions.style.display = 'none';
                 
                let actionBtn = '';
                if (app.status === 'Accepted') {
                    actionBtn = `<div style="margin-top: 1.5rem;"><button onclick="acceptAdmission('${app._id}')" class="button primary" style="padding: 12px 24px; font-size: 1.1rem; background: #16a34a;">Confirm Arrival & Accept Admission</button></div>`;
                }

                taskHtml = `
                    <div style="padding: 2.5rem 1.5rem; text-align: center; background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; margin-bottom: 1rem;">
                        <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">🎓</span>
                        <h2 style="color: #166534; margin:0 0 1rem 0; font-size: 1.5rem;">Congratulations! You are Selected.</h2>
                        <p style="color: #15803d; font-size: 1.05rem; line-height: 1.6; margin: 0;">You can now visit the college campus for an official tour and final document verification.<br><br>For specific college opening dates, please check the <strong>Important Dates</strong> field.</p>
                        ${actionBtn}
                    </div>
                `;
            } else if (app.status === 'Pending' || app.status === 'Hold') {
                taskHtml += `
                    <div class="task-item" style="padding: 10px; border-bottom: 1px solid #eee;">
                        <span style="color: #64748b;">Your application is currently under review. Expected update: within 5-7 business days.</span>
                    </div>
                `;
            } else if (app.status === 'Rejected') {
                taskHtml += `
                    <div class="task-item" style="padding: 15px; border-bottom: 1px solid #eee; background: #fef2f2; border-left: 4px solid #ef4444;">
                        <h4 style="color: #991b1b; margin:0 0 5px 0;">Update</h4>
                        <p style="margin:0 0 0 0; font-size: 0.9rem; color: #b91c1c;">We regret to inform you that your application was not selected for this cohort.</p>
                    </div>
                `;
            }

            document.getElementById('taskList').innerHTML = taskHtml;
            loadExamSlots(app);
        } else {
            // No application found
            document.getElementById('heroStatus').textContent = 'Not Applied';
            document.getElementById('statusBadge').textContent = 'Not Applied';
            document.getElementById('statusBadge').className = 'status-pill pending'; // use existing styles
            document.getElementById('appId').textContent = 'N/A';
            document.getElementById('programName').textContent = 'Not Selected';
            document.getElementById('intakeYear').textContent = '-';
            document.getElementById('submissionDate').textContent = '-';
            
            document.getElementById('taskList').innerHTML = `
                <div class="empty-state" style="padding: 2rem 1rem;">
                    <p class="muted" style="margin-bottom: 1rem;">You haven't submitted any applications yet.</p>
                    <a href="apply.html" class="button primary">Start New Application</a>
                </div>
            `;
            
            // Lock document uploads until they apply
            const docCard = document.getElementById('documents');
            if (docCard) {
                docCard.innerHTML = `
                    <div class="card-header">
                        <h3 class="card-title">Submitted Documents</h3>
                    </div>
                    <div class="empty-state" style="padding: 3rem 1rem; text-align: center;">
                        <p class="muted" style="margin-bottom: 1rem;">Please submit your application first to provide a documents link.</p>
                        <a href="apply.html" class="button secondary">Apply Now</a>
                    </div>
                `;
            }
            document.getElementById('heroDocsCount').textContent = '-';
            loadExamSlots(null);
        }
    } catch (error) {
        console.error('Error fetching application:', error);
        document.getElementById('taskList').innerHTML = '<div class="empty-state" style="color:#ef4444;">Failed to load data. Please try again later.</div>';
    }
    // Fetch Announcements
    loadAnnouncements();
    loadImportantDates();
});

async function loadImportantDates() {
    const listDiv = document.getElementById('studentDatesList');
    if(!listDiv) return;

    try {
        const res = await fetch(`${API_URL}/dates`);
        const data = await res.json();
        
        if (res.ok && data.dates) {
            const { openDate, closeDate, resultsDate, acceptDate, collegeDate } = data.dates;
            
            // Reusable row generator
            const formatDate = (val) => {
                if (!val) return 'TBA';
                const d = new Date(val);
                // In case it's not a valid date string (like legacy text typed in via previous version)
                if (isNaN(d.getTime())) return val;
                return d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric' });
            };

            const makeRow = (label, val) => `
                <div style="padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: #475569; font-size: 0.9rem;">${label}</span>
                    <span style="color: #0f172a; font-weight: 700; font-size: 0.95rem;">${formatDate(val)}</span>
                </div>
            `;

            listDiv.innerHTML = 
                makeRow('Application Opens', openDate) +
                makeRow('Last Date to Apply', closeDate) +
                makeRow('Results Announced', resultsDate) +
                makeRow('Deadline to Accept', acceptDate) +
                makeRow('College Starts', collegeDate);
        } else {
            listDiv.innerHTML = '<div class="empty-state"><p class="muted">Dates not available</p></div>';
        }
    } catch(err) {
        listDiv.innerHTML = '<div class="empty-state" style="color:#ef4444;"><p>Failed to load dates.</p></div>';
    }
}

async function loadAnnouncements() {
    const listDiv = document.getElementById('notificationList');
    if(!listDiv) return;

    try {
        const res = await fetch(`${API_URL}/notifications`);
        const data = await res.json();
        
        if (res.ok && data.notifications && data.notifications.length > 0) {
            const typeColors = {
                'info': { bg: '#eff6ff', border: '#bfdbfe', text: '#1e3a8a' },
                'success': { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
                'warning': { bg: '#fef3c7', border: '#fde68a', text: '#92400e' },
                'error': { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' }
            };

            listDiv.innerHTML = data.notifications.map(n => {
                const color = typeColors[n.type] || typeColors['info'];
                const d = new Date(n.createdAt).toLocaleDateString();
                return `
                    <div style="padding: 1rem; border-radius: 8px; background: ${color.bg}; border: 1px solid ${color.border}; margin-bottom: 1rem;">
                        <div style="font-size: 0.75rem; color: ${color.text}; opacity: 0.8; margin-bottom: 0.3rem; font-weight: 500;">${d}</div>
                        <h5 style="margin: 0 0 0.4rem 0; color: ${color.text}; font-size: 0.95rem;">${n.title}</h5>
                        <p style="margin: 0; color: ${color.text}; font-size: 0.85rem; line-height: 1.4; opacity: 0.9;">${n.message}</p>
                    </div>
                `;
            }).join('');
        } else {
            listDiv.innerHTML = '<div class="empty-state" style="padding: 1rem;">No new notifications.</div>';
        }
    } catch (err) {
        listDiv.innerHTML = '<div class="empty-state" style="color:#ef4444; padding: 1rem;">Failed to load.</div>';
    }
}

window.acceptAdmission = async function(appId) {
    if (!confirm('Are you sure you want to accept this admission offer?')) return;
    
    try {
        const response = await fetch(`${API_URL}/applications/${appId}/student-accept`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        if (response.ok) {
            alert('Admission accepted successfully! Welcome to the university.');
            window.location.reload();
        } else {
            alert(data.message || 'Failed to accept admission.');
        }
    } catch (error) {
        console.error('Error accepting admission:', error);
        alert('Network error. Failed to accept admission.');
    }
};

async function loadExamSlots(app) {
    const container = document.getElementById('examContainer');
    if (!container) return;

    if (!app) {
        container.innerHTML = '<div class="empty-state" style="padding: 1rem;"><p class="muted">Please submit your application first to book an exam slot.</p></div>';
        return;
    }

    if (app.status === 'Rejected') {
        container.innerHTML = '<div class="empty-state" style="padding: 1rem; border: 1px dashed #fca5a5; background: #fef2f2; border-radius: 8px;"><p style="color: #991b1b; margin:0;">Exam scheduling is not available for rejected applications.</p></div>';
        return;
    }

    if (app.examSlot && app.examSlot.trim() !== '') {
        container.innerHTML = `
            <div style="padding: 1rem; border-radius: 8px; background: #f0fdf4; border: 1px solid #bbf7d0;">
                <h4 style="color: #166534; margin: 0 0 10px 0;">You are Booked! ✅</h4>
                <p style="margin: 0; color: #15803d; font-size: 0.95rem;"><strong>Slot:</strong> ${app.examSlot}</p>
            </div>
        `;
        return;
    }

    try {
        const res = await fetch(`${API_URL}/exams`);
        const data = await res.json();
        
        if (res.ok && data.slots && data.slots.length > 0) {
            let optionsHtml = '<option value="" disabled selected>Select an available slot...</option>';
            data.slots.forEach(s => {
                let formattedDate = s.date;
                const d = new Date(s.date);
                if(!isNaN(d.getTime())) formattedDate = d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric' });
                
                const slotString = `${formattedDate} | ${s.time}`;
                optionsHtml += `<option value="${slotString}">${slotString}</option>`;
            });

            container.innerHTML = `
                <div style="padding: 1.5rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; text-align: left;">
                    <p style="margin: 0 0 15px 0; font-size: 0.9rem; color: #475569;">Select your preferred slot for the entrance exam. This is required before the university reviews your application.</p>
                    <select id="examSlotSelect" style="width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 15px; background: white; font-family: inherit;">
                        ${optionsHtml}
                    </select>
                    <button class="button primary" onclick="bookExamSlot('${app._id}')" id="btnBookSlot" style="width: 100%; padding: 0.75rem; font-size: 0.95rem; background: #2563eb;">Confirm Booking</button>
                </div>
            `;
        } else {
            container.innerHTML = '<div class="empty-state" style="padding: 1rem;"><p class="muted">No exam slots are currently available. Check back later.</p></div>';
        }
    } catch(err) {
        container.innerHTML = '<div class="empty-state" style="padding: 1rem; color: #ef4444;"><p>Failed to load available slots.</p></div>';
    }
}

window.bookExamSlot = async function(appId) {
    const select = document.getElementById('examSlotSelect');
    const slotStr = select.value;
    const btn = document.getElementById('btnBookSlot');

    if (!slotStr) {
        alert("Please select a slot from the dropdown first.");
        return;
    }

    const origTxt = btn.textContent;
    btn.textContent = 'Booking...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/applications/${appId}/book-exam`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ examSlot: slotStr })
        });
        
        if (res.ok) {
            alert("Exam booked successfully! Your portal will now refresh.");
            window.location.reload();
        } else {
            const data = await res.json();
            alert(data.message || 'Failed to book exam slot.');
        }
    } catch(err) {
        alert("Network error while booking slot.");
    }
    btn.textContent = origTxt;
    btn.disabled = false;
};
