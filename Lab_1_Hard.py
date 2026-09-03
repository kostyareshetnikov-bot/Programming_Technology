n1 = int(input("Введите целое число: "))
n2_str = ""

while n1 > 0:
    digit = n1 % 10
    n2_str += str(digit)
    n1 //= 10

print('Обратное ему число:', n2_str)