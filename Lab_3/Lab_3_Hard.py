class Library:
    def __init__(self, name: str):
        self.name = name
        self.books = []

    def add_book(self, title: str):
        self.books.append(title)
        print(f"Книга '{title}' добавлена в библиотеку '{self.name}'.")

    def remove_book(self, title: str):
        if title in self.books:
            self.books.remove(title)
            print(f"Книга '{title}' удалена из библиотеки.")
        else:
            print(f"Книга '{title}' не найдена в библиотеке.")

    def search_book(self, title: str) -> bool:
        found = title in self.books
        if found:
            print(f"Книга '{title}' найдена в наличии.")
        else:
            print(f"Книга '{title}' отсутствует.")
        return found


# Демонстрация работы
if __name__ == "__main__":
    lib = Library("Городская Библиотека")
    lib.add_book("Чистый код")
    lib.add_book("Изучаем Python")
    lib.search_book("Чистый код")
    lib.remove_book("Чистый код")
    lib.search_book("Чистый код")
