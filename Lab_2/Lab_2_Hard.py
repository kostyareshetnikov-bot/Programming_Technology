sum_vklad = int(input("Введите сумму вклада: "))
stavka = int(input("Введите годовую ставку:"))
godini  = int(input("Введите срок в годах:"))

sum_itog = sum_vklad * (1 + stavka/100)*godini

print(f"Результат обработки: Итоговая сумма (со сложным процентом) = {sum_itog}")
