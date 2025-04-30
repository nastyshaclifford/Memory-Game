const emogis = ['💖', '🌸', '💗', '🌷', '🎀', '🦄', '🥰', '💅', '🍬', '👚', '💓', '🐩'];

let numberOfCards = 0;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let timer = null;
let seconds = 0;

function startGame() {
    const width = parseInt(document.getElementById('width').value);
    const height = parseInt(document.getElementById('height').value);
    moves = 0;
    document.getElementById('moves').textContent = 'Ходов: 0';

    // Проверка стандартных ограничений
    if (isOutOfRange(width, 4, 11)) {
        alert('Ширина должна быть от 4 до 11');
        return;
    }

    if (isOutOfRange(height, 3, 6)) {
        alert('Высота должна быть от 3 до 6');
        return;
    }

    // Адаптация для мобильных устройств
    if (window.innerWidth <= 768) {
        let cardSize;
        if (window.innerWidth <= 480) {
            cardSize = 50;
        } else {
            cardSize = 60;
        }
        
        // Рассчитываем доступное пространство
        const headerHeight = 120;
        const controlsHeight = 180;
        const padding = 40;
        const availableHeight = window.innerHeight - headerHeight - controlsHeight - padding;
        
        const maxWidth = Math.min(11, Math.floor((window.innerWidth - padding) / cardSize));
        const maxHeight = Math.min(6, Math.floor(availableHeight / cardSize));
        
        if (width > maxWidth || height > maxHeight) {
            alert(`Для вашего устройства рекомендуемый размер: ${maxWidth}x${maxHeight}`);
            return;
        }
    }

    reset();
    setupBoard(width, height);

    clearInterval(timer); 
    seconds = 0;
    document.getElementById('timer').textContent = 'Время: 0 сек';
    timer = setInterval(() => {
        seconds++;
        document.getElementById('timer').textContent = `Время: ${seconds} сек`;
    }, 1000);
}

function setupBoard(width, height) {
    const board = document.getElementById('board');
    board.innerHTML = '';
    
    // Размер карточки с учетом устройства
    let cardSize;
    if (window.innerWidth <= 480) {
        cardSize = 50;
    } else if (window.innerWidth <= 768) {
        cardSize = 60;
    } else {
        cardSize = 100;
    }
    
    // Дополнительная проверка для вертикальных экранов
    if (window.innerHeight < 600) {
        cardSize = Math.min(cardSize, Math.floor((window.innerHeight - 300) / height));
    }
    
    // Минимальный размер карточки
    cardSize = Math.max(40, cardSize);
    
    board.style.gridTemplateColumns = `repeat(${width}, ${cardSize}px)`;
    board.style.gridTemplateRows = `repeat(${height}, ${cardSize}px)`;

    numberOfCards = width * height;

    const selectedEmojis = shuffleArray(emogis).slice(0, Math.floor(numberOfCards / 2));
    const doubleEmojis = [...selectedEmojis, ...selectedEmojis]; 

    if (numberOfCards % 2 === 1) {
        doubleEmojis.push('');
    }

    const gameEmojis = shuffleArray(doubleEmojis);

    gameEmojis.forEach((emoji) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.emoji = emoji;
        card.style.width = `${cardSize}px`;
        card.style.height = `${cardSize}px`;

        const emojiElement = document.createElement('span');
        emojiElement.textContent = emoji;
        emojiElement.classList.add('hidden');
        card.appendChild(emojiElement);

        card.addEventListener('click', () => flipCard(card, emojiElement));

        board.appendChild(card);
    });
}

function flipCard(card, emojiElement) {
    if (lockBoard === true || card === firstCard || card.classList.contains('matched')) {
        return;
    }

    card.classList.add('flipped');
    emojiElement.classList.remove('hidden');

    if (firstCard === null) {
        firstCard = card;
    } else {
        secondCard = card;
        checkForMatch();
    }
}

function checkForMatch() {
    moves++;
    document.getElementById('moves').textContent = `Ходов: ${moves}`;
    const match = firstCard.dataset.emoji === secondCard.dataset.emoji;

    if (match) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');

    firstCard.querySelector('span').classList.remove('hidden');
    secondCard.querySelector('span').classList.remove('hidden');

    const totalMatched = document.querySelectorAll('.card.matched').length;
    const totalPlayable = document.querySelectorAll('.card:not([data-emoji=""])').length;
    if (totalMatched === totalPlayable) {
        clearInterval(timer);
        setTimeout(() => {
            alert('Ура! Игра успешно завершена! Ты молодец!');
        }, 500);
    }
    reset();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');

        firstCard.querySelector('span').classList.add('hidden');
        secondCard.querySelector('span').classList.add('hidden');

        reset();
    }, 1000);
}

function reset() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

function isOutOfRange(val, minVal, maxVal) {
    return val < minVal || val > maxVal;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Обработчик изменения размера окна
window.addEventListener('resize', function() {
    if (document.querySelectorAll('.card').length > 0) {
        const width = parseInt(document.getElementById('width').value);
        const height = parseInt(document.getElementById('height').value);
        setupBoard(width, height);
    }
});

document.getElementById('start-button').addEventListener('click', startGame);