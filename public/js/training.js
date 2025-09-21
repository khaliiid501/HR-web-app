// JavaScript لصفحة التدريب والتطوير

// بيانات التدريب والتطوير
let trainingData = {
    programs: [],
    enrollments: [],
    evaluations: [],
    certificates: []
};

// تحميل البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    hrSystem.loadData();
    loadTrainingData();
    setupEventListeners();
    populateEmployeeSelects();
    updateTrainingStats();
    renderTrainingTable();
    renderEnrollmentsTable();
    renderCertificatesTable();
});

// تحميل بيانات التدريب من LocalStorage
function loadTrainingData() {
    const stored = localStorage.getItem('trainingData');
    if (stored) {
        trainingData = JSON.parse(stored);
    }
    
    // إضافة بيانات تجريبية إذا لم تكن موجودة
    if (trainingData.programs.length === 0) {
        trainingData.programs = [
            {
                id: 1,
                title: 'دورة إدارة المشاريع',
                category: 'إداري',
                description: 'دورة شاملة في أساسيات إدارة المشاريع وأدواتها',
                startDate: '2024-12-15',
                endDate: '2024-12-20',
                duration: 40,
                capacity: 20,
                instructor: 'د. أحمد الخبير',
                location: 'قاعة التدريب الرئيسية',
                cost: 2000,
                type: 'حضوري',
                status: 'نشط',
                participants: 0
            },
            {
                id: 2,
                title: 'ورشة تطوير المهارات القيادية',
                category: 'قيادي',
                description: 'تطوير مهارات القيادة والإدارة',
                startDate: '2024-12-10',
                endDate: '2024-12-12',
                duration: 24,
                capacity: 15,
                instructor: 'مركز التطوير الإداري',
                location: 'أونلاين',
                cost: 1500,
                type: 'أونلاين',
                status: 'نشط',
                participants: 0
            }
        ];
        
        trainingData.enrollments = [
            {
                id: 1,
                programId: 1,
                programTitle: 'دورة إدارة المشاريع',
                employeeId: 1,
                employeeName: 'أحمد محمد',
                enrollmentDate: '2024-11-15',
                status: 'مسجل',
                attendanceRate: 0,
                grade: 0
            }
        ];
    }
}

// حفظ بيانات التدريب في LocalStorage
function saveTrainingData() {
    localStorage.setItem('trainingData', JSON.stringify(trainingData));
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    document.getElementById('trainingForm').addEventListener('submit', handleTrainingSubmit);
    document.getElementById('enrollmentForm').addEventListener('submit', handleEnrollmentSubmit);
    document.getElementById('evaluationForm').addEventListener('submit', handleEvaluationSubmit);
}

// ملء قوائم الموظفين والبرامج
function populateEmployeeSelects() {
    const employeeSelects = ['employeeMultiSelect', 'evalEmployeeSelect'];
    
    employeeSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = '';
        
        hrSystem.data.employees.filter(emp => emp.status === 'نشط').forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.id;
            option.textContent = employee.name;
            select.appendChild(option);
        });
    });
    
    // ملء قوائم البرامج
    populateProgramSelects();
}

// ملء قوائم البرامج
function populateProgramSelects() {
    const programSelects = ['programSelect', 'evalProgramSelect'];
    
    programSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">اختر البرنامج</option>';
        
        trainingData.programs.filter(program => program.status === 'نشط').forEach(program => {
            const option = document.createElement('option');
            option.value = program.id;
            option.textContent = program.title;
            select.appendChild(option);
        });
    });
}

// تحديث إحصائيات التدريب
function updateTrainingStats() {
    const totalPrograms = trainingData.programs.length;
    const activePrograms = trainingData.programs.filter(program => program.status === 'نشط').length;
    const totalParticipants = trainingData.enrollments.filter(enrollment => enrollment.status !== 'ملغي').length;
    const completedCourses = trainingData.enrollments.filter(enrollment => enrollment.status === 'مكتمل').length;
    
    document.getElementById('totalPrograms').textContent = totalPrograms;
    document.getElementById('activePrograms').textContent = activePrograms;
    document.getElementById('totalParticipants').textContent = totalParticipants;
    document.getElementById('completedCourses').textContent = completedCourses;
}

// معالجة إضافة برنامج تدريبي
function handleTrainingSubmit(e) {
    e.preventDefault();
    
    const program = {
        id: Date.now(),
        title: document.getElementById('trainingTitle').value,
        category: document.getElementById('trainingCategory').value,
        description: document.getElementById('trainingDescription').value,
        startDate: document.getElementById('trainingStartDate').value,
        endDate: document.getElementById('trainingEndDate').value,
        duration: parseInt(document.getElementById('trainingDuration').value),
        capacity: parseInt(document.getElementById('trainingCapacity').value),
        instructor: document.getElementById('trainingInstructor').value,
        location: document.getElementById('trainingLocation').value,
        cost: parseFloat(document.getElementById('trainingCost').value) || 0,
        type: document.getElementById('trainingType').value,
        status: 'نشط',
        participants: 0,
        dateCreated: new Date().toISOString().split('T')[0]
    };
    
    // التحقق من صحة التواريخ
    if (new Date(program.startDate) >= new Date(program.endDate)) {
        hrSystem.showAlert('تاريخ النهاية يجب أن يكون بعد تاريخ البداية', 'error');
        return;
    }
    
    trainingData.programs.push(program);
    saveTrainingData();
    
    updateTrainingStats();
    renderTrainingTable();
    populateProgramSelects();
    hrSystem.clearForm('trainingForm');
    
    hrSystem.showAlert('تم إضافة البرنامج التدريبي بنجاح', 'success');
}

// معالجة تسجيل الموظفين
function handleEnrollmentSubmit(e) {
    e.preventDefault();
    
    const programId = parseInt(document.getElementById('programSelect').value);
    const selectedEmployees = Array.from(document.getElementById('employeeMultiSelect').selectedOptions)
        .map(option => parseInt(option.value));
    
    if (selectedEmployees.length === 0) {
        hrSystem.showAlert('يرجى اختيار موظف واحد على الأقل', 'error');
        return;
    }
    
    const program = trainingData.programs.find(p => p.id === programId);
    if (!program) {
        hrSystem.showAlert('لم يتم العثور على البرنامج', 'error');
        return;
    }
    
    // التحقق من السعة المتاحة
    const currentEnrollments = trainingData.enrollments.filter(e => 
        e.programId === programId && e.status !== 'ملغي'
    ).length;
    
    if (currentEnrollments + selectedEmployees.length > program.capacity) {
        hrSystem.showAlert('عدد المشاركين يتجاوز السعة المتاحة للبرنامج', 'error');
        return;
    }
    
    // تسجيل الموظفين
    selectedEmployees.forEach(employeeId => {
        const employee = hrSystem.data.employees.find(emp => emp.id === employeeId);
        
        // التحقق من عدم التسجيل المسبق
        const existingEnrollment = trainingData.enrollments.find(e => 
            e.programId === programId && e.employeeId === employeeId && e.status !== 'ملغي'
        );
        
        if (!existingEnrollment) {
            const enrollment = {
                id: Date.now() + employeeId,
                programId: programId,
                programTitle: program.title,
                employeeId: employeeId,
                employeeName: employee.name,
                enrollmentDate: new Date().toISOString().split('T')[0],
                status: 'مسجل',
                attendanceRate: 0,
                grade: 0
            };
            
            trainingData.enrollments.push(enrollment);
        }
    });
    
    // تحديث عدد المشاركين في البرنامج
    program.participants = trainingData.enrollments.filter(e => 
        e.programId === programId && e.status !== 'ملغي'
    ).length;
    
    saveTrainingData();
    updateTrainingStats();
    renderTrainingTable();
    renderEnrollmentsTable();
    hrSystem.clearForm('enrollmentForm');
    
    hrSystem.showAlert(`تم تسجيل ${selectedEmployees.length} موظف في البرنامج بنجاح`, 'success');
}

// معالجة تقييم المتدربين
function handleEvaluationSubmit(e) {
    e.preventDefault();
    
    const programId = parseInt(document.getElementById('evalProgramSelect').value);
    const employeeId = parseInt(document.getElementById('evalEmployeeSelect').value);
    const attendanceRate = parseInt(document.getElementById('attendanceRate').value);
    const finalGrade = parseInt(document.getElementById('finalGrade').value);
    const feedback = document.getElementById('feedback').value;
    
    // البحث عن التسجيل
    const enrollment = trainingData.enrollments.find(e => 
        e.programId === programId && e.employeeId === employeeId
    );
    
    if (!enrollment) {
        hrSystem.showAlert('لم يتم العثور على تسجيل للموظف في هذا البرنامج', 'error');
        return;
    }
    
    // تحديث بيانات التسجيل
    enrollment.attendanceRate = attendanceRate;
    enrollment.grade = finalGrade;
    enrollment.feedback = feedback;
    enrollment.status = finalGrade >= 60 ? 'مكتمل' : 'راسب';
    enrollment.completionDate = new Date().toISOString().split('T')[0];
    
    // إنشاء شهادة إذا نجح
    if (finalGrade >= 60) {
        const certificate = {
            id: Date.now(),
            employeeId: employeeId,
            employeeName: enrollment.employeeName,
            programId: programId,
            programTitle: enrollment.programTitle,
            completionDate: enrollment.completionDate,
            grade: finalGrade,
            certificateNumber: `CERT-${Date.now()}`,
            status: 'صادرة'
        };
        
        trainingData.certificates.push(certificate);
    }
    
    saveTrainingData();
    updateTrainingStats();
    renderEnrollmentsTable();
    renderCertificatesTable();
    hrSystem.clearForm('evaluationForm');
    
    hrSystem.showAlert('تم حفظ التقييم بنجاح', 'success');
}

// عرض جدول البرامج التدريبية
function renderTrainingTable() {
    const tbody = document.getElementById('trainingTableBody');
    tbody.innerHTML = '';
    
    trainingData.programs.forEach(program => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${program.title}</td>
            <td>${program.category}</td>
            <td>${program.instructor}</td>
            <td>${hrSystem.formatDate(program.startDate)}</td>
            <td>${program.duration} ساعة</td>
            <td>${program.participants}/${program.capacity}</td>
            <td><span class="status-${program.status === 'نشط' ? 'active' : program.status === 'مكتمل' ? 'active' : 'inactive'}">${program.status}</span></td>
            <td>
                <button class="btn btn-primary" onclick="viewProgramDetails(${program.id})" style="font-size: 0.8rem; padding: 0.4rem 0.8rem; margin-left: 5px;">عرض</button>
                <button class="btn btn-success" onclick="editProgram(${program.id})" style="font-size: 0.8rem; padding: 0.4rem 0.8rem; margin-left: 5px;">تعديل</button>
                <button class="btn btn-danger" onclick="deleteProgram(${program.id})" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">حذف</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// عرض جدول التسجيلات
function renderEnrollmentsTable() {
    const tbody = document.getElementById('enrollmentsTableBody');
    tbody.innerHTML = '';
    
    trainingData.enrollments.forEach(enrollment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${enrollment.employeeName}</td>
            <td>${enrollment.programTitle}</td>
            <td>${hrSystem.formatDate(enrollment.enrollmentDate)}</td>
            <td><span class="status-${enrollment.status === 'مكتمل' ? 'active' : enrollment.status === 'مسجل' ? 'pending' : 'inactive'}">${enrollment.status}</span></td>
            <td>${enrollment.attendanceRate}%</td>
            <td>${enrollment.grade || '-'}</td>
            <td>
                <button class="btn btn-primary" onclick="updateEnrollmentStatus(${enrollment.id})" style="font-size: 0.8rem; padding: 0.4rem 0.8rem; margin-left: 5px;">تحديث</button>
                <button class="btn btn-danger" onclick="cancelEnrollment(${enrollment.id})" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">إلغاء</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// عرض جدول الشهادات
function renderCertificatesTable() {
    const tbody = document.getElementById('certificatesTableBody');
    tbody.innerHTML = '';
    
    trainingData.certificates.forEach(certificate => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${certificate.employeeName}</td>
            <td>${certificate.programTitle}</td>
            <td>${hrSystem.formatDate(certificate.completionDate)}</td>
            <td>${certificate.grade}</td>
            <td>${certificate.certificateNumber}</td>
            <td><span class="status-active">${certificate.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// عرض تفاصيل البرنامج
function viewProgramDetails(programId) {
    const program = trainingData.programs.find(p => p.id === programId);
    if (!program) {
        hrSystem.showAlert('لم يتم العثور على البرنامج', 'error');
        return;
    }
    
    const enrollments = trainingData.enrollments.filter(e => e.programId === programId);
    
    const detailsWindow = window.open('', '_blank');
    detailsWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>تفاصيل البرنامج التدريبي - ${program.title}</title>
            <style>
                body { font-family: 'Cairo', sans-serif; padding: 20px; line-height: 1.6; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                .section { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
                .info-item { background: #f8f9fa; padding: 10px; border-radius: 5px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                th { background-color: #f2f2f2; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${program.title}</h1>
                <p>تفاصيل البرنامج التدريبي</p>
            </div>
            
            <div class="section">
                <h3>معلومات البرنامج</h3>
                <div class="info-grid">
                    <div class="info-item"><strong>التصنيف:</strong> ${program.category}</div>
                    <div class="info-item"><strong>المدرب:</strong> ${program.instructor}</div>
                    <div class="info-item"><strong>تاريخ البداية:</strong> ${hrSystem.formatDate(program.startDate)}</div>
                    <div class="info-item"><strong>تاريخ النهاية:</strong> ${hrSystem.formatDate(program.endDate)}</div>
                    <div class="info-item"><strong>المدة:</strong> ${program.duration} ساعة</div>
                    <div class="info-item"><strong>السعة:</strong> ${program.capacity} مشارك</div>
                    <div class="info-item"><strong>المكان:</strong> ${program.location}</div>
                    <div class="info-item"><strong>التكلفة:</strong> ${hrSystem.formatCurrency(program.cost)}</div>
                </div>
            </div>
            
            <div class="section">
                <h3>وصف البرنامج</h3>
                <p>${program.description}</p>
            </div>
            
            <div class="section">
                <h3>المشاركون المسجلون (${enrollments.length})</h3>
                <table>
                    <thead>
                        <tr>
                            <th>اسم المشارك</th>
                            <th>تاريخ التسجيل</th>
                            <th>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${enrollments.map(e => `
                            <tr>
                                <td>${e.employeeName}</td>
                                <td>${hrSystem.formatDate(e.enrollmentDate)}</td>
                                <td>${e.status}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="no-print" style="text-align: center; margin-top: 30px;">
                <button onclick="window.print()" style="padding: 10px 20px; margin: 5px;">طباعة</button>
                <button onclick="window.close()" style="padding: 10px 20px; margin: 5px;">إغلاق</button>
            </div>
        </body>
        </html>
    `);
    
    detailsWindow.document.close();
}

// حذف برنامج
function deleteProgram(programId) {
    const program = trainingData.programs.find(p => p.id === programId);
    if (!program) {
        hrSystem.showAlert('لم يتم العثور على البرنامج', 'error');
        return;
    }
    
    // التحقق من وجود تسجيلات
    const enrollments = trainingData.enrollments.filter(e => e.programId === programId);
    if (enrollments.length > 0) {
        hrSystem.showAlert('لا يمكن حذف البرنامج لوجود موظفين مسجلين فيه', 'error');
        return;
    }
    
    hrSystem.showConfirmation(
        `هل أنت متأكد من حذف البرنامج "${program.title}"؟`,
        () => {
            const index = trainingData.programs.findIndex(p => p.id === programId);
            trainingData.programs.splice(index, 1);
            saveTrainingData();
            
            updateTrainingStats();
            renderTrainingTable();
            populateProgramSelects();
            hrSystem.showAlert('تم حذف البرنامج بنجاح', 'success');
        }
    );
}

// إنشاء الشهادات
function generateCertificates() {
    const completedEnrollments = trainingData.enrollments.filter(e => 
        e.status === 'مكتمل' && e.grade >= 60
    );
    
    if (completedEnrollments.length === 0) {
        hrSystem.showAlert('لا توجد دورات مكتملة لإنشاء شهادات', 'info');
        return;
    }
    
    hrSystem.showAlert(`تم إنشاء ${completedEnrollments.length} شهادة بنجاح`, 'success');
}

// تصدير تقرير التدريب
function exportTrainingReport() {
    const reportData = trainingData.programs.map(program => {
        const enrollments = trainingData.enrollments.filter(e => e.programId === program.id);
        return {
            'اسم البرنامج': program.title,
            'التصنيف': program.category,
            'المدرب': program.instructor,
            'تاريخ البداية': program.startDate,
            'المدة': program.duration + ' ساعة',
            'عدد المشاركين': enrollments.length,
            'المكتملون': enrollments.filter(e => e.status === 'مكتمل').length,
            'التكلفة': program.cost
        };
    });
    
    hrSystem.exportToCSV(reportData, 'training_report.csv');
    hrSystem.showAlert('تم تصدير تقرير التدريب بنجاح', 'success');
}

// عرض تقويم التدريب
function viewTrainingCalendar() {
    hrSystem.showAlert('ميزة تقويم التدريب قيد التطوير', 'info');
}

// تحديث حالة التسجيل
function updateEnrollmentStatus(enrollmentId) {
    hrSystem.showAlert('ميزة تحديث حالة التسجيل قيد التطوير', 'info');
}

// إلغاء التسجيل
function cancelEnrollment(enrollmentId) {
    const enrollment = trainingData.enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) {
        hrSystem.showAlert('لم يتم العثور على التسجيل', 'error');
        return;
    }
    
    hrSystem.showConfirmation(
        `هل أنت متأكد من إلغاء تسجيل ${enrollment.employeeName} في برنامج ${enrollment.programTitle}؟`,
        () => {
            enrollment.status = 'ملغي';
            
            // تحديث عدد المشاركين في البرنامج
            const program = trainingData.programs.find(p => p.id === enrollment.programId);
            if (program) {
                program.participants = trainingData.enrollments.filter(e => 
                    e.programId === enrollment.programId && e.status !== 'ملغي'
                ).length;
            }
            
            saveTrainingData();
            updateTrainingStats();
            renderTrainingTable();
            renderEnrollmentsTable();
            hrSystem.showAlert('تم إلغاء التسجيل بنجاح', 'success');
        }
    );
}

// تعديل برنامج
function editProgram(programId) {
    hrSystem.showAlert('ميزة تعديل البرنامج قيد التطوير', 'info');
}