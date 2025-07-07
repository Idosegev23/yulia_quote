// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Contact form handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            // Show loading state
            submitButton.textContent = 'שולח...';
            submitButton.disabled = true;
            
            // Get form data
            const formData = new FormData(this);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                company: formData.get('company'),
                monthlySupport: formData.get('monthlySupport'),
                message: formData.get('message')
            };
            
            try {
                const response = await fetch('/api/send-quote-request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                // Check if response is ok
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status} ${response.statusText}`);
                }
                
                // Check if response is JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    console.error('Non-JSON response:', text);
                    throw new Error('השרת לא זמין כרגע. אנא נסו שנית מאוחר יותר.');
                }
                
                const result = await response.json();
                
                if (result.success) {
                    // Track successful form submission
                    if (window.va) {
                        window.va('track', 'Quote Request Submitted', {
                            monthly_support: data.monthlySupport === 'yes'
                        });
                    }
                    
                    showNotification('🎉 הצעת המחיר אושרה בהצלחה! נשלח אלייך מייל אישור ונחזור אלייך תוך 24 שעות.', 'success');
                    this.reset();
                } else {
                    throw new Error(result.message || 'שגיאה לא ידועה');
                }
            } catch (error) {
                console.error('Error:', error);
                if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                    showNotification('בעיית רשת. בדקי את החיבור לאינטרנט ונסי שנית.', 'error');
                } else {
                    showNotification(error.message || 'שגיאה בשליחת ההודעה. אנא נסי שנית או צרי קשר טלפונית.', 'error');
                }
            } finally {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }
});

// Notification system
function showNotification(message, type) {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    const styles = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease;
            font-family: 'Heebo', sans-serif;
            direction: rtl;
        }
        
        .notification.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .notification.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .notification-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
        }
        
        .notification-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            color: inherit;
            opacity: 0.7;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    
    if (!document.querySelector('#notification-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    document.body.appendChild(notification);
    
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notification.remove();
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const elementsToAnimate = document.querySelectorAll('.service-card, .additional-services, .additional-info, .contact-info');
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
    
    // Track WhatsApp button clicks
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            if (window.va) {
                window.va('track', 'WhatsApp Button Clicked');
            }
        });
    }
    
    // Track phone button clicks
    const phoneBtn = document.querySelector('.phone-btn');
    if (phoneBtn) {
        phoneBtn.addEventListener('click', () => {
            if (window.va) {
                window.va('track', 'Phone Button Clicked');
            }
        });
    }
    
    // Track CTA button clicks
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.va) {
                const buttonText = btn.textContent.trim();
                window.va('track', 'CTA Button Clicked', {
                    button_text: buttonText
                });
            }
        });
    });
});

// Add animation classes
const animationStyles = `
    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
    }
`;

const animationStyleSheet = document.createElement('style');
animationStyleSheet.textContent = animationStyles;
document.head.appendChild(animationStyleSheet);

// Add loading indicator for external links
document.querySelectorAll('a[href^="http"]').forEach(link => {
    link.addEventListener('click', function() {
        if (this.target === '_blank') {
            const originalText = this.textContent;
            this.textContent = 'פותח...';
            setTimeout(() => {
                this.textContent = originalText;
            }, 1000);
        }
    });
});

// Enhanced form validation
function validateForm() {
    const form = document.getElementById('contactForm');
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        const value = input.value.trim();
        const parent = input.parentElement;
        
        // Remove existing error messages
        const existingError = parent.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        input.classList.remove('error');
        
        // Validate based on input type
        if (!value) {
            showFieldError(input, 'שדה זה הוא חובה');
            isValid = false;
        } else if (input.type === 'email' && !isValidEmail(value)) {
            showFieldError(input, 'כתובת אימייל לא תקינה');
            isValid = false;
        }
    });
    
    return isValid;
}

function showFieldError(input, message) {
    input.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 5px;
        font-family: 'Heebo', sans-serif;
    `;
    input.parentElement.appendChild(errorDiv);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Add error styles
const errorStyles = `
    .form-group input.error,
    .form-group textarea.error {
        border-color: #dc3545 !important;
        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
    }
`;

const errorStyleSheet = document.createElement('style');
errorStyleSheet.textContent = errorStyles;
document.head.appendChild(errorStyleSheet);

// Real-time validation
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.hasAttribute('required')) {
                const value = input.value.trim();
                const parent = input.parentElement;
                
                // Remove existing error
                const existingError = parent.querySelector('.error-message');
                if (existingError) {
                    existingError.remove();
                }
                input.classList.remove('error');
                
                // Validate
                if (!value) {
                    showFieldError(input, 'שדה זה הוא חובה');
                } else if (input.type === 'email' && !isValidEmail(value)) {
                    showFieldError(input, 'כתובת אימייל לא תקינה');
                }
            }
        });
        
        // Clear errors on input
        input.addEventListener('input', () => {
            const parent = input.parentElement;
            const existingError = parent.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            input.classList.remove('error');
        });
    });
});

// Update form submit to include validation
const originalFormHandler = document.getElementById('contactForm').onsubmit;
document.getElementById('contactForm').addEventListener('submit', function(e) {
    if (!validateForm()) {
        e.preventDefault();
        showNotification('אנא תקנו את השגיאות בטופס', 'error');
        return false;
    }
}); 