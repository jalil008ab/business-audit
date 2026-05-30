// DOM Elements
const steps = document.querySelectorAll('.step');
const progressBar = document.getElementById('progress-bar');
const backBtn = document.querySelector('.back-btn');
const quizSection = document.getElementById('quiz-section');
const dashboardSection = document.getElementById('dashboard-section');
const restartBtn = document.getElementById('restart-btn');

// State variables
let currentStep = 0;
const totalSteps = 9; // Step 1 to 9 (0 is welcome, 10 is loading)
const answers = {
    is_owner: '',
    has_crm: '',
    has_sales_dept: '',
    social_state: '',
    business_field: '',
    ad_platform: '',
    revenue_goal: 0,
    average_check: 0,
    sales_conversion: 0
};

// Benchmarks for CPL (Cost Per Lead) based on platform
const cplBenchmarks = {
    'Instagram': { min: 0.8, max: 1.5 },
    'Facebook': { min: 1.0, max: 1.8 },
    'TikTok': { min: 0.5, max: 1.2 },
    'Google/Yandex': { min: 1.5, max: 3.0 },
    'Boshqa': { min: 1.0, max: 2.0 }
};

// Navigation Functions
function updateProgress() {
    if (currentStep === 0 || currentStep > totalSteps) {
        progressBar.style.width = '0%';
    } else {
        const progress = (currentStep / totalSteps) * 100;
        progressBar.style.width = `${progress}%`;
    }
    
    // Show/hide back button
    if (currentStep > 0 && currentStep <= totalSteps) {
        backBtn.style.display = 'inline-flex';
    } else {
        backBtn.style.display = 'none';
    }
}

function showStep(stepIndex) {
    steps.forEach(step => step.classList.remove('active'));
    document.querySelector(`.step[data-step="${stepIndex}"]`)?.classList.add('active');
    
    // Special handling for loading step
    if (stepIndex === totalSteps + 1) {
        document.getElementById('loading-step').classList.add('active');
        setTimeout(showResults, 2000); // Fake calculation delay for effect
    }
    
    updateProgress();
}

function nextStep() {
    if (currentStep <= totalSteps) {
        currentStep++;
        showStep(currentStep);
    }
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
    }
}

// Event Listeners for Next/Prev
document.querySelector('.next-btn').addEventListener('click', nextStep);
backBtn.addEventListener('click', prevStep);

// Option Buttons Event Listeners
// Attach directly since they exist in DOM
const optionBtns = document.querySelectorAll('.option-btn');
optionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const name = this.getAttribute('data-name');
        const value = this.getAttribute('data-value');
        
        answers[name] = value;
        
        const siblings = this.parentElement.querySelectorAll('.option-btn');
        siblings.forEach(s => s.classList.remove('selected'));
        this.classList.add('selected');
        
        setTimeout(nextStep, 300);
    });
});

// Input Submit Buttons
document.querySelectorAll('.submit-input-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Find input in the same step
        const stepDiv = this.closest('.step');
        const input = stepDiv.querySelector('input');
        
        if (!input.value) {
            input.style.borderColor = 'var(--danger)';
            setTimeout(() => input.style.borderColor = '', 1000);
            return; // Don't proceed if empty
        }
        
        // Save value
        const id = input.id;
        if (id === 'business_field') answers[id] = input.value;
        else answers[id] = parseFloat(input.value);
        
        if (this.classList.contains('final-submit')) {
            // This is the last step before loading
            currentStep++;
            showStep(currentStep);
        } else {
            nextStep();
        }
    });
});

// Enter key for inputs
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const btn = this.closest('.step').querySelector('.submit-input-btn');
            if (btn) btn.click();
        }
    });
});

// Restart App
restartBtn.addEventListener('click', () => {
    dashboardSection.classList.add('hidden');
    quizSection.classList.remove('hidden');
    
    // Reset state
    currentStep = 0;
    document.querySelectorAll('input').forEach(i => i.value = '');
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    
    showStep(0);
});

// Format Currency
function formatMoney(amount) {
    return '$' + amount.toLocaleString('en-US');
}

// Logic & Calculations Engine
function calculateResults() {
    const revenue = answers.revenue_goal;
    const avgCheck = answers.average_check;
    const conversion = answers.sales_conversion;
    const platform = answers.ad_platform || 'Instagram';
    
    // Core metrics
    const requiredClients = Math.ceil(revenue / avgCheck);
    const requiredLeads = Math.ceil(requiredClients / (conversion / 100));
    
    // Benchmarks
    const cplRange = cplBenchmarks[platform] || cplBenchmarks['Boshqa'];
    let baseMinBudget = requiredLeads * cplRange.min;
    let baseOptBudget = requiredLeads * cplRange.max;
    
    // Penalties
    let penaltyPercent = 0;
    let riskLevel = 'Past';
    let riskClass = 'low';
    
    const warnings = [];
    const tips = [];
    
    if (answers.has_crm === "Yo'q") {
        penaltyPercent += 20;
        warnings.push("CRM tizimi yo'qligi sababli lidlarning 20% gacha qismi yo'qotiladi (Kuyib ketadi).");
        tips.push("CRM tizimi (AmoCRM yoki Bitrix24) o'rnating. Bu byudjetni kamida 20% tejashga yordam beradi.");
    } else {
        tips.push("CRM tizimingiz borligi juda yaxshi. Endi` uni reklama platformalariga avtomatik bog'lang.");
    }
    
    if (answers.has_sales_dept === "Yo'q") {
        penaltyPercent += 20;
        warnings.push("Alohida sotuvchi bo'lmagani uchun konversiya past bo'ladi (+20% qimmatroq byudjet kerak).");
        tips.push("Faqat sotuv bilan shug'ullanuvchi menejer yollang yoki o'z sotuv ko'nikmalaringizni oshiring.");
    }
    
    if (answers.social_state === "Yomon") {
        warnings.push("Ijtimoiy tarmoqlar upakovkasi yomonligi sababli mijozlarda ishonch past bo'ladi.");
        tips.push("Reklama yoqishdan oldin sahifa dizayni va kontent sifatini yaxshilang.");
    } else if (answers.social_state === "Zo'r") {
        tips.push("Ijtimoiy tarmoqlaringiz holati a'lo darajada. Bu reklamangiz arzonlashishiga yordam beradi.");
    }
    
    // Apply penalties to budget
    const penaltyMultiplier = 1 + (penaltyPercent / 100);
    const finalMinBudget = Math.ceil(baseMinBudget * penaltyMultiplier);
    const finalOptBudget = Math.ceil(baseOptBudget * penaltyMultiplier);
    
    // Determine Risk
    if (penaltyPercent >= 40 || answers.social_state === "Yomon") {
        riskLevel = "Yuqori (Xavfli)";
        riskClass = "high";
    } else if (penaltyPercent > 0 || answers.social_state === "O'rtacha") {
        riskLevel = "O'rtacha";
        riskClass = "medium";
    } else {
        riskLevel = "Past (Xavfsiz)";
        riskClass = "low";
    }
    
    if (penaltyPercent > 0) {
        warnings.push(`Sizda tizim bo'lmagani uchun real byudjet aslidan ${penaltyPercent}% ga qimmatroq tushadi.`);
    }
    
    return {
        revenue, avgCheck, conversion, platform,
        requiredClients, requiredLeads,
        cplMin: cplRange.min, cplMax: cplRange.max,
        minBudget: finalMinBudget,
        optBudget: finalOptBudget,
        riskLevel, riskClass,
        warnings, tips
    };
}

// Render Results on Dashboard
function showResults() {
    // Hide form, show dashboard
    quizSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    
    // Calculate
    const data = calculateResults();
    
    // 1. Business State Card
    document.getElementById('res_field').textContent = answers.business_field || 'Kiritilmadi';
    document.getElementById('res_crm').textContent = answers.has_crm || '-';
    document.getElementById('res_sales_dept').textContent = answers.has_sales_dept || '-';
    document.getElementById('res_social').textContent = answers.social_state || '-';
    
    const riskBadge = document.getElementById('res_risk');
    riskBadge.innerHTML = `Xavf darajasi: <span>${data.riskLevel}</span>`;
    riskBadge.className = `risk-badge mt-3 ${data.riskClass}`;
    
    // 2. Financial Goals
    document.getElementById('res_revenue').textContent = formatMoney(data.revenue);
    document.getElementById('res_avg_check').textContent = formatMoney(data.avgCheck);
    document.getElementById('res_clients').textContent = data.requiredClients + ' ta';
    
    // 3. Funnel
    document.getElementById('res_leads').textContent = data.requiredLeads + ' ta';
    document.getElementById('res_conv').textContent = data.conversion + '%';
    document.getElementById('res_clients_2').textContent = data.requiredClients + ' ta';
    
    // 4. Budget
    document.getElementById('res_platform').textContent = data.platform;
    document.getElementById('res_cpl').textContent = `$${data.cplMin} - $${data.cplMax}`;
    document.getElementById('res_min_budget').textContent = formatMoney(data.minBudget);
    document.getElementById('res_opt_budget').textContent = formatMoney(data.optBudget);
    
    // 5. Warnings & Tips
    const warningsContainer = document.getElementById('warnings-container');
    const tipsContainer = document.getElementById('tips-container');
    
    warningsContainer.innerHTML = '';
    tipsContainer.innerHTML = '';
    
    if (data.warnings.length === 0) {
        warningsContainer.innerHTML = '<div class="alert-item alert-tip"><i class="fa-solid fa-check-circle"></i><span>Hech qanday jiddiy muammo aniqlanmadi. Tizimingiz yaxshi ishlayapti.</span></div>';
    } else {
        data.warnings.forEach(w => {
            warningsContainer.innerHTML += `<div class="alert-item alert-warning"><i class="fa-solid fa-triangle-exclamation"></i><span>${w}</span></div>`;
        });
    }
    
    data.tips.forEach(t => {
        tipsContainer.innerHTML += `<div class="alert-item alert-tip"><i class="fa-solid fa-lightbulb"></i><span>${t}</span></div>`;
    });
    
    // Call Smart Advisor (local, no API needed)
    generateSmartAdvice({ ...data, ...answers });
}

// Helper to format Gemini's markdown response into beautiful premium HTML cards
function formatAiAdvice(text) {
    // Replace markdown bold **text** with <strong>text</strong>
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert newlines to list of lines
    const lines = html.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let listHtml = '<div class="ai-advice-grid">';
    let currentCardIndex = 0;
    
    lines.forEach((line) => {
        // If line is a bullet point (starts with -, *, or number)
        if (line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line)) {
            // Remove bullet character and leading spaces
            const cleanLine = line.replace(/^[-*\d.]+\s*/, '');
            
            // Extract a title if there is a colon or closing strong tag
            let title = 'Strategik Tavsiya';
            let content = cleanLine;
            
            if (cleanLine.includes(':')) {
                const parts = cleanLine.split(':');
                title = parts[0].trim();
                content = parts.slice(1).join(':').trim();
            } else if (cleanLine.includes('</strong>')) {
                const parts = cleanLine.split('</strong>');
                title = parts[0].replace('<strong>', '').trim();
                content = parts.slice(1).join('</strong>').trim();
            }
            
            // Strip any remaining strong tags from title to keep the layout clean
            const cleanTitle = title.replace(/<\/?strong>/g, '');
            
            const icons = ['🚀', '🎯', '💡', '📊', '💰', '🔑', '💎'];
            const icon = icons[currentCardIndex % icons.length];
            
            listHtml += `
            <div class="ai-tip-card" style="animation-delay: ${currentCardIndex * 0.15}s">
                <div class="ai-tip-header">
                    <span class="ai-tip-icon">${icon}</span>
                    <strong>${cleanTitle}</strong>
                </div>
                <p>${content}</p>
            </div>`;
            currentCardIndex++;
        } else if (line.startsWith('###') || line.startsWith('##') || line.startsWith('#')) {
            // Header line
            const headerText = line.replace(/^[#\s]+/, '').replace(/<\/?strong>/g, '');
            listHtml += `</div><h4 class="ai-advice-subtitle" style="color: #a78bfa; margin: 20px 0 10px 0; font-size: 1.1rem; font-weight: 600;">${headerText}</h4><div class="ai-advice-grid">`;
        } else {
            // Regular text
            listHtml += `<p class="ai-advice-paragraph" style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 12px; width: 100%;">${line}</p>`;
        }
    });
    
    listHtml += `</div>`;
    listHtml += `<p class="ai-footer-note">✨ Tahlil Gemini AI tomonidan real vaqtda tuzildi.</p>`;
    
    return listHtml;
}

// Smart AI Advisor — calls backend Gemini API with local rule-based fallback
async function generateSmartAdvice(data) {
    const statusText = document.getElementById('ai-status');
    const loader = document.getElementById('ai-loader');
    const resultText = document.getElementById('ai-result-text');
    
    statusText.textContent = "Tahlil qilinmoqda...";
    statusText.style.background = "";
    statusText.style.color = "";
    statusText.style.borderColor = "";
    statusText.style.animation = "";
    
    loader.style.display = 'flex';
    resultText.classList.add('hidden');
    resultText.innerHTML = '';

    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                business_field: data.business_field,
                revenue: data.revenue,
                avgCheck: data.avgCheck,
                has_crm: data.has_crm,
                has_sales_dept: data.has_sales_dept,
                social_state: data.social_state,
                platform: data.platform,
                minBudget: data.minBudget,
                optBudget: data.optBudget
            })
        });

        if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`);
        }

        const resData = await response.json();
        if (!resData.advice) {
            throw new Error('API request completed but returned empty advice');
        }

        statusText.textContent = "Tayyor ✓";
        statusText.style.background = "rgba(16, 185, 129, 0.1)";
        statusText.style.color = "#34d399";
        statusText.style.borderColor = "rgba(16, 185, 129, 0.2)";
        statusText.style.animation = "none";
        
        loader.style.display = 'none';
        
        // Format AI markdown and insert into container
        const formattedAdvice = formatAiAdvice(resData.advice);
        resultText.innerHTML = formattedAdvice;
        resultText.classList.remove('hidden');

    } catch (error) {
        console.warn("Gemini AI API xatoligi yuz berdi. Lokal tahlilchi ishga tushirilmoqda:", error);
        
        // Fallback to local rule-based analysis
        setTimeout(() => {
            const advice = analyzeBusinessData(data);
            
            statusText.textContent = "Tayyor (Lokal) ✓";
            statusText.style.background = "rgba(245, 158, 11, 0.1)";
            statusText.style.color = "#f59e0b";
            statusText.style.borderColor = "rgba(245, 158, 11, 0.2)";
            statusText.style.animation = "none";
            
            loader.style.display = 'none';
            resultText.innerHTML = advice;
            resultText.classList.remove('hidden');
        }, 1000);
    }
}

function analyzeBusinessData(d) {
    const tips = [];
    const revenue = parseFloat(d.revenue) || 0;
    const avgCheck = parseFloat(d.avgCheck) || 0;
    const conv = parseFloat(d.conversion) || 0;
    const clients = avgCheck > 0 ? Math.ceil(revenue / avgCheck) : 0;
    const leads = conv > 0 ? Math.ceil(clients / (conv / 100)) : 0;

    // 1. CRM Analysis
    if (d.has_crm === 'Yo\'q' || d.has_crm === 'Yoq') {
        tips.push({
            icon: '🔴',
            title: 'CRM tizimini joriy qiling',
            text: `Siz oyiga <strong>${clients}</strong> ta mijozni boshqarishingiz kerak. CRM'siz bu sonni nazorat qilish juda qiyin. <strong>Bitrix24</strong> yoki <strong>AmoCRM</strong> ni bepul rejimidan boshlang — bu sotuv konversiyangizni kamida <strong>15-20%</strong> ga oshiradi.`
        });
    } else {
        tips.push({
            icon: '✅',
            title: 'CRM tizimi mavjud — ajoyib!',
            text: `CRM orqali mijozlaringizni segmentlang va <strong>qayta sotuv (upsell)</strong> strategiyasini yo'lga qo'ying. Bu o'rtacha chekni <strong>$${avgCheck}</strong> dan <strong>$${Math.round(avgCheck * 1.3)}</strong> gacha oshirishi mumkin.`
        });
    }

    // 2. Sales Department Analysis
    if (d.has_sales_dept === 'Yo\'q' || d.has_sales_dept === 'Yoq') {
        tips.push({
            icon: '⚠️',
            title: 'Sotuv bo\'limini tashkil qiling',
            text: `Oyiga <strong>${leads}</strong> ta lidni qayta ishlash uchun kamida <strong>1-2 ta sotuv menejeri</strong> kerak. Hozircha freelancer menejer yollash yoki sotuv skriptlarini tayyorlash bilan boshlang. Bu konversiyani <strong>${conv}%</strong> dan <strong>${Math.min(conv + 10, 50)}%</strong> gacha oshiradi.`
        });
    } else {
        tips.push({
            icon: '✅',
            title: 'Sotuv jamoasi bor — KPI o\'rnating',
            text: `Har bir menejer uchun kunlik KPI: kamida <strong>${Math.ceil(leads / 22 / 2)}</strong> ta qo'ng'iroq va <strong>${Math.ceil(clients / 22 / 2)}</strong> ta bitim. Haftalik natijalarni kuzatib boring.`
        });
    }

    // 3. Social Media Analysis
    if (d.social_state && (d.social_state.toLowerCase().includes('yoq') || d.social_state.toLowerCase().includes('yo\'q'))) {
        tips.push({
            icon: '🔴',
            title: 'Ijtimoiy tarmoqlarni darhol yoqing',
            text: `Bugungi kunda mijozlarning <strong>78%</strong> i sotib olishdan oldin ijtimoiy tarmoqlarni tekshiradi. Kamida <strong>Instagram</strong> va <strong>Telegram</strong> kanallarini yarating va haftada <strong>3-5 ta</strong> post joylashtiring.`
        });
    } else {
        tips.push({
            icon: '💡',
            title: 'Ijtimoiy tarmoq strategiyasini kuchaytiring',
            text: `Kontentingizni <strong>80/20 qoidasi</strong> bilan rejalashtiring: 80% foydali kontent, 20% sotuv. <strong>Reels</strong> va <strong>Stories</strong> formatlariga e'tibor qarating — organik qamrov <strong>3-5 baravar</strong> oshadi.`
        });
    }

    // 4. Budget & Platform Strategy
    const platform = d.platform || 'Instagram';
    const minBudget = parseFloat(d.minBudget) || 0;
    const optBudget = parseFloat(d.optBudget) || 0;

    tips.push({
        icon: '💰',
        title: `${platform} reklama strategiyasi`,
        text: `<strong>$${minBudget}</strong> — <strong>$${optBudget}</strong> byudjet bilan boshlang. Dastlabki <strong>3-5 kun</strong> test rejimida ishlating: har xil kreativlar (rasm, video, carousel) sinovdan o'tkazing. Eng yaxshi natija bergan reklamaga byudjetning <strong>70%</strong> ini yo'naltiring.`
    });

    // 5. Revenue Growth Strategy
    if (revenue >= 10000) {
        tips.push({
            icon: '🚀',
            title: 'Daromadni oshirish strategiyasi',
            text: `$${revenue.toLocaleString()} maqsadga erishish uchun: <strong>1)</strong> O'rtacha chekni oshirish (bundle/paket taklif) <strong>2)</strong> Qayta sotuvni yo'lga qo'yish (email/SMS marketing) <strong>3)</strong> Referral dasturini ishga tushirish — har bir mijoz yana <strong>1-2 ta</strong> yangi mijoz olib kelishi mumkin.`
        });
    } else {
        tips.push({
            icon: '🎯',
            title: 'Birinchi bosqich strategiyasi',
            text: `$${revenue.toLocaleString()} maqsad uchun eng samarali yo'l: <strong>1)</strong> Bitta asosiy mahsulot/xizmatga fokuslanish <strong>2)</strong> ${platform} da <strong>targetlangan reklama</strong> ishga tushurish <strong>3)</strong> Har bir mijozdan <strong>ijobiy sharh</strong> olish va its reklama sifatida ishlatish.`
        });
    }

    // 6. Conversion Optimization
    if (conv < 20) {
        tips.push({
            icon: '📊',
            title: 'Konversiyani oshirish zarur',
            text: `${conv}% konversiya past. Yaxshilash yo'llari: <strong>1)</strong> Landing sahifani optimizatsiya qiling <strong>2)</strong> Sotuv skriptlarini tayyorlang <strong>3)</strong> Lidlarga <strong>5 daqiqa</strong> ichida javob bering — bu konversiyani <strong>3 baravar</strong> oshiradi. <strong>4)</strong> Bonus yoki chegirma taklif qiling.`
        });
    }

    // Build HTML
    let html = `<div class="ai-advice-grid">`;
    tips.forEach((tip, i) => {
        html += `
        <div class="ai-tip-card" style="animation-delay: ${i * 0.15}s">
            <div class="ai-tip-header">
                <span class="ai-tip-icon">${tip.icon}</span>
                <strong>${tip.title}</strong>
            </div>
            <p>${tip.text}</p>
        </div>`;
    });
    html += `</div>`;
    html += `<p class="ai-footer-note">📋 Tahlil sizning audit ma'lumotlaringiz asosida avtomatik tuzildi.</p>`;

    return html;
}
