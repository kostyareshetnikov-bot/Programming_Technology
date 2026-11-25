"""
Лабораторная работа №13. Коллекции и структуры данных.
Задание 3 (повышенный уровень), вариант 17: «История браузера».

Два стека: back (назад) и forward (вперёд).
Операции: переход по URL, назад, вперёд. При новом переходе стек forward очищается.
Дополнительная функция: полная история посещений (список всех открытых страниц).

Структуры данных: два стека на list (append/pop) + list для истории.
"""


def create_browser(home="home.page"):
    """Создаёт состояние браузера: текущая страница, два стека и история."""
    return {
        "current": home,
        "back": [],        # стек страниц для кнопки «Назад»
        "forward": [],     # стек страниц для кнопки «Вперёд»
        "history": [home], # полная история посещений (доп. функция)
    }


def visit(browser, url):
    """
    Переход по новому адресу.
    Текущая страница кладётся в стек back, стек forward очищается.
    Возвращает True при успехе, False при пустом URL или переходе на ту же страницу.
    """
    url = url.strip()
    if url == "" or url == browser["current"]:
        return False
    browser["back"].append(browser["current"])   # push — O(1)
    browser["current"] = url
    browser["forward"].clear()                   # новая ветка — «вперёд» больше некуда
    browser["history"].append(url)
    return True


def go_back(browser):
    """
    Кнопка «Назад»: текущая страница уходит в forward, из back достаётся предыдущая.
    Возвращает новую текущую страницу или None, если назад идти некуда.
    """
    if not browser["back"]:                      # пустой стек — безопасный выход
        return None
    browser["forward"].append(browser["current"])
    browser["current"] = browser["back"].pop()   # pop — O(1)
    browser["history"].append(browser["current"])
    return browser["current"]


def go_forward(browser):
    """
    Кнопка «Вперёд»: текущая страница уходит в back, из forward достаётся следующая.
    Возвращает новую текущую страницу или None, если вперёд идти некуда.
    """
    if not browser["forward"]:
        return None
    browser["back"].append(browser["current"])
    browser["current"] = browser["forward"].pop()
    browser["history"].append(browser["current"])
    return browser["current"]


def show_state(browser):
    """Показывает текущую страницу и содержимое обоих стеков."""
    print(f"Текущая страница: {browser['current']}")
    print(f"Стек «Назад»:  {browser['back'] if browser['back'] else 'пуст'}")
    print(f"Стек «Вперёд»: {browser['forward'] if browser['forward'] else 'пуст'}")


def show_history(browser):
    """Выводит полную историю посещений (дополнительная функция)."""
    print("История посещений:")
    for number, url in enumerate(browser["history"], start=1):
        print(f"  {number}. {url}")


def main():
    """Главное меню программы."""
    browser = create_browser()
    while True:
        print("\n=== История браузера ===")
        print(f"Сейчас открыто: {browser['current']}")
        print("1. Перейти по адресу")
        print("2. Назад")
        print("3. Вперёд")
        print("4. Показать стеки")
        print("5. История посещений")
        print("0. Выход")
        choice = input("Выберите пункт: ").strip()

        if choice == "1":
            url = input("Адрес: ")
            if visit(browser, url):
                print(f"Открыто: {browser['current']}")
            else:
                print("Пустой адрес или эта страница уже открыта.")
        elif choice == "2":
            page = go_back(browser)
            print(f"Открыто: {page}" if page else "Назад идти некуда.")
        elif choice == "3":
            page = go_forward(browser)
            print(f"Открыто: {page}" if page else "Вперёд идти некуда.")
        elif choice == "4":
            show_state(browser)
        elif choice == "5":
            show_history(browser)
        elif choice == "0":
            print("До свидания!")
            break
        else:
            print("Неверный пункт меню.")


if __name__ == "__main__":
    main()
