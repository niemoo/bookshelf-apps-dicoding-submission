const books = [];
const RENDER_EVENT = 'render-books';
const SAVED_EVENT = 'saved-books';
const STORAGE_KEY = 'BOOKS_APPS';
let searchQuery = '';
let filteredBooks = [];

const generateID = () => {
  return +new Date();
};

const generateBookObject = (id, title, author, year, isCompleted) => {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
};

const findBook = (bookId) => {
  for (const book of books) {
    if (book.id === bookId) return book;
  }

  return null;
};

const findBookIndex = (bookId) => {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
};

const addBook = () => {
  const title = document.getElementById('title').value;
  const author = document.getElementById('author').value;
  const year = document.getElementById('year').value;

  const generatedID = generateID();
  const bookObject = generateBookObject(generatedID, title, author, year, false);

  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const makeBookContainer = (bookObject) => {
  const bookTitle = document.createElement('h3');
  bookTitle.classList.add('title-container');
  bookTitle.innerText = bookObject.title;

  const bookContainer = document.createElement('div');
  bookContainer.classList.add('book-container');
  bookContainer.setAttribute('id', `book-${bookObject.id}`);

  const leftContainer = document.createElement('div');
  leftContainer.classList.add('left-container');

  const rightContainer = document.createElement('div');
  rightContainer.classList.add('right-container');

  const littleContainer = document.createElement('div');
  littleContainer.classList.add('little-container');

  const authorBox = document.createElement('div');
  authorBox.classList.add('author-box');

  const authorIcon = document.createElement('i');
  authorIcon.classList.add('author-icon', 'fa-solid', 'fa-user-pen');

  const bookAuthor = document.createElement('p');
  bookAuthor.classList.add('author-text');
  bookAuthor.innerText = bookObject.author;

  const yearBox = document.createElement('div');
  yearBox.classList.add('year-box');

  const bookYear = document.createElement('p');
  bookYear.innerText = bookObject.year;

  yearBox.append(bookYear);
  authorBox.append(authorIcon, bookAuthor);
  littleContainer.append(authorBox, yearBox);
  leftContainer.append(bookTitle, littleContainer);
  bookContainer.append(leftContainer);

  if (bookObject.isCompleted) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
    const undoIcon = document.createElement('i');
    undoIcon.classList.add('fa-solid', 'fa-arrow-rotate-left');
    undoButton.append(undoIcon);

    const editButton = document.createElement('button');
    editButton.classList.add('undo-button');
    const editIcon = document.createElement('i');
    editIcon.classList.add('fa-solid', 'fa-pen');
    editButton.append(editIcon);

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    const trashIcon = document.createElement('i');
    trashIcon.classList.add('fa-solid', 'fa-trash-can');
    trashButton.append(trashIcon);

    undoButton.addEventListener('click', () => {
      undoBookFromCompleted(bookObject.id);
    });

    trashButton.addEventListener('click', () => {
      removeBook(bookObject.id);
    });

    rightContainer.append(undoButton, editButton, trashButton);
    bookContainer.append(rightContainer);
  } else {
    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');
    const checkIcon = document.createElement('i');
    checkIcon.classList.add('fa-solid', 'fa-check');
    checkButton.append(checkIcon);

    const editButton = document.createElement('button');
    editButton.classList.add('undo-button');
    const editIcon = document.createElement('i');
    editIcon.classList.add('fa-solid', 'fa-pen');
    editButton.append(editIcon);

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    const trashIcon = document.createElement('i');
    trashIcon.classList.add('fa-solid', 'fa-trash-can');
    trashButton.append(trashIcon);

    checkButton.addEventListener('click', () => {
      addBookToCompleted(bookObject.id);
    });

    trashButton.addEventListener('click', () => {
      removeBook(bookObject.id);
    });

    rightContainer.append(checkButton, editButton, trashButton);
    bookContainer.append(rightContainer);
  }

  return bookContainer;
};

const addBookToCompleted = (bookId) => {
  const bookTarget = findBook(bookId);

  if (bookTarget === null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const undoBookFromCompleted = (bookId) => {
  const bookTarget = findBook(bookId);

  if (bookTarget === null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const removeBook = (bookId) => {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === null) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

document.addEventListener('DOMContentLoaded', () => {
  const submitForm = document.getElementById('form');
  const triggerOpenButton = document.getElementById('trigger-open-button');
  const triggerCloseButton = document.getElementById('trigger-close-button');
  const searchInput = document.getElementById('search');

  triggerOpenButton.addEventListener('click', () => {
    openFormDialog();
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('form-container').style.display = 'block';
  });

  triggerCloseButton.addEventListener('click', () => {
    closeFormDialog();
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('form-container').style.display = 'none';
    document.getElementById('title').value = '';
    document.getElementById('author').value = '';
    document.getElementById('year').value = '';
  });

  searchInput.addEventListener('input', handleSearchInput);

  searchInput.addEventListener('focus', () => {
    searchInput.classList.remove('border-gray-200');
    searchInput.classList.add('border-blue-500');
  });

  searchInput.addEventListener('blur', () => {
    searchInput.classList.remove('border-blue-500');
    searchInput.classList.add('border-gray-200');
  });

  submitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addBook();
  });

  document.addEventListener(RENDER_EVENT, () => {
    const uncompletedReadBooks = document.getElementById('books');
    uncompletedReadBooks.innerHTML = '';

    const completedReadBooks = document.getElementById('completed-books');
    completedReadBooks.innerHTML = '';
    const uncompletedInfo = document.getElementById('uncompleted-info');
    const completedInfo = document.getElementById('completed-info');

    let hasUncompletedBooks = false;
    let hasCompletedBooks = false;

    for (const book of books) {
      const bookElement = makeBookContainer(book);

      if (!book.isCompleted) {
        bookElement.addEventListener('mouseover', () => {
          bookElement.style.backgroundColor = 'rgb(191, 235, 255)';
        });

        bookElement.addEventListener('mouseout', () => {
          bookElement.style.backgroundColor = '';
        });

        uncompletedReadBooks.append(bookElement);
        hasUncompletedBooks = true;
      } else {
        bookElement.addEventListener('mouseover', () => {
          bookElement.style.backgroundColor = 'rgb(228, 255, 230)';
        });

        bookElement.addEventListener('mouseout', () => {
          bookElement.style.backgroundColor = '';
        });

        completedReadBooks.append(bookElement);
        hasCompletedBooks = true;
      }
    }

    if (hasUncompletedBooks) {
      uncompletedInfo.setAttribute('hidden', true);
    } else {
      uncompletedInfo.removeAttribute('hidden');
    }

    if (hasCompletedBooks) {
      completedInfo.setAttribute('hidden', true);
    } else {
      completedInfo.removeAttribute('hidden');
    }
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

const saveData = () => {
  if (isStorageExist()) {
    const parsedData = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsedData);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
};

const isStorageExist = () => {
  if (typeof Storage === undefined) {
    alert('Your browser does not support local storage');
    return false;
  }

  return true;
};

const loadDataFromStorage = () => {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
};

const openFormDialog = () => {
  const formContainer = document.getElementById('form-container');
  formContainer.removeAttribute('hidden');
};

const closeFormDialog = () => {
  const formContainer = document.getElementById('form-container');
  formContainer.setAttribute('hidden', true);
};

const filterBooks = () => {
  filteredBooks = books.filter((book) => {
    return book.title.toLowerCase().includes(searchQuery);
  });
};

const handleSearchInput = (e) => {
  searchQuery = e.target.value.toLowerCase();
  filterBooks();
  renderBooks();
};

const renderBooks = () => {
  const uncompletedReadBooks = document.getElementById('books');
  uncompletedReadBooks.innerHTML = '';

  const completedReadBooks = document.getElementById('completed-books');
  completedReadBooks.innerHTML = '';

  for (const book of filteredBooks) {
    const bookElement = makeBookContainer(book);

    if (!book.isCompleted) {
      uncompletedReadBooks.append(bookElement);
    } else {
      completedReadBooks.append(bookElement);
    }
  }
};
