document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.header-menu-button');
    const menu = document.querySelector('.header-menu');
    const heroScrollMore = document.querySelector('.hero-scroll-more');
    const featuresSlider = document.querySelector('.js-features-swiper');

    if (heroScrollMore) {
        heroScrollMore.addEventListener('click', (event) => {
            const targetSelector = heroScrollMore.getAttribute('href');

            if (!targetSelector || !targetSelector.startsWith('#')) {
                return;
            }

            const targetSection = document.querySelector(targetSelector);

            if (!targetSection) {
                return;
            }

            event.preventDefault();
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        });
    }

    if (featuresSlider && typeof Swiper !== 'undefined') {
        new Swiper(featuresSlider, {
            slidesPerView: 1,
            loop: true,
            navigation: {
                prevEl: featuresSlider.querySelector('.features-slider-button-prev'),
                nextEl: featuresSlider.querySelector('.features-slider-button-next'),
            },
            pagination: {
                el: featuresSlider.querySelector('.features-slider-pagination'),
                type: 'fraction',
            },
        });
    }

    if (!menuButton || !menu) {
        return;
    }

    const setMenuState = (isOpen) => {
        menu.classList.toggle('active', isOpen);
        menuButton.classList.toggle('active', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
        menuButton.setAttribute('aria-expanded', String(isOpen));
        menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    };

    menuButton.addEventListener('click', () => {
        const isOpen = !menu.classList.contains('active');

        setMenuState(isOpen);
    });

    menu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            setMenuState(false);
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            setMenuState(false);
        }
    });
});
