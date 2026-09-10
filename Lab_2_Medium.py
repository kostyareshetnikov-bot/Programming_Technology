price = int(input("Введите товар: "))
kolvo = int(input("Введите кол-во:"))
sale  = int(input("Введите процент скидки:"))

first_price = price // kolvo
sum_sale = (price * sale)//100
sum_pirce = price - sum_sale

print(f"Результат обработки: Первоначальная стоимость = {first_price}, Сумма скидки = {sum_sale}, Итоговая стоимость = {sum_pirce}")
