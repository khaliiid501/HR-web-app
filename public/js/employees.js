// JavaScript لصفحة إدارة الموظفين

let currentSortColumn = '';
let currentSortDirection = 'asc';
let filteredEmployees = [];

// تحميل البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    hrSystem.loadData();
    renderEmployeesTable();
    updateEmployeeStats();
    setupEventListeners();
});

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // نموذج إضافة موظف
    document.getElementById('addEmployeeForm').addEventListener('submit', handleAddEmployee);
    
    // نموذج تعديل موظف
    document.getElementById('editEmployeeForm').addEventListener('submit', handleEditEmployee);
    
    // البحث والفلترة
    document.getElementById('searchEmployee').addEventListener('input', filterEmployees);
    document.getElementById('filterDepartment').addEventListener('change', filterEmployees);
}

// معالجة إضافة موظف جديد
function handleAddEmployee(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const employeeData = {
        id: Date.now(), // معرف مؤقت باستخدام timestamp
        name: document.getElementById('employeeName').value,
        position: document.getElementById('employeePosition').value,
        department: document.getElementById('employeeDepartment').value,
        salary: parseFloat(document.getElementById('employeeSalary').value),
        email: document.getElementById('employeeEmail').value,
        phone: document.getElementById('employeePhone').value,
        hireDate: document.getElementById('employeeHireDate').value,
        status: document.getElementById('employeeStatus').value
    };
    
    // التحقق من صحة البيانات
    if (!validateEmployeeData(employeeData)) {
        return;
    }
    
    // إضافة الموظف إلى البيانات
    hrSystem.data.employees.push(employeeData);
    hrSystem.saveData();
    
    // تحديث الواجهة
    renderEmployeesTable();
    updateEmployeeStats();
    hrSystem.clearForm('addEmployeeForm');
    
    hrSystem.showAlert('تم إضافة الموظف بنجاح', 'success');
}

// التحقق من صحة بيانات الموظف
function validateEmployeeData(data) {
    if (!data.name || data.name.trim().length < 2) {
        hrSystem.showAlert('يجب أن يكون اسم الموظف على الأقل حرفين', 'error');
        return false;
    }
    
    if (!data.email || !hrSystem.validateEmail(data.email)) {
        hrSystem.showAlert('يرجى إدخال بريد إلكتروني صحيح', 'error');
        return false;
    }
    
    if (!data.phone || !hrSystem.validateSaudiPhone(data.phone)) {
        hrSystem.showAlert('يرجى إدخال رقم هاتف سعودي صحيح', 'error');
        return false;
    }
    
    if (!data.salary || data.salary < 0) {
        hrSystem.showAlert('يجب أن يكون الراتب رقماً موجباً', 'error');
        return false;
    }
    
    // التحقق من عدم وجود موظف بنفس البريد الإلكتروني
    const existingEmployee = hrSystem.data.employees.find(emp => 
        emp.email === data.email && emp.id !== data.id
    );
    
    if (existingEmployee) {
        hrSystem.showAlert('يوجد موظف آخر بنفس البريد الإلكتروني', 'error');
        return false;
    }
    
    return true;
}

// عرض جدول الموظفين
function renderEmployeesTable() {
    const tbody = document.getElementById('employeesTableBody');
    const employees = filteredEmployees.length > 0 ? filteredEmployees : hrSystem.data.employees;
    
    tbody.innerHTML = '';
    
    employees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.name}</td>
            <td>${employee.position}</td>
            <td>${employee.department}</td>
            <td>${hrSystem.formatCurrency(employee.salary)}</td>
            <td>${employee.hireDate ? hrSystem.formatDate(employee.hireDate) : 'غير محدد'}</td>
            <td><span class="status-${employee.status === 'نشط' ? 'active' : employee.status === 'معلق' ? 'pending' : 'inactive'}">${employee.status}</span></td>
            <td>
                <button class="btn btn-primary" onclick="editEmployee(${employee.id})" style="margin-left: 5px; font-size: 0.8rem; padding: 0.4rem 0.8rem;">تعديل</button>
                <button class="btn btn-danger" onclick="deleteEmployee(${employee.id})" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">حذف</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// تحديث إحصائيات الموظفين
function updateEmployeeStats() {
    const employees = hrSystem.data.employees;
    const activeEmployees = employees.filter(emp => emp.status === 'نشط');
    const departments = [...new Set(employees.map(emp => emp.department))];
    const totalSalaries = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    const averageSalary = employees.length > 0 ? totalSalaries / employees.length : 0;
    
    document.getElementById('totalEmployeesCount').textContent = employees.length;
    document.getElementById('activeEmployeesCount').textContent = activeEmployees.length;
    document.getElementById('averageEmployeeSalary').textContent = hrSystem.formatCurrency(averageSalary);
    document.getElementById('departmentsCount').textContent = departments.length;
}

// فلترة الموظفين
function filterEmployees() {
    const searchTerm = document.getElementById('searchEmployee').value.toLowerCase();
    const departmentFilter = document.getElementById('filterDepartment').value;
    
    filteredEmployees = hrSystem.data.employees.filter(employee => {
        const matchesSearch = !searchTerm || 
            employee.name.toLowerCase().includes(searchTerm) ||
            employee.position.toLowerCase().includes(searchTerm) ||
            employee.department.toLowerCase().includes(searchTerm);
        
        const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
        
        return matchesSearch && matchesDepartment;
    });
    
    renderEmployeesTable();
}

// ترتيب الموظفين
function sortEmployees(column) {
    if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortDirection = 'asc';
    }
    
    const employees = filteredEmployees.length > 0 ? filteredEmployees : hrSystem.data.employees;
    const sortedEmployees = hrSystem.sortData(employees, column, currentSortDirection);
    
    if (filteredEmployees.length > 0) {
        filteredEmployees = sortedEmployees;
    } else {
        hrSystem.data.employees = sortedEmployees;
    }
    
    renderEmployeesTable();
}

// تعديل موظف
function editEmployee(employeeId) {
    const employee = hrSystem.data.employees.find(emp => emp.id === employeeId);
    if (!employee) {
        hrSystem.showAlert('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    // ملء نموذج التعديل
    document.getElementById('editEmployeeId').value = employee.id;
    document.getElementById('editEmployeeName').value = employee.name;
    document.getElementById('editEmployeePosition').value = employee.position;
    document.getElementById('editEmployeeDepartment').value = employee.department;
    document.getElementById('editEmployeeSalary').value = employee.salary;
    document.getElementById('editEmployeeStatus').value = employee.status;
    
    // إظهار النافذة المنبثقة
    showEditModal();
}

// معالجة تعديل الموظف
function handleEditEmployee(e) {
    e.preventDefault();
    
    const employeeId = parseInt(document.getElementById('editEmployeeId').value);
    const employeeIndex = hrSystem.data.employees.findIndex(emp => emp.id === employeeId);
    
    if (employeeIndex === -1) {
        hrSystem.showAlert('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    const updatedData = {
        ...hrSystem.data.employees[employeeIndex],
        name: document.getElementById('editEmployeeName').value,
        position: document.getElementById('editEmployeePosition').value,
        department: document.getElementById('editEmployeeDepartment').value,
        salary: parseFloat(document.getElementById('editEmployeeSalary').value),
        status: document.getElementById('editEmployeeStatus').value
    };
    
    // التحقق من صحة البيانات
    if (!validateEmployeeData(updatedData)) {
        return;
    }
    
    // تحديث البيانات
    hrSystem.data.employees[employeeIndex] = updatedData;
    hrSystem.saveData();
    
    // تحديث الواجهة
    renderEmployeesTable();
    updateEmployeeStats();
    closeEditModal();
    
    hrSystem.showAlert('تم تحديث بيانات الموظف بنجاح', 'success');
}

// حذف موظف
function deleteEmployee(employeeId) {
    const employee = hrSystem.data.employees.find(emp => emp.id === employeeId);
    if (!employee) {
        hrSystem.showAlert('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    hrSystem.showConfirmation(
        `هل أنت متأكد من حذف الموظف "${employee.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`,
        () => {
            const employeeIndex = hrSystem.data.employees.findIndex(emp => emp.id === employeeId);
            hrSystem.data.employees.splice(employeeIndex, 1);
            hrSystem.saveData();
            
            renderEmployeesTable();
            updateEmployeeStats();
            hrSystem.showAlert('تم حذف الموظف بنجاح', 'success');
        }
    );
}

// تصدير بيانات الموظفين
function exportEmployees() {
    const employees = filteredEmployees.length > 0 ? filteredEmployees : hrSystem.data.employees;
    const exportData = employees.map(emp => ({
        'الاسم': emp.name,
        'المنصب': emp.position,
        'القسم': emp.department,
        'الراتب': emp.salary,
        'البريد الإلكتروني': emp.email || '',
        'الهاتف': emp.phone || '',
        'تاريخ التوظيف': emp.hireDate || '',
        'الحالة': emp.status
    }));
    
    hrSystem.exportToCSV(exportData, 'employees.csv');
    hrSystem.showAlert('تم تصدير بيانات الموظفين بنجاح', 'success');
}

// تحديث قائمة الموظفين
function refreshEmployeeList() {
    hrSystem.loadData();
    filteredEmployees = [];
    document.getElementById('searchEmployee').value = '';
    document.getElementById('filterDepartment').value = '';
    renderEmployeesTable();
    updateEmployeeStats();
    hrSystem.showAlert('تم تحديث القائمة بنجاح', 'success');
}

// إظهار نافذة التعديل
function showEditModal() {
    const modal = document.getElementById('editEmployeeModal');
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '10000';
    
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.backgroundColor = 'white';
        modalContent.style.padding = '2rem';
        modalContent.style.borderRadius = '15px';
        modalContent.style.maxWidth = '600px';
        modalContent.style.width = '90%';
        modalContent.style.maxHeight = '80vh';
        modalContent.style.overflowY = 'auto';
        modalContent.style.position = 'relative';
    }
    
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.left = '15px';
        closeBtn.style.fontSize = '28px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#999';
    }
}

// إغلاق نافذة التعديل
function closeEditModal() {
    document.getElementById('editEmployeeModal').style.display = 'none';
}

// إغلاق النافذة عند الضغط خارجها
window.onclick = function(event) {
    const modal = document.getElementById('editEmployeeModal');
    if (event.target === modal) {
        closeEditModal();
    }
}