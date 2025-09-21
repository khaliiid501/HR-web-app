// JavaScript لصفحة تقييم الأداء

// بيانات الأداء والأهداف
let performanceData = {
    evaluations: [],
    goals: []
};

// تحميل البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    hrSystem.loadData();
    loadPerformanceData();
    setupEventListeners();
    populateEmployeeSelects();
    updatePerformanceStats();
    renderEvaluationsTable();
    renderGoalsTable();
    updatePerformanceAnalysis();
});

// تحميل بيانات الأداء من LocalStorage
function loadPerformanceData() {
    const stored = localStorage.getItem('performanceData');
    if (stored) {
        performanceData = JSON.parse(stored);
    }
    
    // إضافة بيانات تجريبية إذا لم تكن موجودة
    if (performanceData.evaluations.length === 0) {
        performanceData.evaluations = [
            {
                id: 1,
                employeeId: 1,
                employeeName: 'أحمد محمد',
                period: 'Q3 2024',
                qualityScore: 8,
                productivityScore: 9,
                teamworkScore: 7,
                communicationScore: 8,
                initiativeScore: 8,
                punctualityScore: 9,
                totalScore: 49,
                grade: 'ممتاز',
                strengths: 'إنتاجية عالية، التزام بالمواعيد',
                improvements: 'تحسين العمل الجماعي',
                goals: 'زيادة مهارات القيادة',
                date: '2024-10-15',
                status: 'مكتمل'
            }
        ];
        
        performanceData.goals = [
            {
                id: 1,
                employeeId: 1,
                employeeName: 'أحمد محمد',
                description: 'إتمام دورة إدارة المشاريع',
                priority: 'عالية',
                category: 'مهارات',
                deadline: '2024-12-31',
                status: 'قيد التنفيذ',
                progress: 60
            }
        ];
    }
}

// حفظ بيانات الأداء في LocalStorage
function savePerformanceData() {
    localStorage.setItem('performanceData', JSON.stringify(performanceData));
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    document.getElementById('evaluationForm').addEventListener('submit', handleEvaluationSubmit);
    document.getElementById('goalForm').addEventListener('submit', handleGoalSubmit);
}

// ملء قوائم الموظفين
function populateEmployeeSelects() {
    const selects = ['evalEmployeeSelect', 'goalEmployeeSelect'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">اختر الموظف</option>';
        
        hrSystem.data.employees.filter(emp => emp.status === 'نشط').forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.id;
            option.textContent = employee.name;
            select.appendChild(option);
        });
    });
}

// تحديث إحصائيات الأداء
function updatePerformanceStats() {
    const totalEvals = performanceData.evaluations.length;
    const pendingEvals = performanceData.evaluations.filter(eval => eval.status === 'معلق').length;
    const completedEvals = performanceData.evaluations.filter(eval => eval.status === 'مكتمل');
    const averageScore = completedEvals.length > 0 ? 
        (completedEvals.reduce((sum, eval) => sum + eval.totalScore, 0) / completedEvals.length / 6 * 10).toFixed(1) : 0;
    const topPerformers = completedEvals.filter(eval => (eval.totalScore / 6) >= 8).length;
    
    document.getElementById('totalEvaluations').textContent = totalEvals;
    document.getElementById('pendingEvaluations').textContent = pendingEvals;
    document.getElementById('averageScore').textContent = averageScore + '%';
    document.getElementById('topPerformers').textContent = topPerformers;
}

// معالجة إرسال نموذج التقييم
function handleEvaluationSubmit(e) {
    e.preventDefault();
    
    const employeeId = parseInt(document.getElementById('evalEmployeeSelect').value);
    const employee = hrSystem.data.employees.find(emp => emp.id === employeeId);
    
    if (!employee) {
        hrSystem.showAlert('يرجى اختيار موظف صحيح', 'error');
        return;
    }
    
    const qualityScore = parseInt(document.getElementById('qualityScore').value);
    const productivityScore = parseInt(document.getElementById('productivityScore').value);
    const teamworkScore = parseInt(document.getElementById('teamworkScore').value);
    const communicationScore = parseInt(document.getElementById('communicationScore').value);
    const initiativeScore = parseInt(document.getElementById('initiativeScore').value);
    const punctualityScore = parseInt(document.getElementById('punctualityScore').value);
    
    const totalScore = qualityScore + productivityScore + teamworkScore + 
                      communicationScore + initiativeScore + punctualityScore;
    const averageScore = totalScore / 6;
    
    let grade;
    if (averageScore >= 9) grade = 'ممتاز';
    else if (averageScore >= 8) grade = 'جيد جداً';
    else if (averageScore >= 7) grade = 'جيد';
    else if (averageScore >= 6) grade = 'مقبول';
    else grade = 'ضعيف';
    
    const evaluation = {
        id: Date.now(),
        employeeId: employeeId,
        employeeName: employee.name,
        period: document.getElementById('evalPeriod').value,
        qualityScore: qualityScore,
        productivityScore: productivityScore,
        teamworkScore: teamworkScore,
        communicationScore: communicationScore,
        initiativeScore: initiativeScore,
        punctualityScore: punctualityScore,
        totalScore: totalScore,
        averageScore: averageScore,
        grade: grade,
        strengths: document.getElementById('strengths').value,
        improvements: document.getElementById('improvements').value,
        goals: document.getElementById('goals').value,
        date: new Date().toISOString().split('T')[0],
        status: 'مكتمل'
    };
    
    performanceData.evaluations.push(evaluation);
    savePerformanceData();
    
    updatePerformanceStats();
    renderEvaluationsTable();
    updatePerformanceAnalysis();
    hrSystem.clearForm('evaluationForm');
    
    hrSystem.showAlert('تم حفظ التقييم بنجاح', 'success');
}

// معالجة إرسال نموذج الهدف
function handleGoalSubmit(e) {
    e.preventDefault();
    
    const employeeId = parseInt(document.getElementById('goalEmployeeSelect').value);
    const employee = hrSystem.data.employees.find(emp => emp.id === employeeId);
    
    if (!employee) {
        hrSystem.showAlert('يرجى اختيار موظف صحيح', 'error');
        return;
    }
    
    const goal = {
        id: Date.now(),
        employeeId: employeeId,
        employeeName: employee.name,
        description: document.getElementById('goalDescription').value,
        priority: document.getElementById('goalPriority').value,
        category: document.getElementById('goalCategory').value,
        deadline: document.getElementById('goalDeadline').value,
        status: 'قيد التنفيذ',
        progress: 0,
        dateCreated: new Date().toISOString().split('T')[0]
    };
    
    performanceData.goals.push(goal);
    savePerformanceData();
    
    renderGoalsTable();
    hrSystem.clearForm('goalForm');
    
    hrSystem.showAlert('تم إضافة الهدف بنجاح', 'success');
}

// عرض جدول التقييمات
function renderEvaluationsTable() {
    const tbody = document.getElementById('evaluationsTableBody');
    tbody.innerHTML = '';
    
    performanceData.evaluations.forEach(evaluation => {
        const employee = hrSystem.data.employees.find(emp => emp.id === evaluation.employeeId);
        const department = employee ? employee.department : 'غير محدد';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${evaluation.employeeName}</td>
            <td>${department}</td>
            <td>${evaluation.period}</td>
            <td>${evaluation.averageScore.toFixed(1)}/10</td>
            <td><span class="status-${evaluation.grade === 'ممتاز' ? 'active' : evaluation.grade === 'جيد جداً' ? 'active' : 'pending'}">${evaluation.grade}</span></td>
            <td>${hrSystem.formatDate(evaluation.date)}</td>
            <td><span class="status-${evaluation.status === 'مكتمل' ? 'active' : 'pending'}">${evaluation.status}</span></td>
            <td>
                <button class="btn btn-primary" onclick="viewEvaluationDetails(${evaluation.id})" style="font-size: 0.8rem; padding: 0.4rem 0.8rem; margin-left: 5px;">عرض</button>
                <button class="btn btn-success" onclick="printEvaluation(${evaluation.id})" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">طباعة</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// عرض جدول الأهداف
function renderGoalsTable() {
    const tbody = document.getElementById('goalsTableBody');
    tbody.innerHTML = '';
    
    performanceData.goals.forEach(goal => {
        const isOverdue = new Date(goal.deadline) < new Date() && goal.status !== 'مكتمل';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${goal.employeeName}</td>
            <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${goal.description}">${goal.description}</td>
            <td><span class="status-${goal.priority === 'عالية' ? 'active' : goal.priority === 'متوسطة' ? 'pending' : 'inactive'}">${goal.priority}</span></td>
            <td>${goal.category}</td>
            <td ${isOverdue ? 'style="color: red; font-weight: bold;"' : ''}>${hrSystem.formatDate(goal.deadline)}</td>
            <td><span class="status-${goal.status === 'مكتمل' ? 'active' : goal.status === 'قيد التنفيذ' ? 'pending' : 'inactive'}">${goal.status}</span></td>
            <td>
                <button class="btn btn-primary" onclick="updateGoalProgress(${goal.id})" style="font-size: 0.8rem; padding: 0.4rem 0.8rem; margin-left: 5px;">تحديث</button>
                <button class="btn btn-danger" onclick="deleteGoal(${goal.id})" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">حذف</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// تحديث تحليل الأداء
function updatePerformanceAnalysis() {
    // أفضل الموظفين
    const topEmployeesList = document.getElementById('topEmployeesList');
    const completedEvals = performanceData.evaluations.filter(eval => eval.status === 'مكتمل');
    const topPerformers = completedEvals
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 3);
    
    topEmployeesList.innerHTML = '';
    topPerformers.forEach((eval, index) => {
        const div = document.createElement('div');
        div.style.marginBottom = '10px';
        div.innerHTML = `
            <strong>${index + 1}. ${eval.employeeName}</strong><br>
            <small>الدرجة: ${eval.averageScore.toFixed(1)}/10 (${eval.grade})</small>
        `;
        topEmployeesList.appendChild(div);
    });
    
    // توزيع الدرجات
    const scoreDistribution = document.getElementById('scoreDistribution');
    const gradeCounts = {
        'ممتاز': 0,
        'جيد جداً': 0,
        'جيد': 0,
        'مقبول': 0,
        'ضعيف': 0
    };
    
    completedEvals.forEach(eval => {
        gradeCounts[eval.grade]++;
    });
    
    scoreDistribution.innerHTML = '';
    Object.entries(gradeCounts).forEach(([grade, count]) => {
        const div = document.createElement('div');
        div.style.marginBottom = '5px';
        div.innerHTML = `<strong>${grade}:</strong> ${count} موظف`;
        scoreDistribution.appendChild(div);
    });
}

// عرض تفاصيل التقييم
function viewEvaluationDetails(evaluationId) {
    const evaluation = performanceData.evaluations.find(eval => eval.id === evaluationId);
    if (!evaluation) {
        hrSystem.showAlert('لم يتم العثور على التقييم', 'error');
        return;
    }
    
    const detailsWindow = window.open('', '_blank');
    detailsWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>تفاصيل تقييم الأداء - ${evaluation.employeeName}</title>
            <style>
                body { font-family: 'Cairo', sans-serif; padding: 20px; line-height: 1.6; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                .section { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                .score-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
                .score-item { background: #f8f9fa; padding: 10px; border-radius: 5px; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>تقييم الأداء</h1>
                <h2>${evaluation.employeeName}</h2>
                <p>فترة التقييم: ${evaluation.period}</p>
                <p>تاريخ التقييم: ${hrSystem.formatDate(evaluation.date)}</p>
            </div>
            
            <div class="section">
                <h3>الدرجات التفصيلية</h3>
                <div class="score-grid">
                    <div class="score-item"><strong>جودة العمل:</strong> ${evaluation.qualityScore}/10</div>
                    <div class="score-item"><strong>الإنتاجية:</strong> ${evaluation.productivityScore}/10</div>
                    <div class="score-item"><strong>العمل الجماعي:</strong> ${evaluation.teamworkScore}/10</div>
                    <div class="score-item"><strong>التواصل:</strong> ${evaluation.communicationScore}/10</div>
                    <div class="score-item"><strong>المبادرة والإبداع:</strong> ${evaluation.initiativeScore}/10</div>
                    <div class="score-item"><strong>الالتزام بالمواعيد:</strong> ${evaluation.punctualityScore}/10</div>
                </div>
                <div style="margin-top: 15px; text-align: center; font-size: 1.2em;">
                    <strong>الدرجة الإجمالية: ${evaluation.averageScore.toFixed(1)}/10 (${evaluation.grade})</strong>
                </div>
            </div>
            
            <div class="section">
                <h3>نقاط القوة</h3>
                <p>${evaluation.strengths || 'لم يتم تحديد نقاط قوة'}</p>
            </div>
            
            <div class="section">
                <h3>مجالات التحسين</h3>
                <p>${evaluation.improvements || 'لا توجد مجالات تحسين محددة'}</p>
            </div>
            
            <div class="section">
                <h3>الأهداف للفترة القادمة</h3>
                <p>${evaluation.goals || 'لم يتم تحديد أهداف'}</p>
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

// طباعة التقييم
function printEvaluation(evaluationId) {
    viewEvaluationDetails(evaluationId);
}

// تحديث تقدم الهدف
function updateGoalProgress(goalId) {
    const goal = performanceData.goals.find(g => g.id === goalId);
    if (!goal) {
        hrSystem.showAlert('لم يتم العثور على الهدف', 'error');
        return;
    }
    
    const newProgress = prompt(`تحديث تقدم الهدف للموظف ${goal.employeeName}\n\nالهدف: ${goal.description}\n\nأدخل نسبة التقدم (0-100):`, goal.progress);
    
    if (newProgress !== null) {
        const progress = parseInt(newProgress);
        if (progress >= 0 && progress <= 100) {
            goal.progress = progress;
            if (progress === 100) {
                goal.status = 'مكتمل';
            } else {
                goal.status = 'قيد التنفيذ';
            }
            
            savePerformanceData();
            renderGoalsTable();
            hrSystem.showAlert('تم تحديث تقدم الهدف بنجاح', 'success');
        } else {
            hrSystem.showAlert('يرجى إدخال نسبة صحيحة بين 0 و 100', 'error');
        }
    }
}

// حذف هدف
function deleteGoal(goalId) {
    const goal = performanceData.goals.find(g => g.id === goalId);
    if (!goal) {
        hrSystem.showAlert('لم يتم العثور على الهدف', 'error');
        return;
    }
    
    hrSystem.showConfirmation(
        `هل أنت متأكد من حذف الهدف "${goal.description}" للموظف ${goal.employeeName}؟`,
        () => {
            const index = performanceData.goals.findIndex(g => g.id === goalId);
            performanceData.goals.splice(index, 1);
            savePerformanceData();
            renderGoalsTable();
            hrSystem.showAlert('تم حذف الهدف بنجاح', 'success');
        }
    );
}