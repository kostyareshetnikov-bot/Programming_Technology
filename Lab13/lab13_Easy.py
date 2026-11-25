"""
Лабораторная работа №13. Коллекции и структуры данных.
Задание 1 (базовый уровень), вариант 5: «Очередь посетителей».

Операции: регистрация посетителя, обслуживание первого, просмотр очереди.
Дополнительная функция: журнал операций.

Структура данных: collections.deque (очередь FIFO).
"""

from collections import deque
from datetime import datetime


def add_log(log, text):
    """Добавляет запись в журнал операций с временем."""
    time = datetime.now().strftime("%H:%M:%S")
    log.append(f"[{time}] {text}")


def register_visitor(queue, name, log):
    """
    Регистрирует посетителя в конце очереди.
    Возвращает True, если посетитель добавлен, иначе False.
    """
    name = name.strip()
    if name == "":
        add_log(log, "Ошибка: попытка добавить пустое имя")
        return False
    if name in queue:
        add_log(log, f"Ошибка: {name} уже стоит в очереди")
        return False
    queue.append(name)                      # добавление в конец очереди — O(1)
    add_log(log, f"Зарегистрирован: {name}")
    return True


def serve_visitor(queue, log):
    """
    Обслуживает первого посетителя (удаляет из начала очереди).
    Возвращает имя обслуженного или None, если очередь пуста.
    """
    if not queue:                           # проверка пустой очереди
        add_log(log, "Ошибка: очередь пуста, обслуживать некого")
        return None
    name = queue.popleft()                  # извлечение из начала — O(1)
    add_log(log, f"Обслужен: {name}")
    return name


def show_queue(queue):
    """Выводит очередь на экран."""
    if not queue:
        print("Очередь пуста.")
        return
    print(f"В очереди {len(queue)} чел.:")
    for number, name in enumerate(queue, start=1):
        print(f"  {number}. {name}")


def show_log(log):
    """Выводит журнал операций (дополнительная функция)."""
    if not log:
        print("Журнал пуст.")
        return
    print("Журнал операций:")
    for record in log:
        print("  " + record)


def main():
    """Главное меню программы."""
    queue = deque()
    log = []
    while True:
        print("\n=== Очередь посетителей ===")
        print("1. Зарегистрировать посетителя")
        print("2. Обслужить первого")
        print("3. Показать очередь")
        print("4. Журнал операций")
        print("0. Выход")
        choice = input("Выберите пункт: ").strip()

        if choice == "1":
            name = input("Имя посетителя: ")
            if register_visitor(queue, name, log):
                print("Посетитель добавлен в очередь.")
            else:
                print("Не удалось добавить: пустое имя или посетитель уже в очереди.")
        elif choice == "2":
            name = serve_visitor(queue, log)
            print(f"Обслужен: {name}" if name else "Очередь пуста.")
        elif choice == "3":
            show_queue(queue)
        elif choice == "4":
            show_log(log)
        elif choice == "0":
            print("До свидания!")
            break
        else:
            print("Неверный пункт меню.")


if __name__ == "__main__":
    main()
