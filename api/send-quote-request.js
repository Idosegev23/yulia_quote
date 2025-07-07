import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    
    try {
        const { name, email, phone, company, monthlySupport, message } = req.body;
        
        // Validate required fields
        if (!name || !email || !phone) {
            return res.status(400).json({ 
                success: false, 
                message: 'שם, אימייל וטלפון הם שדות חובה' 
            });
        }
        
        // Configure nodemailer with environment variables
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        
        // Verify transporter configuration
        await transporter.verify();
        
        // Email to company (triroars@gmail.com)
        const companyMailOptions = {
            from: process.env.EMAIL_USER,
            to: 'triroars@gmail.com',
            subject: `✅ אישור הצעת מחיר דף נחיתה מ-${name}`,
            html: `
                <div dir="rtl" style="font-family: Arial, sans-serif;">
                    <h2 style="color: #BFF205;">🎉 אישור הצעת מחיר חדש - דף נחיתה!</h2>
                    
                    <h3>פרטי הלקוח:</h3>
                    <p><strong>שם:</strong> ${name}</p>
                    <p><strong>אימייל:</strong> ${email}</p>
                    <p><strong>טלפון:</strong> ${phone}</p>
                    ${company ? `<p><strong>חברה:</strong> ${company}</p>` : ''}
                    
                    <h3>פרטי ההזמנה:</h3>
                    <p><strong>תמיכה שוטפת:</strong> ${monthlySupport === 'yes' ? '✅ כן - 150 ₪ לחודש' : '❌ לא'}</p>
                    
                    ${message ? `<h3>הערות הלקוח:</h3><p>${message}</p>` : ''}
                    
                    <hr>
                    <p><strong>סה"כ הזמנה:</strong></p>
                    <ul>
                        <li>דף נחיתה מקצועי: 2,000 ₪</li>
                        ${monthlySupport === 'yes' ? '<li>תמיכה שוטפת: 150 ₪ לחודש</li>' : ''}
                    </ul>
                    <p><strong>סה"כ פרויקט: 2,000 ₪ (לא כולל מע"מ)</strong></p>
                    ${monthlySupport === 'yes' ? '<p><strong>+ תמיכה שוטפת: 150 ₪ לחודש (לא כולל מע"מ)</strong></p>' : ''}
                    
                    <hr>
                    <p><small>הודעה זו נשלחה מטופס אישור הצעת מחיר לדף נחיתה באתר 2Create</small></p>
                </div>
            `
        };
        
        // Email to client
        const clientMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `אישור קבלת הצעת המחיר לדף נחיתה - 2Create`,
            html: `
                <div dir="rtl" style="font-family: Arial, sans-serif;">
                    <h2 style="color: #BFF205;">תודה ${name}!</h2>
                    
                    <p>קיבלנו את אישור הצעת המחיר שלך לדף נחיתה ואנחנו נרגשים להתחיל לעבוד איתך!</p>
                    
                    <h3>סיכום ההזמנה:</h3>
                    <ul>
                        <li>דף נחיתה מקצועי ומותאם אישית: 2,000 ₪</li>
                        ${monthlySupport === 'yes' ? '<li>תמיכה שוטפת: 150 ₪ לחודש</li>' : ''}
                    </ul>
                    <p><strong>סה"כ פרויקט: 2,000 ₪ (לא כולל מע"מ)</strong></p>
                    ${monthlySupport === 'yes' ? '<p><strong>+ תמיכה שוטפת: 150 ₪ לחודש (לא כולל מע"מ)</strong></p>' : ''}
                    
                    <h3>מה כלול בדף הנחיתה:</h3>
                    <ul>
                        <li>עיצוב ממותג ומותאם אישית</li>
                        <li>ביטים מותאמים לקונברסיה</li>
                        <li>טופס יצירת קשר מתקדם</li>
                        <li>חיבור לוואטסאפ/טלפון</li>
                        <li>התאמה מלאה לניידים</li>
                        <li>SEO בסיסי ואופטימיזציה</li>
                        <li>רכיב נגישות</li>
                    </ul>
                    
                    <h3>השלבים הבאים:</h3>
                    <ol>
                        <li>נחזור אלייך תוך 24 שעות לתיאום פגישת קיק-אוף</li>
                        <li>נתחיל בתהליך איסוף החומרים והעיצוב</li>
                        <li>זמן אספקה משוער: עד 7 ימי עסקים</li>
                    </ol>
                    
                    <p>יש לך שאלות? אנחנו כאן בשבילך:</p>
                    <p>📞 גיא: 050-3504937</p>
                    <p>📞 עידו: 054-7667775</p>
                    <p>✉️ hello@2create.co.il</p>
                    
                    <hr>
                    <p><strong>2Create - עיצוב דיגיטלי עם נשמה</strong></p>
                    <p><small>אנחנו לא מרכיבים אתרים, אנחנו יוצרים אותם.</small></p>
                </div>
            `
        };
        
        // Send both emails
        await Promise.all([
            transporter.sendMail(companyMailOptions),
            transporter.sendMail(clientMailOptions)
        ]);
        
        res.status(200).json({ 
            success: true, 
            message: 'ההודעה נשלחה בהצלחה' 
        });
        
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            success: false, 
            message: 'שגיאה בשליחת ההודעה. אנא נסי שנית מאוחר יותר.' 
        });
    }
} 