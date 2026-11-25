"""
Лабораторная работа №13. Коллекции и структуры данных.
Задание 2 (средний уровень), вариант 10: «Склад».

Словарь: артикул -> {"name": название, "qty": количество, "price": цена}.
Операции: поступление, продажа, расчёт стоимости запасов, просмотр.
Дополнительная функция: сохранение и загрузка склада в JSON.

Структура данных: dict с вложенными словарями.
"""

import json
import os

DATA_FILE = "warehouse.json"


def receive_goods(store, sku, name, qty, price):
    """
    Поступление товара.
    Если артикул новый — создаётся запись, если есть — увеличивается количество
    (цена обновляется на новую).
    Возвращает строку с результатом.
    """
    sku = sku.strip().upper()
    if sku == "":
        return "Ошибка: пустой артикул"
    if qty <= 0:
        return "Ошибка: количество должно быть больше 0"
    if price < 0:
        return "Ошибка: цена не может быть отрицательной"

    if sku in store:                        # поиск по ключу — O(1)
        store[sku]["qty"] += qty
        store[sku]["price"] = price
        return f"Пополнено: {store[sku]['name']}, теперь {store[sku]['qty']} шт."

    if name.strip() == "":
        return "Ошибка: для нового товара нужно название"
    store[sku] = {"name": name.strip(), "qty": qty, "price": price}
    return f"Добавлен новый товар: {name.strip()}"


def sell_goods(store, sku, qty):
    """
    Продажа товара: уменьшает количество на складе.
    Возвращает строку с результатом.
    """
    sku = sku.strip().upper()
    if sku not in store:                    # отсутствующий ключ
        return "Ошибка: товар с таким артикулом не найден"
    if qty <= 0:
        return "Ошибка: количество должно быть больше 0"
    if qty > store[sku]["qty"]:
        return f"Ошибка: на складе только {store[sku]['qty']} шт."
    store[sku]["qty"] -= qty
    total = qty * store[sku]["price"]
    return f"Продано {qty} шт. на сумму {total:.2f}"


def stock_value(store):
    """Считает общую стоимость всех запасов: сумма (количество * цена)."""
    return sum(item["qty"] * item["price"] for item in store.values())


def show_store(store):
    """Выводит содержимое склада в виде таблицы."""
    if not store:
        print("Склад пуст.")
        return
    print(f"{'Артикул':<10}{'Название':<20}{'Кол-во':>8}{'Цена':>12}{'Сумма':>14}")
    for sku, item in sorted(store.items()):
        summa = item["qty"] * item["price"]
        print(f"{sku:<10}{item['name']:<20}{item['qty']:>8}{item['price']:>12.2f}{summa:>14.2f}")
    print(f"Общая стоимость запасов: {stock_value(store):.2f}")


def save_to_json(store, filename=DATA_FILE):
    """Сохраняет склад в JSON-файл (дополнительная функция)."""
    with open(filename, "w", encoding="utf-8") as file:
        json.dump(store, file, ensure_ascii=False, indent=4)
    return f"Склад сохранён в {filename}"


def load_from_json(filename=DATA_FILE):
    """
    Загружает склад из JSON-файла.
    Если файла нет или он повреждён — возвращает пустой словарь.
    """
    if not os.path.exists(filename):
        return {}
    try:
        with open(filename, "r", encoding="utf-8") as file:
            return json.load(file)
    except (json.JSONDecodeError, OSError):
        return {}


def input_int(prompt):
    """Безопасный ввод целого числа."""
    while True:
        try:
            return int(input(prompt))
        except ValueError:
            print("Введите целое число.")


def input_float(prompt):
    """Безопасный ввод дробного числа (можно через запятую)."""
    while True:
        try:
            return float(input(prompt).replace(",", "."))
        except ValueError:
            print("Введите число.")


def main():
    """Главное меню программы."""
    store = load_from_json()
    if store:
        print(f"Загружено товаров из {DATA_FILE}: {len(store)}")
    while True:
        print("\n=== Склад ===")
        print("1. Поступление товара")
        print("2. Продажа товара")
        print("3. Показать склад")
        print("4. Стоимость запасов")
        print("5. Сохранить в JSON")
        print("6. Загрузить из JSON")
        print("0. Выход")
        choice = input("Выберите пункт: ").strip()

        if choice == "1":
            sku = input("Артикул: ")
            name = input("Название (для существующего можно пусто): ")
            qty = input_int("Количество: ")
            price = input_float("Цена: ")
            print(receive_goods(store, sku, name, qty, price))
        elif choice == "2":
            sku = input("Артикул: ")
            qty = input_int("Количество: ")
            print(sell_goods(store, sku, qty))
        elif choice == "3":
            show_store(store)
        elif choice == "4":
            print(f"Стоимость запасов: {stock_value(store):.2f}")
        elif choice == "5":
            print(save_to_json(store))
        elif choice == "6":
            store = load_from_json()
            print(f"Загружено товаров: {len(store)}")
        elif choice == "0":
            print("До свидания!")
            break
        else:
            print("Неверный пункт меню.")


if __name__ == "__main__":
    main()
