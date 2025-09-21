// JavaScript لصفحة إدارة الرواتب والمزايا

// بيانات الرواتب والمزايا
let payrollData = {
    adjustments: [], // المكافآت والخصومات
    transactions: [], // سجل المعاملات
    benefits: {
        healthInsurance: [],
        transportation: [],
        meals: [],
        vacations: []
    },
    payrollRecords: [] // سجلات كشوف الرواتب
};

// تحميل البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    hrSystem.loadData();
    loadPayrollData();
    setupEventListeners();
    populateEmployeeSelect();
    updatePayrollStats();
    setCurrentMonth();
    generateCurrentPayroll();
    loadTransactions();
});

// تحميل بيانات الرواتب من LocalStorage
function loadPayrollData() {
    const stored = localStorage.getItem('payrollData');
    if (stored) {
        payrollData = JSON.parse(stored);
    }
}

// حفظ بيانات الرواتب في LocalStorage
function savePayrollData() {
    localStorage.setItem('payrollData', JSON.stringify(payrollData));
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    document.getElementById('bonusDeductionForm').addEventListener('submit', handleBonusDeduction);
    document.getElementById('payrollMonth').addEventListener('change', generatePayroll);
    document.getElementById('payrollYear').addEventListener('change', generatePayroll);
}

// ملء قائمة الموظفين
function populateEmployeeSelect() {
    const select = document.getElementById('employeeSelect');
    select.innerHTML = '<option value="">اختر الموظف</option>';
    
    hrSystem.data.employees.filter(emp => emp.status === 'نشط').forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.id;
        option.textContent = employee.name;
        select.appendChild(option);
    });
}

// تعيين الشهر الحالي
function setCurrentMonth() {
    const now = new Date();
    document.getElementById('payrollMonth').value = now.getMonth() + 1;
    document.getElementById('payrollYear').value = now.getFullYear();
}

// تحديث إحصائيات الرواتب
function updatePayrollStats() {
    const employees = hrSystem.data.employees.filter(emp => emp.status === 'نشط');
    const totalSalaries = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    const averageSalary = employees.length > 0 ? totalSalaries / employees.length : 0;
    
    const totalBonuses = payrollData.adjustments
        .filter(adj => adj.type === 'bonus')
        .reduce((sum, adj) => sum + adj.amount, 0);
    
    const totalDeductions = payrollData.adjustments
        .filter(adj => adj.type === 'deduction')
        .reduce((sum, adj) => sum + adj.amount, 0);
    
    document.getElementById('totalPayrollThisMonth').textContent = hrSystem.formatCurrency(totalSalaries);
    document.getElementById('averageSalaryAmount').textContent = hrSystem.formatCurrency(averageSalary);
    document.getElementById('totalBonuses').textContent = hrSystem.formatCurrency(totalBonuses);
    document.getElementById('totalDeductions').textContent = hrSystem.formatCurrency(totalDeductions);
}

// معالجة إضافة مكافأة أو خصم
function handleBonusDeduction(e) {
    e.preventDefault();
    
    const employeeId = parseInt(document.getElementById('employeeSelect').value);
    const type = document.getElementById('adjustmentType').value;
    const amount = parseFloat(document.getElementById('adjustmentAmount').value);
    const reason = document.getElementById('adjustmentReason').value;
    
    const employee = hrSystem.data.employees.find(emp => emp.id === employeeId);
    if (!employee) {
        hrSystem.showAlert('يرجى اختيار موظف صحيح', 'error');
        return;
    }
    
    const adjustment = {
        id: Date.now(),
        employeeId: employeeId,
        employeeName: employee.name,
        type: type,
        amount: amount,
        reason: reason,
        date: new Date().toISOString().split('T')[0],
        status: 'active'
    };
    
    payrollData.adjustments.push(adjustment);
    
    // إضافة إلى سجل المعاملات
    const transaction = {
        id: Date.now(),
        date: new Date().toISOString(),
        employeeId: employeeId,
        employeeName: employee.name,
        type: type === 'bonus' ? 'مكافأة' : 'خصم',
        amount: amount,
        reason: reason,
        status: 'مكتمل'
    };
    
    payrollData.transactions.push(transaction);
    
    savePayrollData();
    updatePayrollStats();
    generatePayroll();
    loadTransactions();
    hrSystem.clearForm('bonusDeductionForm');
    
    const message = type === 'bonus' ? 'تم إضافة المكافأة بنجاح' : 'تم إضافة الخصم بنجاح';
    hrSystem.showAlert(message, 'success');
}

// إنشاء كشف الرواتب
function generatePayroll() {
    const month = parseInt(document.getElementById('payrollMonth').value);
    const year = parseInt(document.getElementById('payrollYear').value);
    
    const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    document.getElementById('currentPayrollPeriod').textContent = 
        `${monthNames[month - 1]} ${year}`;
    
    const tbody = document.getElementById('payrollTableBody');
    tbody.innerHTML = '';
    
    const activeEmployees = hrSystem.data.employees.filter(emp => emp.status === 'نشط');
    
    activeEmployees.forEach(employee => {
        const baseSalary = employee.salary || 0;
        
        // حساب المكافآت والخصومات للموظف
        const employeeAdjustments = payrollData.adjustments.filter(adj => 
            adj.employeeId === employee.id && adj.status === 'active'
        );
        
        const bonuses = employeeAdjustments
            .filter(adj => adj.type === 'bonus')
            .reduce((sum, adj) => sum + adj.amount, 0);
        
        const deductions = employeeAdjustments
            .filter(adj => adj.type === 'deduction')
            .reduce((sum, adj) => sum + adj.amount, 0);
        
        // حساب التأمينات الاجتماعية (9.75% من الراتب الأساسي)
        const socialInsurance = baseSalary * 0.0975;
        
        // حساب صافي الراتب
        const netSalary = baseSalary + bonuses - deductions - socialInsurance;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.name}</td>
            <td>${employee.department}</td>
            <td>${hrSystem.formatCurrency(baseSalary)}</td>
            <td style="color: #28a745;">${hrSystem.formatCurrency(bonuses)}</td>
            <td style="color: #dc3545;">${hrSystem.formatCurrency(deductions)}</td>
            <td>${hrSystem.formatCurrency(socialInsurance)}</td>
            <td style="font-weight: bold; color: #007bff;">${hrSystem.formatCurrency(netSalary)}</td>
            <td>
                <button class="btn btn-primary" onclick="viewPayslip(${employee.id})" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">قسيمة الراتب</button>
                <button class="btn btn-success" onclick="processPayment(${employee.id})" style="font-size: 0.8rem; padding: 0.4rem 0.8rem; margin-right: 5px;">دفع</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// إنشاء كشف الرواتب للشهر الحالي
function generateCurrentPayroll() {
    generatePayroll();
}

// عرض قسيمة الراتب
function viewPayslip(employeeId) {
    const employee = hrSystem.data.employees.find(emp => emp.id === employeeId);
    if (!employee) {
        hrSystem.showAlert('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    const month = parseInt(document.getElementById('payrollMonth').value);
    const year = parseInt(document.getElementById('payrollYear').value);
    
    const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    // حساب تفاصيل الراتب
    const baseSalary = employee.salary || 0;
    const employeeAdjustments = payrollData.adjustments.filter(adj => 
        adj.employeeId === employee.id && adj.status === 'active'
    );
    
    const bonuses = employeeAdjustments.filter(adj => adj.type === 'bonus');
    const deductions = employeeAdjustments.filter(adj => adj.type === 'deduction');
    const totalBonuses = bonuses.reduce((sum, adj) => sum + adj.amount, 0);
    const totalDeductions = deductions.reduce((sum, adj) => sum + adj.amount, 0);
    const socialInsurance = baseSalary * 0.0975;
    const netSalary = baseSalary + totalBonuses - totalDeductions - socialInsurance;
    
    // إنشاء نافذة جديدة لعرض قسيمة الراتب
    const payslipWindow = window.open('', '_blank');
    payslipWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>قسيمة راتب - ${employee.name}</title>
            <style>
                body { font-family: 'Cairo', sans-serif; padding: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                .info { margin-bottom: 20px; }
                .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                .table th { background-color: #f2f2f2; }
                .total { font-weight: bold; font-size: 1.2em; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>قسيمة راتب</h1>
                <p>${monthNames[month - 1]} ${year}</p>
            </div>
            <div class="info">
                <p><strong>اسم الموظف:</strong> ${employee.name}</p>
                <p><strong>المنصب:</strong> ${employee.position}</p>
                <p><strong>القسم:</strong> ${employee.department}</p>
                <p><strong>تاريخ الإصدار:</strong> ${new Date().toLocaleDateString('ar-SA')}</p>
            </div>
            <table class="table">
                <tr><th>البند</th><th>المبلغ</th></tr>
                <tr><td>الراتب الأساسي</td><td>${hrSystem.formatCurrency(baseSalary)}</td></tr>
                ${bonuses.map(bonus => `<tr><td>مكافأة: ${bonus.reason}</td><td style="color: green;">${hrSystem.formatCurrency(bonus.amount)}</td></tr>`).join('')}
                ${deductions.map(deduction => `<tr><td>خصم: ${deduction.reason}</td><td style="color: red;">${hrSystem.formatCurrency(deduction.amount)}</td></tr>`).join('')}
                <tr><td>التأمينات الاجتماعية</td><td>${hrSystem.formatCurrency(socialInsurance)}</td></tr>
                <tr class="total"><td>صافي الراتب</td><td>${hrSystem.formatCurrency(netSalary)}</td></tr>
            </table>
            <div class="no-print">
                <button onclick="window.print()">طباعة</button>
                <button onclick="window.close()">إغلاق</button>
            </div>
        </body>
        </html>
    `);
    
    payslipWindow.document.close();
}

// معالجة دفع الراتب
function processPayment(employeeId) {
    const employee = hrSystem.data.employees.find(emp => emp.id === employeeId);
    if (!employee) {
        hrSystem.showAlert('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    hrSystem.showConfirmation(
        `هل أنت متأكد من معالجة دفع راتب ${employee.name}؟`,
        () => {
            // إضافة معاملة الدفع إلى السجل
            const transaction = {
                id: Date.now(),
                date: new Date().toISOString(),
                employeeId: employeeId,
                employeeName: employee.name,
                type: 'دفع راتب',
                amount: employee.salary || 0,
                reason: 'راتب شهري',
                status: 'مكتمل'
            };
            
            payrollData.transactions.push(transaction);
            savePayrollData();
            loadTransactions();
            
            hrSystem.showAlert(`تم دفع راتب ${employee.name} بنجاح`, 'success');
        }
    );
}

// تصدير كشف الرواتب
function exportPayroll() {
    const month = parseInt(document.getElementById('payrollMonth').value);
    const year = parseInt(document.getElementById('payrollYear').value);
    
    const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    const activeEmployees = hrSystem.data.employees.filter(emp => emp.status === 'نشط');
    
    const exportData = activeEmployees.map(employee => {
        const baseSalary = employee.salary || 0;
        const employeeAdjustments = payrollData.adjustments.filter(adj => 
            adj.employeeId === employee.id && adj.status === 'active'
        );
        
        const bonuses = employeeAdjustments
            .filter(adj => adj.type === 'bonus')
            .reduce((sum, adj) => sum + adj.amount, 0);
        
        const deductions = employeeAdjustments
            .filter(adj => adj.type === 'deduction')
            .reduce((sum, adj) => sum + adj.amount, 0);
        
        const socialInsurance = baseSalary * 0.0975;
        const netSalary = baseSalary + bonuses - deductions - socialInsurance;
        
        return {
            'اسم الموظف': employee.name,
            'القسم': employee.department,
            'الراتب الأساسي': baseSalary,
            'المكافآت': bonuses,
            'الخصومات': deductions,
            'التأمينات الاجتماعية': socialInsurance,
            'صافي الراتب': netSalary
        };
    });
    
    hrSystem.exportToCSV(exportData, `payroll_${monthNames[month - 1]}_${year}.csv`);
    hrSystem.showAlert('تم تصدير كشف الرواتب بنجاح', 'success');
}

// تحميل سجل المعاملات
function loadTransactions() {
    const tbody = document.getElementById('transactionsTableBody');
    tbody.innerHTML = '';
    
    // ترتيب المعاملات حسب التاريخ (الأحدث أولاً)
    const sortedTransactions = payrollData.transactions.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    // عرض آخر 10 معاملات فقط
    const recentTransactions = sortedTransactions.slice(0, 10);
    
    recentTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${hrSystem.formatDate(transaction.date)}</td>
            <td>${transaction.employeeName}</td>
            <td>${transaction.type}</td>
            <td>${hrSystem.formatCurrency(transaction.amount)}</td>
            <td>${transaction.reason}</td>
            <td><span class="status-active">${transaction.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// إدارة التأمين الصحي
function manageHealthInsurance() {
    hrSystem.showAlert('ميزة إدارة التأمين الصحي قيد التطوير', 'info');
}

// إدارة بدل المواصلات
function manageTransportation() {
    hrSystem.showAlert('ميزة إدارة بدل المواصلات قيد التطوير', 'info');
}

// إدارة بدل الوجبات
function manageMeals() {
    hrSystem.showAlert('ميزة إدارة بدل الوجبات قيد التطوير', 'info');
}

// إدارة الإجازات
function manageVacations() {
    hrSystem.showAlert('ميزة إدارة الإجازات قيد التطوير', 'info');
}