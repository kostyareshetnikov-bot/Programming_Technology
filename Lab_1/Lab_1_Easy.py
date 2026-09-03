num1 = int(input('Введите первое число: '))  
num2 = int(input('Введите второе число: '))  
oper = input('Выберите операцию (Введите +, -, *, /): ')  

if oper == '+':  
    print(f'Результат: {num1 + num2}')  
elif oper == '-':  
    print(f'Результат: {num1 - num2}')  
elif oper == '*':  
    print(f'Результат: {num1 * num2}')  
elif oper == '/':  
    if num2 != 0:  
        print(f'Результат: {num1 / num2}')  
    else:  
        print('Ошибка: деление на ноль!')  
else:  
    print('Некорректная операция!')
