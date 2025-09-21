// بيانات تجريبية للنظام
const hrData = {
    employees: [
        { id: 1, name: 'أحمد محمد', position: 'محاسب', department: 'المحاسبة', status: 'نشط', salary: 5000 },
        { id: 2, name: 'سارة أحمد', position: 'مديرة موارد بشرية', department: 'الموارد البشرية', status: 'نشط', salary: 8000 },
        { id: 3, name: 'محمد علي', position: 'مطور برمجيات', department: 'تقنية المعلومات', status: 'نشط', salary: 7000 },
        { id: 4, name: 'فاطمة حسن', position: 'مصممة جرافيك', department: 'التسويق', status: 'نشط', salary: 4500 }
    ],
    
    trainings: [
        { id: 1, title: 'دورة إدارة المشاريع', participants: 15, status: 'نشط' },
        { id: 2, title: 'ورشة تطوير المهارات القيادية', participants: 8, status: 'نشط' },
        { id: 3, title: 'تدريب على أنظمة الحاسوب', participants: 12, status: 'مكتمل' }
    ],
    
    evaluations: [
        { id: 1, employeeId: 1, employeeName: 'أحمد محمد', quarter: 'Q4 2024', status: 'معلق' },
        { id: 2, employeeId: 2, employeeName: 'سارة أحمد', quarter: 'Q4 2024', status: 'معلق' },
        { id: 3, employeeId: 3, employeeName: 'محمد علي', quarter: 'Q3 2024', status: 'مكتمل' }
    ],
    
    payroll: {
        totalThisMonth: 24500,
        lastMonthTotal: 23800,
        averageSalary: 6125
    }
};

// حفظ البيانات في LocalStorage
function saveData() {
    localStorage.setItem('hrData', JSON.stringify(hrData));
}

// تحميل البيانات من LocalStorage
function loadData() {
    const stored = localStorage.getItem('hrData');
    if (stored) {
        Object.assign(hrData, JSON.parse(stored));
    }
}

// تحديث الإحصائيات في الصفحة الرئيسية
function updateDashboardStats() {
    const totalEmployeesElement = document.getElementById('totalEmployees');
    const activeTrainingsElement = document.getElementById('activeTrainings');
    const pendingEvaluationsElement = document.getElementById('pendingEvaluations');
    const thisMonthPayrollElement = document.getElementById('thisMonthPayroll');
    
    if (totalEmployeesElement) {
        totalEmployeesElement.textContent = hrData.employees.filter(emp => emp.status === 'نشط').length;
    }
    
    if (activeTrainingsElement) {
        activeTrainingsElement.textContent = hrData.trainings.filter(training => training.status === 'نشط').length;
    }
    
    if (pendingEvaluationsElement) {
        pendingEvaluationsElement.textContent = hrData.evaluations.filter(eval => eval.status === 'معلق').length;
    }
    
    if (thisMonthPayrollElement) {
        thisMonthPayrollElement.textContent = hrData.payroll.totalThisMonth.toLocaleString() + ' ريال';
    }
}

// تطبيق التأثيرات المرئية
function applyAnimations() {
    const elements = document.querySelectorAll('.feature-card, .stat-item, .card');
    elements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.1}s`;
        element.classList.add('fade-in');
    });
}

// تحديث حالة التنقل النشط
function updateActiveNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// إنشاء عنصر تحميل
function createLoadingElement() {
    const loading = document.createElement('div');
    loading.className = 'loading';
    return loading;
}

// عرض رسالة تأكيد
function showConfirmation(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// عرض رسالة تنبيه
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        z-index: 10000;
        max-width: 300px;
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
    `;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// تنسيق التاريخ
function formatDate(date) {
    return new Date(date).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// تنسيق العملة
function formatCurrency(amount) {
    return amount.toLocaleString('ar-SA') + ' ريال';
}

// تصدير البيانات إلى CSV
function exportToCSV(data, filename) {
    const csvContent = "data:text/csv;charset=utf-8," 
        + data.map(e => Object.values(e).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// البحث في البيانات
function searchData(data, searchTerm) {
    if (!searchTerm) return data;
    
    return data.filter(item => {
        return Object.values(item).some(value => 
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
    });
}

// ترتيب البيانات
function sortData(data, column, direction = 'asc') {
    return [...data].sort((a, b) => {
        const aVal = a[column];
        const bVal = b[column];
        
        if (direction === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
}

// التحقق من صحة البريد الإلكتروني
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// التحقق من صحة رقم الهاتف السعودي
function validateSaudiPhone(phone) {
    const re = /^(\+966|966|0)?5[0-9]{8}$/;
    return re.test(phone);
}

// تنظيف النماذج
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
    }
}

// إضافة مستمعي الأحداث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateDashboardStats();
    updateActiveNavigation();
    applyAnimations();
    
    // إضافة مستمع لحفظ البيانات عند إغلاق النافذة
    window.addEventListener('beforeunload', saveData);
});

// تصدير الوظائف للاستخدام في الصفحات الأخرى
window.hrSystem = {
    data: hrData,
    saveData,
    loadData,
    updateDashboardStats,
    showAlert,
    showConfirmation,
    formatDate,
    formatCurrency,
    exportToCSV,
    searchData,
    sortData,
    validateEmail,
    validateSaudiPhone,
    clearForm
};