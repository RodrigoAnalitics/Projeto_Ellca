document.addEventListener('DOMContentLoaded', () => {
    let currentSlide = 0;
    const items = document.querySelectorAll('.item');
    let isAnimating = false; // Controle anti-spam de cliques

    // ==========================================
    // Lógica Central do Carrossel 3D
    // ==========================================
    function updateCarousel(slide) {
        const wrapper = slide.querySelector('.cards-wrapper');
        
        // Aborta se não houver wrapper ou se estiver no modo grade
        if (!wrapper || wrapper.classList.contains('grid-mode')) return;

        const cards = wrapper.querySelectorAll('.glass-card');
        const totalCards = cards.length;
        if (totalCards === 0) return;

        let activeIndex = parseInt(wrapper.dataset.activeIndex || 0);

        cards.forEach((card, i) => {
            // Limpa classes de estado e readiciona a classe base oculta
            card.className = card.className.replace(/card-hidden|card-front|card-back-right|card-back-left/g, '').trim();
            card.classList.add('card-hidden');

            // Calcula posições circulares exatas
            if (i === activeIndex) {
                card.classList.remove('card-hidden');
                card.classList.add('card-front');
            } else if (i === (activeIndex + 1) % totalCards) {
                card.classList.remove('card-hidden');
                card.classList.add('card-back-right');
            } else if (i === (activeIndex - 1 + totalCards) % totalCards) {
                card.classList.remove('card-hidden');
                card.classList.add('card-back-left');
            }
        });

        updatePaginationDots(totalCards, activeIndex);
        
        // Libera cliques após o término da transição CSS (baseado no transition de 0.8s do CSS)
        setTimeout(() => { isAnimating = false; }, 400); 
    }

    // ==========================================
    // Paginação (Dots)
    // ==========================================
    function updatePaginationDots(totalCards, activeIndex) {
        const dotsContainer = document.querySelector('.pagination-dots');
        if (!dotsContainer) return;

        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalCards; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === activeIndex) dot.classList.add('active');
            
            dot.addEventListener('click', () => {
                if (isAnimating || i === activeIndex) return;
                const slide = items[currentSlide];
                const wrapper = slide.querySelector('.cards-wrapper');
                if (wrapper.classList.contains('grid-mode')) return;
                
                isAnimating = true;
                wrapper.dataset.activeIndex = i;
                updateCarousel(slide);
            });
            dotsContainer.appendChild(dot);
        }
    }

    // ==========================================
    // Navegação (Next / Prev) com Anti-Spam
    // ==========================================
    const navigateCarousel = (direction) => {
        if (isAnimating) return;
        
        const slide = items[currentSlide];
        const wrapper = slide.querySelector('.cards-wrapper');
        if (!wrapper || wrapper.classList.contains('grid-mode')) return;

        const cards = wrapper.querySelectorAll('.glass-card');
        if (cards.length === 0) return;

        isAnimating = true;
        let activeIndex = parseInt(wrapper.dataset.activeIndex || 0);

        if (direction === 'next') {
            wrapper.dataset.activeIndex = (activeIndex < cards.length - 1) ? activeIndex + 1 : 0;
        } else {
            wrapper.dataset.activeIndex = (activeIndex > 0) ? activeIndex - 1 : cards.length - 1;
        }
        
        updateCarousel(slide);
    };

    const nextBtn = document.querySelector('.next');
    const prevBtn = document.querySelector('.prev');

    if (nextBtn) nextBtn.addEventListener('click', () => navigateCarousel('next'));
    if (prevBtn) prevBtn.addEventListener('click', () => navigateCarousel('prev'));

    // ==========================================
    // Alternar Modo Grade / 3D
    // ==========================================
    const gridToggleBtn = document.querySelector('.grid-toggle-btn');
    if (gridToggleBtn) {
        gridToggleBtn.addEventListener('click', () => {
            const slide = items[currentSlide];
            const wrapper = slide.querySelector('.cards-wrapper');
            const controlsContainer = document.querySelector('.controls-container');
            if (!wrapper) return;

            wrapper.classList.toggle('grid-mode');

            if (wrapper.classList.contains('grid-mode')) {
                // Modo grade: reseta z-index e remove classes 3D que possam causar conflito
                wrapper.querySelectorAll('.glass-card').forEach(card => {
                    card.classList.remove('card-front', 'search-highlight');
                });
                if (controlsContainer) controlsContainer.style.display = 'none';
            } else {
                // Retorna ao modo 3D
                if (controlsContainer) controlsContainer.style.display = 'flex';
                updateCarousel(slide);
            }
        });
    }

    // ==========================================
    // Barra de Pesquisa com Debounce Otimizado
    // ==========================================
    const searchInput = document.getElementById('cardSearch');
    let searchTimeout;

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const term = e.target.value.toLowerCase().trim();
            const slide = items[currentSlide];
            const wrapper = slide.querySelector('.cards-wrapper');
            const cards = wrapper.querySelectorAll('.glass-card');

            // Debounce: Aguarda o usuário parar de digitar (300ms) para calcular
            searchTimeout = setTimeout(() => {
                cards.forEach(card => card.classList.remove('search-highlight'));
                if (!term) return;

                let foundMatch = false;

                cards.forEach((card, index) => {
                    const titleText = card.querySelector('h3') ? card.querySelector('h3').textContent.toLowerCase() : '';
                    const descText = card.querySelector('.card-desc') ? card.querySelector('.card-desc').textContent.toLowerCase() : '';
                    const dataTags = card.getAttribute('data-title') ? card.getAttribute('data-title').toLowerCase() : '';

                    if (titleText.includes(term) || descText.includes(term) || dataTags.includes(term)) {
                        card.classList.add('search-highlight');
                        
                        // Rotaciona o carrossel apenas para o primeiro item encontrado para não travar
                        if (!foundMatch && !wrapper.classList.contains('grid-mode')) {
                            wrapper.dataset.activeIndex = index;
                            updateCarousel(slide);
                            foundMatch = true;
                        }
                    }
                });
            }, 300); // 300ms de atraso intencional
        });
    }

    // ==========================================
    // Efeito Spotlight - Alta Performance (requestAnimationFrame)
    // ==========================================
    let ticking = false;
    document.addEventListener('mousemove', (e) => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const frontCard = document.querySelector('.glass-card.card-front');
                if (frontCard && !frontCard.closest('.grid-mode')) {
                    const rect = frontCard.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    frontCard.style.setProperty('--x', `${x}px`);
                    frontCard.style.setProperty('--y', `${y}px`);
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    // ==========================================
    // Swipe Touchscreen (Celulares/Tablets)
    // ==========================================
    let touchStartX = 0;
    let touchEndX = 0;

    const cardsWrapper = document.querySelector('.cards-section');
    if (cardsWrapper) {
        cardsWrapper.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        cardsWrapper.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        // Se a distância do arrasto for maior que 50px
        if (touchEndX < touchStartX - 50) navigateCarousel('next');
        if (touchEndX > touchStartX + 50) navigateCarousel('prev');
    }

    // ==========================================
    // Atalhos de Teclado
    // ==========================================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') navigateCarousel('next');
        if (e.key === 'ArrowLeft') navigateCarousel('prev');
    });

    // ==========================================
    // Inicialização
    // ==========================================
    items.forEach(slide => {
        const wrapper = slide.querySelector('.cards-wrapper');
        if (wrapper) wrapper.dataset.activeIndex = 0;
        updateCarousel(slide);
    });
});