// The backend server address - all API calls go here
const API_URL = 'http://127.0.0.1:3000/api/interns';

// ==============================
// LOAD ALL INTERNS ON PAGE OPEN
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  loadInterns();
});

// Fetch all interns from backend and display them
async function loadInterns() {
  const container = document.getElementById('interns-container');
  const loadingMsg = document.getElementById('loading-msg');
  const errorMsg = document.getElementById('error-msg');

  // Show loading, hide error
  loadingMsg.style.display = 'block';
  errorMsg.style.display = 'none';
  container.innerHTML = '';

  try {
    const response = await fetch(API_URL);

    // Check if response is okay
    if (!response.ok) {
      throw new Error('Failed to fetch interns from server');
    }

    const interns = await response.json();
    loadingMsg.style.display = 'none';

    // If no interns found
    if (interns.length === 0) {
      container.innerHTML = `
        <p class="no-interns-msg">
          No interns found. Add your first intern!
        </p>`;
      return;
    }

    // Display each intern as a card
    interns.forEach(intern => {
      const card = createInternCard(intern);
      container.appendChild(card);
    });

  } catch (error) {
    loadingMsg.style.display = 'none';
    errorMsg.style.display = 'block';
    errorMsg.textContent = '⚠️ Could not load interns. Make sure the server is running.';
  }
}

// Create an intern card element
function createInternCard(intern) {
  const card = document.createElement('div');
  card.classList.add('intern-card');

  card.innerHTML = `
    <div class="intern-info">
      <h3>${intern.name}</h3>
      <p>📧 ${intern.email}</p>
      <p>💼 ${intern.role}</p>
      <span class="batch-badge">Batch ${intern.batch}</span>
    </div>
    <div class="card-buttons">
      <button class="edit-btn" onclick="fillEditForm(${intern.id}, '${intern.name}', '${intern.email}', '${intern.role}', '${intern.batch}')">
        ✏️ Edit
      </button>
      <button class="delete-btn" onclick="deleteIntern(${intern.id})">
        🗑️ Delete
      </button>
    </div>
  `;

  return card;
}

// ==============================
// ADD OR UPDATE INTERN (FORM)
// ==============================
async function handleFormSubmit() {
  const name = document.getElementById('intern-name').value.trim();
  const email = document.getElementById('intern-email').value.trim();
  const role = document.getElementById('intern-role').value.trim();
  const batch = document.getElementById('intern-batch').value.trim();
  const editId = document.getElementById('edit-intern-id').value;
  const formMessage = document.getElementById('form-message');

  // Basic validation
  if (!name || !email || !role || !batch) {
    formMessage.textContent = '⚠️ Please fill in all fields.';
    formMessage.style.color = 'red';
    return;
  }

  // Prepare the intern data to send
  const internData = { name, email, role, batch };

  try {
    let response;

    if (editId) {
      // If editing an existing intern - PUT request
      response = await fetch(`${API_URL}/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(internData)
      });
    } else {
      // If adding a new intern - POST request
      response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(internData)
      });
    }

    if (!response.ok) {
      throw new Error('Something went wrong');
    }

    // Show success message
    formMessage.textContent = editId
      ? '✅ Intern updated successfully!'
      : '✅ Intern added successfully!';
    formMessage.style.color = 'green';

    // Reset form and reload list
    resetForm();
    loadInterns();

  } catch (error) {
    formMessage.textContent = '❌ Error saving intern. Try again.';
    formMessage.style.color = 'red';
  }
}

// ==============================
// DELETE AN INTERN
// ==============================
async function deleteIntern(internId) {
  // Ask user to confirm before deleting
  const confirmed = confirm('Are you sure you want to delete this intern?');
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_URL}/${internId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete intern');
    }

    // Reload the list after deleting
    loadInterns();

  } catch (error) {
    alert('❌ Could not delete intern. Please try again.');
  }
}

// ==============================
// FILL FORM FOR EDITING
// ==============================
function fillEditForm(id, name, email, role, batch) {
  // Fill the form with existing intern data
  document.getElementById('edit-intern-id').value = id;
  document.getElementById('intern-name').value = name;
  document.getElementById('intern-email').value = email;
  document.getElementById('intern-role').value = role;
  document.getElementById('intern-batch').value = batch;

  // Change form title and button text
  document.getElementById('form-title').textContent = '✏️ Edit Intern';
  document.getElementById('submit-btn').textContent = 'Update Intern';
  document.getElementById('cancel-btn').style.display = 'block';

  // Scroll to form smoothly
  document.querySelector('.form-section').scrollIntoView({
    behavior: 'smooth'
  });
}

// ==============================
// RESET FORM AFTER SUBMIT/CANCEL
// ==============================
function resetForm() {
  document.getElementById('intern-name').value = '';
  document.getElementById('intern-email').value = '';
  document.getElementById('intern-role').value = '';
  document.getElementById('intern-batch').value = '';
  document.getElementById('edit-intern-id').value = '';
  document.getElementById('form-title').textContent = '➕ Add New Intern';
  document.getElementById('submit-btn').textContent = 'Add Intern';
  document.getElementById('cancel-btn').style.display = 'none';
  document.getElementById('form-message').textContent = '';
}

// Cancel editing and reset form
function cancelEdit() {
  resetForm();
}