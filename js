const express = require('express');
const router = express.Router();

let employees = [
  { id: 1, name: 'أحمد', position: 'محاسب' },
  { id: 2, name: 'سارة', position: 'مديرة موارد بشرية' }
];

router.get('/', (req, res) => {
  res.json(employees);
});

router.post('/', (req, res) => {
  const { name, position } = req.body;
  const newEmployee = {
    id: employees.length + 1,
    name,
    position
  };
  employees.push(newEmployee);
  res.status(201).json(newEmployee);
});

module.exports = router;
