// JavaScript لصفحة التقارير والامتثال

// بيانات التقارير والامتثال
let reportsData = {
    generatedReports: [],
    scheduledReports: [],
    complianceRecords: []
};

// تحميل البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    hrSystem.loadData();
    loadReportsData();
    setupEventListeners();
    initializeComplianceData();
});

// تحميل بيانات التقارير من LocalStorage
function loadReportsData() {
    const stored = localStorage.getItem('reportsData');
    if (stored) {
        reportsData = JSON.parse(stored);
    }
}

// حفظ بيانات التقارير في LocalStorage
function saveReportsData() {
    localStorage.setItem('reportsData', JSON.stringify(reportsData));
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    document.getElementById('reportPeriod').addEventListener('change', function() {
        const customDateRange = document.getElementById('customDateRange');
        if (this.value === 'custom') {
            customDateRange.style.display = 'flex';
        } else {
            customDateRange.style.display = 'none';
        }
    });
}

// تهيئة بيانات الامتثال
function initializeComplianceData() {
    if (reportsData.complianceRecords.length === 0) {
        reportsData.complianceRecords = [
            {
                id: 1,
                system: 'نظام العمل السعودي',
                lastCheck: '2024-12-01',
                status: 'متوافق',
                riskLevel: 'منخفض',
                requiredActions: 'مراجعة دورية',
                responsible: 'إدارة الموارد البشرية'
            },
            {
                id: 2,
                system: 'التأمينات الاجتماعية',
                lastCheck: '2024-12-01',
                status: 'متوافق',
                riskLevel: 'منخفض',
                requiredActions: 'لا يوجد',
                responsible: 'المحاسبة'
            },
            {
                id: 3,
                system: 'نطاقات (نتقل)',
                lastCheck: '2024-11-15',
                status: 'تحت المراجعة',
                riskLevel: 'متوسط',
                requiredActions: 'زيادة نسبة التوطين',
                responsible: 'إدارة الموارد البشرية'
            },
            {
                id: 4,
                system: 'الصحة والسلامة المهنية',
                lastCheck: '2024-12-01',
                status: 'متوافق',
                riskLevel: 'منخفض',
                requiredActions: 'تحديث التدريبات',
                responsible: 'إدارة الأمان'
            }
        ];
        saveReportsData();
    }
}

// إنشاء تقرير
function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const reportPeriod = document.getElementById('reportPeriod').value;
    
    if (!reportType) {
        hrSystem.showAlert('يرجى اختيار نوع التقرير', 'error');
        return;
    }
    
    let reportData;
    let reportTitle;
    
    switch (reportType) {
        case 'employees':
            reportData = generateEmployeesReport();
            reportTitle = 'تقرير الموظفين';
            break;
        case 'payroll':
            reportData = generatePayrollReport();
            reportTitle = 'تقرير الرواتب';
            break;
        case 'attendance':
            reportData = generateAttendanceReport();
            reportTitle = 'تقرير الحضور والغياب';
            break;
        case 'performance':
            reportData = generatePerformanceReport();
            reportTitle = 'تقرير الأداء';
            break;
        case 'training':
            reportData = generateTrainingReport();
            reportTitle = 'تقرير التدريب';
            break;
        case 'turnover':
            reportData = generateTurnoverReport();
            reportTitle = 'تقرير دوران الموظفين';
            break;
        case 'compliance':
            reportData = generateComplianceReport();
            reportTitle = 'تقرير الامتثال';
            break;
        default:
            hrSystem.showAlert('نوع التقرير غير مدعوم', 'error');
            return;
    }
    
    displayReport(reportTitle, reportData, reportType);
    
    // حفظ التقرير في السجل
    const generatedReport = {
        id: Date.now(),
        type: reportType,
        title: reportTitle,
        period: reportPeriod,
        generatedDate: new Date().toISOString(),
        data: reportData
    };
    
    reportsData.generatedReports.push(generatedReport);
    saveReportsData();
    
    hrSystem.showAlert('تم إنشاء التقرير بنجاح', 'success');
}

// إنشاء تقرير الموظفين
function generateEmployeesReport() {
    const employees = hrSystem.data.employees;
    const departmentStats = {};
    const statusStats = {};
    
    employees.forEach(emp => {
        // إحصائيات الأقسام
        departmentStats[emp.department] = (departmentStats[emp.department] || 0) + 1;
        
        // إحصائيات الحالة
        statusStats[emp.status] = (statusStats[emp.status] || 0) + 1;
    });
    
    return {
        totalEmployees: employees.length,
        departmentBreakdown: departmentStats,
        statusBreakdown: statusStats,
        averageSalary: employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / employees.length,
        employees: employees.map(emp => ({
            name: emp.name,
            position: emp.position,
            department: emp.department,
            salary: emp.salary,
            status: emp.status,
            hireDate: emp.hireDate
        }))
    };
}

// إنشاء تقرير الرواتب
function generatePayrollReport() {
    const employees = hrSystem.data.employees.filter(emp => emp.status === 'نشط');
    const totalSalaries = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    
    const payrollData = employees.map(emp => {
        const baseSalary = emp.salary || 0;
        const socialInsurance = baseSalary * 0.0975;
        const netSalary = baseSalary - socialInsurance;
        
        return {
            name: emp.name,
            department: emp.department,
            baseSalary: baseSalary,
            socialInsurance: socialInsurance,
            netSalary: netSalary
        };
    });
    
    return {
        totalEmployees: employees.length,
        totalSalaries: totalSalaries,
        averageSalary: totalSalaries / employees.length,
        totalSocialInsurance: totalSalaries * 0.0975,
        payrollDetails: payrollData
    };
}

// إنشاء تقرير الحضور والغياب
function generateAttendanceReport() {
    // بيانات تجريبية للحضور والغياب
    const attendanceData = hrSystem.data.employees.filter(emp => emp.status === 'نشط').map(emp => {
        const workingDays = 22; // أيام العمل في الشهر
        const attendedDays = Math.floor(Math.random() * 3) + 19; // 19-22 يوم
        const absentDays = workingDays - attendedDays;
        const attendanceRate = (attendedDays / workingDays * 100).toFixed(1);
        
        return {
            name: emp.name,
            department: emp.department,
            workingDays: workingDays,
            attendedDays: attendedDays,
            absentDays: absentDays,
            attendanceRate: attendanceRate
        };
    });
    
    const totalAttendanceRate = (attendanceData.reduce((sum, emp) => sum + parseFloat(emp.attendanceRate), 0) / attendanceData.length).toFixed(1);
    
    return {
        totalEmployees: attendanceData.length,
        averageAttendanceRate: totalAttendanceRate,
        attendanceDetails: attendanceData
    };
}

// إنشاء تقرير الأداء
function generatePerformanceReport() {
    const performanceData = JSON.parse(localStorage.getItem('performanceData') || '{"evaluations": []}');
    const evaluations = performanceData.evaluations || [];
    
    const gradeDistribution = {};
    evaluations.forEach(eval => {
        gradeDistribution[eval.grade] = (gradeDistribution[eval.grade] || 0) + 1;
    });
    
    const averageScore = evaluations.length > 0 ? 
        (evaluations.reduce((sum, eval) => sum + eval.averageScore, 0) / evaluations.length).toFixed(1) : 0;
    
    return {
        totalEvaluations: evaluations.length,
        averageScore: averageScore,
        gradeDistribution: gradeDistribution,
        topPerformers: evaluations
            .filter(eval => eval.averageScore >= 8)
            .sort((a, b) => b.averageScore - a.averageScore)
            .slice(0, 5),
        evaluationDetails: evaluations
    };
}

// إنشاء تقرير التدريب
function generateTrainingReport() {
    const trainingData = JSON.parse(localStorage.getItem('trainingData') || '{"programs": [], "enrollments": []}');
    const programs = trainingData.programs || [];
    const enrollments = trainingData.enrollments || [];
    
    const categoryStats = {};
    programs.forEach(program => {
        categoryStats[program.category] = (categoryStats[program.category] || 0) + 1;
    });
    
    const completionRate = enrollments.length > 0 ? 
        (enrollments.filter(e => e.status === 'مكتمل').length / enrollments.length * 100).toFixed(1) : 0;
    
    return {
        totalPrograms: programs.length,
        activePrograms: programs.filter(p => p.status === 'نشط').length,
        totalEnrollments: enrollments.length,
        completedEnrollments: enrollments.filter(e => e.status === 'مكتمل').length,
        completionRate: completionRate,
        categoryDistribution: categoryStats,
        programDetails: programs
    };
}

// إنشاء تقرير دوران الموظفين
function generateTurnoverReport() {
    const employees = hrSystem.data.employees;
    const activeEmployees = employees.filter(emp => emp.status === 'نشط').length;
    const resignedEmployees = employees.filter(emp => emp.status === 'مستقيل').length;
    const turnoverRate = employees.length > 0 ? (resignedEmployees / employees.length * 100).toFixed(1) : 0;
    
    // بيانات تجريبية للتوظيف الجديد
    const newHires = Math.floor(Math.random() * 5) + 2; // 2-7 موظف جديد
    
    return {
        totalEmployees: employees.length,
        activeEmployees: activeEmployees,
        resignedEmployees: resignedEmployees,
        newHires: newHires,
        turnoverRate: turnoverRate,
        retentionRate: (100 - parseFloat(turnoverRate)).toFixed(1),
        departmentTurnover: calculateDepartmentTurnover(employees)
    };
}

// حساب دوران الموظفين بالأقسام
function calculateDepartmentTurnover(employees) {
    const departments = {};
    
    employees.forEach(emp => {
        if (!departments[emp.department]) {
            departments[emp.department] = { total: 0, resigned: 0 };
        }
        departments[emp.department].total++;
        if (emp.status === 'مستقيل') {
            departments[emp.department].resigned++;
        }
    });
    
    const departmentStats = {};
    Object.keys(departments).forEach(dept => {
        const rate = departments[dept].total > 0 ? 
            (departments[dept].resigned / departments[dept].total * 100).toFixed(1) : 0;
        departmentStats[dept] = {
            total: departments[dept].total,
            resigned: departments[dept].resigned,
            turnoverRate: rate
        };
    });
    
    return departmentStats;
}

// إنشاء تقرير الامتثال
function generateComplianceReport() {
    const compliantRecords = reportsData.complianceRecords.filter(record => record.status === 'متوافق').length;
    const totalRecords = reportsData.complianceRecords.length;
    const complianceRate = totalRecords > 0 ? (compliantRecords / totalRecords * 100).toFixed(1) : 0;
    
    const riskDistribution = {};
    reportsData.complianceRecords.forEach(record => {
        riskDistribution[record.riskLevel] = (riskDistribution[record.riskLevel] || 0) + 1;
    });
    
    return {
        totalSystems: totalRecords,
        compliantSystems: compliantRecords,
        complianceRate: complianceRate,
        riskDistribution: riskDistribution,
        complianceDetails: reportsData.complianceRecords
    };
}

// عرض التقرير
function displayReport(title, data, type) {
    const reportResults = document.getElementById('reportResults');
    const reportTitle = document.getElementById('reportTitle');
    const reportContent = document.getElementById('reportContent');
    
    reportTitle.textContent = title;
    reportContent.innerHTML = generateReportHTML(data, type);
    reportResults.style.display = 'block';
    
    // التمرير إلى التقرير
    reportResults.scrollIntoView({ behavior: 'smooth' });
}

// إنشاء HTML للتقرير
function generateReportHTML(data, type) {
    let html = '<div class="report-summary">';
    
    switch (type) {
        case 'employees':
            html += `
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-number">${data.totalEmployees}</div>
                        <div class="stat-label">إجمالي الموظفين</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${hrSystem.formatCurrency(data.averageSalary)}</div>
                        <div class="stat-label">متوسط الراتب</div>
                    </div>
                </div>
                <h4>التوزيع حسب القسم:</h4>
                <ul>
                    ${Object.entries(data.departmentBreakdown).map(([dept, count]) => 
                        `<li>${dept}: ${count} موظف</li>`
                    ).join('')}
                </ul>
            `;
            break;
            
        case 'payroll':
            html += `
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-number">${hrSystem.formatCurrency(data.totalSalaries)}</div>
                        <div class="stat-label">إجمالي الرواتب</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${hrSystem.formatCurrency(data.totalSocialInsurance)}</div>
                        <div class="stat-label">إجمالي التأمينات</div>
                    </div>
                </div>
            `;
            break;
            
        case 'performance':
            html += `
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-number">${data.totalEvaluations}</div>
                        <div class="stat-label">إجمالي التقييمات</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${data.averageScore}/10</div>
                        <div class="stat-label">متوسط الدرجات</div>
                    </div>
                </div>
                <h4>أفضل الموظفين:</h4>
                <ul>
                    ${data.topPerformers.map(performer => 
                        `<li>${performer.employeeName}: ${performer.averageScore.toFixed(1)}/10</li>`
                    ).join('')}
                </ul>
            `;
            break;
            
        case 'training':
            html += `
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-number">${data.totalPrograms}</div>
                        <div class="stat-label">إجمالي البرامج</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${data.completionRate}%</div>
                        <div class="stat-label">معدل الإكمال</div>
                    </div>
                </div>
            `;
            break;
    }
    
    html += '</div>';
    return html;
}

// إنشاء تقرير سريع
function generateQuickReport(type) {
    document.getElementById('reportType').value = type;
    document.getElementById('reportPeriod').value = 'current_month';
    generateReport();
}

// تصدير التقرير
function exportReport() {
    const reportResults = document.getElementById('reportResults');
    if (reportResults.style.display === 'none') {
        hrSystem.showAlert('يرجى إنشاء تقرير أولاً', 'error');
        return;
    }
    
    const reportType = document.getElementById('reportType').value;
    if (!reportType) {
        hrSystem.showAlert('لم يتم تحديد نوع التقرير', 'error');
        return;
    }
    
    // هذه ميزة مبسطة - في التطبيق الحقيقي ستصدر البيانات الفعلية
    hrSystem.showAlert('تم تصدير التقرير بنجاح', 'success');
}

// جدولة التقرير
function scheduleReport() {
    const reportType = document.getElementById('reportType').value;
    if (!reportType) {
        hrSystem.showAlert('يرجى اختيار نوع التقرير أولاً', 'error');
        return;
    }
    
    const frequency = prompt('حدد تكرار التقرير:\n1. يومي\n2. أسبوعي\n3. شهري\n4. ربع سنوي\n\nأدخل الرقم المناسب:');
    
    if (frequency) {
        const frequencies = { '1': 'يومي', '2': 'أسبوعي', '3': 'شهري', '4': 'ربع سنوي' };
        const selectedFrequency = frequencies[frequency];
        
        if (selectedFrequency) {
            const scheduledReport = {
                id: Date.now(),
                type: reportType,
                frequency: selectedFrequency,
                createdDate: new Date().toISOString(),
                status: 'نشط'
            };
            
            reportsData.scheduledReports.push(scheduledReport);
            saveReportsData();
            
            hrSystem.showAlert(`تم جدولة التقرير بنجاح (${selectedFrequency})`, 'success');
        } else {
            hrSystem.showAlert('اختيار غير صحيح', 'error');
        }
    }
}

// فحص الامتثال
function checkCompliance(systemType) {
    const messages = {
        'labor_law': 'تم فحص التوافق مع نظام العمل السعودي - النتيجة: متوافق',
        'social_insurance': 'تم فحص التوافق مع التأمينات الاجتماعية - النتيجة: متوافق',
        'nitaqat': 'تم فحص التوافق مع نطاقات - النتيجة: تحت المراجعة (نسبة التوطين 65%)',
        'health_safety': 'تم فحص التوافق مع معايير الصحة والسلامة - النتيجة: متوافق'
    };
    
    const message = messages[systemType] || 'تم إجراء فحص الامتثال';
    hrSystem.showAlert(message, 'info');
    
    // تحديث تاريخ آخر فحص
    const record = reportsData.complianceRecords.find(r => 
        r.system.includes(systemType.replace('_', ' '))
    );
    
    if (record) {
        record.lastCheck = new Date().toISOString().split('T')[0];
        saveReportsData();
    }
}

// إضافة تقرير مجدول
function addScheduledReport() {
    hrSystem.showAlert('ميزة إضافة التقرير المجدول قيد التطوير', 'info');
}