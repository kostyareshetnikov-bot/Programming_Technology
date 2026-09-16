class Book:
    def __init__(self, title: str, author: str):
        self.title = title
        self.author = author

    def __str__(self) -> str:
        return f"«{self.title}» — {self.author}"


class Library:
    def __init__(self):
        self.books: list[Book] = [] 

    def add_book(self, title: str, author: str):
        title = title.strip()
        author = author.strip()

        if not title or not author:
            print("Ошибка: Название и автор не могут быть пустыми.")
            return

        for book in self.books:
            if book.title.lower() == title.lower():
                print(f"Книга «{title}» уже есть в коллекции.")
                return

        new_book = Book(title, author)
        self.books.append(new_book)
        print(f"Книга добавлена: {new_book}")

    def remove_book(self, title: str) -> bool:
        title_clean = title.strip().lower()

        for book in self.books:
            if book.title.lower() == title_clean:
                self.books.remove(book)
                print(f"Книга «{book.title}» успешно удалена.")
                return True

        print(f"Книга с названием «{title}» не найдена.")
        return False

    def search_by_title(self, title: str):
        title_clean = title.strip().lower()
        results = [book for book in self.books if title_clean in b.title.lower()]

        if results:
            print(f"\n--- Найдено совпадений: {len(results)} ---")
            for book in results:
                print(f"- {book}")
        else:
            print(f"Книги с названием «{title}» не найдены.")

    def show_all(self):
        """Просмотр всей коллекции."""
        if not self.books:
            print("Коллекция книг пуста.")
            return

        print("\n--- Коллекция книг ---")
        for i, book in enumerate(self.books, start=1):
            print(f"{i}. {book}")

if __name__ == "__main__":
    library = Library()

    # Начальные данные
    library.add_book("1984", "Джордж Оруэлл")
    library.add_book("Мастер и Маргарита", "Михаил Булгаков")

    while True:
        print("\n=== БИБЛИОТЕКА ===")
        print("1. Показать все книги")
        print("2. Добавить книгу")
        print("3. Удалить книгу по названию")
        print("4. Найти книгу по названию")
        print("0. Выход")

        choice = input("Выберите действие (0-4): ").strip()

        if choice == "1":
            library.show_all()

        elif choice == "2":
            t = input("Введите название книги: ")
            a = input("Введите автора: ")
            library.add_book(t, a)

        elif choice == "3":
            t = input("Введите название книги для удаления: ")
            library.remove_book(t)

        elif choice == "4":
            t = input("Введите название (или его часть) для поиска: ")
            library.search_by_title(t)

        elif choice == "0":
            print("Работа завершена.")
            break

        else:
            print("Неверный выбор. Попробуйте снова.")
