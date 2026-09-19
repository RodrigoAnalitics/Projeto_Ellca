document.addEventListener('DOMContentLoaded', () => {

    let currentSlide = 0;
    const items = document.querySelectorAll('.item');

    // Função para atualizar os cards ativos em slots fixos
    function updateCards(slide) {
        const wrapper = slide.querySelector('.cards-wrapper');
        const cards = wrapper.querySelectorAll('.glass-card');
        const cardsPerGroup = 2;

        // Determina grupo atual
        let currentGroup = wrapper.dataset.currentGroup ? parseInt(wrapper.dataset.currentGroup) : 0;
        const totalGroups = Math.ceil(cards.length / cardsPerGroup);

        // Esconde todos os cards
        cards.forEach(card => {
            card.classList.add('inactive');
            card.style.position = 'absolute';
            card.style.top = '0';
            card.style.left = '0';
        });

        // Ativa apenas os cards do grupo atual
        const startIndex = currentGroup * cardsPerGroup;
        for (let i = 0; i < cardsPerGroup; i++) {
            const card = cards[startIndex + i];
            if (card) {
                card.classList.remove('inactive');
                card.style.position = 'absolute';
                card.style.top = '0';
                card.style.left = `${i * (card.offsetWidth + 20)}px`; // 20px = gap entre cards
            }
        }

        // Salva grupo atual no wrapper
        wrapper.dataset.currentGroup = currentGroup;
        wrapper.dataset.totalGroups = totalGroups;

        // Ajusta altura do wrapper para caber cards ativos
        const activeCardsHeight = Math.max(...Array.from(cards)
            .filter(c => !c.classList.contains('inactive'))
            .map(c => c.offsetHeight));
        wrapper.style.height = `${activeCardsHeight}px`;
    }

    // Função para mostrar slide
    function showSlide(index) {
        items.forEach(item => item.classList.remove('active'));

        if (index >= items.length) currentSlide = 0;
        else if (index < 0) currentSlide = items.length - 1;
        else currentSlide = index;

        const slide = items[currentSlide];
        slide.classList.add('active');

        updateCards(slide);
    }

    // Botão NEXT
    document.querySelector('.next').addEventListener('click', () => {
        const slide = items[currentSlide];
        const wrapper = slide.querySelector('.cards-wrapper');
        let currentGroup = parseInt(wrapper.dataset.currentGroup);
        const totalGroups = parseInt(wrapper.dataset.totalGroups);

        if (currentGroup < totalGroups - 1) {
            wrapper.dataset.currentGroup = currentGroup + 1;
            updateCards(slide);
        } else {
            wrapper.dataset.currentGroup = 0;
            updateCards(slide);
            showSlide(currentSlide + 1);
        }
    });

    // Botão PREV
    document.querySelector('.prev').addEventListener('click', () => {
        const slide = items[currentSlide];
        const wrapper = slide.querySelector('.cards-wrapper');
        let currentGroup = parseInt(wrapper.dataset.currentGroup);

        if (currentGroup > 0) {
            wrapper.dataset.currentGroup = currentGroup - 1;
            updateCards(slide);
        } else {
            showSlide(currentSlide - 1);
            const newSlide = items[currentSlide];
            const newWrapper = newSlide.querySelector('.cards-wrapper');
            const totalGroups = Math.ceil(newWrapper.querySelectorAll('.glass-card').length / 2);
            newWrapper.dataset.currentGroup = totalGroups - 1;
            updateCards(newSlide);
        }
    });

    // Suporte teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') document.querySelector('.next').click();
        if (e.key === 'ArrowLeft') document.querySelector('.prev').click();
    });

    // Inicializa cada slide com grupo 0
    items.forEach(slide => {
        const wrapper = slide.querySelector('.cards-wrapper');
        wrapper.dataset.currentGroup = 0;
    });

    // Inicializa primeiro slide
    showSlide(currentSlide);

    // Ajusta no resize
    window.addEventListener('resize', () => {
        showSlide(currentSlide);
    });
});
