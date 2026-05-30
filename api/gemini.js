export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ error: 'Gemini API Key is not configured' });
    }

    const data = req.body;
    
    // Construct the prompt based on the user's data
    const prompt = `
Siz biznes va marketing bo'yicha professional maslahatchisiz. Foydalanuvchining ma'lumotlari:
- Biznes sohasi: ${data.business_field || "Kiritilmagan"}
- Oylik daromad maqsadi: $${data.revenue}
- O'rtacha chek: $${data.avgCheck}
- CRM tizimi mavjudmi: ${data.has_crm}
- Alohida sotuv bo'limi bormi: ${data.has_sales_dept}
- Ijtimoiy tarmoqlar holati: ${data.social_state}
- Asosiy reklama platformasi: ${data.platform}
- Hisoblangan minimal byudjet: $${data.minBudget}
- Hisoblangan optimal byudjet: $${data.optBudget}

Shu raqamlar va holatdan kelib chiqib, qisqa, lo'nda va vizual tushunarli (bullet-pointlar bilan) 3 ta eng muhim strategik qadam yoki tavsiya bering. Ortqicha gaplar va umumiylik kerak emas, aynan shu biznesga mos eng muhim xulosani yozing. Matn to'liq O'zbek tilida, professional va dalda beruvchi ohangda bo'lsin.
`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Gemini API Error Detail:", JSON.stringify(errorData));
            return res.status(response.status).json({ 
                error: `Gemini API xatosi: ${errorData.error?.message || response.statusText}`,
                status: response.status 
            });
        }

        const result = await response.json();
        
        if (!result.candidates || result.candidates.length === 0) {
            return res.status(500).json({ error: 'AI javob qaytarmadi (Candidates bo\'sh).' });
        }

        const aiText = result.candidates[0].content.parts[0].text;
        res.status(200).json({ advice: aiText });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: `Server ichki xatosi: ${error.message}` });
    }
}
