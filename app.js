document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const bookList = document.getElementById('book-list');
    const categoryButtons = document.querySelectorAll('.category');
    const form = document.getElementById('form');
    const modal = document.getElementById('borrow-modal');
    const modalClose = document.querySelector('.close');
    const borrowForm = document.getElementById('borrow-form');

    let books = JSON.parse(localStorage.getItem('books')) || [];

    const saveBooks = () => {
        localStorage.setItem('books', JSON.stringify(books));
    };

    const displayBooks = (booksToDisplay) => {
        bookList.innerHTML = '';
        booksToDisplay.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.className = 'book';
            bookElement.innerHTML = `
                <h3>${book.title}</h3>
                <p>Author: ${book.author}</p>
                <p>Genre: ${book.genre}</p>
                <p>ISBN: ${book.ISBN}</p>
                <p>Borrowed: ${book.borrowed ? book.borrowed : 'N/A'}</p>
                <p>Returned: ${book.returned ? book.returned : 'N/A'}</p>
                <p>Status: ${book.borrowed && !book.returned ? 'Borrowed' : 'Available'}</p>
                <button class="borrow-button" ${book.borrowed && !book.returned ? 'disabled' : ''} data-index="${books.indexOf(book)}">Borrow</button>
            `;
            bookList.appendChild(bookElement);
        });

        document.querySelectorAll('.borrow-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const bookIndex = e.target.dataset.index;
                openModal(bookIndex);
            });
        });
    };

    const filterBooks = (searchTerm, category) => {
        return books.filter(book =>
            (category === 'all' ||
                (category === 'available' && (!book.borrowed || book.returned)) ||
                (category === 'borrowed' && book.borrowed && !book.returned)) &&
            (book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm) ||
                book.genre.toLowerCase().includes(searchTerm) ||
                book.ISBN.toLowerCase().includes(searchTerm))
        );
    };

    const openModal = (bookIndex) => {
        modal.style.display = "block";
        borrowForm.dataset.bookIndex = bookIndex;
    };

    const closeModal = () => {
        modal.style.display = "none";
    };

    modalClose.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });

    borrowForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const bookIndex = borrowForm.dataset.bookIndex;
        const borrower = document.getElementById('borrower').value;
        const returnDate = document.getElementById('return-date').value;
        books[bookIndex].borrowed = borrower;
        books[bookIndex].returned = null;  // Set returned to null when borrowed
        saveBooks();
        closeModal();
        const activeCategory = document.querySelector('.category.active').dataset.category;
        const searchTerm = searchInput.value.toLowerCase();
        const filteredBooks = filterBooks(searchTerm, activeCategory);
        displayBooks(filteredBooks);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newBook = {
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            genre: document.getElementById('genre').value,
            ISBN: document.getElementById('ISBN').value,
            borrowed: null,
            returned: null
        };
        books.push(newBook);
        saveBooks();
        form.reset();
        const activeCategory = document.querySelector('.category.active').dataset.category;
        const searchTerm = searchInput.value.toLowerCase();
        const filteredBooks = filterBooks(searchTerm, activeCategory);
        displayBooks(filteredBooks);
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const activeCategory = document.querySelector('.category.active').dataset.category;
        const filteredBooks = filterBooks(searchTerm, activeCategory);
        displayBooks(filteredBooks);
    });

    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            const activeCategory = e.target.dataset.category;
            const searchTerm = searchInput.value.toLowerCase();
            const filteredBooks = filterBooks(searchTerm, activeCategory);
            displayBooks(filteredBooks);
        });
    });

    // Set initial active category
    categoryButtons[0].classList.add('active');

    // Initial display of books
    displayBooks(filterBooks(searchInput.value.toLowerCase(), 'all'));
});
