
raw_temper = input("Введите температуру в градусах Цельсия: ")
temper = float(raw_temper)

kelvin = temper + 273.15
farengate = (temper * 9/5) + 32

print(f"Результат обработки: F = {farengate:.2f}, K = {kelvin:.2f}")

