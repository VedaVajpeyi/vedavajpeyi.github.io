// SEO: Dynamic page titles
const pageTitles = {
    'home': 'Veda Vajpeyi — Product Strategy Grounded in Sociology',
    'about': 'About — Veda Vajpeyi',
    'case-studies': 'Case Studies — Veda Vajpeyi',
    'case-study-1': 'Crisis GTM: 50M Users in 13 Days — Veda Vajpeyi',
    'case-study-2': 'When the Metric Is the Problem — Veda Vajpeyi',
    'case-study-3': 'Making Existing Value Unmistakable — Veda Vajpeyi',
    'case-study-4': 'Designing for Trust in Voice Interfaces — Veda Vajpeyi',
    'case-study-5': 'Turning Regulatory Disruption Into a $2M Opportunity — Veda Vajpeyi',
    'writing': 'Writing — Veda Vajpeyi',
    'essay-1': 'The Metric That Was Hiding the Real Problem — Veda Vajpeyi',
    'essay-2': 'What Voice Interfaces Teach Us About Bad Product Thinking — Veda Vajpeyi',
    'essay-3': 'Teaching Leadership: What 120 First-Years Taught Me — Veda Vajpeyi',
    'essay-4': 'On Education, Transformation, and What Davos Got Right — Veda Vajpeyi',
    'books-beds': 'Books & Beds — Veda Vajpeyi',
    'work-with-me': 'Work With Me — Veda Vajpeyi',
    'product-advising': 'Product Strategy Advising — Veda Vajpeyi',
    'career-coaching': 'Career Coaching — Veda Vajpeyi',
    'mba-positioning': 'MBA Positioning — Veda Vajpeyi',
    'speaking': 'Speaking — Veda Vajpeyi',
    'college-admissions': 'College Admissions — Veda Vajpeyi',
    'contact': 'Contact — Veda Vajpeyi'
};

let currentPage = 'home';

function navigate(page) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));

    const targetPage = document.getElementById(page);
    if (targetPage) {
        targetPage.classList.add('active');
        window.location.hash = page || 'home';
        document.title = pageTitles[page] || pageTitles['home'];
        updateNavLinks(page);
        document.getElementById('nav').classList.remove('mobile-open');
        currentPage = page || 'home';
        window.scrollTo(0, 0);
        updateScrollNav();
        triggerScrollAnimations();
    }
}

function updateNavLinks(currentPage) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
}

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) || 'home';
    navigate(hash);
});

window.addEventListener('load', () => {
    const hash = window.location.hash.slice(1) || 'home';
    navigate(hash);
    updateScrollNav();
});

document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('nav').classList.toggle('mobile-open');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('nav').classList.remove('mobile-open');
    });
});

function updateScrollNav() {
    const nav = document.getElementById('nav');
    if (currentPage !== 'home' || window.scrollY > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', updateScrollNav);

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

function triggerScrollAnimations() {
    const activePage = document.querySelector('.page.active');
    if (activePage) {
        activePage.querySelectorAll('.fade-in, .card, .card-image, .timeline-item, .stat-card, .reveal-line').forEach(el => {
            el.classList.remove('visible');
            observer.observe(el);
        });
    }
}

triggerScrollAnimations();

// Accordion toggle for Work With Me
function toggleAccordion(header) {
    const item = header.parentElement;
    const isOpen = item.classList.contains('open');
    // Close all siblings
    item.parentElement.querySelectorAll('.wm-accordion-item').forEach(el => {
        el.classList.remove('open');
    });
    // Toggle clicked
    if (!isOpen) {
        item.classList.add('open');
    }
}
