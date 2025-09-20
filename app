const form = document.getElementById('employeeForm');
const list = document.getElementById('employeeList');

async function fetchEmployees() {
  const res = await fetch('http://localhost:3000/api/employees');
  const data = await res.json();
  list.innerHTML = '';
  data.forEach(emp => {
    const li = document.createElement('li');
    li.textContent = `${emp.name} - ${emp.position}`;
    list.appendChild(li);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const position = document.getElementById('position').value;

  await fetch('http://localhost:3000/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, position })
  });

  form.reset();
  fetchEmployees();
});

fetchEmployees();
